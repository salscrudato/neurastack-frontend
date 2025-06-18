import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    Flex,
    HStack,
    Icon,
    SimpleGrid,
    Spinner,
    Text,
    useColorModeValue,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    PiCheckBold,
    PiLightningBold,
    PiPlayBold,
    PiStopBold,
    PiTargetBold,
    PiTimerBold,
} from 'react-icons/pi';
import equipmentOptions from '../../constants/equipmentOptions';
import { FITNESS_GOALS } from '../../constants/fitnessGoals';
import { neuraStackClient } from '../../lib/neurastack-client';
import type { Exercise, WorkoutAPIRequest, WorkoutHistoryEntry, WorkoutPlan, WorkoutUserMetadata } from '../../lib/types';
import { useAuthStore } from '../../store/useAuthStore';
import { useFitnessStore } from '../../store/useFitnessStore';
import ModernLoadingAnimation from './ModernLoadingAnimation';
import ModernProgressIndicator from './ModernProgressIndicator';
import WorkoutFeedback from './WorkoutFeedback';

const MotionBox = motion(Box);

interface WorkoutGeneratorProps {
  onWorkoutComplete: (workout: WorkoutPlan) => void;
  onBack: () => void;
}

const WorkoutGenerator = memo(function WorkoutGenerator({ onWorkoutComplete, onBack }: WorkoutGeneratorProps) {
  const { profile, addWorkoutPlan, workoutPlans } = useFitnessStore();
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [serviceStatus, setServiceStatus] = useState<'healthy' | 'degraded' | 'unavailable' | 'unknown'>('unknown');
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('mixed');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);

  const toast = useToast();

  // Memoize theme colors to prevent unnecessary re-renders
  const colors = useMemo(() => ({
    bgColor: useColorModeValue('white', 'gray.800'),
    borderColor: useColorModeValue('gray.200', 'gray.600'),
    textColor: useColorModeValue('gray.800', 'white'),
    subtextColor: useColorModeValue('gray.600', 'gray.400'),
    activeColor: useColorModeValue('blue.500', 'blue.300'),
    completedColor: useColorModeValue('green.500', 'green.300'),
    tipsBgColor: useColorModeValue('blue.50', 'blue.900'),
    tipsTextColor: useColorModeValue('blue.700', 'blue.200')
  }), []);

  const { bgColor, borderColor, textColor, subtextColor, activeColor, completedColor, tipsBgColor, tipsTextColor } = colors;

  // Define workout types with descriptions
  const workoutTypes = useMemo(() => [
    {
      value: 'mixed',
      label: 'Mixed Training',
      description: 'Combination of strength, cardio, and flexibility'
    },
    {
      value: 'strength',
      label: 'Strength Training',
      description: 'Focus on building muscle and power'
    },
    {
      value: 'cardio',
      label: 'Cardio',
      description: 'Heart-pumping cardiovascular exercises'
    },
    {
      value: 'hiit',
      label: 'HIIT',
      description: 'High-intensity interval training'
    },
    {
      value: 'flexibility',
      label: 'Flexibility',
      description: 'Stretching and mobility work'
    },
    {
      value: 'upper_body',
      label: 'Upper Body',
      description: 'Chest, back, shoulders, and arms'
    },
    {
      value: 'lower_body',
      label: 'Lower Body',
      description: 'Legs, glutes, and core'
    },
    {
      value: 'push',
      label: 'Push Day',
      description: 'Chest, shoulders, and triceps'
    },
    {
      value: 'pull',
      label: 'Pull Day',
      description: 'Back and biceps'
    },
    {
      value: 'core',
      label: 'Core Focus',
      description: 'Abdominals and core stability'
    }
  ], []);

  // Optimized timer effect for exercise and rest periods with better cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isWorkoutActive && currentWorkout) {
      interval = setInterval(() => {
        if (isResting) {
          setRestTimer(prev => {
            if (prev <= 1) {
              setIsResting(false);
              setRestTimer(0);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setExerciseTimer(prev => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, [isWorkoutActive, isResting, currentWorkout]);

  const generateWorkout = useCallback(async (retryCount = 0) => {
    if (isGenerating) return; // Prevent multiple simultaneous generations

    setIsGenerating(true);
    setGenerationStatus(retryCount > 0 ? `Retrying workout generation (attempt ${retryCount + 1})...` : 'Generating your personalized workout...');
    const startTime = performance.now();
    const maxRetries = 2; // Allow up to 2 retries for 503 errors

    try {
      // Configure the API client with user info
      neuraStackClient.configure({
        userId: user?.uid || '',
      });

      // Check service health before attempting workout generation (only on first attempt)
      if (retryCount === 0) {
        try {
          const healthCheck = await neuraStackClient.healthCheck();
          console.log('Service health check:', healthCheck);
          setServiceStatus(healthCheck.status === 'healthy' ? 'healthy' : 'degraded');
        } catch (healthError) {
          console.warn('Health check failed, proceeding with generation attempt:', healthError);
          setServiceStatus('degraded');
        }
      }

      // Build user metadata for the workout API with converted names
      const goalNames = convertGoalCodesToNames(profile.goals);
      const equipmentNames = convertEquipmentCodesToNames(profile.equipment);

      // Ensure age is provided (required by API)
      const userAge = profile.age || 25; // Default to 25 if not provided

      const userMetadata: WorkoutUserMetadata = {
        age: userAge, // Age is required by the API
        fitnessLevel: profile.fitnessLevel,
        // gender: convertGenderForAPI(profile.gender), // Convert gender for API compatibility
        // weight: profile.weight,
        goals: goalNames, // Use full names instead of codes
        equipment: equipmentNames, // Use full names instead of codes
        // timeAvailable: profile.availableTime,
        // injuries: profile.injuries || [],
      };

      // Build workout history from recent workouts
      const recentWorkouts = workoutPlans
        .filter(w => w.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 5); // Last 5 workouts

      const workoutHistory: WorkoutHistoryEntry[] = recentWorkouts.map(w => ({
        date: w.completedAt!.toISOString().split('T')[0],
        type: (w.workoutType as 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed') || 'mixed',
        duration: w.duration,
        exercises: w.exercises.map(e => e.name),
        difficulty: w.difficulty,
        rating: 4 // Default rating since we don't track this yet
      }));

      // Create natural language workout request
      const workoutRequest = buildWorkoutRequest(profile, recentWorkouts, selectedWorkoutType);

      // Prepare the workout API request
      const workoutAPIRequest: WorkoutAPIRequest = {
        userMetadata,
        workoutHistory,
        workoutRequest
      };

      console.log('Workout API Request:', workoutAPIRequest);

      // Call the dedicated workout API endpoint with extended timeout
      const response = await neuraStackClient.generateWorkout(workoutAPIRequest, {
        userId: user?.uid || '',
        timeout: 60000 // 60 seconds for workout generation
      });

      if (response.status === 'success' && response.data) {
        // Validate the API response structure
        const workout = response.data.workout;
        if (!workout || !workout.exercises || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
          throw new Error('Invalid workout data received from API');
        }

        // Transform the API response to our internal WorkoutPlan format
        const workoutPlan = transformAPIWorkoutToPlan(workout);

        // Enhance workout with additional metadata
        const enhancedWorkout: WorkoutPlan = {
          ...workoutPlan,
          generationContext: {
            userContext: { userMetadata, workoutHistory, workoutRequest },
            aiModelsUsed: [response.data.metadata.model],
            generationTime: performance.now() - startTime,
            sessionId: response.correlationId || 'unknown'
          }
        };

        setCurrentWorkout(enhancedWorkout);

        // Store successful workout generation in memory (concise)
        if (user?.uid) {
          await neuraStackClient.storeMemory({
            userId: user.uid,
            sessionId: response.correlationId || 'unknown',
            content: `Generated: ${workoutPlan.name}, ${workoutPlan.exercises.length}ex, ${workoutPlan.duration}min`,
            isUserPrompt: false,
            responseQuality: 0.9,
            ensembleMode: false
          });
        }

        const endTime = performance.now();
        console.log(`Workout generated in ${endTime - startTime}ms`);

        toast({
          title: 'Workout Generated!',
          description: `Your personalized ${workoutPlan.name} is ready.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(response.message || 'Failed to generate workout');
      }
    } catch (error) {
      console.error('Error generating workout:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let toastDescription = 'Unable to generate workout. Please try again.';
      let toastTitle = 'Generation Failed';

      // Handle specific API errors with more detailed messaging
      if (errorMessage.includes('timeout') || errorMessage.includes('Request timed out')) {
        toastDescription = 'Workout generation timed out. Please try again with a simpler request.';
        toastTitle = 'Request Timeout';
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to connect')) {
        toastDescription = 'Unable to connect to workout service. Please check your internet connection.';
        toastTitle = 'Connection Error';
      } else if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable') || errorMessage.includes('temporarily unavailable')) {
        toastDescription = 'Workout generation service is temporarily down for maintenance. Using backup workout instead.';
        toastTitle = 'Service Temporarily Unavailable';
        setServiceStatus('unavailable');
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        toastDescription = 'Workout service encountered an error. Please try again in a few minutes.';
        toastTitle = 'Service Error';
      } else if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
        toastDescription = 'Too many workout requests. Please wait a moment before trying again.';
        toastTitle = 'Rate Limited';
      } else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        toastDescription = 'Invalid workout request. Please check your fitness profile settings.';
        toastTitle = 'Invalid Request';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toastDescription = 'Authentication required. Please sign in and try again.';
        toastTitle = 'Authentication Error';
      }

      // Retry logic for retryable errors (503, 500, timeout)
      const isRetryableError = errorMessage.includes('503') ||
                              errorMessage.includes('500') ||
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('temporarily unavailable');

      if (isRetryableError && retryCount < maxRetries) {
        console.log(`Retrying workout generation (attempt ${retryCount + 1}/${maxRetries})`);

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay));

        setIsGenerating(false); // Reset state for retry
        return generateWorkout(retryCount + 1);
      }

      // Try with fallback workout as last resort
      try {
        const fallbackWorkout = createFallbackWorkout();
        setCurrentWorkout(fallbackWorkout);

        toast({
          title: 'Backup Workout Generated',
          description: 'AI service temporarily unavailable. Created a basic workout based on your profile.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      } catch (fallbackError) {
        console.error('Fallback workout creation failed:', fallbackError);
      }

      toast({
        title: toastTitle,
        description: toastDescription,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  }, [isGenerating, profile, user?.uid, workoutPlans, toast]);

  // Periodic service health check
  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        const healthCheck = await neuraStackClient.healthCheck();
        setServiceStatus(healthCheck.status === 'healthy' ? 'healthy' : 'degraded');
      } catch (error) {
        console.warn('Periodic health check failed:', error);
        setServiceStatus('degraded');
      }
    };

    // Check immediately on mount
    checkServiceHealth();

    // Then check every 2 minutes
    const interval = setInterval(checkServiceHealth, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to convert goal codes to full names
  const convertGoalCodesToNames = useCallback((goalCodes: string[]): string[] => {
    return goalCodes.map(code => {
      const goal = FITNESS_GOALS.find(g => g.code === code);
      return goal ? goal.label.toLowerCase() : code.toLowerCase();
    });
  }, []);

  // Helper function to convert equipment codes to full names
  const convertEquipmentCodesToNames = useCallback((equipmentCodes: string[]): string[] => {
    return equipmentCodes.map(code => {
      const equipment = equipmentOptions.find(e => e.code === code);
      return equipment ? equipment.label.toLowerCase() : code.toLowerCase();
    });
  }, []);

  // Helper function to convert gender for API compatibility
  // const convertGenderForAPI = useCallback((gender?: string): 'male' | 'female' | 'rather_not_say' | undefined => {
  //   if (!gender) return undefined;
  //   if (gender === 'Rather Not Say') return 'rather_not_say';
  //   if (gender === 'Male') return 'male';
  //   if (gender === 'Female') return 'female';
  //   return undefined; // fallback for unknown values
  // }, []);

  // Build natural language workout request for the API
  const buildWorkoutRequest = useCallback((profile: any, recentWorkouts: any[], workoutType: string) => {
    // Convert goal codes to full names
    const goalNames = convertGoalCodesToNames(profile.goals);
    const goals = goalNames.slice(0, 2).join(' and ');

    // Convert equipment codes to full names
    const equipmentNames = convertEquipmentCodesToNames(profile.equipment);
    const equipment = equipmentNames.length > 0 ? equipmentNames.join(', ') : 'bodyweight only';

    // Get workout type description
    const selectedType = workoutTypes.find(type => type.value === workoutType);
    const workoutTypeDescription = selectedType ? selectedType.label : 'Mixed Training';

    const recentWorkoutContext = recentWorkouts.length > 0
      ? ` I recently completed a ${recentWorkouts[0].difficulty} ${recentWorkouts[0].name}.`
      : '';

    return `I want a ${profile.fitnessLevel} level ${workoutTypeDescription.toLowerCase()} workout for ${profile.availableTime} minutes focusing on ${goals}. I have access to ${equipment}.${recentWorkoutContext} Please create a personalized ${workoutTypeDescription.toLowerCase()} workout plan with proper warm-up and cool-down.`;
  }, [convertGoalCodesToNames, convertEquipmentCodesToNames, workoutTypes]);

  // Transform API workout response to internal WorkoutPlan format
  const transformAPIWorkoutToPlan = useCallback((apiWorkout: any): WorkoutPlan => {
    // Validate required fields
    if (!apiWorkout || !apiWorkout.exercises || !Array.isArray(apiWorkout.exercises)) {
      throw new Error('Invalid workout structure received from API');
    }

    // Transform API exercises to internal format with validation
    const exercises: Exercise[] = apiWorkout.exercises.map((apiExercise: any, index: number) => {
      if (!apiExercise.name) {
        throw new Error(`Exercise ${index + 1} is missing a name`);
      }

      return {
        name: apiExercise.name,
        sets: typeof apiExercise.sets === 'number' ? apiExercise.sets : 3,
        reps: typeof apiExercise.reps === 'number' ? apiExercise.reps : 10,
        duration: typeof apiExercise.duration === 'number' ? apiExercise.duration : 0,
        restTime: typeof apiExercise.restTime === 'number' ? apiExercise.restTime : 60,
        instructions: apiExercise.instructions || 'Perform exercise with proper form',
        tips: apiExercise.tips || 'Focus on controlled movements',
        targetMuscles: Array.isArray(apiExercise.targetMuscles) ? apiExercise.targetMuscles : ['general'],
        equipment: Array.isArray(apiExercise.equipment) ? apiExercise.equipment : ['bodyweight'],
        intensity: apiExercise.intensity || 'moderate',
        progressionNotes: Array.isArray(apiExercise.progressionNotes)
          ? apiExercise.progressionNotes
          : [apiExercise.progressionNotes || 'Progress gradually'],
        modifications: Array.isArray(apiExercise.modifications) ? apiExercise.modifications : [],
        safetyNotes: apiExercise.safetyNotes || 'Listen to your body and maintain proper form'
      };
    });

    // Parse duration string to number (e.g., "45 minutes" -> 45)
    let duration = profile.availableTime;
    if (apiWorkout.duration) {
      const durationMatch = String(apiWorkout.duration).match(/(\d+)/);
      duration = durationMatch ? parseInt(durationMatch[1]) : profile.availableTime;
    }

    // Safe warmup processing
    const warmupExercises = Array.isArray(apiWorkout.warmup) ? apiWorkout.warmup : [];
    const warmupDuration = warmupExercises.length > 0
      ? warmupExercises.reduce((total: number, w: any) => total + (w.duration || 60), 0) / 60
      : 3;

    // Safe cooldown processing
    const cooldownExercises = Array.isArray(apiWorkout.cooldown) ? apiWorkout.cooldown : [];
    const cooldownDuration = cooldownExercises.length > 0
      ? cooldownExercises.reduce((total: number, c: any) => total + (c.duration || 60), 0) / 60
      : 2;

    return {
      id: Date.now().toString(),
      name: apiWorkout.type ?
        (apiWorkout.type.charAt(0).toUpperCase() + apiWorkout.type.slice(1) + ' Workout') :
        `AI Generated ${workoutTypes.find(t => t.value === selectedWorkoutType)?.label || 'Mixed'} Workout`,
      duration,
      difficulty: apiWorkout.difficulty || profile.fitnessLevel,
      exercises,
      createdAt: new Date(),
      completedAt: null,
      focusAreas: Array.isArray(apiWorkout.tags) ? apiWorkout.tags : ['general'],
      workoutType: apiWorkout.type || selectedWorkoutType,
      coachingNotes: apiWorkout.notes || 'Focus on proper form and listen to your body',
      warmUp: {
        duration: warmupDuration,
        exercises: warmupExercises.map((w: any) => w.name || 'Dynamic warm-up').filter(Boolean)
      },
      coolDown: {
        duration: cooldownDuration,
        exercises: cooldownExercises.map((c: any) => c.name || 'Cool-down stretch').filter(Boolean)
      }
    };
  }, [profile, selectedWorkoutType, workoutTypes]);











  // Create fallback workout when parsing fails
  const createFallbackWorkout = useCallback((): WorkoutPlan => {
    const selectedType = workoutTypes.find(type => type.value === selectedWorkoutType);
    const workoutTypeName = selectedType ? selectedType.label : 'Mixed Training';
    const basicExercises: Exercise[] = [
      {
        name: 'Bodyweight Squats',
        sets: 3,
        reps: 12,
        duration: 0,
        restTime: 60,
        instructions: 'Stand with feet shoulder-width apart, lower into squat position, then return to standing.',
        tips: 'Keep your chest up and weight in your heels.',
        targetMuscles: ['quadriceps', 'glutes'],
      },
      {
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        duration: 0,
        restTime: 60,
        instructions: 'Start in plank position, lower chest to ground, push back up.',
        tips: 'Modify on knees if needed. Keep core engaged.',
        targetMuscles: ['chest', 'triceps', 'shoulders'],
      },
      {
        name: 'Plank',
        sets: 3,
        reps: 0,
        duration: 30,
        restTime: 60,
        instructions: 'Hold plank position with straight line from head to heels.',
        tips: 'Engage core and breathe steadily.',
        targetMuscles: ['core', 'shoulders'],
      },
    ];

    return {
      id: Date.now().toString(),
      name: `Basic ${workoutTypeName} Workout`,
      duration: profile.availableTime,
      difficulty: profile.fitnessLevel,
      exercises: basicExercises,
      createdAt: new Date(),
      completedAt: null,
      workoutType: selectedWorkoutType as 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed',
    };
  }, [profile, selectedWorkoutType, workoutTypes]);











  const startWorkout = useCallback(() => {
    setIsWorkoutActive(true);
    setCurrentExerciseIndex(0);
    setExerciseTimer(0);
    setCompletedExercises(new Set());
    setWorkoutStartTime(new Date());
    toast({
      title: 'Workout Started!',
      description: 'Good luck with your training session.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const completeExercise = () => {
    if (!currentWorkout) return;

    const newCompleted = new Set(completedExercises);
    newCompleted.add(currentExerciseIndex);
    setCompletedExercises(newCompleted);

    if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
      // Start rest period
      const currentExercise = currentWorkout.exercises[currentExerciseIndex];
      setRestTimer(currentExercise.restTime);
      setIsResting(true);
      setCurrentExerciseIndex(prev => prev + 1);
      setExerciseTimer(0);
    } else {
      // Workout complete
      finishWorkout();
    }
  };

  const finishWorkout = useCallback(async () => {
    if (!currentWorkout || !workoutStartTime) return;

    const actualDurationMinutes = Math.floor((Date.now() - workoutStartTime.getTime()) / (1000 * 60));

    const completedWorkout = {
      ...currentWorkout,
      completedAt: new Date(),
      actualDuration: actualDurationMinutes,
      completionRate: (completedExercises.size / currentWorkout.exercises.length) * 100
    };

    // Store workout completion in memory for future AI context (concise)
    if (user?.uid && currentWorkout.generationContext?.sessionId) {
      try {
        await neuraStackClient.storeMemory({
          userId: user.uid,
          sessionId: currentWorkout.generationContext.sessionId,
          content: `Completed: ${currentWorkout.name}, ${actualDurationMinutes}min, ${completedWorkout.completionRate.toFixed(0)}%, ${completedExercises.size}/${currentWorkout.exercises.length}ex`,
          isUserPrompt: false,
          responseQuality: completedWorkout.completionRate >= 80 ? 0.9 : 0.6,
          ensembleMode: true
        });
      } catch (error) {
        console.warn('Failed to store workout completion in memory:', error);
      }
    }

    addWorkoutPlan(completedWorkout);
    setIsWorkoutActive(false);

    // Show feedback form instead of immediately completing
    setShowFeedback(true);

    toast({
      title: 'Workout Complete!',
      description: `Great job! You completed ${completedExercises.size}/${currentWorkout.exercises.length} exercises.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [currentWorkout, workoutStartTime, completedExercises, user?.uid, addWorkoutPlan, toast]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFeedbackComplete = useCallback(() => {
    setShowFeedback(false);
    onWorkoutComplete(currentWorkout!);
  }, [currentWorkout, onWorkoutComplete]);

  const handleSkipFeedback = useCallback(() => {
    setShowFeedback(false);
    onWorkoutComplete(currentWorkout!);
  }, [currentWorkout, onWorkoutComplete]);

  // Show feedback form after workout completion
  if (showFeedback && currentWorkout && workoutStartTime) {
    const actualDurationMinutes = Math.floor((Date.now() - workoutStartTime.getTime()) / (1000 * 60));

    return (
      <WorkoutFeedback
        workout={currentWorkout}
        completedExercises={completedExercises}
        actualDuration={actualDurationMinutes}
        onFeedbackComplete={handleFeedbackComplete}
        onSkip={handleSkipFeedback}
      />
    );
  }

  if (isGenerating) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="100%"
        p={8}
        textAlign="center"
      >
        <Spinner size="xl" color={activeColor} thickness="4px" mb={6} />
        <Text fontSize="xl" fontWeight="semibold" color={textColor} mb={2}>
          Generating Your Workout
        </Text>
        <Text color={subtextColor}>
          {generationStatus || 'The team is creating a personalized workout based on your profile...'}
        </Text>
      </Flex>
    );
  }

  if (!currentWorkout) {
    return (
      <VStack spacing={{ base: 6, md: 8 }} p={{ base: 4, md: 6 }} align="stretch">
        {/* Service Status Indicator */}
        {serviceStatus === 'degraded' && (
          <Box
            bg="orange.50"
            border="1px solid"
            borderColor="orange.200"
            borderRadius="md"
            p={3}
            textAlign="center"
          >
            <Text fontSize="sm" color="orange.700" fontWeight="medium">
              Workout service experiencing issues - fallback workouts available
            </Text>
          </Box>
        )}
        {serviceStatus === 'unavailable' && (
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="md"
            p={3}
            textAlign="center"
          >
            <Text fontSize="sm" color="red.700" fontWeight="medium">
              Workout service temporarily unavailable - using backup workouts
            </Text>
          </Box>
        )}

        <Box textAlign="center" px={{ base: 2, md: 0 }}>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor} mb={2}>
            Ready for Your Workout?
          </Text>
          <Text color={subtextColor} fontSize={{ base: "sm", md: "md" }}>
            Let AI generate a personalized workout based on your fitness profile.
          </Text>
        </Box>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="semibold" color={textColor}>
                Your Workout Will Include:
              </Text>
              <VStack spacing={2} align="start">
                <HStack>
                  <Icon as={PiTargetBold} color={activeColor} />
                  <Text fontSize="sm" color={subtextColor}>
                    <Text as="span" fontWeight="semibold" color={textColor}>
                      {workoutTypes.find(t => t.value === selectedWorkoutType)?.label}
                    </Text>
                    {' - '}
                    {workoutTypes.find(t => t.value === selectedWorkoutType)?.description}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={PiTargetBold} color={activeColor} />
                  <Text fontSize="sm" color={subtextColor}>
                    Exercises tailored to your {profile.fitnessLevel} level
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={PiTimerBold} color={activeColor} />
                  <Text fontSize="sm" color={subtextColor}>
                    {profile.availableTime} minute duration
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={PiLightningBold} color={activeColor} />
                  <Text fontSize="sm" color={subtextColor}>
                    Focus on: {profile.goals.join(', ')}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Workout Type Selector */}
        <Card bg={bgColor} borderColor={borderColor} shadow={{ base: "lg", md: "md" }}>
          <CardBody p={{ base: 5, md: 6 }}>
            <VStack spacing={{ base: 4, md: 5 }} align="stretch">
              <Box textAlign="center">
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor} mb={2}>
                  Choose Your Workout Type
                </Text>
                <Text fontSize="sm" color={subtextColor}>
                  Select the type of workout you'd like to focus on today
                </Text>
              </Box>

              <Box>
                <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  spacing={{ base: 3, md: 4 }}
                  justifyItems="stretch"
                >
                  {workoutTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={selectedWorkoutType === type.value ? "solid" : "outline"}
                      colorScheme={selectedWorkoutType === type.value ? "blue" : "gray"}
                      size="md"
                      onClick={() => setSelectedWorkoutType(type.value)}
                      w="full"
                      h={{ base: "60px", md: "70px" }}
                      flexDirection="column"
                      gap={1}
                      position="relative"
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'md',
                        borderColor: 'blue.300',
                        bg: selectedWorkoutType === type.value ? 'blue.600' : 'gray.50'
                      }}
                      _active={{
                        transform: 'translateY(0px)'
                      }}
                      transition="all 0.2s ease-in-out"
                      bg={selectedWorkoutType === type.value ? 'blue.500' : 'transparent'}
                      borderWidth="1px"
                      borderColor={selectedWorkoutType === type.value ? "blue.500" : "gray.300"}
                    >
                      <Text
                        fontSize={{ base: "sm", md: "md" }}
                        fontWeight="semibold"
                        textAlign="center"
                        lineHeight="1.2"
                        color={selectedWorkoutType === type.value ? "white" : textColor}
                      >
                        {type.label}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={selectedWorkoutType === type.value ? "blue.100" : subtextColor}
                        noOfLines={2}
                        textAlign="center"
                        lineHeight="1.1"
                      >
                        {type.description}
                      </Text>
                    </Button>
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <VStack spacing={4}>
          <Button
            colorScheme="blue"
            size="lg"
            w="100%"
            leftIcon={<Icon as={PiLightningBold} />}
            onClick={() => generateWorkout()}
            py={{ base: 4, md: 6 }}
            isLoading={isGenerating}
            loadingText="Generating..."
            minH={{ base: "56px", md: "auto" }}
            fontSize={{ base: "md", md: "lg" }}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'xl',
              bg: 'blue.600'
            }}
            _active={{
              transform: 'translateY(0px)',
              shadow: 'lg'
            }}
            transition="all 0.2s ease-in-out"
          >
            Generate AI Workout
          </Button>



          <Button
            variant="ghost"
            onClick={onBack}
            size="md"
          >
            Back to Dashboard
          </Button>
        </VStack>
      </VStack>
    );
  }

  return (
    <>
      <ModernLoadingAnimation
        isVisible={isGenerating}
        messages={[
          'Analyzing your fitness profile...',
          `Selecting optimal ${workoutTypes.find(t => t.value === selectedWorkoutType)?.label.toLowerCase()} exercises...`,
          'Customizing workout intensity...',
          'Personalizing rest periods...',
          `Finalizing your ${workoutTypes.find(t => t.value === selectedWorkoutType)?.label.toLowerCase()} routine...`
        ]}
        title={`Creating Your AI ${workoutTypes.find(t => t.value === selectedWorkoutType)?.label} Workout`}
      />

      <Box
        h="100%"
        overflow={{ base: "auto", md: "auto" }}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
      <VStack spacing={{ base: 4, md: 6 }} p={{ base: 3, md: 4 }} align="stretch" minH="100%">
      {/* Workout Header */}
      <Card bg={bgColor} borderColor={borderColor} shadow={{ base: "lg", md: "md" }}>
        <CardBody p={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            <HStack justify="space-between" align="start" flexWrap={{ base: "wrap", md: "nowrap" }}>
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor}>
                  {currentWorkout.name}
                </Text>
                <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
                  <Badge colorScheme="blue" fontSize={{ base: "xs", md: "sm" }}>
                    {currentWorkout.difficulty}
                  </Badge>
                  <Text fontSize="sm" color={subtextColor}>
                    {currentWorkout.duration} min
                  </Text>
                </HStack>
              </VStack>
              
              {isWorkoutActive && (
                <VStack align="end" spacing={1}>
                  <Text fontSize="lg" fontWeight="semibold" color={activeColor}>
                    {formatTime(exerciseTimer)}
                  </Text>
                  <Text fontSize="xs" color={subtextColor}>
                    Exercise Time
                  </Text>
                </VStack>
              )}
            </HStack>

            {/* Modern Progress Indicator */}
            <ModernProgressIndicator
              current={completedExercises.size}
              total={currentWorkout.exercises.length}
              label="Workout Progress"
              showPercentage={true}
              size="md"
              colorScheme="green"
            />
          </VStack>
        </CardBody>
      </Card>

      {/* Rest Timer */}
      <AnimatePresence>
        {isResting && (
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card bg="orange.50" borderColor="orange.200">
              <CardBody textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="orange.600" mb={2}>
                  Rest Time
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.700">
                  {formatTime(restTimer)}
                </Text>
                <Text fontSize="sm" color="orange.500" mt={1}>
                  Get ready for the next exercise
                </Text>
              </CardBody>
            </Card>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Current Exercise */}
      {!isResting && isWorkoutActive && (
        <Card bg={bgColor} borderColor={borderColor} borderWidth={2}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                  {currentWorkout.exercises[currentExerciseIndex]?.name}
                </Text>
                <Badge colorScheme="blue">
                  {currentExerciseIndex + 1} / {currentWorkout.exercises.length}
                </Badge>
              </HStack>

              <Divider />

              <VStack spacing={3} align="stretch">
                <HStack spacing={6}>
                  {currentWorkout.exercises[currentExerciseIndex]?.sets > 0 && (
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold" color={activeColor}>
                        {currentWorkout.exercises[currentExerciseIndex]?.sets}
                      </Text>
                      <Text fontSize="xs" color={subtextColor}>SETS</Text>
                    </VStack>
                  )}
                  
                  {currentWorkout.exercises[currentExerciseIndex]?.reps > 0 && (
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold" color={activeColor}>
                        {currentWorkout.exercises[currentExerciseIndex]?.reps}
                      </Text>
                      <Text fontSize="xs" color={subtextColor}>REPS</Text>
                    </VStack>
                  )}
                  
                  {currentWorkout.exercises[currentExerciseIndex]?.duration > 0 && (
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold" color={activeColor}>
                        {currentWorkout.exercises[currentExerciseIndex]?.duration}s
                      </Text>
                      <Text fontSize="xs" color={subtextColor}>DURATION</Text>
                    </VStack>
                  )}
                </HStack>

                <Text fontSize="sm" color={subtextColor}>
                  {currentWorkout.exercises[currentExerciseIndex]?.instructions}
                </Text>

                {currentWorkout.exercises[currentExerciseIndex]?.tips && (
                  <Box bg={tipsBgColor} p={3} borderRadius="md">
                    <Text fontSize="sm" color={tipsTextColor} fontWeight="medium">
                      Tip: {currentWorkout.exercises[currentExerciseIndex]?.tips}
                    </Text>
                  </Box>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Exercise List */}
      {!isWorkoutActive && (
        <VStack spacing={3} align="stretch" flex={1} overflowY="auto">
          {currentWorkout.exercises.map((exercise, index) => (
            <Card
              key={index}
              bg={bgColor}
              borderColor={borderColor}
              opacity={completedExercises.has(index) ? 0.7 : 1}
            >
              <CardBody>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Text fontWeight="semibold" color={textColor}>
                        {exercise.name}
                      </Text>
                      {completedExercises.has(index) && (
                        <Icon as={PiCheckBold} color={completedColor} />
                      )}
                    </HStack>
                    <HStack spacing={4} fontSize="sm" color={subtextColor}>
                      {exercise.sets > 0 && <Text>{exercise.sets} sets</Text>}
                      {exercise.reps > 0 && <Text>{exercise.reps} reps</Text>}
                      {exercise.duration > 0 && <Text>{exercise.duration}s</Text>}
                    </HStack>
                    <Text fontSize="xs" color={subtextColor} noOfLines={2}>
                      {exercise.instructions}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Action Buttons */}
      <VStack spacing={3}>
        {!isWorkoutActive ? (
          <Button
            colorScheme="blue"
            size="lg"
            w="100%"
            leftIcon={<Icon as={PiPlayBold} />}
            onClick={startWorkout}
            py={6}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'xl',
              bg: 'blue.600'
            }}
            _active={{
              transform: 'translateY(0px)',
              shadow: 'lg'
            }}
            transition="all 0.2s ease-in-out"
          >
            Start Workout
          </Button>
        ) : (
          <HStack spacing={3} w="100%">
            <Button
              colorScheme="green"
              size="lg"
              flex={1}
              leftIcon={<Icon as={PiCheckBold} />}
              onClick={completeExercise}
              isDisabled={isResting}
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
                bg: 'green.600'
              }}
              _active={{
                transform: 'translateY(0px)',
                shadow: 'md'
              }}
              transition="all 0.2s ease-in-out"
            >
              {currentExerciseIndex === currentWorkout.exercises.length - 1 ? 'Finish' : 'Complete Exercise'}
            </Button>
            
            <Button
              colorScheme="red"
              variant="outline"
              size="lg"
              leftIcon={<Icon as={PiStopBold} />}
              onClick={() => setIsWorkoutActive(false)}
            >
              Stop
            </Button>
          </HStack>
        )}
        
        {!isWorkoutActive && (
          <Button
            variant="ghost"
            onClick={onBack}
            size="md"
          >
            Back to Dashboard
          </Button>
        )}
      </VStack>
      </VStack>
    </Box>
    </>
  );
});

export default WorkoutGenerator;
