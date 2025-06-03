/**
 * Advanced Cache Management System
 * 
 * Intelligent cache management for ensuring fresh code and API responses
 * with automatic version detection and cache invalidation.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

interface CacheEntry {
  data: any;
  timestamp: number;
  version: string;
  ttl: number;
  tags: string[];
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableVersioning: boolean;
  enableAutoCleanup: boolean;
}

interface VersionInfo {
  buildTime: string;
  gitHash: string;
  apiVersion: string;
  timestamp: number;
}

// ============================================================================
// Cache Manager Class
// ============================================================================

export class AdvancedCacheManager {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private currentVersion: string;
  private versionInfo: VersionInfo;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      enableVersioning: true,
      enableAutoCleanup: true,
      ...config
    };

    this.currentVersion = this.generateVersion();
    this.versionInfo = this.getVersionInfo();

    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup();
    }

    // Listen for version changes
    this.setupVersionMonitoring();
  }

  /**
   * Generate current version identifier
   */
  private generateVersion(): string {
    const buildTime = import.meta.env.VITE_APP_VERSION || Date.now().toString();
    const gitHash = import.meta.env.VITE_GIT_HASH || 'dev';
    return `${buildTime}-${gitHash}`;
  }

  /**
   * Get detailed version information
   */
  private getVersionInfo(): VersionInfo {
    return {
      buildTime: import.meta.env.VITE_APP_VERSION || Date.now().toString(),
      gitHash: import.meta.env.VITE_GIT_HASH || 'dev',
      apiVersion: import.meta.env.VITE_API_VERSION || '2.2.0',
      timestamp: Date.now()
    };
  }

  /**
   * Set up version monitoring for automatic cache invalidation
   */
  private setupVersionMonitoring(): void {
    // Check for version changes every 30 seconds
    setInterval(() => {
      this.checkForVersionChanges();
    }, 30000);

    // Listen for visibility change to check when user returns
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForVersionChanges();
      }
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.checkForVersionChanges();
    });
  }

  /**
   * Check for version changes and invalidate cache if needed
   */
  private async checkForVersionChanges(): Promise<void> {
    try {
      // Only check for version changes every 5 minutes to reduce noise
      const lastCheck = localStorage.getItem('cache-version-check');
      const now = Date.now();
      if (lastCheck && (now - parseInt(lastCheck)) < 5 * 60 * 1000) {
        return;
      }

      // Check if there's a new build available
      const response = await fetch('/manifest.json?' + Date.now(), {
        cache: 'no-cache'
      });

      if (response.ok) {
        const manifest = await response.json();
        const newVersion = manifest.version || this.generateVersion();

        if (newVersion !== this.currentVersion) {
          console.log('🔄 New version detected, clearing cache...');
          this.invalidateAll('version-change');
          this.currentVersion = newVersion;
          this.versionInfo = this.getVersionInfo();

          // Store last check time
          localStorage.setItem('cache-version-check', now.toString());

          // Notify user of update (less aggressively)
          this.notifyVersionChange();
        } else {
          // Update last check time even if no version change
          localStorage.setItem('cache-version-check', now.toString());
        }
      }
    } catch (error) {
      // Silently handle version check errors to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to check for version changes:', error);
      }
    }
  }

  /**
   * Notify user of version change
   */
  private notifyVersionChange(): void {
    // Dispatch custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('neurastack-version-change', {
      detail: { 
        oldVersion: this.currentVersion,
        newVersion: this.versionInfo,
        timestamp: Date.now()
      }
    }));
  }

  /**
   * Set cache entry with automatic versioning
   */
  set(
    key: string, 
    data: any, 
    options: {
      ttl?: number;
      tags?: string[];
      version?: string;
    } = {}
  ): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: options.version || this.currentVersion,
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
   * Get cache entry with version validation
   */
  get(key: string, options: { ignoreVersion?: boolean } = {}): any {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Check version compatibility
    if (this.config.enableVersioning && !options.ignoreVersion) {
      if (entry.version !== this.currentVersion) {
        this.cache.delete(key);
        return null;
      }
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
    
    console.log(`🗑️ Cache cleared: ${count} entries removed${reason ? ` (${reason})` : ''}`);
    
    // Dispatch event for UI feedback
    window.dispatchEvent(new CustomEvent('neurastack-cache-cleared', {
      detail: { count, reason, timestamp: Date.now() }
    }));
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
   * Start automatic cleanup process
   */
  private startAutoCleanup(): void {
    setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        console.log(`🧹 Auto-cleanup: ${cleaned} expired entries removed`);
      }
    }, 60000); // Every minute
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    version: string;
    versionInfo: VersionInfo;
    entries: Array<{
      key: string;
      age: number;
      version: string;
      tags: string[];
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      version: entry.version,
      tags: entry.tags
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      version: this.currentVersion,
      versionInfo: this.versionInfo,
      entries
    };
  }

  /**
   * Force cache refresh for development
   */
  forceRefresh(): void {
    this.invalidateAll('force-refresh');
    
    // Clear browser caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // Clear localStorage items related to the app
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('neurastack-')) {
        localStorage.removeItem(key);
      }
    });

    // Reload the page to get fresh code
    window.location.reload();
  }
}

// ============================================================================
// Default Instance and Utilities
// ============================================================================

export const cacheManager = new AdvancedCacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  enableVersioning: true,
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
  
  console.log('🧹 All caches cleared successfully');
}
