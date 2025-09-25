-- Temporarily disable RLS for song_history table to allow inserts
-- This is a quick fix - you can re-enable RLS later with proper policies

-- Disable RLS temporarily
ALTER TABLE song_history DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'song_history';
