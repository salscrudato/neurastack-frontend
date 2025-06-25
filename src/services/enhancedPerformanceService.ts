/**
 * Enhanced Performance Monitoring Service
 * 
 * Provides comprehensive performance monitoring, optimization suggestions,
 * and real-time performance tracking for the NeuraStack application.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class EnhancedPerformanceService {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private thresholds: PerformanceThresholds = {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    ttfb: 600, // 600ms
  };

  private isMonitoring = false;
  private sampleRate = 0.1; // 10% sampling rate

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined' || this.isMonitoring) return;

    // Only monitor in production with sampling
    if (import.meta.env.PROD && Math.random() < this.sampleRate) {
      this.setupWebVitalsMonitoring();
      this.setupResourceMonitoring();
      this.setupNavigationMonitoring();
      this.setupMemoryMonitoring();
      this.isMonitoring = true;
    }
  }

  /**
   * Setup Web Vitals monitoring
   */
  private setupWebVitalsMonitoring(): void {
    try {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('fcp', entry.startTime, {
            entryType: entry.entryType,
            name: entry.name,
          });
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('lcp', entry.startTime, {
            element: (entry as any).element?.tagName,
            url: (entry as any).url,
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime;
          this.recordMetric('fid', fid, {
            eventType: (entry as any).name,
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        if (clsValue > 0) {
          this.recordMetric('cls', clsValue);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('Failed to setup Web Vitals monitoring:', error);
    }
  }

  /**
   * Setup resource monitoring
   */
  private setupResourceMonitoring(): void {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          // Monitor large resources
          if (resource.transferSize > 100000) { // > 100KB
            this.recordMetric('large_resource', resource.duration, {
              name: resource.name,
              size: resource.transferSize,
              type: this.getResourceType(resource.name),
            });
          }

          // Monitor slow resources
          if (resource.duration > 1000) { // > 1s
            this.recordMetric('slow_resource', resource.duration, {
              name: resource.name,
              size: resource.transferSize,
            });
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

    } catch (error) {
      console.warn('Failed to setup resource monitoring:', error);
    }
  }

  /**
   * Setup navigation monitoring
   */
  private setupNavigationMonitoring(): void {
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const nav = entry as PerformanceNavigationTiming;
          
          // Time to First Byte
          const ttfb = nav.responseStart - nav.requestStart;
          this.recordMetric('ttfb', ttfb);

          // DOM Content Loaded
          const dcl = nav.domContentLoadedEventEnd - nav.fetchStart;
          this.recordMetric('dcl', dcl);

          // Load Complete
          const loadComplete = nav.loadEventEnd - nav.fetchStart;
          this.recordMetric('load_complete', loadComplete);
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

    } catch (error) {
      console.warn('Failed to setup navigation monitoring:', error);
    }
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memory_used', memory.usedJSHeapSize, {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Check thresholds and log warnings
    this.checkThresholds(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds[metric.name as keyof PerformanceThresholds];
    
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded for ${metric.name}: ${metric.value}ms (threshold: ${threshold}ms)`);
      
      // In production, you might want to send this to an analytics service
      if (import.meta.env.PROD) {
        this.reportPerformanceIssue(metric);
      }
    }
  }

  /**
   * Report performance issues
   */
  private reportPerformanceIssue(metric: PerformanceMetric): void {
    // This would typically send to an analytics service
    // For now, we'll just log it
    console.warn('Performance issue detected:', {
      metric: metric.name,
      value: metric.value,
      timestamp: metric.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.webp')) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    for (const metricName of Object.keys(this.thresholds)) {
      const metrics = this.metrics.filter(m => m.name === metricName);
      if (metrics.length > 0) {
        const values = metrics.map(m => m.value);
        summary[metricName] = {
          count: values.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1],
        };
      }
    }

    return summary;
  }

  /**
   * Cleanup observers
   */
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
    this.isMonitoring = false;
  }

  /**
   * Mark a custom performance event
   */
  public mark(name: string, metadata?: Record<string, any>): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
      this.recordMetric(`custom_${name}`, performance.now(), metadata);
    }
  }

  /**
   * Measure time between two marks
   */
  public measure(name: string, startMark: string, endMark?: string): number {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        this.recordMetric(`measure_${name}`, measure.duration);
        return measure.duration;
      } catch (error) {
        console.warn('Failed to measure performance:', error);
        return 0;
      }
    }
    return 0;
  }
}

// Export singleton instance
export const performanceService = new EnhancedPerformanceService();
export default performanceService;
