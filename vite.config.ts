// Import the defineConfig helper from Vite to enable IntelliSense and type safety for the config
import { defineConfig } from 'vite';

// Import the React plugin for Vite to handle JSX and React fast refresh
import react from '@vitejs/plugin-react-swc'; // Use SWC for faster builds

// Import the SVGR plugin to allow importing SVGs as React components
import svgr from 'vite-plugin-svgr';

// Import Node.js path module to resolve file paths cleanly
import path from 'node:path';



// Import bundle analyzer for performance optimization
import { visualizer } from 'rollup-plugin-visualizer';

// Import compression plugin for better performance
import compression from 'vite-plugin-compression';

// Generate version information for cache busting
const generateVersionInfo = () => {
  const now = Date.now();
  const gitHash = process.env.VITE_GIT_HASH || 'dev';
  return {
    buildTime: now.toString(),
    gitHash,
    version: `3.0.0-${now}` // Include timestamp for unique versions
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

    // Compression plugins for better performance
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
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

  // Preview settings used for `vite preview` (usually post-build preview)
  preview: {
    port: 4173, // Port for preview server
    open: true,
  },

  // Enhanced build optimizations
  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',

    // Enable minification with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },

    // Generate source maps for debugging (disabled for production)
    sourcemap: false,

    // Enhanced chunk splitting for better caching and loading
    rollupOptions: {
      output: {
        // Improved chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',

        manualChunks: {
          // Core React chunk (most stable)
          vendor: ['react', 'react-dom'],

          // Animation library (separate for better caching)
          animation: ['framer-motion'],

          // UI library chunk
          ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],

          // Styling libraries
          styling: ['styled-components'],

          // State management and utilities
          state: ['zustand'],

          // Firebase services (keep together to avoid circular dependencies)
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],

          // Icons (separate for better caching)
          icons: ['react-icons/pi', '@heroicons/react'],

          // Markdown rendering (used in chat)
          markdown: ['react-markdown', 'remark-gfm'],

          // Router (separate for better caching)
          router: ['react-router-dom'],

          // HTTP client
          http: ['axios'],

          // Date utilities
          utils: ['date-fns', 'nanoid'],
        },
      },
      // External dependencies that should not be bundled
      external: [],
    },

    // Reduced chunk size warning limit for better performance
    chunkSizeWarningLimit: 500, // More aggressive chunk size limits

    // Optimize CSS with better splitting
    cssCodeSplit: true,

    // Enable CSS minification
    cssMinify: true,

    // Optimize asset handling with better thresholds
    assetsInlineLimit: 2048, // Inline smaller assets (2kb) for fewer requests

    // Enhanced module preload for better performance
    modulePreload: {
      polyfill: false, // Reduce bundle size for modern browsers
    },
  },

  // Enhanced dependency optimization for better performance
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'zustand',
      'react-markdown',
      'remark-gfm',
      'react-router-dom',
      'framer-motion',
      'styled-components',
      'axios',
      'date-fns',
      'nanoid',
      '@heroicons/react/24/solid',
      'react-icons/pi'
    ],
    exclude: [
      'firebase', // Firebase works better when not pre-bundled
    ],
    // Force optimization of these packages
    force: true,
  },

  // Enhanced server configuration for development
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false, // Disable error overlay for better development experience
    },
  },
});
