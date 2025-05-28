// Import the defineConfig helper from Vite to enable IntelliSense and type safety for the config
import { defineConfig } from 'vite';

// Import the React plugin for Vite to handle JSX and React fast refresh
import react from '@vitejs/plugin-react';

// Import the SVGR plugin to allow importing SVGs as React components
import svgr from 'vite-plugin-svgr';

// Import Node.js path module to resolve file paths cleanly
import path from 'node:path';

// Import the PWA plugin to enable Progressive Web App features
import { VitePWA } from "vite-plugin-pwa";

// Export the Vite configuration object
export default defineConfig({
  // Plugins extend Vite's functionality
  plugins: [
    react(), // Enables React Fast Refresh and JSX transformation
    svgr(),  // Enables usage of SVGs as React components via import
    VitePWA({
      registerType: "prompt", // Controls when the service worker registration prompt is shown
      includeAssets: [
        // Static assets to include in the service worker cache
        "favicon.svg",
        "icons/neurastack-192.png",
        "icons/neurastack-512.png"
      ],
      manifest: {
        // Web app manifest to define how the app behaves when installed
        name: "neurastack",
        short_name: "neurastack",
        description: "AI-powered chat assistant by neurastack",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone", // App runs in its own window without browser UI
        start_url: "/",         // Start page when the app is launched
        icons: [
          // App icons used for PWA installation
          { src: "icons/neurastack-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/neurastack-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      devOptions: {
        enabled: true, // Enables the PWA plugin during development
        type: "module" // Ensures ES Module type is used in development
      }
    })
  ],

  // Aliases simplify import paths for better readability and maintainability
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),        // Shortcut for assets directory
      '@icons' : path.resolve(__dirname, 'src/assets/icons'),  // Shortcut for icons
      '@img'   : path.resolve(__dirname, 'src/assets/img'),    // Shortcut for images
      '@pages' : path.resolve(__dirname, 'src/pages'),         // Shortcut for pages
      '@store' : path.resolve(__dirname, 'src/store'),         // Shortcut for state/store
      '@theme' : path.resolve(__dirname, 'src/theme'),         // Shortcut for theme
    },
  },

  // Optional CSS configuration
  css: {
    modules: {
      // Ensures CSS module class names are camelCased for consistency
      localsConvention: 'camelCase'
    }
  },

  // Dev server settings
  server: {
    port: 5173, // Port to serve the app during development
    open: true  // Automatically open the browser on server start
  },

  // Preview settings used for `vite preview` (usually post-build preview)
  preview: {
    port: 4173 // Port for preview server
  }
});
