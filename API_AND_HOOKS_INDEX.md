# API & Hooks Index - LoveWorld Singers Rehearsal Hub

## 🎣 Custom Hooks Reference

### 📊 Data Fetching Hooks

#### `useRealtimeData()`
**File:** `src/hooks/useRealtimeData.ts`  
**Purpose:** Real-time Firebase data synchronization  
**Returns:** `{ data, loading, error }`  
**Use Case:** Live updates for songs, praise nights

#### `useSupabaseData()`
**File:** `src/hooks/useSupabaseData.ts`  
**Purpose:** Supabase data queries  
**Returns:** `{ data, loading, error, refetch }`  
**Use Case:** User profiles, support tickets

#### `useAdminData()`
**File:** `src/hooks/useAdminData.ts`  
**Purpose:** Admin panel data management  
**Returns:** `{ songs, categories, media, users, loading }`  
**Use Case:** Admin dashboard

#### `useUltraFastData()`
**File:** `src/hooks/useUltraFastData.ts`  
**Purpose:** Optimized data loading with caching  
**Returns:** `{ data, loading, error, refresh }`  
**Use Case:** Performance-critical pages

#### `useLowDataOptimized()`
**File:** `src/hooks/useLowDataOptimized.ts`  
**Purpose:** Reduced data for slow connections  
**Returns:** `{ data, loading, isLowDataMode }`  
**Use Case:** Mobile users with limited bandwidth

---

### 🔍 Search Hooks

#### `useGlobalSearch()`
**File:** `src/hooks/useGlobalSearch.ts`  
**Purpose:** App-wide search functionality  
**Returns:** `{ query, results, setQuery, isSearching }`  
**Use Case:** Global search bar

#### `useHomeGlobalSearch()`
**File:** `src/hooks/useHomeGlobalSearch.ts`  
**Purpose:** Home page search  
**Returns:** `{ query, results, setQuery }`  
**Use Case:** Home page search

#### `usePageSearch()`
**File:** `src/hooks/usePageSearch.ts`  
**Purpose:** Page-level search  
**Returns:** `{ query, filteredData, setQuery }`  
**Use Case:** Search within specific pages

---

### 💬 Chat & Communication Hooks

#### `useChat()`
**File:** `src/hooks/useChat.ts`  
**Purpose:** Chat functionality  
**Returns:** `{ messages, sendMessage, loading }`  
**Use Case:** Direct messaging, group chat

#### `useRealtimeComments()`
**File:** `src/hooks/useRealtimeComments.ts`  
**Purpose:** Real-time comment updates  
**Returns:** `{ comments, addComment, deleteComment }`  
**Use Case:** Song comments, discussions

---

### 🔔 Notification Hooks

#### `useNotifications()`
**File:** `src/hooks/useNotifications.ts`  
**Purpose:** User notifications  
**Returns:** `{ notifications, markAsRead, deleteNotification }`  
**Use Case:** Notification center

#### `useRealtimeNotifications()`
**File:** `src/hooks/useRealtimeNotifications.ts`  
**Purpose:** Live notification updates  
**Returns:** `{ notifications, unreadCount }`  
**Use Case:** Real-time notification badge

---

### 🎵 Song & Audio Hooks

#### `useRealtimeSongData()`
**File:** `src/hooks/useRealtimeSongData.ts`  
**Purpose:** Real-time song updates  
**Returns:** `{ songs, loading, error }`  
**Use Case:** Praise night song list

#### `useUltraFastSongHistory()`
**File:** `src/hooks/useUltraFastSongHistory.ts`  
**Purpose:** Song history tracking  
**Returns:** `{ history, addToHistory }`  
**Use Case:** Recently viewed songs

---

### 👤 User & Profile Hooks

#### `useUltraFastProfile()`
**File:** `src/hooks/useUltraFastProfile.ts`  
**Purpose:** User profile data  
**Returns:** `{ profile, updateProfile, loading }`  
**Use Case:** Profile page

#### `useUltraFastProfileSimple()`
**File:** `src/hooks/useUltraFastProfileSimple.ts`  
**Purpose:** Simplified profile data  
**Returns:** `{ profile, loading }`  
**Use Case:** Profile display only

---

