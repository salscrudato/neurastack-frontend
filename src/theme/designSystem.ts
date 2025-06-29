import { extendTheme } from '@chakra-ui/react';

// Design tokens for consistent spacing, typography, and colors
export const designTokens = {
  // Spacing scale (based on 4px grid)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  // Typography scale
  typography: {
    fontSizes: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      md: '1rem',      // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Color palette with semantic meanings
  colors: {
    // Brand colors
    brand: {
      50: '#EBF8FF',
      100: '#BEE3F8',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#4299E1',
      500: '#4F9CF9',  // Primary brand blue
      600: '#3182CE',
      700: '#2B77CB',
      800: '#2C5282',
      900: '#2A4365',
    },
    
    // Secondary brand (purple)
    secondary: {
      50: '#FAF5FF',
      100: '#E9D8FD',
      200: '#D6BCFA',
      300: '#B794F6',
      400: '#9F7AEA',
      500: '#8B5CF6',  // Secondary brand purple
      600: '#805AD5',
      700: '#6B46C1',
      800: '#553C9A',
      900: '#44337A',
    },

    // Semantic colors
    success: {
      50: '#F0FFF4',
      500: '#38A169',
      600: '#2F855A',
    },
    warning: {
      50: '#FFFBEB',
      500: '#D69E2E',
      600: '#B7791F',
    },
    error: {
      50: '#FED7D7',
      500: '#E53E3E',
      600: '#C53030',
    },
    info: {
      50: '#EBF8FF',
      500: '#3182CE',
      600: '#2B77CB',
    },
  },

  // Border radius scale
  radii: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadow scale
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Animation durations
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
};

// Modern component style overrides
export const componentStyles = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'xl',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      _focus: {
        outline: 'none',
        boxShadow: 'none',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    variants: {
      solid: {
        background: 'linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(79, 156, 249, 0.25)',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 20px rgba(79, 156, 249, 0.35)',
          _disabled: {
            transform: 'none',
            boxShadow: '0 4px 12px rgba(79, 156, 249, 0.25)',
          },
        },
        _active: {
          transform: 'translateY(0)',
          boxShadow: '0 2px 8px rgba(79, 156, 249, 0.3)',
        },
      },
      outline: {
        borderColor: '#4F9CF9',
        borderWidth: '2px',
        color: '#4F9CF9',
        bg: 'transparent',
        _hover: {
          bg: 'rgba(79, 156, 249, 0.05)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(79, 156, 249, 0.15)',
        },
      },
      ghost: {
        color: '#4F9CF9',
        bg: 'transparent',
        _hover: {
          bg: 'rgba(79, 156, 249, 0.08)',
          transform: 'translateY(-1px)',
        },
      },
      glass: {
        bg: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#1E293B',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.9)',
          transform: 'translateY(-1px)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
        },
      },
    },
    sizes: {
      sm: {
        h: '36px',
        minW: '36px',
        fontSize: 'sm',
        px: 4,
        borderRadius: 'lg',
      },
      md: {
        h: '44px',
        minW: '44px',
        fontSize: 'md',
        px: 6,
        borderRadius: 'xl',
      },
      lg: {
        h: '52px',
        minW: '52px',
        fontSize: 'lg',
        px: 8,
        borderRadius: 'xl',
      },
    },
  },

  Input: {
    baseStyle: {
      field: {
        borderRadius: '3xl', // More rounded for elegant design
        borderWidth: '1px',
        borderColor: 'rgba(203, 213, 225, 0.8)',
        bg: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        _focus: {
          outline: 'none',
          boxShadow: 'none',
        },
        _hover: {
          borderColor: '#94A3B8',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          transform: 'translateY(-1px)',
        },
        _placeholder: {
          color: '#94A3B8',
        },
      },
    },
    variants: {
      glass: {
        field: {
          bg: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '3xl',
          _focus: {
            outline: 'none',
            boxShadow: 'none',
          },
        },
      },
    },
  },

  Textarea: {
    baseStyle: {
      borderRadius: '3xl', // Elegant rounded design
      borderWidth: '1px',
      borderColor: 'rgba(203, 213, 225, 0.8)',
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      _focus: {
        outline: 'none',
        boxShadow: 'none',
      },
      _hover: {
        borderColor: '#94A3B8',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-1px)',
      },
      _placeholder: {
        color: '#94A3B8',
      },
    },
  },

  Card: {
    baseStyle: {
      container: {
        borderRadius: '2xl',
        bg: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        _hover: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)',
        },
      },
    },
    variants: {
      glass: {
        container: {
          bg: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
          },
        },
      },
    },
  },

  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: '2xl',
        bg: '#FFFFFF',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #F1F5F9',
      },
      overlay: {
        bg: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
      },
      closeButton: {
        borderRadius: 'full',
        _hover: {
          bg: 'rgba(79, 156, 249, 0.1)',
        },
      },
    },
  },

  Tooltip: {
    baseStyle: {
      borderRadius: 'lg',
      fontSize: 'sm',
      px: 3,
      py: 2,
      bg: '#1E293B',
      color: '#FFFFFF',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
  },

  Badge: {
    baseStyle: {
      borderRadius: 'full',
      fontWeight: 'semibold',
      fontSize: 'xs',
      px: 3,
      py: 1,
    },
    variants: {
      glass: {
        bg: 'rgba(255, 255, 255, 0.8)',
        color: '#1E293B',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
    },
  },
};

// Micro-interaction animations
export const animations = {
  // Fade in animation
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 },
  },

  // Slide up animation
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 },
  },

  // Scale animation
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15 },
  },

  // Bounce animation for success states
  bounce: {
    animate: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 },
    },
  },

  // Shake animation for error states
  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  },
};

