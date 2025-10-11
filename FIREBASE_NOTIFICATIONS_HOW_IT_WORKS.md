# Firebase Notifications - How It Works 🔔

## ✅ FIXED: Now Using Firebase Instead of Supabase!

---

## 🎯 How Notifications Work in Your App

### **1. Where Notifications Come From:**

#### **A. Admin Creates Them**
Admins can send notifications from the notification page:
- **Send to All Users** - Everyone gets it
- **Send to Specific Group** - Only PMC, 24 Worship, etc.
- **Send to Individual User** - Direct message to one person

#### **B. System Auto-Generates Them** (Future)
The system can automatically create notifications when:
- New praise night is created
- New song is added
- Rehearsal is coming up (24 hours before)
- Lyrics are updated
- User is marked present/absent

---

## 📊 Firebase Database Structure

### **Collection: `notifications`**
Stores all notifications sent in the app.

```typescript
{
  id: "notif_1234567890_abc123",
  title: "New Rehearsal Tomorrow",
  message: "Don't forget rehearsal at 6 PM tomorrow!",
  type: "info",  // info | success | warning | error
  category: "rehearsal",  // rehearsal | announcement | reminder | system | admin | song | praise_night
  priority: "high",  // low | medium | high
  sender_id: "user_abc123",
  sender_name: "admin@example.com",
  action_url: "/pages/rehearsals",  // Optional: where to go when tapped
  target_audience: "all",  // all | group | individual
  target_group: null,  // e.g., "pmc", "soprano"
  target_user_id: null,  // specific user ID
  created_at: "2025-10-11T10:30:00Z",
  is_read: false
}
```

### **Collection: `user_notifications`**
Tracks which users have read which notifications.

```typescript
{
  id: "user123_notif456",  // userId_notificationId
  user_id: "user123",
  notification_id: "notif456",
  read_at: "2025-10-11T11:00:00Z",
  created_at: "2025-10-11T10:30:00Z"
}
```

---

## 🔄 Real-Time Updates

### **How Users See Notifications Instantly:**

1. **User opens notification page**
2. **Firebase listener starts** watching the `notifications` collection
3. **Admin creates a notification** → Saved to Firebase
4. **Firebase sends update** to all connected users
5. **User's app receives update** → Notification appears instantly!
6. **No page refresh needed** - Real-time magic! ✨

```typescript
// Firebase Real-Time Listener
onSnapshot(notificationsRef, (snapshot) => {
  // This runs automatically when notifications change!
  const notifications = snapshot.docs.map(doc => doc.data())
  setNotifications(notifications)
})
```

---

## 👥 Targeting System

### **1. Send to All Users**
```typescript
target_audience: "all"
target_group: null
target_user_id: null
```
**Result:** Every user sees this notification

---

### **2. Send to Specific Group**
```typescript
target_audience: "group"
target_group: "pmc"  // or "soprano", "24worship", etc.
target_user_id: null
```
**Result:** Only users in the PMC group see this

**How it works:**
- System checks `user_groups` collection
- Finds all users with `group_name = "pmc"`
- Shows notification only to those users

---

### **3. Send to Individual User**
```typescript
target_audience: "individual"
target_group: null
target_user_id: "user_abc123"
```
**Result:** Only that specific user sees this

---

## 📱 User Experience Flow

### **Scenario: Admin Sends Rehearsal Reminder**

```
1. Admin opens notification page
2. Admin clicks "Send to All Users"
3. Admin enters:
   - Title: "Rehearsal Tomorrow at 6 PM"
   - Message: "Don't forget! 5 songs to practice"
4. Admin clicks Send

5. System creates notification in Firebase:
   {
     title: "Rehearsal Tomorrow at 6 PM",
     message: "Don't forget! 5 songs to practice",
     type: "info",
     category: "rehearsal",
     priority: "high",
     target_audience: "all",
     created_at: "2025-10-11T10:30:00Z"
   }

6. Firebase broadcasts to all connected users
7. All users see notification appear instantly!
8. Badge count updates (e.g., "3 unread")
9. User taps notification → Marks as read
10. Badge count decreases
```

---

## ✅ Read Status Tracking

### **How "Read" Works:**

1. **User sees notification** (unread by default)
2. **User taps notification** → `markAsRead()` called
3. **System creates record** in `user_notifications`:
   ```typescript
   {
     user_id: "user123",
     notification_id: "notif456",
     read_at: "2025-10-11T11:00:00Z"
   }
   ```
