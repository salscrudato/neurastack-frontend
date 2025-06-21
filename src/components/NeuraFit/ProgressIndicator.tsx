import {
    Box,
    HStack,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import { memo, useMemo } from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = memo(function ProgressIndicator({
  currentStep,
  totalSteps
}: ProgressIndicatorProps) {
  // Color values - must be called at top level
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const progressBg = useColorModeValue('gray.200', 'gray.700');

  // Memoized calculations for better performance
  const progressValue = useMemo(() => ((currentStep + 1) / totalSteps) * 100, [currentStep, totalSteps]);

  return (
    <Box w="100%" mb={4}>
      {/* Step counter - Enhanced Typography */}
      <HStack justify="space-between" align="center" mb={4} px={1}>
        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="semibold" color={textColor}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <Text fontSize={{ base: "sm", md: "md" }} color={subtextColor} fontWeight="medium">
          {Math.round(progressValue)}% complete
        </Text>
      </HStack>

      {/* Progress bar - Enhanced with NeuraFit gradient styling */}
      <Box px={1} position="relative">
        <Box
          w="full"
          h={{ base: "8px", md: "10px" }}
          bg={progressBg}
          borderRadius="full"
          overflow="hidden"
          position="relative"
        >
          <Box
            w={`${progressValue}%`}
            h="full"
            bg="linear-gradient(90deg,
              rgba(79, 156, 249, 0.8) 0%,
              rgba(139, 92, 246, 1) 50%,
              rgba(99, 102, 241, 0.8) 100%
            )"
            borderRadius="full"
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            style={{
              boxShadow: "0 0 20px rgba(79, 156, 249, 0.4)"
            }}
          />
        </Box>
      </Box>


    </Box>
  );
});

export default ProgressIndicator;
