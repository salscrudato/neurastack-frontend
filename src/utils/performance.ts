/**
 * Performance Optimization Utilities
 * 
 * Collection of utilities for improving app performance including
 * lazy loading, image optimization, and memory management.
 */

// ============================================================================
// Debounce and Throttle Utilities
// ============================================================================

/**
 * Debounce function with improved performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function with requestAnimationFrame optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      requestAnimationFrame(() => {
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      });
    }
  };
}

// ============================================================================
// Intersection Observer Utilities
// ============================================================================

/**
 * Create optimized intersection observer for lazy loading
 */
export function createLazyObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Lazy load images with modern performance optimizations
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Set placeholder if provided
    if (placeholder) {
      img.src = placeholder;
    }
    
    // Create new image for preloading
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        img.src = src;
        img.classList.add('loaded');
        resolve();
      });
    };
    
    imageLoader.onerror = reject;
    imageLoader.src = src;
  });
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Clean up event listeners and observers
 */
export class PerformanceCleanup {
  private cleanupFunctions: (() => void)[] = [];
  
  add(cleanup: () => void): void {
    this.cleanupFunctions.push(cleanup);
  }
  
  addEventListener(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options);
    this.add(() => element.removeEventListener(event, handler));
  }
  
  addObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver): void {
    this.add(() => observer.disconnect());
  }
  
  addTimeout(timeoutId: NodeJS.Timeout): void {
    this.add(() => clearTimeout(timeoutId));
  }
  
  addInterval(intervalId: NodeJS.Timeout): void {
    this.add(() => clearInterval(intervalId));
  }
  
  addAnimationFrame(rafId: number): void {
    this.add(() => cancelAnimationFrame(rafId));
  }
  
  cleanup(): void {
    this.cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    });
    this.cleanupFunctions = [];
  }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Simple performance monitor for development
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  clear(): void {
    this.marks.clear();
  }
}

// ============================================================================
// Viewport and Device Utilities
// ============================================================================

/**
 * Get viewport dimensions with caching
 */
let cachedViewport: { width: number; height: number } | null = null;
let viewportCacheTime = 0;
const VIEWPORT_CACHE_DURATION = 100; // ms

export function getViewportDimensions(): { width: number; height: number } {
  const now = Date.now();
  
  if (cachedViewport && (now - viewportCacheTime) < VIEWPORT_CACHE_DURATION) {
    return cachedViewport;
  }
  
  cachedViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  viewportCacheTime = now;
  
  return cachedViewport;
}

/**
 * Check if device supports modern features
 */
export function getDeviceCapabilities() {
  return {
    supportsWebP: (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })(),
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsResizeObserver: 'ResizeObserver' in window,
    supportsPassiveEvents: (() => {
      let supportsPassive = false;
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get() {
            supportsPassive = true;
            return false;
          }
        });
        window.addEventListener('testPassive', () => {}, opts);
        window.removeEventListener('testPassive', () => {}, opts);
      } catch (e) {}
      return supportsPassive;
    })(),
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}

// ============================================================================
// Bundle Size Optimization
// ============================================================================

/**
 * Dynamic import with error handling
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    console.error('Dynamic import failed:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
}

// ============================================================================
// Export Performance Monitor Instance
// ============================================================================

export const performanceMonitor = new PerformanceMonitor();
