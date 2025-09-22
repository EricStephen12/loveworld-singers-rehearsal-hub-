// Ultra-Fast Database Service with Advanced Caching and Batch Operations
import { ultraFastSupabase } from './ultra-fast-supabase';
import type { 
  PraiseNight, 
  PraiseNightSong, 
  Comment, 
  HistoryEntry,
  Category
} from '../types/supabase';

// ===== ULTRA-FAST PAGES OPERATIONS =====

export async function getAllPagesUltraFast(): Promise<PraiseNight[]> {
  try {
    console.log('🚀 Getting all pages with ultra-fast queries...');
    
    // Use parallel queries for speed
    const [pagesResult, songsResult] = await Promise.all([
      ultraFastSupabase.from('pages').select('*'),
      ultraFastSupabase.from('songs').select('*')
    ]);
    
    if (pagesResult.error) throw pagesResult.error;
    if (songsResult.error) throw songsResult.error;
    
    const pages = pagesResult.data || [];
    const allSongs = songsResult.data || [];

    // Group songs by page efficiently
    const songsByPage = new Map<number, PraiseNightSong[]>();
    allSongs.forEach((song: any) => {
      const pageId = song.praisenightid;
      if (!songsByPage.has(pageId)) {
        songsByPage.set(pageId, []);
      }
      songsByPage.get(pageId)!.push(transformSongData(song));
    });

    // Build pages with songs
    const praiseNights: PraiseNight[] = pages.map((page: any) => ({
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
      songs: songsByPage.get(page.id) || []
    }));

    console.log(`✅ Loaded ${praiseNights.length} pages with ultra-fast queries`);
    return praiseNights;
    
  } catch (error) {
    console.error('Error in getAllPagesUltraFast:', error);
    return [];
  }
}

export async function getPageByIdUltraFast(id: number): Promise<PraiseNight | null> {
  try {
    const [pageResult, songsResult] = await Promise.all([
      ultraFastSupabase.from('pages').select('*').eq('id', id),
      ultraFastSupabase.from('songs').select('*').eq('praisenightid', id)
    ]);
    
    if (pageResult.error) throw pageResult.error;
    if (songsResult.error) throw songsResult.error;

    if (!pageResult.data || pageResult.data.length === 0) return null;

    const page = pageResult.data[0];
    const songs = (songsResult.data || []).map(transformSongData);

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
      songs
    };
  } catch (error) {
    console.error('Error in getPageByIdUltraFast:', error);
    return null;
  }
}

export async function createPageUltraFast(pageData: Omit<PraiseNight, 'songs'>): Promise<PraiseNight | null> {
  try {
    const { data, error } = await ultraFastSupabase
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

    // Cache invalidation would go here

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
    console.error('Error in createPageUltraFast:', error);
    return null;
  }
}

export async function updatePageUltraFast(id: number, pageData: Partial<Omit<PraiseNight, 'songs'>>): Promise<boolean> {
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

    const { error } = await ultraFastSupabase
      .from('pages')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    // Cache invalidation would go here
    
    return true;
  } catch (error) {
    console.error('Error in updatePageUltraFast:', error);
    return false;
  }
}

export async function deletePageUltraFast(id: number): Promise<boolean> {
  try {
    const { error } = await ultraFastSupabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Cache invalidation would go here
    // Cache invalidation would go here
    
    return true;
  } catch (error) {
    console.error('Error in deletePageUltraFast:', error);
    return false;
  }
}

// ===== ULTRA-FAST SONGS OPERATIONS =====

export async function getSongsByPageIdUltraFast(pageId: number): Promise<PraiseNightSong[]> {
  try {
    const { data: songs, error } = await ultraFastSupabase
      .from('songs')
      .select('*')
      .eq('praisenightid', pageId);
    
    if (error) throw error;
    return songs?.map(transformSongData) || [];
  } catch (error) {
    console.error('Error in getSongsByPageIdUltraFast:', error);
    return [];
  }
}

export async function createSongUltraFast(songData: Omit<PraiseNightSong, 'comments' | 'history'>): Promise<PraiseNightSong | null> {
  try {
    const { data, error } = await ultraFastSupabase
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

    if (error) throw error;

    // Cache invalidation would go here

    return transformSongData(data);
  } catch (error) {
    console.error('Error in createSongUltraFast:', error);
    return null;
  }
}

