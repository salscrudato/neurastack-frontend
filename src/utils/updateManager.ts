import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '@chakra-ui/react';
import { useState, useCallback } from 'react';

// Version tracking for cache busting
const APP_VERSION = import.meta.env.VITE_APP_VERSION || Date.now().toString();
const VERSION_KEY = 'neurastack_app_version';

// Update manager hook for handling PWA updates
export const useUpdateManager = () => {
  const toast = useToast();
  const [localNeedRefresh, setLocalNeedRefresh] = useState(false);

  // Much more conservative approach - check multiple dismissal flags
  const isDismissedInSession = sessionStorage.getItem('neurastack_update_dismissed') === 'true';
  const isDismissedPermanently = localStorage.getItem('neurastack_update_disabled') === 'true';
  const lastDismissalTime = localStorage.getItem('neurastack_last_dismissal');
  const isDismissedRecently = lastDismissalTime && (Date.now() - parseInt(lastDismissalTime)) < 24 * 60 * 60 * 1000; // 24 hours

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [pwaNeedRefresh, setPwaNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ' + r);

      // TEMPORARILY DISABLED - No automatic update checking
      // setInterval(() => {
      //   const shouldCheck = !sessionStorage.getItem('neurastack_update_dismissed') &&
      //                      !localStorage.getItem('neurastack_update_disabled') &&
      //                      !isDismissedRecently;
      //
      //   if (shouldCheck) {
      //     r?.update();
      //   }
      // }, 300000); // 5 minutes instead of 1 minute
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
    onOfflineReady() {
      console.log('App ready to work offline');
      setOfflineReady(true);
      // Note: We'll handle notifications in the component, not here
    },
    onNeedRefresh() {
      console.log('New version available - banner temporarily disabled');

      // TEMPORARILY DISABLED - No banner will be shown
      // const shouldShow = !sessionStorage.getItem('neurastack_update_dismissed') &&
      //                   !localStorage.getItem('neurastack_update_disabled') &&
      //                   !isDismissedRecently;
      //
      // if (shouldShow) {
      //   console.log('Showing update banner');
      //   setPwaNeedRefresh(true);
      //   setLocalNeedRefresh(true);
      // } else {
      //   console.log('Update available but banner suppressed due to user preferences');
      // }
    },
  });

  const handleUpdate = async () => {
    try {
      // Clear dismissal flag since user is updating
      sessionStorage.removeItem('neurastack_update_dismissed');

      // Clear version cache
      localStorage.removeItem(VERSION_KEY);

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Update service worker
      await updateServiceWorker(true);

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
      
      // Check service worker for updates
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };

  const dismissUpdate = useCallback(() => {
    console.log('dismissUpdate called - aggressively suppressing future banners');
    setPwaNeedRefresh(false);
    setLocalNeedRefresh(false);

    // Multiple layers of dismissal to be absolutely sure
    sessionStorage.setItem('neurastack_update_dismissed', 'true');
    localStorage.setItem('neurastack_last_dismissal', Date.now().toString());

    // Also set a flag to disable for this browser entirely (can be cleared manually)
    localStorage.setItem('neurastack_update_disabled', 'true');

    console.log('Update notifications disabled until manually re-enabled');
  }, [setPwaNeedRefresh]);

  // Ultra-conservative approach - only show if ALL dismissal checks pass
  const needRefresh = !isDismissedInSession &&
                     !isDismissedPermanently &&
                     !isDismissedRecently &&
                     (localNeedRefresh || pwaNeedRefresh);

  // Function to manually re-enable update notifications (for debugging/admin)
  const enableUpdateNotifications = useCallback(() => {
    sessionStorage.removeItem('neurastack_update_dismissed');
    localStorage.removeItem('neurastack_update_disabled');
    localStorage.removeItem('neurastack_last_dismissal');
    console.log('Update notifications re-enabled');
  }, []);

  return {
    offlineReady,
    needRefresh,
    handleUpdate,
    checkForUpdates,
    dismissUpdate,
    enableUpdateNotifications, // For manual re-enabling if needed
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

// Force refresh utility
export const forceRefresh = () => {
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear caches
  cacheManager.clearAllCaches();
  
  // Unregister service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
  
  // Force reload with cache bypass
  window.location.reload();
};

// Auto-update on app focus (when user returns to tab)
export const setupAutoUpdateOnFocus = () => {
  let isHidden = false;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      isHidden = true;
    } else if (isHidden) {
      isHidden = false;
      // Check for updates when user returns to the app
      setTimeout(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
              registration.update();
            }
          });
        }
      }, 1000);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

// Check for updates on network reconnection
export const setupUpdateOnReconnect = () => {
  const handleOnline = () => {
    console.log('Network reconnected, checking for updates...');
    setTimeout(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            registration.update();
          }
        });
      }
    }, 2000);
  };

  window.addEventListener('online', handleOnline);
  
  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};
