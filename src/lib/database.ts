// Database Service for Loveworld Praise App
// This service bridges your existing data structure with Supabase

import { createClient } from '@supabase/supabase-js';
import type { 
  PraiseNight, 
  PraiseNightSong, 
  Comment, 
  HistoryEntry,
  Category
} from '../types/supabase';
import { offlineManager } from '../utils/offlineManager';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get audio URL from media table
async function getAudioFromMedia(mediaId: number): Promise<string | null> {
  try {
    const { data: mediaFile, error } = await supabase
      .from('media')
      .select('url')
      .eq('id', mediaId)
      .single();
    
    if (error) {
      console.error('Error fetching media file:', error);
      return null;
    }
    
    let url = mediaFile?.url || null;
    
    // Supabase Storage URLs work directly - no conversion needed!
    console.log('✅ Using Supabase Storage URL:', url);
    
    return url;
  } catch (error) {
    console.error('Error in getAudioFromMedia:', error);
    return null;
  }
}

// Database interfaces that match your existing structure
export interface DatabasePage {
  id: number;
  name: string;
  date: string;
  location: string;
  category: 'unassigned' | 'pre-rehearsal' | 'ongoing' | 'archive';
  bannerImage?: string;
  countdownDays: number;
  countdownHours: number;
  countdownMinutes: number;
  countdownSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSong {
  id: number;
  title: string;
  status: 'heard' | 'unheard';
  category: string;
  praiseNightId: number;
  leadSinger: string;
  writer: string;
  conductor: string;
  key: string;
  tempo: string;
  leadKeyboardist: string;
  leadGuitarist: string;
  drummer: string;
  lyrics: string;
  solfas?: string;
  rehearsalCount?: number;
  audioFile?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseComment {
  id: string;
  songId: number;
  text: string;
  date: string;
  author: string;
  createdAt: string;
}

export interface DatabaseHistoryEntry {
  id: string;
  songId: number;
  type: 'lyrics' | 'solfas' | 'audio' | 'comment' | 'metadata';
  content: string;
  date: string;
  version: number;
  createdAt: string;
}

// ===== PAGES OPERATIONS =====

export async function getAllPages(): Promise<PraiseNight[]> {
  try {
    // Check if we're online
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      console.log('📴 Offline: Loading cached pages data');
      const cachedData = await offlineManager.getCachedData('pages');
      if (cachedData) {
        return cachedData;
      }
    }

    const { data: pages, error } = await supabase
      .from('pages')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    // Convert database pages to your PraiseNight format
    const praiseNights: PraiseNight[] = [];
    
    for (const page of pages || []) {
      // Get songs for this page
      const songs = await getSongsByPageId(page.id);
      
      praiseNights.push({
        id: page.id,
        name: page.name,
        date: page.date,
        location: page.location,
        category: page.category,
        bannerImage: page.bannerimage,
        countdown: {
          days: page.countdowndays,
          hours: page.countdownhours,
          minutes: page.countdownminutes,
          seconds: page.countdownseconds
        },
        songs: songs
      });
    }

    // Cache the data for offline use
    if (isOnline) {
      await offlineManager.cacheData('pages', praiseNights);
    }

    return praiseNights;
  } catch (error) {
    console.error('Error fetching pages:', error);
    
    // Try to get cached data as fallback
    const cachedData = await offlineManager.getCachedData('pages');
    if (cachedData) {
      console.log('📴 Using cached pages data as fallback');
      return cachedData;
    }
    
    return [];
  }
}

export async function getPageById(id: number): Promise<PraiseNight | null> {
  try {
    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!page) return null;

    // Get songs for this page
    const songs = await getSongsByPageId(page.id);

    return {
      id: page.id,
      name: page.name,
      date: page.date,
      location: page.location,
      category: page.category,
      bannerImage: page.bannerimage,
      countdown: {
        days: page.countdowndays,
        hours: page.countdownhours,
        minutes: page.countdownminutes,
        seconds: page.countdownseconds
      },
      songs: songs
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export async function createPage(pageData: Omit<PraiseNight, 'songs'>): Promise<PraiseNight | null> {
  try {
    const { data, error } = await supabase
      .from('pages')
      .insert({
        name: pageData.name,
        date: pageData.date,
        location: pageData.location,
        category: pageData.category,
        bannerimage: pageData.bannerImage,
        countdowndays: pageData.countdown.days,
        countdownhours: pageData.countdown.hours,
        countdownminutes: pageData.countdown.minutes,
        countdownseconds: pageData.countdown.seconds
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      date: data.date,
      location: data.location,
      category: data.category,
      bannerImage: data.bannerimage,
      countdown: {
        days: data.countdowndays,
        hours: data.countdownhours,
        minutes: data.countdownminutes,
        seconds: data.countdownseconds
      },
      songs: []
    };
  } catch (error) {
    console.error('Error creating page:', error);
    return null;
  }
}

export async function updatePage(id: number, pageData: Partial<Omit<PraiseNight, 'songs'>>): Promise<boolean> {
  try {
    const updateData: any = {};
    
    if (pageData.name) updateData.name = pageData.name;
    if (pageData.date) updateData.date = pageData.date;
    if (pageData.location) updateData.location = pageData.location;
    if (pageData.category) updateData.category = pageData.category;
    if (pageData.bannerImage !== undefined) updateData.bannerimage = pageData.bannerImage;
    if (pageData.countdown) {
      updateData.countdowndays = pageData.countdown.days;
      updateData.countdownhours = pageData.countdown.hours;
      updateData.countdownminutes = pageData.countdown.minutes;
      updateData.countdownseconds = pageData.countdown.seconds;
    }

    const { error } = await supabase
      .from('pages')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating page:', error);
    return false;
  }
}

export async function deletePage(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting page:', error);
    return false;
  }
}

// ===== SONGS OPERATIONS =====

export async function getSongsByPageId(pageId: number): Promise<PraiseNightSong[]> {
  try {
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .eq('praisenightid', pageId)
      .order('id', { ascending: true });

    if (error) throw error;

    const praiseNightSongs: PraiseNightSong[] = [];
    
    for (const song of songs || []) {
      // Get comments and history for this song
      const [comments, history] = await Promise.all([
        getCommentsBySongId(song.id),
        getHistoryBySongId(song.id)
      ]);

      // Get audio file from media table if mediaId exists, otherwise use direct audiofile
      let audioFile = song.audiofile;
      if (song.mediaid) {
        const mediaAudioUrl = await getAudioFromMedia(song.mediaid);
        if (mediaAudioUrl) {
          audioFile = mediaAudioUrl;
        }
      }
      
      // Supabase Storage URLs work directly - no CORS issues!
      console.log('✅ Using audio file URL:', audioFile);

      praiseNightSongs.push({
        title: song.title,
        status: song.status,
        category: song.category,
        praiseNightId: song.praisenightid,
        leadSinger: song.leadsinger,
        writer: song.writer,
        conductor: song.conductor,
        key: song.key,
        tempo: song.tempo,
        leadKeyboardist: song.leadkeyboardist,
        leadGuitarist: song.leadguitarist,
        drummer: song.drummer,
        lyrics: song.lyrics,
        solfas: song.solfas,
        rehearsalCount: song.rehearsalcount,
        audioFile: audioFile,
        comments: comments,
        history: history
      });
    }

    return praiseNightSongs;
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
}

export async function createSong(songData: Omit<PraiseNightSong, 'comments' | 'history'>): Promise<PraiseNightSong | null> {
  try {
    console.log('💾 Creating song in database:', songData.title);
    const { data, error } = await supabase
      .from('songs')
      .insert({
        title: songData.title,
        status: songData.status,
        category: songData.category,
        praisenightid: songData.praiseNightId,
        leadsinger: songData.leadSinger,
        writer: songData.writer,
        conductor: songData.conductor,
        key: songData.key,
        tempo: songData.tempo,
        leadkeyboardist: songData.leadKeyboardist,
        leadguitarist: songData.leadGuitarist,
        drummer: songData.drummer,
        lyrics: songData.lyrics,
        solfas: songData.solfas,
        rehearsalcount: songData.rehearsalCount,
        audiofile: songData.audioFile,
        mediaid: songData.mediaId
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating song:', error);
      throw error;
    }

    console.log('✅ Song created in database:', data);
    return {
      title: data.title,
      status: data.status,
      category: data.category,
      praiseNightId: data.praisenightid,
      leadSinger: data.leadsinger,
      writer: data.writer,
      conductor: data.conductor,
      key: data.key,
      tempo: data.tempo,
      leadKeyboardist: data.leadkeyboardist,
      leadGuitarist: data.leadguitarist,
      drummer: data.drummer,
      lyrics: data.lyrics,
      solfas: data.solfas,
      rehearsalCount: data.rehearsalcount,
      audioFile: data.audiofile,
      comments: [],
      history: []
    };
  } catch (error) {
    console.error('Error creating song:', error);
    return null;
  }
}

export async function updateSong(songId: number, songData: Partial<PraiseNightSong>): Promise<boolean> {
  try {
    console.log('💾 updateSong called with:', { 
      songId, 
      category: songData.category, 
      title: songData.title,
      hasHistory: !!songData.history,
      historyCount: songData.history?.length || 0
    });
    const updateData: any = {};
    
    if (songData.title) updateData.title = songData.title;
    if (songData.status) updateData.status = songData.status;
    if (songData.category) {
      updateData.category = songData.category;
      console.log('💾 Updating category to:', songData.category);
    }
    if (songData.leadSinger !== undefined) updateData.leadsinger = songData.leadSinger;
    if (songData.writer !== undefined) updateData.writer = songData.writer;
    if (songData.conductor !== undefined) updateData.conductor = songData.conductor;
    if (songData.key !== undefined) updateData.key = songData.key;
    if (songData.tempo !== undefined) updateData.tempo = songData.tempo;
    if (songData.leadKeyboardist !== undefined) updateData.leadkeyboardist = songData.leadKeyboardist;
    if (songData.leadGuitarist !== undefined) updateData.leadguitarist = songData.leadGuitarist;
    if (songData.drummer !== undefined) updateData.drummer = songData.drummer;
    if (songData.lyrics) updateData.lyrics = songData.lyrics;
    if (songData.solfas) updateData.solfas = songData.solfas;
    if (songData.rehearsalCount !== undefined) updateData.rehearsalcount = songData.rehearsalCount;
    // Handle audio file updates - always update both fields together
    updateData.audiofile = songData.audioFile || null;
    updateData.mediaid = songData.mediaId || null;

    console.log('💾 Updating song in database:', {
      songId,
      audiofile: updateData.audiofile,
      mediaid: updateData.mediaid,
      hasAudioFile: !!updateData.audiofile,
      hasMediaId: !!updateData.mediaid
    });

    const { error } = await supabase
      .from('songs')
      .update(updateData)
      .eq('id', songId);

    if (error) {
      console.error('❌ Database error updating song:', error);
      throw error;
    }

    console.log('✅ Song updated in database');

    // Save history entries if provided
    if (songData.history && songData.history.length > 0) {
      console.log('💾 Saving', songData.history.length, 'history entries...');
      
      // Get existing history to avoid duplicates
      const existingHistory = await getHistoryBySongId(songId);
      const existingIds = new Set(existingHistory.map(h => h.id));
      
      // Only save new history entries
      const newHistoryEntries = songData.history.filter(h => !existingIds.has(h.id));
      
      for (const historyEntry of newHistoryEntries) {
        const savedEntry = await createHistoryEntry({
          ...historyEntry,
          songId: songId
        });
        
        if (savedEntry) {
          console.log('✅ Saved history entry:', historyEntry.type);
        } else {
          console.error('❌ Failed to save history entry:', historyEntry.type);
        }
      }
      
      console.log('✅ History entries saved');
    }

    return true;
  } catch (error) {
    console.error('Error updating song:', error);
    return false;
  }
}

export async function deleteSong(songId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting song:', error);
    return false;
  }
}

// ===== COMMENTS OPERATIONS =====

export async function getCommentsBySongId(songId: number): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('songid', songId)
      .order('createdat', { ascending: false });

    if (error) throw error;

    return (data || []).map(comment => ({
      id: comment.id,
      text: comment.text,
      date: comment.date,
      author: comment.author
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function createComment(commentData: Omit<Comment, 'id'> & { songId: number }): Promise<Comment | null> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        songid: commentData.songId,
        text: commentData.text,
        date: commentData.date,
        author: commentData.author
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      text: data.text,
      date: data.date,
      author: data.author
    };
  } catch (error) {
    console.error('Error creating comment:', error);
    return null;
  }
}

// ===== HISTORY OPERATIONS =====

export async function getHistoryBySongId(songId: number): Promise<HistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('song_history')
      .select('*')
      .eq('songid', songId)
      .order('createdat', { ascending: false });

    if (error) throw error;

    return (data || []).map(entry => ({
      id: entry.id,
      type: entry.type,
      content: entry.content,
      date: entry.date,
      version: entry.version
    }));
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

export async function createHistoryEntry(historyData: Omit<HistoryEntry, 'id'> & { songId: number }): Promise<HistoryEntry | null> {
  try {
    const { data, error } = await supabase
      .from('song_history')
      .insert({
        id: `${historyData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        songid: historyData.songId,
        type: historyData.type,
        content: historyData.content,
        date: historyData.date,
        version: historyData.version
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      type: data.type,
      content: data.content,
      date: data.date,
      version: data.version
    };
  } catch (error) {
    console.error('Error creating history entry:', error);
    return null;
  }
}

// ===== FILE UPLOAD OPERATIONS =====

export async function uploadFile(file: File, bucket: string = 'loveworld-praise'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

export async function deleteFile(filePath: string, bucket: string = 'loveworld-praise'): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// ===== CATEGORY MANAGEMENT FUNCTIONS =====

export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('isactive', true)
      .order('name');

    if (error) throw error;
    
    return data.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Music',
      color: cat.color || '#3B82F6',
      isActive: cat.isactive,
      createdAt: cat.createdat,
      updatedAt: cat.updatedat
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .insert({
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color,
        icon: categoryData.icon,
        isactive: categoryData.isActive
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating category:', error);
    return false;
  }
}

export async function updateCategory(categoryId: number, categoryData: Partial<Category>): Promise<boolean> {
  try {
    const updateData: any = {};
    
    if (categoryData.name) updateData.name = categoryData.name;
    if (categoryData.description !== undefined) updateData.description = categoryData.description;
    if (categoryData.color) updateData.color = categoryData.color;
    if (categoryData.icon) updateData.icon = categoryData.icon;
    if (categoryData.isActive !== undefined) updateData.isactive = categoryData.isActive;

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
}

export async function deleteCategory(categoryId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
}

// ===== CATEGORY OPERATIONS =====

export async function updateSongsCategory(oldCategoryName: string, newCategoryName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('songs')
      .update({ category: newCategoryName })
      .eq('category', oldCategoryName);

    if (error) throw error;
    
    console.log(`Updated all songs from category "${oldCategoryName}" to "${newCategoryName}"`);
    return true;
  } catch (error) {
    console.error('Error updating songs category:', error);
    return false;
  }
}

export async function getSongsByCategory(categoryName: string): Promise<PraiseNightSong[]> {
  try {
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .eq('category', categoryName)
      .order('id', { ascending: true });

    if (error) throw error;

    const praiseNightSongs: PraiseNightSong[] = [];
    
    for (const song of songs || []) {
      // Get comments and history for this song
      const [comments, history] = await Promise.all([
        getCommentsBySongId(song.id),
        getHistoryBySongId(song.id)
      ]);

      praiseNightSongs.push({
        title: song.title,
        status: song.status,
        category: song.category,
        praiseNightId: song.praisenightid,
        leadSinger: song.leadsinger,
        writer: song.writer,
        conductor: song.conductor,
        key: song.key,
        tempo: song.tempo,
        leadKeyboardist: song.leadkeyboardist,
        leadGuitarist: song.leadguitarist,
        drummer: song.drummer,
        lyrics: song.lyrics,
        solfas: song.solfas,
        rehearsalCount: song.rehearsalcount,
        audioFile: song.audiofile,
        comments: comments,
        history: history
      });
    }

    return praiseNightSongs;
  } catch (error) {
    console.error('Error fetching songs by category:', error);
    return [];
  }
}



export async function handleCategoryDeletion(categoryName: string, fallbackCategory: string = 'Uncategorized'): Promise<boolean> {
  try {
    // First, check if there are songs with this category
    const { data: songs, error: checkError } = await supabase
      .from('songs')
      .select('id, title')
      .eq('category', categoryName);

    if (checkError) throw checkError;

    if (songs && songs.length > 0) {
      // Update all songs to use the fallback category
      const { error: updateError } = await supabase
        .from('songs')
        .update({ category: fallbackCategory })
        .eq('category', categoryName);

      if (updateError) throw updateError;
      
      console.log(`Updated ${songs.length} songs from category "${categoryName}" to "${fallbackCategory}"`);
    }

    return true;
  } catch (error) {
    console.error('Error handling category deletion:', error);
    return false;
  }
}

// ===== MEDIA OPERATIONS =====

export interface MediaFile {
  id: number;
  name: string;
  url: string;
  type: 'image' | 'audio' | 'video' | 'document';
  size: number;
  folder?: string;
  storagePath?: string; // Path in Supabase Storage for deletion
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllMedia(): Promise<MediaFile[]> {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('uploadedat', { ascending: false });

    if (error) throw error;

    return (data || []).map(media => ({
      id: media.id,
      name: media.name,
      url: media.url,
      type: media.type,
      size: media.size,
      folder: media.folder,
      storagePath: media.storagepath, // Map Supabase Storage path
      uploadedAt: media.uploadedat,
      createdAt: media.createdat,
      updatedAt: media.updatedat
    }));
  } catch (error) {
    console.error('Error fetching media files:', error);
    return [];
  }
}

export async function createMediaFile(mediaData: Omit<MediaFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaFile | null> {
  try {
    const { data, error } = await supabase
      .from('media')
      .insert({
        name: mediaData.name,
        url: mediaData.url,
        type: mediaData.type,
        size: mediaData.size,
        folder: mediaData.folder,
        storagepath: mediaData.storagePath, // Use Supabase Storage path
        uploadedat: mediaData.uploadedAt
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      url: data.url,
      type: data.type,
      size: data.size,
      folder: data.folder,
      storagePath: data.storagepath, // Return Supabase Storage path
      uploadedAt: data.uploadedat,
      createdAt: data.createdat,
      updatedAt: data.updatedat
    };
  } catch (error) {
    console.error('Error creating media file:', error);
    return null;
  }
}

export async function deleteMediaFile(mediaId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting media file:', error);
    return false;
  }
}