import { useEffect, useRef, useCallback } from 'react';

/**
 * Comprehensive cleanup management hook
 * Provides utilities for managing timers, event listeners, subscriptions, and other resources
 */

interface CleanupResource {
  id: string;
  type: 'timer' | 'interval' | 'listener' | 'subscription' | 'custom';
  cleanup: () => void;
  description?: string;
}

export const useCleanup = () => {
  const resourcesRef = useRef<Map<string, CleanupResource>>(new Map());
  const isCleanedUpRef = useRef(false);

  /**
   * Register a timer for cleanup
   */
  const registerTimer = useCallback((
    timer: NodeJS.Timeout,
    description?: string
  ): string => {
    const id = `timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    resourcesRef.current.set(id, {
      id,
      type: 'timer',
      cleanup: () => clearTimeout(timer),
      description
    });
    
    return id;
  }, []);

  /**
   * Register an interval for cleanup
   */
  const registerInterval = useCallback((
    interval: NodeJS.Timeout,
    description?: string
  ): string => {
    const id = `interval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    resourcesRef.current.set(id, {
      id,
      type: 'interval',
      cleanup: () => clearInterval(interval),
      description
    });
    
    return id;
  }, []);

  /**
   * Register an event listener for cleanup
   */
  const registerEventListener = useCallback((
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions,
    description?: string
  ): string => {
    const id = `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add the event listener
    target.addEventListener(event, handler, options);
    
    resourcesRef.current.set(id, {
      id,
      type: 'listener',
      cleanup: () => target.removeEventListener(event, handler, options),
      description: description || `${event} listener`
    });
    
    return id;
  }, []);

  /**
   * Register a subscription for cleanup
   */
  const registerSubscription = useCallback((
    unsubscribe: () => void,
    description?: string
  ): string => {
    const id = `subscription-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    resourcesRef.current.set(id, {
      id,
      type: 'subscription',
      cleanup: unsubscribe,
      description
    });
    
    return id;
  }, []);

  /**
   * Register a custom cleanup function
   */
  const registerCustomCleanup = useCallback((
    cleanup: () => void,
    description?: string
  ): string => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    resourcesRef.current.set(id, {
      id,
      type: 'custom',
      cleanup,
      description
    });
    
    return id;
  }, []);

  /**
   * Unregister a specific resource
   */
  const unregister = useCallback((id: string): boolean => {
    const resource = resourcesRef.current.get(id);
    if (resource) {
      try {
        resource.cleanup();
        resourcesRef.current.delete(id);
        return true;
      } catch (error) {
        console.warn(`Failed to cleanup resource ${id}:`, error);
        resourcesRef.current.delete(id); // Remove even if cleanup failed
        return false;
      }
    }
    return false;
  }, []);

  /**
   * Clean up all registered resources
   */
  const cleanupAll = useCallback(() => {
    if (isCleanedUpRef.current) return;
    
    const resources = Array.from(resourcesRef.current.values());
    let successCount = 0;
    let errorCount = 0;
    
    for (const resource of resources) {
      try {
        resource.cleanup();
        successCount++;
      } catch (error) {
        errorCount++;
        console.warn(`Failed to cleanup ${resource.type} resource:`, error);
      }
    }
    
    resourcesRef.current.clear();
    isCleanedUpRef.current = true;
    
    if (import.meta.env.DEV && (successCount > 0 || errorCount > 0)) {
      console.log(`🧹 Cleanup complete: ${successCount} success, ${errorCount} errors`);
    }
  }, []);

  /**
   * Get cleanup statistics
   */
  const getCleanupStats = useCallback(() => {
    const resources = Array.from(resourcesRef.current.values());
    const stats = {
      total: resources.length,
      byType: {
        timer: 0,
        interval: 0,
        listener: 0,
        subscription: 0,
        custom: 0
      },
      resources: resources.map(r => ({
        id: r.id,
        type: r.type,
        description: r.description
      }))
    };
    
    resources.forEach(resource => {
      stats.byType[resource.type]++;
    });
    
    return stats;
  }, []);

  /**
   * Check for potential memory leaks
   */
  const checkForLeaks = useCallback(() => {
    const stats = getCleanupStats();
    const hasLeaks = stats.total > 0;
    
    if (hasLeaks && import.meta.env.DEV) {
      console.warn('⚠️ Potential memory leaks detected:', stats);
    }
    
    return hasLeaks;
  }, [getCleanupStats]);

  // Automatic cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  // Development-only leak detection
  useEffect(() => {
    if (import.meta.env.DEV) {
      const checkInterval = setInterval(() => {
        checkForLeaks();
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(checkInterval);
    }
  }, [checkForLeaks]);

  return {
    registerTimer,
    registerInterval,
    registerEventListener,
    registerSubscription,
    registerCustomCleanup,
    unregister,
    cleanupAll,
    getCleanupStats,
    checkForLeaks
  };
};

/**
 * Simplified cleanup hook for common use cases
 */
export const useSimpleCleanup = () => {
  const cleanup = useCleanup();
  
  const addTimer = useCallback((callback: () => void, delay: number, description?: string) => {
    const timer = setTimeout(callback, delay);
    return cleanup.registerTimer(timer, description);
  }, [cleanup]);
  
  const addInterval = useCallback((callback: () => void, delay: number, description?: string) => {
    const interval = setInterval(callback, delay);
    return cleanup.registerInterval(interval, description);
  }, [cleanup]);
  
  const addListener = useCallback((
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions,
    description?: string
  ) => {
    return cleanup.registerEventListener(target, event, handler, options, description);
  }, [cleanup]);
  
  return {
    addTimer,
    addInterval,
    addListener,
    addSubscription: cleanup.registerSubscription,
    addCustomCleanup: cleanup.registerCustomCleanup,
    cleanup: cleanup.cleanupAll,
    stats: cleanup.getCleanupStats
  };
};

export default useCleanup;
