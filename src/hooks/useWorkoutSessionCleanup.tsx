import { useEffect, useRef } from 'react';

interface WorkoutSessionState {
  workoutTimer?: NodeJS.Timeout;
  restTimer?: NodeJS.Timeout;
  wakeLock?: any;
  currentWorkout?: any;
  isActive: boolean;
}

/**
 * Hook for managing workout session cleanup and memory management
 */
export const useWorkoutSessionCleanup = () => {
  const sessionStateRef = useRef<WorkoutSessionState>({
    isActive: false
  });

  /**
   * Register a timer for cleanup
   */
  const registerTimer = (type: 'workout' | 'rest', timer: NodeJS.Timeout) => {
    if (type === 'workout') {
      sessionStateRef.current.workoutTimer = timer;
    } else {
      sessionStateRef.current.restTimer = timer;
    }
  };

  /**
   * Register wake lock for cleanup
   */
  const registerWakeLock = (wakeLock: any) => {
    sessionStateRef.current.wakeLock = wakeLock;
  };

  /**
   * Set current workout data
   */
  const setCurrentWorkout = (workout: any) => {
    sessionStateRef.current.currentWorkout = workout;
    sessionStateRef.current.isActive = !!workout;
  };

  /**
   * Clear all timers
   */
  const clearTimers = () => {
    if (sessionStateRef.current.workoutTimer) {
      clearInterval(sessionStateRef.current.workoutTimer);
      sessionStateRef.current.workoutTimer = undefined;
    }
    
    if (sessionStateRef.current.restTimer) {
      clearInterval(sessionStateRef.current.restTimer);
      sessionStateRef.current.restTimer = undefined;
    }
  };

  /**
   * Release wake lock
   */
  const releaseWakeLock = async () => {
    if (sessionStateRef.current.wakeLock) {
      try {
        await sessionStateRef.current.wakeLock.release();
        sessionStateRef.current.wakeLock = undefined;
      } catch (error) {
        console.warn('Failed to release wake lock:', error);
      }
    }
  };

  /**
   * Clear workout data from memory
   */
  const clearWorkoutData = () => {
    sessionStateRef.current.currentWorkout = undefined;
    sessionStateRef.current.isActive = false;
  };

  /**
   * Clear local storage workout data
   */
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('neurafit-workout-state');
      localStorage.removeItem('neurafit-current-workout');
      localStorage.removeItem('neurafit-workout-cache');
      localStorage.removeItem('neurafit-last-workout');
    } catch (error) {
      console.warn('Failed to clear workout localStorage:', error);
    }
  };

  /**
   * Complete cleanup of all workout session resources
   */
  const cleanupSession = async () => {
    console.log('🧹 Cleaning up workout session...');
    
    // Clear all timers
    clearTimers();
    
    // Release wake lock
    await releaseWakeLock();
    
    // Clear workout data from memory
    clearWorkoutData();
    
    // Clear local storage
    clearLocalStorage();
    
    console.log('✅ Workout session cleanup complete');
  };

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  /**
   * Cleanup when page is about to unload
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupSession();
    };

    const handleVisibilityChange = () => {
      if (document.hidden && sessionStateRef.current.isActive) {
        // Save state when page becomes hidden
        try {
          const state = {
            hasActiveWorkout: sessionStateRef.current.isActive,
            timestamp: Date.now()
          };
          localStorage.setItem('neurafit-session-state', JSON.stringify(state));
        } catch (error) {
          console.warn('Failed to save session state:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  /**
   * Memory usage monitoring (development only)
   */
  const monitorMemoryUsage = () => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      console.log('🧠 Memory Usage:', {
        used: `${Math.round(memInfo.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memInfo.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    }
  };

  /**
   * Force garbage collection (development only)
   */
  const forceGarbageCollection = () => {
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      try {
        (window as any).gc();
        console.log('🗑️ Forced garbage collection');
      } catch (error) {
        console.warn('Failed to force garbage collection:', error);
      }
    }
  };

  /**
   * Check for memory leaks
   */
  const checkForMemoryLeaks = () => {
    const activeTimers = [
      sessionStateRef.current.workoutTimer,
      sessionStateRef.current.restTimer
    ].filter(Boolean).length;

    const hasWakeLock = !!sessionStateRef.current.wakeLock;
    const hasWorkoutData = !!sessionStateRef.current.currentWorkout;

    if (activeTimers > 0 || hasWakeLock || hasWorkoutData) {
      console.warn('⚠️ Potential memory leaks detected:', {
        activeTimers,
        hasWakeLock,
        hasWorkoutData
      });
      return true;
    }

    return false;
  };

  return {
    registerTimer,
    registerWakeLock,
    setCurrentWorkout,
    clearTimers,
    releaseWakeLock,
    clearWorkoutData,
    clearLocalStorage,
    cleanupSession,
    monitorMemoryUsage,
    forceGarbageCollection,
    checkForMemoryLeaks
  };
};
