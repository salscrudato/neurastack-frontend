/**
 * Optimized Chakra UI Provider
 *
 * Provides optimized Chakra UI setup with performance enhancements
 * and reduced CSS generation for better bundle size.
 * Includes mobile optimizations for safe areas and touch interactions.
 */

import { ChakraProvider } from '@chakra-ui/react';
import { memo, type ReactNode, useEffect } from 'react';
import theme from '../theme/theme';

interface OptimizedChakraProviderProps {
  children: ReactNode;
}

/**
 * Optimized Chakra Provider with performance enhancements
 */
export const OptimizedChakraProvider = memo(function OptimizedChakraProvider({
  children
}: OptimizedChakraProviderProps) {
  useEffect(() => {
    // Mobile touch optimizations
    document.body.style.touchAction = 'manipulation';
    (document.body.style as any).WebkitTapHighlightColor = 'transparent';
    
    // Safe area handling
    document.documentElement.style.setProperty(
      '--safe-area-inset-top',
      'env(safe-area-inset-top)'
    );
    document.documentElement.style.setProperty(
      '--safe-area-inset-bottom',
      'env(safe-area-inset-bottom)'
    );
  }, []);

  return (
    <ChakraProvider
      theme={theme}
      resetCSS={false} // Use our custom global.css instead
      portalZIndex={1000} // Optimize portal rendering
    >
      {children}
    </ChakraProvider>
  );
});

export default OptimizedChakraProvider;