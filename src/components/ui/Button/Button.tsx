/**
 * Unified Button Component
 * 
 * Reusable button component with consistent styling, touch optimization,
 * and accessibility features. Supports multiple variants and sizes.
 */

import {
    Button as ChakraButton,
    type ButtonProps as ChakraButtonProps,
    forwardRef,
    Spinner,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { type ReactElement, type ReactNode } from 'react';
import { APP_CONFIG } from '../../../config/app';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';

// ============================================================================
// Types
// ============================================================================

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant' | 'size'> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
  
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Loading text */
  loadingText?: string;
  
  /** Custom loading spinner */
  loadingSpinner?: ReactNode;
  
  /** Icon before text */
  leftIcon?: ReactElement;

  /** Icon after text */
  rightIcon?: ReactElement;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Enable haptic feedback on touch */
  enableHaptics?: boolean;
  
  /** Disable animations */
  disableAnimations?: boolean;
  
  /** Glass morphism effect */
  glassEffect?: boolean;
}

// ============================================================================
// Style Configurations
// ============================================================================

const getVariantStyles = (variant: ButtonProps['variant'], glassEffect: boolean) => {
  const baseGlass = glassEffect ? {
    backdropFilter: APP_CONFIG.THEME.GLASS.BACKDROP_FILTER,
    WebkitBackdropFilter: APP_CONFIG.THEME.GLASS.WEBKIT_BACKDROP_FILTER,
    border: APP_CONFIG.THEME.GLASS.BORDER,
  } : {};

  switch (variant) {
    case 'primary':
      return {
        bg: glassEffect
          ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(29, 78, 216, 0.85) 100%)'
          : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        color: 'white',
        fontWeight: '600',
        _hover: {
          bg: glassEffect
            ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(29, 78, 216, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(29, 78, 216, 0.85) 100%)',
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(37, 99, 235, 0.3), 0 6px 20px rgba(0, 0, 0, 0.1)',
        },
        _active: {
          bg: glassEffect
            ? 'linear-gradient(135deg, rgba(37, 99, 235, 1) 0%, rgba(29, 78, 216, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(37, 99, 235, 1) 0%, rgba(29, 78, 216, 0.95) 100%)',
          transform: 'translateY(0)',
        },
        ...baseGlass,
      };

    case 'secondary':
      return {
        bg: glassEffect
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(168, 85, 247, 0.85) 100%)'
          : 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
        color: 'white',
        fontWeight: '600',
        _hover: {
          bg: glassEffect
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(168, 85, 247, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(168, 85, 247, 0.85) 100%)',
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(139, 92, 246, 0.3), 0 6px 20px rgba(0, 0, 0, 0.1)',
        },
        _active: {
          bg: glassEffect
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 1) 0%, rgba(168, 85, 247, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 1) 0%, rgba(168, 85, 247, 0.95) 100%)',
          transform: 'translateY(0)',
        },
        ...baseGlass,
      };

    case 'ghost':
      return {
        bg: 'transparent',
        color: APP_CONFIG.THEME.COLORS.TEXT_PRIMARY,
        fontWeight: '600',
        _hover: {
          bg: glassEffect
            ? 'linear-gradient(135deg, rgba(79, 156, 249, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)'
            : 'linear-gradient(135deg, rgba(79, 156, 249, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(79, 156, 249, 0.1)',
        },
        _active: {
          bg: glassEffect
            ? 'linear-gradient(135deg, rgba(79, 156, 249, 0.12) 0%, rgba(139, 92, 246, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(79, 156, 249, 0.15) 0%, rgba(139, 92, 246, 0.12) 100%)',
          transform: 'translateY(0)',
        },
        ...baseGlass,
      };

    case 'outline':
      return {
        bg: 'transparent',
        color: APP_CONFIG.THEME.COLORS.ACCENT,
        border: `2px solid transparent`,
        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box',
        fontWeight: '600',
        _hover: {
          bg: 'linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)',
          color: 'white',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(79, 156, 249, 0.25)',
        },
        _active: {
          transform: 'translateY(0)',
        },
        ...baseGlass,
      };

    case 'danger':
      return {
        bg: glassEffect 
          ? 'rgba(239, 68, 68, 0.9)' 
          : APP_CONFIG.THEME.COLORS.ERROR,
        color: 'white',
        _hover: {
          bg: glassEffect 
            ? 'rgba(239, 68, 68, 0.95)' 
            : 'rgba(239, 68, 68, 0.9)',
          transform: 'translateY(-1px)',
        },
        _active: {
          bg: glassEffect 
            ? 'rgba(239, 68, 68, 1)' 
            : 'rgba(239, 68, 68, 1)',
          transform: 'translateY(0)',
        },
        ...baseGlass,
      };

    case 'success':
      return {
        bg: glassEffect 
          ? 'rgba(16, 185, 129, 0.9)' 
          : APP_CONFIG.THEME.COLORS.SUCCESS,
        color: 'white',
        _hover: {
          bg: glassEffect 
            ? 'rgba(16, 185, 129, 0.95)' 
            : 'rgba(16, 185, 129, 0.9)',
          transform: 'translateY(-1px)',
        },
        _active: {
          bg: glassEffect 
            ? 'rgba(16, 185, 129, 1)' 
            : 'rgba(16, 185, 129, 1)',
          transform: 'translateY(0)',
        },
        ...baseGlass,
      };

    default:
      return {};
  }
};

