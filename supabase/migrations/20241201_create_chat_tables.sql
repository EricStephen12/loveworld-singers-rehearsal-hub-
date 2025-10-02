-- Create chat groups table
CREATE TABLE IF NOT EXISTS chat_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name TEXT UNIQUE NOT NULL, -- Store the original group name
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'file')),
    reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat group members table
CREATE TABLE IF NOT EXISTS chat_group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT FALSE,
    UNIQUE(group_id, user_id)
);

-- Create message read status table
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_groups
CREATE POLICY "Users can view groups they are members of" ON chat_groups
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM chat_group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create groups" ON chat_groups
    FOR INSERT WITH CHECK (true);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages from groups they are members of" ON chat_messages
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM chat_group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to groups they are members of" ON chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        group_id IN (
            SELECT group_id FROM chat_group_members 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for chat_group_members
CREATE POLICY "Users can view group members of groups they belong to" ON chat_group_members
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM chat_group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join groups" ON chat_group_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for message_read_status
CREATE POLICY "Users can view read status of messages they can see" ON message_read_status
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM chat_messages 
            WHERE group_id IN (
                SELECT group_id FROM chat_group_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can mark messages as read" ON message_read_status
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_group_id ON chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_group_members_group_id ON chat_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_group_members_user_id ON chat_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON message_read_status(user_id);

-- Create function to automatically create chat groups for user groups
CREATE OR REPLACE FUNCTION create_chat_groups_for_user_groups()
RETURNS TRIGGER AS $$
DECLARE
    chat_group_id UUID;
BEGIN
    -- Check if chat group already exists for this group name
    SELECT id INTO chat_group_id 
    FROM chat_groups 
    WHERE group_name = NEW.group_name;
    
    -- If chat group doesn't exist, create it
    IF chat_group_id IS NULL THEN
        INSERT INTO chat_groups (group_name, name, description)
        VALUES (
            NEW.group_name,
            CASE 
                WHEN NEW.group_name = 'yourloveworldsingers' THEN 'Your LoveWorld Singers'
                WHEN NEW.group_name = 'pmc' THEN 'PMC'
                WHEN NEW.group_name = '24worship' THEN '24 Worship'
                WHEN NEW.group_name = 'lmaorchestra' THEN 'LMA/LOVEWORLD ORCHESTRA'
                WHEN NEW.group_name = 'nationalzonalchoir' THEN 'National Zonal Choir Representatives'
                WHEN NEW.group_name = 'internationalzonalchoir' THEN 'International Zonal Choir Representatives'
                ELSE NEW.group_name
            END,
            'Group chat for ' || NEW.group_name
        )
        RETURNING id INTO chat_group_id;
    END IF;
    
    -- Add user to the chat group
    INSERT INTO chat_group_members (group_id, user_id, is_admin)
    VALUES (chat_group_id, NEW.user_id, true)
    ON CONFLICT (group_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create chat groups when user joins a group
CREATE TRIGGER trigger_create_chat_groups_for_user_groups
    AFTER INSERT ON user_groups
    FOR EACH ROW
    EXECUTE FUNCTION create_chat_groups_for_user_groups();

-- Create function to add welcome message to new chat groups
CREATE OR REPLACE FUNCTION add_welcome_message_to_chat_group()
RETURNS TRIGGER AS $$
BEGIN
    -- Add welcome message when a new chat group is created
    -- We'll get the first admin member to send the welcome message
    INSERT INTO chat_messages (group_id, sender_id, content, message_type)
    SELECT 
        NEW.id,
        user_id,
        'Welcome to ' || NEW.name || '! 🎵 Let''s start praising and worshiping together!',
        'text'
    FROM chat_group_members 
    WHERE group_id = NEW.id AND is_admin = true 
    LIMIT 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add welcome message to new chat groups
CREATE TRIGGER trigger_add_welcome_message_to_chat_group
    AFTER INSERT ON chat_groups
    FOR EACH ROW
    EXECUTE FUNCTION add_welcome_message_to_chat_group();


