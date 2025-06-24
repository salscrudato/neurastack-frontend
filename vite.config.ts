// Import the defineConfig helper from Vite to enable IntelliSense and type safety for the config
import { defineConfig } from 'vite';

// Import the React plugin for Vite to handle JSX and React fast refresh
import react from '@vitejs/plugin-react';

// Import the SVGR plugin to allow importing SVGs as React components
import svgr from 'vite-plugin-svgr';

// Import Node.js path module to resolve file paths cleanly
import path from 'node:path';



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
          // Core React chunk (most stable) - include framer-motion here to ensure React context availability
          vendor: ['react', 'react-dom', 'framer-motion'],

          // UI library chunk
          ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'styled-components'],

          // State management and utilities
          state: ['zustand'],

          // Firebase services
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],

          // Icons (separate for better caching)
          icons: ['react-icons/pi'],

          // Markdown rendering (used in chat)
          markdown: ['react-markdown', 'remark-gfm'],

          // Router (separate for better caching)
          router: ['react-router-dom'],
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
    exclude: ['firebase'], // Firebase works better when not pre-bundled
  },
});
