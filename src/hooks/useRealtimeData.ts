import { useEffect, useState } from 'react';
import { PraiseNight, PraiseNightSong } from '@/types/supabase';
import { offlineManager } from '@/utils/offlineManager';
import { dataPrefetcher } from '@/utils/dataPrefetcher';
import { FirebaseDatabaseService } from '@/lib/firebase-database';

// Firebase data fetching function using the service
async function fetchFirebaseData(): Promise<PraiseNight[]> {
  try {
    console.log('🔍 Fetching pages from Firebase using service...');
    
    // Try multiple collection names to find the data
    const possiblePageCollections = ['praise_nights', 'pages', 'praise_nights_collection', 'pages_collection'];
    let pages: any[] = [];
    
    for (const collectionName of possiblePageCollections) {
      try {
        console.log(`🔍 Trying collection: ${collectionName}`);
        pages = await FirebaseDatabaseService.getCollection(collectionName);
        console.log(`🔥 Firebase ${collectionName} fetched:`, pages.length, 'items');
        if (pages.length > 0) {
          console.log(`✅ Found data in collection: ${collectionName}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Collection ${collectionName} failed:`, error);
      }
    }
    
    console.log('📄 Pages data:', pages);
    console.log('📄 Sample page structure:', pages[0]);
    console.log('📄 All pages with details:', pages.map(page => ({
      id: page.id,
      page_id: (page as any).page_id,
      name: (page as any).name,
      allFields: Object.keys(page),
      rawData: page
    })));
    
    // Debug: Show all page IDs that exist
    console.log('📄 Available page IDs:', pages.map(page => ({
      id: page.id,
      page_id: (page as any).page_id,
      firebaseId: (page as any).firebaseId,
      supabaseId: (page as any).supabaseId,
      name: (page as any).name
    })));
    
    // Get songs for each page - try multiple collection names
    const possibleSongCollections = ['songs', 'songs_collection', 'song_collection'];
    let allSongs: any[] = [];
    
    for (const collectionName of possibleSongCollections) {
      try {
        console.log(`🔍 Trying songs collection: ${collectionName}`);
        allSongs = await FirebaseDatabaseService.getCollection(collectionName);
        console.log(`🔥 Firebase ${collectionName} fetched:`, allSongs.length, 'songs');
        if (allSongs.length > 0) {
          console.log(`✅ Found songs in collection: ${collectionName}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Songs collection ${collectionName} failed:`, error);
      }
    }
    console.log('🔥 Sample song data:', allSongs[0]);
    console.log('🔥 All songs with details:', allSongs.map(song => ({
      id: song.id,
      firebaseId: song.firebaseId,
      title: (song as any).title,
      category: (song as any).category,
      status: (song as any).status,
      praiseNightId: (song as any).praisenightid || (song as any).praiseNightId,
      allFields: Object.keys(song),
      rawData: song
    })));
    
    // Debug: Show all song praiseNightIds that exist
    console.log('🔥 Available song praiseNightIds:', allSongs.map(song => ({
      title: (song as any).title,
      praisenightid: (song as any).praisenightid,
      praiseNightId: (song as any).praiseNightId,
      category: (song as any).category
    })));
    
    // Associate songs with their respective pages and map to correct format
    const pagesWithSongs = pages.map((page, index) => {
      console.log(`📄 Page ${index} Firebase data:`, {
        id: page.id,
        name: (page as any).name || (page as any).title || (page as any).page_title,
        countdownDays: (page as any).countdownDays,
        countdownHours: (page as any).countdownHours,
        countdownMinutes: (page as any).countdownMinutes,
        countdownSeconds: (page as any).countdownSeconds,
        countdown: (page as any).countdown,
        allFields: Object.keys(page)
      });
      
      // Debug the countdown mapping
      const mappedCountdown = {
        days: (page as any).countdownDays || (page as any).countdown?.days || 0,
        hours: (page as any).countdownHours || (page as any).countdown?.hours || 0,
        minutes: (page as any).countdownMinutes || (page as any).countdown?.minutes || 0,
        seconds: (page as any).countdownSeconds || (page as any).countdown?.seconds || 0
      };
      
      console.log(`📄 Page ${index} Mapped countdown:`, mappedCountdown);
      
      return {
        id: parseInt((page as any).page_id) || 0, // Use page_id (numeric) for UI compatibility
        firebaseId: page.id, // This is the actual Firebase document ID (string)
        name: (page as any).name || (page as any).title || (page as any).page_title || 'Untitled Page', // Use name or title
        date: (page as any).date || new Date().toISOString(),
        location: (page as any).location || '',
        category: (page as any).category || 'ongoing',
        bannerImage: (page as any).bannerImage || (page as any).bannerimage || '',
        countdown: {
          days: (page as any).countdownDays || (page as any).countdown?.days || 0,
          hours: (page as any).countdownHours || (page as any).countdown?.hours || 0,
          minutes: (page as any).countdownMinutes || (page as any).countdown?.minutes || 0,
          seconds: (page as any).countdownSeconds || (page as any).countdown?.seconds || 0
        },
        songs: allSongs.filter(song => {
          // Handle both old (Supabase) and new (Firebase) field names
          const songPraiseNightId = (song as any).praisenightid || (song as any).praiseNightId;
          const pageId = (page as any).page_id || page.id;
          const pageFirebaseId = (page as any).firebaseId;
          const pageSupabaseId = (page as any).supabaseId;
          
          // Try multiple matching strategies for both old and new songs
          const matches = songPraiseNightId === pageId || 
                         songPraiseNightId === pageFirebaseId ||
                         songPraiseNightId === page.id ||
                         songPraiseNightId === (page as any).page_id ||
                         songPraiseNightId === pageSupabaseId ||
                         // Handle string/number conversion
                         songPraiseNightId === parseInt(pageId?.toString() || '0') ||
                         songPraiseNightId === parseInt(pageFirebaseId?.toString() || '0') ||
                         songPraiseNightId === parseInt(pageSupabaseId?.toString() || '0') ||
                         parseInt(songPraiseNightId?.toString() || '0') === pageId ||
                         parseInt(songPraiseNightId?.toString() || '0') === pageFirebaseId ||
                         parseInt(songPraiseNightId?.toString() || '0') === pageSupabaseId;
          
          console.log('🔍 Song-Page matching:', {
            songTitle: (song as any).title,
            songPraiseNightId,
            songPraiseNightIdType: typeof songPraiseNightId,
            pageId,
            pageFirebaseId,
            pageSupabaseId,
            pageIdDirect: page.id,
            pageIdField: (page as any).page_id,
            matches,
            songCategory: (song as any).category,
            songFields: Object.keys(song)
          });
          
          return matches;
        }).map(song => {
          console.log('🎵 Mapping song:', {
            songId: song.id,
            songFirebaseId: song.firebaseId,
            songTitle: (song as any).title,
            allKeys: Object.keys(song),
            songData: song
          });
          
          // Check if we have a valid Firebase document ID
          if (!song.firebaseId || song.firebaseId === '0' || (song.firebaseId as any) === 0) {
            console.error('❌ Invalid Firebase document ID for song:', {
              songTitle: (song as any).title,
              songCategory: (song as any).category,
              songFirebaseId: song.firebaseId,
              songId: song.id
            });
            return null; // Skip this song
          }
          return {
          id: song.supabaseId || Math.floor(Math.random() * 1000000), // Use Supabase ID if available, otherwise generate random
          firebaseId: song.firebaseId, // Use Firebase document ID (string) for Firebase operations
          title: (song as any).title || 'Untitled Song',
          status: (song as any).status || 'unheard',
          category: (song as any).category || '',
          praiseNightId: parseInt((song as any).praisenightid || (song as any).praiseNightId) || 0,
          leadSinger: (song as any).leadsinger || (song as any).leadSinger || '',
          writer: (song as any).writer || '',
          conductor: (song as any).conductor || '',
          key: (song as any).key || '',
          tempo: (song as any).tempo || '',
          leadKeyboardist: (song as any).leadkeyboardist || (song as any).leadKeyboardist || '',
          leadGuitarist: (song as any).leadguitarist || (song as any).leadGuitarist || '',
          drummer: (song as any).drummer || '',
          lyrics: (song as any).lyrics || '',
          solfas: (song as any).solfas || '',
          rehearsalCount: (song as any).rehearsalcount || (song as any).rehearsalCount || 0,
          audioFile: (song as any).audiofile || (song as any).audioFile || '',
          comments: (() => {
            const comments = (song as any).comments || [];
            console.log('🔍 Comments Debug in useRealtimeData:', {
              songTitle: (song as any).title,
              hasComments: !!comments,
              commentsType: typeof comments,
              commentsIsArray: Array.isArray(comments),
              commentsLength: comments?.length || 0,
              commentsData: comments
            });
            return comments;
          })(),
          history: (song as any).history || []
        };
        }).filter(song => song !== null) // Filter out null songs
      };
    });
    
    console.log('🔥 Firebase data with songs:', pagesWithSongs.length, 'pages with songs');
    console.log('🔥 Final pages with songs details:', pagesWithSongs.map(page => ({
      pageId: page.id,
      pageName: page.name,
      songsCount: page.songs.length,
      songs: page.songs.map(song => ({
        title: song.title,
        category: song.category,
        status: song.status
      }))
    })));
    return pagesWithSongs;
  } catch (error) {
    console.error('Error fetching Firebase data:', error);
    return [];
  }
}

export function useRealtimeData() {
  const [pages, setPages] = useState<PraiseNight[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for instant display
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Memory optimization - limit pages in memory
  const MAX_PAGES_IN_MEMORY = 5;

  // Load initial data with ultra-fast cache-first approach
  useEffect(() => {
    async function loadInitialData() {
      try {
        console.log('🚀 Starting ultra-fast data load...');
        const startTime = performance.now();
        
        // INSTANT: Load cached data immediately for zero loading time
        const cachedData = await dataPrefetcher.getCachedData();
        if (cachedData && cachedData.length > 0) {
          console.log('⚡ Loading cached data instantly (0ms)');
          setPages(cachedData);
          setError(null);
          setIsInitialLoad(false);
        } else {
          // Only show loading if no cache available
          setLoading(true);
        }
        
        // Fetch fresh data from Firebase
        const dataPromise = fetchFirebaseData();
        
        // Wait for fresh data
        const firebasePages = await dataPromise;
        
        // Update with fresh data - limit memory usage
        const limitedPages = firebasePages.slice(0, MAX_PAGES_IN_MEMORY);
        setPages(limitedPages);
        setError(null);
        setIsInitialLoad(false);
        
        const totalTime = performance.now() - startTime;
        console.log(`🎯 Total load time: ${totalTime.toFixed(2)}ms`);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Set up periodic data refresh (Firebase doesn't have realtime subscriptions like Supabase)
  useEffect(() => {
    console.log('🔄 Setting up periodic data refresh...');

    // Refresh data every 2 seconds to get updates immediately (for new songs from admin)
    const refreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Refreshing data from Firebase...');
        const updatedPages = await fetchFirebaseData();
            setPages(updatedPages);
          } catch (error) {
        console.error('Error refreshing data:', error);
          }
    }, 2000); // 2 seconds - even faster updates for admin changes

    // Cleanup interval on unmount
    return () => {
      console.log('🔄 Cleaning up refresh interval...');
      clearInterval(refreshInterval);
    };
  }, []);

  const getCurrentPage = (id: number): PraiseNight | null => {
    return pages.find(page => page.id === id) || null;
  };

  const getCurrentSongs = async (pageId: number): Promise<PraiseNightSong[]> => {
    try {
      // Use the FirebaseDatabaseService to get songs for a specific page
      const allSongs = await FirebaseDatabaseService.getCollection('songs');
      const songs = allSongs.filter(song => {
        // Handle both old (Supabase) and new (Firebase) field names
        const songPraiseNightId = (song as any).praisenightid || (song as any).praiseNightId;
        
        // Try multiple matching strategies
        return songPraiseNightId === pageId ||
               songPraiseNightId === parseInt(pageId.toString()) ||
               parseInt(songPraiseNightId.toString()) === pageId;
      });
      
      console.log('🔥 Firebase songs fetched for page', pageId, ':', songs.length, 'songs');
      return songs as unknown as PraiseNightSong[];
    } catch (error) {
      console.error('Error fetching songs from Firebase:', error);
      return [];
    }
  };

  // Preload function for instant navigation
  const preloadData = async () => {
    try {
      console.log('🔄 Preloading data from Firebase...');
      const updatedPages = await fetchFirebaseData();
      const limitedPages = updatedPages.slice(0, MAX_PAGES_IN_MEMORY);
      setPages(limitedPages);
    } catch (err) {
      console.error('Error preloading data:', err);
    }
  };

  return {
    pages,
    loading,
    error,
    isInitialLoad,
    getCurrentPage,
    getCurrentSongs,
    preloadData,
  // Manual refresh function with cache clearing for immediate updates
    refreshData: async () => {
      try {
      console.log('🔄 Manual refresh with cache clearing...');
      // Clear any cached data to force fresh fetch
      // Note: dataPrefetcher doesn't have clearCache method, but we'll force fresh fetch
      const updatedPages = await fetchFirebaseData();
        setPages(updatedPages);
      console.log('✅ Manual refresh completed with fresh data');
      } catch (err) {
        console.error('Error refreshing data:', err);
      }
    }
  };
}

// Helper function to show notifications
function showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
  // You can integrate this with your existing toast system
  console.log(`🔔 ${type.toUpperCase()}: ${message}`);
  
  // Dispatch custom event for toast notifications
  window.dispatchEvent(new CustomEvent('showToast', {
    detail: { message, type }
  }));
}