import {
  Box,
  HStack,
  Text,
  useColorModeValue,
  Progress,
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
  // Memoized calculations for better performance
  const progressValue = useMemo(() => ((currentStep + 1) / totalSteps) * 100, [currentStep, totalSteps]);

  // Memoized color values
  const colors = useMemo(() => ({
    text: useColorModeValue('gray.900', 'gray.100'),
    subtext: useColorModeValue('gray.600', 'gray.400'),
    progressBg: useColorModeValue('gray.200', 'gray.700')
  }), []);

  const { text: textColor, subtext: subtextColor, progressBg } = colors;

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

      {/* Progress bar - Enhanced with padding and modern styling */}
      <Box px={1}>
        <Progress
          value={progressValue}
          colorScheme="blue"
          bg={progressBg}
          borderRadius="full"
          size={{ base: "md", md: "lg" }}
          hasStripe
          isAnimated
          transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          sx={{
            '& > div': {
              borderRadius: 'full',
            }
          }}
        />
      </Box>


    </Box>
  );
});

export default ProgressIndicator;
