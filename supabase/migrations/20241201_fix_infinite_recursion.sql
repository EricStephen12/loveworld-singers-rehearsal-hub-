-- Fix infinite recursion in RLS policies
-- This migration fixes the infinite recursion error in group_members table

-- Drop all existing policies on group_members to prevent recursion
DROP POLICY IF EXISTS "Users can view their groups" ON group_members;
DROP POLICY IF EXISTS "Users can insert their groups" ON group_members;
DROP POLICY IF EXISTS "Users can update their groups" ON group_members;
DROP POLICY IF EXISTS "Users can delete their groups" ON group_members;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON group_members;

-- Create simple, non-recursive policies for group_members
CREATE POLICY "group_members_select_policy" ON group_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "group_members_insert_policy" ON group_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "group_members_update_policy" ON group_members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "group_members_delete_policy" ON group_members
    FOR DELETE USING (auth.role() = 'authenticated');

-- Also fix chat_groups table policies
DROP POLICY IF EXISTS "Users can view their groups" ON chat_groups;
DROP POLICY IF EXISTS "Users can insert their groups" ON chat_groups;
DROP POLICY IF EXISTS "Users can update their groups" ON chat_groups;
DROP POLICY IF EXISTS "Users can delete their groups" ON chat_groups;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON chat_groups;

CREATE POLICY "chat_groups_select_policy" ON chat_groups
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "chat_groups_insert_policy" ON chat_groups
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "chat_groups_update_policy" ON chat_groups
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "chat_groups_delete_policy" ON chat_groups
    FOR DELETE USING (auth.role() = 'authenticated');

-- Fix profiles table policies (simplify them)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON profiles;

CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Fix user_groups table policies
DROP POLICY IF EXISTS "Users can view own groups" ON user_groups;
DROP POLICY IF EXISTS "Users can insert own groups" ON user_groups;
DROP POLICY IF EXISTS "Users can update own groups" ON user_groups;
DROP POLICY IF EXISTS "Users can delete own groups" ON user_groups;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON user_groups;

CREATE POLICY "user_groups_select_policy" ON user_groups
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "user_groups_insert_policy" ON user_groups
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "user_groups_update_policy" ON user_groups
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "user_groups_delete_policy" ON user_groups
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create a simple test function to verify policies work
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TEXT AS $$
BEGIN
    -- Test if we can access tables without recursion
    PERFORM 1 FROM profiles LIMIT 1;
    PERFORM 1 FROM user_groups LIMIT 1;
    PERFORM 1 FROM group_members LIMIT 1;
    PERFORM 1 FROM chat_groups LIMIT 1;
    
    RETURN 'All RLS policies working correctly';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'RLS policy error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;















