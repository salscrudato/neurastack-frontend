import { Text, useColorModeValue, type TextProps } from '@chakra-ui/react';
import { forwardRef, memo } from 'react';

interface BrandLogoProps extends Omit<TextProps, 'children'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | { base: string; md: string };
  variant?: 'default' | 'header' | 'splash' | 'glass';
  text?: string;
}

const sizeMap = {
  sm: { fontSize: 'lg', fontWeight: '600' },
  md: { fontSize: 'xl', fontWeight: '600' },
  lg: { fontSize: '2xl', fontWeight: '600' },
  xl: { fontSize: '3xl', fontWeight: '600' },
};

export const BrandLogo = memo(forwardRef<HTMLParagraphElement, BrandLogoProps>(({
  size = 'md',
  variant = 'default',
  text = 'neurastack',
  ...props
}, ref) => {
  // Adapt gradient to light / dark mode for a cleaner, on‑brand look
  const gradient = useColorModeValue(
    'linear(135deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)',   // light
    'linear(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)'    // dark
  );

  const getLogoStyles = (): Record<string, any> => {
    if (variant === 'glass') {
      return {
        color: 'whiteAlpha.900',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',
      };
    }

    return {
      bgGradient: gradient,
      bgClip: 'text',
      color: 'transparent',
      sx: {
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textRendering: 'optimizeLegibility',
      },
    };
  };

  const { fontSize, fontWeight } = typeof size === 'object' ? sizeMap.lg : sizeMap[size];

  const baseProps = {
    ref,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    userSelect: "none" as const,
    letterSpacing: variant === 'splash' ? '0.5px' : variant === 'header' ? '0em' : '0px',
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative" as const,
    // Ensure perfect vertical centering
    lineHeight: variant === 'header' ? '1' : '1.2',
    margin: 0,
    padding: 0,
    display: 'inline-block',
    ...getLogoStyles(),
    fontSize: typeof size === 'object' ? size : fontSize,
    fontWeight,
    ...props,
  };

  return (
    <Text {...baseProps}>
      {text}
    </Text>
  );
}));

BrandLogo.displayName = 'BrandLogo';
