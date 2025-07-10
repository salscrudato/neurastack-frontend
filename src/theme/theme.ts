import {
    extendTheme,
    type Theme,
    type ThemeConfig,
} from "@chakra-ui/react";
import { components as enhancedComponents } from './components';
import { componentStyles, designSystemTheme } from './designSystem';

/*─────────────────────────────────────────────*/
/* GROK-INSPIRED DESIGN SYSTEM                 */
/* Futuristic, minimalist, and user-centric    */
/*─────────────────────────────────────────────*/
const grokColors = {
  // Primary background - dark charcoal for sleek backdrop
  bg: "#1A1A1A",

  // Surface colors for contrast areas
  surface: {
    primary: "#F5F5F5",      // Soft off-white for cards/modals
    secondary: "#FFFFFF",     // Pure white for elevated content
    tertiary: "#FAFAFA",      // Light gray for subtle backgrounds
    dark: "#2A2A2A",          // Dark surface for dark mode elements
    // Modern glass morphism with dark theme
    glass: "rgba(245, 245, 245, 0.9)",
    glassLight: "rgba(255, 255, 255, 0.8)",
    glassMedium: "rgba(245, 245, 245, 0.7)",
    glassUltraLight: "rgba(255, 255, 255, 0.6)",
  },

  // Neutral gray scale for text and borders
  gray: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },

  // Vibrant teal accent - main interactive color
  accent: {
    50: "#E6FFFC",
    100: "#B3FFF7",
    200: "#80FFF2",
    300: "#4DFFED",
    400: "#1AFFE8",
    500: "#00C4B4", // Main teal accent
    600: "#00A89A",
    700: "#008C80",
    800: "#007066",
    900: "#00544C",
  },

  // Modern chat bubbles with Grok-inspired styling
  bubble: {
    user: {
      // Teal gradient for user messages
      bg: "linear-gradient(135deg, #00C4B4 0%, #00A89A 100%)",
      bgHover: "linear-gradient(135deg, #1AFFE8 0%, #00C4B4 100%)",
      text: "#FFFFFF",
      textSecondary: "rgba(255, 255, 255, 0.9)",
      // Enhanced shadow with teal tint
      shadow: "0 4px 12px rgba(0, 196, 180, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)",
      shadowHover: "0 6px 16px rgba(0, 196, 180, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1)"
    },
    ai: {
      // Clean off-white background for AI responses
      bg: "#F5F5F5",
      bgHover: "#FFFFFF",
      text: "#333333",
      textSecondary: "#666666",
      textTertiary: "#A0A0A0",
      border: "#E5E5E5",
      borderHover: "#D1D1D1",
      // Subtle shadow
      shadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
      shadowHover: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.08)"
    },
  },

  // Grok-inspired brand colors with teal focus
  brand: {
    gradient: {
      // Teal accent gradients
      accent: "linear-gradient(135deg, #00C4B4 0%, #00A89A 100%)",
      accentLight: "linear-gradient(135deg, #1AFFE8 0%, #00C4B4 100%)",
      accentDark: "linear-gradient(135deg, #00A89A 0%, #008C80 100%)",
      // Glass morphism with light theme
      glass: "linear-gradient(135deg, rgba(245,245,245,0.9) 0%, rgba(255,255,255,0.7) 100%)",
      glassAccent: "linear-gradient(135deg, rgba(0,196,180,0.1) 0%, rgba(0,196,180,0.05) 100%)",
    },
    // Teal as primary brand color
    accent: "#00C4B4",
    accentDark: "#00A89A",
    accentLight: "#1AFFE8",
  },

  // Grok-inspired semantic colors
  semantic: {
    success: "#16A34A",
    successLight: "#22C55E",
    successDark: "#15803D",
    warning: "#FFB84C",      // Warm yellow as specified
    warningLight: "#FFC973",
    warningDark: "#E6A43A",
    error: "#FF6B6B",        // Soft red as specified
    errorLight: "#FF8E8E",
    errorDark: "#E55555",
    info: "#00C4B4",         // Use teal for info
    infoLight: "#1AFFE8",
    infoDark: "#00A89A",
  },

  // Text hierarchy for both light and dark contexts
  text: {
    // For light backgrounds
    primary: "#333333",      // Dark gray on light backgrounds
    secondary: "#666666",    // Medium gray
    tertiary: "#A0A0A0",     // Muted gray (placeholders, captions)
    quaternary: "#D1D1D1",   // Very light gray
    muted: "#E5E5E5",        // Subtle text
    // For dark backgrounds
    inverse: "#FFFFFF",      // Bright white on dark backgrounds
    inverseSecondary: "#E0E0E0", // Light gray on dark backgrounds
    inverseTertiary: "#A0A0A0",  // Muted gray on dark backgrounds
  },

  // Border colors with teal accents
  border: {
    light: "#F5F5F5",
    medium: "#E5E5E5",
    strong: "#D1D1D1",
    accent: "rgba(0, 196, 180, 0.2)",
    accentStrong: "rgba(0, 196, 180, 0.4)",
    glass: "rgba(255, 255, 255, 0.3)",
    glassStrong: "rgba(255, 255, 255, 0.5)",
    dark: "#404040",         // For dark theme elements
  }
};

