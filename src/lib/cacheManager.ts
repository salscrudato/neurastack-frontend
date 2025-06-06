/**
 * Simplified Cache Management System
 *
 * Lightweight cache management for API responses with TTL support.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  tags: string[];
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableAutoCleanup: boolean;
}

// ============================================================================
// Cache Manager Class
// ============================================================================

export class SimpleCacheManager {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 500,
      enableAutoCleanup: true,
      ...config
    };

    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup();
    }
  }

  /**
   * Start automatic cleanup process
   */
  private startAutoCleanup(): void {
    setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0 && import.meta.env.DEV) {
        console.log(`🧹 Cache cleanup: ${cleaned} expired entries removed`);
      }
    }, 60000); // Every minute
  }

  /**
   * Set cache entry
   */
  set(
    key: string,
    data: any,
    options: {
      ttl?: number;
      tags?: string[];
    } = {}
  ): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.config.defaultTTL,
      tags: options.tags || []
    };

    // Check cache size and cleanup if needed
    if (this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, entry);
  }

  /**
   * Get cache entry
   */
  get(key: string): any {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if cache has valid entry
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate cache entries by tags
   */
  invalidateByTags(tags: string[]): number {
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Invalidate all cache entries
   */
  invalidateAll(reason?: string): void {
    const count = this.cache.size;
    this.cache.clear();

    if (process.env.NODE_ENV === 'development') {
      console.log(`🗑️ Cache cleared: ${count} entries removed${reason ? ` (${reason})` : ''}`);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let count = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    entries: Array<{
      key: string;
      age: number;
      tags: string[];
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      tags: entry.tags
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      entries
    };
  }
}

// ============================================================================
// Default Instance and Utilities
// ============================================================================

export const cacheManager = new SimpleCacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 500,
  enableAutoCleanup: true
});

/**
 * Cache decorator for API responses
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyGenerator?: (...args: Parameters<T>) => string;
    ttl?: number;
    tags?: string[];
  } = {}
): T {
  return (async (...args: Parameters<T>) => {
    const key = options.keyGenerator
      ? options.keyGenerator(...args)
      : `${fn.name}-${JSON.stringify(args)}`;

    // Try to get from cache first
    const cached = cacheManager.get(key);
    if (cached) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    cacheManager.set(key, result, {
      ttl: options.ttl,
      tags: options.tags
    });

    return result;
  }) as T;
}

/**
 * Clear all app-related caches
 */
export async function clearAllCaches(): Promise<void> {
  // Clear our cache manager
  cacheManager.invalidateAll('manual-clear');

  // Clear service worker caches
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
  }

  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('neurastack-')) {
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('neurastack-')) {
      sessionStorage.removeItem(key);
    }
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 All caches cleared successfully');
  }
}
