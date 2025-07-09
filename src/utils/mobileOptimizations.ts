/**
 * Mobile Optimization Utilities
 * 
 * Provides mobile-specific optimizations for keyboard handling, touch management,
 * and viewport adjustments.
 */

// ============================================================================
// Mobile Keyboard Manager
// ============================================================================

export const mobileKeyboardManager = {
  detectKeyboard: (callback: (visible: boolean) => void) => {
    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      const isKeyboardVisible = heightDifference > 150; // Threshold for keyboard detection
      
      callback(isKeyboardVisible);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
      return () => window.removeEventListener('resize', handleViewportChange);
    }
  },

  adjustForKeyboard: (element: HTMLElement, isVisible: boolean) => {
    if (isVisible) {
      element.style.paddingBottom = '20px';
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      element.style.paddingBottom = '';
    }
  },

  handleInputFocus: (target: EventTarget | null) => {
    if (target && target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
};

// ============================================================================
// Mobile Touch Manager
// ============================================================================

export const mobileTouchManager = {
  optimizeTouch: (element: HTMLElement) => {
    element.style.touchAction = 'manipulation';
    (element.style as any).webkitTapHighlightColor = 'transparent';
    (element.style as any).webkitTouchCallout = 'none';
    (element.style as any).webkitUserSelect = 'none';
    element.style.userSelect = 'none';
  },

  enableScrollMomentum: (element: HTMLElement) => {
    (element.style as any).webkitOverflowScrolling = 'touch';
    element.style.overscrollBehavior = 'contain';
  },

  preventZoom: () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  },

  triggerHaptic: (pattern: string | number[] = 'light') => {
    if ('vibrate' in navigator) {
      const vibrationPattern = pattern === 'light' ? [10] : Array.isArray(pattern) ? pattern : [10];
      navigator.vibrate(vibrationPattern);
    }
  }
};

// ============================================================================
// Mobile Optimization Hook (Simplified)
// ============================================================================

export const useMobileOptimization = () => {
  const isMobile = window.innerWidth <= 768;

  return {
    isMobile,
    keyboardVisible: false, // Simplified for now
    triggerHaptic: (pattern: number[] = [10]) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    }
  };
};

// ============================================================================
// Enhanced Mobile Performance Utilities
// ============================================================================

export const mobilePerformanceUtils = {
  // Optimize component for mobile performance
  optimizeForMobile: (element: HTMLElement) => {
    // Apply performance optimizations
    element.style.contain = 'layout style paint';
    element.style.willChange = 'auto';

    // Optimize touch interactions
    element.style.touchAction = 'manipulation';
    (element.style as any).webkitTapHighlightColor = 'transparent';

    // Enable hardware acceleration if needed
    if (element.classList.contains('gpu-accelerated')) {
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
    }
  },

  // Optimize scrolling performance
  optimizeScrolling: (element: HTMLElement) => {
    (element.style as any).webkitOverflowScrolling = 'touch';
    element.style.overscrollBehavior = 'contain';
    element.style.scrollBehavior = 'smooth';
  },

  // Debounce function for performance
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeout;

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func(...args);
    };
  },

  // Throttle function for performance
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Measure component render time
  measureRenderTime: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    const duration = end - start;

    if (duration > 16) { // More than one frame
      console.warn(`🐌 Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  },

  // Check if device has good performance
  isHighPerformanceDevice: (): boolean => {
    // Check for hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 1;

    // Check for device memory (if available)
    const memory = (navigator as any).deviceMemory || 4;

    // Check for connection speed
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || '4g';

    return cores >= 4 && memory >= 4 && ['4g', '5g'].includes(effectiveType);
  },

  // Optimize images for mobile
  optimizeImage: (img: HTMLImageElement) => {
    // Add loading="lazy" for better performance
    img.loading = 'lazy';

    // Add decoding="async" for non-blocking
    img.decoding = 'async';

    // Add proper sizes attribute for responsive images
    if (!img.sizes && img.srcset) {
      img.sizes = '(max-width: 768px) 100vw, 50vw';
    }
  },

  // Preload critical resources
  preloadResource: (href: string, as: string, type?: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;

    document.head.appendChild(link);

    return link;
  },

  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get device pixel ratio for high-DPI displays
  getDevicePixelRatio: (): number => {
    return window.devicePixelRatio || 1;
  },

  // Check if device is in landscape mode
  isLandscape: (): boolean => {
    return window.innerWidth > window.innerHeight;
  },

  // Get safe area insets
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('--safe-area-inset-top') || '0px',
      bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
      left: style.getPropertyValue('--safe-area-inset-left') || '0px',
      right: style.getPropertyValue('--safe-area-inset-right') || '0px',
    };
  },
};
