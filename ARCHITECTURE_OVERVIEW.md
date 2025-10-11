# Architecture Overview - LoveWorld Singers Rehearsal Hub

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │    Mobile    │  │   Desktop    │          │
│  │     PWA      │  │     PWA      │  │     PWA      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js 15 App Router                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │   Pages    │  │ Components │  │   Layouts  │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Hooks     │  │   Contexts   │  │   Services   │          │
│  │  (25+ hooks) │  │  (3 contexts)│  │  (30+ svcs)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Next.js API │  │   Firebase   │  │   Supabase   │          │
│  │    Routes    │  │   Functions  │  │   Edge Fns   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Firebase   │  │   Supabase   │  │  Cloudinary  │          │
│  │  Firestore   │  │  PostgreSQL  │  │    Storage   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### Read Flow (User Views Song)

```
User Request
    ↓
Next.js Page (praise-night/page.tsx)
    ↓
Custom Hook (useRealtimeSongData)
    ↓
Firebase Service (firebase-database.ts)
    ↓
Firebase Firestore (songs collection)
    ↓
Real-time Listener
    ↓
State Update (React State)
    ↓
Component Re-render
    ↓
User Sees Data
```

### Write Flow (Admin Edits Song)

```
User Action (Edit Button Click)
    ↓
Component (EditSongModal)
    ↓
Form Submission
    ↓
Service Function (updateSong)
    ↓
Firebase Firestore (update document)
    ↓
Real-time Listener Triggers
    ↓
All Connected Clients Update
    ↓
UI Updates Automatically
```

### Media Upload Flow

```
User Selects File
    ↓
MediaManager Component
    ↓
Cloudinary Service (cloudinary.ts)
    ↓
API Route (/api/cloudinary/upload)
    ↓
Cloudinary CDN
    ↓
URL Returned
    ↓
Save URL to Firebase
    ↓
Display in UI
```

---

## 🎨 Component Architecture

### Component Hierarchy

```
App Layout (layout.tsx)
├── Navigation
│   ├── GlobalSearch
│   └── NotificationBanner
├── Page Content
│   ├── Praise Night Page
│   │   ├── SongList
│   │   │   ├── SongCard
│   │   │   └── SongDetailModal
│   │   └── AudioPlayer
│   │       └── MiniPlayer
│   ├── Admin Page
│   │   ├── AdminSidebar
│   │   ├── PagesSection
│   │   ├── MediaSection
│   │   │   └── MediaManager
│   │   └── MembersSection
│   └── Audio Lab Page
│       ├── SongCard
│       └── BottomSheet
│           └── AudioPlayer
└── Global Components
    ├── GlobalMiniPlayer
    ├── AuthGuard
    ├── PWAInstall
    └── ServiceWorker
```

### Component Communication

```
Parent Component
    ↓ (props)
Child Component
    ↑ (callbacks)
Parent Component
    ↓ (context)
Deeply Nested Component
    ↑ (context update)
Context Provider
    → (broadcast)
All Subscribed Components
```

---

## 🗄️ Database Architecture

### Firebase Collections Structure

```
Firebase Firestore
├── praise_nights/
│   └── {praiseNightId}
│       ├── title
│       ├── date
│       └── status
├── songs/
│   └── {songId}
│       ├── praiseNightId ──→ references praise_nights
│       ├── title
│       ├── lyrics
│       ├── audioLinks
│       └── metadata
├── users/
│   └── {userId}
│       ├── profile
│       ├── preferences
│       └── subscription
├── groups/
│   └── {groupId}
│       ├── members[] ──→ references users
│       └── settings
├── messages/
│   └── {messageId}
│       ├── groupId ──→ references groups
│       ├── senderId ──→ references users
│       └── content
├── notifications/
│   └── {notificationId}
│       ├── userId ──→ references users
│       └── content
├── support_tickets/
│   └── {ticketId}
│       ├── userId ──→ references users
│       └── details
└── media/
    └── {mediaId}
        ├── url
        └── metadata
```

### Data Relationships

```
praise_nights (1) ──────< (many) songs
users (1) ──────< (many) messages
groups (1) ──────< (many) messages
users (many) ────< (many) groups
users (1) ──────< (many) notifications
users (1) ──────< (many) support_tickets
```

---

## 🔐 Authentication Flow

```
User Opens App
    ↓
AuthGuard Component
    ↓
Check Firebase Auth State
    ↓
┌─────────────┬─────────────┐
│ Authenticated│ Not Auth   │
└─────────────┴─────────────┘
    ↓               ↓
Load User      Show AuthScreen
Profile            ↓
    ↓          User Logs In
Set Auth           ↓
Context        Firebase Auth
    ↓               ↓
Allow Access   Create Session
    ↓               ↓
App Ready      Redirect to App
```

---

## 🎵 Audio Playback Architecture

