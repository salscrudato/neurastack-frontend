/**
 * Comprehensive Cache Control Utility
 * Ensures users always see the latest version of the app
 */

// App version for cache busting with safe fallbacks
const APP_VERSION = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '3.0.0');
const BUILD_TIME = (typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : Date.now().toString());

// Storage keys
const VERSION_KEY = 'neurastack-app-version';
const LAST_CLEAR_KEY = 'neurastack-last-cache-clear';

/**
 * Clear all application caches and storage
 */
export async function clearAllAppCaches(): Promise<void> {
  console.log('🧹 Clearing all application caches...');

  try {
    // 1. Clear localStorage (keep only essential auth data)
    const authKeys = ['firebase:authUser', 'firebase:host'];
    const localStorageBackup: Record<string, string> = {};
    
    // Backup essential auth data
    authKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        localStorageBackup[key] = value;
      }
    });

    // Clear all localStorage
    localStorage.clear();

    // Restore essential auth data
    Object.entries(localStorageBackup).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // 2. Clear sessionStorage completely
    sessionStorage.clear();

    // 3. Clear browser caches if available
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ Browser caches cleared');
    }

    // 4. Clear IndexedDB if used by Firebase
    if ('indexedDB' in window) {
      try {
        // Clear Firebase IndexedDB
        const databases = ['firebaseLocalStorageDb'];
        for (const dbName of databases) {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          await new Promise((resolve, reject) => {
            deleteReq.onsuccess = () => resolve(void 0);
            deleteReq.onerror = () => reject(deleteReq.error);
          });
        }
        console.log('🗑️ IndexedDB cleared');
      } catch (error) {
        console.warn('⚠️ IndexedDB clear failed:', error);
      }
    }

    // 5. Record cache clear timestamp
    localStorage.setItem(LAST_CLEAR_KEY, Date.now().toString());
    localStorage.setItem(VERSION_KEY, APP_VERSION);

    console.log('✅ All caches cleared successfully');
  } catch (error) {
    console.error('❌ Cache clearing failed:', error);
    throw error;
  }
}

/**
 * Check if app version has changed and clear caches if needed
 */
export function checkVersionAndClearCache(): boolean {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const lastClear = localStorage.getItem(LAST_CLEAR_KEY);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Clear cache if:
    // 1. Version changed
    // 2. No version stored (first visit)
    // 3. Last clear was more than 1 hour ago (safety measure)
    const shouldClear = 
      !storedVersion || 
      storedVersion !== APP_VERSION ||
      !lastClear ||
      (now - parseInt(lastClear)) > oneHour;

    if (shouldClear) {
      console.log('🔄 Version change detected or cache expired, clearing caches...');
      clearAllAppCaches().catch(console.error);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Version check failed:', error);
    return false;
  }
}

/**
 * Force refresh the application with cache bypass
 */
export function forceRefreshApp(): void {
  console.log('🔄 Force refreshing application...');
  
  // Clear all caches first
  clearAllAppCaches()
    .then(() => {
      // Force reload with cache bypass
      window.location.reload();
    })
    .catch(() => {
      // Fallback: just reload
      window.location.reload();
    });
}

/**
 * Add cache-busting parameters to URLs
 */
export function addCacheBuster(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  const timestamp = Date.now();
  const version = APP_VERSION.replace(/\./g, '');
  const random = Math.random().toString(36).substr(2, 9);
  const buildTime = BUILD_TIME.substr(-8);
  return `${url}${separator}v=${version}&t=${timestamp}&r=${random}&b=${buildTime}`;
}

/**
 * Get cache-busting headers for API requests (Backend-approved headers only)
 *
 * Only the following headers are allowed by the backend:
 * - Content-Type, Authorization, X-Requested-With, X-User-Id, X-Session-Id, X-Correlation-ID
 *
 * Since X-Correlation-ID is already used for request tracking, we rely entirely on:
 * 1. URL parameters for cache busting
 * 2. fetch cache: 'no-store' option for browser-level cache control
 *
 * This function returns an empty object to avoid header conflicts.
 */
export function getCacheBustingHeaders(): Record<string, string> {
  return {
    // No additional headers - rely on URL parameters and fetch cache option
  };
}

/**
 * Setup automatic cache management
 */
export function setupCacheManagement(): () => void {
  // Check version on app start
  checkVersionAndClearCache();

  // Check version when app regains focus
  const handleFocus = () => {
    checkVersionAndClearCache();
  };

  // Check version periodically (every 5 minutes)
  const intervalId = setInterval(() => {
    checkVersionAndClearCache();
  }, 5 * 60 * 1000);

  // Setup event listeners
  window.addEventListener('focus', handleFocus);
  window.addEventListener('pageshow', handleFocus);

  // Cleanup function
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('pageshow', handleFocus);
  };
}

/**
 * Add global cache management functions for debugging
 */
if (typeof window !== 'undefined') {
  (window as any).clearNeuraStackCaches = clearAllAppCaches;
  (window as any).forceRefreshNeuraStack = forceRefreshApp;
  (window as any).checkNeuraStackVersion = checkVersionAndClearCache;
}

// Export version info for debugging
export const versionInfo = {
  version: APP_VERSION,
  buildTime: BUILD_TIME,
  timestamp: Date.now(),
};
