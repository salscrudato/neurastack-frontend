import {
  Box,
  HStack,
  Text,
  useColorModeValue,
  Progress,
} from '@chakra-ui/react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels = []
}: ProgressIndicatorProps) {
  const progressValue = ((currentStep + 1) / totalSteps) * 100;
  
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const progressBg = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box w="100%" mb={6}>
      {/* Step counter */}
      <HStack justify="space-between" align="center" mb={3}>
        <Text fontSize="sm" fontWeight="medium" color={textColor}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <Text fontSize="sm" color={subtextColor}>
          {Math.round(progressValue)}% complete
        </Text>
      </HStack>

      {/* Progress bar */}
      <Progress
        value={progressValue}
        colorScheme="blue"
        bg={progressBg}
        borderRadius="full"
        size="sm"
        hasStripe
        isAnimated
      />

      {/* Current step label */}
      {stepLabels[currentStep] && (
        <Text
          fontSize="xs"
          color={subtextColor}
          mt={2}
          textAlign="center"
        >
          {stepLabels[currentStep]}
        </Text>
      )}
    </Box>
  );
}
