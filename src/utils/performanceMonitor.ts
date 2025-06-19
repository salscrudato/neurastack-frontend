/**
 * Performance Monitoring Utilities
 *
 * Comprehensive performance monitoring including Core Web Vitals,
 * custom metrics, resource timing, and performance budgets.
 */

import React from 'react';

// Types for performance metrics
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface WebVitalsMetrics {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

interface CustomMetrics {
  [key: string]: number;
}

interface PerformanceBudget {
  LCP: number;
  FID: number;
  CLS: number;
  FCP: number;
  TTFB: number;
  bundleSize: number;
  imageSize: number;
}

// Default performance budgets (Core Web Vitals thresholds)
const DEFAULT_BUDGETS: PerformanceBudget = {
  LCP: 2500,  // 2.5 seconds
  FID: 100,   // 100 milliseconds
  CLS: 0.1,   // 0.1 layout shift score
  FCP: 1800,  // 1.8 seconds
  TTFB: 800,  // 800 milliseconds
  bundleSize: 250000, // 250KB
  imageSize: 500000,  // 500KB
};

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalsMetrics = {};
  private customMetrics: CustomMetrics = {};
  private budgets: PerformanceBudget;
  private observers: PerformanceObserver[] = [];

  constructor(budgets: Partial<PerformanceBudget> = {}) {
    this.budgets = { ...DEFAULT_BUDGETS, ...budgets };
    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          this.recordWebVital('LCP', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordWebVital('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordWebVital('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Navigation timing
      this.measureNavigationTiming();

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  /**
   * Measure navigation timing metrics
   */
  private measureNavigationTiming(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          // Time to First Byte
          const ttfb = navigation.responseStart - navigation.requestStart;
          this.recordWebVital('TTFB', ttfb);

          // First Contentful Paint
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.recordWebVital('FCP', fcpEntry.startTime);
          }
        }
      }, 0);
    });
  }

  /**
   * Record a Web Vital metric
   */
  private recordWebVital(name: keyof WebVitalsMetrics, value: number): void {
    this.webVitals[name] = value;
    
    const rating = this.getRating(name, value);
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      rating,
    };

    this.metrics.push(metric);
    this.reportMetric(metric);
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(metric: keyof WebVitalsMetrics, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Start timing a custom metric
   */
  public startTiming(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * End timing a custom metric
   */
  public endTiming(name: string): number {
    if (typeof performance === 'undefined') return 0;

    const endMark = `${name}-end`;
    const measureName = `${name}-duration`;
    
    performance.mark(endMark);
    performance.measure(measureName, `${name}-start`, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    const duration = measure ? measure.duration : 0;
    
    this.customMetrics[name] = duration;
    
    const metric: PerformanceMetric = {
      name,
      value: duration,
      timestamp: Date.now(),
      rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
    };
    
    this.metrics.push(metric);
    this.reportMetric(metric);
    
    return duration;
  }

  /**
   * Record a custom metric value
   */
  public recordMetric(name: string, value: number): void {
    this.customMetrics[name] = value;
    
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      rating: 'good', // Default rating for custom metrics
    };
    
    this.metrics.push(metric);
    this.reportMetric(metric);
  }

  /**
   * Check if performance budgets are met
   */
  public checkBudgets(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    
    // Check Web Vitals against budgets
    Object.entries(this.webVitals).forEach(([metric, value]) => {
      const budget = this.budgets[metric as keyof PerformanceBudget];
      if (budget && value > budget) {
        violations.push(`${metric}: ${value.toFixed(2)} exceeds budget of ${budget}`);
      }
    });

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Get performance summary
   */
  public getSummary(): {
    webVitals: WebVitalsMetrics;
    customMetrics: CustomMetrics;
    budgetStatus: { passed: boolean; violations: string[] };
    recentMetrics: PerformanceMetric[];
  } {
    return {
      webVitals: { ...this.webVitals },
      customMetrics: { ...this.customMetrics },
      budgetStatus: this.checkBudgets(),
      recentMetrics: this.metrics.slice(-10), // Last 10 metrics
    };
  }

  /**
   * Report metric to analytics or monitoring service
   */
  private reportMetric(metric: PerformanceMetric): void {
    // In a real application, you would send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metric:', metric);
    }

    // Example: Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
      });
    }

    // Example: Send to custom analytics endpoint
    if (metric.rating === 'poor') {
      this.reportPoorPerformance(metric);
    }
  }

  /**
   * Report poor performance for alerting
   */
  private reportPoorPerformance(metric: PerformanceMetric): void {
    // In a real application, you might send alerts for poor performance
    console.warn('⚠️ Poor Performance Detected:', metric);
    
    // Example: Send to monitoring service
    // fetch('/api/performance-alert', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric),
    // });
  }

  /**
   * Measure resource loading performance
   */
  public measureResourceTiming(): void {
    if (typeof performance === 'undefined') return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources.forEach(resource => {
      const duration = resource.responseEnd - resource.startTime;
      const size = resource.transferSize || 0;
      
      // Check against budgets
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        if (size > this.budgets.bundleSize) {
          console.warn(`Large bundle detected: ${resource.name} (${size} bytes)`);
        }
      }
      
      if (resource.name.includes('.jpg') || resource.name.includes('.png') || resource.name.includes('.webp')) {
        if (size > this.budgets.imageSize) {
          console.warn(`Large image detected: ${resource.name} (${size} bytes)`);
        }
      }
    });
  }

  /**
   * Clean up observers
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

/**
 * Get or create performance monitor instance
 */
export function getPerformanceMonitor(budgets?: Partial<PerformanceBudget>): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor(budgets);
  }
  return performanceMonitor;
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const monitor = getPerformanceMonitor();
  
  React.useEffect(() => {
    return () => {
      // Cleanup on unmount
      monitor.destroy();
    };
  }, [monitor]);

  return {
    startTiming: monitor.startTiming.bind(monitor),
    endTiming: monitor.endTiming.bind(monitor),
    recordMetric: monitor.recordMetric.bind(monitor),
    getSummary: monitor.getSummary.bind(monitor),
    checkBudgets: monitor.checkBudgets.bind(monitor),
  };
}

// Export types
export { DEFAULT_BUDGETS, PerformanceMonitor };
export type { CustomMetrics, PerformanceBudget, PerformanceMetric, WebVitalsMetrics };

