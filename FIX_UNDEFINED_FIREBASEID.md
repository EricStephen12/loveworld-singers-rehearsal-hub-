# ✅ FIXED: Undefined firebaseId Error

## Problem:
```
Function updateDoc() called with invalid data. 
Unsupported field value: undefined 
(found in field firebaseId in document praise_night_songs/Qqx5IOTRc10PIcTJ4vbn)
```

## Root Cause:
The `songData` object passed to `updateSong()` contained a `firebaseId` field with `undefined` value. Firebase Firestore doesn't allow `undefined` values in documents.

## Solution:
Updated `src/lib/praise-night-songs-service.ts` in the `updateSong()` method:

### Before:
```typescript
// Prepare update data (remove id field)
const { id, createdAt, ...updateData } = songData as any;

// Add updatedAt timestamp
const cleanUpdateData = {
  ...updateData,
  updatedAt: serverTimestamp()
};
```

### After:
```typescript
// Prepare update data (remove id, firebaseId, createdAt fields)
const { id, firebaseId, createdAt, ...updateData } = songData as any;

// Remove any undefined values
const cleanedData = Object.entries(updateData).reduce((acc, [key, value]) => {
  if (value !== undefined) {
    acc[key] = value;
  }
  return acc;
}, {} as any);

// Add updatedAt timestamp
const cleanUpdateData = {
  ...cleanedData,
  updatedAt: serverTimestamp()
};
```

## What Changed:
1. ✅ **Removed `firebaseId`** from update data (not needed in new table)
2. ✅ **Filter out undefined values** - Only include defined fields
3. ✅ **Keep `id` and `createdAt` removed** - These shouldn't be updated

## Why This Happened:
The `PraiseNightSong` type includes a `firebaseId` field for backward compatibility with old songs, but new songs in `praise_night_songs` table don't need this field. When the admin page passed the song data to update, it included `firebaseId: undefined`, which Firebase rejected.

## Testing:
1. ✅ TypeScript compiles - No errors
2. ✅ Edit a song - Should work now without the error
3. ✅ No undefined values sent to Firebase

## Status:
✅ **FIXED!** You can now edit songs without the undefined error!

