-- Add role column to profiles table for admin permissions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Update existing profiles to have user role by default
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update the get_user_notifications function to work with the correct schema
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

