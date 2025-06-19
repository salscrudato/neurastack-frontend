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

  // Detect mobile device and touch capability
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    window.innerWidth <= 768;
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(mobile);
      setIsTouch(touch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // Enhanced haptic feedback utility with workout-specific patterns
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

  // Workout-specific mobile optimizations
  const workoutConfig = useMemo(() => ({
    // Prevent screen sleep during workouts
    preventSleep: () => {
      if ('wakeLock' in navigator) {
        return (navigator as any).wakeLock.request('screen');
      }
      return Promise.resolve(null);
    },

    // Enhanced timer display for mobile
    timerStyles: {
      fontSize: isMobile ? '3rem' : '2rem',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      padding: isMobile ? '1.5rem' : '1rem',
      userSelect: 'none' as const,
    },

    // Exercise card optimizations
    exerciseCardStyles: {
      padding: isMobile ? '1rem' : '0.75rem',
      borderRadius: isMobile ? '1rem' : '0.5rem',
      minHeight: isMobile ? '120px' : '100px',
      touchAction: 'manipulation' as const,
    },

    // Button optimizations for workout controls
    workoutButtonStyles: {
      minHeight: isMobile ? '64px' : '48px',
      fontSize: isMobile ? '1.125rem' : '1rem',
      fontWeight: '600',
      borderRadius: isMobile ? '0.75rem' : '0.5rem',
      touchAction: 'manipulation' as const,
      WebkitTapHighlightColor: 'transparent',
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
    workoutConfig,

    // Responsive values
    spacing: {
      xs: isMobile ? 2 : 3,
      sm: isMobile ? 3 : 4,
      md: isMobile ? 4 : 5,
    },

    // Touch target sizes
    touchTargets: {
      small: isMobile ? '44px' : '40px',
      medium: isMobile ? '48px' : '44px',
      large: isMobile ? '56px' : '52px',
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
