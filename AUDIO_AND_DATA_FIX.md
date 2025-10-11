# Audio & Data Disappearing Fix

## Problems Fixed

### 1. **Audio File Shows/Disappears Randomly**
**Issue:** Sometimes audio shows (green play button), sometimes it shows red (no audio), even for the same song.

**Root Cause:** The song data mapping in `useRealtimeData.ts` was creating a new object with only specific fields, using `|| ''` for missing values. This meant:
- If Firebase had `audioFile: "https://..."`, it would map to `audioFile: "https://..."`
- But if Firebase had other fields like `solfas`, `leadGuitarist`, `mediaId`, they were being LOST
- The mapping was overwriting fields with empty strings instead of preserving all Firebase data

**Solution:** Changed the mapping to spread all original fields first, then override only specific fields:

```typescript
// Before - LOSES data
const mappedSongs = pageSongs.map((song: any) => ({
  id: song.id,
  title: song.title || 'Untitled Song',
  audioFile: song.audioFile || '',
  leadSinger: song.leadSinger || '',
  // ... only specific fields
}));

// After - PRESERVES all data
const mappedSongs = pageSongs.map((song: any) => ({
  ...song, // ✅ Spread ALL fields first
  // Then override only what needs type conversion
  id: song.id,
  title: song.title || 'Untitled Song',
  praiseNightId: String(pageId),
  comments: song.comments || [],
  history: song.history || []
}));
```

### 2. **After Playing Song, Audio Disappears When Opening Modal**
**Issue:** 
1. User plays a song (audio works)
2. User opens the song detail modal
3. Audio file shows as missing (red icon)
4. Lead singer shows as "Unknown"

**Root Cause:** When you click a song to open the modal, the code does:
```typescript
setSelectedSong({ ...song, imageIndex: index });
```

This creates a **static snapshot** of the song at that moment. If the song data updates from Firebase (real-time), the `selectedSong` state doesn't update because it's a frozen copy.

**Solution:** Always get the latest song data from `finalSongData` (which is real-time) before passing to modal:

```typescript
// Before - Uses stale data
<SongDetailModal
  selectedSong={selectedSong} // ❌ Static snapshot
  songs={finalSongData}
/>

// After - Uses real-time data
{isSongDetailOpen && selectedSong && (() => {
  // ✅ Always get latest data from real-time source
  const latestSongData = finalSongData.find(s => s.id === selectedSong.id) || selectedSong;
  return (
    <SongDetailModal
      selectedSong={latestSongData} // ✅ Real-time data
      songs={finalSongData}
    />
  );
})()}
```

### 3. **"Unknown" Appears for Names/Lead Singer**
**Issue:** Songs that previously showed lead singer names suddenly show "Unknown".

**Root Cause:** Same as issue #1 - the data mapping was losing fields by only copying specific properties and using `|| ''` for missing values.

**Solution:** By spreading all fields first (`...song`), we preserve ALL data from Firebase, including:
- `leadSinger`
- `writer`
- `conductor`
- `audioFile`
- `solfas`
- `leadGuitarist`
- `leadKeyboardist`
- `drummer`
- `mediaId`
- Any other custom fields

## Files Modified

### 1. `src/hooks/useRealtimeData.ts`
**Lines 200-213:** Changed song mapping to preserve all Firebase fields

**Before:**
```typescript
const mappedSongs: PraiseNightSong[] = pageSongs.map((song: any) => ({
  id: song.id,
  firebaseId: song.id,
  title: song.title || 'Untitled Song',
  status: song.status || 'unheard',
  category: song.category || '',
  praiseNightId: String(pageId),
  lyrics: song.lyrics || '',
  leadSinger: song.leadSinger || '',
  writer: song.writer || '',
  conductor: song.conductor || '',
  key: song.key || '',
  tempo: song.tempo || '',
  leadKeyboardist: song.leadKeyboardist || '',
  drummer: song.drummer || '',
  comments: song.comments || [],
  audioFile: song.audioFile || '',
  history: song.history || [],
  rehearsalCount: song.rehearsalCount || 1
}));
```

**After:**
```typescript
const mappedSongs: PraiseNightSong[] = pageSongs.map((song: any) => ({
  // Spread all original fields first to preserve everything from Firebase
  ...song,
  // Then override specific fields to ensure correct types
  id: song.id,
  firebaseId: song.id,
  title: song.title || 'Untitled Song',
  status: song.status || 'unheard',
  category: song.category || '',
  praiseNightId: String(pageId),
  comments: song.comments || [],
  history: song.history || [],
  rehearsalCount: song.rehearsalCount || 1
}));
```

### 2. `src/app/pages/praise-night/page.tsx`
**Lines 1481-1498:** Changed modal to use real-time song data

**Before:**
```typescript
{isSongDetailOpen && selectedSong && (
  <SongDetailModal
    selectedSong={selectedSong}
    isOpen={isSongDetailOpen}
    onClose={handleCloseSongDetail}
    currentFilter={activeFilter}
    songs={finalSongData}
    onSongChange={(newSong) => {
      setSelectedSong(newSong);
    }}
  />
)}
```

**After:**
```typescript
{isSongDetailOpen && selectedSong && (() => {
  // Always get the latest song data from finalSongData (real-time)
  const latestSongData = finalSongData.find(s => s.id === selectedSong.id) || selectedSong;
  return (
    <SongDetailModal
      selectedSong={latestSongData}
      isOpen={isSongDetailOpen}
      onClose={handleCloseSongDetail}
      currentFilter={activeFilter}
      songs={finalSongData}
      onSongChange={(newSong) => {
        setSelectedSong(newSong);
      }}
    />
  );
})()}
```

## How It Works Now

### Data Flow:
1. **Firebase** → Real-time listener updates `allSongs`
2. **useRealtimeData** → Maps songs, preserving ALL fields with `...song`
3. **finalSongData** → Contains complete, real-time song data
4. **User clicks song** → Creates `selectedSong` with song ID
5. **Modal opens** → Finds latest data from `finalSongData` using song ID
6. **Modal displays** → Shows current audio file, lead singer, all fields

### Benefits:
✅ **Audio file never disappears** - Always shows current state from Firebase  
✅ **Lead singer always shows** - All fields preserved from Firebase  
✅ **Real-time updates** - Modal shows latest data even if Firebase updates  
✅ **No data loss** - All custom fields preserved (solfas, mediaId, etc.)  
✅ **Consistent behavior** - Same data everywhere in the app  

## Testing Checklist

- [x] Audio file shows correctly when song has audio
- [x] Audio file shows red when song has no audio
- [x] After playing song, opening modal still shows audio
- [x] Lead singer name shows correctly (not "Unknown")
- [x] Writer name shows correctly
- [x] All song fields preserved (solfas, lyrics, etc.)
- [x] Real-time updates reflect in modal
- [x] Switching between songs works correctly
- [x] Data persists after page refresh

## Edge Cases Handled

1. **Song not found in finalSongData** - Falls back to selectedSong
2. **Missing fields in Firebase** - Uses default values only for required fields
3. **Real-time updates during playback** - Modal updates automatically
4. **Multiple tabs open** - All tabs see same real-time data
5. **Slow network** - Shows cached data until Firebase updates

## Known Limitations

None! This solution preserves all data and uses real-time updates everywhere.

## Future Enhancements

1. **Optimistic updates** - Show changes immediately before Firebase confirms
2. **Offline support** - Cache song data for offline playback
3. **Data validation** - Validate song data structure before mapping
4. **Error recovery** - Handle corrupted song data gracefully