const getSizeStyles = (size: ButtonProps['size'], isMobile: boolean) => {
  const mobileMultiplier = isMobile ? 1.2 : 1;
  
  switch (size) {
    case 'sm':
      return {
        h: `${32 * mobileMultiplier}px`,
        minW: `${32 * mobileMultiplier}px`,
        fontSize: 'sm',
        px: 3,
        borderRadius: '0.75rem',
      };
    case 'md':
      return {
        h: `${40 * mobileMultiplier}px`,
        minW: `${40 * mobileMultiplier}px`,
        fontSize: 'md',
        px: 4,
        borderRadius: '1rem',
      };
    case 'lg':
      return {
        h: `${48 * mobileMultiplier}px`,
        minW: `${48 * mobileMultiplier}px`,
        fontSize: 'lg',
        px: 6,
        borderRadius: '1.25rem',
      };
    case 'xl':
      return {
        h: `${56 * mobileMultiplier}px`,
        minW: `${56 * mobileMultiplier}px`,
        fontSize: 'xl',
        px: 8,
        borderRadius: '1.5rem',
      };
    default:
      return {};
  }
};

// ============================================================================
// Component
// ============================================================================

export const Button = forwardRef<ButtonProps, 'button'>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  loadingSpinner,
  leftIcon,
  rightIcon,
  fullWidth = false,
  enableHaptics = true,
  disableAnimations = false,
  glassEffect = false,
  children,
  onClick,
  ...props
}, ref) => {
  const { capabilities, config, triggerHaptic } = useOptimizedDevice();
  
  // Determine if animations should be disabled
  const shouldDisableAnimations = disableAnimations || config.shouldReduceAnimations;
  
  // Handle click with haptic feedback
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (enableHaptics && config.shouldEnableHaptics) {
      triggerHaptic('TAP');
    }
    onClick?.(event);
  };

  // Get styles
  const variantStyles = getVariantStyles(variant, glassEffect);
  const sizeStyles = getSizeStyles(size, capabilities.isMobile);

  // Animation component
  const MotionButton = shouldDisableAnimations ? ChakraButton : motion(ChakraButton);

  return (
    <MotionButton
      ref={ref}
      onClick={handleClick}
      isLoading={isLoading}
      loadingText={loadingText}
      spinner={loadingSpinner as ReactElement || <Spinner size="sm" />}
      leftIcon={leftIcon as ReactElement}
      rightIcon={rightIcon as ReactElement}
      w={fullWidth ? '100%' : 'auto'}
      fontWeight="600"
      _focus={{
        outline: '2px solid',
        outlineColor: APP_CONFIG.THEME.COLORS.ACCENT,
        outlineOffset: '2px',
      }}
      _disabled={{
        opacity: 0.6,
        cursor: 'not-allowed',
        transform: 'none',
      }}
      // Touch optimizations
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        // Performance optimizations
        contain: 'layout style paint',
        willChange: shouldDisableAnimations ? 'auto' : 'transform',
      }}
      // Animation props (only if animations enabled)
      {...(!shouldDisableAnimations && {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      })}
      // Apply styles
      {...variantStyles}
      {...sizeStyles}
      {...props}
    >
      {children}
    </MotionButton>
  );
});

Button.displayName = 'Button';

// ============================================================================
// Export
// ============================================================================

export default Button;
