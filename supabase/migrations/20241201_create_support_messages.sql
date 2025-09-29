-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'technical', 'billing', 'feature', 'bug', 'other')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  admin_responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_status ON support_messages(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_priority ON support_messages(priority);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at);

-- Enable Row Level Security
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own messages
CREATE POLICY "Users can view own support messages" ON support_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can create support messages" ON support_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert messages (for API routes)
CREATE POLICY "Service role can create support messages" ON support_messages
  FOR INSERT WITH CHECK (true);

-- Users can update their own messages (for status changes, etc.)
CREATE POLICY "Users can update own support messages" ON support_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to update messages (for admin responses)
CREATE POLICY "Service role can update support messages" ON support_messages
  FOR UPDATE WITH CHECK (true);

-- Admins can see all messages (for now, allow all authenticated users to see all messages)
-- TODO: Add proper admin role check when role column is added to profiles table
CREATE POLICY "Authenticated users can view all support messages" ON support_messages
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_support_messages_updated_at
  BEFORE UPDATE ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_support_messages_updated_at();
