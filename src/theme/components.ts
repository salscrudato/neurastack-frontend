/**
 * Enhanced Component Style Overrides
 * Consolidated component styling patterns extracted from inline styles
 */

import { defineStyleConfig } from '@chakra-ui/styled-system';



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

// Enhanced Button component with responsive patterns
export const Button = defineStyleConfig({
  baseStyle: {
    fontWeight: 'semibold',
    borderRadius: 'xl',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    minHeight: { base: '48px', md: '44px' },
    minWidth: { base: '48px', md: '44px' },
    fontSize: { base: 'md', md: 'sm' },
    px: { base: 4, md: 3 },
    py: { base: 3, md: 2 },
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
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
      background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-primary-hover) 100%)',
      color: 'white',
      boxShadow: 'var(--shadow-brand)',
      _hover: {
        transform: 'translateY(-1px)',
        boxShadow: 'var(--shadow-brand-hover)',
        _disabled: {
          transform: 'none',
          boxShadow: 'var(--shadow-brand)',
        },
      },
      _active: {
        transform: 'translateY(0)',
        boxShadow: 'var(--shadow-brand-active)',
      },
      _focus: {
        boxShadow: '0 0 0 3px var(--color-border-brand), var(--shadow-brand)',
      },
    },
    outline: {
      borderColor: 'var(--color-brand-primary)',
      borderWidth: '1px',
      color: 'var(--color-brand-primary)',
      bg: 'transparent',
      _hover: {
        bg: 'var(--color-brand-primary)',
        color: 'white',
        transform: 'translateY(-1px)',
        boxShadow: 'var(--shadow-button-hover)',
      },
      _active: {
        transform: 'translateY(0)',
      },
    },
    ghost: {
      color: 'var(--color-brand-primary)',
      bg: 'transparent',
      _hover: {
        bg: 'rgba(79, 156, 249, 0.06)',
        transform: 'translateY(-1px)',
      },
      _active: {
        bg: 'rgba(79, 156, 249, 0.1)',
        transform: 'translateY(0)',
      },
    },
    glass: {
      bg: 'var(--color-surface-glass)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--color-border-light)',
      color: 'var(--color-text-primary)',
      boxShadow: 'var(--shadow-glass-light)',
      _hover: {
        bg: 'var(--color-surface-glass-strong)',
        transform: 'translateY(-1px)',
        boxShadow: 'var(--shadow-glass)',
      },
      _active: {
        transform: 'translateY(0)',
      },
    },
  },
  sizes: {
    sm: {
      h: { base: '44px', md: '36px' },
      minW: { base: '44px', md: '36px' },
      fontSize: { base: 'sm', md: 'xs' },
      px: { base: 4, md: 3 },
      borderRadius: 'lg',
    },
    md: {
      h: { base: '48px', md: '44px' },
      minW: { base: '48px', md: '44px' },
      fontSize: { base: 'md', md: 'sm' },
      px: { base: 6, md: 4 },
      borderRadius: 'xl',
    },
    lg: {
      h: { base: '56px', md: '52px' },
      minW: { base: '56px', md: '52px' },
      fontSize: { base: 'lg', md: 'md' },
      px: { base: 8, md: 6 },
      borderRadius: 'xl',
    },
    // Mobile-optimized sizes
    'mobile-sm': {
      h: { base: '48px', md: '40px' },
      minW: { base: '48px', md: '40px' },
      fontSize: { base: 'sm', md: 'xs' },
      px: { base: 4, md: 3 },
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

// Enhanced Input component with responsive patterns
export const Input = defineStyleConfig({
  baseStyle: {
    field: {
      borderRadius: '3xl',
      borderWidth: '1px',
      borderColor: 'rgba(203, 213, 225, 0.8)',
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      minH: { base: '48px', md: '44px' },
      fontSize: { base: 'max(16px, 1rem)', md: 'md' }, // Prevent zoom on iOS
      px: { base: 4, md: 3 },
      py: { base: 3, md: 2 },
      touchAction: 'manipulation',
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
  variants: {},
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

// Enhanced Textarea component with responsive patterns
export const Textarea = defineStyleConfig({
  baseStyle: {
    borderRadius: '3xl',
    borderWidth: '1px',
    borderColor: 'rgba(203, 213, 225, 0.8)',
    bg: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    minH: { base: '80px', md: '60px' },
    fontSize: { base: 'max(16px, 1rem)', md: 'md' }, // Prevent zoom on iOS
    px: { base: 4, md: 3 },
    py: { base: 3, md: 2 },
    touchAction: 'manipulation',
    resize: 'vertical',
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
  variants: {
    'mobile-optimized': {
      fontSize: 'max(16px, 1rem)', // Prevent zoom on iOS
      minH: { base: '100px', md: '80px' },
      borderRadius: 'xl',
      resize: 'vertical',
    },
    'chat-input': {
      minH: { base: '120px', md: '100px' },
      maxH: { base: '200px', md: '160px' },
      fontSize: 'max(16px, 1rem)',
      borderRadius: '2xl',
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
