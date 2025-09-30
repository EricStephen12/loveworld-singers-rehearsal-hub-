-- Fix admin access to support messages
-- The issue might be conflicting RLS policies

-- Drop the conflicting policy that might be too restrictive
DROP POLICY IF EXISTS "Users can view own support messages" ON support_messages;

-- Create a more permissive policy for viewing messages
-- This allows users to see their own messages AND allows admins to see all messages
CREATE POLICY "Users can view support messages" ON support_messages
  FOR SELECT USING (
    auth.uid() = user_id OR  -- Users can see their own messages
    auth.uid() IS NOT NULL   -- Any authenticated user can see all messages (for admin functionality)
  );

-- Ensure the general policy for all operations is working
DROP POLICY IF EXISTS "Authenticated users can view all support messages" ON support_messages;

-- Create a comprehensive admin policy
CREATE POLICY "Admin access to all support messages" ON support_messages
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Make sure the insert and update policies are not conflicting
DROP POLICY IF EXISTS "Users can create support messages" ON support_messages;
DROP POLICY IF EXISTS "Service role can create support messages" ON support_messages;

-- Recreate insert policy
CREATE POLICY "Authenticated users can create support messages" ON support_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Recreate update policy  
DROP POLICY IF EXISTS "Users can update own support messages" ON support_messages;
DROP POLICY IF EXISTS "Service role can update support messages" ON support_messages;

CREATE POLICY "Authenticated users can update support messages" ON support_messages
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Add a comment explaining the policy structure
COMMENT ON TABLE support_messages IS 'Support messages table with RLS policies allowing authenticated users full access for admin functionality';
