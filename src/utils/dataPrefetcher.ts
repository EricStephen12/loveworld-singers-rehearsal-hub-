// Data Prefetcher for Ultra-Fast Loading
// This utility prefetches data in the background for instant access

import { getAllPages } from '@/lib/database';
import { offlineManager } from './offlineManager';

class DataPrefetcher {
  private static instance: DataPrefetcher;
  private prefetchPromise: Promise<any> | null = null;
  private lastPrefetchTime = 0;
  private readonly PREFETCH_INTERVAL = 30000; // 30 seconds

  static getInstance(): DataPrefetcher {
    if (!DataPrefetcher.instance) {
      DataPrefetcher.instance = new DataPrefetcher();
    }
    return DataPrefetcher.instance;
  }

  // Prefetch data in background
  async prefetchData(): Promise<void> {
    const now = Date.now();
    
    // Don't prefetch if we already did it recently
    if (now - this.lastPrefetchTime < this.PREFETCH_INTERVAL) {
      return;
    }

    // Don't start multiple prefetch operations
    if (this.prefetchPromise) {
      return this.prefetchPromise;
    }

    console.log('🚀 Starting background data prefetch...');
    const startTime = performance.now();

    this.prefetchPromise = this.performPrefetch();
    
    try {
      await this.prefetchPromise;
      this.lastPrefetchTime = now;
      const duration = performance.now() - startTime;
      console.log(`⚡ Background prefetch completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('Background prefetch failed:', error);
    } finally {
      this.prefetchPromise = null;
    }
  }

  private async performPrefetch(): Promise<void> {
    try {
      // Prefetch pages data
      const pages = await getAllPages();
      
      // Cache the data for instant access
      await offlineManager.cacheData('pages', pages);
      
      console.log('✅ Data prefetched and cached successfully');
    } catch (error) {
      console.error('Error during prefetch:', error);
      throw error;
    }
  }

  // Get cached data instantly
  async getCachedData(): Promise<any> {
    return await offlineManager.getCachedData('pages');
  }

  // Force refresh data
  async forceRefresh(): Promise<any> {
    this.lastPrefetchTime = 0; // Reset timer
    return await this.prefetchData();
  }
}

// Export singleton instance
export const dataPrefetcher = DataPrefetcher.getInstance();

// Auto-prefetch when module loads (for instant access)
if (typeof window !== 'undefined') {
  // Prefetch after a short delay to not block initial page load
  setTimeout(() => {
    dataPrefetcher.prefetchData();
  }, 1000);
}

