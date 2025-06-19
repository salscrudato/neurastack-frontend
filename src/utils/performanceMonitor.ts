/**
 * Performance monitoring utilities for NeuraFit application
 * Tracks Core Web Vitals, bundle size, and runtime performance
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  timeToInteractive?: number;
  bundleSize?: number;
  memoryUsage?: number;
  renderTime?: number;
  apiResponseTime?: number;
  
  // User experience metrics
  pageLoadTime?: number;
  navigationTiming?: PerformanceNavigationTiming;
  resourceTiming?: PerformanceResourceTiming[];
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
}

// Performance thresholds based on Core Web Vitals
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 }
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: Map<string, PerformanceObserver> = new Map();
  private startTime: number = performance.now();

  constructor() {
    this.initializeObservers();
    this.measureInitialMetrics();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number };
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // Navigation timing
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.metrics.navigationTiming = entry as PerformanceNavigationTiming;
            this.calculateDerivedMetrics();
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }

      // Resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceResourceTiming[];
          this.metrics.resourceTiming = entries;
          this.calculateBundleSize();
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  /**
   * Measure initial performance metrics
   */
  private measureInitialMetrics(): void {
    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      this.metrics.fcp = fcpEntry.startTime;
    }

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.metrics.navigationTiming = navigationEntry;
    }

    // Memory usage (if available)
    this.measureMemoryUsage();
  }

  /**
   * Calculate derived metrics from navigation timing
   */
  private calculateDerivedMetrics(): void {
    const nav = this.metrics.navigationTiming;
    if (!nav) return;

    // Page load time
    this.metrics.pageLoadTime = nav.loadEventEnd - nav.navigationStart;

    // Time to Interactive (approximation)
    this.metrics.timeToInteractive = nav.domInteractive - nav.navigationStart;
  }

  /**
   * Calculate bundle size from resource timing
   */
  private calculateBundleSize(): void {
    if (!this.metrics.resourceTiming) return;

    let totalSize = 0;
    this.metrics.resourceTiming.forEach((resource) => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        totalSize += resource.transferSize || 0;
      }
    });

    this.metrics.bundleSize = totalSize;
  }

  /**
   * Measure current memory usage
   */
  measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    }
  }

  /**
   * Measure render time for a specific operation
   */
  measureRenderTime<T>(operation: () => T, label?: string): T {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    this.metrics.renderTime = end - start;
    
    if (label) {
      console.log(`Render time for ${label}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }

  /**
   * Measure API response time
   */
  async measureApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint?: string
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      this.metrics.apiResponseTime = end - start;
      
      if (endpoint) {
        console.log(`API call to ${endpoint}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      this.metrics.apiResponseTime = end - start;
      throw error;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    this.measureMemoryUsage();
    return { ...this.metrics };
  }

  /**
   * Get performance score based on Core Web Vitals
   */
  getPerformanceScore(): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    details: Record<string, { value: number; score: number; status: 'good' | 'needs-improvement' | 'poor' }>;
  } {
    const details: Record<string, any> = {};
    let totalScore = 0;
    let metricCount = 0;

    // Score each Core Web Vital
    Object.entries(PERFORMANCE_THRESHOLDS).forEach(([metric, thresholds]) => {
      const value = this.metrics[metric as keyof PerformanceMetrics] as number;
      if (value !== undefined) {
        let score = 100;
        let status: 'good' | 'needs-improvement' | 'poor' = 'good';

        if (value > thresholds.needsImprovement) {
          score = 0;
          status = 'poor';
        } else if (value > thresholds.good) {
          score = 50;
          status = 'needs-improvement';
        }

        details[metric] = { value, score, status };
        totalScore += score;
        metricCount++;
      }
    });

    const averageScore = metricCount > 0 ? totalScore / metricCount : 0;
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';

    if (averageScore >= 90) grade = 'A';
    else if (averageScore >= 80) grade = 'B';
    else if (averageScore >= 70) grade = 'C';
    else if (averageScore >= 60) grade = 'D';

    return {
      score: Math.round(averageScore),
      grade,
      details
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();

    return `
Performance Report
==================
Overall Score: ${score.score}/100 (Grade: ${score.grade})

Core Web Vitals:
- LCP: ${metrics.lcp?.toFixed(0)}ms (${score.details.lcp?.status || 'N/A'})
- FID: ${metrics.fid?.toFixed(0)}ms (${score.details.fid?.status || 'N/A'})
- CLS: ${metrics.cls?.toFixed(3)} (${score.details.cls?.status || 'N/A'})
- FCP: ${metrics.fcp?.toFixed(0)}ms (${score.details.fcp?.status || 'N/A'})
- TTFB: ${metrics.ttfb?.toFixed(0)}ms (${score.details.ttfb?.status || 'N/A'})

Additional Metrics:
- Page Load Time: ${metrics.pageLoadTime?.toFixed(0)}ms
- Time to Interactive: ${metrics.timeToInteractive?.toFixed(0)}ms
- Bundle Size: ${(metrics.bundleSize || 0 / 1024).toFixed(1)}KB
- Memory Usage: ${((metrics.memoryUsage || 0) / 1024 / 1024).toFixed(1)}MB
- Last Render Time: ${metrics.renderTime?.toFixed(2)}ms
- Last API Response: ${metrics.apiResponseTime?.toFixed(2)}ms
    `.trim();
  }

  /**
   * Clean up observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const measurePerformance = {
  /**
   * Measure component render time
   */
  component: <T,>(component: () => T, name?: string): T => {
    return performanceMonitor.measureRenderTime(component, name);
  },

  /**
   * Measure API call performance
   */
  api: <T,>(call: () => Promise<T>, endpoint?: string): Promise<T> => {
    return performanceMonitor.measureApiCall(call, endpoint);
  },

  /**
   * Mark a custom performance point
   */
  mark: (name: string): void => {
    performance.mark(name);
  },

  /**
   * Measure time between two marks
   */
  measure: (name: string, startMark: string, endMark?: string): number => {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    return measure.duration;
  }
};

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({});
  const [score, setScore] = React.useState<ReturnType<PerformanceMonitor['getPerformanceScore']>>();

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
      setScore(performanceMonitor.getPerformanceScore());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    score,
    generateReport: () => performanceMonitor.generateReport(),
    measureRender: performanceMonitor.measureRenderTime.bind(performanceMonitor),
    measureApi: performanceMonitor.measureApiCall.bind(performanceMonitor)
  };
};

export default performanceMonitor;