const config: ThemeConfig = {
  initialColorMode: "light",  // Default to light mode with dark accents
  useSystemColorMode: false,
};

const theme = extendTheme(
  {
    config,
    colors: {
      // Background colors - Grok-inspired
      bg: grokColors.bg,
      surface: grokColors.surface,

      // Color scales
      gray: grokColors.gray,
      accent: grokColors.accent,

      // Chat bubble colors - Grok-inspired
      bubbleUserBg: grokColors.bubble.user.bg,
      bubbleUserBgHover: grokColors.bubble.user.bgHover,
      bubbleUserText: grokColors.bubble.user.text,
      bubbleUserTextSecondary: grokColors.bubble.user.textSecondary,
      bubbleAiBg: grokColors.bubble.ai.bg,
      bubbleAiBgHover: grokColors.bubble.ai.bgHover,
      bubbleAiText: grokColors.bubble.ai.text,
      bubbleAiTextSecondary: grokColors.bubble.ai.textSecondary,
      bubbleAiTextTertiary: grokColors.bubble.ai.textTertiary,
      bubbleAiBorder: grokColors.bubble.ai.border,
      bubbleAiBorderHover: grokColors.bubble.ai.borderHover,

      // Brand colors - teal focus
      brandAccent: grokColors.brand.accent,
      brandAccentDark: grokColors.brand.accentDark,
      brandAccentLight: grokColors.brand.accentLight,

      // Text colors - Grok-inspired hierarchy
      textPrimary: grokColors.text.primary,
      textSecondary: grokColors.text.secondary,
      textTertiary: grokColors.text.tertiary,
      textQuaternary: grokColors.text.quaternary,
      textMuted: grokColors.text.muted,
      textInverse: grokColors.text.inverse,
      textInverseSecondary: grokColors.text.inverseSecondary,
      textInverseTertiary: grokColors.text.inverseTertiary,

      // Semantic colors with Grok palette
      success: grokColors.semantic.success,
      successLight: grokColors.semantic.successLight,
      successDark: grokColors.semantic.successDark,
      warning: grokColors.semantic.warning,
      warningLight: grokColors.semantic.warningLight,
      warningDark: grokColors.semantic.warningDark,
      error: grokColors.semantic.error,
      errorLight: grokColors.semantic.errorLight,
      errorDark: grokColors.semantic.errorDark,
      info: grokColors.semantic.info,
      infoLight: grokColors.semantic.infoLight,
      infoDark: grokColors.semantic.infoDark,

      // Border colors with teal accents
      borderLight: grokColors.border.light,
      borderMedium: grokColors.border.medium,
      borderStrong: grokColors.border.strong,
      borderAccent: grokColors.border.accent,
      borderAccentStrong: grokColors.border.accentStrong,
      borderGlass: grokColors.border.glass,
      borderGlassStrong: grokColors.border.glassStrong,
      borderDark: grokColors.border.dark,
    },
    fonts: {
      heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
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
          bg: grokColors.bg,
          color: grokColors.text.primary,
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11", "ss01", "ss02"',
          fontVariantNumeric: "proportional-nums",
          letterSpacing: "-0.009em",
          lineHeight: "base",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "*, *::before, *::after": {
          borderColor: grokColors.border.light,
        },
        // Enhanced focus styles
        "*:focus": {
          outline: "none",
        },
      },
    },
    // Enhanced shadows with sophisticated depth and glass morphism
    shadows: {
      // Basic shadows with improved depth
      xs: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
      sm: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)",
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.2)",

      // Glass morphism shadows with teal tints
      glass: "0 8px 32px rgba(0, 196, 180, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)",
      glassLight: "0 4px 20px rgba(0, 0, 0, 0.06), 0 2px 12px rgba(0, 196, 180, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)",
      glassMedium: "0 16px 48px rgba(0, 196, 180, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12)",
      glassStrong: "0 16px 48px rgba(0, 196, 180, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6)",

      // Grok-inspired glow effects with teal
      glow: "0 0 20px rgba(0, 196, 180, 0.25), 0 0 40px rgba(0, 196, 180, 0.1)",
      glowStrong: "0 0 30px rgba(0, 196, 180, 0.4), 0 0 60px rgba(0, 196, 180, 0.15), 0 0 90px rgba(0, 196, 180, 0.05)",
      glowTeal: "0 0 20px rgba(0, 196, 180, 0.25), 0 0 40px rgba(0, 196, 180, 0.1)",
      glowSuccess: "0 0 20px rgba(22, 163, 74, 0.25), 0 0 40px rgba(22, 163, 74, 0.1)",
      glowWarning: "0 0 20px rgba(255, 184, 76, 0.25), 0 0 40px rgba(255, 184, 76, 0.1)",
      glowError: "0 0 20px rgba(255, 107, 107, 0.25), 0 0 40px rgba(255, 107, 107, 0.1)",

      // Interactive shadows with teal accents
      hover: "0 8px 25px -5px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 196, 180, 0.15), 0 2px 8px rgba(0, 196, 180, 0.1)",
      hoverStrong: "0 12px 32px -5px rgba(0, 0, 0, 0.15), 0 6px 16px -2px rgba(0, 196, 180, 0.2), 0 3px 12px rgba(0, 196, 180, 0.15)",
      active: "0 2px 8px -1px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)",
      focus: "0 0 0 3px rgba(0, 196, 180, 0.25), 0 0 0 1px rgba(0, 196, 180, 0.5)",
      focusStrong: "0 0 0 4px rgba(0, 196, 180, 0.3), 0 0 0 2px rgba(0, 196, 180, 0.6)",

      // Chat-specific shadows with teal enhancement
      chatUser: grokColors.bubble.user.shadow,
      chatUserHover: grokColors.bubble.user.shadowHover,
      chatAI: grokColors.bubble.ai.shadow,
      chatAIHover: grokColors.bubble.ai.shadowHover,

      // Input and button shadows with teal accents
      input: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 196, 180, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
      inputFocus: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 196, 180, 0.12), 0 0 0 3px rgba(0, 196, 180, 0.15)",
      button: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 196, 180, 0.1)",
      buttonHover: "0 6px 16px rgba(0, 0, 0, 0.1), 0 3px 8px rgba(0, 196, 180, 0.15), 0 1px 4px rgba(0, 196, 180, 0.1)",
      buttonActive: "0 2px 6px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 196, 180, 0.08)",
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
            bg: grokColors.bg,
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
            bg: grokColors.surface.secondary,
            borderTopWidth: "1px",
            borderColor: grokColors.border.medium,
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

      // Enhanced Progress component with teal accent
      Progress: {
        baseStyle: {
          track: {
            bg: grokColors.surface.tertiary,
          },
          filledTrack: {
            background: grokColors.brand.gradient.accent,
          }
        }
      }
    },
  },
  designSystemTheme
) as Theme;

export default theme;

/* Convenience export for Grok-inspired colors */
export const colors = grokColors;