4. **Notification shows as read** (no blue dot)
5. **Badge count decreases**

---

## 🎨 Visual Indicators

### **Unread Notification:**
- Blue dot next to title
- Purple ring around card
- Bold text
- Counted in badge

### **Read Notification:**
- No blue dot
- Normal border
- Regular text
- Not counted in badge

---

## 🔧 Admin Features

### **From Notification Page:**

```typescript
// Send to all users
createNotificationForAll({
  title: "Important Announcement",
  message: "Choir meeting this Sunday",
  type: "info",
  category: "announcement",
  priority: "high"
})

// Send to specific group
createNotificationForGroup({
  title: "PMC Rehearsal",
  message: "Extra practice this Saturday",
  groupName: "pmc",
  type: "info",
  category: "rehearsal",
  priority: "medium"
})

// Send to individual user
createNotificationForUser({
  title: "Profile Incomplete",
  message: "Please complete your profile",
  targetUserId: "user123",
  type: "warning",
  category: "system",
  priority: "low"
})
```

---

## 🚀 Future Auto-Notifications

### **System will automatically send notifications when:**

#### **1. New Praise Night Created**
```typescript
createNotificationForAll({
  title: "New Praise Night: January 2025",
  message: "Check out the new praise night event!",
  category: "praise_night",
  priority: "high",
  actionUrl: "/pages/praise-nights/abc123"
})
```

#### **2. New Song Added**
```typescript
createNotificationForAll({
  title: "New Song: Amazing Grace",
  message: "New song added for tomorrow's rehearsal",
  category: "song",
  priority: "medium",
  actionUrl: "/pages/songs/song123"
})
```

#### **3. Rehearsal Reminder (24 hours before)**
```typescript
createNotificationForAll({
  title: "Rehearsal Tomorrow at 6 PM",
  message: "Don't forget! 5 songs to practice",
  category: "rehearsal",
  priority: "high"
})
```

#### **4. Lyrics Updated**
```typescript
createNotificationForAll({
  title: "Lyrics Updated: How Great Thou Art",
  message: "New verse added - check it out!",
  category: "song",
  priority: "low",
  actionUrl: "/pages/songs/song456"
})
```

---

## 📊 Notification Categories

| Category | Purpose | Example |
|----------|---------|---------|
| `rehearsal` | Rehearsal reminders & updates | "Rehearsal tomorrow at 6 PM" |
| `announcement` | General announcements | "Choir meeting this Sunday" |
| `reminder` | General reminders | "Update your profile" |
| `system` | App updates & technical | "New app version available" |
| `admin` | Admin messages | "Important policy update" |
| `song` | Song-related updates | "New lyrics uploaded" |
| `praise_night` | Praise night events | "3 days to Praise Night!" |

---

## 🎯 Priority Levels

| Priority | Color | Use Case |
|----------|-------|----------|
| `high` | 🔴 Red | Urgent, requires immediate attention |
| `medium` | 🟡 Yellow | Important, read soon |
| `low` | ⚪ Gray | Informational, read when convenient |

---

## ✨ Benefits

1. **Real-Time** - Users see notifications instantly
2. **Targeted** - Send to specific groups or individuals
3. **Tracked** - Know who read what
4. **Scalable** - Works for millions of users
5. **Offline Support** - Firebase caches data
6. **No Refresh Needed** - Updates automatically

---

## 🔍 How to Test

### **1. As Admin:**
1. Go to `/pages/notifications`
2. Click "Send to All Users"
3. Enter title and message
4. Click Send
5. Check that notification appears

### **2. As User:**
1. Open notification page
2. See notification appear
3. Tap notification → Should mark as read
4. Blue dot disappears
5. Badge count decreases

### **3. Test Group Notifications:**
1. Create user in PMC group
2. Send notification to PMC group
3. Only PMC users should see it

---

## 🐛 Troubleshooting

### **Notifications not appearing?**
- Check Firebase console → `notifications` collection
- Check browser console for errors
- Verify user is logged in
- Check target_audience matches user

### **Read status not updating?**
- Check `user_notifications` collection
- Verify user ID is correct
- Check browser console for errors

### **Real-time not working?**
- Check Firebase listener is active
- Verify internet connection
- Check Firebase rules allow read access

---

## 🎉 Summary

**Notifications now work with Firebase!**
- ✅ Real-time updates
- ✅ Targeted messaging
- ✅ Read tracking
- ✅ Admin controls
- ✅ Scalable for millions

**No more Supabase dependency!** 🚀

