/**
 * Modern Button Component
 * 
 * Enhanced button component with modern blue styling, smooth animations,
 * and improved accessibility features following the new design system.
 */

import {
    Button as ChakraButton,
    type ButtonProps as ChakraButtonProps,
    forwardRef,
} from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';

// ============================================================================
// Types
// ============================================================================

export interface ModernButtonProps extends Omit<ChakraButtonProps, 'variant'> {
  /** Button variant */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Button color scheme */
  colorScheme?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'teal';
  
  /** Enable glow effect */
  glowEffect?: boolean;
  
  /** Custom icon */
  icon?: ReactNode;
  
  /** Icon position */
  iconPosition?: 'left' | 'right';
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Disable animations */
  disableAnimations?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const ModernButton = forwardRef<ModernButtonProps, 'button'>(({
  variant = 'solid',
  size = 'md',
  colorScheme = 'teal',  // Default to teal for Grok aesthetic
  glowEffect = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disableAnimations = false,
  children,
  ...props
}, ref) => {
  const { config, capabilities } = useOptimizedDevice();
  
  // Determine if animations should be disabled
  const shouldDisableAnimations = disableAnimations || config.shouldReduceAnimations;
  
  // Color scheme configurations
  const colorSchemes = {
    primary: {
      solid: {
        bg: '#3b82f6',
        color: 'white',
        _hover: {
          bg: '#2563eb',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
          boxShadow: glowEffect 
            ? '0 8px 20px rgba(59, 130, 246, 0.35), 0 4px 12px rgba(0, 0, 0, 0.1)'
            : '0 6px 16px rgba(59, 130, 246, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: '#1d4ed8',
        },
        boxShadow: glowEffect 
          ? '0 4px 12px rgba(59, 130, 246, 0.25), 0 0 20px rgba(59, 130, 246, 0.15)'
          : '0 4px 12px rgba(59, 130, 246, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)',
      },
      outline: {
        bg: 'transparent',
        color: '#3b82f6',
        border: '2px solid #3b82f6',
        _hover: {
          bg: 'rgba(59, 130, 246, 0.05)',
          borderColor: '#2563eb',
          color: '#2563eb',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: 'rgba(59, 130, 246, 0.1)',
        },
      },
      ghost: {
        bg: 'transparent',
        color: '#3b82f6',
        _hover: {
          bg: 'rgba(59, 130, 246, 0.08)',
          color: '#2563eb',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: 'rgba(59, 130, 246, 0.12)',
        },
      },
    },
    secondary: {
      solid: {
        bg: '#0ea5e9',
        color: 'white',
        _hover: {
          bg: '#0284c7',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
          boxShadow: '0 6px 16px rgba(14, 165, 233, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: '#0369a1',
        },
        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)',
      },
      outline: {
        bg: 'transparent',
        color: '#0ea5e9',
        border: '2px solid #0ea5e9',
        _hover: {
          bg: 'rgba(14, 165, 233, 0.05)',
          borderColor: '#0284c7',
          color: '#0284c7',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
        },
      },
      ghost: {
        bg: 'transparent',
        color: '#0ea5e9',
        _hover: {
          bg: 'rgba(14, 165, 233, 0.08)',
          color: '#0284c7',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
        },
      },
    },
    success: {
      solid: {
        bg: '#10b981',
        color: 'white',
        _hover: {
          bg: '#059669',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
          boxShadow: '0 6px 16px rgba(16, 185, 129, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: '#047857',
        },
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)',
      },
    },
    error: {
      solid: {
        bg: '#dc2626',
        color: 'white',
        _hover: {
          bg: '#b91c1c',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
          boxShadow: '0 6px 16px rgba(220, 38, 38, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: '#991b1b',
        },
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)',
      },
    },
    warning: {
      solid: {
        bg: '#f59e0b',
        color: 'white',
        _hover: {
          bg: '#d97706',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
          boxShadow: '0 6px 16px rgba(245, 158, 11, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: '#b45309',
        },
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)',
      },
    },
    teal: {
      solid: {
        bg: '#00C4B4',
        color: 'white',
        _hover: {
          bg: '#00A89A',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
          boxShadow: glowEffect
            ? '0 8px 20px rgba(0, 196, 180, 0.35), 0 4px 12px rgba(0, 0, 0, 0.1)'
            : '0 6px 16px rgba(0, 196, 180, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: '#008C80',
        },
        boxShadow: glowEffect
          ? '0 4px 12px rgba(0, 196, 180, 0.25), 0 0 20px rgba(0, 196, 180, 0.15)'
          : '0 4px 12px rgba(0, 196, 180, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)',
      },
      outline: {
        bg: 'transparent',
        color: '#00C4B4',
        border: '2px solid #00C4B4',
        _hover: {
          bg: 'rgba(0, 196, 180, 0.05)',
          borderColor: '#00A89A',
          color: '#00A89A',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 196, 180, 0.15)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: 'rgba(0, 196, 180, 0.1)',
        },
      },
      ghost: {
        bg: 'transparent',
        color: '#00C4B4',
        _hover: {
          bg: 'rgba(0, 196, 180, 0.08)',
          color: '#00A89A',
          transform: shouldDisableAnimations ? 'none' : 'translateY(-1px)',
        },
        _active: {
          transform: shouldDisableAnimations ? 'none' : 'translateY(0)',
          bg: 'rgba(0, 196, 180, 0.12)',
        },
      },
    },
  };
  
  // Size configurations
  const sizeConfig = {
    xs: {
      h: '28px',
      minW: '28px',
      fontSize: 'xs',
      px: 2,
      borderRadius: '8px',
    },
    sm: {
      h: capabilities.isMobile ? '40px' : '36px',
      minW: capabilities.isMobile ? '40px' : '36px',
      fontSize: 'sm',
      px: 3,
      borderRadius: '10px',
    },
    md: {
      h: capabilities.isMobile ? '48px' : '44px',
      minW: capabilities.isMobile ? '48px' : '44px',
      fontSize: 'md',
      px: 4,
      borderRadius: '12px',
    },
    lg: {
      h: capabilities.isMobile ? '56px' : '52px',
      minW: capabilities.isMobile ? '56px' : '52px',
      fontSize: 'lg',
      px: 6,
      borderRadius: '14px',
    },
    xl: {
      h: capabilities.isMobile ? '64px' : '60px',
      minW: capabilities.isMobile ? '64px' : '60px',
      fontSize: 'xl',
      px: 8,
      borderRadius: '16px',
    },
  };
  
  // Get styles for current variant and color scheme
  const schemeStyles = colorSchemes[colorScheme] || colorSchemes.primary;
  const currentStyles = (schemeStyles as any)[variant] || schemeStyles.solid;
  const currentSizeConfig = sizeConfig[size];
  
  return (
    <ChakraButton
      ref={ref}
      w={fullWidth ? 'full' : 'auto'}
      fontWeight="600"
      letterSpacing="-0.01em"
      transition={shouldDisableAnimations ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'}
      leftIcon={icon && iconPosition === 'left' ? icon : undefined}
      rightIcon={icon && iconPosition === 'right' ? icon : undefined}
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        willChange: shouldDisableAnimations ? 'auto' : 'transform, box-shadow',
        _disabled: {
          opacity: 0.5,
          cursor: 'not-allowed',
          transform: 'none !important',
          boxShadow: 'none !important',
        },
      }}
      {...currentSizeConfig}
      {...currentStyles}
      {...props}
    >
      {children}
    </ChakraButton>
  );
});

ModernButton.displayName = 'ModernButton';

// ============================================================================
// Export
// ============================================================================

export default ModernButton;
