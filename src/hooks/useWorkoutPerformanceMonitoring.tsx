import { useCallback, useRef } from 'react';

interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  errorType?: string;
  retryCount?: number;
  workoutType?: string;
  userId?: string;
}

interface PerformanceStats {
  averageDuration: number;
  successRate: number;
  totalGenerations: number;
  errorBreakdown: Record<string, number>;
}

/**
 * Hook for monitoring workout generation performance
 */
export const useWorkoutPerformanceMonitoring = () => {
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const currentSessionRef = useRef<{ startTime: number; workoutType?: string } | null>(null);

  /**
   * Start tracking a workout generation session
   */
  const startTracking = useCallback((workoutType?: string) => {
    currentSessionRef.current = {
      startTime: performance.now(),
      workoutType
    };
  }, []);

  /**
   * End tracking and record metrics
   */
  const endTracking = useCallback((
    success: boolean, 
    errorType?: string, 
    retryCount?: number,
    userId?: string
  ) => {
    if (!currentSessionRef.current) {
      console.warn('Performance tracking: No active session to end');
      return;
    }

    const endTime = performance.now();
    const duration = endTime - currentSessionRef.current.startTime;

    const metrics: PerformanceMetrics = {
      startTime: currentSessionRef.current.startTime,
      endTime,
      duration,
      success,
      errorType,
      retryCount,
      workoutType: currentSessionRef.current.workoutType,
      userId
    };

    // Store metrics
    metricsRef.current.push(metrics);

    // Keep only last 100 entries to prevent memory bloat
    if (metricsRef.current.length > 100) {
      metricsRef.current = metricsRef.current.slice(-100);
    }

    // Log performance metrics
    console.log(`🏋️ Workout Generation Performance: ${duration.toFixed(2)}ms, Success: ${success}`);
    
    if (errorType) {
      console.warn(`❌ Error Type: ${errorType}`);
    }
    
    if (retryCount && retryCount > 0) {
      console.log(`🔄 Retries: ${retryCount}`);
    }

    // Send to analytics service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'workout_generation_performance', {
        duration_ms: Math.round(duration),
        success: success,
        error_type: errorType || 'none',
        retry_count: retryCount || 0,
        workout_type: currentSessionRef.current.workoutType || 'unknown'
      });
    }

    // Send to custom analytics if available
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Workout Generation Performance', {
        duration: Math.round(duration),
        success: success,
        errorType: errorType || 'none',
        retryCount: retryCount || 0,
        workoutType: currentSessionRef.current.workoutType || 'unknown',
        userId: userId || 'anonymous'
      });
    }

    // Clear current session
    currentSessionRef.current = null;

    return metrics;
  }, []);

  /**
   * Get performance statistics
   */
  const getPerformanceStats = useCallback((): PerformanceStats => {
    const metrics = metricsRef.current;
    
    if (metrics.length === 0) {
      return {
        averageDuration: 0,
        successRate: 0,
        totalGenerations: 0,
        errorBreakdown: {}
      };
    }

    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const successCount = metrics.filter(m => m.success).length;
    const errorBreakdown: Record<string, number> = {};

    metrics.forEach(m => {
      if (!m.success && m.errorType) {
        errorBreakdown[m.errorType] = (errorBreakdown[m.errorType] || 0) + 1;
      }
    });

    return {
      averageDuration: totalDuration / metrics.length,
      successRate: successCount / metrics.length,
      totalGenerations: metrics.length,
      errorBreakdown
    };
  }, []);

  /**
   * Get recent performance trends
   */
  const getRecentTrends = useCallback((lastN: number = 10) => {
    const recentMetrics = metricsRef.current.slice(-lastN);
    
    if (recentMetrics.length === 0) {
      return {
        averageDuration: 0,
        successRate: 0,
        trend: 'stable' as 'improving' | 'degrading' | 'stable'
      };
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const successCount = recentMetrics.filter(m => m.success).length;
    const averageDuration = totalDuration / recentMetrics.length;
    const successRate = successCount / recentMetrics.length;

    // Determine trend by comparing first half vs second half
    if (recentMetrics.length >= 4) {
      const firstHalf = recentMetrics.slice(0, Math.floor(recentMetrics.length / 2));
      const secondHalf = recentMetrics.slice(Math.floor(recentMetrics.length / 2));

      const firstHalfSuccess = firstHalf.filter(m => m.success).length / firstHalf.length;
      const secondHalfSuccess = secondHalf.filter(m => m.success).length / secondHalf.length;

      const firstHalfDuration = firstHalf.reduce((sum, m) => sum + m.duration, 0) / firstHalf.length;
      const secondHalfDuration = secondHalf.reduce((sum, m) => sum + m.duration, 0) / secondHalf.length;

      let trend: 'improving' | 'degrading' | 'stable' = 'stable';
      
      // Improving if success rate increased or duration decreased significantly
      if (secondHalfSuccess > firstHalfSuccess + 0.1 || secondHalfDuration < firstHalfDuration * 0.8) {
        trend = 'improving';
      }
      // Degrading if success rate decreased or duration increased significantly
      else if (secondHalfSuccess < firstHalfSuccess - 0.1 || secondHalfDuration > firstHalfDuration * 1.2) {
        trend = 'degrading';
      }

      return {
        averageDuration,
        successRate,
        trend
      };
    }

    return {
      averageDuration,
      successRate,
      trend: 'stable' as const
    };
  }, []);

  /**
   * Clear all performance data
   */
  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
    currentSessionRef.current = null;
  }, []);

  /**
   * Export metrics for debugging or analysis
   */
  const exportMetrics = useCallback(() => {
    return {
      metrics: [...metricsRef.current],
      stats: getPerformanceStats(),
      recentTrends: getRecentTrends()
    };
  }, [getPerformanceStats, getRecentTrends]);

  /**
   * Check if performance is degraded
   */
  const isPerformanceDegraded = useCallback(() => {
    const stats = getPerformanceStats();
    const trends = getRecentTrends();
    
    // Consider performance degraded if:
    // - Success rate is below 80%
    // - Average duration is above 30 seconds
    // - Recent trend is degrading
    return (
      stats.successRate < 0.8 ||
      stats.averageDuration > 30000 ||
      trends.trend === 'degrading'
    );
  }, [getPerformanceStats, getRecentTrends]);

  return {
    startTracking,
    endTracking,
    getPerformanceStats,
    getRecentTrends,
    clearMetrics,
    exportMetrics,
    isPerformanceDegraded
  };
};
