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

// Import bundle analyzer for performance optimization
import { visualizer } from 'rollup-plugin-visualizer';

// Generate version information for cache busting
const generateVersionInfo = () => {
  const now = Date.now();
  const gitHash = process.env.VITE_GIT_HASH || 'dev';
  return {
    buildTime: now.toString(),
    gitHash,
    version: '3.0.0'
  };
};

const versionInfo = generateVersionInfo();

// Export the Vite configuration object
export default defineConfig({
  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify(versionInfo.version),
    __BUILD_TIME__: JSON.stringify(versionInfo.buildTime),
    __GIT_HASH__: JSON.stringify(versionInfo.gitHash),
  },
  // Plugins extend Vite's functionality
  plugins: [
    react(), // Enables React Fast Refresh and JSX transformation
    svgr(),  // Enables usage of SVGs as React components via import
    // Bundle analyzer for performance optimization (only in production)
    process.env.NODE_ENV === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: false, // Don't auto-open in CI/CD
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: "prompt", // Show update prompt instead of auto-update
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
        theme_color: "#4F9CF9",
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
        enabled: false, // Disable PWA plugin during development to prevent service worker issues
        type: "module"
      },
      disable: process.env.NODE_ENV === 'development', // Completely disable PWA in development
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        skipWaiting: false, // Don't auto-skip waiting - let user control updates
        clientsClaim: false, // Don't auto-claim clients - let user control updates
        // More aggressive caching strategy for faster updates
        runtimeCaching: [
          {
            // Cache API responses with network-first strategy
            urlPattern: /^https:\/\/(api\.|.*\.run\.app)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 30 // Increased from 3 to 30 seconds for AI API calls
            }
          },
          {
            // Cache fonts with cache-first strategy
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days (reduced from 365)
              }
            }
          },
          {
            // Cache images with cache-first strategy
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ],

  // Simplified aliases - only include what's actively used
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Simple root alias
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
    port: 3000, // Port to serve the app during development
    open: true  // Automatically open the browser on server start
  },

  // Preview settings used for `vite preview` (usually post-build preview)
  preview: {
    port: 4173 // Port for preview server
  },

  // Build optimizations
  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',

    // Enable minification
    minify: 'esbuild',

    // Generate source maps for debugging
    sourcemap: false,

    // Optimize chunk splitting for better caching and loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunk (most stable)
          vendor: ['react', 'react-dom'],

          // Split UI libraries for better caching and smaller chunks
          'chakra-core': ['@chakra-ui/react'],
          'chakra-theme': ['@chakra-ui/theme-tools'],
          'emotion': ['@emotion/react', '@emotion/styled'],
          'animations': ['framer-motion'],
          'styled': ['styled-components'],

          // State management and utilities
          state: ['zustand'],

          // Split Firebase into smaller chunks for better loading
          'firebase-core': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-firestore': ['firebase/firestore'],

          // Icons (separate for better caching)
          icons: ['react-icons/pi', '@chakra-ui/icons', '@heroicons/react'],

          // Markdown rendering (used in chat)
          markdown: ['react-markdown', 'remark-gfm'],

          // Router (separate for better caching)
          router: ['react-router-dom'],

          // Date utilities
          'date-utils': ['date-fns'],

          // HTTP client
          'http': ['axios'],
        },
      },
    },

    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Optimize CSS
    cssCodeSplit: true,
  },

  // Enhanced dependency optimization for better performance
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'zustand',
      'react-markdown',
      'remark-gfm',
      'react-router-dom',
      'framer-motion',
      'styled-components'
    ],
    exclude: [], // Allow all dependencies to be pre-bundled for better performance
  },
});
