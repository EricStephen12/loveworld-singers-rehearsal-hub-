# 📚 LoveWorld Singers Rehearsal Hub - Codebase Overview

## 🎯 Project Summary

**LoveWorld Singers Rehearsal Hub (LWSRH)** is a Progressive Web App (PWA) designed for managing praise and worship events for LoveWorld Singers. It provides comprehensive tools for organizing rehearsals, managing songs, tracking progress, and facilitating communication among choir members.

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI, Lucide Icons
- **Rich Text Editors**: TipTap, EditorJS

### Backend & Database
- **Firebase**: Authentication, Firestore Database, Storage
- **Supabase**: Relational data (songs, praise nights, chat, notifications)
- **Authentication**: Firebase Auth (email/password, Google OAuth)

### PWA Features
- **Service Worker**: Custom service workers for offline support
- **Caching**: Workbox for asset caching
- **Push Notifications**: Real-time notifications system
- **Offline Support**: Full offline functionality

---

## 📁 Project Structure

```
loveworld-singers-rehearsal-hub/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin panel
│   │   ├── audio-lab/         # Audio practice & collaboration
│   │   ├── auth/              # Authentication pages
│   │   ├── home/              # Home page
│   │   ├── pages/             # Feature pages
│   │   │   ├── praise-night/  # Praise night event pages
│   │   │   ├── chat/          # Chat functionality
│   │   │   ├── chat-group/    # Group chat
│   │   │   ├── notifications/ # Notifications
│   │   │   ├── profile/       # User profile
│   │   │   └── support/       # Admin support
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── audio-lab/        # Audio lab components
│   │   └── ui/               # UI components (shadcn/ui)
│   ├── contexts/             # React Context providers
│   │   ├── AudioContext.tsx  # Global audio player state
│   │   └── AuthContext.tsx   # Authentication state
│   ├── lib/                  # Core libraries & configurations
│   │   ├── firebase-setup.ts           # Firebase initialization
│   │   ├── firebase-auth.ts            # Firebase auth service
│   │   ├── firebase-database.ts        # Firebase database service
│   │   ├── supabase.ts                 # Supabase client
│   │   ├── supabase-client.ts          # Supabase configuration
│   │   └── praise-night-songs-service.ts # Song management service
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   │   └── supabase.ts       # Database types
│   ├── utils/                # Utility functions
│   └── middleware.ts         # Next.js middleware
├── public/                   # Static assets
│   ├── images/              # Images
│   ├── audio/               # Audio files
│   ├── manifest.json        # PWA manifest
│   └── sw-*.js              # Service workers
├── supabase/
│   └── migrations/          # Database migrations
└── firestore.rules          # Firebase security rules
```

---

## 🔑 Key Features

### 1. **Authentication System**
- **Location**: `src/app/auth/`, `src/lib/firebase-auth.ts`
- **Features**:
  - Email/password authentication
  - Google OAuth
  - Session persistence (localStorage)
  - Profile management
  - Auto-redirect based on auth state

### 2. **Praise Night Management**
- **Location**: `src/app/pages/praise-night/`, `src/app/admin/`
- **Features**:
  - Create/edit/delete praise night events
  - Countdown timers
  - Banner images (Cloudinary integration)
  - Category organization
  - Song listings per event

### 3. **Song Management**
- **Location**: `src/lib/praise-night-songs-service.ts`, `src/components/EditSongModal.tsx`
- **Database**: Firebase `praise_night_songs` collection
- **Features**:
  - CRUD operations for songs
  - Song metadata (title, lead singer, writer, conductor, key, tempo, etc.)
  - Audio file uploads (Cloudinary)
  - Lyrics & solfas (rich text)
  - Status tracking (heard/unheard)
  - Comments & history
  - Rehearsal count tracking

### 4. **Audio Player System**
- **Location**: `src/contexts/AudioContext.tsx`, `src/components/MiniPlayer.tsx`
- **Features**:
  - Global audio player context
  - Mini player (floating)
  - Full player modal
  - Play/pause/stop controls
  - Progress tracking
  - Auto-play support
  - Repeat & shuffle modes

### 5. **Audio Lab (Practice & Collaboration)**
- **Location**: `src/app/audio-lab/`
- **Features**:
  - Song library
  - Practice modes (karaoke, pitch, warmup, strength)
  - Collaboration tools
  - Live session support
  - Music production view
  - Playlist management
  - Track categories (vocal lead, harmony, drums)

### 6. **Admin Panel**
- **Location**: `src/app/admin/`
- **Features**:
  - Pages management (praise nights)
  - Categories management
  - Members management
  - Media library (Cloudinary)
  - Notifications system
  - Real-time data updates

### 7. **Chat System**
- **Location**: `src/app/pages/chat/`, `src/app/pages/chat-group/`
- **Database**: Supabase `chat_groups`, `chat_messages`, `chat_group_members`
- **Features**:
  - Group chat
  - Direct messaging
  - Message types (text, image, audio, video, file)
  - Reply functionality
  - Read status tracking
  - Real-time updates

### 8. **Notifications System**
- **Location**: `src/app/pages/notifications/`, `src/components/RealtimeNotifications.tsx`
- **Database**: Supabase `notifications` table
- **Features**:
  - Push notifications
  - Real-time notifications
  - Notification categories (rehearsal, announcement, reminder, system, admin)
  - Priority levels (low, medium, high)
  - Target audience (all, group, individual)

### 9. **Offline Support**
- **Location**: `public/sw-*.js`, `src/components/OfflineIndicator.tsx`
- **Features**:
  - Service worker caching
  - Offline indicator
  - Cache management
  - Background sync

