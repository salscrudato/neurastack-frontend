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

// Component style overrides for consistency
export const componentStyles = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'lg',
      transition: 'all 150ms ease',
      _focus: {
        boxShadow: '0 0 0 3px rgba(79, 156, 249, 0.3)',
      },
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        _active: {
          bg: 'brand.700',
          transform: 'translateY(0)',
        },
      },
      outline: {
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
          transform: 'translateY(-1px)',
        },
      },
      ghost: {
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
        },
      },
    },
    sizes: {
      sm: {
        h: '32px',
        minW: '32px',
        fontSize: 'sm',
        px: 3,
      },
      md: {
        h: '40px',
        minW: '40px',
        fontSize: 'md',
        px: 4,
      },
      lg: {
        h: '48px',
        minW: '48px',
        fontSize: 'lg',
        px: 6,
      },
    },
  },

  Input: {
    baseStyle: {
      field: {
        borderRadius: 'lg',
        transition: 'all 150ms ease',
        _focus: {
          borderColor: 'brand.500',
          boxShadow: '0 0 0 1px rgba(79, 156, 249, 0.3)',
        },
      },
    },
  },

  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl',
        boxShadow: 'sm',
        transition: 'all 150ms ease',
        _hover: {
          boxShadow: 'md',
          transform: 'translateY(-1px)',
        },
      },
    },
  },

  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'xl',
        boxShadow: '2xl',
      },
      overlay: {
        backdropFilter: 'blur(4px)',
      },
    },
  },

  Tooltip: {
    baseStyle: {
      borderRadius: 'md',
      fontSize: 'sm',
      px: 3,
      py: 2,
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

// Responsive breakpoints
export const breakpoints = {
  sm: '30em',    // 480px
  md: '48em',    // 768px
  lg: '62em',    // 992px
  xl: '80em',    // 1280px
  '2xl': '96em', // 1536px
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
