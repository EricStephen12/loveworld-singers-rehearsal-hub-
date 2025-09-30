# Supabase Setup Guide for Loveworld Praise App

This guide will help you set up Supabase for your Loveworld Praise app with the updated schema that matches your current app structure.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a name like "loveworld-praise"
4. Set a strong database password
5. Choose a region close to your users

### 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. You'll need these for your environment variables

### 3. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

### 5. Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create these buckets:
   - `audio-files` (for song audio files)
   - `banner-images` (for page banner images)
   - `song-images` (for song cover images)

3. Set bucket policies (make them public for now):
   ```sql
   -- Audio files bucket
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'audio-files');
   CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-files');
   
   -- Banner images bucket
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'banner-images');
   CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banner-images');
   
   -- Song images bucket
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'song-images');
   CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'song-images');
   ```

## 📊 Database Schema Overview

The updated schema now perfectly matches your app structure:

### Tables Created:

1. **`pages`** - Stores your Praise Night pages
   - Matches `Page` interface from `pages-manager.ts`
   - Includes countdown fields, banner images, categories

2. **`categories`** - Stores song categories
   - Matches `Category` interface from `categories.ts`
   - Uses string IDs to match your app structure

3. **`songs`** - Stores song data
   - Matches `PraiseNightSong` interface
   - Links to pages via `praiseNightId`
   - Stores all metadata (lead singer, writer, etc.)

4. **`song_history`** - Tracks song changes
   - Matches `HistoryEntry` interface
   - Tracks lyrics, solfas, audio, comments, metadata changes

5. **`comments`** - Stores song comments
   - Matches `Comment` interface
   - Links to songs

6. **`page_categories`** - Categories within pages
   - Matches `PageCategory` interface

7. **`category_content`** - Content within page categories
   - Matches `CategoryContent` interface

## 🔄 Integration with Your Centralized Data

The database service (`src/lib/database.ts`) provides functions that:

1. **Bridge your existing data** - Works with your current interfaces
2. **Maintain compatibility** - Your app can still use centralized data
3. **Enable persistence** - Data is saved to Supabase
4. **Support real-time** - Can add real-time features later

### Usage Example:

```typescript
import { pagesService, songsService } from '@/lib/database';

// Get all pages (works with your existing Page interface)
const pages = await pagesService.getAllPages();

// Add a new page (works with your existing Page interface)
const newPage = await pagesService.addPage({
  name: 'New Praise Night',
  date: '25th December 2025',
  location: 'Oasis Studio',
  category: 'ongoing',
  countdown: { days: 0, hours: 0, minutes: 0, seconds: 0 },
  isActive: true
});

// Get songs for a page (works with your existing PraiseNightSong interface)
const songs = await songsService.getSongsByPage(1);
```

## 🎯 Key Features

### ✅ **Perfect Schema Alignment**
- All tables match your TypeScript interfaces
- String IDs where your app uses strings
- Proper relationships and constraints

### ✅ **Centralized Data Compatibility**
- Your existing data managers still work
- Database service bridges the gap
- No breaking changes to your app

### ✅ **Rehearsal Count Tracking**
- History entries track metadata changes
- Rehearsal count calculated from history
- Matches your current "x" number logic

### ✅ **File Upload Support**
- Audio files, banner images, song images
- Supabase Storage integration
- Public URLs for easy access

### ✅ **Real-time Ready**
- Schema supports real-time features
- Can add live updates later
- Row Level Security enabled

## 🔧 Testing the Setup

1. **Test Database Connection:**
   ```typescript
   import { supabase } from '@/lib/supabase';
   
   const testConnection = async () => {
     const { data, error } = await supabase.from('pages').select('*');
     if (error) console.error('Connection failed:', error);
     else console.log('Connection successful:', data);
   };
   ```

2. **Test Data Insertion:**
   ```typescript
   import { pagesService } from '@/lib/database';
   
   const testInsert = async () => {
     try {
       const page = await pagesService.addPage({
         name: 'Test Page',
         date: 'Test Date',
         location: 'Test Location',
         category: 'ongoing',
         countdown: { days: 0, hours: 0, minutes: 0, seconds: 0 },
         isActive: true
       });
       console.log('Page created:', page);
     } catch (error) {
       console.error('Insert failed:', error);
     }
   };
   ```

## 🚨 Important Notes

1. **Backup Your Data** - Always backup before running schema changes
2. **Test Locally First** - Test the setup in development before production
3. **Environment Variables** - Never commit your `.env.local` file
4. **Row Level Security** - Currently set to public access, adjust for production
5. **File Storage** - Set appropriate file size limits in Supabase

## 🔄 Migration Strategy

To migrate from your current centralized data to Supabase:

1. **Phase 1** - Set up Supabase (this guide)
2. **Phase 2** - Import existing data using the database service
3. **Phase 3** - Update your data managers to use Supabase
4. **Phase 4** - Add real-time features and advanced functionality

Your app will continue to work with centralized data while you gradually migrate to Supabase!

## 📞 Support

If you encounter any issues:
1. Check the Supabase dashboard for error logs
2. Verify your environment variables
3. Ensure the schema was run successfully
4. Check the browser console for connection errors

The schema is now perfectly aligned with your app structure and ready for integration! 🎉