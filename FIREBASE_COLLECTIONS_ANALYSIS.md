# 🔍 Complete Firebase Collections Analysis

## 📊 Overview

This document provides a **complete analysis** of ALL Firebase Firestore collections used in the LoveWorld Singers Rehearsal Hub app, including current collections, future planned collections, and recommendations for security rules.

---

## 🗂️ Current Collections (In Use)

### **1. `profiles`** ✅ ACTIVE
**Purpose:** User profiles and authentication data  
**Used By:** Firebase Auth, AuthContext, all user-related features  
**Fields:**
- `id` (string) - User ID (matches Firebase Auth UID)
- `email` (string) - User email
- `first_name` (string) - First name
- `last_name` (string) - Last name
- `role` (string) - 'user' or 'admin'
- `profile_completed` (boolean) - Profile completion status
- `created_at` (timestamp) - Creation date
- `updated_at` (timestamp) - Last update date

**Access Pattern:**
- Read: All authenticated users (for user lists, groups, chat)
- Create: Users can create their own profile during signup
- Update: Users can update their own, admins can update any
- Delete: Only admins

---

### **2. `praise_nights`** ✅ ACTIVE
**Purpose:** Praise night events/pages  
**Used By:** Admin panel, home page, praise night pages  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `name` (string) - Event name
- `date` (string) - Event date
- `location` (string) - Event location
- `category` (string) - 'unassigned', 'pre-rehearsal', 'ongoing', 'archive'
- `bannerImage` (string) - Image URL
- `createdAt` (timestamp) - Creation date
- `updatedAt` (timestamp) - Last update date

**Access Pattern:**
- Read: All users (public access)
- Create/Update/Delete: Admin panel (uses localStorage auth)

**⚠️ SECURITY NOTE:** Admin panel uses localStorage (not Firebase Auth), so write operations must be open

---

### **3. `songs`** ⚠️ DEPRECATED (Kept as backup)
**Purpose:** Old songs table (before migration)  
**Used By:** Legacy code (not actively used)  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `title` (string) - Song title
- `praiseNightId` (string) - Reference to praise night
- `status` (string) - 'heard' or 'unheard'
- `category` (string) - Song category
- Other metadata fields

**Access Pattern:**
- Read: All users
- Create/Update/Delete: Admin panel (uses localStorage auth)

**⚠️ SECURITY NOTE:** Kept for backward compatibility, admin uses localStorage

---

### **4. `praise_night_songs`** ✅ ACTIVE (Current System)
**Purpose:** Current songs system (no ID conflicts)  
**Used By:** Admin panel, home page, praise night pages, Audio Lab  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `title` (string) - Song title
- `praiseNightId` (string) - Reference to praise night
- `status` (string) - 'heard' or 'unheard'
- `category` (string) - Song category
- `artist` (string) - Artist name
- `genre` (string) - Music genre
- `duration` (string) - Song duration
- `leadSinger` (string) - Lead singer name
- `writer` (string) - Song writer
- `conductor` (string) - Conductor name
- `key` (string) - Musical key
- `tempo` (string) - Song tempo
- `lyrics` (string) - Song lyrics
- `solfas` (string) - Solfa notation
- `audioFile` (string) - Audio URL
- `rehearsalCount` (number) - Number of rehearsals
- `createdAt` (timestamp) - Creation date
- `updatedAt` (timestamp) - Last update date

**Access Pattern:**
- Read: All users
- Create/Update/Delete: Admin panel (uses localStorage auth)

**⚠️ SECURITY NOTE:** Admin uses localStorage, so write operations must be open

---

### **5. `admin_messages`** ✅ ACTIVE
**Purpose:** Admin notifications/announcements to all users  
**Used By:** Admin panel (SimpleNotificationsSection), notification system  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `title` (string) - Message title
- `message` (string) - Message content
- `sentBy` (string) - Admin username
- `sentAt` (string) - ISO timestamp
- `createdAt` (serverTimestamp) - Server timestamp

**Access Pattern:**
- Read: All authenticated users
- Create/Delete: Admin panel (uses localStorage auth)
- Update: No one (messages are immutable)

**⚠️ SECURITY NOTE:** Admin uses localStorage, so write operations must be open

---