```
User Clicks Play
    ↓
AudioContext (Global State)
    ↓
Set Current Track
    ↓
GlobalMiniPlayer Component
    ↓
HTML5 Audio Element
    ↓
Stream from Cloudinary CDN
    ↓
Playback Controls
    ├── Play/Pause
    ├── Seek
    ├── Volume
    └── Track Selection
```

---

## 🔍 Search Architecture

### Global Search Flow

```
User Types in Search
    ↓
useGlobalSearch Hook
    ↓
Debounce Input (300ms)
    ↓
Search Multiple Collections
    ├── Songs
    ├── Praise Nights
    └── Users
    ↓
Combine Results
    ↓
Rank by Relevance
    ↓
Display in GlobalSearch Component
```

### Search Index Structure

```
Search Index (Client-side)
├── Songs Index
│   ├── title (weighted: 3)
│   ├── writer (weighted: 2)
│   └── leadSinger (weighted: 2)
├── Praise Nights Index
│   ├── title (weighted: 3)
│   └── description (weighted: 1)
└── Users Index
    ├── displayName (weighted: 3)
    └── email (weighted: 1)
```

---

## 📱 PWA Architecture

### Service Worker Strategy

```
Network Request
    ↓
Service Worker Intercept
    ↓
┌──────────────┬──────────────┐
│ Static Asset │ Dynamic Data │
└──────────────┴──────────────┘
    ↓               ↓
Cache First    Network First
    ↓               ↓
Check Cache    Try Network
    ↓               ↓
If Found       If Success
Return         Return & Cache
    ↓               ↓
If Not Found   If Fail
Fetch Network  Return Cache
    ↓               ↓
Cache & Return Fallback
```

### Caching Layers

```
Layer 1: Browser Cache (HTTP Cache)
    ↓
Layer 2: Service Worker Cache (CacheStorage)
    ↓
Layer 3: IndexedDB (Structured Data)
    ↓
Layer 4: LocalStorage (Preferences)
```

---

## 🚀 Performance Architecture

### Code Splitting Strategy

```
Initial Bundle
├── Critical CSS
├── Layout Components
└── Auth Components

Route-based Chunks
├── /praise-night → praise-night.chunk.js
├── /admin → admin.chunk.js
├── /audio-lab → audio-lab.chunk.js
└── /chat → chat.chunk.js

Component-based Chunks
├── TiptapEditor → tiptap.chunk.js
├── MediaManager → media.chunk.js
└── Charts → charts.chunk.js
```

### Loading Priority

```
Priority 1 (Critical)
├── App Shell
├── Navigation
└── Auth Components

Priority 2 (Important)
├── Current Page Content
└── Global Search

Priority 3 (Deferred)
├── Analytics
├── Non-critical Images
└── Background Sync
```

---

## 🔄 Real-time Update Architecture

### Firebase Real-time Listeners

```
Component Mounts
    ↓
useRealtimeData Hook
    ↓
Create Firestore Listener
    ↓
Subscribe to Collection/Document
    ↓
On Data Change
    ↓
Trigger Callback
    ↓
Update React State
    ↓
Component Re-renders
    ↓
Component Unmounts
    ↓
Unsubscribe Listener
```

### Update Propagation

```
Admin Updates Song
    ↓
Firebase Firestore Update
    ↓
Real-time Listeners Triggered
    ↓
┌────────────┬────────────┬────────────┐
│  Client 1  │  Client 2  │  Client 3  │
└────────────┴────────────┴────────────┘
    ↓            ↓            ↓
Update State  Update State  Update State
    ↓            ↓            ↓
Re-render     Re-render     Re-render
```

---

## 🛡️ Security Architecture

### Authentication & Authorization

```
Request
    ↓
Check Firebase Auth Token
    ↓
Verify User Identity
    ↓
Check User Role
    ↓
┌──────────┬──────────┬──────────┐
│  Admin   │  Member  │  Guest   │
└──────────┴──────────┴──────────┘
    ↓          ↓          ↓
Full Access  Limited   Read Only
```

### Data Access Rules

```
Firebase Security Rules
├── Songs
│   ├── Read: Authenticated Users
│   └── Write: Admin Only
├── Users
│   ├── Read: Own Profile + Public Fields
│   └── Write: Own Profile Only
├── Messages
│   ├── Read: Group Members
│   └── Write: Group Members
└── Admin Collections
    ├── Read: Admin Only
    └── Write: Admin Only
```

---

## 📊 State Management Architecture

### State Layers

```
Layer 1: Local Component State (useState)
    ↓
Layer 2: Shared Context (React Context)
    ↓
Layer 3: Server State (Firebase Real-time)
    ↓
Layer 4: Cached State (Service Worker)
```

### Context Structure

```
App
├── AuthContext
│   ├── user
│   ├── loading
│   └── signIn/signOut
├── AudioContext
│   ├── currentTrack
│   ├── isPlaying
│   └── controls
└── UltraFastDataContext
    ├── cachedData
    ├── loading
    └── refresh
```

---

**Last Updated:** 2025-10-11  
**Architecture Version:** 1.0  
**Maintained By:** LoveWorld Singers Development Team

