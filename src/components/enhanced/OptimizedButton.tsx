import { Button, forwardRef } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import { memo } from 'react';
import { useOptimizedCallback } from '../../utils/performanceOptimizer';
import useEnhancedMobileOptimization from '../../hooks/useEnhancedMobileOptimization';

interface OptimizedButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
  optimizeForMobile?: boolean;
  trackPerformance?: boolean;
  debounceMs?: number;
}

/**
 * Enhanced Button component with mobile optimizations, haptic feedback,
 * and performance tracking
 */
export const OptimizedButton = memo(
  forwardRef<OptimizedButtonProps, 'button'>((props, ref) => {
    const {
      hapticFeedback = true,
      optimizeForMobile = true,
      trackPerformance = false,
      debounceMs = 0,
      onClick,
      children,
      ...buttonProps
    } = props;

    const {
      isMobile,
      triggerHaptic,
      touchConfig,
      animationConfig,
      shouldOptimizeForPerformance,
    } = useEnhancedMobileOptimization();

    // Optimized click handler with haptic feedback and debouncing
    const handleClick = useOptimizedCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        // Trigger haptic feedback on mobile
        if (hapticFeedback && isMobile) {
          triggerHaptic('light');
        }

        // Performance tracking
        if (trackPerformance && import.meta.env.DEV) {
          const start = performance.now();
          onClick?.(event);
          const end = performance.now();
          
          if (end - start > 16) {
            console.warn(`Button click handler took ${(end - start).toFixed(2)}ms`);
          }
        } else {
          onClick?.(event);
        }
      },
      [onClick, hapticFeedback, isMobile, triggerHaptic, trackPerformance],
      { debugName: 'OptimizedButton.onClick' }
    );

    // Debounced click handler if debouncing is enabled
    const debouncedClick = useOptimizedCallback(
      debounceMs > 0
        ? (() => {
            let timeoutId: NodeJS.Timeout;
            return (event: React.MouseEvent<HTMLButtonElement>) => {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => handleClick(event), debounceMs);
            };
          })()
        : handleClick,
      [handleClick, debounceMs],
      { debugName: 'OptimizedButton.debouncedClick' }
    );

    // Mobile-optimized styles
    const mobileStyles = optimizeForMobile && isMobile ? {
      minH: '48px',
      minW: '48px',
      fontSize: 'md',
      px: 4,
      py: 3,
      ...touchConfig,
    } : {};

    // Performance-optimized styles
    const performanceStyles = shouldOptimizeForPerformance ? {
      willChange: 'auto',
      transform: 'none',
      transition: 'none',
    } : {
      willChange: 'transform, background-color, border-color, color, fill, stroke, opacity, box-shadow',
      transition: `all ${animationConfig.duration}ms ${animationConfig.easing}`,
      _hover: {
        transform: animationConfig.shouldAnimate ? 'translateY(-1px)' : 'none',
      },
      _active: {
        transform: animationConfig.shouldAnimate ? 'translateY(0)' : 'none',
      },
    };

    return (
      <Button
        ref={ref}
        onClick={debouncedClick}
        {...mobileStyles}
        {...performanceStyles}
        {...buttonProps}
        // Enhanced accessibility
        role="button"
        tabIndex={buttonProps.disabled ? -1 : 0}
        aria-disabled={buttonProps.disabled}
        // Performance optimizations
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          ...buttonProps.style,
        }}
      >
        {children}
      </Button>
    );
  })
);

OptimizedButton.displayName = 'OptimizedButton';

export default OptimizedButton;
