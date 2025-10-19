# 🚀 Quick Reference Guide - LoveWorld Singers Rehearsal Hub

## 📍 Where to Find Things

### Authentication
```
📁 src/app/auth/page.tsx          - Login/signup page
📁 src/lib/firebase-auth.ts       - Auth service
📁 src/contexts/AuthContext.tsx   - Auth state management
```

### Praise Nights (Events)
```
📁 src/app/pages/praise-night/page.tsx  - Praise night page
📁 src/lib/firebase-database.ts         - Database operations
📁 Firebase Collection: praise_nights   - Event data
```

### Songs
```
📁 src/lib/praise-night-songs-service.ts  - Song CRUD operations
📁 src/components/EditSongModal.tsx       - Song editor
📁 Firebase Collection: praise_night_songs - Song data
```

### Audio Player
```
📁 src/contexts/AudioContext.tsx    - Global audio state
📁 src/components/MiniPlayer.tsx    - Mini player UI
📁 src/components/GlobalMiniPlayer.tsx - Global player wrapper
```

### Admin Panel
```
📁 src/app/admin/page.tsx                - Main admin page
📁 src/components/admin/PagesSection.tsx - Pages management
📁 src/components/admin/MediaSection.tsx - Media library
```

### Audio Lab
```
📁 src/app/audio-lab/App.js           - Main audio lab app
📁 src/app/audio-lab/PracticePage.js  - Practice mode
📁 src/app/audio-lab/CollabPage.js    - Collaboration
```

### Chat
```
📁 src/app/pages/chat/page.tsx        - Direct chat
📁 src/app/pages/chat-group/page.tsx  - Group chat
📁 Supabase Tables: chat_groups, chat_messages
```

### Notifications
```
📁 src/app/pages/notifications/page.tsx       - Notifications page
📁 src/components/RealtimeNotifications.tsx   - Real-time listener
📁 Supabase Table: notifications
```

---

## 🔧 Common Tasks

### 1. Add a New Song
```typescript
// Location: src/lib/praise-night-songs-service.ts
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';

const result = await PraiseNightSongsService.createSong({
  title: 'Amazing Grace',
  praiseNightId: 'praise-night-id',
  status: 'unheard',
  category: 'Worship',
  leadSinger: 'John Doe',
  writer: 'John Newton',
  audioFile: 'https://cloudinary.com/...',
  // ... other fields
});
```

### 2. Update Song Status
```typescript
const result = await PraiseNightSongsService.updateSongStatus(
  'song-id',
  'heard'
);
```

### 3. Play a Song
```typescript
// Location: Any component
import { useAudio } from '@/contexts/AudioContext';

const { setCurrentSong } = useAudio();

// Play song with auto-play
setCurrentSong(song, true);
```

### 4. Create a Praise Night
```typescript
// Location: src/lib/firebase-database.ts
import { FirebaseDatabaseService } from '@/lib/firebase-database';

const result = await FirebaseDatabaseService.addPraiseNight({
  name: 'Sunday Service',
  date: '2025-10-20',
  location: 'Main Auditorium',
  category: 'upcoming',
  countdown: { days: 5, hours: 0, minutes: 0, seconds: 0 },
  bannerImage: 'https://cloudinary.com/...',
});
```

### 5. Send a Notification
```typescript
// Location: Admin panel
// Use the Notifications section in admin panel
// Or programmatically:
import { supabase } from '@/lib/supabase-client';

const { data, error } = await supabase
  .from('notifications')
  .insert({
    title: 'Rehearsal Reminder',
    message: 'Rehearsal starts in 1 hour',
    type: 'info',
    category: 'rehearsal',
    priority: 'high',
    target_audience: 'all',
  });
```

### 6. Upload Audio File
```typescript
// Location: src/components/MediaManager.tsx
// Use the Media section in admin panel
// Files are uploaded to Cloudinary
// URL is stored in song.audioFile field
```

---

## 🗄️ Database Quick Reference

### Firebase Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `praise_nights` | Events/Pages | `id`, `name`, `date`, `location`, `category`, `countdown`, `bannerImage` |
| `praise_night_songs` | Songs (ACTIVE) | `id`, `title`, `praiseNightId`, `status`, `category`, `audioFile`, `leadSinger` |
| `profiles` | User profiles | `id`, `email`, `displayName`, `photoURL`, `profile_completed` |
| `categories` | Song categories | `id`, `name`, `description`, `icon`, `color` |
| `notifications` | Notifications | `id`, `title`, `message`, `type`, `category`, `priority` |

