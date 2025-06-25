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
 * Create a lazy-loaded component with better error handling and preloading
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    preload?: boolean;
    fallback?: React.ComponentType;
    retryCount?: number;
  } = {}
) {
  const { preload = false, retryCount = 3 } = options;

  // Enhanced import function with retry logic
  const enhancedImportFn = async (): Promise<{ default: T }> => {
    let lastError: Error;

    for (let i = 0; i < retryCount; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        if (i < retryCount - 1) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError!;
  };

  const LazyComponent = React.lazy(enhancedImportFn);

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch(() => {
        // Silently fail preload attempts
      });
    }, 100);
  }

  return LazyComponent;
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  return importFn();
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
 * Optimized useCallback with dependency comparison and stability tracking
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: {
    debugName?: string;
    trackStability?: boolean;
  } = {}
): T {
  const { debugName, trackStability = false } = options;

  // Track callback stability in development
  const stabilityRef = React.useRef({ count: 0, lastDeps: deps });

  if (trackStability && import.meta.env.DEV) {
    const depsChanged = !deps.every((dep, i) =>
      Object.is(dep, stabilityRef.current.lastDeps[i])
    );

    if (depsChanged) {
      stabilityRef.current.count++;
      stabilityRef.current.lastDeps = deps;

      if (stabilityRef.current.count > 10) {
        console.warn(
          `useOptimizedCallback${debugName ? ` (${debugName})` : ''} has been recreated ${stabilityRef.current.count} times. Consider optimizing dependencies.`
        );
      }
    }
  }

  return React.useCallback(callback, deps);
}

/**
 * Optimized useMemo with shallow comparison and performance tracking
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    debugName?: string;
    trackPerformance?: boolean;
  } = {}
): T {
  const { debugName, trackPerformance = false } = options;

  return React.useMemo(() => {
    if (trackPerformance && import.meta.env.DEV) {
      const start = performance.now();
      const result = factory();
      const end = performance.now();

      if (end - start > 16) { // More than one frame
        console.warn(
          `useOptimizedMemo${debugName ? ` (${debugName})` : ''} took ${(end - start).toFixed(2)}ms to compute`
        );
      }

      return result;
    }

    return factory();
  }, deps);
}

/**
 * Enhanced intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit & {
    freezeOnceVisible?: boolean;
    rootMargin?: string;
  } = {}
) {
  const { freezeOnceVisible = false, ...observerOptions } = options;
  const [entry, setEntry] = React.useState<IntersectionObserverEntry>();
  const [node, setNode] = React.useState<Element | null>(null);
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  React.useEffect(() => {
    if (!node || frozen) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      {
        rootMargin: '50px', // Start loading 50px before element is visible
        ...observerOptions,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, frozen, observerOptions]);

  return [setNode, entry] as const;
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