### 🛠️ Utility Hooks

#### `useMobileDetection()`
**File:** `src/hooks/useMobileDetection.ts`  
**Purpose:** Detect mobile devices  
**Returns:** `{ isMobile, isTablet, isDesktop }`  
**Use Case:** Responsive layouts

#### `useOfflineStatus()`
**File:** `src/hooks/useOfflineStatus.ts`  
**Purpose:** Network status detection  
**Returns:** `{ isOffline, isOnline }`  
**Use Case:** Offline indicator

#### `usePerformance()`
**File:** `src/hooks/usePerformance.ts`  
**Purpose:** Performance monitoring  
**Returns:** `{ metrics, logMetric }`  
**Use Case:** Performance tracking

---

### 🔄 Real-time Update Hooks

#### `useInstantUpdates()`
**File:** `src/hooks/useInstantUpdates.ts`  
**Purpose:** Instant data synchronization  
**Returns:** `{ data, isUpdating }`  
**Use Case:** Live data updates

#### `useServerCountdown()`
**File:** `src/hooks/useServerCountdown.ts`  
**Purpose:** Server-synced countdown  
**Returns:** `{ timeRemaining, isActive }`  
**Use Case:** Event countdowns

---

### 💼 Support Hooks

#### `useSupportMessages()`
**File:** `src/hooks/useSupportMessages.ts`  
**Purpose:** Support ticket management  
**Returns:** `{ messages, sendMessage, tickets }`  
**Use Case:** Support system

---

### 🎨 Styling Hooks

#### `useWebsiteStyleData()`
**File:** `src/hooks/useWebsiteStyleData.ts`  
**Purpose:** Dynamic styling data  
**Returns:** `{ styles, updateStyles }`  
**Use Case:** Theme customization

---

## 🌐 API Routes Reference

### 🎵 Audio API

#### `POST /api/audio/upload`
**File:** `src/app/api/audio/route.ts`  
**Purpose:** Upload audio files  
**Body:** `{ file: File, songId: string }`  
**Response:** `{ url: string, success: boolean }`

#### `GET /api/audio/[id]`
**Purpose:** Get audio file URL  
**Response:** `{ url: string }`

---

### 📁 Cloudinary API

#### `POST /api/cloudinary/upload`
**File:** `src/app/api/cloudinary/route.ts`  
**Purpose:** Upload media to Cloudinary  
**Body:** `{ file: File, folder: string }`  
**Response:** `{ url: string, publicId: string }`

#### `DELETE /api/cloudinary/delete`
**Purpose:** Delete media from Cloudinary  
**Body:** `{ publicId: string }`  
**Response:** `{ success: boolean }`

---

### ⏱️ Countdown API

#### `GET /api/countdown`
**File:** `src/app/api/countdown/route.ts`  
**Purpose:** Get server countdown time  
**Response:** `{ timeRemaining: number, targetDate: string }`

---

### 🔔 Notifications API

#### `POST /api/notifications/send`
**File:** `src/app/api/notifications/route.ts`  
**Purpose:** Send push notification  
**Body:** `{ userId: string, title: string, body: string }`  
**Response:** `{ success: boolean }`

#### `GET /api/notifications/[userId]`
**Purpose:** Get user notifications  
**Response:** `{ notifications: Notification[] }`

---

### 💬 Support API

#### `POST /api/support/create`
**File:** `src/app/api/support/route.ts`  
**Purpose:** Create support ticket  
**Body:** `{ userId: string, subject: string, message: string }`  
**Response:** `{ ticketId: string, success: boolean }`

#### `GET /api/support/tickets`
**Purpose:** Get all support tickets  
**Response:** `{ tickets: Ticket[] }`

#### `PATCH /api/support/[ticketId]`
**Purpose:** Update ticket status  
**Body:** `{ status: string, response: string }`  
**Response:** `{ success: boolean }`

---

## 📚 Service Libraries Reference

### 🔥 Firebase Services

#### `firebase-auth.ts`
**Functions:**
- `signUp(email, password)` - Create new user
- `signIn(email, password)` - Authenticate user
- `signOut()` - Log out user
- `resetPassword(email)` - Send password reset
- `getCurrentUser()` - Get current user

