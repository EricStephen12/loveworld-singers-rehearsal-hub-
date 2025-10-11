# Firebase Database Fix - Add getSongById Method

## Problem
The `useRealtimeSongData` hook calls `FirebaseDatabaseService.getSongById()` but this method doesn't exist, causing songs to show "Unknown" for lead singer and missing data.

## Solution
Add the `getSongById` method to `src/lib/firebase-database.ts` after line 65 (after the `getSongs` method).

## Code to Add

Insert this code after the `getSongs` method (after line 65):

```typescript
  // Get a single song by ID - CRITICAL for SongDetailModal
  static async getSongById(songId: string) {
    try {
      console.log('🔍 [getSongById] Fetching song with ID:', songId);
      
      const docRef = doc(db, 'songs', songId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const songData = {
          id: docSnap.id,
          firebaseId: docSnap.id,
          ...data
        };
        
        console.log('✅ [getSongById] Song found:', songData.title);
        console.log('📊 [getSongById] All fields:', Object.keys(songData));
        console.log('🎤 [getSongById] Lead singer:', songData.leadSinger || 'MISSING');
        console.log('🎸 [getSongById] Lead guitarist:', songData.leadGuitarist || 'MISSING');
        console.log('🎹 [getSongById] Lead keyboardist:', songData.leadKeyboardist || 'MISSING');
        console.log('🥁 [getSongById] Drummer:', songData.drummer || 'MISSING');
        console.log('🎵 [getSongById] Audio file:', songData.audioFile || 'MISSING');
        
        return songData;
      } else {
        console.warn('❌ [getSongById] Song not found with ID:', songId);
        return null;
      }
    } catch (error) {
      console.error('❌ [getSongById] Error:', error);
      return null;
    }
  }
```

## Where to Insert

In `src/lib/firebase-database.ts`:

**BEFORE (lines 65-68):**
```typescript
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
```

**AFTER (with new method):**
```typescript
    }
  }

  // Get a single song by ID - CRITICAL for SongDetailModal
  static async getSongById(songId: string) {
    try {
      console.log('🔍 [getSongById] Fetching song with ID:', songId);
      
      const docRef = doc(db, 'songs', songId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const songData = {
          id: docSnap.id,
          firebaseId: docSnap.id,
          ...data
        };
        
        console.log('✅ [getSongById] Song found:', songData.title);
        console.log('📊 [getSongById] All fields:', Object.keys(songData));
        console.log('🎤 [getSongById] Lead singer:', songData.leadSinger || 'MISSING');
        console.log('🎸 [getSongById] Lead guitarist:', songData.leadGuitarist || 'MISSING');
        console.log('🎹 [getSongById] Lead keyboardist:', songData.leadKeyboardist || 'MISSING');
        console.log('🥁 [getSongById] Drummer:', songData.drummer || 'MISSING');
        console.log('🎵 [getSongById] Audio file:', songData.audioFile || 'MISSING');
        
        return songData;
      } else {
        console.warn('❌ [getSongById] Song not found with ID:', songId);
        return null;
      }
    } catch (error) {
      console.error('❌ [getSongById] Error:', error);
      return null;
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
```

## Testing After Fix

1. Open the app in browser
2. Open browser console (F12)
3. Click on any song to open the detail modal
4. Look for these console logs:
   ```
   🔍 [getSongById] Fetching song with ID: [id]
   ✅ [getSongById] Song found: [title]
   📊 [getSongById] All fields: [array]
   🎤 [getSongById] Lead singer: [value or MISSING]
   🎸 [getSongById] Lead guitarist: [value or MISSING]
   🎹 [getSongById] Lead keyboardist: [value or MISSING]
   🥁 [getSongById] Drummer: [value or MISSING]
   🎵 [getSongById] Audio file: [url or MISSING]
   ```

5. If you see "MISSING" for fields that should have data, check Firebase Console to see the actual field names in the database

## Next Steps If Still Not Working

If after adding this method you still see "Unknown" or missing data:

1. **Check Field Names in Firebase**
   - Go to Firebase Console
   - Open a song document
   - Check if fields are named:
     - `leadSinger` or `lead_singer`?
     - `leadGuitarist` or `lead_guitarist`?
     - `audioFile` or `audiofile` or `audio_url`?

2. **Add Field Name Normalization**
   - If field names are inconsistent, we'll need to add a normalization function
   - See `SONG_DATA_DEBUG_GUIDE.md` for the normalization code

3. **Check Data in Firebase**
   - Some songs might genuinely not have this data
   - Check if the working songs have different field names than broken ones

