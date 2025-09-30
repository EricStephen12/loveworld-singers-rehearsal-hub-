-- Create a function to get all profiles for admin use
-- This function bypasses RLS policies for admin access

-- Create the function
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  gender TEXT,
  birthday DATE,
  region TEXT,
  zone TEXT,
  church TEXT,
  designation TEXT,
  administration TEXT,
  social_provider TEXT,
  social_id TEXT,
  profile_completed BOOLEAN,
  email_verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  profile_image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function runs with the privileges of the function owner
  -- and can bypass RLS policies
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.phone_number,
    p.gender,
    p.birthday,
    p.region,
    p.zone,
    p.church,
    p.designation,
    p.administration,
    p.social_provider,
    p.social_id,
    p.profile_completed,
    p.email_verified,
    p.created_at,
    p.updated_at,
    p.profile_image_url
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_profiles() TO authenticated;

-- Also create a function to get user count
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM public.profiles);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_count() TO authenticated;

-- Create a function to get all auth users (if admin access is available)
CREATE OR REPLACE FUNCTION get_all_auth_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  user_metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function tries to access auth.users table
  -- Note: This might not work depending on Supabase configuration
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.updated_at,
    au.email_confirmed_at,
    au.raw_user_meta_data as user_metadata
  FROM auth.users au
  ORDER BY au.created_at DESC;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- If we don't have access to auth.users, return empty result
    RETURN;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_all_auth_users() TO authenticated;