---

## 🗄️ Database Schema

### Firebase Collections

#### `praise_nights` (Events/Pages)
- `id` - Firebase auto-generated ID
- `name` - Event name
- `date` - Event date
- `location` - Event location
- `category` - Category (unassigned, upcoming, past, etc.)
- `countdown` - Countdown timer object
- `bannerImage` - Banner image URL
- `createdAt`, `updatedAt` - Timestamps

#### `praise_night_songs` (Songs) ✅ ACTIVE
- `id` - Firebase auto-generated ID
- `title` - Song title
- `praiseNightId` - Reference to praise night
- `status` - 'heard' or 'unheard'
- `category` - Song category
- `leadSinger`, `writer`, `conductor` - Personnel
- `key`, `tempo` - Music details
- `leadKeyboardist`, `leadGuitarist`, `drummer` - Musicians
- `lyrics`, `solfas` - Song content (HTML)
- `audioFile` - Audio URL (Cloudinary)
- `mediaId` - Reference to media table
- `rehearsalCount` - Manual rehearsal count
- `comments` - Array of comments
- `history` - Array of history entries
- `createdAt`, `updatedAt` - Timestamps

#### `profiles` (User Profiles)
- `id` - User ID (Firebase Auth UID)
- `email` - User email
- `displayName` - Display name
- `photoURL` - Profile photo URL
- `profile_completed` - Boolean
- `createdAt`, `updatedAt` - Timestamps

#### Other Collections
- `categories` - Song categories
- `admin_messages` - Admin messages
- `comments` - Comments
- `groups` - Social groups
- `group_posts` - Group posts
- `notifications` - Notifications
- `conversations` - Direct messages
- `messages` - Chat messages
- `attendance` - Attendance tracking
- `achievements` - User achievements
- `cloudinary_media` - Media files
- `voice_messages` - Voice messages
- `webrtc_sessions` - WebRTC sessions

### Supabase Tables

#### `songs` (Relational song data)
- Mirrors Firebase `praise_night_songs` structure
- Used for admin panel and relational queries

#### `chat_groups`
- `id`, `group_name`, `name`, `description`
- `created_at`, `updated_at`

#### `chat_messages`
- `id`, `group_id`, `sender_id`, `content`
- `message_type`, `reply_to`, `is_edited`
- `created_at`, `updated_at`

#### `notifications`
- `id`, `title`, `message`, `type`, `category`
- `priority`, `sender_id`, `target_audience`
- `created_at`, `read_at`

---

## 🔐 Security

### Firebase Security Rules
- **Location**: `firestore.rules`
- **Strategy**: Open for admin panel (uses localStorage), authenticated for users
- **Collections**:
  - `profiles` - Read: authenticated, Write: open
  - `praise_nights` - Read/Write: open
  - `praise_night_songs` - Read/Write: open (current system)
  - `songs` - Read/Write: open (deprecated)
  - Social collections - Read/Write: authenticated

### Supabase Security
- Row-level security (RLS) policies
- User-based access control
- Admin-only operations

---

## 🚀 Performance Optimizations

1. **Ultra-Fast Loading**
   - Service worker caching
   - Lazy loading components
   - Image optimization
   - Code splitting

2. **Real-time Updates**
   - Firebase real-time listeners
   - Supabase real-time subscriptions
   - Optimistic UI updates

3. **Offline Support**
   - Service worker caching
   - IndexedDB for offline data
   - Background sync

4. **PWA Features**
   - Install prompt
   - Splash screen
   - App-like experience
   - Push notifications

---

## 📱 Key User Flows

### 1. User Authentication
1. Splash screen → Auth page
2. Login/signup with email or Google
3. Profile completion (if needed)
4. Redirect to home page

### 2. Viewing Praise Nights
1. Home page shows all praise nights
2. Click on a praise night
3. View songs, countdown, banner
4. Play songs, add comments

### 3. Admin Song Management
1. Admin panel → Pages section
2. Select a page
3. Add/edit/delete songs
4. Upload audio files
5. Set song metadata

### 4. Audio Playback
1. Click play on any song
2. Mini player appears
3. Global audio context manages playback
4. Can navigate while playing

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run dev:fast         # Fast dev mode on port 3000

# Build
npm run build            # Production build
npm run build:production # Production build with optimizations

# Start
npm start                # Start production server

# Utilities
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run clear-cache      # Clear build cache
```

---

## 📝 Important Notes

1. **Data Management**:
   - Firebase for authentication and user management
   - Supabase for admin panel and relational data
   - Songs stored in Firebase `praise_night_songs` collection

2. **ID System**:
   - Firebase auto-generates IDs for all documents
   - `id` field = Firebase document ID
   - `praiseNightId` field links songs to praise nights

3. **Audio Files**:
   - Stored on Cloudinary
   - URLs stored in `audioFile` field
   - Media metadata in `mediaId` field

4. **Offline Support**:
   - Service workers cache assets
   - Firebase persistence enabled
   - Offline indicator shows connection status

5. **Push Notifications**:
   - Service worker handles notifications
   - Real-time listener for new notifications
   - Permission requested on first visit

---

## 🔗 Key Files to Know

- `src/app/layout.tsx` - Root layout with providers
- `src/contexts/AudioContext.tsx` - Global audio player
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/lib/firebase-database.ts` - Firebase database operations
- `src/lib/praise-night-songs-service.ts` - Song CRUD operations
- `src/app/admin/page.tsx` - Admin panel
- `src/app/pages/praise-night/page.tsx` - Praise night page
- `firestore.rules` - Firebase security rules

---

**Last Updated**: 2025-10-16
**Version**: 3.0.0

