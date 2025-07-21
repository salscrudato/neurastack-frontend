import { Text, useColorModeValue, type TextProps } from '@chakra-ui/react';
import { forwardRef, memo } from 'react';

interface BrandLogoProps extends Omit<TextProps, 'children'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | { base: string; md: string };
  variant?: 'default' | 'header';
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
  const gradient = useColorModeValue(
    'linear(135deg, #4F9CF9 0%, #6366F1 50%, #8B5CF6 100%)',
    'linear(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)'
  );

  const logoStyles = {
    bgGradient: gradient,
    bgClip: 'text',
    color: 'transparent',
    sx: {
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textRendering: 'optimizeLegibility',
    },
  };

  let fontSizeValue;
  let fontWeightValue = '600';

  if (typeof size === 'object') {
    fontSizeValue = size;
  } else {
    const mappedSize = sizeMap[size];
    fontSizeValue = mappedSize.fontSize;
    fontWeightValue = mappedSize.fontWeight;
  }

  const baseProps = {
    ref,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    userSelect: "none" as const,
    letterSpacing: variant === 'header' ? '0em' : '0px',
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative" as const,
    lineHeight: variant === 'header' ? '1' : '1.2',
    margin: 0,
    padding: 0,
    display: 'inline-block',
    ...logoStyles,
    fontSize: fontSizeValue,
    fontWeight: fontWeightValue,
    ...props,
  };

  return (
    <Text {...baseProps}>
      {text}
    </Text>
  );
}));

BrandLogo.displayName = 'BrandLogo';