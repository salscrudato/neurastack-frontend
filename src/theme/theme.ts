import {
  extendTheme,
  type ThemeConfig,
  type Theme,
} from "@chakra-ui/react";
import { designSystemTheme, componentStyles } from './designSystem';

/*─────────────────────────────────────────────*/
/* Color palette                               */
/*─────────────────────────────────────────────*/
const customColors = {
  bg:    "#1c1c1e",   // darkest grey
  panel: "#2c2c2e",   // lighter grey
  bubble: {
    user: { bg: "#3b82f6", text: "#ffffff" },  // Tailwind blue-500
    ai:   { bg: "#3a3a3c", text: "#f3f4f6" }, // grey bubble
  },
  // Brand gradient colors for light mode
  brand: {
    gradient: {
      start: "#4F9CF9",  // Blue (top-left)
      end: "#8B5CF6",    // Purple (bottom-right)
    },
    primary: "#4F9CF9",
    secondary: "#8B5CF6",
  },
};

const config: ThemeConfig = {
  initialColorMode: "dark",      // default to dark UI
  useSystemColorMode: false,
};

const theme = extendTheme(
  {
    config,
    colors: {
      bg:    customColors.bg,
      panel: customColors.panel,
      bubbleUserBg: customColors.bubble.user.bg,
      bubbleUserText: customColors.bubble.user.text,
      bubbleAiBg: customColors.bubble.ai.bg,
      bubbleAiText: customColors.bubble.ai.text,
      // Brand colors
      brandPrimary: customColors.brand.primary,
      brandSecondary: customColors.brand.secondary,
      brandGradientStart: customColors.brand.gradient.start,
      brandGradientEnd: customColors.brand.gradient.end,
    },
    fonts: {
      heading: "Inter, sans-serif",
      body:    "Inter, sans-serif",
    },
    styles: {
      global: {
        "html, body": {
          bg: "bg",                 // use the bg token
          color: "gray.100",
        },
      },
    },
    // Merge with design system components
    components: {
      ...componentStyles,
    },
  },
  designSystemTheme
) as Theme;

export default theme;

/* Convenience export for non-Chakra (e.g., className strings) */
export const colors = customColors;