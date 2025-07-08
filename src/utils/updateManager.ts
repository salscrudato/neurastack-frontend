import { useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Version tracking for cache busting
const APP_VERSION = import.meta.env.VITE_APP_VERSION || Date.now().toString();
const VERSION_KEY = 'neurastack_app_version';

// Modern PWA update manager with intelligent update handling
export const useUpdateManager = () => {
  const toast = useToast();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    offlineReady,
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('✅ Service Worker registered:', r);
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration error:', error);
    },
    onNeedRefresh() {
      console.log('🔄 New content available, will update...');
      setUpdateAvailable(true);

      // Show user-friendly update notification
      toast({
        title: 'Update Available',
        description: 'A new version is ready. Click to update.',
        status: 'info',
        duration: null, // Don't auto-dismiss
        isClosable: true,
        position: 'bottom-right',
        onCloseComplete: () => setUpdateAvailable(false)
      });
    },
    onOfflineReady() {
      console.log('📱 App ready to work offline');
      // Note: Visual notification is handled by UpdateNotification component
      // This toast is disabled to prevent duplicate notifications
    },
  });

  const handleUpdate = useCallback(async () => {
    if (!updateServiceWorker) return;

    setIsUpdating(true);

    try {
      console.log('🔄 Updating service worker...');

      // Clear version cache
      localStorage.removeItem(VERSION_KEY);

      // Update service worker
      await updateServiceWorker(true);

      // Show success message
      toast({
        title: 'Update Complete',
        description: 'App updated successfully!',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right'
      });

      setUpdateAvailable(false);
    } catch (error) {
      console.error('❌ Update failed:', error);

      toast({
        title: 'Update Failed',
        description: 'Failed to update. Please refresh manually.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right'
      });
    } finally {
      setIsUpdating(false);
    }
  }, [updateServiceWorker, toast]);

  const checkForUpdates = useCallback(async () => {
    try {
      // Check if version has changed
      const storedVersion = localStorage.getItem(VERSION_KEY);

      if (storedVersion && storedVersion !== APP_VERSION) {
        console.log('📦 Version change detected:', storedVersion, '->', APP_VERSION);
        // Don't auto-update, let service worker handle it
        return;
      }

      // Store current version
      localStorage.setItem(VERSION_KEY, APP_VERSION);
    } catch (error) {
      console.error('❌ Update check failed:', error);
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
    console.log('🚫 Update dismissed by user');
  }, []);

  // Auto-check for updates on mount and focus
  useEffect(() => {
    checkForUpdates();

    const handleFocus = () => checkForUpdates();
    const handleVisibilityChange = () => {
      if (!document.hidden) checkForUpdates();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdates]);

  return {
    offlineReady,
    needRefresh,
    updateAvailable,
    isUpdating,
    handleUpdate,
    checkForUpdates,
    dismissUpdate,
    isLoading: isUpdating,
    error: null,
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

  // Clear all caches
  await cacheManager.clearAllCaches();

  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Force reload
  window.location.reload();
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
