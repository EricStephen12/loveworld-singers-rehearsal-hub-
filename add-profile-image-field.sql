-- Add profile image field to profiles table
-- Run this in your Supabase SQL Editor

-- Add profile_image_url field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.profiles.profile_image_url IS 'URL of the user profile image stored in Supabase Storage';

-- Update the updated_at trigger to include the new field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Create the trigger
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
