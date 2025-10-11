# LoveWorld Singers Rehearsal Hub - Project Index

## 📋 Project Overview

**Name:** LoveWorld Singers Rehearsal Hub (LWSRH)  
**Type:** Progressive Web App (PWA)  
**Framework:** Next.js 15 with App Router  
**Language:** TypeScript  
**UI:** React 19 + Tailwind CSS 4  
**Backend:** Firebase + Supabase (Hybrid)  
**Version:** 0.1.0

## 🎯 Purpose

A comprehensive rehearsal management platform for LoveWorld Singers that enables:
- Praise night event management
- Song library with lyrics, audio, and solfas
- Real-time collaboration and chat
- Audio lab for voice parts practice
- Admin panel for content management
- Offline-first PWA capabilities

---

## 📁 Project Structure

### Root Directory
```
/
├── src/                    # Source code
├── public/                 # Static assets
├── supabase/              # Supabase migrations
├── node_modules/          # Dependencies
├── *.md                   # Documentation files
├── *.js                   # Utility scripts
└── config files           # Next.js, TypeScript, ESLint configs
```

### Source Code (`src/`)

#### **`src/app/`** - Next.js App Router Pages
```
app/
├── layout.tsx             # Root layout with PWA setup
├── page.tsx               # Landing page
├── globals.css            # Global styles
├── admin/                 # Admin panel
├── auth/                  # Authentication pages
├── home/                  # Main home page
├── pages/                 # Feature pages
│   ├── praise-night/      # Praise night display
│   ├── audio-lab/         # Voice parts practice
│   ├── chat/              # Direct messaging
│   ├── chat-group/        # Group chat
│   ├── groups/            # Group management
│   ├── notifications/     # Notifications center
│   ├── profile/           # User profile
│   ├── rehearsals/        # Rehearsal tracking
│   └── support/           # Support system
├── profile-completion/    # Onboarding flow
├── subscription/          # Subscription management
├── qr-code/              # QR code features
└── api/                  # API routes
    ├── audio/            # Audio processing
    ├── cloudinary/       # Media upload
    ├── countdown/        # Server countdown
    ├── notifications/    # Push notifications
    └── support/          # Support tickets
```

#### **`src/components/`** - React Components
```
components/
├── ui/                    # Reusable UI components (shadcn/ui)
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   └── textarea.tsx
├── admin/                 # Admin-specific components
│   ├── AdminAuth.tsx
│   ├── AdminModals.tsx
│   ├── AdminSidebar.tsx
│   ├── CategoriesSection.tsx
│   ├── MediaSection.tsx
│   ├── MembersSection.tsx
│   └── PagesSection.tsx
├── audio-lab/             # Audio lab components
│   ├── BottomSheet.tsx
│   └── SongCard.tsx
├── Auth*.tsx              # Authentication components
├── *Modal.tsx             # Modal dialogs
├── *Layout.tsx            # Layout components
├── Navigation.tsx         # Main navigation
├── PWAInstall.tsx         # PWA installation
├── ServiceWorker*.tsx     # Service worker management
├── TiptapEditor.tsx       # Rich text editor
├── BasicTextEditor.tsx    # Simple text editor
├── MediaManager.tsx       # Media library
├── GlobalSearch.tsx       # Search functionality
├── MiniPlayer.tsx         # Audio player
└── [50+ other components]
```

#### **`src/lib/`** - Core Libraries & Services
```
lib/
├── firebase-*.ts          # Firebase services
│   ├── firebase-auth.ts
│   ├── firebase-database.ts
│   ├── firebase-database-service.ts
│   ├── firebase-comment-service.ts
│   └── firebase-low-data-service.ts
├── supabase-*.ts          # Supabase services
│   ├── supabase-client.ts
│   ├── supabase-storage.ts
│   └── supabase-support.ts
├── auth-service.ts        # Authentication logic
├── cache-service.ts       # Caching layer
├── chat-service.ts        # Chat functionality
├── cloudinary.ts          # Media upload
├── database.ts            # Database abstraction
├── performance-optimizer.ts
├── smart-cache.ts
├── ultra-fast-loader.ts
└── utils.ts               # Utility functions
```

#### **`src/hooks/`** - Custom React Hooks
```
hooks/
├── useAdminData.ts        # Admin data management
├── useChat.ts             # Chat functionality
├── useGlobalSearch.ts     # Global search
├── useHomeGlobalSearch.ts # Home search
├── useInstantUpdates.ts   # Real-time updates
├── useLowDataOptimized.ts # Low data mode
├── useMobileDetection.ts  # Device detection
├── useNotifications.ts    # Notifications
├── useOfflineStatus.ts    # Offline detection
├── usePageSearch.ts       # Page-level search
├── usePerformance.ts      # Performance monitoring
├── useRealtime*.ts        # Real-time data hooks
├── useSupabaseData.ts     # Supabase data
├── useSupportMessages.ts  # Support system
└── useUltraFast*.ts       # Optimized data hooks
```

#### **`src/contexts/`** - React Context Providers
```
contexts/
├── AudioContext.tsx       # Audio player state
├── AuthContext.tsx        # Authentication state
└── UltraFastDataContext.tsx # Optimized data state
```

