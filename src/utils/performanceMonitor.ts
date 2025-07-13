/**
 * Simple Performance Monitoring for MVP
 * Basic performance tracking without complex observers
 */

interface PerformanceMetrics {
  loadTime?: number;
  renderTime?: number;
}

class SimplePerformanceMonitor {
  private metrics: PerformanceMetrics = {};

  constructor() {
    this.trackBasicMetrics();
  }

  private trackBasicMetrics() {
    // Simple load time tracking
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        this.metrics.loadTime = loadTime;
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
      });
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Add missing methods for compatibility
  startRender(_componentName?: string) {
    // Do nothing for MVP
  }

  endRender(_componentName?: string) {
    // Do nothing for MVP
    return 0;
  }
}

// Simple singleton
export const performanceMonitor = new SimplePerformanceMonitor();

// Simple exports for compatibility
export function usePerformanceMonitor(_componentName: string) {
  return {
    startRender: () => {},
    endRender: () => {},
    trackReRender: () => {},
  };
}

export class PerformanceMonitor {
  getReport() {
    return performanceMonitor.getMetrics();
  }

  cleanup() {
    // No cleanup needed for simple monitor
  }
}
