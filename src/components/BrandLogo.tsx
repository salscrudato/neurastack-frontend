import { Text } from '@chakra-ui/react';
import type { TextProps } from '@chakra-ui/react';
import { memo, forwardRef } from 'react';

interface BrandLogoProps extends Omit<TextProps, 'children'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | { base: string; md: string };
  variant?: 'default' | 'header' | 'splash' | 'glass';
  text?: string;
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
  text = 'neurastack',
  ...props
}, ref) => {
  // Modern gradient styles - always light mode
  const getLogoStyles = () => {
    if (variant === 'glass') {
      return {
        color: "#FFFFFF",
        textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      };
    }

    return {
      bgGradient: "linear(135deg, #4F9CF9 0%, #8B5CF6 100%)",
      bgClip: "text",
      sx: {
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      },
      color: "transparent",
      // Fallback for browsers that don't support background-clip
      _before: {
        content: `"${text}"`,
        position: "absolute",
        top: 0,
        left: 0,
        background: "linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        zIndex: -1,
      },
    };
  };

  const { fontSize, fontWeight } = typeof size === 'object' ? sizeMap.lg : sizeMap[size];

  const baseProps = {
    ref,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    userSelect: "none" as const,
    letterSpacing: variant === 'splash' ? '0.5px' : variant === 'header' ? '-0.025em' : '0px',
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative" as const,
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
