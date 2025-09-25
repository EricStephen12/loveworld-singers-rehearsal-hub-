-- Check what users exist in your database
-- Run these queries in your Supabase SQL Editor to debug

-- 1. Check how many profiles exist
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 2. Check all profiles (if RLS allows)
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  profile_completed,
  created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- 3. Check if there are any RLS policies blocking access
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Check if RLS is enabled on profiles table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. Check user_groups table
SELECT COUNT(*) as total_user_groups FROM public.user_groups;

-- 6. Check if there are users in auth.users (this might not work without admin access)
-- SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 7. Check the structure of profiles table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
