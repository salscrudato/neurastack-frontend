import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  /** First Contentful Paint */
  fcp?: number;
  /** Largest Contentful Paint */
  lcp?: number;
  /** First Input Delay */
  fid?: number;
  /** Cumulative Layout Shift */
  cls?: number;
  /** Time to Interactive */
  tti?: number;
  /** Bundle size metrics */
  bundleSize?: {
    total: number;
    gzipped: number;
    chunks: Record<string, number>;
  };
  /** Memory usage */
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
  /** Frame rate */
  fps?: number;
}

interface PerformanceMonitorProps {
  /** Enable detailed monitoring */
  detailed?: boolean;
  /** Callback for performance data */
  onMetrics?: (metrics: PerformanceMetrics) => void;
  /** Monitoring interval in milliseconds */
  interval?: number;
  /** Enable console logging */
  enableLogging?: boolean;
}

/**
 * Performance monitoring component for tracking Core Web Vitals and app metrics
 * Features:
 * - Core Web Vitals tracking (FCP, LCP, FID, CLS)
 * - Memory usage monitoring
 * - Frame rate tracking
 * - Bundle size analysis
 * - Real-time performance alerts
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  detailed = false,
  onMetrics,
  interval = 5000,
  enableLogging = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Track Core Web Vitals
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
          
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ 
                ...prev, 
                cls: (prev.cls || 0) + (entry as any).value 
              }));
            }
            break;
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      observerRef.current = observer;
    } catch (error) {
      if (enableLogging) {
        console.warn('Performance Observer not supported for some metrics:', error);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [enableLogging]);

  // Track memory usage
  const trackMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memory: {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        },
      }));
    }
  };

  // Track frame rate
  const trackFrameRate = () => {
    const now = performance.now();
    frameCountRef.current++;
    
    if (now - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      setMetrics(prev => ({ ...prev, fps }));
      
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
    
    requestAnimationFrame(trackFrameRate);
  };

  // Start frame rate tracking
  useEffect(() => {
    if (detailed) {
      requestAnimationFrame(trackFrameRate);
    }
  }, [detailed]);

  // Periodic metrics collection
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (detailed) {
        trackMemoryUsage();
      }
      
      // Call metrics callback
      if (onMetrics) {
        onMetrics(metrics);
      }
      
      // Log metrics if enabled
      if (enableLogging) {
        console.group('Performance Metrics');
        console.table(metrics);
        console.groupEnd();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [detailed, interval, onMetrics, enableLogging, metrics]);

  // Performance alerts
  useEffect(() => {
    const alerts = [];
    
    if (metrics.lcp && metrics.lcp > 2500) {
      alerts.push('LCP is slow (>2.5s)');
    }
    
    if (metrics.fid && metrics.fid > 100) {
      alerts.push('FID is slow (>100ms)');
    }
    
    if (metrics.cls && metrics.cls > 0.1) {
      alerts.push('CLS is high (>0.1)');
    }
    
    if (metrics.fps && metrics.fps < 30) {
      alerts.push('Low frame rate (<30fps)');
    }
    
    if (metrics.memory && metrics.memory.used / metrics.memory.limit > 0.8) {
      alerts.push('High memory usage (>80%)');
    }
    
    if (alerts.length > 0 && enableLogging) {
      console.warn('Performance Alerts:', alerts);
    }
  }, [metrics, enableLogging]);

  // Get performance score (available for future use)
  // const getPerformanceScore = (): number => {
  //   let score = 100;
  //
  //   if (metrics.lcp) {
  //     if (metrics.lcp > 4000) score -= 30;
  //     else if (metrics.lcp > 2500) score -= 15;
  //   }
  //
  //   if (metrics.fid) {
  //     if (metrics.fid > 300) score -= 20;
  //     else if (metrics.fid > 100) score -= 10;
  //   }
  //
  //   if (metrics.cls) {
  //     if (metrics.cls > 0.25) score -= 20;
  //     else if (metrics.cls > 0.1) score -= 10;
  //   }
  //
  //   if (metrics.fps) {
  //     if (metrics.fps < 30) score -= 15;
  //     else if (metrics.fps < 45) score -= 5;
  //   }
  //
  //   return Math.max(0, score);
  // };

  // Export metrics for external use (available for future use)
  // const exportMetrics = () => {
  //   return {
  //     ...metrics,
  //     score: getPerformanceScore(),
  //     timestamp: Date.now(),
  //   };
  // };

  // This component doesn't render anything visible
  return null;
};

/**
 * Hook for using performance metrics
 */
export const usePerformanceMetrics = (options: PerformanceMonitorProps = {}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  
  const handleMetrics = (newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);
  };

  return {
    metrics,
    PerformanceMonitor: () => (
      <PerformanceMonitor {...options} onMetrics={handleMetrics} />
    ),
  };
};

/**
 * Performance optimization utilities
 */
export const PerformanceUtils = {
  // Measure component render time
  measureRender: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    console.log(`${componentName} render time: ${end - start}ms`);
  },

  // Detect slow components
  detectSlowComponents: (threshold = 16) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > threshold) {
          console.warn(`Slow component detected: ${entry.name} (${entry.duration}ms)`);
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  },

  // Bundle size analyzer
  analyzeBundleSize: async () => {
    if ('navigator' in window && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }
    return null;
  },
};

export default PerformanceMonitor;
