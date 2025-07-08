import type { ButtonProps } from '@chakra-ui/react';
import { Button, forwardRef } from '@chakra-ui/react';
import type { MotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface OptimizedTouchButtonProps extends Omit<ButtonProps, 'transition'> {
  /** Enhanced haptic feedback type */
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  /** Enable optimized touch interactions */
  optimizeTouch?: boolean;
  /** Custom motion props for animations */
  motionProps?: MotionProps;
  /** Disable animations for performance */
  disableAnimations?: boolean;
}

/**
 * Optimized touch button with enhanced mobile interactions
 * Features:
 * - Adaptive touch target sizing
 * - Haptic feedback integration
 * - Performance-optimized animations
 * - Accessibility enhancements
 * - Mobile-first responsive design
 */
export const OptimizedTouchButton = forwardRef<OptimizedTouchButtonProps, 'button'>(
  (
    {
      hapticType = 'light',
      optimizeTouch = true,
      motionProps,
      disableAnimations = false,
      onClick,
      children,
      size = 'md',
      variant = 'solid',
      ...props
    },
    ref
  ) => {
    const {
      isMobile,
      triggerHaptic,
      touchConfig,
      touchTargets,
      performanceConfig,
    } = useMobileOptimization();

    // Enhanced click handler with haptic feedback
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (optimizeTouch && isMobile) {
          triggerHaptic(hapticType);
        }
        onClick?.(event);
      },
      [onClick, optimizeTouch, isMobile, triggerHaptic, hapticType]
    );

    // Responsive size mapping for optimal touch targets
    const responsiveSize = useMemo(() => {
      if (!isMobile) return size;
      
      const sizeMap = {
        xs: 'sm',
        sm: 'md',
        md: 'lg',
        lg: 'lg',
        xl: 'xl',
      } as const;
      
      return sizeMap[size as keyof typeof sizeMap] || size;
    }, [size, isMobile]);

    // Enhanced button styles for mobile optimization
    const mobileStyles = useMemo(() => ({
      minH: touchTargets.medium,
      minW: touchTargets.medium,
      touchAction: touchConfig.touchAction,
      WebkitTapHighlightColor: touchConfig.tapHighlight,
      userSelect: touchConfig.userSelect,
      // Performance optimizations
      ...performanceConfig,
      // Enhanced focus styles for accessibility
      _focus: {
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(79, 156, 249, 0.3)',
        transform: 'scale(1.02)',
      },
      _active: {
        transform: 'scale(0.98)',
      },
      // Smooth transitions
      transition: disableAnimations ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    }), [touchTargets, touchConfig, performanceConfig, disableAnimations]);

    // Motion configuration for enhanced animations
    const defaultMotionProps: MotionProps = useMemo(() => ({
      whileTap: disableAnimations ? undefined : { scale: 0.95 },
      whileHover: disableAnimations ? undefined : { scale: 1.02 },
      transition: disableAnimations ? undefined : {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
      ...motionProps,
    }), [disableAnimations, motionProps]);

    // Enhanced variant styles for better visual feedback
    const enhancedVariants = useMemo(() => {
      const baseVariants = {
        solid: {
          bg: 'linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, #3B82F6 0%, #5B21B6 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 20px rgba(79, 156, 249, 0.35)',
          },
        },
        ghost: {
          bg: 'rgba(79, 156, 249, 0.1)',
          color: '#4F9CF9',
          border: '1px solid rgba(79, 156, 249, 0.2)',
          _hover: {
            bg: 'rgba(79, 156, 249, 0.15)',
            borderColor: 'rgba(79, 156, 249, 0.3)',
          },
        },
        outline: {
          bg: 'transparent',
          color: '#4F9CF9',
          border: '2px solid #4F9CF9',
          _hover: {
            bg: 'rgba(79, 156, 249, 0.1)',
          },
        },
      };

      return baseVariants[variant as keyof typeof baseVariants] || baseVariants.solid;
    }, [variant]);

    const MotionButton = motion(Button);

    return (
      <MotionButton
        ref={ref}
        size={responsiveSize}
        variant="unstyled" // Use custom styles
        onClick={handleClick}
        sx={{
          ...mobileStyles,
          ...enhancedVariants,
        }}
        {...defaultMotionProps}
        {...props}
      >
        {children}
      </MotionButton>
    );
  }
);

OptimizedTouchButton.displayName = 'OptimizedTouchButton';

export default OptimizedTouchButton;
