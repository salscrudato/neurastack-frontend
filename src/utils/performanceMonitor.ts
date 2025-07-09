/**
 * Advanced Performance Monitoring System
 * 
 * Comprehensive performance monitoring for React/Vite applications
 * with mobile-first optimizations and Core Web Vitals tracking.
 */

// Performance metrics interface
interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  tti?: number; // Time to Interactive
  tbt?: number; // Total Blocking Time
  si?: number; // Speed Index
  
  // React-specific metrics
  renderTime?: number;
  componentCount?: number;
  reRenderCount?: number;
  
  // Mobile-specific metrics
  touchResponseTime?: number;
  scrollPerformance?: number;
  keyboardLatency?: number;
  
  // Network metrics
  networkLatency?: number;
  bundleSize?: number;
  cacheHitRate?: number;
}

// Performance observer for Core Web Vitals
class CoreWebVitalsMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('fid', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.reportMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // Navigation timing for TTFB and FCP
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.ttfb = entry.responseStart - entry.requestStart;
            this.reportMetric('ttfb', this.metrics.ttfb);
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }

      // Paint timing for FCP
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.reportMetric('fcp', entry.startTime);
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (e) {
        console.warn('Paint observer not supported');
      }
    }
  }

  private reportMetric(name: string, value: number) {
    // Report to analytics in production
    if (import.meta.env.PROD) {
      // Send to your analytics service
      console.log(`Performance metric: ${name} = ${value}`);
    } else {
      console.log(`🚀 Performance: ${name} = ${Math.round(value)}ms`);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React performance monitoring
class ReactPerformanceMonitor {
  private renderStartTime: number = 0;
  private componentRenderTimes: Map<string, number[]> = new Map();
  private reRenderCount: number = 0;

  public startRender(componentName?: string) {
    this.renderStartTime = performance.now();
    if (componentName) {
      console.log(`🔄 Rendering: ${componentName}`);
    }
  }

  public endRender(componentName?: string) {
    const renderTime = performance.now() - this.renderStartTime;
    
    if (componentName) {
      const times = this.componentRenderTimes.get(componentName) || [];
      times.push(renderTime);
      this.componentRenderTimes.set(componentName, times);
      
      // Log slow renders
      if (renderTime > 16) { // 60fps threshold
        console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    }

    return renderTime;
  }

  public trackReRender(componentName: string) {
    this.reRenderCount++;
    console.log(`🔄 Re-render: ${componentName} (total: ${this.reRenderCount})`);
  }

  public getComponentStats(componentName: string) {
    const renderTimes = this.componentRenderTimes.get(componentName) || [];
    if (renderTimes.length === 0) return null;

    const avg = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const max = Math.max(...renderTimes);
    const min = Math.min(...renderTimes);

    return { avg, max, min, count: renderTimes.length };
  }

  public getAllStats() {
    const stats: Record<string, any> = {};
    this.componentRenderTimes.forEach((_, componentName) => {
      stats[componentName] = this.getComponentStats(componentName);
    });
    return stats;
  }
}

// Mobile performance monitoring
class MobilePerformanceMonitor {
  private touchStartTime: number = 0;
  private scrollStartTime: number = 0;

  constructor() {
    this.initializeMobileListeners();
  }

  private initializeMobileListeners() {
    // Touch response time monitoring
    document.addEventListener('touchstart', () => {
      this.touchStartTime = performance.now();
    }, { passive: true });

    document.addEventListener('touchend', () => {
      const touchTime = performance.now() - this.touchStartTime;
      if (touchTime > 100) { // 100ms threshold for touch response
        console.warn(`⚠️ Slow touch response: ${touchTime.toFixed(2)}ms`);
      }
    }, { passive: true });

    // Scroll performance monitoring
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      if (!this.scrollStartTime) {
        this.scrollStartTime = performance.now();
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTime = performance.now() - this.scrollStartTime;
        this.scrollStartTime = 0;
        
        if (scrollTime > 16) { // 60fps threshold
          console.warn(`⚠️ Janky scroll: ${scrollTime.toFixed(2)}ms`);
        }
      }, 100);
    }, { passive: true });

    // Memory monitoring
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
        
        if (usedMB > 50) { // 50MB threshold
          console.warn(`⚠️ High memory usage: ${usedMB}MB / ${totalMB}MB`);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  public measureKeyboardLatency() {
    let keydownTime = 0;
    
    const keydownHandler = () => {
      keydownTime = performance.now();
    };
    
    const inputHandler = () => {
      const latency = performance.now() - keydownTime;
      if (latency > 50) { // 50ms threshold
        console.warn(`⚠️ High keyboard latency: ${latency.toFixed(2)}ms`);
      }
    };

    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('input', inputHandler);

    return () => {
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('input', inputHandler);
    };
  }
}

// Main performance monitor class
export class PerformanceMonitor {
  private coreWebVitals?: CoreWebVitalsMonitor;
  private reactMonitor?: ReactPerformanceMonitor;
  private isEnabled: boolean;

  constructor(enabled: boolean = import.meta.env.DEV) {
    this.isEnabled = enabled;

    if (this.isEnabled) {
      this.coreWebVitals = new CoreWebVitalsMonitor();
      this.reactMonitor = new ReactPerformanceMonitor();
      new MobilePerformanceMonitor(); // Initialize but don't store reference

      console.log('🚀 Performance monitoring initialized');
    }
  }

  // React monitoring methods
  public startRender = (componentName?: string) => {
    if (this.isEnabled && this.reactMonitor) {
      this.reactMonitor.startRender(componentName);
    }
  };

  public endRender = (componentName?: string) => {
    if (this.isEnabled && this.reactMonitor) {
      return this.reactMonitor.endRender(componentName);
    }
    return 0;
  };

  public trackReRender = (componentName: string) => {
    if (this.isEnabled && this.reactMonitor) {
      this.reactMonitor.trackReRender(componentName);
    }
  };

  // Get comprehensive performance report
  public getReport(): PerformanceMetrics & { react: any } {
    if (!this.isEnabled) return { react: {} };

    return {
      ...(this.coreWebVitals?.getMetrics() || {}),
      react: this.reactMonitor?.getAllStats() || {},
    };
  }

  public cleanup() {
    if (this.isEnabled && this.coreWebVitals) {
      this.coreWebVitals.cleanup();
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// Enhanced Mobile Performance Optimizations
// ============================================================================

export class MobilePerformanceOptimizer {
  private static instance: MobilePerformanceOptimizer;
  private isInitialized = false;

  static getInstance(): MobilePerformanceOptimizer {
    if (!MobilePerformanceOptimizer.instance) {
      MobilePerformanceOptimizer.instance = new MobilePerformanceOptimizer();
    }
    return MobilePerformanceOptimizer.instance;
  }

  public initialize() {
    if (this.isInitialized) return;

    // Optimize viewport for mobile
    this.optimizeViewport();

    // Optimize touch interactions
    this.optimizeTouchInteractions();

    // Optimize scrolling performance
    this.optimizeScrolling();

    // Optimize font loading
    this.optimizeFontLoading();

    // Optimize image loading
    this.optimizeImageLoading();

    this.isInitialized = true;
    console.log('🚀 Mobile performance optimizations initialized');
  }

  private optimizeViewport() {
    // Prevent zoom on input focus (iOS)
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }

    // Add safe area CSS variables
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
  }

  private optimizeTouchInteractions() {
    // Optimize touch delay
    document.addEventListener('touchstart', () => {}, { passive: true });

    // Prevent 300ms click delay
    const style = document.createElement('style');
    style.textContent = `
      * {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }

      input, textarea, select {
        touch-action: manipulation;
      }
    `;
    document.head.appendChild(style);
  }

  private optimizeScrolling() {
    // Enable momentum scrolling on iOS
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }

      body {
        overscroll-behavior-y: none;
      }
    `;
    document.head.appendChild(style);
  }

  private optimizeFontLoading() {
    // Preload critical fonts
    const fontPreloads = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    ];

    fontPreloads.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  }

  private optimizeImageLoading() {
    // Add intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  public optimizeComponent(element: HTMLElement) {
    // Apply performance optimizations to specific components
    element.style.contain = 'layout style paint';
    element.style.willChange = 'auto';

    // Optimize for GPU acceleration if needed
    if (element.classList.contains('gpu-accelerated')) {
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
    }
  }

  public measureTimeToInteractive(): Promise<number> {
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          resolve(performance.now());
        });
      } else {
        setTimeout(() => {
          resolve(performance.now());
        }, 0);
      }
    });
  }
}

// Initialize mobile optimizations
export const mobileOptimizer = MobilePerformanceOptimizer.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();
  
  // Track component mount
  React.useEffect(() => {
    const mountTime = performance.now() - startTime;
    if (mountTime > 16) {
      console.warn(`⚠️ Slow mount: ${componentName} took ${mountTime.toFixed(2)}ms`);
    }
    
    return () => {
      // Track component unmount
      const unmountTime = performance.now();
      console.log(`🔄 Unmount: ${componentName} at ${unmountTime.toFixed(2)}ms`);
    };
  }, [componentName, startTime]);

  return {
    startRender: () => performanceMonitor.startRender(componentName),
    endRender: () => performanceMonitor.endRender(componentName),
    trackReRender: () => performanceMonitor.trackReRender(componentName),
  };
}

// Performance-aware React component wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    const { startRender, endRender } = usePerformanceMonitor(name);

    React.useLayoutEffect(() => {
      startRender();
      const cleanup = () => endRender();

      // Use requestAnimationFrame to measure after render
      const rafId = requestAnimationFrame(cleanup);
      return () => cancelAnimationFrame(rafId);
    });

    return React.createElement(Component, { ...props as any, ref } as any);
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Export React import for the hook
import React from 'react';
