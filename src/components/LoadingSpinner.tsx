import {
  Box,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'minimal' | 'dots';
}

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  fullScreen = false,
  variant = 'default'
}: LoadingSpinnerProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const sizeMap = {
    sm: { spinner: 'sm', text: 'sm' },
    md: { spinner: 'md', text: 'md' },
    lg: { spinner: 'lg', text: 'lg' },
    xl: { spinner: 'xl', text: 'xl' },
  };

  if (variant === 'minimal') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={4}>
        <Spinner size={sizeMap[size].spinner} color="blue.500" />
      </Box>
    );
  }

  if (variant === 'dots') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={4}>
        <VStack spacing={2}>
          <Box display="flex" gap={1}>
            {[0, 1, 2].map((i) => (
              <MotionBox
                key={i}
                w="8px"
                h="8px"
                bg="blue.500"
                borderRadius="full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </Box>
          {message && (
            <Text fontSize={sizeMap[size].text} color={textColor}>
              {message}
            </Text>
          )}
        </VStack>
      </Box>
    );
  }

  const content = (
    <VStack spacing={4}>
      <MotionBox
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Spinner
          size={sizeMap[size].spinner}
          color="blue.500"
          thickness="3px"
        />
      </MotionBox>

      {message && (
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Text
            fontSize={sizeMap[size].text}
            color={textColor}
            textAlign="center"
            animation={`${pulse} 2s ease-in-out infinite`}
          >
            {message}
          </Text>
        </MotionBox>
      )}
    </VStack>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={bg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
      minH="200px"
    >
      {content}
    </Box>
  );
}

// Skeleton loading component for chat messages
export function MessageSkeleton() {
  return (
    <Box p={4} maxW="80%">
      <VStack align="stretch" spacing={2}>
        <Box h="20px" bg="gray.200" borderRadius="md" w="60%" />
        <Box h="16px" bg="gray.200" borderRadius="md" w="80%" />
        <Box h="16px" bg="gray.200" borderRadius="md" w="40%" />
      </VStack>
    </Box>
  );
}

// Page loading component
export function PageLoader({ message = 'Loading page...' }: { message?: string }) {
  return (
    <LoadingSpinner
      size="lg"
      message={message}
      fullScreen
    />
  );
}
