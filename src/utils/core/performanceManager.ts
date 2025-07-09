/**
 * Unified Performance Manager
 * 
 * Consolidates all performance optimization utilities into a single,
 * comprehensive system. Replaces scattered performance code.
 */

import { APP_CONFIG } from '../../config/app';

// ============================================================================
// Types
// ============================================================================

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fps: number;
  memoryUsage: number;
  networkLatency: number;
}

interface OptimizationConfig {
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
  enableResourcePreloading: boolean;
  enableLazyLoading: boolean;
  enableMemoryManagement: boolean;
  enableNetworkOptimization: boolean;
  enableMetricsCollection: boolean;
}

// ============================================================================
// Performance Manager Class
// ============================================================================

class PerformanceManager {
  private metrics: Partial<PerformanceMetrics> = {};
  private config: OptimizationConfig;
  private observers: Map<string, any> = new Map();
  private cleanupFunctions: (() => void)[] = [];

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableImageOptimization: true,
      enableFontOptimization: true,
      enableResourcePreloading: true,
      enableLazyLoading: true,
      enableMemoryManagement: true,
      enableNetworkOptimization: true,
      enableMetricsCollection: APP_CONFIG.ENV.FEATURES.ENABLE_PERFORMANCE_MONITORING,
      ...config,
    };

    this.initialize();
  }

  // ========================================================================
  // Initialization
  // ========================================================================

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // Initialize optimizations
    this.setupImageOptimization();
    this.setupFontOptimization();
    this.setupResourcePreloading();
    this.setupLazyLoading();
    this.setupMemoryManagement();
    this.setupNetworkOptimization();

    // Start metrics collection
    if (this.config.enableMetricsCollection) {
      this.startMetricsCollection();
    }
  }

  // ========================================================================
  // Image Optimization
  // ========================================================================

  private setupImageOptimization(): void {
    if (!this.config.enableImageOptimization) return;

    const optimizeImages = () => {
      const images = document.querySelectorAll('img:not([data-optimized])');
      images.forEach((img) => {
        const image = img as HTMLImageElement;
        
        // Add loading and decoding attributes
        if (!image.loading) image.loading = 'lazy';
        if (!image.decoding) image.decoding = 'async';
        
        // Add responsive sizes if srcset exists
        if (image.srcset && !image.sizes) {
          image.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
        }
        
        // Mark as optimized
        image.setAttribute('data-optimized', 'true');
      });
    };

    // Initial optimization
    optimizeImages();

    // Observe for new images
    const observer = new MutationObserver(() => optimizeImages());
    observer.observe(document.body, { childList: true, subtree: true });
    
    this.observers.set('imageOptimization', observer);
    this.cleanupFunctions.push(() => observer.disconnect());
  }

  // ========================================================================
  // Font Optimization
  // ========================================================================

  private setupFontOptimization(): void {
    if (!this.config.enableFontOptimization) return;

    // Preload critical fonts
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    ];

    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'style';
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });

    // Font display optimization
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================================================
  // Resource Preloading
  // ========================================================================

  private setupResourcePreloading(): void {
    if (!this.config.enableResourcePreloading) return;

    // Only preload resources that will be used immediately
    const criticalResources = [
      { href: '/logo.svg', as: 'image' },
      // PWA icons are only preloaded when PWA install prompt is likely
    ];

    criticalResources.forEach(({ href, as }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;

      // Add onload handler to track usage
      link.onload = () => {
        console.debug(`Preloaded resource used: ${href}`);
      };

      document.head.appendChild(link);
    });

    // Conditionally preload PWA icon only when install prompt is detected
    this.setupConditionalPWAPreloading();
  }

  private setupConditionalPWAPreloading(): void {
    // Only preload PWA icons when beforeinstallprompt event is fired
    window.addEventListener('beforeinstallprompt', () => {
      const pwaIcon = document.createElement('link');
      pwaIcon.rel = 'preload';
      pwaIcon.href = '/icons/neurastack-192.png';
      pwaIcon.as = 'image';
      document.head.appendChild(pwaIcon);
      console.debug('PWA install prompt detected, preloading PWA icon');
    });
  }

  // ========================================================================
  // Lazy Loading
  // ========================================================================

  private setupLazyLoading(): void {
    if (!this.config.enableLazyLoading || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            
            // Handle lazy images
            if (element.tagName === 'IMG') {
              const img = element as HTMLImageElement;
              const dataSrc = img.getAttribute('data-src');
              if (dataSrc) {
                img.src = dataSrc;
                img.removeAttribute('data-src');
              }
            }
            
            // Handle lazy components
            const lazyComponent = element.getAttribute('data-lazy-component');
            if (lazyComponent) {
              element.removeAttribute('data-lazy-component');
              // Trigger component loading
              element.dispatchEvent(new CustomEvent('lazyload'));
            }
            
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    // Observe existing lazy elements
    document.querySelectorAll('[data-src], [data-lazy-component]').forEach((el) => {
      observer.observe(el);
    });

    this.observers.set('lazyLoading', observer);
    this.cleanupFunctions.push(() => observer.disconnect());
  }

  // ========================================================================
  // Memory Management
  // ========================================================================

  private setupMemoryManagement(): void {
    if (!this.config.enableMemoryManagement) return;

    const cleanupMemory = () => {
      // Remove unused event listeners
      this.cleanupUnusedEventListeners();
      
      // Clear unused caches
      this.clearUnusedCaches();
      
      // Garbage collection hint (if available)
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
    };

    // Cleanup on page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupMemory();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.cleanupFunctions.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

    // Periodic cleanup
    const cleanupInterval = setInterval(cleanupMemory, APP_CONFIG.PERFORMANCE.MEMORY_CLEANUP_INTERVAL);
    this.cleanupFunctions.push(() => clearInterval(cleanupInterval));
  }

  // ========================================================================
  // Network Optimization
  // ========================================================================

  private setupNetworkOptimization(): void {
    if (!this.config.enableNetworkOptimization) return;

    // Connection-aware optimizations
    const connection = (navigator as any).connection;
    if (connection) {
      const updateNetworkOptimizations = () => {
        const connectionType = connection.effectiveType;
        document.documentElement.setAttribute('data-connection', connectionType);
        
        // Adjust optimizations based on connection
        if (connectionType === 'slow-2g' || connectionType === '2g') {
          document.documentElement.classList.add('low-bandwidth');
          this.enableDataSaverMode();
        } else {
          document.documentElement.classList.remove('low-bandwidth');
          this.disableDataSaverMode();
        }
      };

      connection.addEventListener('change', updateNetworkOptimizations);
      updateNetworkOptimizations();

      this.cleanupFunctions.push(() => {
        connection.removeEventListener('change', updateNetworkOptimizations);
      });
    }
  }

  // ========================================================================
  // Metrics Collection
  // ========================================================================

  private startMetricsCollection(): void {
    if (!this.config.enableMetricsCollection) return;

    // Web Vitals
    this.collectWebVitals();
    
    // FPS monitoring
    this.startFPSMonitoring();
    
    // Memory monitoring
    this.startMemoryMonitoring();
  }

  private collectWebVitals(): void {
    // FCP (First Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.metrics.fcp = fcp.startTime;
      }
    }).observe({ entryTypes: ['paint'] });

    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private startFPSMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        this.metrics.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  private startMemoryMonitoring(): void {
    const updateMemoryUsage = () => {
      const memory = (performance as any).memory;
      if (memory) {
        this.metrics.memoryUsage = memory.usedJSHeapSize;
      }
    };

    updateMemoryUsage();
    setInterval(updateMemoryUsage, 5000); // Update every 5 seconds
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  private cleanupUnusedEventListeners(): void {
    // Implementation would depend on specific event listener tracking
    // This is a placeholder for cleanup logic
  }

  private clearUnusedCaches(): void {
    // Clear unused caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('old-') || cacheName.includes('temp-')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  }

  private enableDataSaverMode(): void {
    document.documentElement.style.setProperty('--image-quality', '0.6');
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
  }

  private disableDataSaverMode(): void {
    document.documentElement.style.removeProperty('--image-quality');
    document.documentElement.style.removeProperty('--animation-duration');
  }

  // ========================================================================
  // Public API
  // ========================================================================

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public cleanup(): void {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Run all cleanup functions
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const performanceManager = new PerformanceManager();

// ============================================================================
// React Hook
// ============================================================================

export const usePerformanceManager = () => {
  return {
    getMetrics: () => performanceManager.getMetrics(),
    updateConfig: (config: Partial<OptimizationConfig>) => performanceManager.updateConfig(config),
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

export const initializePerformanceOptimizations = (config?: Partial<OptimizationConfig>) => {
  if (config) {
    performanceManager.updateConfig(config);
  }
  return () => performanceManager.cleanup();
};

export default performanceManager;
