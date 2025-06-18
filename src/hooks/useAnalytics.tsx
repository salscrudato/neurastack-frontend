/**
 * Analytics Hook for NeuraStack
 * 
 * React hook that provides easy access to analytics functions
 * and automatically handles initialization and session management.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    endSession,
    initializeAnalytics,
    trackChatInteraction,
    trackError,
    trackEvent,
    trackFeatureUsage,
    trackFitnessInteraction,
    trackPageView,
    trackPerformanceMetric,
    trackUsageFrequency,
    trackUserLocation,
    type UsageMetrics,
    type UserLocation
} from '../services/analyticsService';

// ============================================================================
// Hook Interface
// ============================================================================

export interface AnalyticsHook {
  // Core tracking functions
  trackPage: (page?: string, data?: Record<string, any>) => void;
  trackCustomEvent: (eventName: string, parameters?: Record<string, any>) => void;
  
  // Feature-specific tracking
  trackChat: (data: {
    messageLength: number;
    responseTime: number;
    modelsUsed: string[];
    sessionId?: string;
    messageType?: 'text' | 'image' | 'file';
  }) => void;
  
  trackFitness: (data: {
    action: 'goal_selected' | 'workout_generated' | 'workout_completed' | 'profile_updated';
    fitnessLevel?: string;
    goals?: string[];
    equipment?: string[];
    workoutType?: string;
    duration?: number;
  }) => void;
  
  trackFeature: (feature: string, action: string, metadata?: Record<string, any>) => void;
  trackPerformance: (metricName: string, value: number, unit: string, context?: string) => void;
  trackAppError: (error: Error, component?: string) => void;
  
  // Session management
  endCurrentSession: () => void;
  
  // User data
  userLocation: UserLocation | null;
  usageMetrics: UsageMetrics | null;
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Main analytics hook with automatic initialization and page tracking
 */
