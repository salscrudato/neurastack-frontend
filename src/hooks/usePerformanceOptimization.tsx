import { useCallback, useEffect } from 'react';

// Performance metrics interface for future use
// interface PerformanceMetrics {
//   fcp: number; // First Contentful Paint
//   lcp: number; // Largest Contentful Paint
//   fid: number; // First Input Delay
//   cls: number; // Cumulative Layout Shift
//   ttfb: number; // Time to First Byte
// }

interface PerformanceConfig {
  enableMetrics: boolean;
  enableResourceHints: boolean;
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
}

export const usePerformanceOptimization = (config: PerformanceConfig = {
  enableMetrics: true,
  enableResourceHints: true,
  enableImageOptimization: true,
  enableFontOptimization: true
}) => {
  
  // Performance metrics collection
  const collectMetrics = useCallback(() => {
    if (!config.enableMetrics || typeof window === 'undefined') return;

    try {
      // Web Vitals measurement
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            console.log('🎯 LCP:', Math.round(lastEntry.startTime), 'ms');
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            console.log('⚡ FID:', Math.round(entry.processingStart - entry.startTime), 'ms');
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          if (clsValue > 0) {
            console.log('📐 CLS:', Math.round(clsValue * 1000) / 1000);
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // Navigation timing
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const ttfb = navigation.responseStart - navigation.fetchStart;
          const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
          
          console.log('🚀 Performance Metrics:');
          console.log('  TTFB:', Math.round(ttfb), 'ms');
          console.log('  FCP:', Math.round(fcp), 'ms');
          console.log('  DOM Load:', Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart), 'ms');
          console.log('  Page Load:', Math.round(navigation.loadEventEnd - navigation.fetchStart), 'ms');
        }
      }
    } catch (error) {
      console.warn('Performance metrics collection failed:', error);
    }
  }, [config.enableMetrics]);

  // Resource hints optimization
  const optimizeResourceHints = useCallback(() => {
    if (!config.enableResourceHints || typeof document === 'undefined') return;

    try {
      // Preconnect to external domains
      const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ];

      preconnectDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // DNS prefetch for API domains
      const dnsPrefetchDomains = [
        'https://neurastack-backend-638289111765.us-central1.run.app',
      ];

      dnsPrefetchDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      });

      console.log('🔗 Resource hints optimized');
    } catch (error) {
      console.warn('Resource hints optimization failed:', error);
    }
  }, [config.enableResourceHints]);

  // Image optimization
  const optimizeImages = useCallback(() => {
    if (!config.enableImageOptimization || typeof document === 'undefined') return;

    try {
      // Add loading="lazy" to images that don't have it
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach((img) => {
        (img as HTMLImageElement).loading = 'lazy';
      });

      // Add decoding="async" for better performance
      const allImages = document.querySelectorAll('img:not([decoding])');
      allImages.forEach((img) => {
        (img as HTMLImageElement).decoding = 'async';
      });

      console.log('🖼️ Images optimized:', images.length + allImages.length);
    } catch (error) {
      console.warn('Image optimization failed:', error);
    }
  }, [config.enableImageOptimization]);

  // Font optimization
  const optimizeFonts = useCallback(() => {
    if (!config.enableFontOptimization || typeof document === 'undefined') return;

    try {
      // Add font-display: swap to font faces
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-display: swap;
        }
      `;
      document.head.appendChild(style);

      console.log('🔤 Fonts optimized');
    } catch (error) {
      console.warn('Font optimization failed:', error);
    }
  }, [config.enableFontOptimization]);

  // Memory optimization
  const optimizeMemory = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Clean up event listeners on page unload
      const cleanup = () => {
        // Force garbage collection if available (dev tools)
        if ('gc' in window) {
          (window as any).gc();
        }
      };

      window.addEventListener('beforeunload', cleanup);
      
      return () => {
        window.removeEventListener('beforeunload', cleanup);
      };
    } catch (error) {
      console.warn('Memory optimization failed:', error);
    }
  }, []);

  // Initialize optimizations
  useEffect(() => {
    const timer = setTimeout(() => {
      collectMetrics();
      optimizeResourceHints();
      optimizeImages();
      optimizeFonts();
      
      const memoryCleanup = optimizeMemory();
      
      return () => {
        if (memoryCleanup) memoryCleanup();
      };
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [collectMetrics, optimizeResourceHints, optimizeImages, optimizeFonts, optimizeMemory]);

  // Periodic image optimization for dynamic content
  useEffect(() => {
    if (!config.enableImageOptimization) return;

    const interval = setInterval(() => {
      optimizeImages();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [config.enableImageOptimization, optimizeImages]);

  return {
    collectMetrics,
    optimizeResourceHints,
    optimizeImages,
    optimizeFonts,
    optimizeMemory
  };
};

export default usePerformanceOptimization;
