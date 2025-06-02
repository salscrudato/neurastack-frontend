import { memo } from 'react';
import {
  Box,
  Flex,
  Skeleton,
  SkeletonText,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Define keyframes manually since Chakra UI doesn't export it
const animationStyles = `
  @keyframes dotAnimation {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  @keyframes shimmerAnimation {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  @keyframes pulseAnimation {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

export const LoadingDots = memo<{ size?: 'sm' | 'md' | 'lg' }>(({ size = 'md' }) => {
  const dotSize = size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px';
  const dotColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Flex align="center" justify="center" gap={1}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          w={dotSize}
          h={dotSize}
          bg={dotColor}
          borderRadius="full"
          animation={`dotAnimation 1.4s ease-in-out infinite both`}
          style={{
            animationDelay: `${index * 0.16}s`,
          }}
        />
      ))}
    </Flex>
  );
});

LoadingDots.displayName = 'LoadingDots';

// Enhanced spinner with custom styling
export const EnhancedSpinner = memo<{
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}>(({ size = 'md', label }) => {
  const spinnerSize = size === 'sm' ? '20px' : size === 'md' ? '32px' : '48px';
  const color = useColorModeValue('brand.500', 'brand.300');

  return (
    <Flex direction="column" align="center" gap={3}>
      <Spinner
        size={size}
        color={color}
        thickness="3px"
        speed="0.8s"
        w={spinnerSize}
        h={spinnerSize}
      />
      {label && (
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
          {label}
        </Text>
      )}
    </Flex>
  );
});

EnhancedSpinner.displayName = 'EnhancedSpinner';

// Chat message skeleton loader
export const ChatMessageSkeleton = memo<{ isUser?: boolean }>(({ isUser = false }) => {
  return (
    <Flex
      direction="column"
      align={isUser ? "flex-end" : "flex-start"}
      gap={2}
      w="100%"
    >
      <Box
        maxW={{ base: "85%", md: "75%" }}
        w="fit-content"
      >
        <Skeleton
          height="60px"
          borderRadius="2xl"
          startColor={useColorModeValue('gray.100', 'gray.700')}
          endColor={useColorModeValue('gray.200', 'gray.600')}
        />
        <SkeletonText
          mt={2}
          noOfLines={2}
          spacing={2}
          skeletonHeight={2}
          startColor={useColorModeValue('gray.100', 'gray.700')}
          endColor={useColorModeValue('gray.200', 'gray.600')}
        />
      </Box>
    </Flex>
  );
});

ChatMessageSkeleton.displayName = 'ChatMessageSkeleton';

// Card skeleton loader
export const CardSkeleton = memo<{ lines?: number }>(({ lines = 3 }) => {
  return (
    <Box
      p={6}
      borderRadius="xl"
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow="sm"
    >
      <Skeleton height="20px" mb={4} />
      <SkeletonText noOfLines={lines} spacing={3} />
    </Box>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

// Pulse animation for loading states
export const PulseLoader = memo<{
  children: React.ReactNode;
  isLoading: boolean;
}>(({ children, isLoading }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <Box
      animation="pulseAnimation 2s ease-in-out infinite"
      opacity={0.7}
    >
      {children}
    </Box>
  );
});

PulseLoader.displayName = 'PulseLoader';

// Shimmer effect for loading content
export const ShimmerLoader = memo<{
  width?: string;
  height?: string;
  borderRadius?: string;
}>(({ width = '100%', height = '20px', borderRadius = 'md' }) => {
  const bgColor = useColorModeValue('gray.200', 'gray.700');
  const shimmerColor = useColorModeValue('gray.100', 'gray.600');

  return (
    <Box
      width={width}
      height={height}
      borderRadius={borderRadius}
      background={`linear-gradient(90deg, ${bgColor} 0px, ${shimmerColor} 40px, ${bgColor} 80px)`}
      backgroundSize="200px"
      animation={`shimmerAnimation 1.2s ease-in-out infinite`}
    />
  );
});

ShimmerLoader.displayName = 'ShimmerLoader';

// Progress indicator with smooth animations
export const ProgressIndicator = memo<{
  progress: number;
  label?: string;
  showPercentage?: boolean;
}>(({ progress, label, showPercentage = true }) => {
  const bgColor = useColorModeValue('gray.200', 'gray.700');
  const fillColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box w="100%">
      {(label || showPercentage) && (
        <Flex justify="space-between" mb={2}>
          {label && (
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              {Math.round(progress)}%
            </Text>
          )}
        </Flex>
      )}
      <Box
        w="100%"
        h="8px"
        bg={bgColor}
        borderRadius="full"
        overflow="hidden"
      >
        <motion.div
          style={{
            height: '100%',
            backgroundColor: fillColor,
            borderRadius: '9999px',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </Box>
    </Box>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

// Typing indicator for chat
export const TypingIndicator = memo(() => {
  return (
    <Flex align="center" gap={1} p={3}>
      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mr={2}>
        AI is typing
      </Text>
      <LoadingDots size="sm" />
    </Flex>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

// Success animation component
export const SuccessAnimation = memo<{ children: React.ReactNode }>(({ children }) => {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
});

SuccessAnimation.displayName = 'SuccessAnimation';

// Error shake animation
export const ErrorAnimation = memo<{ children: React.ReactNode }>(({ children }) => {
  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: [0, -10, 10, -10, 10, 0] }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
});

ErrorAnimation.displayName = 'ErrorAnimation';