### **6. `comments`** ✅ ACTIVE
**Purpose:** Comments on songs  
**Used By:** FirebaseCommentService, song detail pages  
**Fields:**
- `id` (string) - Comment ID
- `song_id` (number) - Reference to song
- `user_id` (string) - Comment author ID
- `user_name` (string) - Comment author name
- `content` (string) - Comment text
- `parent_id` (number|null) - Parent comment ID (for replies)
- `created_at` (string) - ISO timestamp
- `updated_at` (string) - ISO timestamp
- `likes` (number) - Like count
- `liked_by` (array) - Array of user IDs who liked
- `is_edited` (boolean) - Edit status

**Access Pattern:**
- Read: All authenticated users
- Create: Any authenticated user
- Update: Comment author or admin
- Delete: Comment author or admin

---

## 🔮 Future/Planned Collections (Not Yet Implemented)

### **7. `groups`** 📋 PLANNED
**Purpose:** User groups for collaboration  
**Used By:** Groups feature (not yet implemented in Firebase)  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `name` (string) - Group name
- `description` (string) - Group description
- `created_by` (string) - Creator user ID
- `members` (array) - Array of user IDs
- `created_at` (timestamp) - Creation date
- `updated_at` (timestamp) - Last update date

**Access Pattern:**
- Read: All authenticated users
- Create: Any authenticated user
- Update: Group creator or admin
- Delete: Group creator or admin

**⚠️ STATUS:** Currently uses Supabase, may migrate to Firebase

---

### **8. `group_posts`** 📋 PLANNED
**Purpose:** Posts within groups  
**Used By:** Groups feature (not yet implemented in Firebase)  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `group_id` (string) - Reference to group
- `user_id` (string) - Post author ID
- `content` (string) - Post content
- `timestamp` (timestamp) - Post time
- `likes` (number) - Like count
- `comments` (array) - Comments on post

**Access Pattern:**
- Read: All authenticated users
- Create: Any authenticated user
- Update: Post creator or admin
- Delete: Post creator or admin

**⚠️ STATUS:** Currently uses Supabase, may migrate to Firebase

---

### **9. `notifications`** 📋 PLANNED
**Purpose:** User-specific notifications  
**Used By:** Notification system (not yet implemented in Firebase)  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `user_id` (string) - Recipient user ID
- `title` (string) - Notification title
- `message` (string) - Notification message
- `type` (string) - Notification type
- `read` (boolean) - Read status
- `created_at` (timestamp) - Creation date

**Access Pattern:**
- Read: Users can only read their own
- Create: Only admins
- Update: Users can update their own (mark as read)
- Delete: Users can delete their own, admins can delete any

**⚠️ STATUS:** Currently uses Supabase, may migrate to Firebase

---

### **10. `conversations`** 📋 PLANNED
**Purpose:** Chat conversations between users  
**Used By:** Chat system (not yet implemented in Firebase)  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `participants` (array) - Array of user IDs
- `last_message` (string) - Last message preview
- `updated_at` (timestamp) - Last update date
- `created_at` (timestamp) - Creation date

**Access Pattern:**
- Read: Only participants
- Create: Any authenticated user
- Update: Only participants
- Delete: Only participants

**⚠️ STATUS:** Currently uses Supabase, may migrate to Firebase

---

### **11. `messages`** 📋 PLANNED
**Purpose:** Individual messages in conversations  
**Used By:** Chat system (not yet implemented in Firebase)  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `conversation_id` (string) - Reference to conversation
- `sender_id` (string) - Sender user ID
- `content` (string) - Message content
- `created_at` (timestamp) - Creation date
- `is_read` (boolean) - Read status

**Access Pattern:**
- Read: Only conversation participants
- Create: Only conversation participants
- Update: Only message sender
- Delete: Only message sender

**⚠️ STATUS:** Currently uses Supabase, may migrate to Firebase

---

### **12. `attendance`** 📋 PLANNED
**Purpose:** Event attendance tracking  
**Used By:** Attendance system (not yet implemented in Firebase)  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `user_id` (string) - User ID
- `event_name` (string) - Event name
- `event_date` (string) - Event date
- `status` (string) - 'Present', 'Late', 'Absent'
- `check_in_time` (string) - Check-in timestamp
- `created_at` (timestamp) - Creation date

**Access Pattern:**
- Read: Users can read their own, admins can read all
- Create/Update/Delete: Only admins

**⚠️ STATUS:** Currently uses Supabase, may migrate to Firebase

---

### **13. `achievements`** 📋 PLANNED
**Purpose:** User achievements and badges  
**Used By:** Achievement system (not yet implemented in Firebase)  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `user_id` (string) - User ID
- `achievement_name` (string) - Achievement name
- `achievement_description` (string) - Description
- `earned_date` (string) - Date earned
- `created_at` (timestamp) - Creation date

