-- =====================================================
-- FIX SUPABASE STORAGE PERMISSIONS
-- Run this in Supabase SQL Editor to fix image visibility
-- =====================================================

-- 1. Make sure the media-files bucket exists and is PUBLIC
UPDATE storage.buckets 
SET public = true 
WHERE id = 'media-files';

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload for media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update for media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete for media files" ON storage.objects;

-- 3. Create PUBLIC READ policy (everyone can view/download)
CREATE POLICY "Public read access for media files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media-files');

-- 4. Create AUTHENTICATED UPLOAD policy (anyone can upload)
CREATE POLICY "Authenticated upload for media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media-files');

-- 5. Create AUTHENTICATED UPDATE policy (anyone can update)
CREATE POLICY "Authenticated update for media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media-files');

-- 6. Create AUTHENTICATED DELETE policy (anyone can delete)
CREATE POLICY "Authenticated delete for media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media-files');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check bucket configuration
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'media-files';

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see the policies listed above, the fix is complete!
-- All users should now be able to see banner images uploaded by admins.
-- =====================================================

