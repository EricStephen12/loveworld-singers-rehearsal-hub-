# Song Data Debugging Guide

## Issue Description
Some songs show "Unknown" for lead singer and missing data (bass guitarist, keyboardist, drummer), and audio doesn't play. Other songs work fine.

## Root Causes

### 1. **Missing `getSongById` Method**
The `useRealtimeSongData` hook calls `FirebaseDatabaseService.getSongById()` but this method doesn't exist in `firebase-database.ts`.

**Location:** `src/hooks/useRealtimeSongData.ts` line 28
```typescript
const freshSongData = await (FirebaseDatabaseService as any).getSongById(songId);
```

**Problem:** This returns `undefined`, causing the modal to fall back to stale/cached data.

### 2. **Data Fetching Flow Issues**
The SongDetailModal has multiple data sources that can conflict:
- `selectedSong` (passed as prop - might be stale)
- `freshSongData` (fetched on modal open)
- `realtimeSongData` (polled every 1 second)
- `currentSongData` (fallback)

**Location:** `src/components/SongDetailModal.tsx` lines 99-100
```typescript
const currentSongData = freshSongData || selectedSong;
```

### 3. **Field Name Inconsistencies**
Firebase songs might have inconsistent field names:
- `audioFile` vs `audiofile` vs `audio_url`
- `leadSinger` vs `lead_singer`
- `leadGuitarist` vs `lead_guitarist`
- `leadKeyboardist` vs `lead_keyboardist`

## Solutions

### Solution 1: Add Missing `getSongById` Method

Add this method to `src/lib/firebase-database.ts` after line 65:

```typescript
// Get a single song by ID
static async getSongById(songId: string) {
  try {
    console.log('🔍 Fetching song by ID:', songId);
    const docRef = doc(db, 'songs', songId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const songData = {
        id: docSnap.id,
        firebaseId: docSnap.id,
        ...data
      };
      
      console.log('✅ Song found:', songData.title);
      console.log('📊 Song fields:', Object.keys(songData));
      console.log('🎤 Lead singer:', songData.leadSinger);
      console.log('🎸 Lead guitarist:', songData.leadGuitarist);
      console.log('🎹 Lead keyboardist:', songData.leadKeyboardist);
      console.log('🥁 Drummer:', songData.drummer);
      console.log('🎵 Audio file:', songData.audioFile);
      
      return songData;
    } else {
      console.log('❌ Song not found with ID:', songId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting song by ID:', error);
    return null;
  }
}
```

### Solution 2: Normalize Field Names

Add a helper function to normalize field names in `src/lib/firebase-database.ts`:

```typescript
// Helper function to normalize song data field names
static normalizeSongData(data: any) {
  return {
    ...data,
    // Normalize audio field
    audioFile: data.audioFile || data.audiofile || data.audio_url || '',
    // Normalize personnel fields
    leadSinger: data.leadSinger || data.lead_singer || '',
    leadGuitarist: data.leadGuitarist || data.lead_guitarist || data.bassGuitarist || data.bass_guitarist || '',
    leadKeyboardist: data.leadKeyboardist || data.lead_keyboardist || data.keyboardist || '',
    drummer: data.drummer || '',
    conductor: data.conductor || '',
    writer: data.writer || '',
    // Normalize other fields
    praiseNightId: data.praiseNightId || data.praisenightid || data.praise_night_id || '',
    rehearsalCount: data.rehearsalCount || data.rehearsal_count || 1,
  };
}
```

Then update `getSongById` to use it:

```typescript
static async getSongById(songId: string) {
  try {
    const docRef = doc(db, 'songs', songId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const rawData = docSnap.data();
      const normalizedData = this.normalizeSongData(rawData);
      
      return {
        id: docSnap.id,
        firebaseId: docSnap.id,
        ...normalizedData
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting song by ID:', error);
    return null;
  }
}
```

### Solution 3: Update All Data Fetching Methods

Update these methods to normalize data:
1. `getSongs()` - line 41
2. `getCollection()` - line 170
3. `getDocument()` - line 204

Example for `getSongs()`:

```typescript
static async getSongs(praiseNightId: string) {
  try {
    const q = query(
      collection(db, 'songs'),
      where('praiseNightId', '==', praiseNightId)
    )

    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map(doc => {
      const rawData = doc.data();
      const normalizedData = this.normalizeSongData(rawData);
      
      return {
        id: doc.id,
        firebaseId: doc.id,
        ...normalizedData
      };
    })

    return results.sort((a, b) => {
      const indexA = (a as any).orderIndex || 0
      const indexB = (b as any).orderIndex || 0
      return indexA - indexB
    })
  } catch (error) {
    console.error('Error getting songs:', error)
    return []
  }
}
```

## Testing Steps

### 1. Check Browser Console
Open the song detail modal and check console for:
```
🔍 Fetching song by ID: [songId]
✅ Song found: [title]
📊 Song fields: [array of field names]
🎤 Lead singer: [value or undefined]
🎸 Lead guitarist: [value or undefined]
```

### 2. Check Firebase Console
1. Go to Firebase Console → Firestore Database
2. Open `songs` collection
3. Click on a song document
4. Check field names:
   - Is it `leadSinger` or `lead_singer`?
   - Is it `audioFile` or `audiofile`?
   - Is it `leadGuitarist` or `lead_guitarist`?

### 3. Test Different Songs
1. Open a song that works correctly
2. Note the console logs
3. Open a song that shows "Unknown"
4. Compare the console logs
5. Identify which fields are missing

## Quick Fix for Testing

Add this to the top of `SongDetailModal.tsx` to see what data is actually being received:

```typescript
useEffect(() => {
  if (currentSongData) {
    console.log('🎵 CURRENT SONG DATA DEBUG:', {
      id: currentSongData.id,
      title: currentSongData.title,
      leadSinger: currentSongData.leadSinger,
      leadGuitarist: currentSongData.leadGuitarist,
      leadKeyboardist: currentSongData.leadKeyboardist,
      drummer: currentSongData.drummer,
      audioFile: currentSongData.audioFile,
      allFields: Object.keys(currentSongData)
    });
  }
}, [currentSongData]);
```

## Expected Behavior After Fix

✅ All songs should display personnel information correctly
✅ Audio should play for all songs with audio files
✅ No "Unknown" values unless the field is actually empty in Firebase
✅ Consistent data display across all songs

## Files to Modify

1. **src/lib/firebase-database.ts**
   - Add `getSongById()` method
   - Add `normalizeSongData()` helper
   - Update `getSongs()`, `getCollection()`, `getDocument()`

2. **src/hooks/useRealtimeSongData.ts**
   - Remove `(FirebaseDatabaseService as any)` cast
   - Use proper typed method

3. **src/components/SongDetailModal.tsx** (optional)
   - Add debug logging
   - Ensure proper fallback logic

