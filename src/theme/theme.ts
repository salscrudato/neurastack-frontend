import {
    extendTheme,
    type Theme,
    type ThemeConfig,
} from "@chakra-ui/react";
import { components as enhancedComponents } from './components';
import { componentStyles, designSystemTheme } from './designSystem';

/*─────────────────────────────────────────────*/
/* Modern Monochromatic Design System          */
/* Clean, minimal, and sophisticated           */
/*─────────────────────────────────────────────*/
const modernColors = {
  // Primary background - pure white for maximum cleanliness
  bg: "#FFFFFF",

  // Clean surface colors - monochromatic
  surface: {
    primary: "#FFFFFF",
    secondary: "#FAFAFA",
    tertiary: "#F5F5F5",
    quaternary: "#E5E5E5",
    // Modern glass morphism
    glass: "rgba(255, 255, 255, 0.85)",
    glassLight: "rgba(255, 255, 255, 0.7)",
    glassMedium: "rgba(255, 255, 255, 0.6)",
    glassUltraLight: "rgba(255, 255, 255, 0.5)",
  },

  // Neutral gray scale - sophisticated monochromatic
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

  // Single strategic accent - modern blue
  accent: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#2563EB", // Main accent color
    600: "#1D4ED8",
    700: "#1E40AF",
    800: "#1E3A8A",
    900: "#172554",
  },

  // Modern chat bubbles - clean and minimal
  bubble: {
    user: {
      // Clean accent gradient
      bg: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      bgHover: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
      text: "#FFFFFF",
      textSecondary: "rgba(255, 255, 255, 0.9)",
      // Subtle shadow
      shadow: "0 4px 12px rgba(37, 99, 235, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)",
      shadowHover: "0 6px 16px rgba(37, 99, 235, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1)"
    },
    ai: {
      // Clean white background
      bg: "#FFFFFF",
      bgHover: "#FAFAFA",
      text: "#171717",
      textSecondary: "#525252",
      textTertiary: "#737373",
      border: "#E5E5E5",
      borderHover: "#D4D4D4",
      // Minimal shadow
      shadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
      shadowHover: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.08)"
    },
  },

  // Modern brand colors - minimal and clean
  brand: {
    gradient: {
      // Single accent gradient
      accent: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      accentLight: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
      accentDark: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
      // Clean glass morphism
      glass: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)",
      glassAccent: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.05) 100%)",
    },
    // Single strategic accent color
    accent: "#2563EB",
    accentDark: "#1D4ED8",
    accentLight: "#3B82F6",
  },

  // Clean semantic colors
  semantic: {
    success: "#16A34A",
    successLight: "#22C55E",
    successDark: "#15803D",
    warning: "#D97706",
    warningLight: "#F59E0B",
    warningDark: "#B45309",
    error: "#DC2626",
    errorLight: "#EF4444",
    errorDark: "#B91C1C",
    info: "#2563EB",
    infoLight: "#3B82F6",
    infoDark: "#1D4ED8",
  },

  // Monochromatic text hierarchy
  text: {
    primary: "#171717",
    secondary: "#525252",
    tertiary: "#737373",
    quaternary: "#A3A3A3",
    muted: "#D4D4D4",
    inverse: "#FFFFFF",
    inverseSecondary: "rgba(255, 255, 255, 0.9)",
    inverseTertiary: "rgba(255, 255, 255, 0.7)",
  },

  // Enhanced border colors with subtle gradients
  border: {
    light: "#F1F5F9",
    medium: "#E2E8F0",
    strong: "#CBD5E1",
    accent: "rgba(79, 156, 249, 0.2)",
    accentStrong: "rgba(79, 156, 249, 0.4)",
    glass: "rgba(255, 255, 255, 0.3)",
    glassStrong: "rgba(255, 255, 255, 0.5)",
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

      // Modern color scales
      gray: modernColors.gray,
      accent: modernColors.accent,

      // Chat bubble colors
      bubbleUserBg: modernColors.bubble.user.bg,
      bubbleUserBgHover: modernColors.bubble.user.bgHover,
      bubbleUserText: modernColors.bubble.user.text,
      bubbleUserTextSecondary: modernColors.bubble.user.textSecondary,
      bubbleAiBg: modernColors.bubble.ai.bg,
      bubbleAiBgHover: modernColors.bubble.ai.bgHover,
      bubbleAiText: modernColors.bubble.ai.text,
      bubbleAiTextSecondary: modernColors.bubble.ai.textSecondary,
      bubbleAiTextTertiary: modernColors.bubble.ai.textTertiary,
      bubbleAiBorder: modernColors.bubble.ai.border,
      bubbleAiBorderHover: modernColors.bubble.ai.borderHover,

      // Brand colors - simplified
      brandAccent: modernColors.brand.accent,
      brandAccentDark: modernColors.brand.accentDark,
      brandAccentLight: modernColors.brand.accentLight,

      // Enhanced text colors
      textPrimary: modernColors.text.primary,
      textSecondary: modernColors.text.secondary,
      textTertiary: modernColors.text.tertiary,
      textQuaternary: modernColors.text.quaternary,
      textMuted: modernColors.text.muted,
      textInverse: modernColors.text.inverse,
      textInverseSecondary: modernColors.text.inverseSecondary,
      textInverseTertiary: modernColors.text.inverseTertiary,

      // Enhanced semantic colors
      success: modernColors.semantic.success,
      successLight: modernColors.semantic.successLight,
      successDark: modernColors.semantic.successDark,
      warning: modernColors.semantic.warning,
      warningLight: modernColors.semantic.warningLight,
      warningDark: modernColors.semantic.warningDark,
      error: modernColors.semantic.error,
      errorLight: modernColors.semantic.errorLight,
      errorDark: modernColors.semantic.errorDark,
      info: modernColors.semantic.info,
      infoLight: modernColors.semantic.infoLight,
      infoDark: modernColors.semantic.infoDark,

      // Enhanced border colors
      borderLight: modernColors.border.light,
      borderMedium: modernColors.border.medium,
      borderStrong: modernColors.border.strong,
      borderAccent: modernColors.border.accent,
      borderAccentStrong: modernColors.border.accentStrong,
      borderGlass: modernColors.border.glass,
      borderGlassStrong: modernColors.border.glassStrong,
    },
    fonts: {
      heading: 'var(--font-family-display)',
      body: 'var(--font-family-text)',
      mono: 'var(--font-family-mono)',
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
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11", "ss01", "ss02"',
          fontVariantNumeric: "proportional-nums",
          letterSpacing: "-0.009em",
          lineHeight: "base",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "*, *::before, *::after": {
          borderColor: modernColors.border.light,
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

      // Enhanced glass morphism shadows with blue tints (using CSS custom properties)
      glass: "var(--shadow-glass)",
      glassLight: "0 4px 20px rgba(0, 0, 0, 0.06), 0 2px 12px rgba(79, 156, 249, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)",
      glassMedium: "var(--shadow-glass-lg)",
      glassStrong: "0 16px 48px rgba(79, 156, 249, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6)",

      // Sophisticated glow effects
      glow: "0 0 20px rgba(79, 156, 249, 0.25), 0 0 40px rgba(79, 156, 249, 0.1)",
      glowStrong: "0 0 30px rgba(79, 156, 249, 0.4), 0 0 60px rgba(79, 156, 249, 0.15), 0 0 90px rgba(79, 156, 249, 0.05)",
      glowPurple: "0 0 20px rgba(139, 92, 246, 0.25), 0 0 40px rgba(139, 92, 246, 0.1)",
      glowCyan: "0 0 20px rgba(6, 182, 212, 0.25), 0 0 40px rgba(6, 182, 212, 0.1)",
      glowSuccess: "0 0 20px rgba(16, 185, 129, 0.25), 0 0 40px rgba(16, 185, 129, 0.1)",
      glowWarning: "0 0 20px rgba(245, 158, 11, 0.25), 0 0 40px rgba(245, 158, 11, 0.1)",
      glowError: "0 0 20px rgba(239, 68, 68, 0.25), 0 0 40px rgba(239, 68, 68, 0.1)",

      // Enhanced interactive shadows
      hover: "0 8px 25px -5px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(79, 156, 249, 0.15), 0 2px 8px rgba(79, 156, 249, 0.1)",
      hoverStrong: "0 12px 32px -5px rgba(0, 0, 0, 0.15), 0 6px 16px -2px rgba(79, 156, 249, 0.2), 0 3px 12px rgba(79, 156, 249, 0.15)",
      active: "0 2px 8px -1px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)",
      focus: "0 0 0 3px rgba(79, 156, 249, 0.25), 0 0 0 1px rgba(79, 156, 249, 0.5)",
      focusStrong: "0 0 0 4px rgba(79, 156, 249, 0.3), 0 0 0 2px rgba(79, 156, 249, 0.6)",

      // Chat-specific shadows with enhanced depth
      chatUser: modernColors.bubble.user.shadow,
      chatUserHover: modernColors.bubble.user.shadowHover,
      chatAI: modernColors.bubble.ai.shadow,
      chatAIHover: modernColors.bubble.ai.shadowHover,

      // Input and button shadows
      input: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(79, 156, 249, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
      inputFocus: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(79, 156, 249, 0.12), 0 0 0 3px rgba(79, 156, 249, 0.15)",
      button: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(79, 156, 249, 0.1)",
      buttonHover: "0 6px 16px rgba(0, 0, 0, 0.1), 0 3px 8px rgba(79, 156, 249, 0.15), 0 1px 4px rgba(79, 156, 249, 0.1)",
      buttonActive: "0 2px 6px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(79, 156, 249, 0.08)",
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
            background: modernColors.brand.gradient.accent,
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