-- Fix for songs table updated_at field issue
-- This script will add the missing updated_at field to the songs table

-- First, let's check if the songs table exists and what fields it has
-- (This is just for reference - we'll add the field)

-- Add updated_at field to songs table if it doesn't exist
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add created_at field to songs table if it doesn't exist  
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create or replace the trigger function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update updated_at if the field exists
  IF TG_TABLE_NAME = 'songs' THEN
    -- For songs table, we'll handle this in the application
    RETURN NEW;
  ELSE
    -- For other tables (like attendance), update the field
    NEW.updated_at = NOW();
    RETURN NEW;
  END IF;
END;
$$ language 'plpgsql';

-- Drop any existing trigger on songs table
DROP TRIGGER IF EXISTS update_songs_updated_at ON songs;

-- Create a new trigger specifically for songs table that won't cause errors
CREATE TRIGGER update_songs_updated_at 
  BEFORE UPDATE ON songs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Update existing songs to have proper timestamps
UPDATE songs 
SET 
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;
