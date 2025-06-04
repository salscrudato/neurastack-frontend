import {
  Box,
  Spinner,
  Text,
  Flex,
  Skeleton,
  SkeletonText,
  useColorModeValue,
} from '@chakra-ui/react';
import { memo } from 'react';

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'skeleton';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  lines?: number; // For skeleton variant
}

const LoadingDots = memo(({ size = 'md' }: { size?: string }) => {
  const dotSize = size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px';

  return (
    <Flex align="center" gap={1}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          w={dotSize}
          h={dotSize}
          bg="blue.500"
          borderRadius="full"
          animation={`pulse 1.4s ease-in-out ${i * 0.16}s infinite both`}
          sx={{
            '@keyframes pulse': {
              '0%, 80%, 100%': { transform: 'scale(0)' },
              '40%': { transform: 'scale(1)' }
            }
          }}
        />
      ))}
    </Flex>
  );
});

LoadingDots.displayName = 'LoadingDots';

const SkeletonLoader = memo(({ lines = 3 }: { lines?: number }) => (
  <Box w="100%" maxW="400px">
    <Skeleton height="20px" mb={3} />
    <SkeletonText noOfLines={lines} spacing={2} />
  </Box>
));

SkeletonLoader.displayName = 'SkeletonLoader';

export const Loader = memo(({
  variant = 'spinner',
  size = 'md',
  message,
  fullScreen = false,
  lines = 3
}: LoaderProps) => {
  const bg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(0, 0, 0, 0.9)');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots size={size} />;
      case 'skeleton':
        return <SkeletonLoader lines={lines} />;
      default:
        return <Spinner size={size} color="blue.500" thickness="3px" />;
    }
  };

  const content = (
    <Flex direction="column" align="center" gap={3}>
      {renderLoader()}
      {message && (
        <Text fontSize="sm" color={textColor} textAlign="center">
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
        bg={bg}
        backdropFilter="blur(4px)"
        zIndex={9999}
        align="center"
        justify="center"
      >
        {content}
      </Flex>
    );
  }

  return content;
});

Loader.displayName = 'Loader';

// Simplified message skeleton
export function MessageSkeleton() {
  return <Loader variant="skeleton" lines={2} />;
}

// Page loading component
export function PageLoader({ message = 'Loading page...' }: { message?: string }) {
  return (
    <Flex
      h="100vh"
      w="100%"
      align="center"
      justify="center"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
    >
      <Loader size="lg" message={message} />
    </Flex>
  );
}

// Legacy exports for backward compatibility
export default Loader;
