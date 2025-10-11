# Component Index - LoveWorld Singers Rehearsal Hub

## 📦 Component Categories

### 🎨 UI Components (`src/components/ui/`)
Base reusable components built with Radix UI and Tailwind CSS.

| Component | File | Purpose |
|-----------|------|---------|
| Badge | `badge.tsx` | Status indicators, tags |
| Button | `button.tsx` | Interactive buttons with variants |
| Card | `card.tsx` | Content containers |
| Input | `input.tsx` | Form text inputs |
| Table | `table.tsx` | Data tables |
| Tabs | `tabs.tsx` | Tabbed interfaces |
| Textarea | `textarea.tsx` | Multi-line text inputs |

---

### 🔐 Authentication Components

| Component | File | Purpose |
|-----------|------|---------|
| AuthScreen | `AuthScreen.tsx` | Main authentication screen |
| AuthModal | `AuthModal.tsx` | Login/signup modal dialog |
| AuthGuard | `AuthGuard.tsx` | Protected route wrapper |
| AuthCheck | `AuthCheck.tsx` | Authentication status checker |
| ProfileCompletionScreen | `ProfileCompletionScreen.tsx` | Onboarding flow |
| SubscriptionCheck | `SubscriptionCheck.tsx` | Subscription validation |
| SubscriptionOnboardingScreen | `SubscriptionOnboardingScreen.tsx` | Subscription setup |

---

### 👨‍💼 Admin Components (`src/components/admin/`)

| Component | File | Purpose |
|-----------|------|---------|
| AdminAuth | `AdminAuth.tsx` | Admin authentication |
| AdminModals | `AdminModals.tsx` | Admin modal dialogs |
| AdminSidebar | `AdminSidebar.tsx` | Admin navigation sidebar |
| CategoriesSection | `CategoriesSection.tsx` | Category management |
| MediaSection | `MediaSection.tsx` | Media library management |
| MembersSection | `MembersSection.tsx` | User management |
| PagesSection | `PagesSection.tsx` | Praise night pages |

---

### 🎵 Audio Components

| Component | File | Purpose |
|-----------|------|---------|
| GlobalMiniPlayer | `GlobalMiniPlayer.tsx` | App-wide audio player |
| MiniPlayer | `MiniPlayer.tsx` | Compact audio player |
| AudioWave | `AudioWave.tsx` | Audio waveform visualization |

**Audio Lab Components** (`src/components/audio-lab/`)
| Component | File | Purpose |
|-----------|------|---------|
| BottomSheet | `BottomSheet.tsx` | Slide-up audio controls |
| SongCard | `SongCard.tsx` | Song selection card |

---

### ✏️ Editor Components

| Component | File | Purpose |
|-----------|------|---------|
| TiptapEditor | `TiptapEditor.tsx` | Rich text editor (lyrics, remarks) |
| BasicTextEditor | `BasicTextEditor.tsx` | Simple text editor (solfas, notes) |

**Features:**
- **TiptapEditor:** Bold, italic, underline, colors, alignment, links
- **BasicTextEditor:** Minimal formatting, optimized for typing

---

### 📝 Song Management Components

| Component | File | Purpose |
|-----------|------|---------|
| EditSongModal | `EditSongModal.tsx` | Edit song details |
| SongDetailModal | `SongDetailModal.tsx` | View song information |
| UltraFastSongsList | `UltraFastSongsList.tsx` | Optimized song list |

---

### 📁 Media Components

| Component | File | Purpose |
|-----------|------|---------|
| MediaManager | `MediaManager.tsx` | Media library interface |
| MediaSelectionModal | `MediaSelectionModal.tsx` | Media picker dialog |
| OptimizedImage | `OptimizedImage.tsx` | Performance-optimized images |
| UltraFastImage | `UltraFastImage.tsx` | Ultra-fast image loading |

---

### 🔍 Search Components

| Component | File | Purpose |
|-----------|------|---------|
| GlobalSearch | `GlobalSearch.tsx` | App-wide search |
| PageSearch | `PageSearch.tsx` | Page-level search |

---

### 🗺️ Navigation & Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| Navigation | `Navigation.tsx` | Main app navigation |
| DesktopLayout | `DesktopLayout.tsx` | Desktop-optimized layout |
| MobileLayout | `MobileLayout.tsx` | Mobile-optimized layout |
| MobileSafeLayout | `MobileSafeLayout.tsx` | Safe area handling |
| ScreenHeader | `ScreenHeader.tsx` | Page headers |
| SharedDrawer | `SharedDrawer.tsx` | Slide-out drawer |

---

### 🔔 Notification Components

| Component | File | Purpose |
|-----------|------|---------|
| RealtimeNotifications | `RealtimeNotifications.tsx` | Live notification feed |
| NotificationBanner | `NotificationBanner.tsx` | Notification banners |

---

### 💬 Support Components

| Component | File | Purpose |
|-----------|------|---------|
| SimpleAdminSupport | `SimpleAdminSupport.tsx` | Admin support interface |
| WhatsAppAdminSupport | `WhatsAppAdminSupport.tsx` | WhatsApp admin contact |
| WhatsAppUserSupport | `WhatsAppUserSupport.tsx` | WhatsApp user support |
| SupportMessageForm | `SupportMessageForm.tsx` | Support ticket form |
| SupportSystemTest | `SupportSystemTest.tsx` | Support system testing |

---

### 👥 Social Components

| Component | File | Purpose |
|-----------|------|---------|
| InstagramGroups | `InstagramGroups.tsx` | Instagram integration |
| Members | `Members.tsx` | Member directory |

---

### 📱 PWA Components

