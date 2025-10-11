# Auto-Notifications Integration Guide 🔔

## 🎯 Goal: Automatic Notifications When Admin Does Actions

Instead of admin manually sending notifications, the system **automatically sends specific notifications** when admin:
- Creates a praise night
- Adds a song
- Updates lyrics
- Changes song details
- Deletes a song

---

## 📝 Where to Add Auto-Notifications

### **1. When Admin Creates a New Praise Night**

**File:** `src/app/admin/page.tsx`

**Find this code** (around line 470-490):
```typescript
const result = await FirebaseDatabaseService.addPraiseNight(newPage);

if (result.success && result.id) {
  console.log('✅ Page created with Firebase-generated ID:', result.id);
  // Upload banner image if a new file was selected
  // ...
}
```

**Add this after the page is created:**
```typescript
import { autoNotifications } from '@/lib/auto-notifications';

const result = await FirebaseDatabaseService.addPraiseNight(newPage);

if (result.success && result.id) {
  console.log('✅ Page created with Firebase-generated ID:', result.id);
  
  // 🔔 AUTO-NOTIFICATION: New Praise Night Created
  await autoNotifications.notifyNewPraiseNight(
    newPage.name,           // "January Praise Night 2025"
    result.id,              // Firebase ID
    newPage.date,           // Event date
    currentAdmin?.uid       // Admin who created it
  );
  
  // Upload banner image...
}
```

**Result:** Users see: **"🎉 New Praise Night: January Praise Night 2025"**

---

### **2. When Admin Adds a New Song**

**File:** `src/app/admin/page.tsx`

**Find this code** (around line 770-790):
```typescript
result = await FirebaseDatabaseService.createSong(updatedSongData);

if (result.success) {
  console.log('✅ Song created successfully');
  // ...
}
```

**Add this after the song is created:**
```typescript
import { autoNotifications } from '@/lib/auto-notifications';

result = await FirebaseDatabaseService.createSong(updatedSongData);

if (result.success && result.id) {
  console.log('✅ Song created successfully');
  
  // 🔔 AUTO-NOTIFICATION: New Song Added
  await autoNotifications.notifyNewSongAdded(
    songData.title,                    // "Amazing Grace"
    selectedPage?.name || 'Rehearsal', // "January Praise Night"
    result.id,                         // Song ID
    currentAdmin?.uid                  // Admin who added it
  );
  
  // Close modal, refresh...
}
```

**Result:** Users see: **"🎵 New Song Added: Amazing Grace"**

---

### **3. When Admin Updates Lyrics**

**File:** `src/app/admin/page.tsx`

**Find this code** (around line 800-820 in the song update section):
```typescript
// Check if lyrics changed
const lyricsChanged = existingSong.lyrics !== songData.lyrics;

result = await FirebaseDatabaseService.updateSong(editingSong.id, songData);

if (result.success) {
  console.log('✅ Song updated successfully');
  // ...
}
```

**Add this after the song is updated:**
```typescript
import { autoNotifications } from '@/lib/auto-notifications';

// Check if lyrics changed
const lyricsChanged = existingSong.lyrics !== songData.lyrics;

result = await FirebaseDatabaseService.updateSong(editingSong.id, songData);

if (result.success) {
  console.log('✅ Song updated successfully');
  
  // 🔔 AUTO-NOTIFICATION: Lyrics Updated
  if (lyricsChanged) {
    await autoNotifications.notifyLyricsUpdated(
      songData.title,        // "How Great Thou Art"
      editingSong.id,        // Song ID
      currentAdmin?.uid      // Admin who updated it
    );
  }
  
  // Close modal, refresh...
}
```

**Result:** Users see: **"📝 Lyrics Updated: How Great Thou Art"**

---

### **4. When Admin Adds Audio File**

**File:** `src/app/admin/page.tsx`

**Find where audio file is uploaded** (search for "audioFile"):
```typescript
// After audio file upload succeeds
if (audioUploadResult.success) {
  songData.audioFile = audioUploadResult.url;
  // ...
}
```

**Add this after audio is uploaded:**
```typescript
import { autoNotifications } from '@/lib/auto-notifications';

if (audioUploadResult.success) {
  songData.audioFile = audioUploadResult.url;
  
  // 🔔 AUTO-NOTIFICATION: Audio Added
  await autoNotifications.notifyAudioAdded(
    songData.title,        // "Victory Chant"
    editingSong.id,        // Song ID
    currentAdmin?.uid      // Admin who uploaded it
  );
}
```

**Result:** Users see: **"🎧 Audio Added: Victory Chant"**

---

### **5. When Admin Changes Song Details (Key, Tempo, etc.)**

**File:** `src/app/admin/page.tsx`

