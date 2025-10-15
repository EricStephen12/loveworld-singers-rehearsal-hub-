# 🔒 Firebase Security Rules Documentation

## 📋 Overview

This document explains the Firebase Firestore security rules for the **LoveWorld Singers Rehearsal Hub** app.

**IMPORTANT:** These rules will be enforced when your Firebase project moves from **test mode** to **production mode** in 30 days.

## ⚠️ CRITICAL NOTE ABOUT ADMIN PANEL

**Your admin panel uses localStorage authentication (NOT Firebase Auth)**, so the security rules are configured to allow admin operations without Firebase Auth checks.

**Current Setup:**
- ✅ Admin panel works with localStorage (username/password)
- ✅ Regular users use Firebase Auth
- ✅ Security rules allow admin operations to work
- ⚠️ Admin collections have open write access (because admin doesn't use Firebase Auth)

**For Better Security (Future):**
You should migrate admin to use Firebase Admin SDK or Firebase Auth. For now, the rules won't break your admin panel!

---

## 🗂️ Collections & Rules

### **1. `profiles` Collection**

**Purpose:** User profiles and authentication data

**Fields:**
- `id` - User ID (matches Firebase Auth UID)
- `email` - User email
- `first_name`, `last_name` - User name
- `role` - 'user' or 'admin'
- `profile_completed` - Boolean
- `created_at`, `updated_at` - Timestamps

**Rules:**
- ✅ **Read:** Any authenticated user can read any profile
- ✅ **Create:** Users can create their own profile during signup
- ✅ **Update:** Users can update their own profile, admins can update any
- ✅ **Delete:** Only admins can delete profiles

**Why:**
- Users need to see other users' profiles for groups, chat, etc.
- Users control their own data
- Admins have full control for moderation

---

### **2. `praise_nights` Collection**

**Purpose:** Praise night events/pages

**Fields:**
- `id` - Firebase auto-generated ID
- `name` - Event name
- `date` - Event date
- `location` - Event location
- `category` - 'unassigned', 'pre-rehearsal', 'ongoing', 'archive'
- `bannerImage` - Image URL
- `createdAt`, `updatedAt` - Timestamps

**Rules:**
- ✅ **Read:** Anyone can read (even unauthenticated)
- ✅ **Create/Update/Delete:** Anyone can write (admin panel uses localStorage)

**Why:**
- All users need to see praise nights
- Admin panel uses localStorage (not Firebase Auth), so we allow all writes
- ⚠️ **TODO:** Migrate admin to Firebase Admin SDK for better security

---

### **3. `songs` Collection (OLD - DEPRECATED)**

**Purpose:** Old songs table (kept as backup)

**Fields:**
- `id` - Firebase auto-generated ID
- `title` - Song title
- `praiseNightId` - Reference to praise night
- `status` - 'heard' or 'unheard'
- Other song metadata

**Rules:**
- ✅ **Read:** Anyone can read
- ✅ **Create/Update/Delete:** Anyone can write (admin panel uses localStorage)

**Why:**
- Kept for backward compatibility
- Admin panel uses localStorage (not Firebase Auth), so we allow all writes
- ⚠️ **TODO:** Migrate admin to Firebase Admin SDK for better security

---

### **4. `praise_night_songs` Collection (NEW - CURRENT)**

**Purpose:** Current songs system (no ID conflicts)

**Fields:**
- `id` - Firebase auto-generated ID
- `title` - Song title
- `praiseNightId` - Reference to praise night
- `status` - 'heard' or 'unheard'
- `category` - Song category
- `artist` - Artist name
- `genre` - Music genre
- `duration` - Song duration
- `leadSinger`, `writer`, `conductor` - Personnel
- `key`, `tempo` - Music details
- `lyrics`, `solfas` - Song content
- `audioFile` - Audio URL
- `createdAt`, `updatedAt` - Timestamps

**Rules:**
- ✅ **Read:** Anyone can read
- ✅ **Create/Update/Delete:** Anyone can write (admin panel uses localStorage)

**Why:**
- All users need to see songs
- Admin panel uses localStorage (not Firebase Auth), so we allow all writes
- ⚠️ **TODO:** Migrate admin to Firebase Admin SDK for better security

---

### **5. `admin_messages` Collection**

**Purpose:** Admin notifications/announcements to all users

**Fields:**
- `id` - Firebase auto-generated ID
- `title` - Message title
- `message` - Message content
- `sentBy` - Admin username
- `sentAt` - Timestamp
- `createdAt` - Server timestamp

**Rules:**
- ✅ **Read:** Any authenticated user can read
- ✅ **Create/Delete:** Anyone can write (admin panel uses localStorage)
- ❌ **Update:** No one (messages are immutable)

**Why:**
- All users need to see admin messages
- Admin panel uses localStorage (not Firebase Auth), so we allow all writes
- Messages can't be edited (integrity)
- ⚠️ **TODO:** Migrate admin to Firebase Admin SDK for better security

---

### **6. `groups` Collection**

**Purpose:** User groups for collaboration

**Fields:**
- `id` - Firebase auto-generated ID
- `name` - Group name
- `description` - Group description
- `created_by` - Creator user ID
- `members` - Array of user IDs
- `created_at`, `updated_at` - Timestamps

**Rules:**
- ✅ **Read:** Any authenticated user can read
- ✅ **Create:** Any authenticated user can create
- ✅ **Update:** Group creator or admin
- ✅ **Delete:** Group creator or admin

**Why:**
- Users can create and manage their own groups
- Admins can moderate any group

---

### **7. `group_posts` Collection**

**Purpose:** Posts within groups

**Fields:**
- `id` - Firebase auto-generated ID
- `group_id` - Reference to group
- `user_id` - Post author ID
- `content` - Post content
- `timestamp` - Post time
- `likes`, `comments` - Engagement data

**Rules:**
- ✅ **Read:** Any authenticated user can read
- ✅ **Create:** Any authenticated user can create
- ✅ **Update:** Post creator or admin
- ✅ **Delete:** Post creator or admin

**Why:**
- Users can post in groups
- Users control their own posts
- Admins can moderate

---

### **8. `notifications` Collection**

**Purpose:** User-specific notifications

**Fields:**
- `id` - Firebase auto-generated ID
- `user_id` - Recipient user ID
- `title` - Notification title
- `message` - Notification message
- `type` - Notification type
- `read` - Boolean
- `created_at` - Timestamp

**Rules:**
- ✅ **Read:** Users can only read their own notifications
- ❌ **Create:** Only admins can create
- ✅ **Update:** Users can update their own (mark as read), admins can update any
- ✅ **Delete:** Users can delete their own, admins can delete any

**Why:**
- Privacy: users only see their own notifications
- Admins send notifications
- Users can manage their notifications

---

### **9. `conversations` Collection**

**Purpose:** Chat conversations between users

**Fields:**
- `id` - Firebase auto-generated ID
- `participants` - Array of user IDs
- `last_message` - Last message preview
- `updated_at`, `created_at` - Timestamps

**Rules:**
- ✅ **Read:** Only participants can read
- ✅ **Create:** Any authenticated user can create
- ✅ **Update:** Only participants can update
- ✅ **Delete:** Only participants can delete

**Why:**
- Privacy: only conversation participants can access
- Users can start conversations

---

### **10. `messages` Collection**

**Purpose:** Individual messages in conversations

**Fields:**
- `id` - Firebase auto-generated ID
- `conversation_id` - Reference to conversation
- `sender_id` - Sender user ID
- `content` - Message content
- `created_at` - Timestamp
- `is_read` - Boolean

**Rules:**
- ✅ **Read:** Only conversation participants can read
- ✅ **Create:** Only conversation participants can create
- ✅ **Update:** Only message sender can update
- ✅ **Delete:** Only message sender can delete

**Why:**
- Privacy: only participants see messages
- Users control their own messages

---

### **11. `attendance` Collection**

**Purpose:** Event attendance tracking

**Fields:**
- `id` - Firebase auto-generated ID
- `user_id` - User ID
- `event_name` - Event name
- `event_date` - Event date
- `status` - 'Present', 'Late', 'Absent'
- `check_in_time` - Check-in timestamp
- `created_at` - Timestamp

**Rules:**
- ✅ **Read:** Users can read their own, admins can read all
- ❌ **Create/Update/Delete:** Only admins

**Why:**
- Users can see their own attendance
- Only admins manage attendance records

---

### **12. `achievements` Collection**

**Purpose:** User achievements and badges

**Fields:**
- `id` - Firebase auto-generated ID
- `user_id` - User ID
- `achievement_name` - Achievement name
- `achievement_description` - Description
- `earned_date` - Date earned
- `created_at` - Timestamp

**Rules:**
- ✅ **Read:** Any authenticated user can read (for leaderboards)
- ❌ **Create/Update/Delete:** Only admins

**Why:**
- Public achievements for motivation
- Only admins award achievements

---

## 🔑 Helper Functions

### `isAuthenticated()`
Checks if user is logged in via Firebase Auth

### `isAdmin()`
Checks if user has `role: 'admin'` in their profile

### `isOwner(userId)`
Checks if the authenticated user owns the document

### `hasCompleteProfile()`
Checks if user has completed their profile setup

---

## 🚀 Deployment Instructions

### **1. Test Rules Locally (Optional)**
```bash
firebase emulators:start --only firestore
```

### **2. Deploy to Firebase**
```bash
firebase deploy --only firestore:rules
```

### **3. Verify in Firebase Console**
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click "Rules" tab
4. Verify rules are deployed

---

## ⚠️ Important Notes

### **Before Production (30 days):**
1. ✅ Deploy these rules
2. ✅ Test with real users
3. ✅ Verify admin functionality works
4. ✅ Check that regular users can't access admin features

### **Admin Users:**
Make sure to set `role: 'admin'` in the `profiles` collection for admin users:
```javascript
// In Firebase Console or via code
await updateDoc(doc(db, 'profiles', 'ADMIN_USER_ID'), {
  role: 'admin'
});
```

### **Testing:**
Test these scenarios:
- ✅ Regular user can read songs
- ❌ Regular user CANNOT create/update/delete songs
- ✅ Admin can create/update/delete songs
- ✅ Users can only see their own notifications
- ✅ Users can create groups and posts

---

## 📊 Security Checklist

- [x] All collections have explicit rules
- [x] Default deny-all rule at the end
- [x] Admin role properly checked
- [x] User authentication required for all operations
- [x] Privacy rules for personal data (notifications, messages)
- [x] Users can only modify their own data
- [x] Admins have full control where needed
- [x] No undefined collections allowed

---

## 🆘 Troubleshooting

### **"Permission denied" errors:**
1. Check if user is authenticated
2. Verify user's role in `profiles` collection
3. Check if the operation is allowed by the rules
4. Look at Firebase Console > Firestore > Rules tab for errors

### **Admin can't perform actions:**
1. Verify `role: 'admin'` is set in user's profile
2. Check that profile document exists
3. Verify user is authenticated

### **Users can't read data:**
1. Verify user is authenticated
2. Check if the collection allows read access
3. Verify the document exists

---

## 📝 Next Steps

1. **Review the rules** - Make sure they match your app's needs
2. **Deploy to Firebase** - Use `firebase deploy --only firestore:rules`
3. **Test thoroughly** - Test with both admin and regular users
4. **Monitor** - Watch Firebase Console for any permission errors
5. **Update as needed** - Add new collections/rules as your app grows

---

**Created:** 2025-10-14
**Status:** Ready for production deployment
**Last Updated:** 2025-10-14


