# Song Data Issue - Summary & Fix

## 🔴 Problem
When opening song details modal:
- Some songs show "Unknown" for lead singer
- Bass guitarist, keyboardist, drummer fields are empty
- Audio doesn't play (play button turns red)
- **BUT** other songs work perfectly fine

## 🔍 Root Cause
The `useRealtimeSongData` hook (used in SongDetailModal) calls:
```typescript
const freshSongData = await (FirebaseDatabaseService as any).getSongById(songId);
```

**BUT** the `getSongById` method **DOES NOT EXIST** in `FirebaseDatabaseService`!

This means:
- The method returns `undefined`
- The modal falls back to stale/cached data
- If the cached data is incomplete or old, you see "Unknown"

## 📍 Affected Files

### 1. `src/lib/firebase-database.ts`
**Missing:** `getSongById()` method
**Line:** Should be added after line 65

### 2. `src/hooks/useRealtimeSongData.ts`
**Line 28:** Calls non-existent method
```typescript
const freshSongData = await (FirebaseDatabaseService as any).getSongById(songId);
```

### 3. `src/components/SongDetailModal.tsx`
**Lines 647, 658, 659, 662, 663:** Display the data
```typescript
<span>LEAD SINGER:</span> {(realtimeSongData || currentSongData)?.leadSinger ? ... : 'Unknown'}
<span>KEYBOARDIST:</span> {(realtimeSongData || currentSongData)?.leadKeyboardist || ''}
<span>BASS GUITARIST:</span> {(realtimeSongData || currentSongData)?.leadGuitarist || ''}
<span>DRUMMER:</span> {(realtimeSongData || currentSongData)?.drummer || ''}
```

## ✅ Solution

### Step 1: Add `getSongById` Method

Add this to `src/lib/firebase-database.ts` after line 65:

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
        console.log('🎤 Lead singer:', songData.leadSinger);
        console.log('🎸 Lead guitarist:', songData.leadGuitarist);
        console.log('🎹 Lead keyboardist:', songData.leadKeyboardist);
        console.log('🥁 Drummer:', songData.drummer);
        console.log('🎵 Audio file:', songData.audioFile);
        
        return songData;
      } else {
        console.warn('❌ Song not found with ID:', songId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting song by ID:', error);
      return null;
    }
  }
```

### Step 2: Check Firebase Field Names

Open Firebase Console and check if fields are named:
- `leadSinger` or `lead_singer`?
- `leadGuitarist` or `lead_guitarist`?
- `leadKeyboardist` or `lead_keyboardist`?
- `audioFile` or `audiofile` or `audio_url`?

### Step 3: Add Field Normalization (if needed)

If field names are inconsistent, add this helper method:

```typescript
  // Normalize song data field names
  private static normalizeSongData(data: any) {
    return {
      ...data,
      audioFile: data.audioFile || data.audiofile || data.audio_url || '',
      leadSinger: data.leadSinger || data.lead_singer || '',
      leadGuitarist: data.leadGuitarist || data.lead_guitarist || '',
      leadKeyboardist: data.leadKeyboardist || data.lead_keyboardist || '',
      drummer: data.drummer || '',
      conductor: data.conductor || '',
      writer: data.writer || '',
    };
  }
```

Then use it in `getSongById`:

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
      console.error('Error getting song by ID:', error);
      return null;
    }
  }
```

## 🧪 Testing

1. Add the `getSongById` method
2. Restart your dev server: `npm run dev`
3. Open a song that was showing "Unknown"
4. Check browser console for logs:
   ```
   🔍 Fetching song by ID: [id]
   ✅ Song found: [title]
   🎤 Lead singer: [value]
   ```
5. The data should now display correctly

## 📊 Why Some Songs Work and Others Don't

**Possible reasons:**
1. **Cached data** - Songs that work might have been loaded recently with correct data
2. **Different data sources** - Working songs might be using `selectedSong` prop instead of `realtimeSongData`
3. **Timing** - The `useRealtimeSongData` hook polls every 1 second, so data might appear/disappear

## 🎯 Expected Result After Fix

✅ All songs display personnel data correctly
✅ Audio plays for all songs with audio files  
✅ No more "Unknown" values (unless field is actually empty in Firebase)
✅ Consistent behavior across all songs

## 📝 Additional Notes

- The `useRealtimeSongData` hook polls Firebase every 1 second
- This is inefficient and should use Firebase real-time listeners instead
- But for now, adding `getSongById` will fix the immediate issue

