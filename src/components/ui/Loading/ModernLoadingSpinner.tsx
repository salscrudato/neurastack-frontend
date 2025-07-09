/**
 * Modern Loading Spinner Component
 * 
 * Enhanced loading spinner with modern blue styling, smooth animations,
 * and improved accessibility features.
 */

import { Box, Flex, Text, type BoxProps } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';

// ============================================================================
// Types
// ============================================================================

export interface ModernLoadingSpinnerProps extends BoxProps {
  /** Loading text */
  text?: string;
  
  /** Spinner size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color scheme */
  colorScheme?: 'primary' | 'secondary' | 'white';
  
  /** Show text below spinner */
  showText?: boolean;
  
  /** Custom loading content */
  children?: ReactNode;
  
  /** Disable animations */
  disableAnimations?: boolean;
  
  /** Full screen overlay */
  overlay?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const ModernLoadingSpinner: React.FC<ModernLoadingSpinnerProps> = ({
  text = 'Loading...',
  size = 'md',
  colorScheme = 'primary',
  showText = true,
  children,
  disableAnimations = false,
  overlay = false,
  ...props
}) => {
  const { config } = useOptimizedDevice();
  
  // Determine if animations should be disabled
  const shouldDisableAnimations = disableAnimations || config.shouldReduceAnimations;
  
  // Size configurations
  const sizeConfig = {
    xs: {
      spinnerSize: '16px',
      borderWidth: '2px',
      fontSize: 'xs',
    },
    sm: {
      spinnerSize: '20px',
      borderWidth: '2px',
      fontSize: 'sm',
    },
    md: {
      spinnerSize: '24px',
      borderWidth: '3px',
      fontSize: 'md',
    },
    lg: {
      spinnerSize: '32px',
      borderWidth: '3px',
      fontSize: 'lg',
    },
    xl: {
      spinnerSize: '40px',
      borderWidth: '4px',
      fontSize: 'xl',
    },
  };
  
  // Color scheme configurations
  const colorSchemes = {
    primary: {
      spinnerColor: '#3b82f6',
      textColor: '#64748b',
      glowColor: 'rgba(59, 130, 246, 0.25)',
    },
    secondary: {
      spinnerColor: '#0ea5e9',
      textColor: '#64748b',
      glowColor: 'rgba(14, 165, 233, 0.25)',
    },
    white: {
      spinnerColor: '#ffffff',
      textColor: '#ffffff',
      glowColor: 'rgba(255, 255, 255, 0.25)',
    },
  };
  
  const currentSize = sizeConfig[size];
  const currentColors = colorSchemes[colorScheme];
  
  // Spinner component
  const Spinner = () => (
    <Box
      w={currentSize.spinnerSize}
      h={currentSize.spinnerSize}
      border={`${currentSize.borderWidth} solid transparent`}
      borderTop={`${currentSize.borderWidth} solid ${currentColors.spinnerColor}`}
      borderRight={`${currentSize.borderWidth} solid ${currentColors.spinnerColor}`}
      borderRadius="50%"
      sx={{
        animation: shouldDisableAnimations 
          ? 'none' 
          : 'modernSpin 1s linear infinite',
        '@keyframes modernSpin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        filter: shouldDisableAnimations 
          ? 'none' 
          : `drop-shadow(0 0 8px ${currentColors.glowColor})`,
        willChange: 'transform',
      }}
    />
  );

  
  // Main content
  const LoadingContent = () => (
    <Flex
      direction="column"
      align="center"
      gap={3}
      {...props}
    >
      {children || <Spinner />}
      
      {showText && text && (
        <Text
          fontSize={currentSize.fontSize}
          color={currentColors.textColor}
          fontWeight="500"
          letterSpacing="-0.01em"
          textAlign="center"
          sx={{
            animation: shouldDisableAnimations 
              ? 'none' 
              : 'modernFadeIn 0.5s ease-out',
            '@keyframes modernFadeIn': {
              '0%': { opacity: 0, transform: 'translateY(8px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {text}
        </Text>
      )}
    </Flex>
  );
  
  // Overlay wrapper
  if (overlay) {
    return (
      <Flex
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(8px)"
        align="center"
        justify="center"
        zIndex={9999}
        sx={{
          WebkitBackdropFilter: "blur(8px)",
          animation: shouldDisableAnimations
            ? 'none'
            : 'modernOverlayFadeIn 0.3s ease-out',
          '@keyframes modernOverlayFadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
        }}
      >
        <LoadingContent />
      </Flex>
    );
  }
  
  return <LoadingContent />;
};

// ============================================================================
// Animation Components
// ============================================================================

// Dots animation component
const DotsAnimation: React.FC = () => (
  <Flex align="center" gap={1}>
    {[0, 1, 2].map((index) => (
      <Box
        key={index}
        w="4px"
        h="4px"
        bg="currentColor"
        borderRadius="50%"
        sx={{
          animation: `modernDots 1.4s ease-in-out infinite both`,
          animationDelay: `${index * 0.16}s`,
          '@keyframes modernDots': {
            '0%, 80%, 100%': {
              transform: 'scale(0)',
              opacity: 0.5,
            },
            '40%': {
              transform: 'scale(1)',
              opacity: 1,
            },
          },
        }}
      />
    ))}
  </Flex>
);

// Pulse animation component
const PulseAnimation: React.FC = () => (
  <Box
    w="24px"
    h="24px"
    bg="currentColor"
    borderRadius="50%"
    sx={{
      animation: 'modernPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      '@keyframes modernPulse': {
        '0%, 100%': {
          opacity: 1,
          transform: 'scale(1)',
        },
        '50%': {
          opacity: 0.5,
          transform: 'scale(1.1)',
        },
      },
    }}
  />
);

// ============================================================================
// Preset Components
// ============================================================================

export const LoadingDots: React.FC<Omit<ModernLoadingSpinnerProps, 'children'>> = (props) => (
  <ModernLoadingSpinner {...props}>
    <DotsAnimation />
  </ModernLoadingSpinner>
);

export const LoadingPulse: React.FC<Omit<ModernLoadingSpinnerProps, 'children'>> = (props) => (
  <ModernLoadingSpinner {...props}>
    <PulseAnimation />
  </ModernLoadingSpinner>
);

export const LoadingOverlay: React.FC<ModernLoadingSpinnerProps> = (props) => (
  <ModernLoadingSpinner overlay {...props} />
);

// ============================================================================
// Export
// ============================================================================

export default ModernLoadingSpinner;
