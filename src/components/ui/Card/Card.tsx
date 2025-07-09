import { Box, type BoxProps } from '@chakra-ui/react';
import { forwardRef } from 'react';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';

// ============================================================================
// Types
// ============================================================================

export interface CardProps extends Omit<BoxProps, 'variant'> {
  /** Card variant */
  variant?: 'default' | 'glass' | 'elevated' | 'outlined' | 'gradient';
  
  /** Enable hover effects */
  hoverable?: boolean;
  
  /** Enable click effects */
  clickable?: boolean;
  
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Border radius size */
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  
  /** Enable glass morphism effect */
  glassEffect?: boolean;
  
  /** Enable gradient background */
  gradientDirection?: 'primary' | 'secondary' | 'accent';
}

// ============================================================================
// Styles
// ============================================================================

const getVariantStyles = (variant: CardProps['variant'], glassEffect: boolean, gradientDirection?: CardProps['gradientDirection']) => {
  const baseGlass = glassEffect ? {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  } : {};

  switch (variant) {
    case 'glass':
      return {
        bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(79, 156, 249, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        ...baseGlass,
      };

    case 'elevated':
      return {
        bg: '#FFFFFF',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(226, 232, 240, 0.6)',
      };

    case 'outlined':
      return {
        bg: 'transparent',
        border: '2px solid transparent',
        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgba(79, 156, 249, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box',
      };

    case 'gradient':
      const gradients = {
        primary: 'linear-gradient(135deg, rgba(79, 156, 249, 0.05) 0%, rgba(99, 102, 241, 0.03) 100%)',
        secondary: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%)',
        accent: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(14, 165, 233, 0.03) 100%)',
      };
      return {
        bg: gradients[gradientDirection || 'primary'],
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 16px rgba(79, 156, 249, 0.08)',
        ...baseGlass,
      };

    default:
      return {
        bg: '#FFFFFF',
        border: '1px solid rgba(226, 232, 240, 0.6)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      };
  }
};

const getPaddingStyles = (padding: CardProps['padding']) => {
  switch (padding) {
    case 'none':
      return { p: 0 };
    case 'sm':
      return { p: 4 };
    case 'md':
      return { p: 6 };
    case 'lg':
      return { p: 8 };
    case 'xl':
      return { p: 10 };
    default:
      return { p: 6 };
  }
};

const getBorderRadiusStyles = (borderRadius: CardProps['borderRadius']) => {
  switch (borderRadius) {
    case 'sm':
      return { borderRadius: 'md' };
    case 'md':
      return { borderRadius: 'lg' };
    case 'lg':
      return { borderRadius: 'xl' };
    case 'xl':
      return { borderRadius: '2xl' };
    case '2xl':
      return { borderRadius: '3xl' };
    case '3xl':
      return { borderRadius: '3xl' };
    default:
      return { borderRadius: 'xl' };
  }
};

const getInteractionStyles = (hoverable: boolean, clickable: boolean, isMobile: boolean) => {
  const baseTransition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
  
  if (!hoverable && !clickable) return { transition: baseTransition };

  const hoverStyles = hoverable ? {
    transform: isMobile ? 'translateY(-1px)' : 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(79, 156, 249, 0.15), 0 6px 20px rgba(0, 0, 0, 0.1)',
  } : {};

  const activeStyles = clickable ? {
    transform: 'translateY(0)',
    boxShadow: '0 4px 16px rgba(79, 156, 249, 0.1)',
  } : {};

  return {
    transition: baseTransition,
    cursor: clickable ? 'pointer' : 'default',
    _hover: hoverStyles,
    _active: activeStyles,
  };
};

// ============================================================================
// Component
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  hoverable = false,
  clickable = false,
  padding = 'md',
  borderRadius = 'xl',
  glassEffect = false,
  gradientDirection,
  children,
  ...props
}, ref) => {
  const { capabilities } = useOptimizedDevice();

  const variantStyles = getVariantStyles(variant, glassEffect, gradientDirection);
  const paddingStyles = getPaddingStyles(padding);
  const borderRadiusStyles = getBorderRadiusStyles(borderRadius);
  const interactionStyles = getInteractionStyles(hoverable, clickable, capabilities.isMobile);

  return (
    <Box
      ref={ref}
      {...variantStyles}
      {...paddingStyles}
      {...borderRadiusStyles}
      {...interactionStyles}
      {...props}
    >
      {children}
    </Box>
  );
});

Card.displayName = 'Card';

export default Card;
