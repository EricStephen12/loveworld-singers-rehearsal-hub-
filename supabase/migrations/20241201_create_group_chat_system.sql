-- Group Chat System Database Schema
-- This creates a WhatsApp-like chat system with automatic groups and individual messaging

-- Create chat_groups table for automatic groups
CREATE TABLE IF NOT EXISTS public.chat_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL CHECK (group_type IN ('pmc', 'loveworld_singers', 'region', 'zone', 'church', 'designation', 'administration')),
  group_value TEXT NOT NULL, -- The actual value (e.g., 'Lagos' for region, 'Soprano' for designation)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table to track who's in which group
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- Ensure unique membership
  UNIQUE(group_id, user_id)
);

-- Create group_messages table for group chats
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'voice', 'file')) DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Message status
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create individual conversations table (for friend-to-friend chats)
CREATE TABLE IF NOT EXISTS public.individual_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique conversation between two users
  UNIQUE(user1_id, user2_id),
  -- Ensure user1_id is always smaller than user2_id for consistency
  CHECK (user1_id < user2_id)
);

-- Create individual_messages table for friend-to-friend chats
CREATE TABLE IF NOT EXISTS public.individual_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.individual_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'voice', 'file')) DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Message status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create friends table for friend relationships
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique friendship
  UNIQUE(user_id, friend_id),
  -- Users can't be friends with themselves
  CHECK (user_id != friend_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id ON group_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_individual_conversations_user1_id ON individual_conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_individual_conversations_user2_id ON individual_conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_individual_messages_conversation_id ON individual_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_individual_messages_sender_id ON individual_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_individual_messages_created_at ON individual_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Enable Row Level Security
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_groups
CREATE POLICY "Users can view groups they belong to" ON chat_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = chat_groups.id 
      AND group_members.user_id = auth.uid()
    )
  );

-- RLS Policies for group_members
CREATE POLICY "Users can view group members of their groups" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
    )
  );

-- RLS Policies for group_messages
CREATE POLICY "Users can view messages from their groups" ON group_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = group_messages.group_id 
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their groups" ON group_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = group_messages.group_id 
      AND group_members.user_id = auth.uid()
    )
  );

-- RLS Policies for individual_conversations
CREATE POLICY "Users can view their own conversations" ON individual_conversations
  FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can create conversations" ON individual_conversations
  FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- RLS Policies for individual_messages
CREATE POLICY "Users can view messages in their conversations" ON individual_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM individual_conversations 
      WHERE individual_conversations.id = individual_messages.conversation_id 
      AND (individual_conversations.user1_id = auth.uid() OR individual_conversations.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON individual_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM individual_conversations 
      WHERE individual_conversations.id = individual_messages.conversation_id 
      AND (individual_conversations.user1_id = auth.uid() OR individual_conversations.user2_id = auth.uid())
    )
  );

-- RLS Policies for friends
CREATE POLICY "Users can view their own friends" ON friends
  FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can manage their own friendships" ON friends
  FOR ALL USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Function to automatically create groups based on user profiles
CREATE OR REPLACE FUNCTION create_automatic_groups()
RETURNS TRIGGER AS $$
BEGIN
  -- Create PMC group if user has PMC designation
  IF NEW.designation = 'PMC' THEN
    INSERT INTO chat_groups (name, description, group_type, group_value)
    VALUES ('PMC Group', 'Pastor Chris Ministry Choir', 'pmc', 'PMC')
    ON CONFLICT DO NOTHING;
    
    -- Add user to PMC group
    INSERT INTO group_members (group_id, user_id)
    SELECT id, NEW.id FROM chat_groups 
    WHERE group_type = 'pmc' AND group_value = 'PMC'
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create LoveWorld Singers group if user has any singing designation
  IF NEW.designation IN ('Soprano', 'Alto', 'Tenor', 'Bass', 'Backup Singer') THEN
    INSERT INTO chat_groups (name, description, group_type, group_value)
    VALUES ('LoveWorld Singers', 'All LoveWorld Singers', 'loveworld_singers', 'LoveWorld Singers')
    ON CONFLICT DO NOTHING;
    
    -- Add user to LoveWorld Singers group
    INSERT INTO group_members (group_id, user_id)
    SELECT id, NEW.id FROM chat_groups 
    WHERE group_type = 'loveworld_singers' AND group_value = 'LoveWorld Singers'
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create region group
  IF NEW.region IS NOT NULL THEN
    INSERT INTO chat_groups (name, description, group_type, group_value)
    VALUES (NEW.region || ' Region', 'Singers from ' || NEW.region || ' region', 'region', NEW.region)
    ON CONFLICT DO NOTHING;
    
    -- Add user to region group
    INSERT INTO group_members (group_id, user_id)
    SELECT id, NEW.id FROM chat_groups 
    WHERE group_type = 'region' AND group_value = NEW.region
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create zone group
  IF NEW.zone IS NOT NULL THEN
    INSERT INTO chat_groups (name, description, group_type, group_value)
    VALUES (NEW.zone || ' Zone', 'Singers from ' || NEW.zone || ' zone', 'zone', NEW.zone)
    ON CONFLICT DO NOTHING;
    
    -- Add user to zone group
    INSERT INTO group_members (group_id, user_id)
    SELECT id, NEW.id FROM chat_groups 
    WHERE group_type = 'zone' AND group_value = NEW.zone
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create church group
  IF NEW.church IS NOT NULL THEN
    INSERT INTO chat_groups (name, description, group_type, group_value)
    VALUES (NEW.church || ' Church', 'Singers from ' || NEW.church || ' church', 'church', NEW.church)
    ON CONFLICT DO NOTHING;
    
    -- Add user to church group
    INSERT INTO group_members (group_id, user_id)
    SELECT id, NEW.id FROM chat_groups 
    WHERE group_type = 'church' AND group_value = NEW.church
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create designation group
  IF NEW.designation IS NOT NULL THEN
    INSERT INTO chat_groups (name, description, group_type, group_value)
    VALUES (NEW.designation || ' Group', 'All ' || NEW.designation || 's', 'designation', NEW.designation)
    ON CONFLICT DO NOTHING;
    
    -- Add user to designation group
    INSERT INTO group_members (group_id, user_id)
    SELECT id, NEW.id FROM chat_groups 
    WHERE group_type = 'designation' AND group_value = NEW.designation
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create administration group
  IF NEW.administration IS NOT NULL THEN
    INSERT INTO chat_groups (name, description, group_type, group_value)
    VALUES (NEW.administration || ' Group', 'All ' || NEW.administration || 's', 'administration', NEW.administration)
    ON CONFLICT DO NOTHING;
    
    -- Add user to administration group
    INSERT INTO group_members (group_id, user_id)
    SELECT id, NEW.id FROM chat_groups 
    WHERE group_type = 'administration' AND group_value = NEW.administration
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create groups when user profile is updated
CREATE TRIGGER trigger_create_automatic_groups
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_automatic_groups();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_chat_groups_updated_at 
  BEFORE UPDATE ON chat_groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_individual_conversations_updated_at 
  BEFORE UPDATE ON individual_conversations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friends_updated_at 
  BEFORE UPDATE ON friends 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