export function useAnalytics(): AnalyticsHook {
  const location = useLocation();
  const initialized = useRef(false);
  const userLocationRef = useRef<UserLocation | null>(null);
  const usageMetricsRef = useRef<UsageMetrics | null>(null);

  // Initialize analytics on first mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      
      // Initialize analytics
      initializeAnalytics();
      
      // Track initial usage metrics
      const metrics = trackUsageFrequency();
      usageMetricsRef.current = metrics;
      
      // Track user location
      trackUserLocation().then(location => {
        userLocationRef.current = location;
      });
      
      // Set up session end tracking
      const handleBeforeUnload = () => {
        endSession();
      };
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          endSession();
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        endSession();
      };
    }
  }, []);

  // Track page changes automatically
  useEffect(() => {
    if (initialized.current) {
      const pageName = getPageName(location.pathname);
      trackPageView(pageName, {
        full_path: location.pathname,
        search_params: location.search,
        hash: location.hash
      });
    }
  }, [location]);

  // Memoized tracking functions
  const trackPage = useCallback((page?: string, data?: Record<string, any>) => {
    const pageName = page || getPageName(location.pathname);
    trackPageView(pageName, data);
  }, [location.pathname]);

  const trackCustomEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    trackEvent(eventName, parameters);
  }, []);

  const trackChat = useCallback((data: {
    messageLength: number;
    responseTime: number;
    modelsUsed: string[];
    sessionId?: string;
    messageType?: 'text' | 'image' | 'file';
  }) => {
    trackChatInteraction(data);
  }, []);

  const trackFitness = useCallback((data: {
    action: 'goal_selected' | 'workout_generated' | 'workout_completed' | 'profile_updated';
    fitnessLevel?: string;
    goals?: string[];
    equipment?: string[];
    workoutType?: string;
    duration?: number;
  }) => {
    trackFitnessInteraction(data);
  }, []);

  const trackFeature = useCallback((feature: string, action: string, metadata?: Record<string, any>) => {
    trackFeatureUsage(feature, action, metadata);
  }, []);

  const trackPerformance = useCallback((metricName: string, value: number, unit: string, context?: string) => {
    trackPerformanceMetric({ metricName, value, unit, context });
  }, []);

  const trackAppError = useCallback((error: Error, component?: string) => {
    trackError({
      errorType: error.name,
      errorMessage: error.message,
      component,
      stackTrace: error.stack
    });
  }, []);

  const endCurrentSession = useCallback(() => {
    endSession();
  }, []);

  return {
    trackPage,
    trackCustomEvent,
    trackChat,
    trackFitness,
    trackFeature,
    trackPerformance,
    trackAppError,
    endCurrentSession,
    userLocation: userLocationRef.current,
    usageMetrics: usageMetricsRef.current
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook specifically for chat page analytics
 */
export function useChatAnalytics() {
  const { trackChat, trackFeature, trackPerformance } = useAnalytics();
  
  const trackMessage = useCallback((
    messageLength: number,
    responseTime: number,
    modelsUsed: string[],
    sessionId?: string
  ) => {
    trackChat({
      messageLength,
      responseTime,
      modelsUsed,
      sessionId,
      messageType: 'text'
    });
  }, [trackChat]);

  const trackChatFeature = useCallback((action: string, metadata?: Record<string, any>) => {
    trackFeature('chat', action, metadata);
  }, [trackFeature]);

  const trackChatPerformance = useCallback((metricName: string, value: number) => {
    trackPerformance(metricName, value, 'ms', 'chat');
  }, [trackPerformance]);

  return {
    trackMessage,
    trackChatFeature,
    trackChatPerformance
  };
}

/**
 * Hook specifically for NeuraFit analytics
 */
export function useNeuraFitAnalytics() {
  const { trackFitness, trackFeature } = useAnalytics();
  
  const trackGoalSelection = useCallback((goals: string[], fitnessLevel?: string) => {
    trackFitness({
      action: 'goal_selected',
      goals,
      fitnessLevel
    });
  }, [trackFitness]);

  const trackWorkoutGeneration = useCallback((
    workoutType: string,
    equipment: string[],
    duration?: number
  ) => {
    trackFitness({
      action: 'workout_generated',
      workoutType,
      equipment,
      duration
    });
  }, [trackFitness]);

  const trackWorkoutCompletion = useCallback((
    workoutType: string,
    duration: number,
    fitnessLevel?: string
  ) => {
    trackFitness({
      action: 'workout_completed',
      workoutType,
      duration,
      fitnessLevel
    });
  }, [trackFitness]);

  const trackProfileUpdate = useCallback((
    fitnessLevel?: string,
    goals?: string[],
    equipment?: string[]
  ) => {
    trackFitness({
      action: 'profile_updated',
      fitnessLevel,
      goals,
      equipment
    });
  }, [trackFitness]);

  const trackFitnessFeature = useCallback((action: string, metadata?: Record<string, any>) => {
    trackFeature('neurafit', action, metadata);
  }, [trackFeature]);

  return {
    trackGoalSelection,
    trackWorkoutGeneration,
    trackWorkoutCompletion,
    trackProfileUpdate,
    trackFitnessFeature
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert pathname to readable page name
 */
function getPageName(pathname: string): string {
  const pathMap: Record<string, string> = {
    '/': 'home',
    '/chat': 'chat',
    '/neurafit': 'neurafit_dashboard',
    '/neurafit/onboarding': 'neurafit_onboarding',
    '/neurafit/workout': 'neurafit_workout',
    '/history': 'chat_history',
    '/profile': 'profile',
    '/admin': 'admin'
  };

  // Check for exact matches first
  if (pathMap[pathname]) {
    return pathMap[pathname];
  }

  // Handle dynamic routes
  if (pathname.startsWith('/neurafit/')) {
    return 'neurafit_page';
  }
  
  if (pathname.startsWith('/chat/')) {
    return 'chat_session';
  }

  // Default fallback
  return pathname.replace(/^\//, '').replace(/\//g, '_') || 'unknown_page';
}
