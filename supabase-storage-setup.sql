-- First, create storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files', 
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Create new permissive policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media-files');
CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media-files');
CREATE POLICY "Anyone can update" ON storage.objects FOR UPDATE USING (bucket_id = 'media-files');
CREATE POLICY "Anyone can delete" ON storage.objects FOR DELETE USING (bucket_id = 'media-files');

-- Add storagePath column to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS storagepath TEXT;

-- Update existing records to have a default storage path
UPDATE media SET storagepath = 'legacy/' || name WHERE storagepath IS NULL;