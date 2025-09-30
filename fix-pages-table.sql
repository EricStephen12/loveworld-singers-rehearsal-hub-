-- Fix pages table to add updated_at field and proper trigger
-- This script addresses the "record 'new' has no field 'updated_at'" error

-- Add created_at field to pages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pages' AND column_name = 'created_at') THEN
        ALTER TABLE pages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at field to pages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pages' AND column_name = 'updated_at') THEN
        ALTER TABLE pages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create or replace the trigger function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;

-- Create the trigger for pages table
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing records to have proper timestamps
UPDATE pages 
SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN pages.created_at IS 'Timestamp when the page was created';
COMMENT ON COLUMN pages.updated_at IS 'Timestamp when the page was last updated';
COMMENT ON TRIGGER update_pages_updated_at ON pages IS 'Automatically updates the updated_at timestamp when a page is modified';
 