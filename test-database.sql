-- Test Database Connection and Setup
-- Run this to verify everything is working

-- Test 1: Check if user_profiles table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Test 2: Check for any triggers on auth.users
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Test 3: Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test 4: Try a simple insert (this will fail but show us the exact error)
-- Don't run this part, just for reference:
-- INSERT INTO user_profiles (id, email, full_name) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'test@test.com', 'Test User');