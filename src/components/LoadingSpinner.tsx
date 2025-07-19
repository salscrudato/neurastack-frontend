/**
 * Simplified Loading Spinner Component
 * 
 * Provides essential loading states with optimized animations and accessibility.
 * Only includes variants that are actually used in the application.
 */

import {
  Box,
  Flex,
  SkeletonText,
  Spinner,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useAccessibility';

// Simple animation loop hook for essential animations
const useAnimationLoop = (callback: () => void, intervalMs: number = 100) => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(callback, intervalMs);
    return () => clearInterval(interval);
  }, [callback, intervalMs, prefersReducedMotion]);
};

interface LoaderProps {
  variant?: 'spinner' | 'skeleton' | 'team' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  lines?: number;
  progress?: number;
}

// Skeleton Loader Component
const SkeletonLoader = memo(({ lines = 3 }: { lines?: number }) => (
  <Box w="100%" maxW="400px">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonText
        key={i}
        mt={i > 0 ? 4 : 0}
        noOfLines={1}
        spacing="4"
        skeletonHeight="4"
        borderRadius="md"
      />
    ))}
  </Box>
));

// Team Wave Animation Loader
const WaveAnimation = memo(({ size = 'md' }: { size?: LoaderProps['size'] }) => {
  const [phase, setPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useAnimationLoop(() => {
    setPhase(p => (p + 1) % 8);
  }, 200);

  const containerSize = size === 'sm' ? 40 : size === 'md' ? 60 : size === 'lg' ? 80 : 100;

  return (
    <Box
      position="relative"
      w={`${containerSize}px`}
      h={`${containerSize}px`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="status"
      aria-label="Team processing"
      aria-live="polite"
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          w="8px"
          h={`${16 + Math.sin(phase + i) * 8}px`}
          bg="blue.500"
          borderRadius="full"
          mx="2px"
          animation={prefersReducedMotion ? 'none' : `wave 1s ease-in-out infinite`}
          sx={{
            animationDelay: `${i * 0.2}s`,
            '@keyframes wave': {
              '0%, 100%': { transform: 'scaleY(1)' },
              '50%': { transform: 'scaleY(1.5)' }
            }
          }}
        />
      ))}
    </Box>
  );
});

// Premium Spinner Component
const PremiumSpinner = memo(({ size = 'md' }: { size?: LoaderProps['size'] }) => {
  const [rotation, setRotation] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useAnimationLoop(() => {
    setRotation(r => (r + 5) % 360);
  }, 50);

  const containerSize = size === 'sm' ? 40 : size === 'md' ? 60 : size === 'lg' ? 80 : 100;

  return (
    <Box
      position="relative"
      w={`${containerSize}px`}
      h={`${containerSize}px`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="status"
      aria-label="Premium AI processing"
      aria-live="polite"
    >
      <Box
        position="absolute"
        w="100%"
        h="100%"
        borderRadius="50%"
        border="3px solid transparent"
        borderTopColor="blue.500"
        borderRightColor="purple.500"
        transform={`rotate(${rotation}deg)`}
        transition={prefersReducedMotion ? 'none' : 'transform 0.1s linear'}
      />
      <Box
        w="12px"
        h="12px"
        bg="linear-gradient(45deg, #4F9CF9, #8B5CF6)"
        borderRadius="50%"
        boxShadow="0 0 12px rgba(79, 156, 249, 0.6)"
      />
    </Box>
  );
});

// Main Loader component
export const Loader = memo(({ variant = 'spinner', size = 'md', message, fullScreen = false, lines = 3 }: LoaderProps) => {
  const bg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(0, 0, 0, 0.95)');
  const textColor = useColorModeValue('#64748B', '#94A3B8');

  const renderLoader = () => {
    switch (variant) {
      case 'spinner': return <Spinner size={size} color="blue.500" thickness="3px" />;
      case 'skeleton': return <SkeletonLoader lines={lines} />;
      case 'premium': return <PremiumSpinner size={size} />;
      case 'team': return <WaveAnimation size={size} />;
      default: return <Spinner size={size} color="blue.500" thickness="3px" />;
    }
  };

  const content = (
    <Flex
      direction="column"
      align="center"
      gap={4}
      p={6}
      borderRadius="xl"
      bg="rgba(255, 255, 255, 0.8)"
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading'}
    >
      {renderLoader()}
      {message && (
        <Text
          fontSize="sm"
          color={textColor}
          textAlign="center"
          fontWeight="500"
          letterSpacing="-0.01em"
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
        align="center"
        justify="center"
        bg={bg}
        backdropFilter="blur(8px)"
        zIndex={9999}
      >
        {content}
      </Flex>
    );
  }

  return content;
});

// Convenience exports
export function MessageSkeleton() { 
  return <Loader variant="skeleton" lines={2} />; 
}

export function PageLoader({ message = 'Loading page...' }: { message?: string }) {
  return (
    <Flex h="100vh" w="100%" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Loader size="lg" message={message} />
    </Flex>
  );
}

export default Loader;
