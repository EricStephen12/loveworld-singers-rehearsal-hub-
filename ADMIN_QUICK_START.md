# 🚀 Admin Panel - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Access Admin Panel
```
URL: https://your-domain.com/admin
Local: http://localhost:3000/admin
```

### Step 2: Login
```
Username: admin1
Password: @admin1_2024@
```
*(See ADMIN_ACCOUNTS.txt for all accounts)*

### Step 3: You're In! 🎉

---

## 📋 Common Tasks

### ➕ Add a New Praise Night Page

1. Click **"Add New Page"** button (top right)
2. Fill in:
   - **Name:** "Praise Night - January 2025"
   - **Category:** Select "Ongoing"
   - **Banner Image:** Upload (optional)
   - **Countdown:** Set days, hours, minutes, seconds
3. Click **"Create Page"**
4. ✅ Done! Page appears instantly

---

### 🎵 Add a New Song

1. Click **"Add Song"** button
2. Fill in **required fields:**
   - **Title:** "Amazing Grace"
   - **Category:** "Hymn"
   - **Praise Night:** Select the page
3. Fill in **optional fields:**
   - **Lead Singer:** "John Doe"
   - **Writer:** "John Newton"
   - **Key:** "C"
   - **Tempo:** "120 BPM"
   - **Lyrics:** Type or paste
   - **Solfas:** Type or paste
   - **Audio:** Upload MP3
4. Click **"Add Song"**
5. ✅ Done! Song appears in the list

---

### ✏️ Edit a Song

1. Find the song in the list
2. Click the **edit icon** (pencil)
3. Update any field
4. Click **"Update Song"**
5. ✅ Done! Changes saved instantly

---

### 🗑️ Delete a Song

1. Find the song in the list
2. Click the **delete icon** (trash)
3. Confirm deletion
4. ✅ Done! Song removed

---

### 🔄 Move Page to Different Category

1. Click **edit icon** on the page
2. Change **Category** dropdown:
   - Ongoing
   - Pre-Rehearsal
   - Archive
3. Click **"Update Page"**
4. ✅ Done! Page moves to new category

---

### ✅ Mark Song as Heard

1. Find the song
2. Click the **status badge** (Unheard/Heard)
3. ✅ Done! Status toggles instantly

---

### 🎨 Upload Banner Image

1. Edit a page
2. Click **"Upload Banner Image"**
3. Select JPG/PNG file
4. Image uploads and compresses
5. Click **"Update Page"**
6. ✅ Done! Banner appears on page

---

### 🎧 Upload Audio File

**Method 1: Direct Upload**
1. Edit a song
2. Scroll to **Audio File** section
3. Click **"Browse Media"**
4. Click **"Upload Audio"**
5. Select MP3/WAV file
6. Click **"Select"**
7. Click **"Update Song"**

**Method 2: Select Existing**
1. Edit a song
2. Click **"Browse Media"**
3. Select from existing files
4. Click **"Select"**
5. Click **"Update Song"**

---

### 📝 Add Pastor's Comment

1. Edit a song
2. Scroll to **Pastor's Comments** section
3. Type your comment
4. Click **"Add Comment"**
5. ✅ Comment appears in list

---

### 🏷️ Create New Category

1. Click **"Categories"** tab
2. Click **"Add Category"**
3. Enter name: "Special Songs"
4. Click **"Create"**
5. ✅ Done! Category available for songs

---

### 📊 View Activity Logs

**In Browser Console:**
1. Press **F12** (open DevTools)
2. Go to **Console** tab
3. Type:
   ```javascript
   JSON.parse(localStorage.getItem('admin_activity_logs'))
   ```
4. Press **Enter**
5. ✅ See all admin activities

---

## 🔐 Session Info

- **Duration:** 8 hours
- **Auto-login:** Yes (if within 8 hours)
- **Logout:** Click your name → Logout

---

## 🆘 Quick Troubleshooting

### Problem: Can't login
**Solution:**
- Check username/password (case-sensitive)
- Copy from ADMIN_ACCOUNTS.txt
- Clear browser cache

### Problem: Changes not saving
**Solution:**
- Check internet connection
- Refresh the page
- Check browser console (F12) for errors

### Problem: Uploaded image not showing
**Solution:**
- Run `fix-storage-permissions.sql` in Supabase
- Check file size (max 5MB)
- Try different image format

### Problem: Session expired
**Solution:**
- Login again (8 hours passed)
- Your session is stored for 8 hours only

---

## 📞 Need Help?

1. **Check:** `HOW_ADMIN_WORKS.md` for detailed guide
2. **Check:** Browser console (F12) for errors
3. **Contact:** Super Administrator

---

## 🎯 Pro Tips

### ⚡ Keyboard Shortcuts
- **Ctrl + S** - Save (in some modals)
- **Esc** - Close modal
- **F12** - Open DevTools

### 🎨 Best Practices
- ✅ Use descriptive song titles
- ✅ Fill in all personnel fields
- ✅ Add lyrics and solfas for every song
- ✅ Upload high-quality audio (MP3, 320kbps)
- ✅ Use consistent naming for categories
- ✅ Set accurate countdown timers
- ✅ Add pastor's comments for important notes

### 🚀 Efficiency Tips
- **Batch operations:** Add multiple songs at once
- **Copy/paste:** Use clipboard for lyrics/solfas
- **Media library:** Reuse uploaded audio files
- **Categories:** Organize songs logically
- **Search:** Use search bar to find songs quickly

---

## 📚 Related Files

- **Full Guide:** `HOW_ADMIN_WORKS.md`
- **Credentials:** `ADMIN_ACCOUNTS.txt`
- **Storage Fix:** `fix-storage-permissions.sql`
- **Banner Fix:** `FIX_BANNER_IMAGE_VISIBILITY.md`

---

## ✅ Checklist for New Admins

- [ ] Login with your credentials
- [ ] Explore the dashboard
- [ ] Create a test page
- [ ] Add a test song
- [ ] Upload a test audio file
- [ ] Edit and delete the test items
- [ ] Check activity logs
- [ ] Logout and login again
- [ ] Familiarize yourself with all features

---

**You're ready to manage the LoveWorld Singers Rehearsal Hub!** 🎉✨

---

## 🔗 Quick Links

| Task | Action |
|------|--------|
| Login | Go to `/admin` |
| Add Page | Click "Add New Page" |
| Add Song | Click "Add Song" |
| Upload Media | Click "Browse Media" → "Upload" |
| View Logs | F12 → Console → Check logs |
| Logout | Click your name → Logout |

---

**Last Updated:** 2025-09-30

