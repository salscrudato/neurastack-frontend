import { useState, useEffect, useCallback } from 'react';
import { offlineCapabilityService } from '../services/offlineCapabilityService';

/**
 * Hook for monitoring IndexedDB memory usage and storage health
 */

interface IndexedDBStats {
  workoutPlans: number;
  workoutSessions: number;
  pendingSync: number;
  storageUsed: number;
  compressionRatio: number;
  lastCleanup: Date;
  memoryPressure: 'low' | 'medium' | 'high' | 'critical';
}

interface IndexedDBMemoryInfo {
  totalSizeMB: number;
  recordCounts: Record<string, number>;
  compressionRatio: number;
  oldestRecords: Record<string, string>;
  memoryPressure: string;
  retentionStatus: Record<string, { current: number; max: number; needsCleanup: boolean }>;
}

export const useIndexedDBMonitor = (options: {
  enableMonitoring?: boolean;
  monitoringInterval?: number;
  autoCleanup?: boolean;
} = {}) => {
  const {
    enableMonitoring = import.meta.env.DEV,
    monitoringInterval = 60000, // 1 minute
    autoCleanup = false
  } = options;

  const [stats, setStats] = useState<IndexedDBStats | null>(null);
  const [memoryInfo, setMemoryInfo] = useState<IndexedDBMemoryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  /**
   * Refresh storage statistics
   */
  const refreshStats = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const [statsData, memoryData] = await Promise.all([
        offlineCapabilityService.getOfflineStats(),
        offlineCapabilityService.getMemoryInfo()
      ]);
      
      setStats(statsData);
      setMemoryInfo(memoryData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh IndexedDB stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  /**
   * Perform manual cleanup
   */
  const performCleanup = useCallback(async (aggressive: boolean = false) => {
    setIsLoading(true);
    try {
      const result = await offlineCapabilityService.performManualCleanup(aggressive);
      
      // Refresh stats after cleanup
      await refreshStats();
      
      if (import.meta.env.DEV) {
        console.log('🧹 IndexedDB cleanup completed:', result);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to perform IndexedDB cleanup:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  /**
   * Clear all offline data
   */
  const clearAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      await offlineCapabilityService.clearOfflineData();
      await refreshStats();
      
      if (import.meta.env.DEV) {
        console.log('🗑️ All IndexedDB data cleared');
      }
    } catch (error) {
      console.error('Failed to clear IndexedDB data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  /**
   * Get formatted storage size
   */
  const getFormattedSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }, []);

  /**
   * Check if cleanup is recommended
   */
  const isCleanupRecommended = useCallback((): boolean => {
    if (!stats || !memoryInfo) return false;
    
    return stats.memoryPressure === 'high' || 
           stats.memoryPressure === 'critical' ||
           Object.values(memoryInfo.retentionStatus).some(status => status.needsCleanup);
  }, [stats, memoryInfo]);

  /**
   * Get storage health status
   */
  const getStorageHealth = useCallback((): {
    status: 'excellent' | 'good' | 'warning' | 'critical';
    message: string;
    recommendations: string[];
  } => {
    if (!stats || !memoryInfo) {
      return {
        status: 'good',
        message: 'Storage monitoring not available',
        recommendations: []
      };
    }

    const recommendations: string[] = [];
    let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    let message = 'Storage is operating optimally';

    if (stats.memoryPressure === 'critical') {
      status = 'critical';
      message = 'Critical storage usage - immediate cleanup required';
      recommendations.push('Perform aggressive cleanup immediately');
      recommendations.push('Consider reducing data retention periods');
    } else if (stats.memoryPressure === 'high') {
      status = 'warning';
      message = 'High storage usage detected';
      recommendations.push('Perform standard cleanup');
      recommendations.push('Review data retention policies');
    } else if (stats.memoryPressure === 'medium') {
      status = 'good';
      message = 'Storage usage is moderate';
      recommendations.push('Monitor storage growth');
    }

    // Check compression ratio
    if (stats.compressionRatio < 0.3 && memoryInfo.totalSizeMB > 10) {
      recommendations.push('Enable data compression for older records');
    }

    // Check individual store health
    Object.entries(memoryInfo.retentionStatus).forEach(([store, status]) => {
      if (status.needsCleanup) {
        recommendations.push(`Cleanup ${store} store (${status.current}/${status.max} records)`);
      }
    });

    return { status, message, recommendations };
  }, [stats, memoryInfo]);

  // Set up monitoring interval
  useEffect(() => {
    if (!enableMonitoring) return;

    // Initial load
    refreshStats();

    // Set up interval
    const interval = setInterval(refreshStats, monitoringInterval);

    return () => clearInterval(interval);
  }, [enableMonitoring, monitoringInterval, refreshStats]);

  // Auto cleanup if enabled
  useEffect(() => {
    if (!autoCleanup || !stats) return;

    if (stats.memoryPressure === 'critical') {
      performCleanup(true); // Aggressive cleanup
    } else if (stats.memoryPressure === 'high') {
      performCleanup(false); // Standard cleanup
    }
  }, [autoCleanup, stats, performCleanup]);

  return {
    stats,
    memoryInfo,
    isLoading,
    lastUpdate,
    refreshStats,
    performCleanup,
    clearAllData,
    getFormattedSize,
    isCleanupRecommended,
    getStorageHealth
  };
};

/**
 * Simple hook for basic storage monitoring
 */
export const useSimpleIndexedDBMonitor = () => {
  const { stats, getFormattedSize, isCleanupRecommended } = useIndexedDBMonitor({
    enableMonitoring: true,
    monitoringInterval: 5 * 60 * 1000, // 5 minutes
    autoCleanup: false
  });

  return {
    storageUsed: stats ? getFormattedSize(stats.storageUsed) : '0 B',
    memoryPressure: stats?.memoryPressure || 'low',
    needsCleanup: isCleanupRecommended(),
    recordCounts: {
      workoutPlans: stats?.workoutPlans || 0,
      workoutSessions: stats?.workoutSessions || 0,
      pendingSync: stats?.pendingSync || 0
    }
  };
};

export default useIndexedDBMonitor;
