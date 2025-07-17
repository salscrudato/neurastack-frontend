/**
 * Enhanced Card Component
 * 
 * A modern, reusable card component with glass morphism effects,
 * consistent spacing, and improved accessibility.
 */

import type { BoxProps } from "@chakra-ui/react";
import { Box, forwardRef } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const MotionBox = motion(Box);

interface CardProps extends Omit<BoxProps, 'variant'> {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined' | 'subtle';
  children: ReactNode;
  isHoverable?: boolean;
  isClickable?: boolean;
}

const cardVariants = {
  default: {
    bg: "var(--color-surface-primary)",
    border: "1px solid var(--color-border-light)",
    boxShadow: "var(--shadow-card)"
  },
  glass: {
    bg: "var(--color-surface-glass-strong)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "var(--shadow-glass-light)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)"
  },
  elevated: {
    bg: "var(--color-surface-primary)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--shadow-lg)"
  },
  outlined: {
    bg: "transparent",
    border: "2px solid var(--color-border-medium)",
    boxShadow: "none"
  },
  subtle: {
    bg: "var(--color-surface-secondary)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--shadow-xs)"
  }
};

const hoverEffects = {
  default: {
    transform: "translateY(-2px)",
    boxShadow: "var(--shadow-card-hover)"
  },
  glass: {
    transform: "translateY(-2px) scale(1.01)",
    boxShadow: "var(--shadow-glass)",
    bg: "rgba(255, 255, 255, 0.9)"
  },
  elevated: {
    transform: "translateY(-4px)",
    boxShadow: "var(--shadow-xl)"
  },
  outlined: {
    transform: "translateY(-1px)",
    borderColor: "var(--color-border-strong)"
  },
  subtle: {
    transform: "translateY(-1px)",
    bg: "var(--color-surface-tertiary)",
    boxShadow: "var(--shadow-sm)"
  }
};

export const Card = forwardRef<CardProps, 'div'>(
  ({ 
    variant = 'default', 
    children, 
    isHoverable = false, 
    isClickable = false,
    ...props 
  }, ref) => {
    const variantStyles = cardVariants[variant];
    const hoverStyles = hoverEffects[variant];

    return (
      <MotionBox
        ref={ref}
        borderRadius="var(--radius-2xl)"
        p={{ base: 4, md: 5 }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        cursor={isClickable ? "pointer" : "default"}
        position="relative"
        overflow="hidden"
        _hover={isHoverable || isClickable ? hoverStyles : undefined}
        _focus={isClickable ? {
          outline: "none",
          boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.3)"
        } : undefined}
        _active={isClickable ? {
          transform: "translateY(0) scale(0.98)"
        } : undefined}
        sx={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          ...(variant === 'glass' && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
              pointerEvents: 'none'
            }
          })
        }}
        whileHover={isHoverable || isClickable ? { scale: 1.01 } : undefined}
        whileTap={isClickable ? { scale: 0.98 } : undefined}
        {...variantStyles}
        {...props}
      >
        {children}
      </MotionBox>
    );
  }
);

Card.displayName = 'Card';
