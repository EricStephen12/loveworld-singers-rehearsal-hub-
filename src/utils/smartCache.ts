// Smart Cache Manager - Intelligent cache invalidation for production updates

interface CacheConfig {
  key: string;
  duration: number; // Cache duration in milliseconds
  version?: string; // Version for cache busting
  priority: 'high' | 'medium' | 'low'; // Cache priority
}

interface SmartCacheEntry {
  data: any;
  timestamp: number;
  version: string;
  expiresAt: number;
  priority: 'high' | 'medium' | 'low';
}

class SmartCacheManager {
  private static instance: SmartCacheManager;
  private cache = new Map<string, SmartCacheEntry>();
  private readonly APP_VERSION = Date.now().toString(); // This should be your build version
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cache entries

  constructor() {
    this.initializeCache();
  }

  public static getInstance(): SmartCacheManager {
    if (!SmartCacheManager.instance) {
      SmartCacheManager.instance = new SmartCacheManager();
    }
    return SmartCacheManager.instance;
  }

  private initializeCache(): void {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    // Check if app version changed and clear old cache
    const storedVersion = localStorage.getItem('app-cache-version');
    if (!storedVersion || storedVersion !== this.APP_VERSION) {
      this.clearAllCache();
      localStorage.setItem('app-cache-version', this.APP_VERSION);
      console.log('🔄 App version changed, cache cleared');
    }
  }

  // Set cache with smart invalidation
  public setCache(config: CacheConfig, data: any): void {
    const now = Date.now();
    const entry: SmartCacheEntry = {
      data,
      timestamp: now,
      version: config.version || this.APP_VERSION,
      expiresAt: now + config.duration,
      priority: config.priority
    };

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntries();
    }

    this.cache.set(config.key, entry);
    
    // Also store in localStorage for persistence (only in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`cache-${config.key}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to store cache in localStorage:', error);
      }
    }
  }

  // Get cache with smart validation
  public getCache(key: string): any | null {
    // Check memory cache first
    const memoryEntry = this.cache.get(key);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      return memoryEntry.data;
    }

    // Check localStorage cache (only in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache-${key}`);
        if (stored) {
          const entry: SmartCacheEntry = JSON.parse(stored);
          if (this.isValidEntry(entry)) {
            // Restore to memory cache
            this.cache.set(key, entry);
            return entry.data;
          } else {
            // Remove expired entry
            localStorage.removeItem(`cache-${key}`);
          }
        }
      } catch (error) {
        console.warn('Failed to read cache from localStorage:', error);
      }
    }

    return null;
  }

  // Check if cache entry is valid
  private isValidEntry(entry: SmartCacheEntry): boolean {
    const now = Date.now();
    
    // Check if expired
    if (now > entry.expiresAt) {
      return false;
    }

    // Check if version changed
    if (entry.version !== this.APP_VERSION) {
      return false;
    }

    return true;
  }

  // Remove oldest cache entries when cache is full
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by priority and timestamp
    entries.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = priorityOrder[a[1].priority];
      const bPriority = priorityOrder[b[1].priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a[1].timestamp - b[1].timestamp;
    });

    // Remove oldest low priority entries
    const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
    toRemove.forEach(([key]) => {
      this.cache.delete(key);
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(`cache-${key}`);
      }
    });
  }

  // Clear all cache
  public clearAllCache(): void {
    this.cache.clear();
    
    // Clear localStorage cache (only in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    console.log('🧹 Smart cache cleared');
  }

  // Clear specific cache
  public clearCache(key: string): void {
    this.cache.delete(key);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(`cache-${key}`);
    }
  }

  // Get cache statistics
  public getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  // Force refresh specific cache
  public async refreshCache(key: string, fetchFn: () => Promise<any>, config: CacheConfig): Promise<any> {
    console.log(`🔄 Refreshing cache: ${key}`);
    this.clearCache(key);
    
    try {
      const data = await fetchFn();
      this.setCache(config, data);
      return data;
    } catch (error) {
      console.error(`Failed to refresh cache ${key}:`, error);
      throw error;
    }
  }
}

export const smartCache = SmartCacheManager.getInstance();

// Helper functions for common cache patterns
export const createCacheConfig = (
  key: string, 
  duration: number, 
  priority: 'high' | 'medium' | 'low' = 'medium'
): CacheConfig => ({
  key,
  duration,
  priority
});

// Instagram-style cache durations
export const CACHE_DURATIONS = {
  NO_CACHE: 0, // No cache for real-time features
  REAL_TIME: 1 * 1000, // 1 second for dynamic content
  SHORT: 30 * 1000, // 30 seconds for semi-static content
  MEDIUM: 5 * 60 * 1000, // 5 minutes for static content
  LONG: 30 * 60 * 1000, // 30 minutes for very static content
  VERY_LONG: 2 * 60 * 60 * 1000 // 2 hours for extremely static content
} as const;

// High priority cache keys (won't be evicted easily)
export const HIGH_PRIORITY_KEYS = [
  'user-profile',
  'app-settings',
  'auth-token'
];

// Medium priority cache keys
export const MEDIUM_PRIORITY_KEYS = [
  'pages-data',
  'songs-data',
  'categories-data'
];

// Low priority cache keys (can be evicted first)
export const LOW_PRIORITY_KEYS = [
  'search-results',
  'temp-data',
  'ui-state'
];
