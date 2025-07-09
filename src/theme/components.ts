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

// Enhanced Box component to remove focus outlines
export const Box = defineStyleConfig({
  baseStyle: {
    _focus: {
      outline: 'none',
      boxShadow: 'none',
    },
    _focusVisible: {
      outline: 'none',
      boxShadow: 'none',
    },
  },
});

// Enhanced Button component with modern design (aligned with Tailwind)
export const Button = defineStyleConfig({
  baseStyle: {
    fontWeight: '500',
    borderRadius: '1rem', // 16px - modern rounded corners
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    _focus: {
      outline: 'none',
      boxShadow: 'none',
    },
    _disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    // Enhanced touch targets for mobile
    minH: { base: '48px', md: '44px' },
    px: { base: 6, md: 4 },
  },
  variants: {
    solid: {
      background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
      color: 'white',
      boxShadow: 'var(--shadow-modern)',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-modern-lg)',
        _disabled: {
          transform: 'none',
          boxShadow: 'var(--shadow-modern)',
        },
      },
      _active: {
        transform: 'translateY(0)',
        boxShadow: '0 2px 8px rgba(79, 156, 249, 0.3)',
      },
    },
    outline: {
      borderColor: 'var(--color-primary-500)',
      borderWidth: '2px',
      color: 'var(--color-primary-600)',
      bg: 'transparent',
      _hover: {
        bg: 'var(--color-primary-50)',
        transform: 'translateY(-1px)',
        boxShadow: 'var(--shadow-modern)',
        borderColor: 'var(--color-primary-600)',
      },
    },
    ghost: {
      color: 'var(--color-accent)',
      bg: 'transparent',
      _hover: {
        bg: 'var(--color-accent-50)',
        transform: 'translateY(-1px)',
      },
    },
    glass: {
      bg: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#1E293B',
      _hover: {
        bg: 'rgba(255, 255, 255, 0.9)',
        transform: 'translateY(-1px)',
        boxShadow: 'var(--shadow-glass)',
      },
    },
    // NeuraFit specific variants
    'neurafit-primary': {
      ...responsivePatterns.touchTargets,
      bg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      color: 'white',
      borderRadius: 'xl',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      _hover: {
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
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
      borderRadius: '1.5rem', // 24px - modern rounded corners
      borderWidth: '1px',
      borderColor: 'rgba(226, 232, 240, 0.8)',
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: { base: '16px', md: '14px' }, // Prevent zoom on iOS
      minH: { base: '48px', md: '44px' }, // Touch-friendly
      _focus: {
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(79, 156, 249, 0.1)',
        borderColor: 'var(--color-primary-300)',
      },
      _hover: {
        borderColor: '#94A3B8',
        boxShadow: 'var(--shadow-modern)',
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
    'mobile-optimized': {
      field: {
        fontSize: '16px', // Prevent zoom on iOS
        minH: '48px',
        borderRadius: 'xl',
      },
    },
  },
});

// Enhanced Card component with modern design
export const Card = defineStyleConfig({
  baseStyle: {
    container: {
      borderRadius: '1.5rem', // 24px - modern rounded corners
      bg: 'white',
      border: '1px solid',
      borderColor: 'var(--color-border-medium)',
      boxShadow: 'var(--shadow-modern)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  variants: {
    glass: {
      container: {
        bg: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'var(--shadow-glass)',
      },
    },
    'neurafit': {
      container: {
        borderRadius: '1.5rem',
        bg: 'white',
        border: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        boxShadow: 'var(--shadow-modern)',
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

// Enhanced Modal component with modern design
export const Modal = defineStyleConfig({
  baseStyle: {
    dialog: {
      borderRadius: '1.5rem', // 24px - modern rounded corners
      bg: '#FFFFFF',
      boxShadow: 'var(--shadow-modern-xl)',
      border: '1px solid rgba(226, 232, 240, 0.6)',
      maxH: '90vh',
      overflow: 'hidden',
    },
    overlay: {
      bg: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
    },
    closeButton: {
      borderRadius: 'full',
      transition: 'all 0.2s ease',
      _hover: {
        bg: 'var(--color-primary-50)',
        color: 'var(--color-primary-600)',
        transform: 'scale(1.1)',
      },
    },
  },
});

// Enhanced Textarea component with modern design
export const Textarea = defineStyleConfig({
  baseStyle: {
    borderRadius: '1.5rem', // 24px - modern rounded corners
    borderWidth: '1px',
    borderColor: 'rgba(226, 232, 240, 0.8)',
    bg: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: { base: '16px', md: '14px' }, // Prevent zoom on iOS
    minH: { base: '80px', md: '60px' },
    _focus: {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(79, 156, 249, 0.1)',
      borderColor: 'var(--color-primary-300)',
    },
    _hover: {
      borderColor: '#94A3B8',
      boxShadow: 'var(--shadow-modern)',
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
      borderRadius: '1rem',
      resize: 'vertical',
    },
  },
});

// Export all components
export const components = {
  Box,
  Button,
  Input,
  Card,
  Progress,
  Badge,
  Modal,
  Textarea,
};
