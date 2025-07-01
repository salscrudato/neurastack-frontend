import { useToast } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { forceRefreshApp } from './cacheControl';

// Version tracking for cache busting
const APP_VERSION = import.meta.env.VITE_APP_VERSION || Date.now().toString();
const VERSION_KEY = 'neurastack_app_version';

// Simplified update manager hook without PWA functionality
export const useUpdateManager = () => {
  const toast = useToast();
  const [offlineReady] = useState(false); // Always false since no PWA
  const [needRefresh] = useState(false); // Always false since no PWA

  const handleUpdate = async () => {
    try {
      // Clear version cache
      localStorage.removeItem(VERSION_KEY);

      // Force reload
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);

      toast({
        title: 'Update Failed',
        description: 'Failed to update. Please refresh manually.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const checkForUpdates = async () => {
    try {
      // Check if version has changed
      const storedVersion = localStorage.getItem(VERSION_KEY);

      if (storedVersion && storedVersion !== APP_VERSION) {
        console.log('Version change detected:', storedVersion, '->', APP_VERSION);
        handleUpdate();
        return;
      }

      // Store current version
      localStorage.setItem(VERSION_KEY, APP_VERSION);
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };

  const dismissUpdate = useCallback(() => {
    // No-op since we don't have PWA updates
    console.log('Update dismissed (no PWA functionality)');
  }, []);

  // Function to manually re-enable update notifications (for debugging/admin)
  const enableUpdateNotifications = useCallback(() => {
    console.log('Update notifications not available (no PWA functionality)');
  }, []);

  return {
    offlineReady,
    needRefresh,
    handleUpdate,
    checkForUpdates,
    dismissUpdate,
    enableUpdateNotifications,
  };
};

// Cache management utilities
export const cacheManager = {
  // Clear all application caches
  async clearAllCaches() {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
      }
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  },

  // Clear specific cache by name
  async clearCache(cacheName: string) {
    try {
      if ('caches' in window) {
        await caches.delete(cacheName);
        console.log(`Cache ${cacheName} cleared`);
      }
    } catch (error) {
      console.error(`Failed to clear cache ${cacheName}:`, error);
    }
  },

  // Get cache storage usage
  async getCacheSize() {
    try {
      if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          usageInMB: Math.round((estimate.usage || 0) / 1024 / 1024 * 100) / 100,
          quotaInMB: Math.round((estimate.quota || 0) / 1024 / 1024 * 100) / 100,
        };
      }
    } catch (error) {
      console.error('Failed to get cache size:', error);
    }
    return null;
  },
};

// Force refresh utility - using comprehensive cache control
export const forceRefresh = async () => {
  console.log('🔄 Force refresh requested...');
  forceRefreshApp();
};

// Auto-update on app focus (when user returns to tab) - simplified without service worker
export const setupAutoUpdateOnFocus = () => {
  // No-op function since we don't have service worker functionality
  return () => {
    // Cleanup function (no-op)
  };
};

// Check for updates on network reconnection - simplified without service worker
export const setupUpdateOnReconnect = () => {
  // No-op function since we don't have service worker functionality
  return () => {
    // Cleanup function (no-op)
  };
};
