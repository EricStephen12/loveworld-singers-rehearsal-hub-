-- Create song_history table for tracking song changes
-- This table stores version history for different sections of songs

CREATE TABLE IF NOT EXISTS song_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'song-details', 'personnel', 'music-details', 'lyrics', 'solfas', 'audio', 'comments'
  old_value TEXT,
  new_value TEXT,
  created_by VARCHAR(100) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_song_history_song_id ON song_history(song_id);
CREATE INDEX IF NOT EXISTS idx_song_history_type ON song_history(type);
CREATE INDEX IF NOT EXISTS idx_song_history_created_at ON song_history(created_at);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_song_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_song_history_updated_at ON song_history;

-- Create the trigger
CREATE TRIGGER update_song_history_updated_at
  BEFORE UPDATE ON song_history
  FOR EACH ROW
  EXECUTE FUNCTION update_song_history_updated_at();

-- Add comments to explain the table structure
COMMENT ON TABLE song_history IS 'Stores version history for different sections of songs';
COMMENT ON COLUMN song_history.song_id IS 'Reference to the song this history entry belongs to';
COMMENT ON COLUMN song_history.title IS 'Title of the history entry (e.g., "Lyrics Version 1.2")';
COMMENT ON COLUMN song_history.description IS 'Description of what changed in this version';
COMMENT ON COLUMN song_history.type IS 'Type of section: song-details, personnel, music-details, lyrics, solfas, audio, comments';
COMMENT ON COLUMN song_history.old_value IS 'Previous value before the change';
COMMENT ON COLUMN song_history.new_value IS 'New value after the change';
COMMENT ON COLUMN song_history.created_by IS 'User who created this history entry';
COMMENT ON COLUMN song_history.created_at IS 'When this history entry was created';
COMMENT ON COLUMN song_history.updated_at IS 'When this history entry was last updated';

-- Enable Row Level Security (RLS)
ALTER TABLE song_history ENABLE ROW LEVEL SECURITY;

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
