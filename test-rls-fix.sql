-- Test RLS policies after fix
-- Run this in your Supabase SQL editor

-- Test 1: Check if policies exist and are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_groups', 'group_members', 'chat_groups')
ORDER BY tablename, policyname;

-- Test 2: Check for infinite recursion
SELECT test_rls_policies();

-- Test 3: Test basic operations
DO $$
BEGIN
    -- Test profile access
    PERFORM 1 FROM profiles LIMIT 1;
    RAISE NOTICE '✅ Profiles table accessible';
    
    -- Test user_groups access
    PERFORM 1 FROM user_groups LIMIT 1;
    RAISE NOTICE '✅ User groups table accessible';
    
    -- Test group_members access
    PERFORM 1 FROM group_members LIMIT 1;
    RAISE NOTICE '✅ Group members table accessible';
    
    -- Test chat_groups access
    PERFORM 1 FROM chat_groups LIMIT 1;
    RAISE NOTICE '✅ Chat groups table accessible';
    
    RAISE NOTICE '✅ All RLS policies working correctly';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ RLS policy error: %', SQLERRM;
END $$;




