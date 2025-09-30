-- Add missing comments column to songs table
-- This script will add the comments column that the application expects

-- Add comments column to songs table if it doesn't exist
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS comments TEXT DEFAULT '';

-- Update existing songs to have empty comments if they don't have any
UPDATE songs 
SET comments = COALESCE(comments, '')
WHERE comments IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN songs.comments IS 'Comments or remarks for the song';
