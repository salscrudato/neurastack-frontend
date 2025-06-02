import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  fps: number;
  loadTime: number;
}

interface PerformanceConfig {
  enableFPSMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  enableRenderTimeMonitoring?: boolean;
  reportingInterval?: number;
}

export function usePerformanceMonitor(config: PerformanceConfig = {}) {
  const {
    enableFPSMonitoring = false, // Disabled by default to reduce overhead
    enableMemoryMonitoring = false, // Disabled by default to reduce overhead
    enableRenderTimeMonitoring = false, // Disabled by default to reduce overhead
    reportingInterval = 30000, // Increased to 30 seconds to reduce frequency
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    loadTime: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderStartTime = useRef(0);
  const fpsHistory = useRef<number[]>([]);

  // Monitor FPS
  useEffect(() => {
    if (!enableFPSMonitoring) return;

    let animationId: number;

    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();

      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        fpsHistory.current.push(fps);

        // Keep only last 10 measurements
        if (fpsHistory.current.length > 10) {
          fpsHistory.current.shift();
        }

        const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;

        setMetrics(prev => ({ ...prev, fps: Math.round(avgFPS) }));

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enableFPSMonitoring]);

  // Monitor memory usage
  useEffect(() => {
    if (!enableMemoryMonitoring) return;

    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    const interval = setInterval(measureMemory, reportingInterval);
    measureMemory(); // Initial measurement

    return () => clearInterval(interval);
  }, [enableMemoryMonitoring, reportingInterval]);

  // Monitor render time
  useEffect(() => {
    if (!enableRenderTimeMonitoring) return;

    renderStartTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    };
  }, [enableRenderTimeMonitoring]); // Add dependency array

  // Monitor page load time
  useEffect(() => {
    const measureLoadTime = () => {
      if (document.readyState === 'complete') {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          setMetrics(prev => ({ ...prev, loadTime }));
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

// Hook for monitoring specific operations
export function useOperationTimer() {
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});

  const startTimer = (operationName: string) => {
    setTimers(prev => ({
      ...prev,
      [operationName]: performance.now()
    }));
  };

  const endTimer = (operationName: string) => {
    const startTime = timers[operationName];
    if (startTime) {
      const duration = performance.now() - startTime;
      setDurations(prev => ({
        ...prev,
        [operationName]: duration
      }));

      // Clean up timer
      setTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[operationName];
        return newTimers;
      });

      return duration;
    }
    return 0;
  };

  const getAverageTime = (_operationName: string, measurements: number[] = []) => {
    if (measurements.length === 0) return 0;
    return measurements.reduce((a, b) => a + b, 0) / measurements.length;
  };

  return {
    startTimer,
    endTimer,
    durations,
    getAverageTime,
  };
}

// Hook for detecting performance issues
export function usePerformanceAlerts() {
  const metrics = usePerformanceMonitor();
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const newAlerts: string[] = [];

    // Check FPS
    if (metrics.fps > 0 && metrics.fps < 30) {
      newAlerts.push('Low frame rate detected. Consider reducing animations or visual effects.');
    }

    // Check memory usage
    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      newAlerts.push('High memory usage detected. Consider clearing chat history or refreshing the page.');
    }

    // Check render time
    if (metrics.renderTime > 100) {
      newAlerts.push('Slow rendering detected. The page may be unresponsive.');
    }

    setAlerts(newAlerts);
  }, [metrics]);

  const clearAlerts = () => setAlerts([]);

  return { alerts, clearAlerts, metrics };
}

// Development-only performance logger with throttling (disabled by default)
export function usePerformanceLogger(enabled: boolean = false) {
  const metrics = usePerformanceMonitor();
  const lastLoggedMetrics = useRef<PerformanceMetrics | null>(null);
  const lastLogTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const logPerformance = () => {
      const now = Date.now();
      const timeSinceLastLog = now - lastLogTime.current;

      // Only log every 60 seconds to reduce console spam
      if (timeSinceLastLog < 60000) return;

      // Only log if there are significant performance issues
      const current = metrics;

      // Only log if there are actual performance problems
      const hasPerformanceIssues =
        (current.fps > 0 && current.fps < 20) || // Critically low FPS
        (current.memoryUsage && current.memoryUsage > 150) || // Very high memory usage
        (current.renderTime > 200); // Very slow render time

      if (hasPerformanceIssues) {
        console.group('⚠️ Performance Alert');
        if (current.fps > 0 && current.fps < 20) {
          console.warn('Low FPS detected:', current.fps);
        }
        if (current.memoryUsage && current.memoryUsage > 150) {
          console.warn('High memory usage detected:', `${current.memoryUsage}MB`);
        }
        if (current.renderTime > 200) {
          console.warn('Slow render time detected:', `${current.renderTime.toFixed(2)}ms`);
        }
        console.groupEnd();

        lastLoggedMetrics.current = { ...current };
        lastLogTime.current = now;
      }
    };

    const interval = setInterval(logPerformance, 60000); // Log every 60 seconds

    return () => clearInterval(interval);
  }, [enabled]); // Remove metrics from dependency array

  return metrics;
}