#### `firebase-database.ts`
**Functions:**
- `getSongs()` - Fetch all songs
- `getSong(id)` - Get single song
- `addSong(song)` - Create new song
- `updateSong(id, data)` - Update song
- `deleteSong(id)` - Remove song

#### `firebase-database-service.ts`
**Functions:**
- `getPraiseNights()` - Get praise night events
- `getPraiseNight(id)` - Get single event
- `createPraiseNight(data)` - Create event
- `updatePraiseNight(id, data)` - Update event

#### `firebase-comment-service.ts`
**Functions:**
- `getComments(songId)` - Get song comments
- `addComment(songId, comment)` - Add comment
- `deleteComment(commentId)` - Remove comment

#### `firebase-low-data-service.ts`
**Functions:**
- `getLowDataSongs()` - Get minimal song data
- `getLowDataPraiseNight(id)` - Get minimal event data

---

### 🗄️ Supabase Services

#### `supabase-client.ts`
**Functions:**
- `getSupabaseClient()` - Get Supabase instance
- `getSession()` - Get current session

#### `supabase-storage.ts`
**Functions:**
- `uploadFile(file, bucket)` - Upload to storage
- `deleteFile(path, bucket)` - Delete from storage
- `getPublicUrl(path, bucket)` - Get file URL

#### `supabase-support.ts`
**Functions:**
- `createTicket(data)` - Create support ticket
- `getTickets(userId)` - Get user tickets
- `updateTicket(id, data)` - Update ticket
- `getAdminTickets()` - Get all tickets (admin)

---

### 💬 Chat Service

#### `chat-service.ts`
**Functions:**
- `sendMessage(chatId, message)` - Send message
- `getMessages(chatId)` - Get chat messages
- `createChat(users)` - Create new chat
- `deleteMessage(messageId)` - Delete message

---

### 📁 Media Services

#### `cloudinary.ts`
**Functions:**
- `uploadImage(file)` - Upload image
- `uploadVideo(file)` - Upload video
- `uploadAudio(file)` - Upload audio
- `deleteMedia(publicId)` - Delete media

---

### 🗃️ Cache Service

#### `cache-service.ts`
**Functions:**
- `setCache(key, data)` - Store in cache
- `getCache(key)` - Retrieve from cache
- `clearCache(key)` - Remove from cache
- `clearAllCache()` - Clear all cache

#### `smart-cache.ts`
**Functions:**
- `smartCache(key, fetcher, ttl)` - Smart caching
- `invalidateCache(pattern)` - Invalidate by pattern

---

### ⚡ Performance Services

#### `performance-optimizer.ts`
**Functions:**
- `optimizeImages(images)` - Optimize images
- `lazyLoad(component)` - Lazy load component
- `prefetch(url)` - Prefetch resource

#### `ultra-fast-loader.ts`
**Functions:**
- `loadData(key)` - Ultra-fast data loading
- `preloadData(keys)` - Preload multiple resources

---

## 🔗 Hook Usage Examples

### Example 1: Fetching Songs
```typescript
import { useRealtimeSongData } from '@/hooks/useRealtimeSongData';

function SongList() {
  const { songs, loading, error } = useRealtimeSongData();
  
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{songs.map(song => <SongCard key={song.id} song={song} />)}</div>;
}
```

### Example 2: Global Search
```typescript
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

function SearchBar() {
  const { query, results, setQuery, isSearching } = useGlobalSearch();
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Example 3: Offline Detection
```typescript
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

function OfflineBanner() {
  const { isOffline } = useOfflineStatus();
  
  if (!isOffline) return null;
  
  return <div>You are offline</div>;
}
```

---

## 📊 API Usage Examples

### Example 1: Upload Audio
```typescript
const uploadAudio = async (file: File, songId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('songId', songId);
  
  const response = await fetch('/api/audio/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.url;
};
```

### Example 2: Create Support Ticket
```typescript
const createTicket = async (subject: string, message: string) => {
  const response = await fetch('/api/support/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, message }),
  });
  
  const data = await response.json();
  return data.ticketId;
};
```

---

**Last Updated:** 2025-10-11  
**Total Hooks:** 25+  
**Total API Routes:** 15+  
**Maintained By:** LoveWorld Singers Development Team

