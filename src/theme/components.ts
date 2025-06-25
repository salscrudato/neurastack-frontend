/**
 * Enhanced Component Style Overrides
 * Consolidated component styling patterns extracted from inline styles
 */

import { defineStyleConfig } from '@chakra-ui/styled-system';

// Common responsive patterns
const responsivePatterns = {
  mobileFirst: {
    base: { fontSize: 'sm', p: 3 },
    md: { fontSize: 'md', p: 4 },
  },
  touchTargets: {
    base: { minH: '48px', minW: '48px' },
    md: { minH: '44px', minW: '44px' },
  },
  spacing: {
    base: { gap: 3, p: 3 },
    md: { gap: 4, p: 4 },
  }
};

// Enhanced Button component with extracted patterns
export const Button = defineStyleConfig({
  baseStyle: {
    fontWeight: 'semibold',
    borderRadius: 'xl',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    _focus: {
      boxShadow: '0 0 0 3px rgba(79, 156, 249, 0.3)',
      outline: 'none',
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
    // NeuraFit specific variants
    'neurafit-primary': {
      ...responsivePatterns.touchTargets,
      bg: 'linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)',
      color: 'white',
      borderRadius: 'xl',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      _hover: {
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 20px rgba(79, 156, 249, 0.3)',
      },
      _active: {
        transform: 'scale(0.98)',
      },
    },
    'neurafit-secondary': {
      ...responsivePatterns.touchTargets,
      bg: 'transparent',
      border: '2px solid',
      borderColor: 'gray.300',
      color: 'gray.700',
      borderRadius: 'xl',
      _hover: {
        borderColor: 'gray.400',
        bg: 'gray.50',
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
    // Mobile-optimized sizes
    'mobile-sm': {
      h: '48px',
      minW: '48px',
      fontSize: 'sm',
      px: 4,
      borderRadius: 'xl',
    },
    'mobile-lg': {
      h: '64px',
      minW: '64px',
      fontSize: 'lg',
      px: 8,
      borderRadius: 'xl',
    },
  },
});

// Enhanced Input component
export const Input = defineStyleConfig({
  baseStyle: {
    field: {
      borderRadius: '3xl',
      borderWidth: '1px',
      borderColor: 'rgba(203, 213, 225, 0.8)',
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      _focus: {
        borderColor: '#4F9CF9',
        boxShadow: '0 0 0 1px #4F9CF9, 0 16px 40px rgba(79, 156, 249, 0.15)',
        bg: 'rgba(255, 255, 255, 0.98)',
        transform: 'translateY(-1px)',
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
          bg: 'rgba(255, 255, 255, 0.98)',
          borderColor: '#4F9CF9',
          boxShadow: '0 0 0 1px #4F9CF9, 0 16px 40px rgba(79, 156, 249, 0.15)',
        },
      },
    },
    'mobile-optimized': {
      field: {
        fontSize: '16px', // Prevent zoom on iOS
        minH: '48px',
        borderRadius: 'xl',
      },
    },
  },
});

// Enhanced Card component
export const Card = defineStyleConfig({
  baseStyle: {
    container: {
      borderRadius: '2xl',
      bg: 'white',
      border: '1px solid',
      borderColor: 'gray.100',
      boxShadow: 'sm',
      transition: 'all 0.2s',
    },
  },
  variants: {
    glass: {
      container: {
        bg: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
    },
    'neurafit': {
      container: {
        borderRadius: '2xl',
        bg: 'white',
        border: '1px solid',
        borderColor: 'gray.200',
      },
    },
  },
});

// Enhanced Progress component
export const Progress = defineStyleConfig({
  baseStyle: {
    track: {
      bg: '#F1F5F9',
      borderRadius: 'full',
    },
    filledTrack: {
      background: 'linear-gradient(90deg, #4299E1 0%, #667EEA 100%)',
      borderRadius: 'full',
    },
  },
  variants: {
    'neurafit': {
      track: {
        bg: 'gray.100',
      },
      filledTrack: {
        background: 'linear-gradient(90deg, #4299E1 0%, #667EEA 100%)',
      },
    },
  },
});

// Enhanced Badge component
export const Badge = defineStyleConfig({
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
    'neurafit-status': {
      ...responsivePatterns.mobileFirst,
      borderRadius: 'full',
      fontWeight: 'bold',
    },
  },
});

// Enhanced Modal component
export const Modal = defineStyleConfig({
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
});

// Enhanced Textarea component
export const Textarea = defineStyleConfig({
  baseStyle: {
    borderRadius: '3xl',
    borderWidth: '1px',
    borderColor: 'rgba(203, 213, 225, 0.8)',
    bg: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    _focus: {
      borderColor: '#4F9CF9',
      boxShadow: '0 0 0 1px #4F9CF9, 0 16px 40px rgba(79, 156, 249, 0.15)',
      bg: 'rgba(255, 255, 255, 0.98)',
      transform: 'translateY(-1px)',
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
  variants: {
    'mobile-optimized': {
      fontSize: '16px', // Prevent zoom on iOS
      minH: '80px',
      borderRadius: 'xl',
      resize: 'vertical',
    },
  },
});

// Export all components
export const components = {
  Button,
  Input,
  Card,
  Progress,
  Badge,
  Modal,
  Textarea,
};
