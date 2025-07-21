/**
 * Mobile Initialization Utilities
 * 
 * Handles mobile-specific initialization, optimizations, and feature detection
 * for the NeuraStack frontend application.
 */

import { mobilePerformance } from './performanceOptimizer';

/**
 * Initialize mobile-specific optimizations
 */
export function initializeMobileOptimizations(): void {
  // Detect device capabilities
  const capabilities = mobilePerformance.getDeviceCapabilities();
  
  // Set CSS custom properties based on device capabilities
  const root = document.documentElement;
  
  // Device-specific optimizations
  if (capabilities.isMobile) {
    root.classList.add('mobile-device');
    
    // Optimize for mobile performance
    if (capabilities.isLowEndDevice) {
      root.classList.add('low-end-device');
      root.style.setProperty('--animation-duration', '0.15s');
      root.style.setProperty('--blur-intensity', '16px');
    } else {
      root.style.setProperty('--animation-duration', '0.25s');
      root.style.setProperty('--blur-intensity', '32px');
    }
    
    // Touch device optimizations
    if (capabilities.hasTouch) {
      root.classList.add('touch-device');
      root.style.setProperty('--touch-target-size', '56px');
    }
    
    // High DPI optimizations
    if (capabilities.devicePixelRatio > 2) {
      root.classList.add('high-dpi');
      root.style.setProperty('--border-width', '0.5px');
    }
  }
  
  // Connection-based optimizations
  if (capabilities.connectionType === 'slow-2g' || capabilities.connectionType === '2g') {
    root.classList.add('slow-connection');
    root.style.setProperty('--animation-duration', '0.1s');
    root.style.setProperty('--blur-intensity', '8px');
  }
  
  // Apply performance optimizations
  mobilePerformance.optimizeAnimations();
  mobilePerformance.optimizeImages();
}

/**
 * Handle viewport meta tag for mobile optimization
 */
export function setupMobileViewport(): void {
  let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    document.head.appendChild(viewportMeta);
  }
  
  // Enhanced viewport configuration for mobile
  viewportMeta.content = [
    'width=device-width',
    'initial-scale=1.0',
    'maximum-scale=1.0',
    'user-scalable=no',
    'viewport-fit=cover'
  ].join(', ');
}

/**
 * Prevent iOS zoom on input focus
 */
export function preventIOSZoom(): void {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      const element = input as HTMLInputElement;
      if (element.style.fontSize === '' || parseFloat(element.style.fontSize) < 16) {
        element.style.fontSize = '16px';
      }
    });
  }
}

/**
 * Setup safe area CSS variables for iOS devices
 */
export function setupSafeAreaSupport(): void {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    const root = document.documentElement;
    
    // Set safe area inset CSS variables
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
    
    root.classList.add('ios-device');
  }
}

/**
 * Optimize touch interactions
 */
export function optimizeTouchInteractions(): void {
  // Disable touch callouts on iOS
  document.addEventListener('touchstart', (e) => {
    if (e.target instanceof HTMLElement) {
      (e.target.style as any).webkitTouchCallout = 'none';
    }
  }, { passive: true });

  // Optimize scroll performance
  document.addEventListener('touchmove', () => {
    // Allow default behavior for scrollable elements
  }, { passive: true });
  
  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

/**
 * Initialize all mobile optimizations
 */
export function initializeMobile(): void {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      runMobileInitialization();
    });
  } else {
    runMobileInitialization();
  }
}

/**
 * Run all mobile initialization functions
 */
function runMobileInitialization(): void {
  try {
    setupMobileViewport();
    setupSafeAreaSupport();
    initializeMobileOptimizations();
    preventIOSZoom();
    optimizeTouchInteractions();
    
    if (import.meta.env.DEV) {
      console.log('✅ Mobile optimizations initialized successfully');
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Some mobile optimizations failed to initialize:', error);
    }
  }
}

/**
 * Mobile feature detection utilities
 */
export const mobileFeatures = {
  // Check if device supports hover
  supportsHover: () => window.matchMedia('(hover: hover)').matches,
  
  // Check if device has fine pointer (mouse)
  hasFinePointer: () => window.matchMedia('(pointer: fine)').matches,
  
  // Check if device supports backdrop-filter
  supportsBackdropFilter: () => {
    return CSS.supports('backdrop-filter', 'blur(1px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  },
  
  // Check if device is in landscape mode
  isLandscape: () => window.matchMedia('(orientation: landscape)').matches,
  
  // Check if device is in portrait mode
  isPortrait: () => window.matchMedia('(orientation: portrait)').matches,
  
  // Get device type
  getDeviceType: () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
};

// Auto-initialize on import
initializeMobile();
