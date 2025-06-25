import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Enhanced Mobile Optimization Hook
 * Provides comprehensive mobile-specific optimizations and configurations
 * with performance monitoring and adaptive features
 */
export function useEnhancedMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  // Enhanced device detection with performance considerations
  useEffect(() => {
    const checkDevice = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    window.innerWidth <= 768;
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const dpr = window.devicePixelRatio || 1;
      
      setIsMobile(mobile);
      setIsTouch(touch);
      setDevicePixelRatio(dpr);
      
      // Detect low-end devices for performance optimization
      const isLowEnd = (
        (navigator as any).hardwareConcurrency <= 2 ||
        (navigator as any).deviceMemory <= 2 ||
        dpr < 2
      );
      setIsLowEndDevice(isLowEnd);
      
      // Detect orientation
      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
    };

    checkDevice();
    
    // Throttled resize handler for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkDevice, 150);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Network connection monitoring
  useEffect(() => {
    const updateConnection = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    updateConnection();
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateConnection);
      return () => {
        (navigator as any).connection?.removeEventListener('change', updateConnection);
      };
    }
  }, []);

  // Safe area insets detection
  useEffect(() => {
    const updateSafeAreaInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
      });
    };

    updateSafeAreaInsets();
    window.addEventListener('resize', updateSafeAreaInsets, { passive: true });
    return () => window.removeEventListener('resize', updateSafeAreaInsets);
  }, []);

  // Enhanced viewport tracking with keyboard detection
  useEffect(() => {
    const updateViewportHeight = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(currentHeight);
      
      // Enhanced keyboard detection for mobile
      if (isMobile) {
        const heightDifference = window.screen.height - currentHeight;
        const keyboardThreshold = window.screen.height * 0.25; // 25% of screen height
        setKeyboardVisible(heightDifference > keyboardThreshold);
      }
    };

    updateViewportHeight();
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight, { passive: true });
      return () => window.visualViewport?.removeEventListener('resize', updateViewportHeight);
    } else {
      window.addEventListener('resize', updateViewportHeight, { passive: true });
      return () => window.removeEventListener('resize', updateViewportHeight);
    }
  }, [isMobile]);

  // Enhanced haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
    if (!isTouch || !('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      selection: [5],
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (error) {
      // Silently fail if vibration is not supported
    }
  }, [isTouch]);

  // Performance-aware animation configuration
  const animationConfig = useMemo(() => {
    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSlowDevice = isLowEndDevice || connectionType === 'slow-2g' || connectionType === '2g';
    
    return {
      duration: shouldReduceMotion || isSlowDevice ? 0 : isMobile ? 200 : 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      shouldAnimate: !shouldReduceMotion && !isSlowDevice,
    };
  }, [isMobile, isLowEndDevice, connectionType]);

  // Touch configuration optimized for different devices
  const touchConfig = useMemo(() => ({
    touchAction: 'manipulation' as const,
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    WebkitTouchCallout: 'none' as const,
    minHeight: isMobile ? '48px' : '40px',
    minWidth: isMobile ? '48px' : '40px',
  }), [isMobile]);

  // Input optimizations for mobile
  const inputOptimizations = useMemo(() => ({
    fontSize: isMobile ? '16px' : '15px', // Prevent zoom on iOS
    autoComplete: 'off',
    autoCorrect: 'on',
    spellCheck: true,
    inputMode: 'text' as const,
    enterKeyHint: 'send' as const,
  }), [isMobile]);

  // Performance configuration for mobile
  const performanceConfig = useMemo(() => ({
    willChange: isLowEndDevice ? 'auto' : 'transform, opacity',
    backfaceVisibility: 'hidden' as const,
    WebkitOverflowScrolling: 'touch' as const,
    overscrollBehavior: 'contain' as const,
    transform: 'translateZ(0)', // Force hardware acceleration on capable devices
  }), [isLowEndDevice]);

  // Responsive breakpoints
  const breakpoints = useMemo(() => ({
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
    isSmallMobile: window.innerWidth <= 480,
    isLargeMobile: window.innerWidth > 480 && window.innerWidth <= 768,
  }), []);

  // Adaptive spacing based on device and context
  const adaptiveSpacing = useMemo(() => ({
    xs: isMobile ? 2 : 1,
    sm: isMobile ? 3 : 2,
    md: isMobile ? 4 : 3,
    lg: isMobile ? 6 : 4,
    xl: isMobile ? 8 : 6,
  }), [isMobile]);

  // Touch target sizes for accessibility
  const touchTargets = useMemo(() => ({
    small: isMobile ? '44px' : '32px',
    medium: isMobile ? '48px' : '40px',
    large: isMobile ? '56px' : '48px',
    xlarge: isMobile ? '64px' : '56px',
  }), [isMobile]);

  return {
    // Device detection
    isMobile,
    isTouch,
    keyboardVisible,
    viewportHeight,
    devicePixelRatio,
    connectionType,
    isLowEndDevice,
    orientation,
    safeAreaInsets,
    breakpoints,

    // Utilities
    triggerHaptic,

    // Configuration objects
    animationConfig,
    touchConfig,
    inputOptimizations,
    performanceConfig,
    adaptiveSpacing,
    touchTargets,

    // Performance helpers
    shouldOptimizeForPerformance: isLowEndDevice || connectionType === 'slow-2g' || connectionType === '2g',
    shouldUseReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Layout helpers
    getResponsiveValue: <T extends any>(values: { mobile: T; tablet?: T; desktop: T }): T => {
      if (breakpoints.isMobile) return values.mobile;
      if (breakpoints.isTablet) return values.tablet || values.desktop;
      return values.desktop;
    },
  };
}

export default useEnhancedMobileOptimization;
