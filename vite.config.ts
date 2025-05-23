import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import svgr             from 'vite-plugin-svgr';
import path             from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),     // React + fast-refresh
    svgr({       // <Logo /> from .svg files
      exportAsDefault: true,   // `import Logo from './logo.svg'`
      svgrOptions: { icon: true }
    })
  ],

  resolve: {
    alias: {
      // ---- asset shortcuts -------------------------------------------------
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@icons' : path.resolve(__dirname, 'src/assets/icons'),
      '@img'   : path.resolve(__dirname, 'src/assets/img'),
      // ---- feature folders -------------------------------------------------
      '@pages' : path.resolve(__dirname, 'src/pages'),
      '@store' : path.resolve(__dirname, 'src/store'),
      '@theme' : path.resolve(__dirname, 'src/theme'),
    },
  },

  css: {
    // example: enable global CSS modules if you later need them
    modules: { localsConvention: 'camelCase' }
  },

  server: {
    port: 5173,
    open: true,
  },

  preview: {
    port: 4173
  }
});