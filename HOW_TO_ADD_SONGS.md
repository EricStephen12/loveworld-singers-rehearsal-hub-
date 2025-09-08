# How to Add More Songs to Praise Night 16

## Quick Add Method

To add more songs, simply edit the `songs` array in `src/app/praise-night/page.tsx` and add new song objects following this template:

```javascript
{
  sn: 69,                                    // Next song number
  section: "New Praise Songs",               // Section name
  status: "HEARD",                           // HEARD or UNHEARD
  title: "Your New Song Title",
  writer: "Writer Name",
  leadSinger: "Lead Singer Name",
  page: 140,                                 // Page number in book
  duration: "5:30",                          // Duration
  rehearsals: { count: 3, extra: 1 },       // Rehearsal count
  key: "C",                                  // Musical key
  remarks: [                                 // Pastor's remarks
    { date: "10/SEP/2023", text: "Your remark here" }
  ],
  audioLinks: {                              // Audio links by phase
    phases: [
      { 
        name: "Phase 1", 
        fullMix: "https://kingscloud.co/...", 
        soprano: "https://kingscloud.co/...", 
        tenor: "https://kingscloud.co/...", 
        alto: "https://kingscloud.co/...", 
        instrumentation: "https://kingscloud.co/..." 
      }
    ]
  },
  lyrics: {                                  // Lyrics
    start: "Starting lyrics...",
    continue: "Continuing lyrics..."
  },
  instrumentation: "Lead keyboard by A4, Drums by Tolu",  // Optional
  conductor: "Eli J"                        // Optional
}
```

## What Happens Automatically

Once you add a song to the array:
- ✅ It appears in the Table of Contents
- ✅ It's searchable by title, writer, lead singer, or section
- ✅ It's grouped by section and status
- ✅ It gets its own song card with tabs
- ✅ It's included in the sticky navigation

## Example from Your Document

Here's how to add "The Father of Glory" (Song #2):

```javascript
{
  sn: 2,
  section: "Previous Praise Songs Rehearsed But Not Ministered",
  status: "HEARD",
  title: "The Father of Glory",
  writer: "Vashawn",
  leadSinger: "Vashawn",
  page: 6,
  duration: "5:07",
  rehearsals: { count: 5, extra: 0 },
  key: "E",
  remarks: [
    { date: "25/AUG/2023", text: "Song tempo was increased a little bit, and song was redone a little faster." },
    { date: "06/SEP/2023", text: "It's very good! Soloist to pull out other forms of expressions." },
    { date: "08/SEP/2023", text: "That was very good! Very beautiful!" }
  ],
  audioLinks: {
    phases: [
      { name: "Phase 1", fullMix: "https://kingscloud.co/...", soprano: "https://kingscloud.co/...", tenor: "https://kingscloud.co/...", alto: "https://kingscloud.co/...", instrumentation: "https://kingscloud.co/..." },
      { name: "Phase 2", fullMix: "https://kingscloud.co/...", soprano: "https://kingscloud.co/...", tenor: "https://kingscloud.co/...", alto: "https://kingscloud.co/...", instrumentation: "https://kingscloud.co/..." }
    ]
  },
  lyrics: { 
    start: "My mind marvels at the extravagance of your love...", 
    continue: "Father of Glory, my life you've made so beautiful..." 
  }
}
```

## Tips

1. **Copy and Paste**: Copy an existing song and modify the details
2. **Keep Structure**: Maintain the exact field names and format
3. **Test**: Save the file and check if the song appears in your browser
4. **Backup**: Keep a copy of your original data before making changes

## Need Help?

The system is designed to be simple - just add songs to the array and everything else works automatically!





