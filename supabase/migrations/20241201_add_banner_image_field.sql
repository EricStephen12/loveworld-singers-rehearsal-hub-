-- Add bannerImage field to pages table
-- This migration adds the bannerImage column to store uploaded banner images

-- Add bannerImage column to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS bannerImage TEXT;

-- Add comment to document the field
COMMENT ON COLUMN pages.bannerImage IS 'URL of the banner image uploaded for this page';

-- Create index for better performance when filtering by banner images
CREATE INDEX IF NOT EXISTS idx_pages_banner_image ON pages(bannerImage) WHERE bannerImage IS NOT NULL;

-- Update the updated_at timestamp for existing pages (optional)
UPDATE pages SET updated_at = NOW() WHERE bannerImage IS NULL;
