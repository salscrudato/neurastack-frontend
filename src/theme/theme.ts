import {
    extendTheme,
    type Theme,
    type ThemeConfig,
} from "@chakra-ui/react";
import { components as enhancedComponents } from './components';
import { componentStyles, designSystemTheme } from './designSystem';

/*─────────────────────────────────────────────*/
/* Modern Light-Only Color Palette             */
/*─────────────────────────────────────────────*/
const modernColors = {
  // Primary background - clean white with subtle warmth
  bg: "#FAFBFC",

  // Surface colors for cards and panels
  surface: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    tertiary: "#F1F5F9",
    glass: "rgba(255, 255, 255, 0.8)",
  },

  // Modern chat bubbles
  bubble: {
    user: {
      bg: "linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)",
      text: "#FFFFFF",
      shadow: "0 4px 12px rgba(79, 156, 249, 0.25)"
    },
    ai: {
      bg: "#F8FAFC",
      text: "#1E293B",
      border: "#E2E8F0",
      shadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
    },
  },

  // Enhanced brand colors
  brand: {
    gradient: {
      primary: "linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)",
      secondary: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
      accent: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
    },
    primary: "#4F9CF9",
    secondary: "#8B5CF6",
    accent: "#06B6D4",
  },

  // Semantic colors with modern palette
  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },

  // Text colors with proper contrast
  text: {
    primary: "#0F172A",
    secondary: "#475569",
    tertiary: "#64748B",
    muted: "#94A3B8",
    inverse: "#FFFFFF",
  },

  // Border colors
  border: {
    light: "#F1F5F9",
    medium: "#E2E8F0",
    strong: "#CBD5E1",
  }
};

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme(
  {
    config,
    colors: {
      // Background colors
      bg: modernColors.bg,
      surface: modernColors.surface,

      // Chat bubble colors
      bubbleUserBg: modernColors.bubble.user.bg,
      bubbleUserText: modernColors.bubble.user.text,
      bubbleAiBg: modernColors.bubble.ai.bg,
      bubbleAiText: modernColors.bubble.ai.text,

      // Brand colors
      brandPrimary: modernColors.brand.primary,
      brandSecondary: modernColors.brand.secondary,
      brandAccent: modernColors.brand.accent,

      // Text colors
      textPrimary: modernColors.text.primary,
      textSecondary: modernColors.text.secondary,
      textTertiary: modernColors.text.tertiary,
      textMuted: modernColors.text.muted,

      // Semantic colors
      success: modernColors.semantic.success,
      warning: modernColors.semantic.warning,
      error: modernColors.semantic.error,
      info: modernColors.semantic.info,

      // Border colors
      borderLight: modernColors.border.light,
      borderMedium: modernColors.border.medium,
      borderStrong: modernColors.border.strong,
    },
    fonts: {
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    },
    fontSizes: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      md: "1rem",       // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem",    // 48px
    },
    lineHeights: {
      shorter: 1.25,
      short: 1.375,
      base: 1.5,
      tall: 1.625,
      taller: 2,
    },
    styles: {
      global: {
        "html": {
          scrollBehavior: "smooth",
        },
        "html, body": {
          bg: modernColors.bg,
          color: modernColors.text.primary,
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
          fontVariantNumeric: "oldstyle-nums",
          lineHeight: "base",
        },
        "*, *::before, *::after": {
          borderColor: modernColors.border.light,
        },
        // Enhanced focus styles
        "*:focus": {
          outline: "2px solid",
          outlineColor: modernColors.brand.primary,
          outlineOffset: "2px",
        },
      },
    },
    // Enhanced shadows for depth
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
    // Enhanced component styles with extracted patterns
    components: {
      ...componentStyles,
      ...enhancedComponents,

      // Enhanced Box component for common layout patterns
      Box: {
        variants: {
          'page-container': {
            w: "100%",
            minH: "100%",
            bg: modernColors.bg,
            position: "relative",
            overflowX: "hidden",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          },
          'fixed-header': {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            w: "100%",
            bg: "white",
            borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            flexShrink: 0,
          },
          'chat-container': {
            w: "full",
            bg: modernColors.bg,
            borderTopWidth: "1px",
            borderColor: modernColors.border.medium,
            position: "sticky",
            bottom: 0,
            zIndex: 100,
            flexShrink: 0,
          }
        }
      },

      // Enhanced Flex component for common flex patterns
      Flex: {
        variants: {
          'page-wrapper': {
            direction: "column",
            h: "100vh",
            w: "100%",
            overflowX: "hidden",
            position: "relative",
            minHeight: ['100vh', '100dvh'],
            overflow: 'hidden',
          },
          'center': {
            align: "center",
            justify: "center",
          },
          'between': {
            align: "center",
            justify: "space-between",
          }
        }
      },

      // Enhanced Progress component
      Progress: {
        baseStyle: {
          track: {
            bg: modernColors.surface.tertiary,
          },
          filledTrack: {
            background: modernColors.brand.gradient.primary,
          }
        }
      }
    },
  },
  designSystemTheme
) as Theme;

export default theme;

/* Convenience export for modern colors */
export const colors = modernColors;