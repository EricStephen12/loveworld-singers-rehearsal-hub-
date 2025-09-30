# 🔐 How Admin System Works - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Admin Accounts](#admin-accounts)
3. [How to Access Admin Panel](#how-to-access-admin-panel)
4. [Authentication System](#authentication-system)
5. [What Admins Can Do](#what-admins-can-do)
6. [Session Management](#session-management)
7. [Activity Logging](#activity-logging)
8. [Technical Details](#technical-details)

---

## 🎯 Overview

The **LoveWorld Singers Rehearsal Hub Portal (LWSRHP)** has a separate admin system that allows authorized users to manage:
- **Praise Night Pages** (create, edit, delete, move between categories)
- **Songs** (add, edit, delete, assign to categories)
- **Categories** (create, rename, delete)
- **Media Files** (upload audio, images, manage storage)
- **User Support** (view and respond to support messages)

**Key Features:**
- ✅ **5 Admin Accounts** - Each admin has their own login
- ✅ **No Role Restrictions** - All admins have full access
- ✅ **8-Hour Sessions** - Stay logged in for 8 hours
- ✅ **Activity Logging** - All actions are tracked
- ✅ **Real-time Updates** - Changes reflect instantly for all users

---

## 👥 Admin Accounts

There are **5 admin accounts** in the system:

| # | Username | Password | Role | Access |
|---|----------|----------|------|--------|
| 1 | `superadmin` | `@superadmin2024@` | Super Admin | Full Access |
| 2 | `admin1` | `@admin1_2024@` | Admin | Full Access |
| 3 | `admin2` | `@admin2_2024@` | Admin | Full Access |
| 4 | `admin3` | `@admin3_2024@` | Admin | Full Access |
| 5 | `admin4` | `@admin4_2024@` | Admin | Full Access |

**📄 Full credentials are in:** `ADMIN_ACCOUNTS.txt`

---

## 🚪 How to Access Admin Panel

### Step 1: Navigate to Admin URL
```
https://your-domain.com/admin
```
Or locally:
```
http://localhost:3000/admin
```

### Step 2: Login Screen
You'll see a purple login screen with:
- **Username** field
- **Password** field
- **Login** button

### Step 3: Enter Credentials
Example:
```
Username: admin1
Password: @admin1_2024@
```

### Step 4: Click Login
- ✅ If correct → You'll see the admin dashboard
- ❌ If wrong → "Invalid username or password" error

### Step 5: You're In!
You'll see:
- Your name in the top right corner
- Full admin dashboard with all features

---

## 🔒 Authentication System

### How It Works

1. **Login Process:**
   ```
   User enters username + password
   ↓
   System checks against ADMIN_USERS array
   ↓
   If match found → Create session
   ↓
   Store session in localStorage
   ↓
   Redirect to admin dashboard
   ```

2. **Session Storage:**
   ```javascript
   {
     adminId: "admin-1",
     username: "admin1",
     fullName: "Admin User 1",
     role: "admin",
     loginTime: 1234567890,
     expiresAt: 1234596690  // 8 hours later
   }
   ```

3. **Session Check:**
   - Every time you visit `/admin`, system checks localStorage
   - If valid session exists → Auto-login
   - If expired or invalid → Show login screen

### Where Credentials Are Stored

**File:** `src/app/admin/page.tsx`

```typescript
const ADMIN_USERS = [
  {
    id: 'admin-1',
    username: 'superadmin',
    password: '@superadmin2024@',
    fullName: 'Super Administrator',
    email: 'superadmin@lwsrhp.com',
    role: 'super_admin'
  },
  // ... 4 more admin accounts
];
```

⚠️ **Note:** In production, passwords should be hashed, but for this internal tool, they're stored in plain text for simplicity.

---

## 🛠️ What Admins Can Do

### 1. **Manage Praise Night Pages**

**Create New Page:**
- Click "Add New Page" button
- Enter page name (e.g., "Praise Night - January 2025")
- Select category (Ongoing, Pre-Rehearsal, Archive)
- Upload banner image (optional)
- Set countdown timer
- Click "Create Page"

**Edit Existing Page:**
- Click edit icon on any page
- Update name, category, banner, or countdown
- Click "Update Page"

**Delete Page:**
- Click delete icon
- Confirm deletion
- All songs in that page are also deleted

**Move Page Between Categories:**
- Edit the page
- Change category dropdown
- Click "Update Page"
- Page moves to new category instantly

---

### 2. **Manage Songs**

**Add New Song:**
- Click "Add Song" button
- Fill in details:
  - **Title** (required)
  - **Category** (Praise, Worship, Hymn, etc.)
  - **Status** (Heard/Unheard)
  - **Personnel** (Lead Singer, Writer, Conductor, etc.)
  - **Music Details** (Key, Tempo)
  - **Lyrics** (Rich text editor)
  - **Solfas** (Rich text editor)
  - **Audio File** (Upload or select from media)
  - **Comments** (Pastor's comments)
- Click "Add Song"

**Edit Song:**
- Click edit icon on any song
- Update any field
- Click "Update Song"
- Changes save to database instantly

**Delete Song:**
- Click delete icon
- Confirm deletion
- Song removed from database

**Toggle Heard/Unheard:**
- Click the status badge on any song
- Status toggles instantly
- Updates in real-time for all users

---

### 3. **Manage Categories**

**Create Category:**
- Click "Add Category" button
- Enter category name (e.g., "Special Songs")
- Click "Create"

**Rename Category:**
- Click edit icon on category
- Enter new name
- Click "Update"
- All songs in that category are updated

**Delete Category:**
- Click delete icon
- Choose what to do with songs:
  - Move to another category
  - Delete all songs
- Confirm deletion

---

### 4. **Manage Media Files**

**Upload Audio:**
- Click "Media Manager" button
- Click "Upload Audio"
- Select MP3/WAV file
- File uploads to Supabase Storage
- Available for all songs

**Upload Images:**
- Click "Upload Image"
- Select JPG/PNG file
- Image uploads and compresses automatically
- Available as banner images

**Delete Media:**
- Click delete icon on any media file
- Confirm deletion
- File removed from storage

---

### 5. **View Support Messages**

**Access Support:**
- Click "Support" tab in admin panel
- See all user support messages
- View message details
- Mark as resolved (future feature)

---

## ⏱️ Session Management

### Session Duration
- **8 hours** from login time
- After 8 hours, you'll be logged out automatically
- You'll need to login again

### Session Storage
- Stored in **localStorage** (browser storage)
- Key: `admin_session`
- Persists across page refreshes
- Cleared on logout

### Auto-Login
- If you close the browser and reopen within 8 hours
- You'll be automatically logged in
- No need to enter credentials again

### Manual Logout
- Click your name in top right corner
- Click "Logout" button
- Session is cleared
- Redirected to login screen

---

## 📊 Activity Logging

### What Gets Logged

Every admin action is logged with:
- **Admin Name** - Who did it
- **Action** - What they did
- **Details** - Specific information
- **Timestamp** - When it happened

**Examples:**
```
✅ [Admin User 1] Login: Logged in at 2:30 PM
📝 [Admin User 1] Created Page: "Praise Night - Jan 2025"
🎵 [Admin User 1] Added Song: "Amazing Grace"
✏️ [Admin User 2] Updated Song: "How Great Thou Art"
🗑️ [Admin User 3] Deleted Song: "Old Song"
```

### Where Logs Are Stored
- **localStorage** key: `admin_activity_logs`
- **Maximum:** 100 most recent activities
- **Viewable in:** Browser console (press F12)

### View Logs
```javascript
// In browser console (F12)
JSON.parse(localStorage.getItem('admin_activity_logs'))
```

---

## 🔧 Technical Details

### File Structure

```
src/
├── app/
│   └── admin/
│       └── page.tsx          # Main admin panel
├── components/
│   ├── EditSongModal.tsx     # Song editing modal
│   ├── MediaManager.tsx      # Media file manager
│   └── ...
├── lib/
│   ├── database.ts           # Database operations
│   ├── admin-activity-logger.ts  # Activity logging
│   └── ...
└── data/
    └── admin-auth.ts         # Admin authentication (legacy)
```

### Authentication Flow

```typescript
// 1. User enters credentials
const handleLogin = () => {
  const admin = ADMIN_USERS.find(
    u => u.username === username && u.password === password
  );
  
  if (admin) {
    // 2. Create session
    const session = {
      adminId: admin.id,
      username: admin.username,
      fullName: admin.fullName,
      role: admin.role,
      loginTime: Date.now(),
      expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
    };
    
    // 3. Store in localStorage
    localStorage.setItem('admin_session', JSON.stringify(session));
    
    // 4. Set authenticated state
    setIsAuthenticated(true);
    setCurrentAdmin(admin);
  }
};
```

### Session Validation

```typescript
// On page load
useEffect(() => {
  const adminSession = localStorage.getItem('admin_session');
  if (adminSession) {
    const session = JSON.parse(adminSession);
    const admin = ADMIN_USERS.find(u => u.id === session.adminId);
    
    // Check if session is still valid
    if (admin && session.expiresAt > Date.now()) {
      setCurrentAdmin(admin);
      setIsAuthenticated(true);
    } else {
      // Session expired
      localStorage.removeItem('admin_session');
    }
  }
}, []);
```

### Database Operations

All admin operations use Supabase:

```typescript
// Create page
await createPage(pageData);

// Update song
await updateSong(songId, songData);

// Delete category
await deleteCategory(categoryId);
```

**Real-time Updates:**
- Uses Supabase real-time subscriptions
- Changes reflect instantly for all users
- No page refresh needed

---

## 🚨 Important Security Notes

### Current Security Level
⚠️ **This is an internal tool** - Security is basic:
- Passwords stored in plain text in code
- No password hashing
- No rate limiting
- No 2FA
- Client-side authentication only

### For Production Use
If deploying publicly, you should:
1. ✅ Hash passwords (bcrypt, argon2)
2. ✅ Move credentials to environment variables
3. ✅ Add server-side authentication
4. ✅ Implement rate limiting
5. ✅ Add 2FA (Two-Factor Authentication)
6. ✅ Use JWT tokens instead of localStorage
7. ✅ Add IP whitelisting
8. ✅ Enable HTTPS only

---

## 📞 Support & Troubleshooting

### Common Issues

**1. "Invalid username or password"**
- ✅ Check spelling (case-sensitive)
- ✅ Copy from `ADMIN_ACCOUNTS.txt`
- ✅ Make sure no extra spaces

**2. "Session expired"**
- ✅ Login again (8 hours passed)
- ✅ Clear browser cache if stuck

**3. "Changes not saving"**
- ✅ Check browser console (F12) for errors
- ✅ Check internet connection
- ✅ Try refreshing the page

**4. "Can't see uploaded files"**
- ✅ Check Supabase storage permissions
- ✅ Run `fix-storage-permissions.sql`
- ✅ Verify file uploaded successfully

### Getting Help

1. **Check browser console** (F12) for error messages
2. **Check activity logs** to see what happened
3. **Contact Super Administrator**
4. **Check Supabase dashboard** for database issues

---

## ✅ Quick Reference

### Login
```
URL: /admin
Username: admin1
Password: @admin1_2024@
```

### Session
```
Duration: 8 hours
Storage: localStorage
Key: admin_session
```

### Permissions
```
All admins: Full Access
No restrictions
```

### Files
```
Credentials: ADMIN_ACCOUNTS.txt
Code: src/app/admin/page.tsx
Database: src/lib/database.ts
```

---

**That's how the admin system works!** 🚀✨

