import { useEffect, useState } from 'react';
import { PraiseNight, PraiseNightSong } from '@/types/supabase';
import { offlineManager } from '@/utils/offlineManager';
import { dataPrefetcher } from '@/utils/dataPrefetcher';
import { FirebaseDatabaseService } from '@/lib/firebase-database';

// Firebase data fetching function using the service
async function fetchFirebaseData(): Promise<PraiseNight[]> {
  try {
    console.log('🔍 Fetching pages from Firebase using service...');
    
    // Use the FirebaseDatabaseService to get pages (try praise_nights first since that's where the data is)
    let pages = await FirebaseDatabaseService.getCollection('praise_nights');
    console.log('🔥 Firebase praise_nights fetched:', pages.length, 'praise_nights');
    
    // If no pages found, try pages collection as fallback
    if (pages.length === 0) {
      pages = await FirebaseDatabaseService.getCollection('pages');
      console.log('🔥 Firebase pages fetched:', pages.length, 'pages');
    }
    
    console.log('📄 Pages data:', pages);
    console.log('📄 Sample page structure:', pages[0]);
    
    // Get songs for each page
    const allSongs = await FirebaseDatabaseService.getCollection('songs');
    console.log('🔥 Firebase songs fetched:', allSongs.length, 'songs');
    console.log('🔥 Sample song data:', allSongs[0]);
    
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
        songs: allSongs.filter(song => (song as any).praisenightid === ((page as any).page_id || page.id) || (song as any).praiseNightId === ((page as any).page_id || page.id)).map(song => {
          console.log('🎵 Mapping song:', {
            songId: song.id,
            songFirebaseId: song.firebaseId,
            songTitle: (song as any).title,
            allKeys: Object.keys(song),
            songData: song
          });
          
          // Check if we have a valid Firebase document ID
          if (!song.firebaseId || song.firebaseId === '0' || (song.firebaseId as any) === 0) {
            console.error('❌ Invalid Firebase document ID for song:', song);
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
          comments: (song as any).comments || [],
          history: (song as any).history || []
        };
        }).filter(song => song !== null) // Filter out null songs
      };
    });
    
    console.log('🔥 Firebase data with songs:', pagesWithSongs.length, 'pages with songs');
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

    // Refresh data every 30 seconds to get updates
    const refreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Refreshing data from Firebase...');
        const updatedPages = await fetchFirebaseData();
        setPages(updatedPages);
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }, 30000); // 30 seconds

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
      const songs = allSongs.filter(song => (song as any).praisenightid === pageId || (song as any).praiseNightId === pageId);
      
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
    // Manual refresh function (still available if needed)
    refreshData: async () => {
      try {
        const updatedPages = await fetchFirebaseData();
        setPages(updatedPages);
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