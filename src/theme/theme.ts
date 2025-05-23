import { extendTheme, type ThemeConfig, type Theme } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",   // or "dark"
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  styles: {
    global: {
      "html, body": {
        bg: "gray.50",
      },
    },
  },
}) as Theme;

export default theme;
