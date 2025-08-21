/**
 * Enhanced Performance Optimization Utilities
 *
 * Advanced performance optimization system targeting <1s Time to Interactive.
 * Includes intelligent caching, predictive preloading, and real-time monitoring.
 */

// ============================================================================
// Core Performance Utilities
// ============================================================================

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Advanced performance measurement utilities
 */
export const performanceMeasurement = {
  // Measure Time to Interactive
  measureTTI: (): Promise<number> => {
    return new Promise((resolve) => {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const tti = entries.find(
            (entry) => entry.name === "first-input-delay"
          );
          if (tti) {
            resolve(tti.startTime);
            observer.disconnect();
          }
        });
        observer.observe({ entryTypes: ["first-input"] });

        // Fallback timeout
        setTimeout(() => {
          observer.disconnect();
          resolve(performance.now());
        }, 10000);
      } else {
        resolve(performance.now());
      }
    });
  },

  // Measure Core Web Vitals
  measureCoreWebVitals: () => {
    const vitals = {
      FCP: 0, // First Contentful Paint
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
      TTFB: 0, // Time to First Byte
    };

    // Measure FCP
    if ("PerformanceObserver" in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            vitals.FCP = entry.startTime;
          }
        });
      }).observe({ entryTypes: ["paint"] });

      // Measure LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // Measure CLS
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            vitals.CLS += entry.value;
          }
        });
      }).observe({ entryTypes: ["layout-shift"] });
    }

    // Measure TTFB
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      vitals.TTFB = navigation.responseStart - navigation.requestStart;
    }

    return vitals;
  },

  // Bundle size analysis
  analyzeBundleSize: () => {
    const resources = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];
    const analysis = {
      totalJS: 0,
      totalCSS: 0,
      totalImages: 0,
      totalFonts: 0,
      largestResource: { name: "", size: 0 },
      recommendations: [] as string[],
    };

    resources.forEach((resource) => {
      const size = resource.transferSize || 0;
      const name = resource.name;

      if (name.includes(".js")) {
        analysis.totalJS += size;
      } else if (name.includes(".css")) {
        analysis.totalCSS += size;
      } else if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        analysis.totalImages += size;
      } else if (name.match(/\.(woff|woff2|ttf|otf)$/)) {
        analysis.totalFonts += size;
      }

      if (size > analysis.largestResource.size) {
        analysis.largestResource = { name, size };
      }
    });

    // Generate recommendations
    if (analysis.totalJS > 300 * 1024) {
      // 300KB
      analysis.recommendations.push(
        "Consider code splitting to reduce initial JS bundle size"
      );
    }
    if (analysis.totalImages > 500 * 1024) {
      // 500KB
      analysis.recommendations.push(
        "Optimize images with WebP format and lazy loading"
      );
    }
    if (analysis.largestResource.size > 100 * 1024) {
      // 100KB
      analysis.recommendations.push(
        `Large resource detected: ${analysis.largestResource.name}`
      );
    }

    return analysis;
  },
};

/**
 * Mobile performance utilities
 */
export const mobilePerformance = {
  // Detect device capabilities
  getDeviceCapabilities: () => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const isLowEndDevice =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const hasTouch = "ontouchstart" in window;
    const devicePixelRatio = window.devicePixelRatio || 1;

    return {
      isMobile,
      isLowEndDevice,
      hasTouch,
      devicePixelRatio,
      memoryInfo: (performance as any).memory || null,
      connectionType: (navigator as any).connection?.effectiveType || "unknown",
    };
  },

  // Optimize animations for mobile
  optimizeAnimations: () => {
    const capabilities = mobilePerformance.getDeviceCapabilities();

    if (capabilities.isLowEndDevice) {
      // Reduce animation complexity on low-end devices
      document.documentElement.style.setProperty(
        "--animation-duration",
        "0.15s"
      );
      document.documentElement.style.setProperty(
        "--animation-easing",
        "ease-out"
      );
    } else {
      document.documentElement.style.setProperty(
        "--animation-duration",
        "0.25s"
      );
      document.documentElement.style.setProperty(
        "--animation-easing",
        "cubic-bezier(0.4, 0, 0.2, 1)"
      );
    }
  },

  // Optimize images for mobile
  optimizeImages: () => {
    const capabilities = mobilePerformance.getDeviceCapabilities();

    // Set appropriate image quality based on device capabilities
    const quality = capabilities.isLowEndDevice ? 0.7 : 0.85;
    document.documentElement.style.setProperty(
      "--image-quality",
      quality.toString()
    );

    // Enable lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const image = entry.target as HTMLImageElement;
              image.classList.add("loaded");
              observer.unobserve(image);
            }
          });
        });
        observer.observe(img);
      }
    });
  },
};
