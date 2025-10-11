# Database Schema Reference - LoveWorld Singers Rehearsal Hub

## 🗄️ Database Architecture

**Primary Database:** Firebase Firestore  
**Secondary Database:** Supabase (for specific features)  
**Storage:** Cloudinary (media files) + Supabase Storage

---

## 🔥 Firebase Collections

### 1. **`songs`** Collection

**Purpose:** Store all song information  
**Key Field:** `praiseNightId` (links to praise_nights)

**Schema:**
```typescript
interface Song {
  id: string;                    // Auto-generated document ID
  praiseNightId: string;         // Reference to praise night
  sn: number;                    // Song number
  section: string;               // Section category
  status: "HEARD" | "UNHEARD";   // Rehearsal status
  title: string;                 // Song title
  writer: string;                // Song writer/composer
  leadSinger: string;            // Lead singer name
  page: number;                  // Page number in songbook
  duration: string;              // Song duration (e.g., "4:30")
  key: string;                   // Musical key (e.g., "C Major")
  conductor: string;             // Conductor name
  instrumentation: string;       // Instrumentation details
  
  // Rehearsal tracking
  rehearsals: {
    count: number;               // Number of rehearsals
    extra: number;               // Extra rehearsals
  };
  
  // Pastor remarks
  remarks: Array<{
    date: string;                // ISO date string
    text: string;                // Remark content (HTML)
  }>;
  
  // Audio links
  audioLinks: {
    phases: Array<{
      name: string;              // Phase name (e.g., "Intro", "Verse")
      fullMix: string;           // Full mix URL
      soprano: string;           // Soprano part URL
      alto: string;              // Alto part URL
      tenor: string;             // Tenor part URL
      instrumentation: string;   // Instrumental URL
    }>;
  };
  
  // Lyrics
  lyrics: {
    start: string;               // Starting lyrics (HTML)
    continue: string;            // Continuation lyrics (HTML)
  };
  
  // Solfas (do-re-mi notation)
  solfas: {
    soprano: string;             // Soprano solfas
    alto: string;                // Alto solfas
    tenor: string;               // Tenor solfas
  };
  
  // Metadata
  createdAt: Timestamp;          // Creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
  createdBy: string;             // User ID who created
  updatedBy: string;             // User ID who last updated
}
```

**Indexes:**
- `praiseNightId` (for querying songs by praise night)
- `title` (for search)
- `status` (for filtering)
- `createdAt` (for sorting)

**Example Document:**
```json
{
  "id": "song_123",
  "praiseNightId": "pn_2024_01",
  "sn": 1,
  "section": "Opening",
  "status": "HEARD",
  "title": "Amazing Grace",
  "writer": "John Newton",
  "leadSinger": "Jane Doe",
  "page": 42,
  "duration": "4:30",
  "key": "C Major",
  "conductor": "John Smith",
  "instrumentation": "Piano, Guitar, Drums",
  "rehearsals": {
    "count": 3,
    "extra": 1
  },
  "remarks": [
    {
      "date": "2024-01-15T10:00:00Z",
      "text": "<p>Great performance!</p>"
    }
  ],
  "audioLinks": {
    "phases": [
      {
        "name": "Full Song",
        "fullMix": "https://cloudinary.com/...",
        "soprano": "https://cloudinary.com/...",
        "alto": "https://cloudinary.com/...",
        "tenor": "https://cloudinary.com/...",
        "instrumentation": "https://cloudinary.com/..."
      }
    ]
  },
  "lyrics": {
    "start": "<p>Amazing grace, how sweet the sound...</p>",
    "continue": "<p>That saved a wretch like me...</p>"
  },
  "solfas": {
    "soprano": "do re mi fa sol...",
    "alto": "do ti la sol fa...",
    "tenor": "mi re do ti la..."
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "createdBy": "user_admin",
  "updatedBy": "user_admin"
}
```

---

### 2. **`praise_nights`** Collection

**Purpose:** Store praise night events  
**Relationship:** One-to-many with songs

**Schema:**
```typescript
interface PraiseNight {
  id: string;                    // Auto-generated document ID
  title: string;                 // Event title
  date: string;                  // Event date (ISO string)
  description: string;           // Event description
  status: "upcoming" | "active" | "completed";
  
  // Event details
  venue: string;                 // Event location
  startTime: string;             // Start time
  endTime: string;               // End time
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  
  // Statistics (computed)
  totalSongs: number;            // Total songs count
  heardSongs: number;            // Heard songs count
  unheardSongs: number;          // Unheard songs count
}
```

**Example Document:**
```json
{
  "id": "pn_2024_01",
  "title": "January Praise Night 2024",
  "date": "2024-01-31T18:00:00Z",
  "description": "Monthly praise and worship event",
  "status": "upcoming",
  "venue": "Main Auditorium",
  "startTime": "18:00",
  "endTime": "21:00",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "createdBy": "user_admin",
  "totalSongs": 25,
  "heardSongs": 15,
  "unheardSongs": 10
}
```

