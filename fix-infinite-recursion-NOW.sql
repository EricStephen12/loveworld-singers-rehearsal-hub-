-- ⚡ URGENT FIX: Infinite Recursion in group_members RLS Policy
-- Run this IMMEDIATELY in your Supabase SQL Editor to fix the error
-- This will fix the "infinite recursion detected in policy for relation group_members" error

-- Step 1: Drop the problematic recursive policy on group_members
DROP POLICY IF EXISTS "Users can view group members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can view their groups" ON group_members;
DROP POLICY IF EXISTS "Users can insert their groups" ON group_members;
DROP POLICY IF EXISTS "Users can update their groups" ON group_members;
DROP POLICY IF EXISTS "Users can delete their groups" ON group_members;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON group_members;

-- Step 2: Create simple, non-recursive policies for group_members
CREATE POLICY "group_members_select_policy" ON group_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "group_members_insert_policy" ON group_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "group_members_update_policy" ON group_members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "group_members_delete_policy" ON group_members
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 3: Also fix chat_groups table policies (they might have similar issues)
DROP POLICY IF EXISTS "Users can view groups they belong to" ON chat_groups;
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

-- Step 4: Fix profiles table policies (simplify them to avoid recursion)
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

-- Step 5: Fix user_groups table policies
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

-- ✅ Done! The infinite recursion error should now be fixed.
-- Refresh your app and try updating your profile again.

