/**
 * Enhanced Performance Monitoring Service
 * Monitors app performance, user experience metrics, and provides optimization insights
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  context?: Record<string, any>;
}

interface UserExperienceMetric {
  type: 'page_load' | 'interaction' | 'error' | 'conversion';
  event: string;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface PerformanceBudget {
  metric: string;
  threshold: number;
  critical: boolean;
}

export class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private uxMetrics: UserExperienceMetric[] = [];
  private performanceBudgets: PerformanceBudget[] = [
    { metric: 'FCP', threshold: 1500, critical: true }, // First Contentful Paint
    { metric: 'LCP', threshold: 2500, critical: true }, // Largest Contentful Paint
    { metric: 'FID', threshold: 100, critical: true },  // First Input Delay
    { metric: 'CLS', threshold: 0.1, critical: true },  // Cumulative Layout Shift
    { metric: 'TTFB', threshold: 600, critical: false }, // Time to First Byte
    { metric: 'TTI', threshold: 3000, critical: true }   // Time to Interactive
  ];
  
  private observer: PerformanceObserver | null = null;
  private navigationStartTime = performance.now();

  constructor() {
    this.initializePerformanceObserver();
    this.setupWebVitalsTracking();
    this.trackPageLoad();
  }

  /**
   * Initialize Performance Observer for comprehensive metrics
   */
  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      try {
        this.observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'layout-shift', 'first-input'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  /**
   * Setup Web Vitals tracking
   */
  private setupWebVitalsTracking(): void {
    // Track Largest Contentful Paint (LCP)
    this.trackLCP();
    
    // Track First Input Delay (FID)
    this.trackFID();
    
    // Track Cumulative Layout Shift (CLS)
    this.trackCLS();
  }

  /**
   * Track page load performance
   */
  private trackPageLoad(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.navigationStart);
          this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.navigationStart);
          this.recordMetric('time_to_first_byte', navigation.responseStart - navigation.navigationStart);
          this.recordMetric('dom_interactive', navigation.domInteractive - navigation.navigationStart);
        }
      }, 0);
    });
  }

  /**
   * Track Largest Contentful Paint
   */
  private trackLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
        this.checkPerformanceBudget('LCP', lastEntry.startTime);
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP tracking not supported:', error);
      }
    }
  }

  /**
   * Track First Input Delay
   */
  private trackFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime;
          this.recordMetric('FID', fid);
          this.checkPerformanceBudget('FID', fid);
        }
      });

      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID tracking not supported:', error);
      }
    }
  }

  /**
   * Track Cumulative Layout Shift
   */
  private trackCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        this.recordMetric('CLS', clsValue);
        this.checkPerformanceBudget('CLS', clsValue);
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS tracking not supported:', error);
      }
    }
  }

  /**
   * Process performance entries from observer
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        this.recordMetric(entry.name, entry.startTime);
        if (entry.name === 'first-contentful-paint') {
          this.checkPerformanceBudget('FCP', entry.startTime);
        }
        break;
        
      case 'resource':
        const resourceEntry = entry as PerformanceResourceTiming;
        this.trackResourcePerformance(resourceEntry);
        break;
        
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.trackNavigationPerformance(navEntry);
        break;
    }
  }

  /**
   * Track resource loading performance
   */
  private trackResourcePerformance(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;
    const resourceType = this.getResourceType(entry.name);
    
    this.recordMetric(`resource_${resourceType}_duration`, duration, {
      url: entry.name,
      size: entry.transferSize,
      cached: entry.transferSize === 0
    });

    // Track slow resources
    if (duration > 1000) {
      this.recordUXMetric('interaction', 'slow_resource_load', duration, false, {
        url: entry.name,
        type: resourceType
      });
    }
  }

  /**
   * Track navigation performance
   */
  private trackNavigationPerformance(entry: PerformanceNavigationTiming): void {
    const metrics = {
      dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
      tcp_connection: entry.connectEnd - entry.connectStart,
      ssl_negotiation: entry.connectEnd - entry.secureConnectionStart,
      request_response: entry.responseEnd - entry.requestStart,
      dom_processing: entry.domComplete - entry.domLoading,
      page_load: entry.loadEventEnd - entry.navigationStart
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.recordMetric(`navigation_${name}`, value);
      }
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      context
    };
    
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // Send to analytics if critical metric
    if (this.isCriticalMetric(name)) {
      this.sendToAnalytics(metric);
    }
  }

  /**
   * Record a user experience metric
   */
  recordUXMetric(
    type: 'page_load' | 'interaction' | 'error' | 'conversion',
    event: string,
    duration?: number,
    success: boolean = true,
    metadata?: Record<string, any>
  ): void {
    const uxMetric: UserExperienceMetric = {
      type,
      event,
      duration,
      success,
      metadata,
      timestamp: new Date()
    };
    
    this.uxMetrics.push(uxMetric);
    
    // Keep only last 500 UX metrics
    if (this.uxMetrics.length > 500) {
      this.uxMetrics = this.uxMetrics.slice(-500);
    }
  }

  /**
   * Track workout-specific performance metrics
   */
  trackWorkoutPerformance(action: string, startTime: number, metadata?: Record<string, any>): void {
    const duration = performance.now() - startTime;
    
    this.recordMetric(`workout_${action}_duration`, duration, metadata);
    this.recordUXMetric('interaction', `workout_${action}`, duration, true, metadata);
    
    // Track if action is slow
    const slowThresholds: Record<string, number> = {
      'generation': 5000,
      'exercise_load': 1000,
      'session_save': 2000,
      'feedback_submit': 1500
    };
    
    const threshold = slowThresholds[action] || 3000;
    if (duration > threshold) {
      this.recordUXMetric('interaction', `slow_${action}`, duration, false, metadata);
    }
  }

  /**
   * Track user interaction performance
   */
  trackInteraction(element: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.recordMetric(`interaction_${element}`, duration);
    
    // Track slow interactions (>100ms)
    if (duration > 100) {
      this.recordUXMetric('interaction', 'slow_interaction', duration, false, { element });
    }
  }

  /**
   * Check performance against budgets
   */
  private checkPerformanceBudget(metric: string, value: number): void {
    const budget = this.performanceBudgets.find(b => b.metric === metric);
    if (budget && value > budget.threshold) {
      this.recordUXMetric('error', 'performance_budget_exceeded', value, false, {
        metric,
        threshold: budget.threshold,
        critical: budget.critical
      });
      
      if (budget.critical) {
        console.warn(`Critical performance budget exceeded: ${metric} = ${value}ms (threshold: ${budget.threshold}ms)`);
      }
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    coreWebVitals: Record<string, number>;
    averageMetrics: Record<string, number>;
    budgetViolations: number;
    slowInteractions: number;
  } {
    const coreWebVitals: Record<string, number> = {};
    const averageMetrics: Record<string, number> = {};
    
    // Calculate core web vitals
    ['FCP', 'LCP', 'FID', 'CLS'].forEach(vital => {
      const vitalMetrics = this.metrics.filter(m => m.name === vital);
      if (vitalMetrics.length > 0) {
        coreWebVitals[vital] = vitalMetrics[vitalMetrics.length - 1].value;
      }
    });
    
    // Calculate average metrics
    const metricGroups = this.groupMetricsByName();
    Object.entries(metricGroups).forEach(([name, values]) => {
      averageMetrics[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    // Count budget violations
    const budgetViolations = this.uxMetrics.filter(
      m => m.event === 'performance_budget_exceeded'
    ).length;
    
    // Count slow interactions
    const slowInteractions = this.uxMetrics.filter(
      m => m.event === 'slow_interaction'
    ).length;
    
    return {
      coreWebVitals,
      averageMetrics,
      budgetViolations,
      slowInteractions
    };
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  /**
   * Check if metric is critical
   */
  private isCriticalMetric(name: string): boolean {
    const criticalMetrics = ['FCP', 'LCP', 'FID', 'CLS', 'page_load_time'];
    return criticalMetrics.includes(name);
  }

  /**
   * Send metric to analytics
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Integration with analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        custom_parameter_1: metric.context ? JSON.stringify(metric.context) : undefined
      });
    }
  }

  /**
   * Group metrics by name for analysis
   */
  private groupMetricsByName(): Record<string, number[]> {
    const groups: Record<string, number[]> = {};
    
    this.metrics.forEach(metric => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric.value);
    });
    
    return groups;
  }

  /**
   * Clear metrics (for testing or memory management)
   */
  clearMetrics(): void {
    this.metrics = [];
    this.uxMetrics = [];
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();

// Convenience functions for common tracking scenarios
export function trackWorkoutGeneration<T>(operation: () => Promise<T>): Promise<T> {
  const startTime = performance.now();
  
  return operation().then(result => {
    performanceMonitoringService.trackWorkoutPerformance('generation', startTime, {
      success: true
    });
    return result;
  }).catch(error => {
    performanceMonitoringService.trackWorkoutPerformance('generation', startTime, {
      success: false,
      error: error.message
    });
    throw error;
  });
}

export function trackUserInteraction(element: string): () => void {
  const startTime = performance.now();
  
  return () => {
    performanceMonitoringService.trackInteraction(element, startTime);
  };
}
