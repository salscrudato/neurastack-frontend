/**
 * Production Monitoring Service
 * 
 * Provides comprehensive monitoring, analytics, and performance tracking
 * for the NeuraStack chat application in production.
 */

// Configuration
const MONITORING_CONFIG = {
  BATCH_SIZE: 10,
  FLUSH_INTERVAL: 30000, // 30 seconds
  MAX_EVENTS: 1000,
  STORAGE_KEY: 'neurastack_monitoring_events',
  PERFORMANCE_SAMPLE_RATE: 0.1, // 10% sampling
  ERROR_SAMPLE_RATE: 1.0, // 100% error tracking
} as const;

// Types
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface UserInteraction {
  action: string;
  component: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface ChatMetrics {
  messagesSent: number;
  messagesReceived: number;
  averageResponseTime: number;
  errorRate: number;
  retryRate: number;
  sessionDuration: number;
}

class ProductionMonitoringService {
  private performanceMetrics: PerformanceMetric[] = [];
  private errorEvents: ErrorEvent[] = [];
  private userInteractions: UserInteraction[] = [];
  private chatMetrics: ChatMetrics = {
    messagesSent: 0,
    messagesReceived: 0,
    averageResponseTime: 0,
    errorRate: 0,
    retryRate: 0,
    sessionDuration: 0,
  };
  private flushInterval: NodeJS.Timeout | null = null;
  private sessionStartTime: number = Date.now();

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    // Start periodic flushing
    this.startPeriodicFlush();

    // Monitor page visibility for session tracking
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Monitor unload for final flush
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // Set up performance observer
    this.setupPerformanceObserver();

    // Set up error tracking
    this.setupErrorTracking();
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        // Monitor navigation timing
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.trackPerformance('page_load_time', navEntry.loadEventEnd - navEntry.loadEventStart);
              this.trackPerformance('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });

        // Monitor resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource' && Math.random() < MONITORING_CONFIG.PERFORMANCE_SAMPLE_RATE) {
              this.trackPerformance('resource_load_time', entry.duration, {
                resource: entry.name,
                size: (entry as any).transferSize,
              });
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Monitor largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformance('largest_contentful_paint', entry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor first input delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformance('first_input_delay', (entry as any).processingStart - entry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to set up performance observer:', error);
        }
      }
    }
  }

  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        component: 'global',
        timestamp: Date.now(),
        severity: 'high',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        component: 'promise',
        timestamp: Date.now(),
        severity: 'high',
        metadata: {
          reason: event.reason,
        },
      });
    });
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(name: string, value: number, metadata?: Record<string, any>): void {
    if (Math.random() > MONITORING_CONFIG.PERFORMANCE_SAMPLE_RATE) {
      return; // Skip based on sample rate
    }

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.performanceMetrics.push(metric);
    this.trimArrays();

    if (import.meta.env.DEV) {
      console.log('📊 Performance:', metric);
    }
  }

  /**
   * Track error events
   */
  public trackError(error: Omit<ErrorEvent, 'timestamp'> & { timestamp?: number }): void {
    if (Math.random() > MONITORING_CONFIG.ERROR_SAMPLE_RATE) {
      return; // Skip based on sample rate
    }

    const errorEvent: ErrorEvent = {
      ...error,
      timestamp: error.timestamp || Date.now(),
    };

    this.errorEvents.push(errorEvent);
    this.trimArrays();

    if (import.meta.env.DEV) {
      console.error('🚨 Error tracked:', errorEvent);
    }
  }

  /**
   * Track user interactions
   */
  public trackUserInteraction(action: string, component: string, metadata?: Record<string, any>): void {
    const interaction: UserInteraction = {
      action,
      component,
      timestamp: Date.now(),
      metadata,
    };

    this.userInteractions.push(interaction);
    this.trimArrays();

    if (import.meta.env.DEV) {
      console.log('👆 Interaction:', interaction);
    }
  }

  /**
   * Track chat-specific metrics
   */
  public trackChatMetric(metric: keyof ChatMetrics, value: number): void {
    if (metric === 'averageResponseTime') {
      // Calculate running average
      const currentAvg = this.chatMetrics.averageResponseTime;
      const count = this.chatMetrics.messagesReceived;
      this.chatMetrics.averageResponseTime = (currentAvg * count + value) / (count + 1);
    } else {
      this.chatMetrics[metric] = value;
    }

    if (import.meta.env.DEV) {
      console.log('💬 Chat metric:', { [metric]: value });
    }
  }

  /**
   * Increment chat counters
   */
  public incrementChatCounter(counter: 'messagesSent' | 'messagesReceived' | 'retryRate'): void {
    this.chatMetrics[counter]++;
  }

  /**
   * Get current chat metrics
   */
  public getChatMetrics(): ChatMetrics {
    return {
      ...this.chatMetrics,
      sessionDuration: Date.now() - this.sessionStartTime,
    };
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    averageResponseTime: number;
    errorRate: number;
    totalEvents: number;
    sessionDuration: number;
  } {
    const totalEvents = this.performanceMetrics.length + this.errorEvents.length + this.userInteractions.length;
    const errorRate = totalEvents > 0 ? this.errorEvents.length / totalEvents : 0;
    
    const responseTimes = this.performanceMetrics
      .filter(m => m.name.includes('response_time'))
      .map(m => m.value);
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    return {
      averageResponseTime,
      errorRate,
      totalEvents,
      sessionDuration: Date.now() - this.sessionStartTime,
    };
  }

  private trimArrays(): void {
    if (this.performanceMetrics.length > MONITORING_CONFIG.MAX_EVENTS) {
      this.performanceMetrics = this.performanceMetrics.slice(-MONITORING_CONFIG.MAX_EVENTS);
    }
    if (this.errorEvents.length > MONITORING_CONFIG.MAX_EVENTS) {
      this.errorEvents = this.errorEvents.slice(-MONITORING_CONFIG.MAX_EVENTS);
    }
    if (this.userInteractions.length > MONITORING_CONFIG.MAX_EVENTS) {
      this.userInteractions = this.userInteractions.slice(-MONITORING_CONFIG.MAX_EVENTS);
    }
  }

  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, MONITORING_CONFIG.FLUSH_INTERVAL);
  }

  private async flushEvents(): Promise<void> {
    if (this.performanceMetrics.length === 0 && 
        this.errorEvents.length === 0 && 
        this.userInteractions.length === 0) {
      return;
    }

    const payload = {
      performance: this.performanceMetrics.splice(0, MONITORING_CONFIG.BATCH_SIZE),
      errors: this.errorEvents.splice(0, MONITORING_CONFIG.BATCH_SIZE),
      interactions: this.userInteractions.splice(0, MONITORING_CONFIG.BATCH_SIZE),
      chatMetrics: this.getChatMetrics(),
      timestamp: Date.now(),
    };

    // In production, this would send to your monitoring service
    if (import.meta.env.PROD) {
      try {
        // Example: await fetch('/api/monitoring', { method: 'POST', body: JSON.stringify(payload) });
        console.log('📈 Would send monitoring data:', payload);
      } catch (error) {
        // Silently fail in production
        if (import.meta.env.DEV) {
          console.warn('Failed to send monitoring data:', error);
        }
      }
    } else if (import.meta.env.DEV) {
      console.log('📈 Monitoring flush:', payload);
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.flushEvents();
    }
  }

  private handleBeforeUnload(): void {
    this.flushEvents();
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Final flush
    this.flushEvents();
  }
}

// Export singleton instance
export const productionMonitoringService = new ProductionMonitoringService();

// Export types for use in other modules
export type { ChatMetrics, ErrorEvent, PerformanceMetric, UserInteraction };

