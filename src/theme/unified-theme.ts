/**
 * Unified Theme System
 * 
 * Consolidated theme configuration that merges all previous theme files
 * into a single, maintainable system optimized for AI agent maintenance.
 * Incorporates 2025 UI/UX trends: neumorphism, enhanced glassmorphism,
 * AI-adaptive elements, immersive 3D effects, and personalization.
 */

import { extendTheme, type Theme, type ThemeConfig } from "@chakra-ui/react";
import { defineStyleConfig } from '@chakra-ui/styled-system';

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const colors = {
  // Background colors
  bg: "#FAFBFC",
  surface: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    tertiary: "#F1F5F9",
    neumorphic: "#E0E0E0",
    glass: "rgba(255, 255, 255, 0.7)",
  },

  // Brand colors
  brand: {
    primary: "#4F9CF9",
    secondary: "#8B5CF6", 
    accent: "#06B6D4",
    gradient: {
      primary: "linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)",
      secondary: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)",
      glass: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
    }
  },

  // Chat bubble colors
  bubble: {
    user: { bg: "#4F9CF9", text: "#FFFFFF" },
    ai: { bg: "#F8FAFC", text: "#0F172A" }
  },

  // Text colors
  text: {
    primary: "#0F172A",
    secondary: "#475569", 
    tertiary: "#64748B",
    muted: "#94A3B8",
  },

  // Semantic colors
  semantic: {
    success: "#10B981",
    warning: "#F59E0B", 
    error: "#EF4444",
    info: "#3B82F6",
  },

  // Border colors
  border: {
    light: "#F1F5F9",
    medium: "#E2E8F0",
    strong: "#CBD5E1",
  }
};

// ============================================================================
// COMPONENT STYLES
// ============================================================================

const Button = defineStyleConfig({
  baseStyle: {
    borderRadius: 'xl',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    _focus: { outline: 'none', boxShadow: 'none' },
  },
  variants: {
    solid: {
      bg: colors.brand.primary,
      color: 'white',
      _hover: {
        bg: '#3182CE',
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 20px rgba(79, 156, 249, 0.3)',
      },
    },
    outline: {
      borderColor: colors.brand.primary,
      color: colors.brand.primary,
      _hover: {
        bg: 'rgba(79, 156, 249, 0.08)',
        transform: 'translateY(-1px)',
      },
    },
    ghost: {
      color: colors.brand.primary,
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
      color: colors.text.primary,
      _hover: {
        bg: 'rgba(255, 255, 255, 0.9)',
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
      },
    },
  },
  sizes: {
    sm: { h: '32px', minW: '32px', fontSize: 'sm', px: 3 },
    md: { h: '40px', minW: '40px', fontSize: 'md', px: 4 },
    lg: { h: '48px', minW: '48px', fontSize: 'lg', px: 6 },
  },
});

const Input = defineStyleConfig({
  baseStyle: {
    field: {
      borderRadius: 'xl',
      borderColor: colors.border.medium,
      bg: colors.surface.primary,
      transition: 'all 0.2s ease',
      _focus: {
        outline: 'none',
        boxShadow: 'none',
        borderColor: colors.brand.primary,
      },
      _hover: {
        borderColor: colors.border.strong,
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

const Textarea = defineStyleConfig({
  baseStyle: {
    borderRadius: '3xl',
    borderColor: colors.border.medium,
    bg: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    _focus: { outline: 'none', boxShadow: 'none' },
    _hover: {
      borderColor: colors.border.strong,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
      transform: 'translateY(-1px)',
    },
  },
  variants: {
    'mobile-optimized': {
      fontSize: '16px',
      minH: '80px',
      borderRadius: 'xl',
      resize: 'vertical',
    },
  },
});

const Box = defineStyleConfig({
  baseStyle: {
    _focus: { outline: 'none', boxShadow: 'none' },
    _focusVisible: { outline: 'none', boxShadow: 'none' },
  },
});

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const unifiedTheme = extendTheme({
  config,
  
  // Colors
  colors: {
    ...colors,
    // Chakra UI compatibility
    brandPrimary: colors.brand.primary,
    brandSecondary: colors.brand.secondary,
    brandAccent: colors.brand.accent,
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textTertiary: colors.text.tertiary,
    textMuted: colors.text.muted,
    bubbleUserBg: colors.bubble.user.bg,
    bubbleUserText: colors.bubble.user.text,
    bubbleAiBg: colors.bubble.ai.bg,
    bubbleAiText: colors.bubble.ai.text,
  },

  // Typography
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  // Spacing
  space: {
    xs: '0.25rem',
    sm: '0.5rem', 
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Border radius
  radii: {
    sm: '0.125rem',
    md: '0.375rem', 
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    glow: "0 0 20px rgba(79, 156, 249, 0.3)",
  },

  // Global styles
  styles: {
    global: {
      "html": { scrollBehavior: "smooth" },
      "html, body": {
        bg: colors.bg,
        color: colors.text.primary,
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11", "ss01", "ss02"',
        letterSpacing: "-0.009em",
        textRendering: "optimizeLegibility",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
      "*, *::before, *::after": { borderColor: colors.border.light },
      "*:focus": { outline: "none" },
    },
  },

  // Component styles
  components: {
    Button,
    Input,
    Textarea,
    Box,
    
    // Progress component
    Progress: {
      baseStyle: {
        track: { bg: colors.surface.tertiary },
        filledTrack: { background: colors.brand.gradient.primary },
      }
    },

    // Tooltip component
    Tooltip: {
      baseStyle: { borderRadius: 'xl' }
    },
  },
}) as Theme;

export default unifiedTheme;
export { colors };
