import { createClient } from '@supabase/supabase-js';

// Ultra-fast Supabase client configuration
export const ultraFastSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 20, // Very high frequency for instant updates
      },
    },
    global: {
      headers: {
        'Cache-Control': 'no-cache',
        'X-Client-Info': 'ultra-fast-client',
      },
    },
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Ultra-fast query builder with optimizations
export class UltraFastQuery {
  private query: any;
  private table: string;

  constructor(table: string) {
    this.table = table;
    this.query = ultraFastSupabase.from(table);
  }

  // Select with optimizations
  select(columns: string = '*') {
    this.query = this.query.select(columns);
    return this;
  }

  // Filter with optimizations
  filter(column: string, operator: string, value: any) {
    switch (operator) {
      case 'eq':
        this.query = this.query.eq(column, value);
        break;
      case 'neq':
        this.query = this.query.neq(column, value);
        break;
      case 'gt':
        this.query = this.query.gt(column, value);
        break;
      case 'gte':
        this.query = this.query.gte(column, value);
        break;
      case 'lt':
        this.query = this.query.lt(column, value);
        break;
      case 'lte':
        this.query = this.query.lte(column, value);
        break;
      case 'like':
        this.query = this.query.like(column, value);
        break;
      case 'ilike':
        this.query = this.query.ilike(column, value);
        break;
      case 'in':
        this.query = this.query.in(column, value);
        break;
      case 'is':
        this.query = this.query.is(column, value);
        break;
      case 'not':
        this.query = this.query.not(column, operator, value);
        break;
    }
    return this;
  }

  // Order with optimizations
  order(column: string, options: { ascending?: boolean } = {}) {
    this.query = this.query.order(column, options);
    return this;
  }

  // Limit for performance
  limit(count: number) {
    this.query = this.query.limit(count);
    return this;
  }

  // Range for pagination
  range(from: number, to: number) {
    this.query = this.query.range(from, to);
    return this;
  }

  // Execute with timeout and error handling
  async execute(timeout: number = 5000) {
    try {
      const result = await Promise.race([
        this.query,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        )
      ]) as any;

      if (result.error) {
        throw result.error;
      }

      return result;
    } catch (error) {
      console.error(`Ultra-fast query error for table ${this.table}:`, error);
      throw error;
    }
  }

  // Execute with retry logic
  async executeWithRetry(maxRetries: number = 3, timeout: number = 5000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.execute(timeout);
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw lastError;
  }
}

// Ultra-fast CRUD operations
export const ultraFastCRUD = {
  // Create with optimistic updates
  async create(table: string, data: any, optimisticUpdate?: (data: any) => void) {
    try {
      if (optimisticUpdate) {
        optimisticUpdate(data);
      }

      const { data: result, error } = await ultraFastSupabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Create error for table ${table}:`, error);
      throw error;
    }
  },

  // Update with optimistic updates
  async update(table: string, id: string | number, data: any, optimisticUpdate?: (data: any) => void) {
    try {
      if (optimisticUpdate) {
        optimisticUpdate({ id, ...data });
      }

      const { data: result, error } = await ultraFastSupabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Update error for table ${table}:`, error);
      throw error;
    }
  },

  // Delete with optimistic updates
  async delete(table: string, id: string | number, optimisticUpdate?: (id: string | number) => void) {
    try {
      if (optimisticUpdate) {
        optimisticUpdate(id);
      }

      const { error } = await ultraFastSupabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Delete error for table ${table}:`, error);
      throw error;
    }
  },

  // Batch operations for speed
  async batchCreate(table: string, dataArray: any[]) {
    try {
      const { data: result, error } = await ultraFastSupabase
        .from(table)
        .insert(dataArray)
        .select();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Batch create error for table ${table}:`, error);
      throw error;
    }
  },

  // Batch update
  async batchUpdate(table: string, updates: Array<{ id: string | number; data: any }>) {
    try {
      const promises = updates.map(({ id, data }) =>
        ultraFastSupabase
          .from(table)
          .update(data)
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Batch update failed: ${errors.map(e => e.error?.message || 'Unknown error').join(', ')}`);
      }

      return results;
    } catch (error) {
      console.error(`Batch update error for table ${table}:`, error);
      throw error;
    }
  },
};

// Real-time subscription manager
export class UltraFastRealtimeManager {
  private channels: Map<string, any> = new Map();

  // Subscribe to table changes
  subscribe(table: string, callback: (payload: any) => void) {
    const channelName = `${table}-changes`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = ultraFastSupabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Unsubscribe from table changes
  unsubscribe(table: string) {
    const channelName = `${table}-changes`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      ultraFastSupabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    for (const [name, channel] of this.channels) {
      ultraFastSupabase.removeChannel(channel);
    }
    this.channels.clear();
  }
}

// Global real-time manager instance
export const realtimeManager = new UltraFastRealtimeManager();

// Utility functions
export const ultraFastUtils = {
  // Debounce function for search
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll events
  throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Generate optimized query string
  generateQueryString(params: Record<string, any>): string {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  },
};
