-- Authentication and User Profile Schema for LoveWorld Singers Rehearsal Hub

-- Note: auth.users table is managed by Supabase and cannot be modified

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Personal Information
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  birthday DATE,
  
  -- Location Information
  region TEXT,
  zone TEXT,
  church TEXT,
  
  -- Ministry Information
  designation TEXT CHECK (designation IN ('Soprano', 'Alto', 'Tenor', 'Bass', 'Instrumentalist', 'Backup Singer')),
  administration TEXT CHECK (administration IN ('Coordinator', 'Assistant Coordinator', 'Secretary', 'Treasurer', 'Member')),
  
  -- Social Login Information
  social_provider TEXT CHECK (social_provider IN ('google', 'kingschat', 'email')),
  social_id TEXT,
  
  -- Profile Status
  profile_completed BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_groups table for ministry groups
CREATE TABLE IF NOT EXISTS public.user_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table for tracking rehearsal attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  status TEXT CHECK (status IN ('Present', 'Late', 'Absent')) DEFAULT 'Present',
  check_in_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  earned_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_social_id_idx ON public.profiles(social_id);
CREATE INDEX IF NOT EXISTS user_groups_user_id_idx ON public.user_groups(user_id);
CREATE INDEX IF NOT EXISTS attendance_user_id_idx ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON public.achievements(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_groups
CREATE POLICY "Users can view own groups" ON public.user_groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own groups" ON public.user_groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own groups" ON public.user_groups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own groups" ON public.user_groups
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for attendance
CREATE POLICY "Users can view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance" ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for achievements
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, social_provider, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    social_provider = EXCLUDED.social_provider,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create achievement templates table for default achievements
CREATE TABLE IF NOT EXISTS public.achievement_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default achievement templates
INSERT INTO public.achievement_templates (name, description) 
VALUES 
  ('Welcome to LWSRH', 'Successfully joined LoveWorld Singers Rehearsal Hub'),
  ('Profile Complete', 'Completed your profile information'),
  ('First Rehearsal', 'Attended your first rehearsal'),
  ('Perfect Attendance', 'Attended all rehearsals in a month'),
  ('Early Bird', 'Arrived early to rehearsal 5 times'),
  ('Team Player', 'Actively participated in group activities')
ON CONFLICT DO NOTHING;