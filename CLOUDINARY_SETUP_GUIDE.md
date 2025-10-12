# 🔧 CLOUDINARY SETUP GUIDE

## ✅ Step 1: Create Upload Preset (REQUIRED!)

### Go to Cloudinary Dashboard:
1. **Login:** https://cloudinary.com/console
2. **Click Settings** (gear icon in top right)
3. **Click "Upload" tab**

### Create Upload Preset:
1. **Scroll down** to "Upload presets" section
2. **Click "Add upload preset"** button
3. **Fill in:**
   - **Upload preset name:** `loveworld-singers`
   - **Signing Mode:** Select **"Unsigned"** ⚠️ IMPORTANT!
   - **Folder:** `loveworld-singers` (optional but recommended)
   - **Use filename:** Yes (optional)
   - **Unique filename:** Yes (optional)

4. **Click "Save"**

---

## ✅ Step 2: Verify Environment Variables

Your `.env.local` should have:

```env
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dvtjjt3js
NEXT_PUBLIC_CLOUDINARY_API_KEY=696485534226686
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=loveworld-singers
CLOUDINARY_API_SECRET=rBWR9HSNegYoEQ5lLzrMqGOv0zk
```

✅ **I already added these for you!**

---

## ✅ Step 3: Restart Dev Server

**IMPORTANT:** After changing `.env.local`, you MUST restart the dev server!

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🎯 Step 4: Test Upload

1. **Go to:** http://localhost:3000/admin
2. **Click:** Media Library
3. **Upload:** Any image or audio file
4. **Expected:** File uploads successfully!

---

## 🔍 Troubleshooting:

### Error: "Failed to upload to storage"

**Cause:** Upload preset not created or wrong name

**Fix:**
1. Go to Cloudinary → Settings → Upload
2. Check upload preset name is exactly: `loveworld-singers`
3. Check signing mode is: **Unsigned**
4. Save and restart dev server

---

### Error: "Upload preset not found"

**Cause:** Preset name mismatch

**Fix:**
1. Check preset name in Cloudinary dashboard
2. Update `.env.local` if different:
   ```env
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset-name
   ```
3. Restart dev server

---

### Error: "Invalid API key"

**Cause:** Wrong API key or not public

**Fix:**
1. Go to Cloudinary → Dashboard
2. Copy **Cloud name**, **API Key**, **API Secret**
3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart dev server

---

## 📊 How to Find Your Cloudinary Credentials:

### 1. Cloud Name:
- **Dashboard** → Top of page
- Example: `dvtjjt3js`

### 2. API Key:
- **Dashboard** → "Account Details" section
- Example: `696485534226686`

### 3. API Secret:
- **Dashboard** → "Account Details" section
- Click "Reveal" to see it
- Example: `rBWR9HSNegYoEQ5lLzrMqGOv0zk`

### 4. Upload Preset:
- **Settings** → **Upload** tab
- Look for preset name under "Upload presets"
- Example: `loveworld-singers`

---

## ✅ Checklist:

- [ ] Created upload preset in Cloudinary
- [ ] Preset name is: `loveworld-singers`
- [ ] Signing mode is: **Unsigned**
- [ ] Environment variables are set in `.env.local`
- [ ] Restarted dev server
- [ ] Tested upload

---

## 🎯 Quick Test:

**In browser console (after upload):**

Look for these logs:
```
📤 [Cloudinary] Uploading: filename.jpg
✅ [Cloudinary] File uploaded: https://res.cloudinary.com/...
✅ [Cloudinary] File saved to Firebase with ID: abc123
```

**If you see errors:**
```
❌ Upload failed: Upload preset not found
```
→ Create the upload preset!

```
❌ Upload failed: Invalid API key
```
→ Check your API key in `.env.local`

---

## 🚀 After Setup:

Once upload works, you should see:
1. ✅ File in Cloudinary dashboard
2. ✅ File in Firebase `cloudinary_media` collection
3. ✅ File in Media Library with Cloudinary URL

---

**Need help? Check the browser console for error messages!**

