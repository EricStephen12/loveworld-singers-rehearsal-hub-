-- Fix Row Level Security policies for song_history table
-- This script will update the RLS policies to be more permissive

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read song history" ON song_history;
DROP POLICY IF EXISTS "Allow authenticated users to insert song history" ON song_history;
DROP POLICY IF EXISTS "Allow authenticated users to update song history" ON song_history;
DROP POLICY IF EXISTS "Allow authenticated users to delete song history" ON song_history;

-- Create more permissive RLS policies
-- Allow all authenticated users to read all history entries
CREATE POLICY "Allow authenticated users to read song history" ON song_history
  FOR SELECT USING (true);

-- Allow all authenticated users to insert history entries
CREATE POLICY "Allow authenticated users to insert song history" ON song_history
  FOR INSERT WITH CHECK (true);

-- Allow all authenticated users to update history entries
CREATE POLICY "Allow authenticated users to update song history" ON song_history
  FOR UPDATE USING (true);

-- Allow all authenticated users to delete history entries
CREATE POLICY "Allow authenticated users to delete song history" ON song_history
  FOR DELETE USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'song_history';
