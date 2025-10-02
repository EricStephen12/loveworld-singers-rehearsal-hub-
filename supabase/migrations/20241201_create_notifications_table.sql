-- Create notifications table for real-time notifications system
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    category TEXT CHECK (category IN ('rehearsal', 'announcement', 'reminder', 'system', 'admin')) DEFAULT 'system',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_audience TEXT CHECK (target_audience IN ('all', 'group', 'individual')) DEFAULT 'all',
    target_group TEXT, -- For group-specific notifications
    target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- For individual notifications
    action_url TEXT, -- Optional URL to navigate to when tapped
    expires_at TIMESTAMPTZ, -- Optional expiration time
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_notifications table for tracking read status
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications table
-- Everyone can read notifications
CREATE POLICY "Everyone can read notifications" ON notifications
    FOR SELECT USING (true);

-- Only admins can insert notifications
CREATE POLICY "Admins can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update notifications
CREATE POLICY "Admins can update notifications" ON notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete notifications
CREATE POLICY "Admins can delete notifications" ON notifications
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for user_notifications table
-- Users can read their own notification status
CREATE POLICY "Users can read their notification status" ON user_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notification status
CREATE POLICY "Users can insert their notification status" ON user_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notification status
CREATE POLICY "Users can update their notification status" ON user_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_uuid UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO user_notifications (notification_id, user_id, read_at)
    VALUES (notification_uuid, auth.uid(), NOW())
    ON CONFLICT (notification_id, user_id)
    DO UPDATE SET read_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for all users
CREATE OR REPLACE FUNCTION create_notification_for_all_users(
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_category TEXT DEFAULT 'system',
    p_priority TEXT DEFAULT 'medium',
    p_action_url TEXT DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Insert notification
    INSERT INTO notifications (title, message, type, category, priority, sender_id, target_audience, action_url, expires_at)
    VALUES (p_title, p_message, p_type, p_category, p_priority, auth.uid(), 'all', p_action_url, p_expires_at)
    RETURNING id INTO notification_id;

    -- Create notification records for all users
    INSERT INTO user_notifications (notification_id, user_id)
    SELECT notification_id, id FROM profiles WHERE id != auth.uid();

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for specific group
CREATE OR REPLACE FUNCTION create_notification_for_group(
    p_title TEXT,
    p_message TEXT,
    p_group_name TEXT,
    p_type TEXT DEFAULT 'info',
    p_category TEXT DEFAULT 'system',
    p_priority TEXT DEFAULT 'medium',
    p_action_url TEXT DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Insert notification
    INSERT INTO notifications (title, message, type, category, priority, sender_id, target_audience, target_group, action_url, expires_at)
    VALUES (p_title, p_message, p_type, p_category, p_priority, auth.uid(), 'group', p_group_name, p_action_url, p_expires_at)
    RETURNING id INTO notification_id;

    -- Create notification records for users in the group
    INSERT INTO user_notifications (notification_id, user_id)
    SELECT notification_id, p.user_id
    FROM user_groups ug
    JOIN profiles p ON ug.user_id = p.id
    WHERE ug.group_name = p_group_name AND p.id != auth.uid();

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notifications with read status
CREATE OR REPLACE FUNCTION get_user_notifications(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    id UUID,
    title TEXT,
    message TEXT,
    type TEXT,
    category TEXT,
    priority TEXT,
    sender_id UUID,
    action_url TEXT,
    created_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    is_read BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.id,
        n.title,
        n.message,
        n.type,
        n.category,
        n.priority,
        n.sender_id,
        n.action_url,
        n.created_at,
        un.read_at,
        (un.read_at IS NOT NULL) as is_read
    FROM notifications n
    LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = p_user_id
    WHERE n.expires_at IS NULL OR n.expires_at > NOW()
    ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

