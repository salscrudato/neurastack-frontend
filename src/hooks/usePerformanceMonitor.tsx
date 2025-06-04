import { useEffect, useState } from 'react';

interface SimplePerformanceMetrics {
  loadTime: number;
  isSlowConnection: boolean;
}

// Simplified performance monitoring - only track essential metrics
export function useSimplePerformance() {
  const [metrics, setMetrics] = useState<SimplePerformanceMetrics>({
    loadTime: 0,
    isSlowConnection: false,
  });

  // Track page load time only
  useEffect(() => {
    const measureLoadTime = () => {
      if (document.readyState === 'complete') {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          const isSlowConnection = loadTime > 3000; // Consider >3s as slow

          setMetrics({
            loadTime,
            isSlowConnection,
          });
        }
      }
    };

    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
      return () => window.removeEventListener('load', measureLoadTime);
    }
  }, []);

  return metrics;
}

// Simple operation timer for debugging
export function useOperationTimer() {
  const startTimer = (operationName: string) => {
    console.time(operationName);
  };

  const endTimer = (operationName: string) => {
    console.timeEnd(operationName);
  };

  return { startTimer, endTimer };
}

// Legacy exports for backward compatibility
export const usePerformanceMonitor = useSimplePerformance;
export const usePerformanceAlerts = () => ({ alerts: [], clearAlerts: () => {}, metrics: useSimplePerformance() });
export const usePerformanceLogger = () => useSimplePerformance();
