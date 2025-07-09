/**
 * Unified Device Optimization Hook
 * 
 * Consolidates all mobile optimization, performance monitoring, and device
 * detection into a single, comprehensive hook. Replaces multiple scattered
 * hooks with a clean, efficient solution.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '../../config/app';

// ============================================================================
// Types
// ============================================================================

interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  supportsWebGL: boolean;
  supportsServiceWorker: boolean;
  devicePixelRatio: number;
  connectionType: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  networkLatency: number;
  isLowPowerMode: boolean;
}

interface ViewportInfo {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  keyboardVisible: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface OptimizedDeviceResult {
  // Device Detection
  capabilities: DeviceCapabilities;
  viewport: ViewportInfo;
  performance: PerformanceMetrics;
  
  // Utilities
  triggerHaptic: (pattern?: keyof typeof APP_CONFIG.MOBILE.HAPTIC_PATTERNS | number[]) => void;
  optimizeScroll: (element: HTMLElement) => () => void;
  preloadResource: (url: string, type: 'image' | 'script' | 'style') => Promise<void>;
  
  // Responsive Values
  responsive: {
    spacing: Record<string, number>;
    touchTargets: Record<string, string>;
    typography: Record<string, string>;
  };
  
  // Configuration
  config: {
    shouldReduceAnimations: boolean;
    shouldPreloadImages: boolean;
    shouldEnableHaptics: boolean;
    optimalImageQuality: number;
  };
}

// ============================================================================
// Device Detection Utilities
// ============================================================================

const detectDeviceCapabilities = (): DeviceCapabilities => {
  // const userAgent = navigator.userAgent.toLowerCase(); // Unused for now
  const isMobile = window.innerWidth <= APP_CONFIG.MOBILE.MOBILE_BREAKPOINT;
  const isTablet = window.innerWidth <= APP_CONFIG.MOBILE.TABLET_BREAKPOINT && !isMobile;
  
  return {
    isMobile,
    isTablet,
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    supportsWebGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })(),
    supportsServiceWorker: 'serviceWorker' in navigator,
    devicePixelRatio: window.devicePixelRatio || 1,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
  };
};

const detectViewportInfo = (): ViewportInfo => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const visualViewportHeight = (window as any).visualViewport?.height || height;
  
  return {
    width,
    height,
    orientation: width > height ? 'landscape' : 'portrait',
    keyboardVisible: height - visualViewportHeight > APP_CONFIG.MOBILE.KEYBOARD_DETECTION_THRESHOLD,
    safeAreaInsets: {
      top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0,
      bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')) || 0,
      left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)')) || 0,
      right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)')) || 0,
    },
  };
};

const detectPerformanceMetrics = (): PerformanceMetrics => {
  const memory = (performance as any).memory;
  
  return {
    fps: 60, // Will be updated by animation frame monitoring
    memoryUsage: memory ? memory.usedJSHeapSize : 0,
    networkLatency: 0, // Will be updated by network monitoring
    isLowPowerMode: (navigator as any).getBattery?.()?.then((battery: any) => battery.charging === false && battery.level < 0.2) || false,
  };
};

// ============================================================================
// Main Hook
// ============================================================================

export const useOptimizedDevice = (): OptimizedDeviceResult => {
  // State
  const [capabilities] = useState<DeviceCapabilities>(detectDeviceCapabilities);
  const [viewport, setViewport] = useState<ViewportInfo>(detectViewportInfo);
  const [performance, setPerformance] = useState<PerformanceMetrics>(detectPerformanceMetrics);

  // Update viewport on resize
  useEffect(() => {
    const updateViewport = () => setViewport(detectViewportInfo());
    const debouncedUpdate = debounce(updateViewport, APP_CONFIG.MOBILE.RESIZE_DEBOUNCE);
    
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', debouncedUpdate);
    
    // Visual viewport API for keyboard detection
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', debouncedUpdate);
    }
    
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener('resize', debouncedUpdate);
      }
    };
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (!APP_CONFIG.ENV.FEATURES.ENABLE_PERFORMANCE_MONITORING) return;

    let frameCount = 0;
    let lastTime = window.performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = window.performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setPerformance(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Track user interaction for haptic feedback
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Listen for first user interaction
  useEffect(() => {
    if (hasUserInteracted) return;

    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [hasUserInteracted]);

  // Haptic feedback utility
  const triggerHaptic = useCallback((pattern: keyof typeof APP_CONFIG.MOBILE.HAPTIC_PATTERNS | number[] = 'LIGHT') => {
    if (!capabilities.isMobile || !('vibrate' in navigator) || !hasUserInteracted) return;

    const vibrationPattern = Array.isArray(pattern)
      ? pattern
      : APP_CONFIG.MOBILE.HAPTIC_PATTERNS[pattern];

    try {
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      // Silently fail if vibration is not allowed
      console.debug('Haptic feedback not available:', error);
    }
  }, [capabilities.isMobile, hasUserInteracted]);

  // Scroll optimization utility
  const optimizeScroll = useCallback((element: HTMLElement) => {
    (element.style as any).webkitOverflowScrolling = 'touch';
    element.style.overscrollBehavior = 'contain';

    return () => {
      (element.style as any).webkitOverflowScrolling = '';
      element.style.overscrollBehavior = '';
    };
  }, []);

  // Resource preloading utility
  const preloadResource = useCallback(async (url: string, type: 'image' | 'script' | 'style'): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = type;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload ${type}: ${url}`));
      
      document.head.appendChild(link);
    });
  }, []);

  // Responsive values
  const responsive = useMemo(() => ({
    spacing: {
      xs: capabilities.isMobile ? 3 : 2,
      sm: capabilities.isMobile ? 4 : 3,
      md: capabilities.isMobile ? 5 : 4,
      lg: capabilities.isMobile ? 6 : 5,
      xl: capabilities.isMobile ? 7 : 6,
    },
    touchTargets: {
      small: capabilities.isMobile ? APP_CONFIG.UI.TOUCH_TARGETS.MEDIUM : APP_CONFIG.UI.TOUCH_TARGETS.SMALL,
      medium: capabilities.isMobile ? APP_CONFIG.UI.TOUCH_TARGETS.LARGE : APP_CONFIG.UI.TOUCH_TARGETS.MEDIUM,
      large: capabilities.isMobile ? APP_CONFIG.UI.TOUCH_TARGETS.XLARGE : APP_CONFIG.UI.TOUCH_TARGETS.LARGE,
    },
    typography: {
      body: capabilities.isMobile ? APP_CONFIG.THEME.TYPOGRAPHY.FONT_SIZES.MD : APP_CONFIG.THEME.TYPOGRAPHY.FONT_SIZES.SM,
      heading: capabilities.isMobile ? APP_CONFIG.THEME.TYPOGRAPHY.FONT_SIZES.XL : APP_CONFIG.THEME.TYPOGRAPHY.FONT_SIZES.LG,
    },
  }), [capabilities.isMobile]);

  // Configuration based on device capabilities
  const config = useMemo(() => ({
    shouldReduceAnimations: capabilities.reducedMotion || performance.fps < APP_CONFIG.PERFORMANCE.MIN_FPS,
    shouldPreloadImages: capabilities.connectionType !== 'slow-2g' && capabilities.connectionType !== '2g',
    shouldEnableHaptics: capabilities.isMobile && capabilities.isTouch,
    optimalImageQuality: capabilities.connectionType === 'slow-2g' || capabilities.connectionType === '2g' ? 0.6 : 0.8,
  }), [capabilities, performance.fps]);

  return {
    capabilities,
    viewport,
    performance,
    triggerHaptic,
    optimizeScroll,
    preloadResource,
    responsive,
    config,
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
