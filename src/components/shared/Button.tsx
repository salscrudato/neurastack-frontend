/**
 * Enhanced Button Component
 * 
 * A modern, reusable button component with improved accessibility,
 * animations, and consistent styling across the application.
 */

import type { ButtonProps } from "@chakra-ui/react";
import { Button as ChakraButton, forwardRef } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { ReactElement, ReactNode } from "react";

const MotionButton = motion(ChakraButton);

interface EnhancedButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon' | 'rightIcon'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'outline';
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
}

const buttonVariants = {
  primary: {
    bg: "var(--gradient-primary)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "var(--shadow-brand)",
    _hover: {
      transform: "translateY(-2px) scale(1.02)",
      boxShadow: "var(--shadow-brand-hover)",
      bg: "var(--gradient-primary)"
    },
    _active: {
      transform: "translateY(0) scale(0.98)",
      boxShadow: "var(--shadow-brand-active)"
    }
  },
  secondary: {
    bg: "var(--color-surface-glass-strong)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-light)",
    boxShadow: "var(--shadow-card)",
    backdropFilter: "blur(12px)",
    _hover: {
      transform: "translateY(-1px) scale(1.01)",
      boxShadow: "var(--shadow-card-hover)",
      bg: "var(--color-surface-glass)"
    },
    _active: {
      transform: "translateY(0) scale(0.98)",
      boxShadow: "var(--shadow-card)"
    }
  },
  ghost: {
    bg: "transparent",
    color: "var(--color-text-secondary)",
    border: "1px solid transparent",
    _hover: {
      bg: "var(--color-surface-glass)",
      color: "var(--color-text-primary)",
      transform: "translateY(-1px)"
    },
    _active: {
      transform: "translateY(0) scale(0.95)"
    }
  },
  glass: {
    bg: "var(--color-surface-glass)",
    color: "var(--color-text-primary)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(16px)",
    boxShadow: "var(--shadow-glass-light)",
    _hover: {
      bg: "rgba(255, 255, 255, 0.9)",
      transform: "translateY(-1px) scale(1.01)",
      boxShadow: "var(--shadow-glass)"
    },
    _active: {
      transform: "translateY(0) scale(0.98)"
    }
  },
  outline: {
    bg: "transparent",
    color: "var(--color-brand-primary)",
    border: "2px solid var(--color-brand-primary)",
    _hover: {
      bg: "rgba(79, 156, 249, 0.08)",
      transform: "translateY(-1px) scale(1.01)"
    },
    _active: {
      transform: "translateY(0) scale(0.98)"
    }
  }
};

export const Button = forwardRef<EnhancedButtonProps, 'button'>(
  ({ variant = 'primary', children, isLoading, loadingText, leftIcon, rightIcon, ...props }, ref) => {
    const variantStyles = buttonVariants[variant];

    return (
      <MotionButton
        ref={ref}
        borderRadius="var(--radius-xl)"
        fontWeight="600"
        fontSize={{ base: "sm", md: "md" }}
        minH={{ base: "44px", md: "40px" }}
        px={{ base: 4, md: 5 }}
        py={{ base: 2, md: 2.5 }}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        isLoading={isLoading}
        loadingText={loadingText}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        _focus={{
          outline: "none",
          boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.3)"
        }}
        _disabled={{
          opacity: 0.6,
          cursor: "not-allowed",
          transform: "none",
          _hover: {
            transform: "none"
          }
        }}
        sx={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
        whileTap={{ scale: 0.95 }}
        {...variantStyles}
        {...props}
      >
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';
