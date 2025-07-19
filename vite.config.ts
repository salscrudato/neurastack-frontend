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

// Note: Compression plugin removed - handled by hosting providers

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

    // Note: Compression is handled by hosting providers (Firebase, Vercel, etc.)
    // Removed compression plugins to reduce build complexity

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

  // Enhanced build optimizations for leading performance
  build: {
    // Target modern browsers for optimal bundle size
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],

    // Use esbuild for safer minification (prevents initialization issues)
    minify: 'esbuild',

    // Source maps for development, disabled for production
    sourcemap: process.env.NODE_ENV === 'development',

    // Enhanced chunk splitting strategy for optimal caching
    rollupOptions: {
      output: {
        // Optimized chunk naming with content hashing
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/js/${facadeModuleId || 'chunk'}-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] || 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/img/[name]-[hash].[ext]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash].[ext]`;
          }
          return `assets/[ext]/[name]-[hash].[ext]`;
        },

        // Simplified chunking strategy for better caching
        manualChunks: {
          // React and core UI libraries
          'vendor': [
            'react',
            'react-dom',
            'react/jsx-runtime',
            '@chakra-ui/react',
            '@emotion/react',
            '@emotion/styled',
            'framer-motion'
          ],

          // Firebase services
          'firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/analytics'
          ],

          // Utilities and content
          'utils': [
            'date-fns',
            'nanoid',
            'zustand',
            'react-router-dom',
            'react-icons',
            'react-markdown',
            'remark-gfm'
          ]
        },
      },

      // Optimize external dependencies
      external: [],

      // Optimized tree shaking for better bundle size
      treeshake: {
        moduleSideEffects: false, // Enable aggressive tree shaking
        propertyReadSideEffects: false, // Remove unused property reads
        tryCatchDeoptimization: false, // Enable more optimizations
      },
    },

    // Aggressive chunk size limits for mobile performance
    chunkSizeWarningLimit: 400,

    // Advanced CSS optimization
    cssCodeSplit: true,
    cssMinify: true,

    // Optimized asset handling
    assetsInlineLimit: 1024, // 1KB limit for inlining (mobile-optimized)

    // Enhanced module preload configuration
    modulePreload: {
      polyfill: false,
      resolveDependencies: (_filename, deps) => {
        // Preload critical chunks only
        return deps.filter(dep =>
          dep.includes('react-core') ||
          dep.includes('ui-framework') ||
          dep.includes('main')
        );
      },
    },

    // Report bundle size and performance
    reportCompressedSize: true,
  },

  // Simplified dependency optimization
  optimizeDeps: {
    // Pre-bundle critical dependencies for faster dev startup
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
      'date-fns',
      'nanoid',
      'react-icons/pi',
    ],

    // Exclude Firebase for better performance
    exclude: ['firebase'],

    // ESBuild options
    esbuildOptions: {
      target: 'es2020',
    },
  },

  // Enhanced development server configuration
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    open: true,

    // Advanced HMR configuration
    hmr: {
      overlay: false,
      clientPort: 3000,
    },

    // Optimize for mobile development
    headers: {
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },

    // Proxy configuration for API calls during development
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'https://neurastack-backend-638289111765.us-central1.run.app',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('proxy error', err);
            }
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Sending Request to the Target:', req.method, req.url);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            }
          });
        },
      },
    },
  },
});
