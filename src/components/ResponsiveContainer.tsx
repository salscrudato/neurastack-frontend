import type { BoxProps, ContainerProps } from '@chakra-ui/react';
import { Box, Container } from '@chakra-ui/react';
import { forwardRef, useMemo } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface ResponsiveContainerProps extends Omit<ContainerProps, 'maxW'> {
  /** Container variant for different layouts */
  variant?: 'page' | 'chat' | 'modal' | 'card' | 'full-width';
  /** Enable fluid typography scaling */
  fluidTypography?: boolean;
  /** Enable container queries support */
  containerQueries?: boolean;
  /** Custom breakpoint overrides */
  breakpoints?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  /** Enable safe area padding */
  safeArea?: boolean;
  /** Optimize for mobile performance */
  mobileOptimized?: boolean;
}

/**
 * Enhanced responsive container with mobile-first design
 * Features:
 * - Fluid typography and spacing
 * - Container queries support
 * - Safe area handling for notched devices
 * - Performance optimizations
 * - Multiple layout variants
 */
export const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  (props, ref) => {
    const {
      variant = 'page',
      fluidTypography = true,
      containerQueries = true,
      breakpoints,
      safeArea = true,
      mobileOptimized = true,
      children,
      ...restProps
    } = props;
    const { isMobile, performanceConfig, spacing } = useMobileOptimization();

    // Container variant configurations
    const variantConfig = useMemo(() => {
      const configs = {
        page: {
          maxW: {
            base: '100%',
            sm: '100%',
            md: '768px',
            lg: '1024px',
            xl: '1200px',
            '2xl': '1400px',
          },
          px: {
            base: spacing.md,
            sm: spacing.lg,
            md: spacing.xl,
            lg: spacing.xl,
            xl: spacing.xl,
          },
          py: {
            base: spacing.sm,
            sm: spacing.md,
            md: spacing.lg,
            lg: spacing.xl,
          },
        },
        chat: {
          maxW: {
            base: '100%',
            sm: '100%',
            md: '800px',
            lg: '900px',
            xl: '1000px',
            '2xl': '1100px',
          },
          px: {
            base: spacing.sm,
            sm: spacing.md,
            md: 0,
            lg: 0,
            xl: 0,
          },
          py: {
            base: spacing.xs,
            sm: spacing.sm,
            md: spacing.md,
          },
        },
        modal: {
          maxW: {
            base: 'calc(100vw - 2rem)',
            sm: '480px',
            md: '600px',
            lg: '768px',
            xl: '900px',
          },
          px: {
            base: spacing.md,
            sm: spacing.lg,
            md: spacing.xl,
          },
          py: {
            base: spacing.md,
            sm: spacing.lg,
            md: spacing.xl,
          },
        },
        card: {
          maxW: {
            base: '100%',
            sm: '400px',
            md: '500px',
            lg: '600px',
            xl: '700px',
          },
          px: {
            base: spacing.md,
            sm: spacing.lg,
            md: spacing.xl,
          },
          py: {
            base: spacing.md,
            sm: spacing.lg,
          },
        },
        'full-width': {
          maxW: '100%',
          px: {
            base: spacing.sm,
            sm: spacing.md,
            md: spacing.lg,
            lg: spacing.xl,
          },
          py: {
            base: spacing.xs,
            sm: spacing.sm,
            md: spacing.md,
          },
        },
      };

      return configs[variant as keyof typeof configs] || configs.page;
    }, [variant, spacing]);

    // Merge custom breakpoints with defaults
    const finalConfig = useMemo(() => {
      if (!breakpoints) return variantConfig;

      const baseMaxW = variantConfig.maxW || {};
      return {
        ...variantConfig,
        maxW: { ...baseMaxW, ...breakpoints },
      };
    }, [variantConfig, breakpoints]);

    // Enhanced styles with mobile optimizations
    const enhancedStyles = useMemo(() => {
      const baseStyles: BoxProps['sx'] = {
        // Container queries support
        ...(containerQueries && {
          containerType: 'inline-size',
        }),
        
        // Safe area support
        ...(safeArea && {
          paddingLeft: 'max(env(safe-area-inset-left), var(--chakra-space-4))',
          paddingRight: 'max(env(safe-area-inset-right), var(--chakra-space-4))',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }),

        // Performance optimizations
        ...(mobileOptimized && performanceConfig),

        // Fluid typography
        ...(fluidTypography && {
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          lineHeight: 'clamp(1.4, 2vw, 1.6)',
        }),

        // Enhanced mobile styles
        ...(isMobile && {
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'manipulation',
        }),
      };

      return baseStyles;
    }, [
      containerQueries,
      safeArea,
      mobileOptimized,
      performanceConfig,
      fluidTypography,
      isMobile,
    ]);

    return (
      <Container
        ref={ref}
        maxW={finalConfig.maxW}
        px={finalConfig.px}
        py={finalConfig.py}
        sx={enhancedStyles}
        {...restProps}
      >
        {children}
      </Container>
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';

/**
 * Responsive Box component with enhanced mobile optimizations
 */
export const ResponsiveBox = forwardRef<
  HTMLDivElement,
  BoxProps & {
    fluidSpacing?: boolean;
    mobileOptimized?: boolean;
    containerQueries?: boolean;
  }
>((props, ref) => {
  const {
    fluidSpacing = true,
    mobileOptimized = true,
    containerQueries = false,
    children,
    ...restProps
  } = props;
    const { isMobile, performanceConfig } = useMobileOptimization();

    const enhancedStyles = useMemo(() => ({
      // Container queries support
      ...(containerQueries && {
        containerType: 'inline-size',
      }),

      // Fluid spacing
      ...(fluidSpacing && {
        padding: 'clamp(0.5rem, 2vw, 1.5rem)',
        margin: 'clamp(0.25rem, 1vw, 1rem)',
      }),

      // Performance optimizations
      ...(mobileOptimized && performanceConfig),

      // Mobile-specific optimizations
      ...(isMobile && {
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }),
    }), [fluidSpacing, mobileOptimized, performanceConfig, containerQueries, isMobile]);

    return (
      <Box ref={ref} sx={enhancedStyles} {...restProps}>
        {children}
      </Box>
    );
  }
);

ResponsiveBox.displayName = 'ResponsiveBox';

export default ResponsiveContainer;