| Component | File | Purpose |
|-----------|------|---------|
| PWAInstall | `PWAInstall.tsx` | PWA installation prompt |
| ServiceWorker | `ServiceWorker.tsx` | Service worker manager |
| ServiceWorkerRegistration | `ServiceWorkerRegistration.tsx` | SW registration |
| SuperFastServiceWorker | `SuperFastServiceWorker.tsx` | Optimized SW |
| OfflineIndicator | `OfflineIndicator.tsx` | Offline status display |

---

### 🚀 Performance Components

| Component | File | Purpose |
|-----------|------|---------|
| LazyPageLoader | `LazyPageLoader.tsx` | Lazy-loaded pages |
| UltraFastLoader | `UltraFastLoader.tsx` | Optimized data loader |
| InstantNavigation | `InstantNavigation.tsx` | Instant page transitions |
| CacheRefreshButton | `CacheRefreshButton.tsx` | Manual cache refresh |

---

### 🔄 Real-time Components

| Component | File | Purpose |
|-----------|------|---------|
| RealtimeUpdateIndicator | `RealtimeUpdateIndicator.tsx` | Live update indicator |
| FeatureUpdateChecker | `FeatureUpdateChecker.tsx` | Feature update detection |
| VersionChecker | `VersionChecker.tsx` | App version checking |

---

### 🎬 Loading & Splash Components

| Component | File | Purpose |
|-----------|------|---------|
| LoadingScreen | `LoadingScreen.tsx` | Loading state display |
| SplashScreen | `SplashScreen.tsx` | App splash screen |

---

### 🛡️ Security Components

| Component | File | Purpose |
|-----------|------|---------|
| ScreenshotPrevention | `ScreenshotPrevention.tsx` | Prevent screenshots |

---

### 🔧 Utility Components

| Component | File | Purpose |
|-----------|------|---------|
| ErrorBoundary | `ErrorBoundary.tsx` | Error handling wrapper |
| Toast | `Toast.tsx` | Toast notifications |
| QRCodeGenerator | `QRCodeGenerator.tsx` | Generate QR codes |
| QRCodeScanner | `QRCodeScanner.tsx` | Scan QR codes |
| ClientComponents | `ClientComponents.tsx` | Client-side only components |

---

### 🧪 Testing Components

| Component | File | Purpose |
|-----------|------|---------|
| SupabaseTest | `SupabaseTest.tsx` | Supabase connection test |
| FirebaseUserManagement | `FirebaseUserManagement.tsx` | Firebase user testing |
| UserManagement | `UserManagement.tsx` | User management testing |

---

### ⏱️ Timer Components

| Component | File | Purpose |
|-----------|------|---------|
| countdown-timer | `countdown-timer.tsx` | Countdown timer display |

---

## 🎯 Component Usage Guide

### When to Use Which Editor?

**Use TiptapEditor when:**
- Need rich text formatting (bold, italic, colors)
- Editing lyrics with formatting
- Adding pastor remarks with links
- Need text alignment options

**Use BasicTextEditor when:**
- Simple text input needed
- Editing solfas (do-re-mi notation)
- Quick notes without formatting
- Performance is critical

### When to Use Which Layout?

**DesktopLayout:**
- Desktop/tablet screens
- Multi-column layouts
- Sidebar navigation

**MobileLayout:**
- Mobile devices
- Single-column layouts
- Bottom navigation

**MobileSafeLayout:**
- iOS devices with notch
- Safe area handling
- Full-screen experiences

### When to Use Which Image Component?

**OptimizedImage:**
- General purpose images
- Automatic optimization
- Lazy loading

**UltraFastImage:**
- Critical images
- Above-the-fold content
- Maximum performance needed

---

## 🔗 Component Dependencies

### High-Level Dependencies
```
AuthGuard
  └── AuthContext
      └── firebase-auth

MediaManager
  ├── MediaSelectionModal
  ├── cloudinary
  └── supabase-storage

EditSongModal
  ├── TiptapEditor (lyrics)
  ├── BasicTextEditor (solfas)
  └── MediaSelectionModal

GlobalMiniPlayer
  └── AudioContext
      └── MiniPlayer

Navigation
  ├── GlobalSearch
  └── NotificationBanner
```

---

## 📊 Component Complexity

### Simple Components (< 100 lines)
- UI components (Button, Input, Badge, etc.)
- Toast, OfflineIndicator
- ScreenHeader

### Medium Components (100-300 lines)
- BasicTextEditor
- MiniPlayer
- PageSearch
- SongDetailModal

### Complex Components (300+ lines)
- TiptapEditor
- MediaManager
- EditSongModal
- GlobalSearch
- Navigation
- Admin components

---

## 🎨 Styling Patterns

### Common Tailwind Classes
```css
/* Containers */
.container: max-w-7xl mx-auto px-4

/* Cards */
.card: bg-white rounded-lg shadow-md p-6

/* Buttons */
.btn-primary: bg-blue-600 text-white px-4 py-2 rounded-md
.btn-secondary: bg-gray-200 text-gray-800 px-4 py-2 rounded-md

/* Inputs */
.input: border border-gray-300 rounded-md px-3 py-2
```

### Responsive Breakpoints
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px
- **2xl:** 1536px

---

## 🔄 State Management Patterns

### Local State (useState)
- Form inputs
- Modal open/close
- UI toggles

### Context State
- **AuthContext:** User authentication
- **AudioContext:** Audio player state
- **UltraFastDataContext:** Optimized data

### Server State (Hooks)
- **useRealtimeData:** Firebase real-time
- **useSupabaseData:** Supabase queries
- **useAdminData:** Admin data management

---

**Last Updated:** 2025-10-11  
**Component Count:** 60+ components  
**Maintained By:** LoveWorld Singers Development Team