**Add this in the song update section:**
```typescript
import { autoNotifications } from '@/lib/auto-notifications';

// Detect what changed
const changes = [];
if (existingSong.key !== songData.key) {
  changes.push(`Key changed from ${existingSong.key} to ${songData.key}`);
}
if (existingSong.tempo !== songData.tempo) {
  changes.push(`Tempo changed to ${songData.tempo}`);
}
if (existingSong.leadSinger !== songData.leadSinger) {
  changes.push(`Lead singer: ${songData.leadSinger}`);
}

result = await FirebaseDatabaseService.updateSong(editingSong.id, songData);

if (result.success && changes.length > 0) {
  // 🔔 AUTO-NOTIFICATION: Song Details Changed
  await autoNotifications.notifySongDetailsChanged(
    songData.title,              // "Blessed Assurance"
    changes.join(', '),          // "Key changed from C to D, Tempo changed to 120"
    editingSong.id,              // Song ID
    currentAdmin?.uid            // Admin who changed it
  );
}
```

**Result:** Users see: **"⚙️ Song Updated: Blessed Assurance - Key changed from C to D"**

---

### **6. When Admin Deletes a Song**

**File:** `src/app/admin/page.tsx`

**Find the delete song function:**
```typescript
const handleDeleteSong = async (songId: string) => {
  // ...
  await FirebaseDatabaseService.deleteSong(songId);
  // ...
}
```

**Add this before deleting:**
```typescript
import { autoNotifications } from '@/lib/auto-notifications';

const handleDeleteSong = async (songId: string) => {
  // Get song details before deleting
  const song = allSongs.find(s => s.id === songId);
  
  if (song) {
    // 🔔 AUTO-NOTIFICATION: Song Deleted
    await autoNotifications.notifySongDeleted(
      song.title,                      // "Old Song Name"
      selectedPage?.name || 'Rehearsal', // "January Praise Night"
      currentAdmin?.uid                // Admin who deleted it
    );
  }
  
  await FirebaseDatabaseService.deleteSong(songId);
  // ...
}
```

**Result:** Users see: **"🗑️ Song Removed: Old Song Name"**

---

## 🎯 Complete Example: Adding a Song with Auto-Notification

**Before (No Notification):**
```typescript
const result = await FirebaseDatabaseService.createSong(songData);

if (result.success) {
  console.log('✅ Song created');
  setShowSongModal(false);
  refreshSongs();
}
```

**After (With Auto-Notification):**
```typescript
import { autoNotifications } from '@/lib/auto-notifications';

const result = await FirebaseDatabaseService.createSong(songData);

if (result.success && result.id) {
  console.log('✅ Song created');
  
  // 🔔 Send automatic notification to all users
  await autoNotifications.notifyNewSongAdded(
    songData.title,                    // Song title
    selectedPage?.name || 'Rehearsal', // Praise night name
    result.id,                         // Song ID for deep link
    currentAdmin?.uid                  // Who created it
  );
  
  setShowSongModal(false);
  refreshSongs();
}
```

---

## 📱 What Users Will See

### **Example Notifications:**

1. **New Praise Night:**
   ```
   🎉 New Praise Night: January Praise Night 2025
   A new praise night has been created for January 15, 2025. Check it out!
   [Tap to view]
   ```

2. **New Song:**
   ```
   🎵 New Song Added: Amazing Grace
   A new song has been added to January Praise Night. Start practicing!
   [Tap to view]
   ```

3. **Lyrics Updated:**
   ```
   📝 Lyrics Updated: How Great Thou Art
   The lyrics for "How Great Thou Art" have been updated. Check the latest version!
   [Tap to view]
   ```

4. **Audio Added:**
   ```
   🎧 Audio Added: Victory Chant
   Audio file is now available for "Victory Chant". Listen and practice!
   [Tap to view]
   ```

5. **Song Details Changed:**
   ```
   ⚙️ Song Updated: Blessed Assurance
   Changes: Key changed from C to D, Tempo changed to 120
   [Tap to view]
   ```

---

## ✅ Benefits

1. **No Manual Work** - Admin doesn't need to send notifications
2. **Specific Details** - Users know exactly what changed
3. **Real-Time** - Notifications appear instantly
4. **Deep Links** - Tap notification → Go directly to the song/page
5. **Professional** - Consistent, well-formatted messages

---

## 🚀 Next Steps

1. **Add import** at top of `src/app/admin/page.tsx`:
   ```typescript
   import { autoNotifications } from '@/lib/auto-notifications';
   ```

2. **Add auto-notifications** after each admin action (see examples above)

3. **Test it:**
   - Create a praise night → Check notification appears
   - Add a song → Check notification appears
   - Update lyrics → Check notification appears

4. **Users will see notifications instantly** on the notification page!

---

**No more "new features available"! Now it's "New Song Added: Amazing Grace"! 🎉**