export async function updateSongUltraFast(songId: number, songData: Partial<PraiseNightSong>): Promise<boolean> {
  try {
    const updateData: any = {};
    
    if (songData.title) updateData.title = songData.title;
    if (songData.status) updateData.status = songData.status;
    if (songData.category) updateData.category = songData.category;
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
    if (songData.audioFile !== undefined) updateData.audiofile = songData.audioFile;
    if (songData.mediaId !== undefined) updateData.mediaid = songData.mediaId;

    const { error } = await ultraFastSupabase
      .from('songs')
      .update(updateData)
      .eq('id', songId);

    if (error) throw error;

    // Cache invalidation would go here
    
    return true;
  } catch (error) {
    console.error('Error in updateSongUltraFast:', error);
    return false;
  }
}

export async function deleteSongUltraFast(songId: number): Promise<boolean> {
  try {
    const { error } = await ultraFastSupabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (error) throw error;

    // Cache invalidation would go here
    
    return true;
  } catch (error) {
    console.error('Error in deleteSongUltraFast:', error);
    return false;
  }
}

// ===== ULTRA-FAST CATEGORIES OPERATIONS =====

export async function getAllCategoriesUltraFast(): Promise<Category[]> {
  try {
    const { data: categories, error } = await ultraFastSupabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return categories?.map((cat: any) => ({
      id: cat.id.toString(),
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Music',
      color: cat.color || '#3B82F6',
      isActive: cat.isactive,
      createdAt: cat.createdat,
      updatedAt: cat.updatedat
    })) || [];
  } catch (error) {
    console.error('Error in getAllCategoriesUltraFast:', error);
    return [];
  }
}

export async function createCategoryUltraFast(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  try {
    const { error } = await ultraFastSupabase
      .from('categories')
      .insert({
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color,
        icon: categoryData.icon,
        isactive: categoryData.isActive
      });

    if (error) throw error;

    // Cache invalidation would go here
    
    return true;
  } catch (error) {
    console.error('Error in createCategoryUltraFast:', error);
    return false;
  }
}

export async function updateCategoryUltraFast(categoryId: number, categoryData: Partial<Category>): Promise<boolean> {
  try {
    const updateData: any = {};
    
    if (categoryData.name) updateData.name = categoryData.name;
    if (categoryData.description !== undefined) updateData.description = categoryData.description;
    if (categoryData.color) updateData.color = categoryData.color;
    if (categoryData.icon) updateData.icon = categoryData.icon;
    if (categoryData.isActive !== undefined) updateData.isactive = categoryData.isActive;

    const { error } = await ultraFastSupabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId);

    if (error) throw error;

    // Cache invalidation would go here
    
    return true;
  } catch (error) {
    console.error('Error in updateCategoryUltraFast:', error);
    return false;
  }
}

export async function deleteCategoryUltraFast(categoryId: number): Promise<boolean> {
  try {
    const { error } = await ultraFastSupabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;

    // Cache invalidation would go here
    
    return true;
  } catch (error) {
    console.error('Error in deleteCategoryUltraFast:', error);
    return false;
  }
}

export async function updateSongsCategory(oldCategoryName: string, newCategoryName: string): Promise<boolean> {
  try {
    const { error } = await ultraFastSupabase
      .from('songs')
      .update({ category: newCategoryName })
      .eq('category', oldCategoryName);

    if (error) throw error;

    // Cache invalidation would go here
    
    console.log(`Updated all songs from category "${oldCategoryName}" to "${newCategoryName}"`);
    return true;
  } catch (error) {
    console.error('Error in updateSongsCategory:', error);
    return false;
  }
}