#### **`src/types/`** - TypeScript Type Definitions
```
types/
└── supabase.ts           # Supabase type definitions
```

#### **`src/services/`** - External Services
```
services/
└── pushNotificationService.ts
```

---

## 🔑 Key Features & Components

### 1. **Authentication System**
- **Files:** `src/lib/firebase-auth.ts`, `src/lib/auth-service.ts`
- **Components:** `AuthScreen.tsx`, `AuthModal.tsx`, `AuthGuard.tsx`
- **Features:** Email/password, session management, role-based access

### 2. **Praise Night Management**
- **Page:** `src/app/pages/praise-night/`
- **Features:** Song lists, lyrics display, audio playback, rehearsal tracking

### 3. **Admin Panel**
- **Page:** `src/app/admin/`
- **Components:** `src/components/admin/`
- **Features:** Song CRUD, media management, user management, categories

### 4. **Audio Lab**
- **Page:** `src/app/pages/audio-lab/`
- **Features:** Voice parts (Soprano, Alto, Tenor), practice mode, audio controls

### 5. **Chat System**
- **Pages:** `src/app/pages/chat/`, `src/app/pages/chat-group/`
- **Service:** `src/lib/chat-service.ts`
- **Features:** Direct messaging, group chat, real-time updates

### 6. **Media Management**
- **Component:** `MediaManager.tsx`, `MediaSelectionModal.tsx`
- **Services:** `cloudinary.ts`, `supabase-storage.ts`
- **Features:** Upload, organize, select media files

### 7. **Text Editors**
- **TiptapEditor:** Rich text with formatting (lyrics, remarks)
- **BasicTextEditor:** Simple editor (solfas, notes)

### 8. **PWA Features**
- **Service Workers:** `public/sw*.js`
- **Components:** `PWAInstall.tsx`, `ServiceWorker*.tsx`
- **Features:** Offline support, installable, push notifications

### 9. **Search System**
- **Global:** `GlobalSearch.tsx`, `useGlobalSearch.ts`
- **Page-level:** `PageSearch.tsx`, `usePageSearch.ts`
- **Home:** `useHomeGlobalSearch.ts`

### 10. **Real-time Updates**
- **Hooks:** `useRealtime*.ts`, `useInstantUpdates.ts`
- **Components:** `RealtimeNotifications.tsx`, `RealtimeUpdateIndicator.tsx`

---

## 🗄️ Database Structure

### Firebase Collections
- **`songs`** - Song library with praiseNightId mapping
- **`praise_nights`** - Praise night events
- **`users`** - User profiles
- **`groups`** - Chat groups
- **`messages`** - Chat messages
- **`notifications`** - User notifications
- **`support_tickets`** - Support requests

### Supabase Tables
- Hybrid approach with Firebase
- Storage for media files
- See `supabase/migrations/` for schema

---

## 📦 Dependencies

### Core
- **next:** 15.5.2
- **react:** 19.1.0
- **typescript:** ^5
- **tailwindcss:** ^4

### Firebase
- **firebase:** ^12.3.0

### Supabase
- **@supabase/supabase-js:** ^2.57.4
- **@supabase/auth-helpers-nextjs:** ^0.10.0

### Editors
- **@tiptap/react:** ^3.4.4 (Rich text)
- **@editorjs/editorjs:** ^2.31.0 (Block editor)

### UI
- **@radix-ui/react-tabs:** ^1.1.13
- **lucide-react:** ^0.542.0
- **class-variance-authority:** ^0.7.1

### PWA
- **next-pwa:** ^5.6.0
- **workbox-webpack-plugin:** ^7.3.0

---

## 🚀 Scripts

```bash
npm run dev              # Development with Turbopack
npm run dev:fast         # Fast dev mode on port 3000
npm run build            # Production build
npm run build:production # Production build with env
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
npm run clear-cache      # Clear app cache
```

---

## 📚 Documentation Files

- **README.md** - Project overview
- **FIREBASE_SETUP_GUIDE.md** - Firebase configuration
- **CLOUDINARY_SETUP_GUIDE.md** - Media upload setup
- **MIGRATION_GUIDE.md** - Migration instructions
- **PERFORMANCE_OPTIMIZATION_SUMMARY.md** - Performance tips
- **TEXT_EDITOR_AND_MEDIA_SCROLL_FIX.md** - Recent fixes
- **FEATURE_ROLLOUT_GUIDE.md** - Feature deployment
- **[15+ other documentation files]**

---

## 🔧 Configuration Files

- **next.config.ts** - Next.js configuration
- **tsconfig.json** - TypeScript configuration
- **eslint.config.mjs** - ESLint rules
- **postcss.config.mjs** - PostCSS setup
- **tailwind.config** - Tailwind CSS (in globals.css)

---

## 🎨 Styling System

- **Tailwind CSS 4** - Utility-first CSS
- **CSS Variables** - Theme customization in `globals.css`
- **shadcn/ui** - Pre-built accessible components
- **Responsive Design** - Mobile-first approach

---

## 🔐 Environment Variables

See `env.firebase.example` for required variables:
- Firebase credentials
- Supabase credentials
- Cloudinary credentials
- API keys

---

**Last Updated:** 2025-10-11  
**Maintained By:** LoveWorld Singers Development Team