**Access Pattern:**
- Read: All authenticated users (for leaderboards)
- Create/Update/Delete: Only admins

**⚠️ STATUS:** Currently uses Supabase, may migrate to Firebase

---

## 🚀 Additional Future Collections

### **14. `cloudinary_media`** 📋 PLANNED
**Purpose:** Track Cloudinary media files  
**Used By:** CloudinaryMediaService  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `name` (string) - File name
- `url` (string) - Cloudinary URL
- `publicId` (string) - Cloudinary public ID
- `resourceType` (string) - 'image', 'video', 'raw'
- `type` (string) - File type
- `size` (number) - File size in bytes
- `folder` (string) - Cloudinary folder
- `format` (string) - File format
- `width` (number) - Image/video width
- `height` (number) - Image/video height
- `duration` (number) - Audio/video duration
- `createdAt` (timestamp) - Creation date
- `updatedAt` (timestamp) - Last update date

**Access Pattern:**
- Read: All authenticated users
- Create/Update/Delete: Admin only

---

### **15. `voice_messages`** 📋 PLANNED
**Purpose:** Voice messages in chat  
**Used By:** VoiceRecordingService, chat system  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `audioBlob` (string) - Audio data URL or storage path
- `duration` (number) - Duration in seconds
- `timestamp` (string) - ISO timestamp
- `senderId` (string) - Sender user ID
- `senderName` (string) - Sender name
- `groupId` (string|null) - Group ID if group message
- `friendId` (string|null) - Friend ID if direct message

**Access Pattern:**
- Read: Conversation participants only
- Create: Any authenticated user
- Delete: Message sender or admin

---

### **16. `webrtc_sessions`** 📋 PLANNED
**Purpose:** WebRTC call sessions  
**Used By:** WebRTCService, video/voice calls  
**Fields:**
- `id` (string) - Firebase auto-generated ID
- `callType` (string) - 'video' or 'voice'
- `participants` (array) - Array of user IDs
- `startTime` (timestamp) - Call start time
- `endTime` (timestamp|null) - Call end time
- `duration` (number) - Call duration in seconds
- `status` (string) - 'active', 'ended', 'missed'

**Access Pattern:**
- Read: Participants only
- Create: Any authenticated user
- Update: Participants only
- Delete: Participants only

---

## 📝 Recommendations for Security Rules

### **Current Collections (Active):**
1. ✅ **profiles** - Strict rules (users own their data)
2. ✅ **praise_nights** - Open write (admin uses localStorage)
3. ✅ **songs** - Open write (admin uses localStorage)
4. ✅ **praise_night_songs** - Open write (admin uses localStorage)
5. ✅ **admin_messages** - Open write (admin uses localStorage)
6. ✅ **comments** - User-based rules (users own their comments)

### **Future Collections (Planned):**
7. 📋 **groups** - Add when implemented
8. 📋 **group_posts** - Add when implemented
9. 📋 **notifications** - Add when implemented
10. 📋 **conversations** - Add when implemented
11. 📋 **messages** - Add when implemented
12. 📋 **attendance** - Add when implemented
13. 📋 **achievements** - Add when implemented
14. 📋 **cloudinary_media** - Add when implemented
15. 📋 **voice_messages** - Add when implemented
16. 📋 **webrtc_sessions** - Add when implemented

---

## ⚠️ Critical Security Notes

### **Admin Panel Issue:**
- Admin panel uses **localStorage authentication** (not Firebase Auth)
- This means admin operations don't have Firebase Auth tokens
- Collections managed by admin must have **open write access**
- Affected collections: `praise_nights`, `songs`, `praise_night_songs`, `admin_messages`

### **Future Migration Recommendation:**
- Migrate admin to use **Firebase Admin SDK** for server-side operations
- Or migrate admin to use **Firebase Auth** with admin role
- This will allow proper security rules for admin operations

### **Current Workaround:**
- Keep write access open for admin-managed collections
- Add TODO comments in rules for future migration
- Monitor Firebase Console for suspicious activity

---

## 📊 Summary

**Total Collections:** 16  
**Active (Firebase):** 6  
**Planned (Future):** 10  
**Using Supabase:** 7 (may migrate to Firebase)

**Security Status:**
- ✅ User collections: Properly secured
- ⚠️ Admin collections: Open write (due to localStorage auth)
- 📋 Future collections: Rules ready, waiting for implementation

---

**Created:** 2025-10-14  
**Last Updated:** 2025-10-14  
**Status:** Complete analysis ready for security rules implementation

