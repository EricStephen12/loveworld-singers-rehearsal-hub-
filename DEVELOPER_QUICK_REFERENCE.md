# Developer Quick Reference - LoveWorld Singers Rehearsal Hub

## 🚀 Quick Start Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run dev:fast         # Fast dev mode on port 3000

# Building
npm run build            # Production build
npm run build:production # Production build with env vars
npm run build:analyze    # Build with bundle analysis

# Running
npm start                # Start production server
npm run start:production # Start with production env

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking

# Utilities
npm run clear-cache      # Clear application cache
```

---

## 📁 File Location Quick Reference

### Need to add a new page?
→ `src/app/pages/[page-name]/page.tsx`

### Need to create a component?
→ `src/components/[ComponentName].tsx`

### Need to add a UI component?
→ `src/components/ui/[component-name].tsx`

### Need to create a custom hook?
→ `src/hooks/use[HookName].ts`

### Need to add an API route?
→ `src/app/api/[route-name]/route.ts`

### Need to add a service?
→ `src/lib/[service-name].ts`

### Need to add types?
→ `src/types/[type-name].ts`

### Need to add context?
→ `src/contexts/[ContextName]Context.tsx`

---

## 🎯 Common Development Tasks

### 1. Adding a New Song

**Location:** Admin Panel → Songs Section

**Code:**
```typescript
// In firebase-database.ts
export async function addSong(songData: Song) {
  const songsRef = collection(db, 'songs');
  const docRef = await addDoc(songsRef, {
    ...songData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
```

**Usage:**
```typescript
import { addSong } from '@/lib/firebase-database';

const newSong = {
  title: "Amazing Grace",
  writer: "John Newton",
  leadSinger: "Jane Doe",
  praiseNightId: "praise-night-123",
  // ... other fields
};

const songId = await addSong(newSong);
```

---

### 2. Creating a New Component

**Template:**
```typescript
// src/components/MyComponent.tsx
'use client';

import React from 'react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      {onAction && (
        <button onClick={onAction} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
          Action
        </button>
      )}
    </div>
  );
}
```

---

### 3. Creating a Custom Hook

**Template:**
```typescript
// src/hooks/useMyData.ts
'use client';

import { useState, useEffect } from 'react';

export function useMyData(id: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/data/${id}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  return { data, loading, error };
}
```

---

### 4. Adding an API Route

**Template:**
```typescript
// src/app/api/my-route/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    const data = { message: 'Success' };
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Process body
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    );
  }
}
```

---

### 5. Uploading Media to Cloudinary

```typescript
import { uploadImage } from '@/lib/cloudinary';

async function handleImageUpload(file: File) {
  try {
    const result = await uploadImage(file);
    console.log('Uploaded:', result.url);
    return result.url;
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

---

### 6. Working with Firebase Real-time Data

```typescript
import { useRealtimeData } from '@/hooks/useRealtimeData';

function MyComponent() {
  const { data: songs, loading } = useRealtimeData('songs');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {songs.map(song => (
        <div key={song.id}>{song.title}</div>
      ))}
    </div>
  );
}
```

---

### 7. Adding Authentication to a Page

```typescript
import { AuthGuard } from '@/components/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>This content is protected</div>
    </AuthGuard>
  );
}
```

---

### 8. Creating a Modal

```typescript
'use client';

import { useState } from 'react';

export default function MyModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Modal Title</h2>
            <p>Modal content goes here</p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

---

### 9. Using the Text Editors

**TiptapEditor (Rich Text):**
```typescript
import TiptapEditor from '@/components/TiptapEditor';

function MyForm() {
  const [content, setContent] = useState('');

  return (
    <TiptapEditor
      value={content}
      onChange={setContent}
      placeholder="Enter lyrics..."
    />
  );
}
```

**BasicTextEditor (Simple):**
```typescript
import BasicTextEditor from '@/components/BasicTextEditor';

function MyForm() {
  const [content, setContent] = useState('');

  return (
    <BasicTextEditor
      value={content}
      onChange={setContent}
      placeholder="Enter solfas..."
    />
  );
}
```

---

### 10. Implementing Search

```typescript
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

function SearchComponent() {
  const { query, results, setQuery, isSearching } = useGlobalSearch();

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="border rounded px-3 py-2"
      />
      
      {isSearching && <div>Searching...</div>}
      
      <div>
        {results.map(result => (
          <div key={result.id}>{result.title}</div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 Styling Quick Reference

### Common Tailwind Patterns

```css
/* Container */
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

/* Card */
className="bg-white rounded-lg shadow-md p-6"

/* Button Primary */
className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"

/* Button Secondary */
className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"

/* Input */
className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"

/* Grid */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

/* Flex Center */
className="flex items-center justify-center"

/* Flex Between */
className="flex items-center justify-between"

/* Text Heading */
className="text-2xl font-bold text-gray-900"

/* Text Body */
className="text-base text-gray-700"

/* Loading Spinner */
className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
```

---

## 🔧 Debugging Tips

### 1. Check Firebase Connection
```typescript
import { db } from '@/lib/firebase-database';
console.log('Firebase initialized:', !!db);
```

### 2. Check Supabase Connection
```typescript
import { supabase } from '@/lib/supabase-client';
const { data, error } = await supabase.from('songs').select('*').limit(1);
console.log('Supabase working:', !!data);
```

### 3. Check Authentication
```typescript
import { getCurrentUser } from '@/lib/firebase-auth';
const user = await getCurrentUser();
console.log('Current user:', user);
```

### 4. Clear Cache
```bash
npm run clear-cache
# Or manually delete .next folder
rm -rf .next
```

### 5. Check Environment Variables
```typescript
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓' : '✗',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓' : '✗',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓' : '✗',
});
```

---

## 📊 Performance Tips

### 1. Use Dynamic Imports
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});
```

### 2. Optimize Images
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
/>
```

### 3. Use Memoization
```typescript
import { useMemo } from 'react';

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### 4. Debounce Search
```typescript
import { useState, useEffect } from 'react';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found"
**Solution:** Check import path and file extension
```typescript
// ✗ Wrong
import MyComponent from '@/components/MyComponent';

// ✓ Correct
import MyComponent from '@/components/MyComponent.tsx';
```

### Issue: "Hydration mismatch"
**Solution:** Use 'use client' directive
```typescript
'use client';

import { useState } from 'react';
// Component code...
```

### Issue: "Firebase not initialized"
**Solution:** Check environment variables in `.env.local`

### Issue: "Can't type in BasicTextEditor"
**Solution:** Already fixed! See `TEXT_EDITOR_AND_MEDIA_SCROLL_FIX.md`

---

**Last Updated:** 2025-10-11  
**Maintained By:** LoveWorld Singers Development Team

