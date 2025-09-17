-- Enable real-time for all tables (with error handling)
-- Run this in your Supabase SQL editor

-- Enable real-time for songs table (skip if already exists)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE songs;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table songs already in publication supabase_realtime';
END $$;

-- Enable real-time for pages table
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pages;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table pages already in publication supabase_realtime';
END $$;

-- Enable real-time for comments table
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE comments;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table comments already in publication supabase_realtime';
END $$;

-- Enable real-time for song_history table
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE song_history;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table song_history already in publication supabase_realtime';
END $$;

-- Enable real-time for media table
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE media;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table media already in publication supabase_realtime';
END $$;

-- Verify which tables have real-time enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- If you want to see what's missing, you can also run:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_type = 'BASE TABLE'
-- AND table_name NOT IN (
--   SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'
-- );