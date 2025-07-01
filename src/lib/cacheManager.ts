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
  priority?: 'low' | 'normal' | 'high';
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
  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryPressureThreshold = 0.8; // 80% of max size
  private lastMemoryCheck = 0;
  private memoryCheckInterval = 30000; // 30 seconds

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

    // Setup memory pressure monitoring
    this.setupMemoryPressureMonitoring();
  }

  /**
   * Start automatic cleanup process with proper cleanup tracking
   */
  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0 && import.meta.env.DEV) {
        console.log(`🧹 Cache cleanup: ${cleaned} expired entries removed`);
      }

      // Check for memory pressure during cleanup
      this.checkMemoryPressure();
    }, 60000); // Every minute
  }

  /**
   * Setup memory pressure monitoring
   */
  private setupMemoryPressureMonitoring(): void {
    // Monitor browser memory if available (Chrome only)
    if (typeof window !== 'undefined' && 'memory' in performance) {
      this.monitorBrowserMemory();
    }
  }

  /**
   * Monitor browser memory usage (Chrome only)
   */
  private monitorBrowserMemory(): void {
    const checkMemory = () => {
      const now = Date.now();
      if (now - this.lastMemoryCheck < this.memoryCheckInterval) return;

      this.lastMemoryCheck = now;

      try {
        const memInfo = (performance as any).memory;
        const memoryUsageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;

        if (memoryUsageRatio > 0.85) { // 85% memory usage
          console.warn('🧠 High memory usage detected, aggressive cache cleanup');
          this.aggressiveCleanup();
        } else if (memoryUsageRatio > 0.7) { // 70% memory usage
          console.log('🧠 Moderate memory usage, proactive cache cleanup');
          this.proactiveCleanup();
        }
      } catch (error) {
        // Silently fail if memory API is not available
      }
    };

    // Check memory periodically
    setInterval(checkMemory, this.memoryCheckInterval);
  }

  /**
   * Check for memory pressure based on cache size
   */
  private checkMemoryPressure(): void {
    const currentSize = this.cache.size;
    const pressureRatio = currentSize / this.config.maxSize;

    if (pressureRatio > this.memoryPressureThreshold) {
      if (import.meta.env.DEV) {
        console.warn(`🧠 Cache memory pressure: ${currentSize}/${this.config.maxSize} entries`);
      }
      this.proactiveCleanup();
    }
  }

  /**
   * Proactive cleanup - remove entries that are close to expiring
   */
  private proactiveCleanup(): number {
    let count = 0;
    const now = Date.now();
    const proactiveThreshold = 0.8; // Remove entries that are 80% through their TTL

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      const ageRatio = age / entry.ttl;

      if (ageRatio > proactiveThreshold) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0 && import.meta.env.DEV) {
      console.log(`🧹 Proactive cleanup: ${count} entries removed`);
    }

    return count;
  }

  /**
   * Aggressive cleanup - remove oldest entries regardless of TTL
   */
  private aggressiveCleanup(): number {
    const targetSize = Math.floor(this.config.maxSize * 0.6); // Reduce to 60% of max size
    const currentSize = this.cache.size;

    if (currentSize <= targetSize) return 0;

    // Sort entries by age (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    const toRemove = currentSize - targetSize;
    let count = 0;

    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
      count++;
    }

    if (count > 0 && import.meta.env.DEV) {
      console.warn(`🧹 Aggressive cleanup: ${count} entries removed due to memory pressure`);
    }

    return count;
  }

  /**
   * Destroy the cache manager and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.cache.clear();

    if (import.meta.env.DEV) {
      console.log('🗑️ Cache manager destroyed');
    }
  }

  /**
   * Set cache entry with enhanced memory management
   */
  set(
    key: string,
    data: any,
    options: {
      ttl?: number;
      tags?: string[];
      priority?: 'low' | 'normal' | 'high';
    } = {}
  ): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.config.defaultTTL,
      tags: options.tags || [],
      priority: options.priority || 'normal'
    };

    // Enhanced memory management before adding new entry
    if (this.cache.size >= this.config.maxSize) {
      // Try regular cleanup first
      const cleaned = this.cleanup();

      // If still at capacity, do proactive cleanup
      if (this.cache.size >= this.config.maxSize) {
        this.proactiveCleanup();
      }

      // If still at capacity, remove oldest low-priority entries
      if (this.cache.size >= this.config.maxSize) {
        this.evictLowPriorityEntries();
      }

      if (import.meta.env.DEV && cleaned === 0 && this.cache.size >= this.config.maxSize) {
        console.warn('🧠 Cache at capacity, may need to increase maxSize or reduce TTL');
      }
    }

    this.cache.set(key, entry);

    // Check for memory pressure after adding
    this.checkMemoryPressure();
  }

  /**
   * Evict low-priority entries when at capacity
   */
  private evictLowPriorityEntries(): number {
    let count = 0;
    const lowPriorityEntries: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.priority === 'low') {
        lowPriorityEntries.push(key);
      }
    }

    // Remove oldest low-priority entries first
    const sortedEntries = lowPriorityEntries
      .map(key => ({ key, timestamp: this.cache.get(key)!.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const toRemove = Math.min(sortedEntries.length, Math.ceil(this.config.maxSize * 0.1)); // Remove up to 10%

    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(sortedEntries[i].key);
      count++;
    }

    if (count > 0 && import.meta.env.DEV) {
      console.log(`🧹 Evicted ${count} low-priority entries`);
    }

    return count;
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
   * Get cache statistics with enhanced memory information
   */
  getStats(): {
    size: number;
    maxSize: number;
    memoryPressure: number;
    priorityDistribution: { low: number; normal: number; high: number };
    entries: Array<{
      key: string;
      age: number;
      tags: string[];
      priority: string;
      sizeEstimate: number;
    }>;
  } {
    const now = Date.now();
    const priorityDistribution = { low: 0, normal: 0, high: 0 };

    const entries = Array.from(this.cache.entries()).map(([key, entry]) => {
      const priority = entry.priority || 'normal';
      priorityDistribution[priority]++;

      // Rough size estimate
      const sizeEstimate = JSON.stringify(entry.data).length;

      return {
        key,
        age: now - entry.timestamp,
        tags: entry.tags,
        priority,
        sizeEstimate
      };
    });

    const memoryPressure = this.cache.size / this.config.maxSize;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      memoryPressure,
      priorityDistribution,
      entries
    };
  }

  /**
   * Get memory usage information
   */
  getMemoryInfo(): {
    cacheSize: number;
    estimatedMemoryUsage: number;
    memoryPressure: number;
    recommendedAction?: string;
  } {
    let estimatedMemoryUsage = 0;

    for (const [, entry] of this.cache.entries()) {
      try {
        estimatedMemoryUsage += JSON.stringify(entry).length;
      } catch {
        estimatedMemoryUsage += 1000; // Fallback estimate
      }
    }

    const memoryPressure = this.cache.size / this.config.maxSize;
    let recommendedAction: string | undefined;

    if (memoryPressure > 0.9) {
      recommendedAction = 'Immediate cleanup recommended';
    } else if (memoryPressure > 0.7) {
      recommendedAction = 'Consider proactive cleanup';
    }

    return {
      cacheSize: this.cache.size,
      estimatedMemoryUsage,
      memoryPressure,
      recommendedAction
    };
  }
}

// ============================================================================
// Default Instance and Utilities
// ============================================================================

export const cacheManager = new SimpleCacheManager({
  defaultTTL: 30 * 1000, // Reduced to 30 seconds for faster updates
  maxSize: 100, // Reduced size to prevent stale data
  enableAutoCleanup: true
});

// Global cleanup function for the default cache manager
if (typeof window !== 'undefined') {
  // Add global cleanup function for debugging
  (window as any).clearNeuraStackCache = () => {
    cacheManager.invalidateAll('manual-debug-clear');
    console.log('🧹 NeuraStack cache cleared manually');
  };

  // Add global memory info function for debugging
  (window as any).getNeuraStackCacheInfo = () => {
    const stats = cacheManager.getStats();
    const memoryInfo = cacheManager.getMemoryInfo();
    console.table(stats);
    console.log('Memory Info:', memoryInfo);
    return { stats, memoryInfo };
  };

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cacheManager.destroy();
  });
}

/**
 * Cache decorator for API responses with enhanced options
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyGenerator?: (...args: Parameters<T>) => string;
    ttl?: number;
    tags?: string[];
    priority?: 'low' | 'normal' | 'high';
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
      tags: options.tags,
      priority: options.priority
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
