/**
 * Simplified Cache Control for MVP
 * Basic cache management without aggressive clearing
 */

const APP_VERSION = '3.0.0';
const VERSION_KEY = 'neurastack-app-version';

/**
 * Simple cache clear for debugging only
 */
export async function clearAllAppCaches(): Promise<void> {
  console.log('🧹 Clearing caches...');

  try {
    // Only clear non-essential data
    const keysToKeep = [
      'firebase:authUser',
      'firebase:host',
      'neurastack-auth-storage',
      'neurastack-chat-storage'
    ];

    // Clear localStorage except essential keys
    const backup: Record<string, string> = {};
    keysToKeep.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) backup[key] = value;
    });

    localStorage.clear();
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    localStorage.setItem(VERSION_KEY, APP_VERSION);
    console.log('✅ Cache cleared');
  } catch (error) {
    console.warn('⚠️ Cache clear failed:', error);
  }
}

/**
 * Simple version check - no automatic clearing
 */
export function checkVersionAndClearCache(): boolean {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (!storedVersion) {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      return false;
    }

    if (storedVersion !== APP_VERSION) {
      console.log('🔄 Version changed:', storedVersion, '->', APP_VERSION);
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      return true;
    }

    return false;
  } catch (error) {
    console.warn('⚠️ Version check failed:', error);
    return false;
  }
}

/**
 * Simple app refresh
 */
export function forceRefreshApp(): void {
  window.location.reload();
}

/**
 * No cache busting for MVP - keep it simple
 */
export function addCacheBuster(url: string): string {
  return url;
}

/**
 * No special headers needed for MVP
 */
export function getCacheBustingHeaders(): Record<string, string> {
  return {};
}

/**
 * Simple setup - just check version once
 */
export function setupCacheManagement(): () => void {
  // Just check version once on startup
  checkVersionAndClearCache();

  // Return empty cleanup function
  return () => {};
}

/**
 * Debug functions for development
 */
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).clearNeuraStackCaches = clearAllAppCaches;
  (window as any).forceRefreshNeuraStack = forceRefreshApp;
}

export const versionInfo = {
  version: APP_VERSION,
  timestamp: Date.now(),
};
