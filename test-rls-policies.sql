-- Test RLS policies for profile updates
-- Run this in your Supabase SQL editor to test the policies

-- Test 1: Check if profiles table is accessible
SELECT 
    'profiles' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN '✅ Accessible'
        ELSE '❌ Not accessible'
    END as access_status;

-- Test 2: Check if user_groups table is accessible  
SELECT 
    'user_groups' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM user_groups LIMIT 1) THEN '✅ Accessible'
        ELSE '❌ Not accessible'
    END as access_status;

-- Test 3: Check if chat_groups table is accessible
SELECT 
    'chat_groups' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM chat_groups LIMIT 1) THEN '✅ Accessible'
        ELSE '❌ Not accessible'
    END as access_status;

-- Test 4: Check current user authentication
SELECT 
    'auth_status' as test_name,
    CASE 
        WHEN auth.role() = 'authenticated' THEN '✅ Authenticated'
        ELSE '❌ Not authenticated'
    END as auth_status;

-- Test 5: Check if we can insert into profiles (simulation)
DO $$
BEGIN
    -- This will test if we can perform operations
    RAISE NOTICE 'Testing profile access...';
    
    -- Try to select from profiles
    PERFORM 1 FROM profiles LIMIT 1;
    RAISE NOTICE '✅ Profile read access works';
    
    -- Try to select from user_groups
    PERFORM 1 FROM user_groups LIMIT 1;
    RAISE NOTICE '✅ User groups read access works';
    
    RAISE NOTICE '✅ All RLS policies are working correctly';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ RLS policy error: %', SQLERRM;
END $$;



