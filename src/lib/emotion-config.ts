/**
 * Emotion Configuration
 * 
 * Provides stable Emotion cache configuration to prevent initialization errors
 * and ensure proper CSS-in-JS functionality with Chakra UI.
 */

import createCache from '@emotion/cache';

/**
 * Create a stable Emotion cache with proper configuration
 * This prevents the "Cannot access 'ge' before initialization" error
 */
export const emotionCache = createCache({
  key: 'neurastack-emotion',
  prepend: true, // Prepend styles to head for proper cascade order
  speedy: process.env.NODE_ENV === 'production', // Enable speedy mode in production
  stylisPlugins: [], // Disable plugins that might cause conflicts
  container: typeof document !== 'undefined' ? document.head : undefined,
});

/**
 * Emotion theme configuration for Chakra UI compatibility
 */
export const emotionTheme = {
  // Ensure proper CSS custom properties
  cssVarPrefix: 'chakra',
  
  // Stable breakpoints that match Chakra UI
  breakpoints: {
    base: '0em',
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
  
  // Color mode configuration
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
    disableTransitionOnChange: false,
  },
};

/**
 * CSS-in-JS utilities for styled-components compatibility
 */
export const cssUtils = {
  // Media query helpers
  mobile: '@media (max-width: 768px)',
  tablet: '@media (min-width: 769px) and (max-width: 1024px)',
  desktop: '@media (min-width: 1025px)',
  
  // Common CSS patterns
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  
  // Performance optimizations
  willChange: {
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
  },
};

/**
 * Initialize Emotion with proper error handling
 */
export function initializeEmotion(): void {
  try {
    // Ensure DOM is ready
    if (typeof document === 'undefined') {
      return;
    }

    // Check if Emotion is already initialized
    const existingCache = document.querySelector('[data-emotion]');
    if (existingCache) {
      console.log('✅ Emotion cache already initialized');
      return;
    }

    // Create cache container if it doesn't exist
    if (!document.head.querySelector(`[data-emotion="${emotionCache.key}"]`)) {
      const cacheContainer = document.createElement('style');
      cacheContainer.setAttribute('data-emotion', emotionCache.key);
      cacheContainer.setAttribute('data-s', '');
      document.head.appendChild(cacheContainer);
    }

    console.log('✅ Emotion initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Emotion:', error);

    // Fallback: Create minimal cache
    try {
      createCache({
        key: 'fallback',
        prepend: false,
        speedy: false,
      });
      console.log('✅ Emotion fallback cache created');
    } catch (fallbackError) {
      console.error('❌ Emotion fallback failed:', fallbackError);
    }
  }
}

/**
 * Cleanup function for development hot reloading
 */
export function cleanupEmotion(): void {
  if (typeof document === 'undefined') return;
  
  try {
    // Remove existing Emotion styles during hot reload
    const emotionStyles = document.querySelectorAll('[data-emotion]');
    emotionStyles.forEach(style => {
      if (style.getAttribute('data-emotion')?.startsWith('css-')) {
        style.remove();
      }
    });
    
    console.log('🧹 Emotion styles cleaned up');
  } catch (error) {
    console.warn('⚠️ Emotion cleanup failed:', error);
  }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEmotion);
  } else {
    initializeEmotion();
  }
  
  // Cleanup on page unload (for development)
  if (process.env.NODE_ENV === 'development') {
    window.addEventListener('beforeunload', cleanupEmotion);
  }
}
