// Firebase Database Service for Loveworld Praise App
// This service replaces Supabase with Firebase Firestore

import { FirebaseDatabaseService } from './firebase-database'
// Cloudinary integration temporarily disabled to fix build errors
import type { 
  PraiseNight, 
  PraiseNightSong, 
  Comment, 
  HistoryEntry,
  Category
} from '../types/supabase'

// ===== PAGES OPERATIONS =====

export async function getAllPages(): Promise<PraiseNight[]> {
  try {
    console.log('🚀 Starting Firebase data fetch...')
    const startTime = performance.now()

    const pages = await FirebaseDatabaseService.getCollection('pages')
    const praiseNights: PraiseNight[] = []

    for (const page of pages) {
      // Get songs for this page
      const songs = await getSongsByPageId(parseInt(page.id))
      
      praiseNights.push({
        id: parseInt(page.id),
        name: (page as any).name,
        date: (page as any).date,
        location: (page as any).location,
        category: (page as any).category,
        bannerImage: (page as any).bannerImage,
        countdown: {
          days: (page as any).countdownDays,
          hours: (page as any).countdownHours,
          minutes: (page as any).countdownMinutes,
          seconds: (page as any).countdownSeconds
        },
        songs: songs
      })
    }

    const loadTime = performance.now() - startTime
    console.log(`⚡ Firebase data loaded in ${loadTime.toFixed(2)}ms`)

    return praiseNights
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}

export async function getPageById(id: number): Promise<PraiseNight | null> {
  try {
    const page = await FirebaseDatabaseService.getDocument('pages', id.toString())
    if (!page) return null

    const songs = await getSongsByPageId(id)

    return {
      id: parseInt(page.id),
      name: (page as any).name,
      date: (page as any).date,
      location: (page as any).location,
      category: (page as any).category,
      bannerImage: (page as any).bannerImage,
      countdown: {
        days: (page as any).countdownDays,
        hours: (page as any).countdownHours,
        minutes: (page as any).countdownMinutes,
        seconds: (page as any).countdownSeconds
      },
      songs: songs
    }
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export async function createPage(pageData: Omit<PraiseNight, 'songs'>): Promise<PraiseNight | null> {
  try {
    const docId = Date.now().toString() // Generate unique ID
    const pageDoc = {
      id: parseInt(docId),
      name: pageData.name,
      date: pageData.date,
      location: pageData.location,
      category: pageData.category,
      bannerImage: pageData.bannerImage,
      countdownDays: pageData.countdown.days,
      countdownHours: pageData.countdown.hours,
      countdownMinutes: pageData.countdown.minutes,
      countdownSeconds: pageData.countdown.seconds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await FirebaseDatabaseService.createDocument('pages', docId, pageDoc)

    return {
      id: pageDoc.id,
      name: pageDoc.name,
      date: pageDoc.date,
      location: pageDoc.location,
      category: pageDoc.category,
      bannerImage: pageDoc.bannerImage,
      countdown: {
        days: pageDoc.countdownDays,
        hours: pageDoc.countdownHours,
        minutes: pageDoc.countdownMinutes,
        seconds: pageDoc.countdownSeconds
      },
      songs: []
    }
  } catch (error) {
    console.error('Error creating page:', error)
    return null
  }
}

export async function updatePage(id: number, pageData: Partial<Omit<PraiseNight, 'songs'>>): Promise<boolean> {
  try {
    const updateData: any = {}

    if (pageData.name) updateData.name = pageData.name
    if (pageData.date) updateData.date = pageData.date
    if (pageData.location) updateData.location = pageData.location
    if (pageData.category) updateData.category = pageData.category
    if (pageData.bannerImage !== undefined) updateData.bannerImage = pageData.bannerImage
    if (pageData.countdown) {
      updateData.countdownDays = pageData.countdown.days
      updateData.countdownHours = pageData.countdown.hours
      updateData.countdownMinutes = pageData.countdown.minutes
      updateData.countdownSeconds = pageData.countdown.seconds
    }

    updateData.updatedAt = new Date().toISOString()

    await FirebaseDatabaseService.updateDocument('pages', id.toString(), updateData)
    return true
  } catch (error) {
    console.error('Error updating page:', error)
    return false
  }
}

export async function deletePage(id: number): Promise<boolean> {
  try {
    await FirebaseDatabaseService.deleteDocument('pages', id.toString())
    return true
  } catch (error) {
    console.error('Error deleting page:', error)
    return false
  }
}

// ===== SONGS OPERATIONS =====

// Get song by ID without caching (real-time)
export async function getSongById(songId: string): Promise<PraiseNightSong | null> {
  try {
    console.log('🔥 Fetching real-time song from Firebase:', songId);
    const song = await FirebaseDatabaseService.getDocument('songs', songId);
    
    if (song) {
      console.log('✅ Real-time song fetched from Firebase:', (song as any).title);
      return song as any as PraiseNightSong;
    }
    
    console.log('❌ Song not found:', songId);
    return null;
  } catch (error) {
    console.error('Error fetching song:', error);
    return null;
  }
}

export async function getSongsByPageId(pageId: number): Promise<PraiseNightSong[]> {
  try {
    const songs = await FirebaseDatabaseService.getCollectionWhere('songs', 'praiseNightId', '==', pageId)
    const praiseNightSongs: PraiseNightSong[] = []

    for (const song of songs) {
      const [comments, history] = await Promise.all([
        getCommentsBySongId(parseInt(song.id)),
        getHistoryBySongId(parseInt(song.id))
      ])

      // Get audio file directly from song document fields
      const audioFile = (song as any).audioFile || (song as any).audiofile || (song as any).audio_url || (song as any).media_url;
      
      // Debug: Log audio file mapping
      console.log('🔍 Song audio mapping:', {
        songTitle: (song as any).title,
        audioFile: (song as any).audioFile,
        audiofile: (song as any).audiofile,
        finalAudioFile: audioFile,
        hasAudio: !!audioFile
      });

      praiseNightSongs.push({
        id: parseInt(song.id),
        title: (song as any).title,
        status: (song as any).status,
        category: (song as any).category,
        praiseNightId: (song as any).praiseNightId,
        leadSinger: (song as any).leadSinger,
        writer: (song as any).writer,
        conductor: (song as any).conductor,
        key: (song as any).key,
        tempo: (song as any).tempo,
        leadKeyboardist: (song as any).leadKeyboardist,
        leadGuitarist: (song as any).leadGuitarist,
        drummer: (song as any).drummer,
        lyrics: (song as any).lyrics,
        solfas: (song as any).solfas,
        rehearsalCount: (song as any).rehearsalCount,
        audioFile: audioFile,
        comments: comments,
        history: history
      })
    }

    return praiseNightSongs
  } catch (error) {
    console.error('Error fetching songs:', error)
    return []
  }
}

export async function createSong(songData: Omit<PraiseNightSong, 'comments' | 'history'>): Promise<PraiseNightSong | null> {
  try {
    const docId = Date.now().toString()
    const songDoc = {
      id: parseInt(docId),
      title: songData.title,
      status: songData.status,
      category: songData.category,
      praiseNightId: songData.praiseNightId,
      leadSinger: songData.leadSinger,
      writer: songData.writer,
      conductor: songData.conductor,
      key: songData.key,
      tempo: songData.tempo,
      leadKeyboardist: songData.leadKeyboardist,
      leadGuitarist: songData.leadGuitarist,
      drummer: songData.drummer,
      lyrics: songData.lyrics,
      solfas: songData.solfas,
      rehearsalCount: songData.rehearsalCount,
      audioFile: songData.audioFile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await FirebaseDatabaseService.createDocument('songs', docId, songDoc)

    return {
      title: songDoc.title,
      status: songDoc.status,
      category: songDoc.category,
      praiseNightId: songDoc.praiseNightId,
      leadSinger: songDoc.leadSinger,
      writer: songDoc.writer,
      conductor: songDoc.conductor,
      key: songDoc.key,
      tempo: songDoc.tempo,
      leadKeyboardist: songDoc.leadKeyboardist,
      leadGuitarist: songDoc.leadGuitarist,
      drummer: songDoc.drummer,
      lyrics: songDoc.lyrics,
      solfas: songDoc.solfas,
      rehearsalCount: songDoc.rehearsalCount,
      audioFile: songDoc.audioFile,
      comments: [],
      history: []
    }
  } catch (error) {
    console.error('Error creating song:', error)
    return null
  }
}

export async function updateSong(songId: number, songData: Partial<PraiseNightSong>): Promise<boolean> {
  try {
    const updateData: any = {}

    if (songData.title !== undefined) updateData.title = songData.title
    if (songData.status !== undefined) updateData.status = songData.status
    if (songData.category !== undefined) updateData.category = songData.category
    if (songData.leadSinger !== undefined) updateData.leadSinger = songData.leadSinger
    if (songData.writer !== undefined) updateData.writer = songData.writer
    if (songData.conductor !== undefined) updateData.conductor = songData.conductor
    if (songData.key !== undefined) updateData.key = songData.key
    if (songData.tempo !== undefined) updateData.tempo = songData.tempo
    if (songData.leadKeyboardist !== undefined) updateData.leadKeyboardist = songData.leadKeyboardist
    if (songData.leadGuitarist !== undefined) updateData.leadGuitarist = songData.leadGuitarist
    if (songData.drummer !== undefined) updateData.drummer = songData.drummer
    if (songData.lyrics !== undefined) updateData.lyrics = songData.lyrics
    if (songData.solfas !== undefined) updateData.solfas = songData.solfas
    if (songData.rehearsalCount !== undefined) updateData.rehearsalCount = songData.rehearsalCount
    if (songData.audioFile !== undefined) updateData.audioFile = songData.audioFile

    updateData.updatedAt = new Date().toISOString()

    await FirebaseDatabaseService.updateDocument('songs', songId.toString(), updateData)

    // Save history entries if provided
    if (songData.history && songData.history.length > 0) {
      for (const historyEntry of songData.history) {
        await createHistoryEntry({
          ...historyEntry,
          song_id: songId
        })
      }
    }

    return true
  } catch (error) {
    console.error('Error updating song:', error)
    return false
  }
}

export async function deleteSong(songId: number): Promise<boolean> {
  try {
    await FirebaseDatabaseService.deleteDocument('songs', songId.toString())
    return true
  } catch (error) {
    console.error('Error deleting song:', error)
    return false
  }
}

// ===== COMMENTS OPERATIONS =====

export async function getCommentsBySongId(songId: number): Promise<Comment[]> {
  try {
    const comments = await FirebaseDatabaseService.getCollectionWhere('comments', 'songId', '==', songId)
    return comments.map(comment => ({
      id: comment.id,
      text: (comment as any).text,
      date: (comment as any).date,
      author: (comment as any).author
    }))
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export async function createComment(commentData: Omit<Comment, 'id'> & { songId: number }): Promise<Comment | null> {
  try {
    const docId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const commentDoc = {
      id: docId,
      songId: commentData.songId,
      text: commentData.text,
      date: commentData.date,
      author: commentData.author,
      createdAt: new Date().toISOString()
    }

    await FirebaseDatabaseService.createDocument('comments', docId, commentDoc)

    return {
      id: commentDoc.id,
      text: commentDoc.text,
      date: commentDoc.date,
      author: commentDoc.author
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    return null
  }
}

// ===== HISTORY OPERATIONS =====

export async function getHistoryBySongId(songId: number): Promise<HistoryEntry[]> {
  try {
    const history = await FirebaseDatabaseService.getCollectionWhere('song_history', 'song_id', '==', songId)
    return history.map(entry => ({
      id: entry.id,
      type: (entry as any).type,
      title: (entry as any).title,
      description: (entry as any).description,
      old_value: (entry as any).old_value,
      new_value: (entry as any).new_value,
      created_by: (entry as any).created_by,
      date: (entry as any).created_at,
      version: (entry as any).title
    }))
  } catch (error) {
    console.error('Error fetching history:', error)
    return []
  }
}

export async function createHistoryEntry(historyData: {
  song_id: number
  title: string
  description: string
  type: string
  old_value: string
  new_value: string
  created_by: string
}): Promise<boolean> {
  try {
    const docId = `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const historyDoc = {
      id: docId,
      song_id: historyData.song_id,
      title: historyData.title,
      description: historyData.description,
      type: historyData.type,
      old_value: historyData.old_value,
      new_value: historyData.new_value,
      created_by: historyData.created_by,
      created_at: new Date().toISOString()
    }

    await FirebaseDatabaseService.createDocument('song_history', docId, historyDoc)
    return true
  } catch (error) {
    console.error('Error creating history entry:', error)
    return false
  }
}

// ===== FILE UPLOAD OPERATIONS =====

export async function uploadFile(file: File, folder: string = 'loveworld-praise'): Promise<string | null> {
  try {
    // TODO: Implement Cloudinary upload when environment is set up
    console.log('File upload not implemented yet. Please set up Cloudinary first.')
    return null
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    // TODO: Implement Cloudinary delete when environment is set up
    console.log('File delete not implemented yet. Please set up Cloudinary first.')
    return false
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

// ===== CATEGORY MANAGEMENT FUNCTIONS =====

export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories = await FirebaseDatabaseService.getCollectionWhere('categories', 'isActive', '==', true)
    return categories.map(cat => ({
      id: cat.id,
      name: (cat as any).name,
      description: (cat as any).description || '',
      icon: (cat as any).icon || 'Music',
      color: (cat as any).color || '#3B82F6',
      isActive: (cat as any).isActive,
      createdAt: (cat as any).createdAt,
      updatedAt: (cat as any).updatedAt
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  try {
    const docId = Date.now().toString()
    const categoryDoc = {
      id: docId,
      name: categoryData.name,
      description: categoryData.description,
      color: categoryData.color,
      icon: categoryData.icon,
      isActive: categoryData.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await FirebaseDatabaseService.createDocument('categories', docId, categoryDoc)
    return true
  } catch (error) {
    console.error('Error creating category:', error)
    return false
  }
}

export async function updateCategory(categoryId: string, categoryData: Partial<Category>): Promise<boolean> {
  try {
    const updateData: any = {}
    
    if (categoryData.name) updateData.name = categoryData.name
    if (categoryData.description !== undefined) updateData.description = categoryData.description
    if (categoryData.color) updateData.color = categoryData.color
    if (categoryData.icon) updateData.icon = categoryData.icon
    if (categoryData.isActive !== undefined) updateData.isActive = categoryData.isActive

    updateData.updatedAt = new Date().toISOString()

    await FirebaseDatabaseService.updateDocument('categories', categoryId, updateData)
    return true
  } catch (error) {
    console.error('Error updating category:', error)
    return false
  }
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    await FirebaseDatabaseService.deleteDocument('categories', categoryId)
    return true
  } catch (error) {
    console.error('Error deleting category:', error)
    return false
  }
}

// ===== CATEGORY OPERATIONS =====

export async function updateSongsCategory(oldCategoryName: string, newCategoryName: string): Promise<boolean> {
  try {
    const songs = await FirebaseDatabaseService.getCollectionWhere('songs', 'category', '==', oldCategoryName)
    
    for (const song of songs) {
      await FirebaseDatabaseService.updateDocument('songs', song.id.toString(), {
        category: newCategoryName,
        updatedAt: new Date().toISOString()
      })
    }
    
    console.log(`Updated ${songs.length} songs from category "${oldCategoryName}" to "${newCategoryName}"`)
    return true
  } catch (error) {
    console.error('Error updating songs category:', error)
    return false
  }
}

export async function getSongsByCategory(categoryName: string): Promise<PraiseNightSong[]> {
  try {
    const songs = await FirebaseDatabaseService.getCollectionWhere('songs', 'category', '==', categoryName)
    const praiseNightSongs: PraiseNightSong[] = []
    
    for (const song of songs) {
      const [comments, history] = await Promise.all([
        getCommentsBySongId(parseInt(song.id)),
        getHistoryBySongId(parseInt(song.id))
      ])

      // Get audio file directly from song document fields
      const audioFile = (song as any).audioFile || (song as any).audiofile || (song as any).audio_url || (song as any).media_url;
      
      // Debug: Log audio file mapping
      console.log('🔍 Song audio mapping (category):', {
        songTitle: (song as any).title,
        audioFile: (song as any).audioFile,
        audiofile: (song as any).audiofile,
        finalAudioFile: audioFile,
        hasAudio: !!audioFile
      });

      praiseNightSongs.push({
        id: parseInt(song.id),
        title: (song as any).title,
        status: (song as any).status,
        category: (song as any).category,
        praiseNightId: (song as any).praiseNightId,
        leadSinger: (song as any).leadSinger,
        writer: (song as any).writer,
        conductor: (song as any).conductor,
        key: (song as any).key,
        tempo: (song as any).tempo,
        leadKeyboardist: (song as any).leadKeyboardist,
        leadGuitarist: (song as any).leadGuitarist,
        drummer: (song as any).drummer,
        lyrics: (song as any).lyrics,
        solfas: (song as any).solfas,
        rehearsalCount: (song as any).rehearsalCount,
        audioFile: audioFile,
        comments: comments,
        history: history
      })
    }

    return praiseNightSongs
  } catch (error) {
    console.error('Error fetching songs by category:', error)
    return []
  }
}

export async function handleCategoryDeletion(categoryName: string, fallbackCategory: string = 'Uncategorized'): Promise<boolean> {
  try {
    const songs = await FirebaseDatabaseService.getCollectionWhere('songs', 'category', '==', categoryName)
    
    for (const song of songs) {
      await FirebaseDatabaseService.updateDocument('songs', song.id.toString(), {
        category: fallbackCategory,
        updatedAt: new Date().toISOString()
      })
    }
    
    console.log(`Updated ${songs.length} songs from category "${categoryName}" to "${fallbackCategory}"`)
    return true
  } catch (error) {
    console.error('Error handling category deletion:', error)
    return false
  }
}

// ===== USER MANAGEMENT OPERATIONS =====

export async function getAllUsers(): Promise<any[]> {
  try {
    const users = await FirebaseDatabaseService.getCollection('profiles')
    return users || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function getUserStats(): Promise<{total: number, recent: number, active: number}> {
  try {
    const users = await FirebaseDatabaseService.getCollection('profiles')
    
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const total = users?.length || 0
    const recent = users?.filter(user => new Date((user as any).createdAt) > lastWeek).length || 0
    const active = users?.filter(user => 
      (user as any).updatedAt && new Date((user as any).updatedAt) > lastMonth
    ).length || 0

    return { total, recent, active }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return { total: 0, recent: 0, active: 0 }
  }
}
