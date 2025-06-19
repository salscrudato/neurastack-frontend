import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CircularProgress,
    CircularProgressLabel,
    Divider,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Progress,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
    Textarea,
    useColorModeValue,
    useToast,
    VStack
} from '@chakra-ui/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    PiCheckBold,
    PiHeartBold,
    PiPauseBold,
    PiPlayBold,
    PiSkipForwardBold,
    PiStopBold,
    PiTargetBold,
    PiTimerBold,
    PiWarningBold
} from 'react-icons/pi';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';
import type { WorkoutPlan, WorkoutSession } from '../../lib/types';

interface EnhancedWorkoutExecutionProps {
  workoutPlan: WorkoutPlan;
  onComplete: (session: WorkoutSession) => void;
  onExit: () => void;
}

const EnhancedWorkoutExecution = memo(function EnhancedWorkoutExecution({
  workoutPlan,
  onComplete,
  onExit
}: EnhancedWorkoutExecutionProps) {
  const { isMobile, triggerHaptic, workoutConfig } = useMobileOptimization();
  const {
    speakExerciseInstructions,
    speakMotivation,
    speakSetComplete,
    speakRestPeriod,
    speakWorkoutComplete,
    isEnabled: isVoiceEnabled
  } = useVoiceCoaching({ enabled: true });
  const toast = useToast();

  // Session state
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);

  // Exercise performance tracking
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [exerciseNotes, setExerciseNotes] = useState('');
  const [rpeRating, setRpeRating] = useState(5);
  const [formRating, setFormRating] = useState(5);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);

  // Heart rate monitoring (simulated)
  const [heartRate, setHeartRate] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  // UI state
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Refs for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const heartRateRef = useRef<NodeJS.Timeout | null>(null);

  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');

  // Current exercise
  const currentExercise = workoutPlan.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workoutPlan.exercises.length - 1;
  const progressPercentage = ((currentExerciseIndex + 1) / workoutPlan.exercises.length) * 100;

  // Initialize session
  useEffect(() => {
    const initializeSession = () => {
      // Create a basic session object for tracking
      const session: WorkoutSession = {
        id: `session_${Date.now()}`,
        workoutPlanId: workoutPlan.id,
        userId: 'current_user',
        startTime: new Date(),
        status: 'in_progress',
        currentExerciseIndex: 0,
        completedExercises: [],
        skippedExercises: [],
        totalDuration: 0,
        activeTime: 0,
        restTime: 0,
        pauseTime: 0
      };
      setCurrentSession(session);
    };

    initializeSession();

    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (heartRateRef.current) clearInterval(heartRateRef.current);
    };
  }, [workoutPlan]);

  // Timer management
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        if (isResting) {
          setRestTimer(prev => {
            if (prev <= 1) {
              setIsResting(false);
              setRestTimer(0);
              triggerHaptic('success');

              // Voice coaching for rest period end
              if (isVoiceEnabled) {
                speakMotivation();
              }

              return 0;
            }

            // Voice coaching for rest countdown (at 10, 5, 3, 2, 1 seconds)
            if (isVoiceEnabled && [10, 5, 3, 2, 1].includes(prev - 1)) {
              setTimeout(() => {
                if (prev - 1 === 1) {
                  speakMotivation();
                }
              }, 500);
            }

            return prev - 1;
          });
        } else {
          setExerciseTimer(prev => prev + 1);

          // Periodic motivation during exercise (every 30 seconds)
          if (isVoiceEnabled && prev > 0 && prev % 30 === 0) {
            speakMotivation();
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isPaused, isResting, triggerHaptic, isVoiceEnabled, speakMotivation]);

  // Heart rate simulation
  useEffect(() => {
    if (isActive && !isPaused) {
      heartRateRef.current = setInterval(() => {
        // Simulate heart rate based on exercise intensity
        const baseHR = 70;
        const exerciseIntensity = currentExercise?.intensity === 'high' ? 50 :
                                 currentExercise?.intensity === 'moderate' ? 30 : 20;
        const variability = Math.random() * 10 - 5;
        setHeartRate(Math.round(baseHR + exerciseIntensity + variability));

        // Simulate calorie burn (very rough estimate)
        setCaloriesBurned(prev => prev + 0.1);
      }, 2000);
    } else {
      if (heartRateRef.current) {
        clearInterval(heartRateRef.current);
        heartRateRef.current = null;
      }
    }

    return () => {
      if (heartRateRef.current) {
        clearInterval(heartRateRef.current);
        heartRateRef.current = null;
      }
    };
  }, [isActive, isPaused, currentExercise]);

  // Start workout
  const startWorkout = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setExerciseTimer(0);
    triggerHaptic('success');

    // Prevent screen sleep
    if (isMobile && workoutConfig.preventSleep) {
      workoutConfig.preventSleep().catch(() => {
        console.warn('Wake lock not supported');
      });
    }

    // Voice coaching for workout start
    if (isVoiceEnabled && currentExercise) {
      speakExerciseInstructions(currentExercise);
    }

    toast({
      title: 'Workout Started!',
      description: 'Let\'s crush this workout!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [triggerHaptic, isMobile, workoutConfig, toast, isVoiceEnabled, currentExercise, speakExerciseInstructions]);

  // Pause/Resume workout
  const togglePause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      triggerHaptic('light');
    } else {
      setIsPaused(true);
      triggerHaptic('medium');
    }
  }, [isPaused, triggerHaptic]);

  // Complete current set
  const completeSet = useCallback(() => {
    const newCompletedSets = [...completedSets, currentSetIndex];
    setCompletedSets(newCompletedSets);

    // Voice coaching for set completion
    if (isVoiceEnabled) {
      speakSetComplete(newCompletedSets.length, currentExercise.sets);
    }

    if (newCompletedSets.length >= currentExercise.sets) {
      // All sets completed - show performance modal
      setShowPerformanceModal(true);
      // Motivational message for exercise completion
      if (isVoiceEnabled) {
        speakMotivation();
      }
    } else {
      // Move to next set
      setCurrentSetIndex(prev => prev + 1);
      // Start rest period
      setRestTimer(currentExercise.restTime);
      setIsResting(true);
      // Voice coaching for rest period
      if (isVoiceEnabled) {
        speakRestPeriod(currentExercise.restTime);
      }
    }

    triggerHaptic('medium');
  }, [completedSets, currentSetIndex, currentExercise, triggerHaptic, isVoiceEnabled, speakSetComplete, speakMotivation, speakRestPeriod]);

  // Complete exercise
  const completeExercise = useCallback(() => {
    if (!currentSession) return;

    try {
      if (isLastExercise) {
        // Complete entire workout
        const completedSession = {
          ...currentSession,
          status: 'completed' as const,
          endTime: new Date()
        };

        // Voice coaching for workout completion
        if (isVoiceEnabled) {
          speakWorkoutComplete();
        }

        onComplete(completedSession);
      } else {
        // Move to next exercise
        const nextExercise = workoutPlan.exercises[currentExerciseIndex + 1];
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        setCompletedSets([]);
        setExerciseTimer(0);
        setExerciseNotes('');
        setRpeRating(5);
        setFormRating(5);

        // Voice coaching for next exercise
        if (isVoiceEnabled && nextExercise) {
          setTimeout(() => {
            speakExerciseInstructions(nextExercise);
          }, 1000); // Small delay to let user process the transition
        }
      }

      setShowPerformanceModal(false);
      triggerHaptic('success');
    } catch (error) {
      console.error('Failed to complete exercise:', error);
      toast({
        title: 'Error',
        description: 'Failed to record exercise completion.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [
    currentSession,
    isLastExercise,
    onComplete,
    triggerHaptic,
    toast,
    workoutPlan.exercises,
    currentExerciseIndex,
    isVoiceEnabled,
    speakWorkoutComplete,
    speakExerciseInstructions
  ]);

  // Skip exercise
  const skipExercise = useCallback(() => {
    if (!currentSession) return;

    try {
      if (isLastExercise) {
        const completedSession = {
          ...currentSession,
          status: 'completed' as const,
          endTime: new Date()
        };
        onComplete(completedSession);
      } else {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        setCompletedSets([]);
        setExerciseTimer(0);
      }

      triggerHaptic('light');
    } catch (error) {
      console.error('Failed to skip exercise:', error);
    }
  }, [currentSession, isLastExercise, onComplete, triggerHaptic]);

  // Exit workout
  const exitWorkout = useCallback(() => {
    onExit();
  }, [onExit]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentExercise) {
    return (
      <Box p={4} textAlign="center">
        <Text>Loading workout...</Text>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
      p={{ base: 3, md: 4 }}
    >
      <VStack spacing={4} maxW="md" mx="auto">
        {/* Header with progress */}
        <Card w="100%" bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <HStack w="100%" justify="space-between">
                <Text fontSize="sm" color={subtextColor}>
                  Exercise {currentExerciseIndex + 1} of {workoutPlan.exercises.length}
                </Text>
                <Badge colorScheme={isActive ? 'green' : 'gray'}>
                  {isActive ? (isPaused ? 'Paused' : 'Active') : 'Ready'}
                </Badge>
              </HStack>

              <Progress
                value={progressPercentage}
                w="100%"
                colorScheme="blue"
                borderRadius="full"
                size="lg"
              />

              <HStack w="100%" justify="space-between" fontSize="sm">
                <VStack spacing={0}>
                  <HStack>
                    <Icon as={PiHeartBold} color="red.500" />
                    <Text fontWeight="bold">{heartRate}</Text>
                  </HStack>
                  <Text fontSize="xs" color={subtextColor}>BPM</Text>
                </VStack>
                <VStack spacing={0}>
                  <HStack>
                    <Icon as={PiTargetBold} color="orange.500" />
                    <Text fontWeight="bold">{Math.round(caloriesBurned)}</Text>
                  </HStack>
                  <Text fontSize="xs" color={subtextColor}>CAL</Text>
                </VStack>
                <VStack spacing={0}>
                  <HStack>
                    <Icon as={PiTimerBold} color={activeColor} />
                    <Text fontWeight="bold">{formatTime(exerciseTimer)}</Text>
                  </HStack>
                  <Text fontSize="xs" color={subtextColor}>TIME</Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Current Exercise Display */}
        <Card w="100%" bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="xl" fontWeight="bold" textAlign="center" color={textColor}>
                {currentExercise.name}
              </Text>

              {/* Exercise details */}
              <HStack justify="center" spacing={6}>
                <VStack spacing={1}>
                  <Text fontSize="2xl" fontWeight="bold" color={activeColor}>
                    {currentExercise.sets}
                  </Text>
                  <Text fontSize="xs" color={subtextColor}>SETS</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="2xl" fontWeight="bold" color={activeColor}>
                    {currentExercise.reps}
                  </Text>
                  <Text fontSize="xs" color={subtextColor}>REPS</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="2xl" fontWeight="bold" color={activeColor}>
                    {currentExercise.restTime}s
                  </Text>
                  <Text fontSize="xs" color={subtextColor}>REST</Text>
                </VStack>
              </HStack>

              {/* Set progress */}
              <VStack spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" color={subtextColor}>
                    Set {currentSetIndex + 1} of {currentExercise.sets}
                  </Text>
                  <Text fontSize="sm" color={activeColor} fontWeight="bold">
                    {Math.round((completedSets.length / currentExercise.sets) * 100)}% Complete
                  </Text>
                </HStack>

                <Progress
                  value={(completedSets.length / currentExercise.sets) * 100}
                  w="100%"
                  colorScheme="green"
                  borderRadius="full"
                  size="sm"
                />

                <HStack spacing={2} justify="center">
                  {Array.from({ length: currentExercise.sets }, (_, i) => (
                    <Box
                      key={i}
                      w={10}
                      h={10}
                      borderRadius="full"
                      bg={completedSets.includes(i) ? successColor :
                          i === currentSetIndex ? activeColor : 'gray.200'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border={i === currentSetIndex ? "2px solid" : "none"}
                      borderColor={activeColor}
                      transition="all 0.3s ease"
                      transform={i === currentSetIndex ? "scale(1.1)" : "scale(1)"}
                    >
                      {completedSets.includes(i) ? (
                        <Icon as={PiCheckBold} color="white" boxSize={5} />
                      ) : (
                        <Text fontSize="sm" fontWeight="bold" color={i === currentSetIndex ? "white" : "gray.500"}>
                          {i + 1}
                        </Text>
                      )}
                    </Box>
                  ))}
                </HStack>
              </VStack>

              {/* Rest timer */}
              {isResting && (
                <VStack spacing={3} py={4}>
                  <Text fontSize="lg" fontWeight="bold" color={warningColor}>
                    Rest Time
                  </Text>
                  <CircularProgress
                    value={(1 - restTimer / currentExercise.restTime) * 100}
                    color={restTimer <= 5 ? "red.400" : "orange.400"}
                    size="120px"
                    thickness="8px"
                  >
                    <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                      {restTimer}s
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="sm" color={subtextColor} textAlign="center">
                    {restTimer <= 5 ? "Get ready!" : "Take deep breaths and recover"}
                  </Text>
                </VStack>
              )}

              {/* Performance indicators */}
              {isActive && !isResting && (
                <HStack justify="space-around" py={2}>
                  <VStack spacing={1}>
                    <Text fontSize="xs" color={subtextColor}>INTENSITY</Text>
                    <HStack spacing={1}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Box
                          key={i}
                          w={2}
                          h={4}
                          bg={i < (heartRate > 120 ? 5 : heartRate > 100 ? 3 : 1) ? activeColor : 'gray.200'}
                          borderRadius="sm"
                        />
                      ))}
                    </HStack>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="xs" color={subtextColor}>PACE</Text>
                    <Text fontSize="sm" fontWeight="bold" color={exerciseTimer > 60 ? warningColor : successColor}>
                      {exerciseTimer > 60 ? 'STEADY' : 'GOOD'}
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="xs" color={subtextColor}>FORM</Text>
                    <Text fontSize="sm" fontWeight="bold" color={successColor}>
                      GOOD
                    </Text>
                  </VStack>
                </HStack>
              )}

              {/* Exercise instructions */}
              <Box bg={useColorModeValue('blue.50', 'blue.900')} p={4} borderRadius="lg">
                <VStack spacing={2} align="start">
                  <HStack>
                    <Icon as={PiTargetBold} color={useColorModeValue('blue.600', 'blue.300')} />
                    <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('blue.700', 'blue.200')}>
                      Instructions
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')}>
                    {currentExercise.instructions}
                  </Text>
                </VStack>
              </Box>

              {/* Tips */}
              {currentExercise.tips && (
                <Box bg={useColorModeValue('green.50', 'green.900')} p={4} borderRadius="lg">
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Text fontSize="sm">💡</Text>
                      <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('green.700', 'green.200')}>
                        Pro Tip
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={useColorModeValue('green.700', 'green.200')}>
                      {currentExercise.tips}
                    </Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Control buttons */}
        <VStack spacing={4} w="100%">
          {!isActive ? (
            <Button
              colorScheme="blue"
              size="lg"
              w="100%"
              leftIcon={<Icon as={PiPlayBold} boxSize={6} />}
              onClick={startWorkout}
              py={8}
              fontSize="lg"
              fontWeight="bold"
              borderRadius="xl"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s ease"
            >
              Start Workout
            </Button>
          ) : (
            <VStack spacing={3} w="100%">
              <HStack spacing={3} w="100%">
                <Button
                  colorScheme={isPaused ? "green" : "orange"}
                  size="lg"
                  flex={1}
                  leftIcon={<Icon as={isPaused ? PiPlayBold : PiPauseBold} boxSize={5} />}
                  onClick={togglePause}
                  py={6}
                  borderRadius="xl"
                  _hover={{ transform: 'translateY(-1px)' }}
                  transition="all 0.2s ease"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>

                {!isResting && (
                  <Button
                    colorScheme="green"
                    size="lg"
                    flex={1}
                    leftIcon={<Icon as={PiCheckBold} boxSize={5} />}
                    onClick={completeSet}
                    py={6}
                    borderRadius="xl"
                    _hover={{ transform: 'translateY(-1px)' }}
                    transition="all 0.2s ease"
                  >
                    Complete Set
                  </Button>
                )}
              </HStack>

              {/* Quick action buttons */}
              <HStack spacing={2} w="100%" justify="center">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Icon as={PiTargetBold} />}
                  onClick={speakMotivation}
                  isDisabled={!isVoiceEnabled}
                >
                  Motivate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Icon as={PiTimerBold} />}
                  onClick={() => setRestTimer(30)}
                  isDisabled={!isResting}
                >
                  +30s Rest
                </Button>
              </HStack>
            </VStack>
          )}

          <HStack spacing={3} w="100%">
            <Button
              variant="outline"
              size="md"
              flex={1}
              leftIcon={<Icon as={PiSkipForwardBold} />}
              onClick={skipExercise}
            >
              Skip Exercise
            </Button>

            <Button
              variant="outline"
              colorScheme="red"
              size="md"
              flex={1}
              leftIcon={<Icon as={PiStopBold} />}
              onClick={() => setShowExitConfirmation(true)}
            >
              Exit Workout
            </Button>
          </HStack>
        </VStack>
      </VStack>

      {/* Performance Modal */}
      <Modal isOpen={showPerformanceModal} onClose={() => setShowPerformanceModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exercise Complete!</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                {currentExercise.name}
              </Text>

              <Divider />

              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold">Rate Your Performance</Text>

                <Box>
                  <Text fontSize="sm" mb={2}>Perceived Exertion (1-10)</Text>
                  <Slider
                    value={rpeRating}
                    onChange={setRpeRating}
                    min={1}
                    max={10}
                    step={1}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6}>
                      <Text fontSize="xs">{rpeRating}</Text>
                    </SliderThumb>
                  </Slider>
                </Box>

                <Box>
                  <Text fontSize="sm" mb={2}>Form Quality (1-5)</Text>
                  <Slider
                    value={formRating}
                    onChange={setFormRating}
                    min={1}
                    max={5}
                    step={1}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6}>
                      <Text fontSize="xs">{formRating}</Text>
                    </SliderThumb>
                  </Slider>
                </Box>

                <Box>
                  <Text fontSize="sm" mb={2}>Notes (optional)</Text>
                  <Textarea
                    value={exerciseNotes}
                    onChange={(e) => setExerciseNotes(e.target.value)}
                    placeholder="How did this exercise feel?"
                    size="sm"
                  />
                </Box>
              </VStack>

              <Button
                colorScheme="blue"
                size="lg"
                onClick={completeExercise}
                leftIcon={<Icon as={PiCheckBold} />}
              >
                {isLastExercise ? 'Complete Workout' : 'Next Exercise'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal isOpen={showExitConfirmation} onClose={() => setShowExitConfirmation(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exit Workout?</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Icon as={PiWarningBold} boxSize={12} color="orange.500" />
              <Text textAlign="center">
                Are you sure you want to exit? Your progress will be saved, but the workout will be marked as incomplete.
              </Text>
              <HStack spacing={3} w="100%">
                <Button
                  variant="outline"
                  flex={1}
                  onClick={() => setShowExitConfirmation(false)}
                >
                  Continue Workout
                </Button>
                <Button
                  colorScheme="red"
                  flex={1}
                  onClick={exitWorkout}
                >
                  Exit Workout
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default EnhancedWorkoutExecution;
