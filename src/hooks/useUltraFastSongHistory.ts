import { useEffect, useState, useCallback } from 'react';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { HistoryEntry } from '@/types/supabase';
import { offlineManager } from '@/utils/offlineManager';

interface SongHistoryCache {
  [songId: string]: {
    data: HistoryEntry[];
    timestamp: number;
    version: string;
  };
}

// Real-time cache durations - everything is real-time now
const CACHE_DURATION = {
  COMMENTS: 0, // No cache for comments (real-time)
  LYRICS: 0, // No cache for lyrics (real-time)
  SOLFAS: 0, // No cache for solfas (real-time)
  AUDIO: 0, // No cache for audio (real-time)
  METADATA: 0 // No cache for metadata (real-time)
};
const CACHE_KEY = 'song-history-cache';

export function useUltraFastSongHistory(songId: string | null) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load cached history data instantly
  const loadCachedHistory = useCallback(async (numericId?: string): Promise<HistoryEntry[]> => {
    try {
      const cached = await offlineManager.getCachedData(CACHE_KEY) as SongHistoryCache;
      const cacheKey = numericId || songId!;
      if (cached && cached[cacheKey] && cacheKey) {
        const cacheEntry = cached[cacheKey];
        // No cache - always fetch fresh data
        const isExpired = true;
        
        if (!isExpired) {
          console.log('⚡ Loading cached song history instantly (0ms)');
          return cacheEntry.data;
        }
      }
    } catch (error) {
      console.error('Error loading cached song history:', error);
    }
    return [];
  }, [songId]);

  // Cache history data
  const cacheHistory = useCallback(async (songId: string, data: HistoryEntry[]) => {
    try {
      const cached = await offlineManager.getCachedData(CACHE_KEY) as SongHistoryCache || {};
      cached[songId] = {
        data,
        timestamp: Date.now(),
        version: Date.now().toString()
      };
      await offlineManager.cacheData(CACHE_KEY, cached);
      console.log('✅ Song history cached for instant access');
    } catch (error) {
      console.error('Error caching song history:', error);
    }
  }, []);

  // Load history data with ultra-fast caching
  const loadHistory = useCallback(async () => {
    if (!songId) return;

    try {
      console.log('🚀 Starting ultra-fast song history load for:', songId);
      const startTime = performance.now();

      // First, get the song data to find the original numeric ID
      let numericSongId: number | null = null;
      
      try {
        const songData = await FirebaseDatabaseService.getDocument('songs', songId);
        if (songData) {
          // Try to get the original numeric ID from various possible fields
          numericSongId = (songData as any).supabaseId || (songData as any).id || parseInt((songData as any).id) || null;
          console.log('🔍 Found numeric song ID for history query:', numericSongId, 'from song:', (songData as any).title);
        }
      } catch (error) {
        console.log('🔍 Could not fetch song data, trying direct conversion:', error);
        // Fallback: try to convert the string ID to number
        numericSongId = isNaN(Number(songId)) ? null : parseInt(songId);
      }
      
      if (!numericSongId) {
        console.warn('⚠️ No numeric song ID found for history query, songId:', songId);
        setHistory([]);
        setError(null);
        setIsInitialLoad(false);
        return;
      }

      // INSTANT: Load cached data immediately for zero loading time
      const cachedHistory = await loadCachedHistory(numericSongId.toString());
      if (cachedHistory.length > 0) {
        setHistory(cachedHistory);
        setError(null);
        setIsInitialLoad(false);
        console.log('⚡ Cached history loaded instantly');
      } else {
        setLoading(true);
      }
      
      const historyData = await FirebaseDatabaseService.getCollectionWhere('song_history', 'song_id', '==', numericSongId);
      
      if (!historyData) {
        console.error('Error fetching song history from Firebase');
        setError('Failed to fetch song history');
        return;
      }

      // Transform the data to match our HistoryEntry interface
      const historyEntries = (historyData || []).map((entry: any) => ({
        id: entry.id,
        type: entry.type,
        title: entry.title,
        description: entry.description,
        old_value: entry.old_value,
        new_value: entry.new_value,
        created_by: entry.created_by,
        date: entry.created_at,
        version: entry.title
      }));

      // Update state with fresh data
      setHistory(historyEntries);
      setError(null);
      setIsInitialLoad(false);

      // Cache the fresh data using the numeric ID for consistency
      await cacheHistory(numericSongId.toString(), historyEntries);

      const endTime = performance.now();
      console.log(`✅ Song history loaded in ${endTime - startTime}ms`);

    } catch (error) {
      console.error('Error loading song history:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [songId, loadCachedHistory, cacheHistory]);

  // Load history when songId changes
  useEffect(() => {
    if (songId) {
      loadHistory();
    } else {
      setHistory([]);
      setError(null);
      setLoading(false);
      setIsInitialLoad(true);
    }
  }, [songId, loadHistory]);

  // Refresh history data
  const refreshHistory = useCallback(async () => {
    if (!songId) return;
    
    setLoading(true);
    try {
      // Clear cache for this song
      const cached = await offlineManager.getCachedData(CACHE_KEY) as SongHistoryCache || {};
      delete cached[songId];
      await offlineManager.cacheData(CACHE_KEY, cached);
      
      // Reload fresh data
      await loadHistory();
    } catch (error) {
      console.error('Error refreshing song history:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [songId, loadHistory]);

  // Get filtered history by type
  const getHistoryByType = useCallback((type: 'lyrics' | 'solfas' | 'audio' | 'comments' | 'metadata'): HistoryEntry[] => {
    const typeMapping: Record<string, string[]> = {
      'lyrics': ['lyrics'],
      'solfas': ['solfas'],
      'audio': ['audio'],
      'comments': ['comments'],
      'metadata': ['song-details', 'personnel', 'music-details']
    };
    
    const mappedTypes = typeMapping[type] || [type];
    return history.filter(entry => mappedTypes.includes(entry.type));
  }, [history]);

  return {
    history,
    loading,
    error,
    isInitialLoad,
    refreshHistory,
    getHistoryByType
  };
}