// Loading state configurations
export const loadingStates = {
  spinner: {
    size: 'md',
    color: 'brand.500',
    thickness: '3px',
  },
  skeleton: {
    startColor: 'gray.100',
    endColor: 'gray.300',
    borderRadius: 'md',
  },
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
};

// Enhanced responsive breakpoints with mobile-first approach
export const breakpoints = {
  xs: '20em',    // 320px - Small phones
  sm: '30em',    // 480px - Large phones
  md: '48em',    // 768px - Tablets
  lg: '62em',    // 992px - Small laptops
  xl: '80em',    // 1280px - Desktops
  '2xl': '96em', // 1536px - Large screens
};

// Mobile-specific responsive patterns
export const mobilePatterns = {
  // Touch target sizes
  touchTargets: {
    small: { base: '44px', md: '40px' },
    medium: { base: '48px', md: '44px' },
    large: { base: '56px', md: '48px' },
    xlarge: { base: '64px', md: '52px' },
  },

  // Typography scaling
  typography: {
    xs: { base: '12px', md: '11px' },
    sm: { base: '14px', md: '13px' },
    md: { base: '16px', md: '14px' },
    lg: { base: '18px', md: '16px' },
    xl: { base: '20px', md: '18px' },
    '2xl': { base: '24px', md: '20px' },
    '3xl': { base: '30px', md: '24px' },
  },

  // Spacing adjustments
  spacing: {
    xs: { base: 2, md: 1 },
    sm: { base: 3, md: 2 },
    md: { base: 4, md: 3 },
    lg: { base: 6, md: 4 },
    xl: { base: 8, md: 6 },
  },

  // Container padding
  containerPadding: {
    base: { px: 4, py: 3 },
    sm: { px: 6, py: 4 },
    md: { px: 8, py: 6 },
    lg: { px: 12, py: 8 },
  },
};

// Export complete design system theme
export const designSystemTheme = extendTheme({
  colors: designTokens.colors,
  fontSizes: designTokens.typography.fontSizes,
  fontWeights: designTokens.typography.fontWeights,
  lineHeights: designTokens.typography.lineHeights,
  space: designTokens.spacing,
  radii: designTokens.radii,
  shadows: designTokens.shadows,
  breakpoints,
  components: componentStyles,
});