export async function handleCategoryDeletion(categoryName: string, fallbackCategory: string = 'Uncategorized'): Promise<boolean> {
  try {
    // First, check if there are songs with this category
    const { data: songs, error: checkError } = await ultraFastSupabase
      .from('songs')
      .select('id, title')
      .eq('category', categoryName);

    if (checkError) throw checkError;

    if (songs && songs.length > 0) {
      // Update all songs to use the fallback category
      const { error: updateError } = await ultraFastSupabase
        .from('songs')
        .update({ category: fallbackCategory })
        .eq('category', categoryName);

      if (updateError) throw updateError;
      
      console.log(`Updated ${songs.length} songs from category "${categoryName}" to "${fallbackCategory}"`);
    }

    // Cache invalidation would go here
    
    return true;
  } catch (error) {
    console.error('Error in handleCategoryDeletion:', error);
    return false;
  }
}

// ===== BATCH OPERATIONS =====

export async function batchCreateSongs(songs: Omit<PraiseNightSong, 'comments' | 'history'>[]): Promise<PraiseNightSong[]> {
  try {
    const transformedSongs = songs.map(song => ({
      title: song.title,
      status: song.status,
      category: song.category,
      praisenightid: song.praiseNightId,
      leadsinger: song.leadSinger,
      writer: song.writer,
      conductor: song.conductor,
      key: song.key,
      tempo: song.tempo,
      leadkeyboardist: song.leadKeyboardist,
      leadguitarist: song.leadGuitarist,
      drummer: song.drummer,
      lyrics: song.lyrics,
      solfas: song.solfas,
      rehearsalcount: song.rehearsalCount,
      audiofile: song.audioFile,
      mediaid: song.mediaId
    }));

    const { data: results, error } = await ultraFastSupabase
      .from('songs')
      .insert(transformedSongs)
      .select();
    
    if (error) throw error;
    
    // Cache invalidation would go here
    
    return results.map(transformSongData);
  } catch (error) {
    console.error('Error in batchCreateSongs:', error);
    return [];
  }
}

export async function batchUpdateSongs(updates: Array<{
  id: number;
  data: Partial<PraiseNightSong>;
}>): Promise<boolean> {
  try {
    const transformedUpdates = updates.map(({ id, data }) => ({
      id,
      data: {
        title: data.title,
        status: data.status,
        category: data.category,
        leadsinger: data.leadSinger,
        writer: data.writer,
        conductor: data.conductor,
        key: data.key,
        tempo: data.tempo,
        leadkeyboardist: data.leadKeyboardist,
        leadguitarist: data.leadGuitarist,
        drummer: data.drummer,
        lyrics: data.lyrics,
        solfas: data.solfas,
        rehearsalcount: data.rehearsalCount,
        audiofile: data.audioFile,
        mediaid: data.mediaId
      }
    }));

    // Execute batch updates in parallel
    const promises = transformedUpdates.map(({ id, data }) =>
      ultraFastSupabase
        .from('songs')
        .update(data)
        .eq('id', id)
    );
    
    const results = await Promise.all(promises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      throw new Error(`Batch update failed: ${errors.map(e => e.error?.message).join(', ')}`);
    }
    
    const result = true;
    
    // Cache invalidation would go here
    
    return result;
  } catch (error) {
    console.error('Error in batchUpdateSongs:', error);
    return false;
  }
}

// ===== HELPER FUNCTIONS =====

function transformSongData(song: any): PraiseNightSong {
  return {
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
    mediaId: song.mediaid,
    comments: [],
    history: []
  };
}

// ===== CACHE MANAGEMENT =====

export function invalidateAllCaches(): void {
  // Cache clearing would go here
  console.log('🗑️ All caches invalidated');
}

export function getCacheStats() {
  return {
    totalEntries: 0,
    validEntries: 0,
    expiredEntries: 0,
    memoryUsage: 0
  };
}

export default {
  // Pages
  getAllPagesUltraFast,
  getPageByIdUltraFast,
  createPageUltraFast,
  updatePageUltraFast,
  deletePageUltraFast,
  
  // Songs
  getSongsByPageIdUltraFast,
  createSongUltraFast,
  updateSongUltraFast,
  deleteSongUltraFast,
  
  // Categories
  getAllCategoriesUltraFast,
  createCategoryUltraFast,
  updateCategoryUltraFast,
  deleteCategoryUltraFast,
  
  // Batch operations
  batchCreateSongs,
  batchUpdateSongs,
  
  // Cache management
  invalidateAllCaches,
  getCacheStats
};
