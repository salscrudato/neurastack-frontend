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

  // Enhanced haptic feedback utility with better patterns
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'tap' | 'button' | 'swipe' | number | number[] = 'light') => {
    if (!isMobile || !('vibrate' in navigator)) return;

    const patterns = {
      light: 25,
      medium: 50,
      heavy: 100,
      tap: 30,
      button: 40,
      swipe: [30, 20, 30],
      success: [50, 30, 50],
      warning: [80, 50, 80],
      error: [100, 50, 100, 50, 100],
    };

    const pattern = typeof type === 'string' ? patterns[type] : type;

    // Check if vibration is supported and user hasn't disabled it
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // Silently fail if vibration is not supported
      console.debug('Haptic feedback not supported:', error);
    }
  }, [isMobile]);

  // Enhanced touch configuration with better mobile support
  const touchConfig = useMemo(() => ({
    minTouchTarget: isMobile ? 56 : 44, // Increased for better accessibility
    tapHighlight: 'transparent',
    touchAction: 'manipulation',
    userSelect: 'none' as const,
    // Enhanced touch feedback
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    WebkitTouchCallout: 'none',
    // Improved touch responsiveness
    transition: 'all 0.15s ease-out',
    transform: 'scale(1)',
    '&:active': {
      transform: 'scale(0.98)',
      transition: 'all 0.1s ease-out'
    }
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

    // Enhanced button optimizations with better touch feedback
    buttonStyles: {
      minHeight: isMobile ? '56px' : '48px',
      fontSize: isMobile ? '1.125rem' : '1rem',
      fontWeight: '600',
      borderRadius: isMobile ? '1rem' : '0.5rem',
      touchAction: 'manipulation' as const,
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none',
      cursor: 'pointer',
      transition: 'all 0.15s ease-out',
      transform: 'scale(1)',
      '&:active': {
        transform: 'scale(0.96)',
        transition: 'all 0.1s ease-out'
      },
      '&:hover': {
        transform: isMobile ? 'scale(1)' : 'scale(1.02)'
      }
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

  // Enhanced touch gesture utilities
  const createTouchHandler = useCallback((callbacks: {
    onTap?: () => void;
    onDoubleTap?: () => void;
    onLongPress?: () => void;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  }) => {
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTapTime = 0;
    let longPressTimer: NodeJS.Timeout | null = null;

    return {
      onTouchStart: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartTime = Date.now();
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        // Start long press timer
        if (callbacks.onLongPress) {
          longPressTimer = setTimeout(() => {
            triggerHaptic('heavy');
            callbacks.onLongPress?.();
          }, 500);
        }
      },

      onTouchMove: () => {
        // Cancel long press on move
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      },

      onTouchEnd: (e: React.TouchEvent) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }

        const touch = e.changedTouches[0];
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Handle swipes
        if (distance > 50 && touchDuration < 300) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (absX > absY) {
            // Horizontal swipe
            if (deltaX > 0 && callbacks.onSwipeRight) {
              triggerHaptic('swipe');
              callbacks.onSwipeRight();
              return;
            } else if (deltaX < 0 && callbacks.onSwipeLeft) {
              triggerHaptic('swipe');
              callbacks.onSwipeLeft();
              return;
            }
          } else {
            // Vertical swipe
            if (deltaY > 0 && callbacks.onSwipeDown) {
              triggerHaptic('swipe');
              callbacks.onSwipeDown();
              return;
            } else if (deltaY < 0 && callbacks.onSwipeUp) {
              triggerHaptic('swipe');
              callbacks.onSwipeUp();
              return;
            }
          }
        }

        // Handle taps (only if not a swipe)
        if (distance < 10 && touchDuration < 300) {
          const now = Date.now();
          const timeSinceLastTap = now - lastTapTime;

          if (timeSinceLastTap < 300 && callbacks.onDoubleTap) {
            triggerHaptic('medium');
            callbacks.onDoubleTap();
          } else if (callbacks.onTap) {
            triggerHaptic('tap');
            callbacks.onTap();
          }

          lastTapTime = now;
        }
      }
    };
  }, [triggerHaptic]);

  return {
    // Device detection
    isMobile,
    isTouch,
    keyboardVisible,
    viewportHeight,

    // Utilities
    triggerHaptic,
    createTouchHandler,

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

    // Enhanced touch target sizes following WCAG guidelines
    touchTargets: {
      small: isMobile ? '48px' : '40px',
      medium: isMobile ? '56px' : '44px',
      large: isMobile ? '64px' : '52px',
      xlarge: isMobile ? '72px' : '60px',
    },

    // Enhanced gesture handling
    gestureConfig: {
      // Swipe thresholds
      swipeThreshold: 50,
      swipeVelocityThreshold: 0.3,
      // Tap configuration
      tapTimeout: 300,
      doubleTapTimeout: 300,
      // Long press configuration
      longPressTimeout: 500,
      // Touch feedback
      feedbackIntensity: isMobile ? 'medium' : 'light'
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
