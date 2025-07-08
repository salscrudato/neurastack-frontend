/**
 * Optimized Chakra UI Provider
 *
 * Provides optimized Chakra UI setup with performance enhancements
 * and reduced CSS generation for better bundle size.
 */

import { ChakraProvider } from '@chakra-ui/react';
import { memo, type ReactNode } from 'react';
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