---

### 3. **`users`** Collection

**Purpose:** Store user profiles and authentication data

**Schema:**
```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;                 // User email
  displayName: string;           // Display name
  photoURL: string;              // Profile photo URL
  
  // Profile details
  firstName: string;
  lastName: string;
  phone: string;
  voicePart: "soprano" | "alto" | "tenor" | "bass";
  
  // Roles and permissions
  role: "admin" | "member" | "guest";
  permissions: string[];         // Array of permission strings
  
  // Subscription
  subscriptionStatus: "active" | "inactive" | "trial";
  subscriptionExpiry: string;    // ISO date string
  
  // Preferences
  preferences: {
    notifications: boolean;
    lowDataMode: boolean;
    theme: "light" | "dark";
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

---

### 4. **`groups`** Collection

**Purpose:** Store chat groups and teams

**Schema:**
```typescript
interface Group {
  id: string;
  name: string;                  // Group name
  description: string;           // Group description
  type: "chat" | "team" | "section";
  
  // Members
  members: string[];             // Array of user IDs
  admins: string[];              // Array of admin user IDs
  
  // Settings
  isPrivate: boolean;
  allowMemberInvites: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

---

### 5. **`messages`** Collection

**Purpose:** Store chat messages

**Schema:**
```typescript
interface Message {
  id: string;
  groupId: string;               // Reference to group
  senderId: string;              // User ID of sender
  senderName: string;            // Display name of sender
  
  // Content
  text: string;                  // Message text
  type: "text" | "image" | "audio" | "file";
  attachments: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  
  // Interactions
  reactions: Record<string, string[]>; // emoji -> user IDs
  replyTo: string | null;        // Message ID being replied to
  
  // Status
  isEdited: boolean;
  isDeleted: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 6. **`notifications`** Collection

**Purpose:** Store user notifications

**Schema:**
```typescript
interface Notification {
  id: string;
  userId: string;                // Recipient user ID
  
  // Content
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "error";
  
  // Action
  actionUrl: string | null;      // URL to navigate to
  actionLabel: string | null;    // Button label
  
  // Status
  isRead: boolean;
  
  // Metadata
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
}
```

---

### 7. **`support_tickets`** Collection

**Purpose:** Store support requests

**Schema:**
```typescript
interface SupportTicket {
  id: string;
  userId: string;                // User who created ticket
  userName: string;              // User display name
  userEmail: string;             // User email
  
  // Ticket details
  subject: string;
  message: string;
  category: "technical" | "billing" | "general";
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  
  // Responses
  responses: Array<{
    userId: string;
    userName: string;
    message: string;
    createdAt: Timestamp;
  }>;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt: Timestamp | null;
  resolvedBy: string | null;
}
```

---

### 8. **`media`** Collection

**Purpose:** Track uploaded media files

**Schema:**
```typescript
interface Media {
  id: string;
  
  // File details
  url: string;                   // Cloudinary URL
  publicId: string;              // Cloudinary public ID
  type: "image" | "audio" | "video";
  format: string;                // File format (jpg, mp3, etc.)
  size: number;                  // File size in bytes
  
  // Metadata
  uploadedBy: string;            // User ID
  uploadedAt: Timestamp;
  
  // Usage tracking
  usedIn: string[];              // Array of song IDs using this media
}
```

---

## 📊 Supabase Tables

### 1. **`profiles`** Table

**Purpose:** Extended user profile data (synced with Firebase)

**Schema:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔗 Relationships

```
praise_nights (1) ──────< (many) songs
                         └─ praiseNightId field

users (1) ──────< (many) messages
                 └─ senderId field

groups (1) ──────< (many) messages
                  └─ groupId field

users (many) ────< (many) groups
                  └─ members array

users (1) ──────< (many) notifications
                 └─ userId field

users (1) ──────< (many) support_tickets
                 └─ userId field
```

---

## 📝 Query Examples

### Get all songs for a praise night
```typescript
const songsRef = collection(db, 'songs');
const q = query(songsRef, where('praiseNightId', '==', praiseNightId));
const snapshot = await getDocs(q);
const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### Get unread notifications for a user
```typescript
const notificationsRef = collection(db, 'notifications');
const q = query(
  notificationsRef,
  where('userId', '==', userId),
  where('isRead', '==', false),
  orderBy('createdAt', 'desc')
);
const snapshot = await getDocs(q);
```

### Search songs by title
```typescript
const songsRef = collection(db, 'songs');
const q = query(
  songsRef,
  where('title', '>=', searchTerm),
  where('title', '<=', searchTerm + '\uf8ff')
);
const snapshot = await getDocs(q);
```

---

**Last Updated:** 2025-10-11  
**Total Collections:** 8 Firebase + 1 Supabase  
**Maintained By:** LoveWorld Singers Development Team

