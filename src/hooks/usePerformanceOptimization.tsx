import { useCallback, useEffect } from 'react';

interface PerformanceConfig {
  enableMetrics: boolean;
  enableResourceHints: boolean;
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
}

export const usePerformanceOptimization = (config: PerformanceConfig = {
  enableMetrics: false, // Disabled by default to reduce logging
  enableResourceHints: true,
  enableImageOptimization: true,
  enableFontOptimization: true
}) => {

  // Minimal performance monitoring - only critical warnings in development
  const collectMetrics = useCallback(() => {
    if (!config.enableMetrics || typeof window === 'undefined' || !import.meta.env.DEV) return;

    try {
      // Only track critical performance issues in development
      if ('PerformanceObserver' in window) {
        // Only warn about slow LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry && lastEntry.startTime > 2500) {
            console.warn('⚠️ Slow LCP detected:', Math.round(lastEntry.startTime), 'ms');
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Only warn about slow FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            if (fid > 100) {
              console.warn('⚠️ Slow FID detected:', Math.round(fid), 'ms');
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      }
    } catch (error) {
      // Silent fail - don't log performance monitoring errors
    }
  }, [config.enableMetrics]);

  // Resource hints optimization - simplified and silent
  const optimizeResourceHints = useCallback(() => {
    if (!config.enableResourceHints || typeof document === 'undefined') return;

    try {
      // Only add resource hints if they don't already exist
      const existingPreconnects = Array.from(document.querySelectorAll('link[rel="preconnect"]'))
        .map(link => (link as HTMLLinkElement).href);

      const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ];

      preconnectDomains.forEach(domain => {
        if (!existingPreconnects.includes(domain)) {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      });

      // DNS prefetch for API domains
      const existingDnsPrefetch = Array.from(document.querySelectorAll('link[rel="dns-prefetch"]'))
        .map(link => (link as HTMLLinkElement).href);

      const dnsPrefetchDomains = [
        'https://neurastack-backend-638289111765.us-central1.run.app',
      ];

      dnsPrefetchDomains.forEach(domain => {
        if (!existingDnsPrefetch.includes(domain)) {
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = domain;
          document.head.appendChild(link);
        }
      });
    } catch (error) {
      // Silent fail
    }
  }, [config.enableResourceHints]);

  // Image optimization - simplified and silent
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
    } catch (error) {
      // Silent fail
    }
  }, [config.enableImageOptimization]);

  // Font optimization - simplified and silent
  const optimizeFonts = useCallback(() => {
    if (!config.enableFontOptimization || typeof document === 'undefined') return;

    try {
      // Only add font-display style if it doesn't exist
      if (!document.querySelector('style[data-font-display]')) {
        const style = document.createElement('style');
        style.setAttribute('data-font-display', 'true');
        style.textContent = `
          @font-face {
            font-display: swap;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      // Silent fail
    }
  }, [config.enableFontOptimization]);

  // Initialize optimizations - simplified
  useEffect(() => {
    // Run optimizations once on mount with a small delay
    const timer = setTimeout(() => {
      collectMetrics();
      optimizeResourceHints();
      optimizeImages();
      optimizeFonts();
    }, 100);

    return () => clearTimeout(timer);
  }, [collectMetrics, optimizeResourceHints, optimizeImages, optimizeFonts]);

  // Periodic image optimization for dynamic content - less frequent
  useEffect(() => {
    if (!config.enableImageOptimization) return;

    const interval = setInterval(() => {
      optimizeImages();
    }, 10000); // Check every 10 seconds instead of 5

    return () => clearInterval(interval);
  }, [config.enableImageOptimization, optimizeImages]);

  return {
    collectMetrics,
    optimizeResourceHints,
    optimizeImages,
    optimizeFonts
  };
};

export default usePerformanceOptimization;
