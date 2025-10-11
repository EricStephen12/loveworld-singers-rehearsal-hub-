# Supabase Storage Setup Guide for Media Library

## Quick Setup (5 Minutes)

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Click on **Storage** in the left sidebar
3. Click **"New bucket"** button
4. Enter bucket details:
   - **Name**: `media-files`
   - **Public bucket**: ✅ **Check this box** (important!)
   - **File size limit**: 50MB (or your preference)
   - **Allowed MIME types**: Leave empty for all types
5. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

1. In the Storage section, click on your `media-files` bucket
2. Click on **"Policies"** tab
3. Click **"New policy"**

#### Policy 1: Public Read Access
```sql
-- Name: Public Read Access
-- Operation: SELECT
-- Policy definition:

CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-files');
```

#### Policy 2: Authenticated Upload
```sql
-- Name: Authenticated Upload
-- Operation: INSERT
-- Policy definition:

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media-files');
```

#### Policy 3: Authenticated Delete
```sql
-- Name: Authenticated Delete
-- Operation: DELETE
-- Policy definition:

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media-files');
```

#### Policy 4: Authenticated Update
```sql
-- Name: Authenticated Update
-- Operation: UPDATE
-- Policy definition:

CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media-files');
```

### Step 3: Configure CORS (Optional but Recommended)

1. Go to **Storage** → **Settings**
2. Find **CORS Configuration**
3. Add the following configuration:

```json
{
  "allowedOrigins": ["*"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
  "allowedHeaders": ["*"],
  "exposedHeaders": ["ETag"],
  "maxAge": 3600
}
```

**For Production**, replace `"*"` with your actual domain:
```json
{
  "allowedOrigins": ["https://yourdomain.com", "https://www.yourdomain.com"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
  "allowedHeaders": ["authorization", "x-client-info", "apikey", "content-type"],
  "exposedHeaders": ["ETag"],
  "maxAge": 3600
}
```

### Step 4: Verify Media Table Exists

1. Go to **Table Editor** in Supabase Dashboard
2. Check if `media` table exists
3. If not, run this SQL:

```sql
-- Create media table
CREATE TABLE IF NOT EXISTS public.media (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'audio', 'video', 'document')),
  size BIGINT NOT NULL,
  folder TEXT,
  storagepath TEXT,
  uploadedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_uploadedat ON public.media(uploadedat DESC);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);
CREATE INDEX IF NOT EXISTS idx_media_folder ON public.media(folder);

-- Add RLS policies
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all media
CREATE POLICY "Authenticated users can read media"
ON public.media FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert media
CREATE POLICY "Authenticated users can insert media"
ON public.media FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update media
CREATE POLICY "Authenticated users can update media"
ON public.media FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete media
CREATE POLICY "Authenticated users can delete media"
ON public.media FOR DELETE
TO authenticated
USING (true);
```

### Step 5: Test the Setup

1. Go to your app's Admin Panel → Media section
2. Click the **"Diagnose"** button
3. Check the browser console (F12)
4. All tests should pass ✅

**Expected Results:**
```
✅ Supabase Connection
✅ Media Table Access
✅ Storage Bucket Access
✅ Storage Public URL
✅ Audio Playback Support
✅ CORS Configuration
✅ Upload Permissions
```

## Troubleshooting

### Issue: "Bucket not found"
**Solution:**
- Make sure bucket name is exactly `media-files`
- Check bucket is created in the correct Supabase project
- Verify environment variables point to correct project

### Issue: "Permission denied"
**Solution:**
- Check storage policies are created correctly
- Verify user is authenticated
- Check RLS is enabled on media table
- Verify policies allow authenticated users

### Issue: "CORS error"
**Solution:**
- Add CORS configuration in Storage settings
- For development, use `"*"` for allowedOrigins
- For production, add your specific domain
- Clear browser cache and try again

### Issue: "Upload fails silently"
**Solution:**
- Check file size is within bucket limits
- Verify file type is allowed
- Check browser console for errors
- Run diagnostics to identify specific issue

### Issue: "Audio won't play"
**Solution:**
- Verify bucket is public
- Check CORS is configured
- Try different audio format (MP3 recommended)
- Check browser supports audio format
- Verify file URL is accessible

## Security Best Practices

### 1. File Size Limits
Set appropriate file size limits in bucket settings:
- Images: 5-10 MB
- Audio: 20-50 MB
- Video: 100-500 MB

### 2. File Type Restrictions
Restrict allowed MIME types in bucket settings:
```
image/jpeg, image/png, image/gif, image/webp
audio/mpeg, audio/wav, audio/ogg
video/mp4, video/webm
application/pdf
```

### 3. Rate Limiting
Enable rate limiting in Supabase settings to prevent abuse.

### 4. Authentication
Always require authentication for uploads:
```sql
-- Only authenticated users can upload
CREATE POLICY "Authenticated Upload Only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media-files');
```

### 5. Virus Scanning
Consider integrating virus scanning for uploaded files:
- Use Supabase Edge Functions
- Integrate with ClamAV or similar
- Scan files before making them public

## Performance Optimization

### 1. Enable CDN
Supabase Storage uses CDN by default, but you can optimize:
- Use Cloudflare or similar CDN
- Enable caching headers
- Use image optimization services

### 2. Compression
Compress files before upload:
```typescript
// Example: Compress images before upload
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  return await imageCompression(file, options);
};
```

### 3. Lazy Loading
Load media files on demand:
```typescript
// Load files in batches
const loadMediaBatch = async (offset: number, limit: number) => {
  const { data } = await supabase
    .from('media')
    .select('*')
    .range(offset, offset + limit - 1)
    .order('uploadedat', { ascending: false });
  return data;
};
```

### 4. Caching
Implement aggressive caching:
```typescript
// Cache media list in localStorage
const cacheMedia = (media: MediaFile[]) => {
  localStorage.setItem('media_cache', JSON.stringify(media));
  localStorage.setItem('media_cache_timestamp', Date.now().toString());
};
```

## Monitoring

### 1. Storage Usage
Monitor storage usage in Supabase Dashboard:
- Go to Settings → Usage
- Check storage size
- Set up alerts for limits

### 2. Bandwidth
Monitor bandwidth usage:
- Check monthly bandwidth
- Optimize large files
- Use CDN to reduce costs

### 3. Error Tracking
Implement error tracking:
```typescript
// Log errors to monitoring service
const logError = (error: Error, context: any) => {
  console.error('Media error:', error, context);
  // Send to Sentry, LogRocket, etc.
};
```

## Migration from Cloudinary

If you're migrating from Cloudinary:

1. Export all files from Cloudinary
2. Upload to Supabase Storage
3. Update database URLs
4. Test thoroughly
5. Delete from Cloudinary

```typescript
// Migration script example
const migrateFromCloudinary = async () => {
  const cloudinaryFiles = await getCloudinaryFiles();
  
  for (const file of cloudinaryFiles) {
    // Download from Cloudinary
    const blob = await fetch(file.url).then(r => r.blob());
    
    // Upload to Supabase
    const { data } = await supabase.storage
      .from('media-files')
      .upload(file.path, blob);
    
    // Update database
    await supabase
      .from('media')
      .update({ url: data.publicUrl })
      .eq('id', file.id);
  }
};
```

## Support

If you encounter issues:
1. Run diagnostics in the app
2. Check Supabase Dashboard logs
3. Review this guide
4. Check Supabase documentation
5. Contact support

## Useful Links

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
- [CORS Configuration](https://supabase.com/docs/guides/storage/cors)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)

