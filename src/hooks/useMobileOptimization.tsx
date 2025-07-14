import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Enhanced mobile optimization hook for chat input
 * Provides mobile-specific optimizations and interactions
 */
export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Enhanced mobile device and touch capability detection
  useEffect(() => {
    const checkMobile = () => {
      // More comprehensive mobile detection
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
      const isMobileUA = mobileRegex.test(userAgent);
      const isMobileWidth = window.innerWidth <= 768;
      const isTabletWidth = window.innerWidth <= 1024 && window.innerWidth > 768;

      // Enhanced touch detection
      const hasTouch = 'ontouchstart' in window ||
                      navigator.maxTouchPoints > 0 ||
                      (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch;

      setIsMobile(isMobileUA || isMobileWidth);
      setIsTouch(hasTouch);

      // Set CSS custom properties for responsive design
      document.documentElement.style.setProperty('--is-mobile', isMobileUA || isMobileWidth ? '1' : '0');
      document.documentElement.style.setProperty('--is-tablet', isTabletWidth ? '1' : '0');
      document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`);
      document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    };

    // Debounced handlers for better performance
    let resizeTimeout: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };

    checkMobile();
    window.addEventListener('resize', debouncedCheck, { passive: true });
    window.addEventListener('orientationchange', checkMobile, { passive: true });
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      window.removeEventListener('orientationchange', checkMobile);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Track viewport height changes (for virtual keyboard detection)
  useEffect(() => {
    const updateViewportHeight = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(currentHeight);
      
      // Detect virtual keyboard on mobile
      if (isMobile) {
        const heightDifference = window.screen.height - currentHeight;
        setKeyboardVisible(heightDifference > 150); // Threshold for keyboard detection
      }
    };

    updateViewportHeight();
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
      return () => window.visualViewport?.removeEventListener('resize', updateViewportHeight);
    } else {
      window.addEventListener('resize', updateViewportHeight);
      return () => window.removeEventListener('resize', updateViewportHeight);
    }
  }, [isMobile]);

  // Enhanced haptic feedback utility
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | number | number[] = 'light') => {
    if (!isMobile || !('vibrate' in navigator)) return;

    const patterns = {
      light: 50,
      medium: 100,
      heavy: 200,
      success: [100, 50, 100],
      warning: [150, 100, 150],
      error: [200, 100, 200, 100, 200],
    };

    const pattern = typeof type === 'string' ? patterns[type] : type;
    navigator.vibrate(pattern);
  }, [isMobile]);

  // Enhanced touch configuration
  const touchConfig = useMemo(() => ({
    minTouchTarget: isMobile ? 48 : 44,
    tapHighlight: 'transparent',
    touchAction: 'manipulation',
    userSelect: 'none' as const,
  }), [isMobile]);

  // Input-specific optimizations
  const inputOptimizations = useMemo(() => ({
    fontSize: isMobile ? '16px' : '15px', // Prevent zoom on iOS
    autoComplete: 'off',
    autoCorrect: 'on',
    spellCheck: true,
    inputMode: 'text' as const,
  }), [isMobile]);

  // Performance optimizations for mobile
  const performanceConfig = useMemo(() => ({
    willChange: 'transform, height',
    backfaceVisibility: 'hidden' as const,
    WebkitOverflowScrolling: 'touch' as const,
    overscrollBehavior: 'contain' as const,
  }), []);

  // Enhanced mobile optimizations for app features
  const appConfig = useMemo(() => ({
    // Prevent screen sleep during active sessions
    preventSleep: () => {
      if ('wakeLock' in navigator) {
        return (navigator as any).wakeLock.request('screen');
      }
      return Promise.resolve(null);
    },

    // Enhanced timer display for mobile
    timerStyles: {
      fontSize: isMobile ? '4rem' : '2rem',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      padding: isMobile ? '2rem' : '1rem',
      userSelect: 'none' as const,
      lineHeight: '1.1',
    },

    // Enhanced card optimizations
    cardStyles: {
      padding: isMobile ? '1.25rem' : '0.75rem',
      borderRadius: isMobile ? '1.25rem' : '0.5rem',
      minHeight: isMobile ? '140px' : '100px',
      touchAction: 'manipulation' as const,
      transition: 'all 0.2s ease',
    },

    // Enhanced button optimizations
    buttonStyles: {
      minHeight: isMobile ? '64px' : '48px',
      fontSize: isMobile ? '1.25rem' : '1rem',
      fontWeight: '600',
      borderRadius: isMobile ? '1rem' : '0.5rem',
      touchAction: 'manipulation' as const,
      WebkitTapHighlightColor: 'transparent',
      transition: 'all 0.2s ease',
    },

    // Rest timer specific optimizations
    restTimerStyles: {
      circularProgressSize: isMobile ? '180px' : '140px',
      circularProgressThickness: isMobile ? '10px' : '8px',
      timerFontSize: isMobile ? '4xl' : '2xl',
      buttonHeight: isMobile ? '56px' : '40px',
      buttonMinWidth: isMobile ? '140px' : '100px',
    },

    // Dashboard card optimizations
    dashboardCardStyles: {
      padding: isMobile ? '1.5rem' : '1rem',
      minHeight: isMobile ? '120px' : 'auto',
      borderRadius: isMobile ? '1.25rem' : '1rem',
      spacing: isMobile ? 4 : 3,
    },
  }), [isMobile]);

  return {
    // Device detection
    isMobile,
    isTouch,
    keyboardVisible,
    viewportHeight,

    // Utilities
    triggerHaptic,

    // Configuration objects
    touchConfig,
    inputOptimizations,
    performanceConfig,
    appConfig,

    // Enhanced responsive values
    spacing: {
      xs: isMobile ? 3 : 2,
      sm: isMobile ? 4 : 3,
      md: isMobile ? 5 : 4,
      lg: isMobile ? 6 : 5,
      xl: isMobile ? 7 : 6,
    },

    // Enhanced touch target sizes
    touchTargets: {
      small: isMobile ? '44px' : '40px',
      medium: isMobile ? '52px' : '44px',
      large: isMobile ? '64px' : '52px',
      xlarge: isMobile ? '72px' : '60px',
    },

    // Typography scaling for mobile readability
    typography: {
      xs: isMobile ? 'sm' : 'xs',
      sm: isMobile ? 'md' : 'sm',
      md: isMobile ? 'lg' : 'md',
      lg: isMobile ? 'xl' : 'lg',
      xl: isMobile ? '2xl' : 'xl',
    },

    // Icon sizes for mobile optimization
    iconSizes: {
      xs: isMobile ? 4 : 3,
      sm: isMobile ? 5 : 4,
      md: isMobile ? 6 : 5,
      lg: isMobile ? 7 : 6,
      xl: isMobile ? 8 : 7,
    },
  };
}

/**
 * Hook for enhanced textarea auto-resize with mobile optimization
 */
export function useAutoResize(textareaRef: React.RefObject<HTMLTextAreaElement>, isMobile: boolean = false) {
  const handleResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate new height
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    
    // Apply height with mobile-optimized constraints
    const maxHeight = isMobile ? 140 : 180;
    const minHeight = isMobile ? 48 : 44;
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    
    textarea.style.height = `${newHeight}px`;
  }, [textareaRef, isMobile]);

  return handleResize;
}

/**
 * Hook for enhanced focus management with mobile considerations
 */
export function useEnhancedFocus() {
  const [isFocused, setIsFocused] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const handleFocus = useCallback((e: React.FocusEvent) => {
    setIsFocused(true);
    // Only show focus ring for keyboard navigation
    setFocusVisible(e.target.matches(':focus-visible'));
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setFocusVisible(false);
  }, []);

  return {
    isFocused,
    focusVisible,
    handleFocus,
    handleBlur,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}
