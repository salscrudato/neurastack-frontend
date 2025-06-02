import { Text, useColorModeValue } from '@chakra-ui/react';
import type { TextProps } from '@chakra-ui/react';
import { memo, forwardRef } from 'react';

interface BrandLogoProps extends Omit<TextProps, 'children'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | { base: string; md: string };
  variant?: 'default' | 'header' | 'splash';
}

const sizeMap = {
  sm: { fontSize: 'lg', fontWeight: '600' },
  md: { fontSize: 'xl', fontWeight: '700' },
  lg: { fontSize: '2xl', fontWeight: '700' },
  xl: { fontSize: '4xl', fontWeight: '800' },
};

export const BrandLogo = memo(forwardRef<HTMLParagraphElement, BrandLogoProps>(({
  size = 'md',
  variant = 'default',
  ...props
}, ref) => {
  // Enhanced gradient styles for light mode, clean white for dark mode
  const logoStyles = useColorModeValue(
    {
      bgGradient: "linear(135deg, #4F9CF9 0%, #8B5CF6 100%)",
      bgClip: "text",
      // Use sx prop for webkit-specific styles to avoid React warnings
      sx: {
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      },
      backgroundClip: "text",
      // Ensure text is visible during gradient loading
      color: "transparent",
    },
    {
      color: "white",
    }
  );

  const { fontSize, fontWeight } = typeof size === 'object' ? sizeMap.lg : sizeMap[size];

  const baseProps = {
    ref,
    fontFamily: "Inter, system-ui, sans-serif",
    userSelect: "none" as const,
    letterSpacing: variant === 'splash' ? '0.5px' : '0px',
    transition: "all 0.2s ease",
    ...logoStyles,
    fontSize: typeof size === 'object' ? size : fontSize,
    fontWeight,
    ...props,
  };

  return (
    <Text {...baseProps}>
      neurastack
    </Text>
  );
}));

BrandLogo.displayName = 'BrandLogo';
