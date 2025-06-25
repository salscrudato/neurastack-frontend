import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { memo } from 'react';
import useEnhancedMobileOptimization from '../../hooks/useEnhancedMobileOptimization';

// Optimized animations with reduced motion support
const pulseAnimation = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const fadeInAnimation = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

interface OptimizedLoaderProps {
  variant?: 'spinner' | 'pulse' | 'shimmer' | 'dots' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  color?: string;
  thickness?: string;
  speed?: string;
  emptyColor?: string;
  className?: string;
}

/**
 * Enhanced Loader component with multiple variants, reduced motion support,
 * and performance optimizations
 */
export const OptimizedLoader = memo<OptimizedLoaderProps>(({
  variant = 'spinner',
  size = 'md',
  message,
  fullScreen = false,
  color = 'blue.500',
  thickness = '4px',
  speed = '0.65s',
  emptyColor = 'gray.200',
  className,
}) => {
  const {
    shouldUseReducedMotion,
    shouldOptimizeForPerformance,
  } = useEnhancedMobileOptimization();

  // Size configurations
  const sizeConfig = {
    sm: { spinner: '16px', text: 'sm', spacing: 2 },
    md: { spinner: '24px', text: 'md', spacing: 3 },
    lg: { spinner: '32px', text: 'lg', spacing: 4 },
    xl: { spinner: '48px', text: 'xl', spacing: 5 },
  };

  const currentSize = sizeConfig[size];

  // Render different loader variants
  const renderLoader = () => {
    if (shouldUseReducedMotion || shouldOptimizeForPerformance) {
      // Simplified loader for reduced motion or low-end devices
      return (
        <Box
          width={currentSize.spinner}
          height={currentSize.spinner}
          borderRadius="50%"
          border={`${thickness} solid ${emptyColor}`}
          borderTopColor={color}
          opacity={0.8}
        />
      );
    }

    switch (variant) {
      case 'pulse':
        return (
          <Box
            width={currentSize.spinner}
            height={currentSize.spinner}
            borderRadius="50%"
            bg={color}
            animation={`${pulseAnimation} ${speed} ease-in-out infinite`}
          />
        );

      case 'shimmer':
        return (
          <Box
            width="100px"
            height="20px"
            borderRadius="md"
            background={`linear-gradient(90deg, ${emptyColor} 0px, rgba(255,255,255,0.8) 40px, ${emptyColor} 80px)`}
            backgroundSize="200px 100%"
            animation={`${shimmerAnimation} 1.5s ease-in-out infinite`}
          />
        );

      case 'dots':
        return (
          <Flex gap={1} align="center">
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                width="8px"
                height="8px"
                borderRadius="50%"
                bg={color}
                animation={`${pulseAnimation} ${speed} ease-in-out infinite`}
                style={{
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </Flex>
        );

      case 'minimal':
        return (
          <Box
            width="2px"
            height={currentSize.spinner}
            bg={color}
            borderRadius="full"
            animation={`${pulseAnimation} ${speed} ease-in-out infinite`}
          />
        );

      case 'spinner':
      default:
        return (
          <Spinner
            size={size}
            color={color}
            thickness={thickness}
            speed={speed}
            emptyColor={emptyColor}
          />
        );
    }
  };

  const loaderContent = (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={currentSize.spacing}
      className={className}
      // Performance optimizations
      style={{
        willChange: shouldOptimizeForPerformance ? 'auto' : 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      {renderLoader()}
      
      {message && (
        <Text
          fontSize={currentSize.text}
          color="gray.600"
          textAlign="center"
          fontWeight="medium"
          animation={shouldUseReducedMotion ? 'none' : `${fadeInAnimation} 0.3s ease-in-out`}
          // Optimize text rendering
          style={{
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          {message}
        </Text>
      )}
    </Flex>
  );

  if (fullScreen) {
    return (
      <Flex
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(4px)"
        zIndex={9999}
        align="center"
        justify="center"
        // Performance optimizations for overlay
        style={{
          willChange: 'opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        {loaderContent}
      </Flex>
    );
  }

  return loaderContent;
});

OptimizedLoader.displayName = 'OptimizedLoader';

export default OptimizedLoader;
