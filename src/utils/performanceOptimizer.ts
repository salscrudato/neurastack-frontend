/**
 * Enhanced Performance Optimization Utilities
 *
 * Collection of utilities to optimize app performance, reduce bundle size,
 * and improve user experience across the NeuraStack application.
 */

import React from 'react';

// ============================================================================
// Lazy Loading Utilities
// ============================================================================

/**
 * Create a lazy-loaded component with better error handling
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(importFn);
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Debounce function for performance optimization
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
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Mobile-optimized throttle with adaptive timing and device capabilities
 */
export function mobileThrottle<T extends (...args: any[]) => any>(
  func: T,
  mobileLimit: number = 100,
  desktopLimit: number = 50
): (...args: Parameters<T>) => void {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  const limit = isMobile ? (isLowEndDevice ? mobileLimit * 1.5 : mobileLimit) : desktopLimit;

  return throttle(func, limit);
}

/**
 * Enhanced mobile performance utilities
 */
export const mobilePerformance = {
  // Detect device capabilities
  getDeviceCapabilities: () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const hasTouch = 'ontouchstart' in window;
    const devicePixelRatio = window.devicePixelRatio || 1;

    return {
      isMobile,
      isLowEndDevice,
      hasTouch,
      devicePixelRatio,
      memoryInfo: (performance as any).memory || null,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown'
    };
  },

  // Optimize animations for mobile
  optimizeAnimations: () => {
    const capabilities = mobilePerformance.getDeviceCapabilities();

    if (capabilities.isLowEndDevice) {
      // Reduce animation complexity on low-end devices
      document.documentElement.style.setProperty('--animation-duration', '0.15s');
      document.documentElement.style.setProperty('--animation-easing', 'ease-out');
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.25s');
      document.documentElement.style.setProperty('--animation-easing', 'cubic-bezier(0.4, 0, 0.2, 1)');
    }
  },

  // Optimize images for mobile
  optimizeImages: () => {
    const capabilities = mobilePerformance.getDeviceCapabilities();

    // Set appropriate image quality based on device capabilities
    const quality = capabilities.isLowEndDevice ? 0.7 : 0.85;
    document.documentElement.style.setProperty('--image-quality', quality.toString());

    // Enable lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const image = entry.target as HTMLImageElement;
              image.classList.add('loaded');
              observer.unobserve(image);
            }
          });
        });
        observer.observe(img);
      }
    });
  }
};

// ============================================================================
// Component Optimization
// ============================================================================

/**
 * Memoization helper for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Create optimized event handlers
 */
export function createOptimizedHandler<T extends Event>(
  handler: (event: T) => void,
  options: {
    debounce?: number;
    throttle?: number;
    preventDefault?: boolean;
    stopPropagation?: boolean;
  } = {}
) {
  let optimizedHandler = handler;
  
  if (options.debounce) {
    optimizedHandler = debounce(handler, options.debounce);
  } else if (options.throttle) {
    optimizedHandler = throttle(handler, options.throttle);
  }
  
  return (event: T) => {
    if (options.preventDefault) event.preventDefault();
    if (options.stopPropagation) event.stopPropagation();
    optimizedHandler(event);
  };
}

// ============================================================================
// Bundle Size Optimization
// ============================================================================

/**
 * Dynamic import with error handling
 */
export async function safeDynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Dynamic import failed:', error);
    }
    if (fallback) return fallback;
    throw error;
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string = 'script') {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Simple performance marker
 */
export function markPerformance(name: string) {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure performance between two marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure.duration;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Performance measurement failed:', error);
      }
      return 0;
    }
  }
  return 0;
}

// ============================================================================
// Image Optimization
// ============================================================================

/**
 * Create optimized image loader
 */
export function createImageLoader(src: string, _options: {
  placeholder?: string;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
} = {}) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;

    // Add loading optimization
    img.loading = 'lazy';
    img.decoding = 'async';

    img.src = src;
  });
}

// ============================================================================
// React Optimization Hooks
// ============================================================================


/**
 * Optimized useCallback with dependency comparison
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const memoizedCallback = React.useCallback(callback, deps);
  return memoizedCallback;
}

/**
 * Optimized useMemo with shallow comparison
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return React.useMemo(factory, deps);
}

/**
 * Use intersection observer for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [elementRef, options]);
  
  return isIntersecting;
}

// ============================================================================
// Export All Utilities
// ============================================================================

export const PerformanceOptimizer = {
  createLazyComponent,
  debounce,
  throttle,
  memoize,
  createOptimizedHandler,
  safeDynamicImport,
  preloadResource,
  markPerformance,
  measurePerformance,
  createImageLoader,
  useOptimizedCallback,
  useOptimizedMemo,
  useIntersectionObserver,
};