### Supabase Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `songs` | Relational song data | Mirrors Firebase `praise_night_songs` |
| `chat_groups` | Chat groups | `id`, `group_name`, `name`, `description` |
| `chat_messages` | Chat messages | `id`, `group_id`, `sender_id`, `content`, `message_type` |
| `notifications` | Notifications | `id`, `title`, `message`, `type`, `category`, `priority` |

---

## 🎨 UI Components

### Reusable Components
```
📁 src/components/ui/          - shadcn/ui components
   ├── button.tsx              - Button component
   ├── input.tsx               - Input component
   ├── card.tsx                - Card component
   ├── tabs.tsx                - Tabs component
   └── ...
```

### Custom Components
```
📁 src/components/
   ├── ScreenHeader.tsx        - Page header with menu
   ├── MiniPlayer.tsx          - Audio mini player
   ├── EditSongModal.tsx       - Song editor modal
   ├── MediaManager.tsx        - Media library
   ├── Toast.tsx               - Toast notifications
   └── ...
```

---

## 🔑 Environment Variables

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Cloudinary (if needed)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
NEXT_PUBLIC_CLOUDINARY_API_SECRET=
```

---

## 🚨 Common Issues & Solutions

### 1. Song Not Playing
**Problem**: Audio doesn't play when clicking play button  
**Solution**:
- Check if `audioFile` field has a valid URL
- Check browser console for CORS errors
- Verify Cloudinary URL is accessible
- Check AudioContext state in React DevTools

### 2. Firebase Permission Denied
**Problem**: Can't read/write to Firebase  
**Solution**:
- Check `firestore.rules` file
- Verify user is authenticated
- Check collection name is correct

### 3. Supabase RLS Error
**Problem**: Row-level security blocking access  
**Solution**:
- Check Supabase RLS policies
- Verify user is authenticated
- Check user permissions

### 4. Service Worker Not Updating
**Problem**: Changes not reflecting after deployment  
**Solution**:
- Clear browser cache
- Unregister service worker
- Hard refresh (Ctrl+Shift+R)
- Check service worker version

### 5. Push Notifications Not Working
**Problem**: Notifications not appearing  
**Solution**:
- Check notification permission granted
- Verify service worker registered
- Check browser console for errors
- Test on HTTPS (required for push notifications)

---

## 📊 Data Flow Examples

### Playing a Song
```
User clicks play button
  ↓
Component calls setCurrentSong(song, true)
  ↓
AudioContext updates state
  ↓
Audio element loads song.audioFile
  ↓
Audio starts playing
  ↓
MiniPlayer appears
  ↓
User can navigate while playing
```

### Creating a Song (Admin)
```
Admin clicks "Add Song"
  ↓
EditSongModal opens
  ↓
Admin fills in song details
  ↓
Admin uploads audio file to Cloudinary
  ↓
Admin clicks "Save"
  ↓
PraiseNightSongsService.createSong() called
  ↓
Song saved to Firebase praise_night_songs
  ↓
Real-time listener updates UI
  ↓
Toast notification shows success
```

### Real-time Notification
```
Admin sends notification
  ↓
Notification saved to Supabase
  ↓
Supabase real-time subscription triggers
  ↓
RealtimeNotifications component receives update
  ↓
NotificationBanner appears
  ↓
Push notification sent (if permission granted)
  ↓
User clicks notification
  ↓
App opens to relevant page
```

---

## 🎯 Best Practices

### 1. State Management
- Use `AudioContext` for global audio state
- Use `AuthContext` for authentication state
- Use local state for component-specific data
- Avoid prop drilling - use contexts

### 2. Database Operations
- Always use service classes (e.g., `PraiseNightSongsService`)
- Handle errors gracefully
- Show loading states
- Use optimistic UI updates

### 3. Performance
- Lazy load components when possible
- Use React.memo for expensive components
- Optimize images (use next/image)
- Cache API responses

### 4. Security
- Never expose API keys in client code
- Use Firebase security rules
- Implement Supabase RLS policies
- Validate user input

### 5. Code Organization
- Keep components small and focused
- Use TypeScript for type safety
- Follow naming conventions
- Document complex logic

---

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

---

**Last Updated**: 2025-10-16

