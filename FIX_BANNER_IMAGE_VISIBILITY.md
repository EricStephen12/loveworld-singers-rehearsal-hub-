# 🖼️ Fix Banner Image Visibility Issue

## 🔴 Problem
When admin uploads a banner image:
- ✅ Admin who uploaded can see the image
- ❌ Other users cannot see the image

## 🎯 Root Cause
**Supabase Storage permissions are not set to PUBLIC READ**

The `media-files` bucket needs to allow:
1. **Public READ** - Everyone can view/download images
2. **Authenticated WRITE** - Only authenticated users can upload

## ✅ Solution - Run SQL Script

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Login to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 3: Run the Fix Script
1. Copy the entire contents of `fix-storage-permissions.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)

### Step 4: Verify the Fix
After running the script, you should see:

```
✅ Bucket: media-files (public: true)
✅ Policy: Public read access for media files
✅ Policy: Authenticated upload for media files
✅ Policy: Authenticated update for media files
✅ Policy: Authenticated delete for media files
```

## 🧪 Test the Fix

### Test 1: Upload New Banner Image
1. Login as admin
2. Go to Admin Panel
3. Upload a new banner image to a page
4. **Logout**
5. Login as a different user (or open incognito)
6. Navigate to that page
7. ✅ You should see the banner image!

### Test 2: Check Existing Images
1. Open any page with a banner image
2. Right-click the image → "Open in new tab"
3. You should see the image URL like:
   ```
   https://your-project.supabase.co/storage/v1/object/public/media-files/banner-images/...
   ```
4. ✅ The image should load without requiring authentication

## 🔍 Alternative Fix (If SQL Doesn't Work)

### Option A: Fix via Supabase Dashboard

1. Go to **Storage** in Supabase Dashboard
2. Click on `media-files` bucket
3. Click **Policies** tab
4. Click **New Policy**
5. Create these policies:

**Policy 1: Public Read**
- Policy Name: `Public read access`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'media-files'`

**Policy 2: Authenticated Upload**
- Policy Name: `Authenticated upload`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'media-files'`

### Option B: Make Bucket Public

1. Go to **Storage** → `media-files` bucket
2. Click **Settings** (gear icon)
3. Toggle **Public bucket** to ON
4. Click **Save**

## 🚨 Important Notes

### Security Considerations
- ✅ **Public READ is safe** - Anyone can view images (this is what you want)
- ✅ **Authenticated WRITE is safe** - Only logged-in users can upload
- ⚠️ **Consider adding file size limits** - Prevent abuse

### Performance
- ✅ Public images load faster (no auth check)
- ✅ CDN caching works better with public images
- ✅ Better for SEO and social media sharing

### Existing Images
- ✅ All existing images will become visible immediately
- ✅ No need to re-upload images
- ✅ URLs remain the same

## 📊 How to Check Current Permissions

Run this query in SQL Editor:

```sql
-- Check bucket settings
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'media-files';

-- Check policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

**Expected Result:**
```
Bucket: media-files
Public: true
Policies:
  - Public read access (SELECT)
  - Authenticated upload (INSERT)
  - Authenticated update (UPDATE)
  - Authenticated delete (DELETE)
```

## ✅ Success Checklist

After applying the fix, verify:

- [ ] SQL script ran without errors
- [ ] Bucket `media-files` shows `public: true`
- [ ] 4 policies are created (read, upload, update, delete)
- [ ] Admin can upload banner images
- [ ] Other users can see uploaded banner images
- [ ] Images load in incognito mode (no login required)
- [ ] Image URLs work when shared

## 🆘 Troubleshooting

### Issue: "Permission denied" when running SQL
**Solution:** Make sure you're logged in as the project owner

### Issue: Images still not visible
**Solution:** 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check if bucket is truly public: `SELECT public FROM storage.buckets WHERE id = 'media-files'`

### Issue: Upload fails after applying fix
**Solution:** 
1. Check if user is authenticated
2. Verify `authenticated` role has INSERT permission
3. Check file size limits

## 📞 Need Help?

If the issue persists:
1. Check Supabase logs: **Logs** → **Storage**
2. Check browser console for errors
3. Verify the image URL format
4. Contact Supabase support if needed

---

**After running the fix, ALL users will be able to see banner images uploaded by admins!** 🎉

