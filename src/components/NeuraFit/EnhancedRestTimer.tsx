import {
    Box,
    Button,
    Card,
    CardBody,
    CircularProgress,
    CircularProgressLabel,
    HStack,
    Icon,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { memo, useCallback, useEffect, useState } from 'react';
import {
    PiPauseBold,
    PiPlayBold,
    PiSkipForwardBold,
    PiTimerBold,
} from 'react-icons/pi';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

interface EnhancedRestTimerProps {
  timeRemaining: number; // in seconds
  totalRestTime: number; // original rest time in seconds
  isActive: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onAddTime: (seconds: number) => void;
  onSubtractTime: (seconds: number) => void;
  exerciseName?: string;
  nextExerciseName?: string;
  warningThreshold?: number; // seconds before showing warning (default: 5)
  onHapticFeedback?: (type: 'light' | 'medium' | 'heavy') => void;
}

export const EnhancedRestTimer = memo<EnhancedRestTimerProps>(({
  timeRemaining,
  totalRestTime,
  isPaused,
  onPause,
  onResume,
  onSkip,
  onAddTime,
  onSubtractTime,
  exerciseName,
  nextExerciseName,
  warningThreshold = 5,
  onHapticFeedback,
}) => {
  const [isWarning, setIsWarning] = useState(false);

  // Color scheme
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blue.200', 'blue.600');
  const textColor = useColorModeValue('blue.800', 'blue.100');
  const timerColor = useColorModeValue('blue.600', 'blue.300');
  const warningColor = useColorModeValue('red.500', 'red.300');

  // Warning state management
  useEffect(() => {
    const shouldWarn = timeRemaining <= warningThreshold && timeRemaining > 0;
    if (shouldWarn !== isWarning) {
      setIsWarning(shouldWarn);
      if (shouldWarn && onHapticFeedback) {
        onHapticFeedback('light');
      }
    }
  }, [timeRemaining, warningThreshold, isWarning, onHapticFeedback]);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}`;
  }, []);

  // Calculate progress percentage
  const progressPercentage = ((totalRestTime - timeRemaining) / totalRestTime) * 100;

  // Get motivational message based on time remaining
  const getMotivationalMessage = useCallback(() => {
    if (timeRemaining <= 0) return "Time's up! Ready to go!";
    if (timeRemaining <= 5) return "Get ready!";
    if (timeRemaining <= 10) return "Almost there!";
    if (timeRemaining <= 30) return "Take deep breaths";
    return "Rest and recover";
  }, [timeRemaining]);

  // Quick time adjustment options
  const timeAdjustments = [
    { label: '-30s', value: -30, color: 'red' },
    { label: '-15s', value: -15, color: 'orange' },
    { label: '+15s', value: 15, color: 'green' },
    { label: '+30s', value: 30, color: 'blue' },
  ];

  return (
    <MotionCard
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      bg={cardBg}
      borderColor={isWarning ? warningColor : borderColor}
      borderWidth="2px"
      shadow="xl"
      borderRadius="2xl"
      overflow="hidden"
    >
      <CardBody p={{ base: 6, md: 8 }}>
        <VStack spacing={{ base: 7, md: 8 }}>
          {/* Header */}
          <VStack spacing={{ base: 3, md: 2 }}>
            <HStack spacing={{ base: 3, md: 2 }} align="center">
              <Icon
                as={PiTimerBold}
                boxSize={{ base: 7, md: 6 }}
                color={isWarning ? warningColor : timerColor}
              />
              <Text
                fontSize={{ base: '2xl', md: 'lg' }}
                fontWeight="bold"
                color={isWarning ? warningColor : textColor}
              >
                Rest Time
              </Text>
            </HStack>
            {exerciseName && (
              <Text fontSize={{ base: "md", md: "sm" }} color="gray.500" textAlign="center" lineHeight="1.3">
                After {exerciseName}
              </Text>
            )}
          </VStack>

          {/* Circular Progress Timer */}
          <MotionBox
            animate={{
              scale: isWarning ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isWarning ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            <CircularProgress
              value={progressPercentage}
              size={{ base: '180px', md: '140px' }}
              thickness="10px"
              color={isWarning ? warningColor : timerColor}
              trackColor={useColorModeValue('gray.100', 'gray.700')}
              capIsRound
            >
              <CircularProgressLabel>
                <VStack spacing={{ base: 2, md: 1 }}>
                  <Text
                    fontSize={{ base: '4xl', md: '2xl' }}
                    fontWeight="bold"
                    color={isWarning ? warningColor : timerColor}
                    fontFamily="mono"
                  >
                    {formatTime(timeRemaining)}
                  </Text>
                  <Text
                    fontSize={{ base: "sm", md: "xs" }}
                    color="gray.500"
                    textAlign="center"
                    maxW={{ base: "100px", md: "80px" }}
                    lineHeight="1.2"
                  >
                    {getMotivationalMessage()}
                  </Text>
                </VStack>
              </CircularProgressLabel>
            </CircularProgress>
          </MotionBox>

          {/* Next Exercise Preview */}
          {nextExerciseName && (
            <Box textAlign="center">
              <Text fontSize={{ base: "md", md: "sm" }} color="gray.500" mb={{ base: 2, md: 1 }}>
                Next Exercise:
              </Text>
              <Text fontSize={{ base: "lg", md: "md" }} fontWeight="semibold" color={textColor} lineHeight="1.2">
                {nextExerciseName}
              </Text>
            </Box>
          )}

          {/* Control Buttons */}
          <VStack spacing={{ base: 5, md: 4 }} w="100%">
            {/* Primary Controls */}
            <HStack spacing={{ base: 4, md: 3 }} w="100%" justify="center">
              <Button
                colorScheme={isPaused ? 'green' : 'orange'}
                size={{ base: 'lg', md: 'md' }}
                leftIcon={<Icon as={isPaused ? PiPlayBold : PiPauseBold} boxSize={{ base: 6, md: 5 }} />}
                onClick={isPaused ? onResume : onPause}
                borderRadius="xl"
                minW={{ base: '140px', md: '100px' }}
                h={{ base: '56px', md: '40px' }}
                fontSize={{ base: 'lg', md: 'sm' }}
                _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                transition="all 0.2s ease"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>

              <Button
                colorScheme="blue"
                size={{ base: 'lg', md: 'md' }}
                leftIcon={<Icon as={PiSkipForwardBold} boxSize={{ base: 6, md: 5 }} />}
                onClick={onSkip}
                borderRadius="xl"
                minW={{ base: '140px', md: '100px' }}
                h={{ base: '56px', md: '40px' }}
                fontSize={{ base: 'lg', md: 'sm' }}
                _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                transition="all 0.2s ease"
              >
                Skip Rest
              </Button>
            </HStack>

            {/* Time Adjustment Controls */}
            <VStack spacing={{ base: 3, md: 2 }} w="100%">
              <Text fontSize={{ base: "sm", md: "xs" }} color="gray.500" textAlign="center" fontWeight="medium">
                Adjust Rest Time
              </Text>
              <HStack spacing={{ base: 3, md: 2 }} justify="center" flexWrap="wrap">
                {timeAdjustments.map(({ label, value, color }) => (
                  <Button
                    key={label}
                    size={{ base: "md", md: "sm" }}
                    variant="outline"
                    colorScheme={color}
                    onClick={() => value > 0 ? onAddTime(value) : onSubtractTime(Math.abs(value))}
                    isDisabled={value < 0 && timeRemaining + value <= 0}
                    borderRadius="lg"
                    minW={{ base: "72px", md: "60px" }}
                    h={{ base: "40px", md: "32px" }}
                    fontSize={{ base: "sm", md: "xs" }}
                    _hover={{ transform: 'translateY(-1px)' }}
                    transition="all 0.2s ease"
                  >
                    {label}
                  </Button>
                ))}
              </HStack>
            </VStack>
          </VStack>
        </VStack>
      </CardBody>
    </MotionCard>
  );
});

EnhancedRestTimer.displayName = 'EnhancedRestTimer';
