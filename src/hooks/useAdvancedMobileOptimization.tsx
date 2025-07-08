import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

/**
 * Advanced Mobile Optimization Hook
 * 
 * Provides comprehensive mobile detection, optimization utilities,
 * performance enhancements, and leading mobile UX patterns.
 */

// Device capability detection
interface DeviceCapabilities {
  hasTouch: boolean;
  hasHover: boolean;
  hasPointerFine: boolean;
  supportsPassiveEvents: boolean;
  supportsIntersectionObserver: boolean;
  supportsResizeObserver: boolean;
  supportsWebGL: boolean;
  supportsServiceWorker: boolean;
  supportsWebAssembly: boolean;
  devicePixelRatio: number;
  maxTouchPoints: number;
  connectionType?: string;
  effectiveType?: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

// Performance metrics
interface PerformanceMetrics {
  renderTime: number;
  scrollPerformance: number;
  touchLatency: number;
  memoryUsage?: number;
  frameRate: number;
}

// Touch gesture detection
interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'long-press';
  direction?: 'up' | 'down' | 'left' | 'right';
  velocity?: number;
  distance?: number;
}

export function useAdvancedMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    scrollPerformance: 0,
    touchLatency: 0,
    frameRate: 60,
  });
  const [networkInfo, setNetworkInfo] = useState<{ type?: string; effectiveType?: string; downlink?: number }>({});

  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastTouchTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Advanced device capability detection
  const detectDeviceCapabilities = useCallback((): DeviceCapabilities => {
    const capabilities: DeviceCapabilities = {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasHover: window.matchMedia('(hover: hover)').matches,
      hasPointerFine: window.matchMedia('(pointer: fine)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      supportsPassiveEvents: (() => {
        let supportsPassive = false;
        try {
          const opts = Object.defineProperty({}, 'passive', {
            get: () => { supportsPassive = true; }
          });
          window.addEventListener('testPassive', () => {}, opts);
          window.removeEventListener('testPassive', () => {}, opts);
        } catch (e) {}
        return supportsPassive;
      })(),
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      supportsResizeObserver: 'ResizeObserver' in window,
      supportsWebGL: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
          return false;
        }
      })(),
      supportsServiceWorker: 'serviceWorker' in navigator,
      supportsWebAssembly: 'WebAssembly' in window,
      devicePixelRatio: window.devicePixelRatio || 1,
      maxTouchPoints: navigator.maxTouchPoints || 0,
    };

    // Network information (if available)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      capabilities.connectionType = connection.type;
      capabilities.effectiveType = connection.effectiveType;
    }

    return capabilities;
  }, []);

  // Enhanced mobile detection with multiple sophisticated checks
  const checkMobile = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobileWidth = width <= 768;
    const isTabletWidth = width > 768 && width <= 1024;
    
    // Detect orientation
    const newOrientation = width > height ? 'landscape' : 'portrait';
    
    // Advanced mobile detection considering multiple factors
    const isMobileDevice = isMobileUA || (isMobileWidth && !isTabletUA);
    const isTabletDevice = isTabletUA || (isTabletWidth && !isMobileUA);
    
    setIsMobile(isMobileDevice);
    setIsTablet(isTabletDevice);
    setOrientation(newOrientation);
    setViewportHeight(height);

    // Update device capabilities
    const capabilities = detectDeviceCapabilities();
    setDeviceCapabilities(capabilities);
    setIsTouch(capabilities.hasTouch);

    // Update network information
    const connection = (navigator as any).connection;
    if (connection) {
      setNetworkInfo({
        type: connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
      });
    }

    // Set comprehensive CSS custom properties for advanced responsive design
    const root = document.documentElement.style;
    root.setProperty('--is-mobile', isMobileDevice ? '1' : '0');
    root.setProperty('--is-tablet', isTabletDevice ? '1' : '0');
    root.setProperty('--is-desktop', (!isMobileDevice && !isTabletDevice) ? '1' : '0');
    root.setProperty('--viewport-width', `${width}px`);
    root.setProperty('--viewport-height', `${height}px`);
    root.setProperty('--orientation', newOrientation);
    root.setProperty('--device-pixel-ratio', capabilities.devicePixelRatio.toString());
    root.setProperty('--has-touch', capabilities.hasTouch ? '1' : '0');
    root.setProperty('--has-hover', capabilities.hasHover ? '1' : '0');
    root.setProperty('--reduced-motion', capabilities.reducedMotion ? '1' : '0');
    root.setProperty('--high-contrast', capabilities.highContrast ? '1' : '0');
    root.setProperty('--connection-type', capabilities.connectionType || 'unknown');
    
    // Performance-based CSS properties
    root.setProperty('--enable-animations', capabilities.supportsWebGL && !capabilities.reducedMotion ? '1' : '0');
    root.setProperty('--enable-blur', capabilities.devicePixelRatio > 1 ? '1' : '0');
    root.setProperty('--enable-3d', capabilities.supportsWebGL ? '1' : '0');
  }, [detectDeviceCapabilities]);

  // Optimized debounced resize handler
  const debouncedCheck = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(checkMobile, 100);
  }, [checkMobile]);

  // Keyboard visibility detection for mobile
  const detectKeyboard = useCallback(() => {
    const initialHeight = window.innerHeight;
    const currentHeight = window.visualViewport?.height || window.innerHeight;
    const heightDifference = initialHeight - currentHeight;
    
    // Keyboard is likely visible if viewport height decreased significantly
    const keyboardThreshold = initialHeight * 0.25; // 25% of screen height
    const isKeyboardVisible = heightDifference > keyboardThreshold;
    
    if (isKeyboardVisible !== keyboardVisible) {
      setKeyboardVisible(isKeyboardVisible);
      
      // Update CSS custom property
      document.documentElement.style.setProperty('--keyboard-visible', isKeyboardVisible ? '1' : '0');
      document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`);
    }
  }, [keyboardVisible]);

  // Performance monitoring
  const measureFrameRate = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;
    
    if (lastFrameTimeRef.current) {
      const delta = now - lastFrameTimeRef.current;
      if (delta >= 1000) { // Calculate FPS every second
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        setPerformanceMetrics(prev => ({ ...prev, frameRate: fps }));
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
    } else {
      lastFrameTimeRef.current = now;
    }
    
    requestAnimationFrame(measureFrameRate);
  }, []);

  // Touch gesture detection
  const detectTouchGesture = useCallback((touches: TouchList): TouchGesture | null => {
    if (touches.length === 1) {
      const now = performance.now();
      const timeDiff = now - lastTouchTimeRef.current;

      if (timeDiff < 300) { // Quick tap
        return { type: 'tap' };
      } else if (timeDiff > 500) { // Long press
        return { type: 'long-press' };
      }
    } else if (touches.length === 2) {
      return { type: 'pinch' };
    }

    return null;
  }, []);

  // Haptic feedback utility
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if ('vibrate' in navigator && isMobile) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [50, 100, 50, 100, 50],
      };
      navigator.vibrate(patterns[type]);
    }
  }, [isMobile]);

  // Initialize mobile optimization
  useEffect(() => {
    checkMobile();
    
    // Event listeners
    window.addEventListener('resize', debouncedCheck, { passive: true });
    window.addEventListener('orientationchange', checkMobile, { passive: true });
    
    // Visual viewport API for better keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', detectKeyboard, { passive: true });
    }
    
    // Start performance monitoring
    requestAnimationFrame(measureFrameRate);
    
    // Touch event listeners for gesture detection
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchTimeRef.current = performance.now();
      const gesture = detectTouchGesture(e.touches);
      if (gesture) {
        console.log('Touch gesture detected:', gesture);
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      window.removeEventListener('orientationchange', checkMobile);
      document.removeEventListener('touchstart', handleTouchStart);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', detectKeyboard);
      }
      
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [checkMobile, debouncedCheck, detectKeyboard, measureFrameRate, detectTouchGesture]);

  // Memoized configuration objects
  const touchConfig = useMemo(() => ({
    tapTimeout: 300,
    longPressTimeout: 500,
    swipeThreshold: 50,
    pinchThreshold: 10,
  }), []);

  const inputOptimizations = useMemo(() => ({
    fontSize: isMobile ? '16px' : '15px', // Prevent zoom on iOS
    autoComplete: 'off',
    autoCorrect: 'on',
    spellCheck: true,
    inputMode: 'text' as const,
    enterKeyHint: 'send' as const,
  }), [isMobile]);

  const performanceConfig = useMemo(() => ({
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden' as const,
    WebkitOverflowScrolling: 'touch' as const,
    overscrollBehavior: 'contain' as const,
    contain: 'layout style paint' as const,
  }), []);

  return {
    // Device detection
    isMobile,
    isTablet,
    isTouch,
    keyboardVisible,
    viewportHeight,
    orientation,
    deviceCapabilities,
    performanceMetrics,
    networkInfo,

    // Utilities
    triggerHaptic,
    detectTouchGesture,

    // Configuration objects
    touchConfig,
    inputOptimizations,
    performanceConfig,

    // Responsive values
    spacing: {
      xs: isMobile ? 3 : 2,
      sm: isMobile ? 4 : 3,
      md: isMobile ? 5 : 4,
      lg: isMobile ? 6 : 5,
      xl: isMobile ? 7 : 6,
    },

    // Touch target sizes
    touchTargets: {
      small: isMobile ? '44px' : '40px',
      medium: isMobile ? '52px' : '44px',
      large: isMobile ? '64px' : '52px',
      xlarge: isMobile ? '72px' : '60px',
    },

    // Typography scaling
    fontSizes: {
      xs: isMobile ? '0.75rem' : '0.7rem',
      sm: isMobile ? '0.875rem' : '0.8rem',
      md: isMobile ? '1rem' : '0.9rem',
      lg: isMobile ? '1.125rem' : '1rem',
      xl: isMobile ? '1.25rem' : '1.125rem',
    },
  };
}

export default useAdvancedMobileOptimization;
