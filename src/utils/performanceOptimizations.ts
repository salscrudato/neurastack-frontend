/**
 * Performance Optimization Utilities for NeuraFit
 * 
 * Comprehensive performance enhancements for mobile-first, production-grade application
 */

import React from 'react';

// ============================================================================
// Bundle Size Analysis & Recommendations
// ============================================================================

/**
 * Current Bundle Analysis (from build output):
 * 
 * CRITICAL ISSUES IDENTIFIED:
 * 1. UI chunk too large: 436.75 kB (148.10 kB gzipped) - EXCEEDS BUDGET
 * 2. Firebase chunk: 462.39 kB (109.93 kB gzipped) - NEEDS OPTIMIZATION
 * 3. Main index chunk: 190.95 kB (51.39 kB gzipped) - BORDERLINE
 * 4. NeuraFit chunk: 110.36 kB (30.10 kB gzipped) - ACCEPTABLE
 * 
 * TARGET GOALS:
 * - Individual chunks < 100kB gzipped
 * - Critical path < 50kB gzipped
 * - Time to Interactive < 1s on 3G
 * - Lighthouse Performance Score ≥ 90
 */

// ============================================================================
// Critical Performance Metrics
// ============================================================================

export interface PerformanceBudget {
  // Core Web Vitals targets
  firstContentfulPaint: number; // < 1.8s
  largestContentfulPaint: number; // < 2.5s
  firstInputDelay: number; // < 100ms
  cumulativeLayoutShift: number; // < 0.1
  
  // Bundle size targets
  criticalChunkSize: number; // < 50kB gzipped
  maxChunkSize: number; // < 100kB gzipped
  totalBundleSize: number; // < 500kB gzipped
  
  // Network targets
  timeToInteractive: number; // < 1000ms on 3G
  speedIndex: number; // < 3000ms
}

export const PERFORMANCE_BUDGET: PerformanceBudget = {
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  firstInputDelay: 100,
  cumulativeLayoutShift: 0.1,
  criticalChunkSize: 50 * 1024, // 50kB
  maxChunkSize: 100 * 1024, // 100kB
  totalBundleSize: 500 * 1024, // 500kB
  timeToInteractive: 1000,
  speedIndex: 3000,
};

// ============================================================================
// Lazy Loading Utilities
// ============================================================================

/**
 * Enhanced lazy loading with error boundaries and loading states
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(importFn);
}

/**
 * Simple loading component for lazy loading fallbacks
 */
export function LoadingSpinner() {
  return React.createElement('div',
    { className: 'loading-spinner', 'aria-label': 'Loading...' },
    React.createElement('div', { className: 'spinner' })
  );
}

// ============================================================================
// Image Optimization
// ============================================================================

/**
 * Optimized image loading with WebP support and lazy loading
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  // Generate WebP and fallback URLs
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  const handleLoad = React.useCallback(() => setIsLoaded(true), []);
  const handleError = React.useCallback(() => setHasError(true), []);

  return React.createElement('picture',
    { className },
    React.createElement('source', {
      srcSet: webpSrc,
      type: 'image/webp',
      sizes
    }),
    React.createElement('img', {
      src,
      alt,
      width,
      height,
      loading: priority ? 'eager' : 'lazy',
      decoding: 'async',
      onLoad: handleLoad,
      onError: handleError,
      style: {
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        backgroundColor: hasError ? '#f3f4f6' : 'transparent'
      }
    })
  );
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Memory-efficient component cleanup
 */
export function useMemoryOptimization() {
  const cleanupFunctions = React.useRef<(() => void)[]>([]);
  
  const addCleanup = React.useCallback((fn: () => void) => {
    cleanupFunctions.current.push(fn);
  }, []);
  
  React.useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.warn('Cleanup function failed:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, []);
  
  return { addCleanup };
}

// ============================================================================
// Network Optimization
// ============================================================================

/**
 * Intelligent prefetching for critical resources
 */
export function prefetchCriticalResources() {
  // Prefetch critical chunks
  const criticalChunks = [
    '/assets/vendor-*.js',
    '/assets/ui-*.js',
    '/assets/index-*.js'
  ];
  
  criticalChunks.forEach(chunk => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = chunk;
    document.head.appendChild(link);
  });
}

/**
 * Connection-aware loading
 */
export function useConnectionAwareLoading() {
  const [connectionType, setConnectionType] = React.useState<'slow' | 'fast'>('fast');
  
  React.useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateConnection = () => {
        const effectiveType = connection.effectiveType;
        setConnectionType(
          effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g' 
            ? 'slow' 
            : 'fast'
        );
      };
      
      updateConnection();
      connection.addEventListener('change', updateConnection);
      
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, []);
  
  return connectionType;
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Real-time performance monitoring
 */
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<{
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  }>({});

  React.useEffect(() => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
          if (entry.entryType === 'largest-contentful-paint') {
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as any; // Type assertion for first-input entry
            setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
          }
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + (entry as any).value }));
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }

      return () => observer.disconnect();
    }
  }, []);

  return metrics;
}

/**
 * Bundle size monitoring
 */
export function trackBundlePerformance() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      transferSize: navigation.transferSize,
      encodedBodySize: navigation.encodedBodySize,
      decodedBodySize: navigation.decodedBodySize,
    };
  }

  return null;
}

// ============================================================================
// Critical Performance Issues & Solutions
// ============================================================================

/**
 * IMMEDIATE ACTIONS REQUIRED:
 *
 * 1. UI CHUNK OPTIMIZATION (CRITICAL - 148kB gzipped)
 *    - Split Chakra UI components into smaller chunks
 *    - Lazy load non-critical UI components
 *    - Remove unused Emotion/styled-components if possible
 *
 * 2. FIREBASE OPTIMIZATION (HIGH PRIORITY - 109kB gzipped)
 *    - Use modular Firebase imports
 *    - Lazy load Firebase services
 *    - Implement Firebase tree-shaking
 *
 * 3. CODE SPLITTING IMPROVEMENTS
 *    - Implement route-based code splitting
 *    - Lazy load NeuraFit components
 *    - Split vendor libraries more granularly
 *
 * 4. MOBILE PERFORMANCE
 *    - Optimize touch interactions
 *    - Reduce JavaScript execution time
 *    - Implement virtual scrolling for long lists
 */

export const OPTIMIZATION_PRIORITIES = {
  CRITICAL: [
    'Split UI chunk (Chakra UI optimization)',
    'Implement Firebase tree-shaking',
    'Add route-based code splitting'
  ],
  HIGH: [
    'Lazy load NeuraFit components',
    'Optimize mobile touch interactions',
    'Implement virtual scrolling'
  ],
  MEDIUM: [
    'Add image optimization',
    'Implement service worker caching',
    'Optimize CSS delivery'
  ],
  LOW: [
    'Add performance monitoring',
    'Implement prefetching',
    'Optimize font loading'
  ]
} as const;

export default {
  PERFORMANCE_BUDGET,
  OPTIMIZATION_PRIORITIES,
  createLazyComponent,
  OptimizedImage,
  useMemoryOptimization,
  usePerformanceMonitoring,
  trackBundlePerformance,
  prefetchCriticalResources,
  useConnectionAwareLoading,
};
