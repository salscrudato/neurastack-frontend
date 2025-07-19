/**
 * Simplified Performance Optimization Utilities
 *
 * Essential utilities for app performance optimization.
 * Only includes functions that are actually used in the application.
 */

// ============================================================================
// Essential Utilities
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
 * Mobile performance utilities
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