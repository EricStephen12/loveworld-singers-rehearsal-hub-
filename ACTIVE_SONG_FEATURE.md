# 🟣 ACTIVE SONG FEATURE

## 🎯 Purpose
Allow admin to mark a song as "ACTIVE" during live rehearsals so users know which song the choir leader is currently discussing.

---

## ✨ How It Works

### **Admin Side:**
1. Admin opens **Pages** section
2. Selects a praise night page
3. Sees list of songs in a table
4. **NEW COLUMN: "Active"** with toggle switch
5. Click toggle switch to make song ACTIVE
6. Toggle ON = Purple switch, users see blinking border
7. Toggle OFF = Gray switch, normal display

### **User Side:**
1. User opens praise night page
2. Sees list of songs
3. **ACTIVE song has:**
   - 🟣 **Purple blinking border** (ring-4 ring-purple-500)
   - **Pulsing glow effect** (shadow animation)
   - **Stands out from all other songs**
4. **CATEGORY badge also blinks:**
   - 🟣 **Purple badge with pulsing animation**
   - Shows which category the active song is in
   - Users know: "The active song is in THIS category!"
5. User knows: "THIS is the song we're talking about RIGHT NOW!"

---

## 🔧 Technical Implementation

### **1. Database Field Added:**
```typescript
// src/types/supabase.ts
export interface PraiseNightSong {
  // ... existing fields
  isActive?: boolean; // TRUE = Song is currently being discussed
}
```

### **2. Admin Panel Changes:**

**File:** `src/components/admin/PagesSection.tsx`
- Added "Active" column header
- Added toggle switch for each song
- Toggle shows purple when ON, gray when OFF

**File:** `src/app/admin/page.tsx`
- Added `handleToggleSongActive()` function
- Updates `isActive` field in Firebase
- Shows toast notification when toggled

### **3. User App Changes:**

**File:** `src/app/pages/praise-night/page.tsx`
- Song cards check `song.isActive`
- If TRUE: Apply `animate-pulse-ring` class
- If FALSE: Normal display

**File:** `src/app/globals.css`
- Added `@keyframes pulse-ring` animation
- Red glowing border that pulses every 2 seconds
- Smooth cubic-bezier easing

---

## 🎨 Visual Design

### **Active Song (isActive = true):**
```css
ring-4 ring-red-500 shadow-lg shadow-red-200/50 animate-pulse-ring
```
- **Border:** 4px red ring
- **Shadow:** Red glow
- **Animation:** Pulsing effect (2s loop)

### **Playing Song (currentSong):**
```css
ring-2 ring-purple-400 shadow-lg shadow-purple-200/30 bg-purple-200
```
- **Border:** 2px purple ring
- **Background:** Light purple
- **No animation:** Solid state

### **Normal Song:**
```css
ring-1 ring-black/5 bg-white
```
- **Border:** Thin gray ring
- **Background:** White
- **No animation:** Static

---

## 📊 Priority Order

When displaying songs, the visual priority is:
1. **🔴 ACTIVE (Admin marked)** - Red blinking border (highest priority)
2. **🟣 PLAYING (Audio playing)** - Purple solid background
3. **⚪ NORMAL** - White background

---

## 🚀 Usage Example

### **Scenario: Live Rehearsal**

**Admin:**
1. Opens admin panel
2. Goes to "Pages" → Selects "Sunday Service - Dec 15"
3. Sees song list with toggle switches
4. Choir leader says: "Let's discuss 'Amazing Grace'"
5. Admin clicks toggle switch for "Amazing Grace"
6. Switch turns purple ✅

**Users (All choir members):**
1. Open app on their phones
2. Go to "Sunday Service - Dec 15" page
3. See "Amazing Grace" with **RED BLINKING BORDER** 🔴
4. Everyone knows: "This is the song we're discussing!"
5. Choir leader finishes discussing
6. Admin turns OFF toggle
7. Red border disappears ✅

---

## 🔒 Firebase Security Rules

The `isActive` field is included in the `praise_night_songs` collection:

```javascript
// firestore.rules
match /praise_night_songs/{songId} {
  allow read: if true;  // Anyone can read
  allow write: if true;  // Open for admin panel
}
```

**Note:** Admin uses localStorage auth, so write access is open.

---

## 📝 Files Modified

1. ✅ `src/types/supabase.ts` - Added `isActive` field
2. ✅ `src/components/admin/PagesSection.tsx` - Added toggle switch UI
3. ✅ `src/app/admin/page.tsx` - Added toggle handler function
4. ✅ `src/app/pages/praise-night/page.tsx` - Added blinking border logic
5. ✅ `src/app/globals.css` - Added pulse animation

---

## 🎯 Benefits

1. **Clear Communication** - Everyone knows which song is being discussed
2. **Live Updates** - Changes reflect in real-time for all users
3. **Visual Clarity** - Red blinking border is impossible to miss
4. **Easy Control** - Simple toggle switch for admin
5. **No Confusion** - Only ONE song can be active at a time (recommended)

---

## 🔮 Future Enhancements (Optional)

1. **Auto-deactivate previous** - When activating a song, auto-deactivate others
2. **Category active** - Mark entire category as active (blinking category badge)
3. **Active timer** - Auto-deactivate after X minutes
4. **Active history** - Track which songs were active and when
5. **Mobile notification** - Push notification when song becomes active

---

## ✅ Testing Checklist

- [ ] Admin can toggle song active ON
- [ ] Admin can toggle song active OFF
- [ ] Users see red blinking border when active
- [ ] Border disappears when deactivated
- [ ] Animation is smooth and not annoying
- [ ] Works on mobile devices
- [ ] Works on desktop browsers
- [ ] Real-time updates work (Firebase listeners)
- [ ] Multiple users see the same active song
- [ ] Toast notification shows when toggled

---

**Status:** ✅ READY FOR TESTING

**Deploy:** Just deploy the updated code - no database migration needed!

