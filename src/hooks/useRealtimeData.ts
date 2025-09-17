import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { PraiseNight, PraiseNightSong } from '@/types/supabase';
import { getAllPages } from '@/lib/database';

export function useRealtimeData() {
  const [pages, setPages] = useState<PraiseNight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const supabasePages = await getAllPages();
        setPages(supabasePages);
        setError(null);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('🔄 Setting up real-time subscriptions...');

    // Subscribe to songs table changes
    const songsSubscription = supabase
      .channel('songs-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'songs'
        },
        async (payload) => {
          console.log('🎵 Song change detected:', payload.eventType, (payload.new as any)?.title || (payload.old as any)?.title);
          
          // Refresh all data when any song changes
          try {
            const updatedPages = await getAllPages();
            setPages(updatedPages);
            
            // Show notification to user
            if (payload.eventType === 'UPDATE') {
              showNotification(`Song "${(payload.new as any)?.title}" was updated`, 'info');
            } else if (payload.eventType === 'INSERT') {
              showNotification(`New song "${(payload.new as any)?.title}" was added`, 'success');
            } else if (payload.eventType === 'DELETE') {
              showNotification(`Song "${(payload.old as any)?.title}" was deleted`, 'warning');
            }
          } catch (error) {
            console.error('Error refreshing data after song change:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to pages table changes
    const pagesSubscription = supabase
      .channel('pages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pages'
        },
        async (payload) => {
          console.log('📄 Page change detected:', payload.eventType, (payload.new as any)?.name || (payload.old as any)?.name);
          
          try {
            const updatedPages = await getAllPages();
            setPages(updatedPages);
            
            if (payload.eventType === 'UPDATE') {
              showNotification(`Page "${(payload.new as any)?.name}" was updated`, 'info');
            } else if (payload.eventType === 'INSERT') {
              showNotification(`New page "${(payload.new as any)?.name}" was created`, 'success');
            } else if (payload.eventType === 'DELETE') {
              showNotification(`Page "${(payload.old as any)?.name}" was deleted`, 'warning');
            }
          } catch (error) {
            console.error('Error refreshing data after page change:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to comments table changes
    const commentsSubscription = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        async (payload) => {
          console.log('💬 Comment change detected:', payload.eventType);
          
          try {
            const updatedPages = await getAllPages();
            setPages(updatedPages);
            
            if (payload.eventType === 'INSERT') {
              showNotification('New comment added', 'info');
            }
          } catch (error) {
            console.error('Error refreshing data after comment change:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to history table changes
    const historySubscription = supabase
      .channel('history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_history'
        },
        async (payload) => {
          console.log('📚 History change detected:', payload.eventType);
          
          try {
            const updatedPages = await getAllPages();
            setPages(updatedPages);
          } catch (error) {
            console.error('Error refreshing data after history change:', error);
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔄 Cleaning up real-time subscriptions...');
      supabase.removeChannel(songsSubscription);
      supabase.removeChannel(pagesSubscription);
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(historySubscription);
    };
  }, []);

  const getCurrentPage = (id: number): PraiseNight | null => {
    return pages.find(page => page.id === id) || null;
  };

  const getCurrentSongs = (pageId: number): PraiseNightSong[] => {
    const page = pages.find(p => p.id === pageId);
    return page?.songs || [];
  };

  return {
    pages,
    loading,
    error,
    getCurrentPage,
    getCurrentSongs,
    // Manual refresh function (still available if needed)
    refreshData: async () => {
      try {
        const updatedPages = await getAllPages();
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