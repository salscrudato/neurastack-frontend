import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
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
import { AnimatePresence } from 'framer-motion';
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

// Import components
import { EnhancedRestTimer } from './EnhancedRestTimer';
import { WeightInput } from './WeightInput';

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
  // Voice coaching integration - temporarily disabled
  const speakExerciseInstructions = () => {};
  const speakMotivation = () => {};
  const speakSetComplete = () => {};
  const speakRestPeriod = () => {};
  const speakWorkoutComplete = () => {};
  const isVoiceEnabled = false;
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

  // Weight tracking state
  const [currentSetWeight, setCurrentSetWeight] = useState<number | undefined>();
  const [setWeights, setSetWeights] = useState<(number | undefined)[]>([]);

  // Debug weight changes
  useEffect(() => {
    console.log('🏋️ Current set weight changed:', currentSetWeight);
  }, [currentSetWeight]);

  useEffect(() => {
    console.log('🏋️ Set weights array changed:', setWeights);
  }, [setWeights]);

  // Rest timer enhancements
  const [isRestPaused, setIsRestPaused] = useState(false);

  // Heart rate monitoring (simulated)
  const [heartRate, setHeartRate] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  // UI state
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Refs for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const heartRateRef = useRef<NodeJS.Timeout | null>(null);

  // Theme colors - all hooks at top level
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');

  // Additional theme colors for conditional usage
  const mainBgColor = useColorModeValue('gray.50', 'gray.900');
  const modalBorderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');
  const timerBgColor = useColorModeValue('gray.100', 'gray.700');
  const instructionsBgColor = useColorModeValue('blue.50', 'blue.900');
  const instructionsIconColor = useColorModeValue('blue.600', 'blue.300');
  const instructionsTextColor = useColorModeValue('blue.700', 'blue.200');
  const tipsBgColor = useColorModeValue('green.50', 'green.900');
  const tipsTextColor = useColorModeValue('green.700', 'green.200');
  const targetBgColor = useColorModeValue('blue.50', 'blue.900');
  const targetTextColor = useColorModeValue('blue.700', 'blue.200');
  const weightBgColor = useColorModeValue('green.50', 'green.900');
  const weightTextColor = useColorModeValue('green.700', 'green.200');
  const debugBgColor = useColorModeValue('gray.50', 'gray.800');
  const weightSummaryBgColor = useColorModeValue('blue.50', 'blue.900');
  const weightSummaryTextColor = useColorModeValue('blue.700', 'blue.200');
  const setTextColor = useColorModeValue('blue.600', 'blue.300');

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
        if (isResting && !isRestPaused) {
          setRestTimer(prev => {
            if (prev <= 1) {
              setIsResting(false);
              setRestTimer(0);
              setIsRestPaused(false);
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
        } else if (!isResting) {
          setExerciseTimer(prev => prev + 1);

          // Periodic motivation during exercise (every 30 seconds)
          // Voice coaching disabled for now
          if (false) {
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
  }, [isActive, isPaused, isResting, isRestPaused, triggerHaptic, isVoiceEnabled, speakMotivation]);

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
      speakExerciseInstructions();
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
    // Store weight for current set if provided
    const newSetWeights = [...setWeights];
    newSetWeights[currentSetIndex] = currentSetWeight;
    setSetWeights(newSetWeights);

    // Debug logging
    console.log('🏋️ Completing set:', {
      setIndex: currentSetIndex,
      weight: currentSetWeight,
      allWeights: newSetWeights,
      exerciseName: currentExercise.name
    });

    const newCompletedSets = [...completedSets, currentSetIndex];
    setCompletedSets(newCompletedSets);

    // Voice coaching for set completion
    if (isVoiceEnabled) {
      speakSetComplete();
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
      // Clear current set weight for next set
      setCurrentSetWeight(undefined);
      // Start rest period
      setRestTimer(currentExercise.restTime);
      setIsResting(true);
      setIsRestPaused(false);
      // Voice coaching for rest period
      if (isVoiceEnabled) {
        speakRestPeriod();
      }
    }

    triggerHaptic('medium');
  }, [completedSets, currentSetIndex, currentExercise, triggerHaptic, isVoiceEnabled, speakSetComplete, speakMotivation, speakRestPeriod, setWeights, currentSetWeight]);

  // Complete exercise
  const completeExercise = useCallback(() => {
    if (!currentSession) return;

    try {
      // Store exercise performance data
      const updatedExercise = {
        ...currentExercise,
        weight: setWeights.filter(w => w !== undefined) as number[],
        rpe: Array(completedSets.length).fill(rpeRating),
        formRating: Array(completedSets.length).fill(formRating),
        setNotes: exerciseNotes ? Array(completedSets.length).fill(exerciseNotes) : undefined,
        completed: true,
        actualSets: completedSets.length,
        lastPerformed: new Date()
      };

      // Log exercise completion for analytics
      console.log('Exercise completed:', updatedExercise.name, {
        sets: updatedExercise.actualSets,
        weights: updatedExercise.weight,
        rpe: updatedExercise.rpe
      });

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
        setSetWeights([]);
        setCurrentSetWeight(undefined);
        setExerciseTimer(0);
        setExerciseNotes('');
        setRpeRating(5);
        setFormRating(5);

        // Voice coaching for next exercise
        if (isVoiceEnabled && nextExercise) {
          setTimeout(() => {
            speakExerciseInstructions();
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
    currentExercise,
    setWeights,
    completedSets,
    rpeRating,
    formRating,
    exerciseNotes,
    workoutPlan,
    currentExerciseIndex,
    isLastExercise,
    onComplete,
    triggerHaptic,
    toast,
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
        setSetWeights([]);
        setCurrentSetWeight(undefined);
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

  // Complete workout early
  const completeWorkoutEarly = useCallback(async () => {
    if (!currentSession) return;

    try {
      const completedSession = {
        ...currentSession,
        status: 'completed' as const,
        endTime: new Date(),
        completionReason: 'early_completion'
      };

      toast({
        title: 'Workout Completed Early!',
        description: 'Great job on your workout session.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onComplete(completedSession);
    } catch (error) {
      console.error('Failed to complete workout early:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workout completion.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [currentSession, onComplete, toast]);

  // Rest timer controls
  const pauseRestTimer = useCallback(() => {
    setIsRestPaused(true);
    triggerHaptic('light');
  }, [triggerHaptic]);

  const resumeRestTimer = useCallback(() => {
    setIsRestPaused(false);
    triggerHaptic('light');
  }, [triggerHaptic]);

  const skipRest = useCallback(() => {
    setIsResting(false);
    setRestTimer(0);
    setIsRestPaused(false);
    triggerHaptic('medium');
  }, [triggerHaptic]);

  const addRestTime = useCallback((seconds: number) => {
    setRestTimer(prev => prev + seconds);
    triggerHaptic('light');
  }, [triggerHaptic]);

  const subtractRestTime = useCallback((seconds: number) => {
    setRestTimer(prev => Math.max(0, prev - seconds));
    triggerHaptic('light');
  }, [triggerHaptic]);

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
      position="relative"
      bg={mainBgColor}
      sx={{
        // Use dynamic viewport height for better mobile support
        height: ['100dvh', '100vh'],
        minHeight: ['100dvh', '100vh'],
        '@supports (-webkit-touch-callout: none)': {
          height: '-webkit-fill-available',
          minHeight: '-webkit-fill-available',
        },
        // Account for fixed header
        '@media (max-width: 768px)': {
          height: 'calc(100dvh - 56px)',
          minHeight: 'calc(100dvh - 56px)',
          '@supports (-webkit-touch-callout: none)': {
            height: 'calc(-webkit-fill-available - 56px)',
            minHeight: 'calc(-webkit-fill-available - 56px)',
          }
        },
        '@media (min-width: 769px)': {
          height: 'calc(100dvh - 64px)',
          minHeight: 'calc(100dvh - 64px)',
          '@supports (-webkit-touch-callout: none)': {
            height: 'calc(-webkit-fill-available - 64px)',
            minHeight: 'calc(-webkit-fill-available - 64px)',
          }
        }
      }}
    >
      {/* Scrollable Content Area */}
      <Box
        h="100%"
        overflowY="auto"
        overflowX="hidden"
        p={{ base: 4, md: 4 }}
        sx={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          // Prevent scrolling below fixed controls - increased for mobile
          paddingBottom: { base: '200px', md: '160px' }, // More space for fixed controls on mobile
        }}
      >
      <VStack
        spacing={{ base: 4, md: 4 }}
        maxW="md"
        mx="auto"
        w="100%"
        align="stretch"
        pb={{ base: 6, md: 6 }}
      >
        {/* Header with progress */}
        <Card
          w="100%"
          bg={cardBg}
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={modalBorderColor}
          borderRadius="xl"
          boxShadow="0 8px 32px rgba(0,0,0,0.1)"
        >
          <CardBody p={{ base: 6, md: 6 }}>
            <VStack spacing={{ base: 5, md: 4 }}>
              <HStack w="100%" justify="space-between">
                <VStack align="start" spacing={{ base: 2, md: 1 }}>
                  <Text fontSize={{ base: "md", md: "sm" }} color={subtextColor} fontWeight="medium">
                    Exercise {currentExerciseIndex + 1} of {workoutPlan.exercises.length}
                  </Text>
                  <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor}>
                    {Math.round(progressPercentage)}% Complete
                  </Text>
                </VStack>
                <Badge
                  colorScheme={isActive ? 'green' : 'gray'}
                  variant="solid"
                  borderRadius="full"
                  px={{ base: 4, md: 3 }}
                  py={{ base: 2, md: 1 }}
                  fontSize={{ base: "sm", md: "xs" }}
                  fontWeight="bold"
                >
                  {isActive ? (isPaused ? 'Paused' : 'Active') : 'Ready'}
                </Badge>
              </HStack>

              <Progress
                value={progressPercentage}
                w="100%"
                colorScheme="blue"
                borderRadius="full"
                size={{ base: "lg", md: "lg" }}
                bg={timerBgColor}
                sx={{
                  '& > div': {
                    background: 'linear-gradient(90deg, #4299E1 0%, #667EEA 100%)',
                  }
                }}
              />

              <HStack w="100%" justify="space-between" fontSize={{ base: "md", md: "sm" }}>
                <VStack spacing={{ base: 1, md: 0 }}>
                  <HStack>
                    <Icon as={PiHeartBold} color="red.500" boxSize={{ base: 5, md: 4 }} />
                    <Text fontWeight="bold" fontSize={{ base: "lg", md: "md" }}>{heartRate}</Text>
                  </HStack>
                  <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor}>BPM</Text>
                </VStack>
                <VStack spacing={{ base: 1, md: 0 }}>
                  <HStack>
                    <Icon as={PiTargetBold} color="orange.500" boxSize={{ base: 5, md: 4 }} />
                    <Text fontWeight="bold" fontSize={{ base: "lg", md: "md" }}>{Math.round(caloriesBurned)}</Text>
                  </HStack>
                  <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor}>CAL</Text>
                </VStack>
                <VStack spacing={{ base: 1, md: 0 }}>
                  <HStack>
                    <Icon as={PiTimerBold} color={activeColor} boxSize={{ base: 5, md: 4 }} />
                    <Text fontWeight="bold" fontSize={{ base: "lg", md: "md" }}>{formatTime(exerciseTimer)}</Text>
                  </HStack>
                  <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor}>TIME</Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Current Exercise Display */}
        <Card w="100%" bg={bgColor} borderColor={borderColor}>
          <CardBody p={{ base: 6, md: 4 }}>
            <VStack spacing={{ base: 5, md: 4 }} align="stretch">
              <Text fontSize={{ base: "2xl", md: "xl" }} fontWeight="bold" textAlign="center" color={textColor} lineHeight="1.2">
                {currentExercise.name}
              </Text>

              {/* Exercise details */}
              <HStack justify="center" spacing={{ base: 8, md: 6 }}>
                <VStack spacing={{ base: 2, md: 1 }}>
                  <Text fontSize={{ base: "3xl", md: "2xl" }} fontWeight="bold" color={activeColor}>
                    {currentExercise.sets}
                  </Text>
                  <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor} fontWeight="medium">SETS</Text>
                </VStack>
                <VStack spacing={{ base: 2, md: 1 }}>
                  <Text fontSize={{ base: "3xl", md: "2xl" }} fontWeight="bold" color={activeColor}>
                    {currentExercise.reps}
                  </Text>
                  <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor} fontWeight="medium">REPS</Text>
                </VStack>
                <VStack spacing={{ base: 2, md: 1 }}>
                  <Text fontSize={{ base: "3xl", md: "2xl" }} fontWeight="bold" color={activeColor}>
                    {currentExercise.restTime}s
                  </Text>
                  <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor} fontWeight="medium">REST</Text>
                </VStack>
              </HStack>

              {/* Set progress */}
              <VStack spacing={{ base: 4, md: 3 }}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize={{ base: "md", md: "sm" }} color={subtextColor} fontWeight="medium">
                    Set {currentSetIndex + 1} of {currentExercise.sets}
                  </Text>
                  <Text fontSize={{ base: "md", md: "sm" }} color={activeColor} fontWeight="bold">
                    {Math.round((completedSets.length / currentExercise.sets) * 100)}% Complete
                  </Text>
                </HStack>

                <Progress
                  value={(completedSets.length / currentExercise.sets) * 100}
                  w="100%"
                  colorScheme="green"
                  borderRadius="full"
                  size={{ base: "md", md: "sm" }}
                />

                <HStack spacing={{ base: 3, md: 2 }} justify="center">
                  {Array.from({ length: currentExercise.sets }, (_, i) => (
                    <Box
                      key={i}
                      w={{ base: 12, md: 10 }}
                      h={{ base: 12, md: 10 }}
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
                        <Icon as={PiCheckBold} color="white" boxSize={{ base: 6, md: 5 }} />
                      ) : (
                        <Text fontSize={{ base: "md", md: "sm" }} fontWeight="bold" color={i === currentSetIndex ? "white" : "gray.500"}>
                          {i + 1}
                        </Text>
                      )}
                    </Box>
                  ))}
                </HStack>
              </VStack>

              {/* Enhanced Rest Timer */}
              <AnimatePresence>
                {isResting && (
                  <EnhancedRestTimer
                    timeRemaining={restTimer}
                    totalRestTime={currentExercise.restTime}
                    isActive={isActive}
                    isPaused={isRestPaused}
                    onPause={pauseRestTimer}
                    onResume={resumeRestTimer}
                    onSkip={skipRest}
                    onAddTime={addRestTime}
                    onSubtractTime={subtractRestTime}
                    exerciseName={currentExercise.name}
                    nextExerciseName={
                      currentExerciseIndex < workoutPlan.exercises.length - 1
                        ? workoutPlan.exercises[currentExerciseIndex + 1].name
                        : undefined
                    }
                    onHapticFeedback={triggerHaptic}
                  />
                )}
              </AnimatePresence>

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
              <Box bg={instructionsBgColor} p={{ base: 4, md: 4 }} borderRadius="lg">
                <VStack spacing={{ base: 3, md: 2 }} align="start">
                  <HStack>
                    <Icon as={PiTargetBold} color={instructionsIconColor} boxSize={{ base: 4, md: 4 }} />
                    <Text fontSize={{ base: "md", md: "sm" }} fontWeight="bold" color={instructionsTextColor}>
                      Instructions
                    </Text>
                  </HStack>
                  <Text fontSize={{ base: "md", md: "sm" }} color={instructionsTextColor} lineHeight="1.5">
                    {currentExercise.instructions}
                  </Text>
                </VStack>
              </Box>

              {/* Tips */}
              {currentExercise.tips && (
                <Box bg={tipsBgColor} p={{ base: 4, md: 4 }} borderRadius="lg">
                  <VStack spacing={{ base: 3, md: 2 }} align="start">
                    <HStack>
                      <Text fontSize={{ base: "md", md: "sm" }}>💡</Text>
                      <Text fontSize={{ base: "md", md: "sm" }} fontWeight="bold" color={tipsTextColor}>
                        Pro Tip
                      </Text>
                    </HStack>
                    <Text fontSize={{ base: "md", md: "sm" }} color={tipsTextColor} lineHeight="1.5">
                      {currentExercise.tips}
                    </Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Weight Input Section */}
        {isActive && !isResting && (
          <Card
            w="100%"
            bg={bgColor}
            borderColor={borderColor}
            backdropFilter="blur(12px)"
            border="1px solid"
            borderRadius="xl"
            boxShadow="0 8px 32px rgba(0,0,0,0.1)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            }}
            transition="all 0.3s ease"
            mb={{ base: 4, md: 2 }} // Extra margin for mobile scrolling
          >
            <CardBody p={{ base: 6, md: 6 }}>
              <VStack spacing={4}>
                <HStack spacing={2} align="center" w="100%" justify="center">
                  <Icon as={PiTargetBold} color="blue.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Set {currentSetIndex + 1} of {currentExercise.sets}
                  </Text>
                </HStack>

                <WeightInput
                  value={currentSetWeight}
                  onChange={setCurrentSetWeight}
                  placeholder={`Weight for Set ${currentSetIndex + 1}`}
                  size="lg"
                  showQuickButtons={true}
                  showNAOption={true}
                  previousWeight={
                    setWeights[currentSetIndex - 1] ||
                    (currentExercise.weight && currentExercise.weight[currentSetIndex - 1])
                  }
                  exerciseName={currentExercise.name}
                  weightHistory={currentExercise.weightHistory?.map(h => h.weights).flat() || []}
                  onWeightSuggestionSelect={(weight) => {
                    setCurrentSetWeight(weight);
                    triggerHaptic('light');
                  }}
                />

                {/* Reps reminder and current weight display */}
                <VStack spacing={2} w="100%">
                  <Box
                    bg={targetBgColor}
                    p={3}
                    borderRadius="lg"
                    w="100%"
                    textAlign="center"
                  >
                    <Text fontSize="sm" color={targetTextColor} fontWeight="medium">
                      Target: {currentExercise.reps} reps
                    </Text>
                  </Box>

                  {/* Debug: Show current weight */}
                  {currentSetWeight !== undefined && (
                    <Box
                      bg={weightBgColor}
                      p={2}
                      borderRadius="md"
                      w="100%"
                      textAlign="center"
                    >
                      <Text fontSize="xs" color={weightTextColor} fontWeight="medium">
                        Current Weight: {currentSetWeight} lbs
                      </Text>
                    </Box>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

      </VStack>
      </Box>

      {/* Control buttons - Fixed to bottom */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        p={{ base: 4, md: 4 }}
        zIndex={1000}
        boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
        className="neurafit-fixed-controls"
        sx={{
          '@media (max-width: 768px)': {
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          }
        }}
      >
        <VStack spacing={{ base: 4, md: 4 }} w="100%" maxW="md" mx="auto">
          {!isActive ? (
            <Button
              colorScheme="blue"
              size="lg"
              w="100%"
              leftIcon={<Icon as={PiPlayBold} boxSize={{ base: 6, md: 5 }} />}
              onClick={startWorkout}
              py={{ base: 6, md: 6 }}
              fontSize={{ base: "lg", md: "lg" }}
              fontWeight="bold"
              borderRadius="xl"
              h={{ base: "56px", md: "48px" }}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s ease"
            >
              Start Workout
            </Button>
          ) : (
            <VStack spacing={{ base: 3, md: 3 }} w="100%">
              <HStack spacing={{ base: 3, md: 3 }} w="100%">
                <Button
                  colorScheme={isPaused ? "green" : "orange"}
                  size="lg"
                  flex={1}
                  leftIcon={<Icon as={isPaused ? PiPlayBold : PiPauseBold} boxSize={{ base: 5, md: 4 }} />}
                  onClick={togglePause}
                  py={{ base: 4, md: 4 }}
                  borderRadius="xl"
                  h={{ base: "48px", md: "44px" }}
                  fontSize={{ base: "md", md: "sm" }}
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
                    leftIcon={<Icon as={PiCheckBold} boxSize={{ base: 5, md: 4 }} />}
                    onClick={completeSet}
                    py={{ base: 4, md: 4 }}
                    borderRadius="xl"
                    h={{ base: "48px", md: "44px" }}
                    fontSize={{ base: "md", md: "sm" }}
                    _hover={{ transform: 'translateY(-1px)' }}
                    transition="all 0.2s ease"
                  >
                    Complete Set
                  </Button>
                )}
              </HStack>

              {/* Quick action buttons */}
              <HStack spacing={{ base: 2, md: 2 }} w="100%" justify="center">
                <Button
                  variant="ghost"
                  size={{ base: "sm", md: "sm" }}
                  leftIcon={<Icon as={PiTargetBold} boxSize={{ base: 4, md: 4 }} />}
                  onClick={speakMotivation}
                  isDisabled={!isVoiceEnabled}
                  fontSize={{ base: "sm", md: "sm" }}
                  h={{ base: "40px", md: "36px" }}
                >
                  Motivate
                </Button>
                <Button
                  variant="ghost"
                  size={{ base: "sm", md: "sm" }}
                  leftIcon={<Icon as={PiTimerBold} boxSize={{ base: 4, md: 4 }} />}
                  onClick={() => setRestTimer(30)}
                  isDisabled={!isResting}
                  fontSize={{ base: "sm", md: "sm" }}
                  h={{ base: "40px", md: "36px" }}
                >
                  +30s Rest
                </Button>
              </HStack>
            </VStack>
          )}

          <HStack spacing={{ base: 3, md: 3 }} w="100%">
            <Button
              variant="outline"
              size={{ base: "md", md: "md" }}
              flex={1}
              leftIcon={<Icon as={PiSkipForwardBold} boxSize={{ base: 4, md: 4 }} />}
              onClick={skipExercise}
              h={{ base: "44px", md: "40px" }}
              fontSize={{ base: "md", md: "sm" }}
            >
              Skip Exercise
            </Button>

            <Button
              variant="outline"
              colorScheme="red"
              size={{ base: "md", md: "md" }}
              flex={1}
              leftIcon={<Icon as={PiStopBold} boxSize={{ base: 4, md: 4 }} />}
              onClick={() => setShowExitConfirmation(true)}
              h={{ base: "44px", md: "40px" }}
              fontSize={{ base: "md", md: "sm" }}
            >
              Exit Workout
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Performance Modal */}
      <Modal isOpen={showPerformanceModal} onClose={() => setShowPerformanceModal(false)} size="lg">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent
          bg={cardBg}
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={modalBorderColor}
          borderRadius="xl"
          boxShadow="0 20px 60px rgba(0,0,0,0.2)"
        >
          <ModalHeader
            textAlign="center"
            fontSize="xl"
            fontWeight="bold"
            color={textColor}
            pb={2}
          >
            <VStack spacing={2}>
              <Icon as={PiCheckBold} boxSize={8} color="green.500" />
              <Text>Exercise Complete!</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                {currentExercise.name}
              </Text>

              {/* Debug: Show recorded weights */}
              <Box
                bg={debugBgColor}
                p={3}
                borderRadius="md"
              >
                <Text fontSize="xs" fontWeight="bold" mb={2}>Recorded Weights:</Text>
                <Text fontSize="xs" color={subtextColor}>
                  {setWeights.map((weight, index) =>
                    `Set ${index + 1}: ${weight ? `${weight} lbs` : 'N/A'}`
                  ).join(', ') || 'No weights recorded'}
                </Text>
              </Box>

              <Divider />

              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold">Exercise Summary</Text>

                {/* Weight Summary with Editing */}
                <Box bg={weightSummaryBgColor} p={4} borderRadius="lg">
                  <Text fontSize="sm" fontWeight="semibold" mb={3} color={weightSummaryTextColor}>
                    Weight Tracking
                  </Text>
                  <VStack spacing={3} align="stretch">
                    {Array.from({ length: currentExercise.sets }, (_, index) => (
                      <HStack key={index} justify="space-between" align="center">
                        <Text fontSize="sm" color={setTextColor} minW="60px">
                          Set {index + 1}:
                        </Text>
                        <Box flex={1} maxW="120px">
                          <WeightInput
                            value={setWeights[index]}
                            onChange={(weight: number | undefined) => {
                              const newWeights = [...setWeights];
                              newWeights[index] = weight;
                              setSetWeights(newWeights);
                            }}
                            placeholder="Weight"
                            size="sm"
                            showQuickButtons={false}
                            showNAOption={true}
                            isDisabled={!completedSets.includes(index)}
                            previousWeight={index > 0 ? setWeights[index - 1] : undefined}
                          />
                        </Box>
                        <Badge
                          colorScheme={completedSets.includes(index) ? 'green' : 'gray'}
                          variant={completedSets.includes(index) ? 'solid' : 'outline'}
                          fontSize="xs"
                          minW="70px"
                          textAlign="center"
                        >
                          {completedSets.includes(index) ? 'Complete' : 'Pending'}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

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
          <ModalHeader>Finish Workout?</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Icon as={PiWarningBold} boxSize={12} color="orange.500" />
              <Text textAlign="center" fontSize="md">
                How would you like to finish your workout?
              </Text>
              <Text textAlign="center" fontSize="sm" color={subtextColor}>
                You've completed {completedSets.length} sets so far. Your progress will be saved either way.
              </Text>

              <VStack spacing={3} w="100%">
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  leftIcon={<Icon as={PiCheckBold} />}
                  onClick={() => {
                    setShowExitConfirmation(false);
                    completeWorkoutEarly();
                  }}
                >
                  Complete Workout Early
                </Button>

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
                    variant="outline"
                    flex={1}
                    onClick={exitWorkout}
                  >
                    Exit & Save
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default EnhancedWorkoutExecution;
