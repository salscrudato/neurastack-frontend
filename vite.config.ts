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

// Import compression plugin for better production builds
import { compression } from 'vite-plugin-compression2';

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
    react({
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
      // Enable babel plugins for better optimization
      babel: {
        plugins: process.env.NODE_ENV === 'production' ? [
          ['transform-remove-console', { exclude: ['error', 'warn'] }]
        ] : []
      }
    }),
    svgr({
      // Optimize SVG imports
      svgrOptions: {
        icon: true,
        dimensions: false,
      },
    }),
    // Compression for production builds
    process.env.NODE_ENV === 'production' && compression({
      algorithms: ['gzip'],
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    process.env.NODE_ENV === 'production' && compression({
      algorithms: ['brotliCompress'],
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Bundle analyzer for performance optimization (only in production)
    process.env.NODE_ENV === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: false, // Don't auto-open in CI/CD
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Better visualization
    }),
  ].filter(Boolean),

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
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],

    // Enable minification with better settings
    minify: 'esbuild',

    // Optimize CSS minification
    cssMinify: true,

    // Generate source maps only in development
    sourcemap: process.env.NODE_ENV === 'development',

    // Optimize chunk splitting for better caching and loading
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        manualChunks: (id) => {
          // Vendor chunk for stable dependencies
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('framer-motion')) {
              return 'vendor';
            }
            // UI libraries
            if (id.includes('@chakra-ui') || id.includes('@emotion') || id.includes('styled-components')) {
              return 'ui';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Icons
            if (id.includes('react-icons')) {
              return 'icons';
            }
            // Markdown
            if (id.includes('react-markdown') || id.includes('remark')) {
              return 'markdown';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'utils';
            }
            // Other vendor libraries
            return 'vendor-misc';
          }

          // App chunks
          if (id.includes('/src/components/NeuraFit/')) {
            return 'neurafit';
          }
          if (id.includes('/src/store/')) {
            return 'state';
          }
        },
      },

      // External dependencies (if any CDN usage)
      external: [],
    },

    // Chunk size warning limit
    chunkSizeWarningLimit: 800,

    // Optimize CSS
    cssCodeSplit: true,

    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
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
