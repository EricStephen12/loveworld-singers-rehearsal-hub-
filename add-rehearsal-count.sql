-- Add rehearsal count field to songs table
-- This allows manual tracking of rehearsal count per song

ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS rehearsalcount INTEGER DEFAULT 1;

-- Add comment to document the field
COMMENT ON COLUMN songs.rehearsalcount IS 'Manual rehearsal count set by users';