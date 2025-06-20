import { useEffect, useRef, useState, useCallback } from 'react';
import { cacheManager } from '../lib/cacheManager';

/**
 * Memory monitoring and management hook
 * Provides real-time memory usage tracking and optimization suggestions
 */

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
  isHighUsage: boolean;
  isCriticalUsage: boolean;
}

interface MemoryAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  action?: string;
}

export const useMemoryMonitor = (options: {
  enableMonitoring?: boolean;
  monitoringInterval?: number;
  alertThresholds?: {
    warning: number; // 0-1
    critical: number; // 0-1
  };
} = {}) => {
  const {
    enableMonitoring = import.meta.env.DEV,
    monitoringInterval = 30000, // 30 seconds
    alertThresholds = { warning: 0.7, critical: 0.85 }
  } = options;

  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);
  const [alerts, setAlerts] = useState<MemoryAlert[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertRef = useRef<{ [key: string]: number }>({});

  /**
   * Check if memory monitoring is supported
   */
  const checkSupport = useCallback(() => {
    const supported = typeof window !== 'undefined' && 
                     'performance' in window && 
                     'memory' in performance;
    setIsSupported(supported);
    return supported;
  }, []);

  /**
   * Get current memory metrics
   */
  const getMemoryMetrics = useCallback((): MemoryMetrics | null => {
    if (!checkSupport()) return null;

    try {
      const memInfo = (performance as any).memory;
      const usagePercentage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
      
      return {
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
        jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
        usagePercentage,
        isHighUsage: usagePercentage > alertThresholds.warning,
        isCriticalUsage: usagePercentage > alertThresholds.critical
      };
    } catch (error) {
      console.warn('Failed to get memory metrics:', error);
      return null;
    }
  }, [alertThresholds, checkSupport]);

  /**
   * Add a memory alert
   */
  const addAlert = useCallback((
    level: MemoryAlert['level'],
    message: string,
    action?: string
  ) => {
    const now = Date.now();
    const alertKey = `${level}-${message}`;
    
    // Throttle similar alerts (max once per 5 minutes)
    if (lastAlertRef.current[alertKey] && 
        now - lastAlertRef.current[alertKey] < 5 * 60 * 1000) {
      return;
    }
    
    lastAlertRef.current[alertKey] = now;
    
    const alert: MemoryAlert = {
      id: `alert-${now}-${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: now,
      action
    };
    
    setAlerts(prev => [...prev.slice(-9), alert]); // Keep last 10 alerts
    
    if (import.meta.env.DEV) {
      const emoji = level === 'critical' ? '🚨' : level === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${emoji} Memory Alert: ${message}${action ? ` - ${action}` : ''}`);
    }
  }, []);

  /**
   * Clear alerts
   */
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    lastAlertRef.current = {};
  }, []);

  /**
   * Perform memory optimization
   */
  const optimizeMemory = useCallback(async () => {
    const currentMetrics = getMemoryMetrics();
    if (!currentMetrics) return;

    let optimizationCount = 0;

    // Clear cache if memory usage is high
    if (currentMetrics.usagePercentage > alertThresholds.warning) {
      const cacheStats = cacheManager.getStats();
      if (cacheStats.size > 0) {
        cacheManager.invalidateAll('memory-optimization');
        optimizationCount++;
        addAlert('info', 'Cache cleared to free memory');
      }
    }

    // Force garbage collection if available and critical
    if (currentMetrics.isCriticalUsage && 'gc' in window) {
      try {
        (window as any).gc();
        optimizationCount++;
        addAlert('info', 'Garbage collection triggered');
      } catch (error) {
        console.warn('Failed to trigger garbage collection:', error);
      }
    }

    // Clear localStorage if critical
    if (currentMetrics.isCriticalUsage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('neurastack-') || key.startsWith('neurafit-'))) {
            // Keep essential data, remove caches and temporary data
            if (key.includes('cache') || key.includes('temp') || key.includes('session-state')) {
              keysToRemove.push(key);
            }
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        if (keysToRemove.length > 0) {
          optimizationCount++;
          addAlert('info', `Cleared ${keysToRemove.length} localStorage entries`);
        }
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }

    return optimizationCount;
  }, [getMemoryMetrics, alertThresholds, addAlert]);

  /**
   * Monitor memory usage
   */
  const monitorMemory = useCallback(() => {
    const currentMetrics = getMemoryMetrics();
    if (!currentMetrics) return;

    setMetrics(currentMetrics);

    // Check for alerts
    if (currentMetrics.isCriticalUsage) {
      addAlert(
        'critical',
        `Critical memory usage: ${(currentMetrics.usagePercentage * 100).toFixed(1)}%`,
        'Consider closing other tabs or refreshing the page'
      );
      
      // Auto-optimize on critical usage
      optimizeMemory();
    } else if (currentMetrics.isHighUsage) {
      addAlert(
        'warning',
        `High memory usage: ${(currentMetrics.usagePercentage * 100).toFixed(1)}%`,
        'Memory optimization may be needed soon'
      );
    }
  }, [getMemoryMetrics, addAlert, optimizeMemory]);

  /**
   * Get formatted memory info
   */
  const getFormattedMemoryInfo = useCallback(() => {
    if (!metrics) return null;

    const formatBytes = (bytes: number) => {
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(1)} MB`;
    };

    return {
      used: formatBytes(metrics.usedJSHeapSize),
      total: formatBytes(metrics.totalJSHeapSize),
      limit: formatBytes(metrics.jsHeapSizeLimit),
      percentage: `${(metrics.usagePercentage * 100).toFixed(1)}%`,
      status: metrics.isCriticalUsage ? 'critical' : 
              metrics.isHighUsage ? 'warning' : 'normal'
    };
  }, [metrics]);

  // Initialize monitoring
  useEffect(() => {
    if (!enableMonitoring) return;

    checkSupport();
    
    if (isSupported) {
      // Initial check
      monitorMemory();
      
      // Set up monitoring interval
      intervalRef.current = setInterval(monitorMemory, monitoringInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enableMonitoring, isSupported, monitorMemory, monitoringInterval, checkSupport]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    metrics,
    alerts,
    isSupported,
    getMemoryMetrics,
    optimizeMemory,
    clearAlerts,
    getFormattedMemoryInfo,
    monitorMemory
  };
};

/**
 * Simple memory monitor for basic usage
 */
export const useSimpleMemoryMonitor = () => {
  const { metrics, isSupported, getFormattedMemoryInfo } = useMemoryMonitor({
    enableMonitoring: true,
    monitoringInterval: 60000 // 1 minute
  });

  return {
    memoryInfo: getFormattedMemoryInfo(),
    isHighUsage: metrics?.isHighUsage || false,
    isCriticalUsage: metrics?.isCriticalUsage || false,
    isSupported
  };
};

export default useMemoryMonitor;
