import { Box, type BoxProps, HStack, VStack } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React from 'react';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';

// ============================================================================
// Types
// ============================================================================

export interface SkeletonProps extends BoxProps {
  /** Whether skeleton is loading */
  isLoaded?: boolean;
  
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  
  /** Custom start color */
  startColor?: string;
  
  /** Custom end color */
  endColor?: string;
  
  /** Skeleton speed */
  speed?: number;
  
  /** Fade in when loaded */
  fadeDuration?: number;
}

// ============================================================================
// Animations
// ============================================================================

const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
`;

const waveAnimation = keyframes`
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
`;

const fadeInAnimation = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// ============================================================================
// Component
// ============================================================================

export const Skeleton: React.FC<SkeletonProps> = ({
  isLoaded = false,
  variant = 'rectangular',
  animation = 'pulse',
  startColor = 'rgba(79, 156, 249, 0.1)',
  endColor = 'rgba(79, 156, 249, 0.05)',
  speed = 0.8,
  fadeDuration = 0.4,
  children,
  ...props
}) => {
  const { config } = useOptimizedDevice();
  
  // Disable animations if user prefers reduced motion
  const shouldAnimate = !config.shouldReduceAnimations && animation !== 'none';

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return {
          height: '1em',
          borderRadius: '4px',
        };
      case 'circular':
        return {
          borderRadius: '50%',
          width: props.width || props.w || '40px',
          height: props.height || props.h || '40px',
        };
      case 'rounded':
        return {
          borderRadius: '12px',
        };
      case 'rectangular':
      default:
        return {
          borderRadius: '8px',
        };
    }
  };

  const getAnimationStyles = () => {
    if (!shouldAnimate) return {};

    switch (animation) {
      case 'pulse':
        return {
          animation: `${pulseAnimation} ${speed}s ease-in-out infinite`,
        };
      case 'wave':
        return {
          position: 'relative' as const,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: `linear-gradient(90deg, transparent, ${endColor}, transparent)`,
            animation: `${waveAnimation} ${speed * 2}s ease-in-out infinite`,
          },
        };
      default:
        return {};
    }
  };

  if (isLoaded) {
    return (
      <Box
        {...props}
        sx={{
          animation: shouldAnimate ? `${fadeInAnimation} ${fadeDuration}s ease-in-out` : undefined,
          ...props.sx,
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      bg={startColor}
      {...getVariantStyles()}
      {...getAnimationStyles()}
      {...props}
      sx={{
        ...getAnimationStyles(),
        ...props.sx,
      }}
    />
  );
};

// ============================================================================
// Skeleton Presets
// ============================================================================

export const SkeletonText: React.FC<{
  lines?: number;
  spacing?: number;
  skeletonHeight?: string;
  isLoaded?: boolean;
  children?: React.ReactNode;
}> = ({
  lines = 3,
  spacing = 2,
  skeletonHeight = '1em',
  isLoaded = false,
  children,
}) => {
  if (isLoaded) {
    return <>{children}</>;
  }

  return (
    <VStack spacing={spacing} align="stretch">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={skeletonHeight}
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </VStack>
  );
};

export const SkeletonCircle: React.FC<{
  size?: string;
  isLoaded?: boolean;
  children?: React.ReactNode;
}> = ({
  size = '40px',
  isLoaded = false,
  children,
}) => {
  if (isLoaded) {
    return <>{children}</>;
  }

  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
    />
  );
};

export const SkeletonAvatar: React.FC<{
  size?: string;
  name?: boolean;
  isLoaded?: boolean;
  children?: React.ReactNode;
}> = ({
  size = '40px',
  name = false,
  isLoaded = false,
  children,
}) => {
  if (isLoaded) {
    return <>{children}</>;
  }

  return (
    <HStack spacing={3}>
      <SkeletonCircle size={size} />
      {name && (
        <VStack spacing={2} align="stretch" flex={1}>
          <Skeleton height="1em" width="120px" />
          <Skeleton height="0.8em" width="80px" />
        </VStack>
      )}
    </HStack>
  );
};

export const SkeletonCard: React.FC<{
  isLoaded?: boolean;
  children?: React.ReactNode;
}> = ({
  isLoaded = false,
  children,
}) => {
  if (isLoaded) {
    return <>{children}</>;
  }

  return (
    <Box
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor="rgba(226, 232, 240, 0.6)"
      bg="rgba(255, 255, 255, 0.8)"
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack spacing={3}>
          <SkeletonCircle size="48px" />
          <VStack spacing={2} align="stretch" flex={1}>
            <Skeleton height="1.2em" width="150px" />
            <Skeleton height="1em" width="100px" />
          </VStack>
        </HStack>
        
        {/* Content */}
        <SkeletonText lines={3} />
        
        {/* Actions */}
        <HStack spacing={3} justify="flex-end">
          <Skeleton height="36px" width="80px" borderRadius="lg" />
          <Skeleton height="36px" width="100px" borderRadius="lg" />
        </HStack>
      </VStack>
    </Box>
  );
};

export const SkeletonChatMessage: React.FC<{
  isUser?: boolean;
  isLoaded?: boolean;
  children?: React.ReactNode;
}> = ({
  isUser = false,
  isLoaded = false,
  children,
}) => {
  if (isLoaded) {
    return <>{children}</>;
  }

  return (
    <HStack
      spacing={3}
      align="flex-start"
      justify={isUser ? 'flex-end' : 'flex-start'}
      w="full"
    >
      {!isUser && <SkeletonCircle size="32px" />}
      
      <Box
        maxW="70%"
        bg={isUser ? 'rgba(79, 156, 249, 0.1)' : 'rgba(248, 250, 252, 0.8)'}
        borderRadius="xl"
        p={4}
      >
        <SkeletonText lines={2} />
      </Box>
      
      {isUser && <SkeletonCircle size="32px" />}
    </HStack>
  );
};

export default Skeleton;
