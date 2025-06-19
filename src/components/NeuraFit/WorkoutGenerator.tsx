import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    HStack,
    Icon,
    SimpleGrid,
    Text,
    useColorModeValue,
    useToast,
    VStack
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    PiCheckBold,
    PiGearBold,
    PiLightningBold,
    PiPlayBold,
    PiSkipForwardBold,
    PiStopBold,
    PiSwapBold,
    PiTargetBold,
    PiTimerBold
} from 'react-icons/pi';
import equipmentOptions from '../../constants/equipmentOptions';
import { FITNESS_GOALS } from '../../constants/fitnessGoals';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';
import { neuraStackClient } from '../../lib/neurastack-client';
import type { Exercise, WorkoutAPIRequest, WorkoutHistoryEntry, WorkoutPlan, WorkoutUserMetadata } from '../../lib/types';
import { useAuthStore } from '../../store/useAuthStore';
import { useFitnessStore } from '../../store/useFitnessStore';
import ExerciseSwapper from './ExerciseSwapper';
import ModernLoadingAnimation from './ModernLoadingAnimation';
import ModernProgressIndicator from './ModernProgressIndicator';
import WorkoutFeedback from './WorkoutFeedback';
import type { WorkoutModifications } from './WorkoutModifier';
import WorkoutModifier from './WorkoutModifier';

const MotionBox = motion(Box);

interface WorkoutGeneratorProps {
  onWorkoutComplete: (workout: WorkoutPlan) => void;
  onBack: () => void;
}

const WorkoutGenerator = memo(function WorkoutGenerator({ onWorkoutComplete, onBack }: WorkoutGeneratorProps) {
  const { profile, addWorkoutPlan, workoutPlans } = useFitnessStore();
  const { user } = useAuthStore();
  const { isMobile, triggerHaptic, workoutConfig } = useMobileOptimization();
  const toast = useToast();
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
  const [showExerciseSwapper, setShowExerciseSwapper] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState<{ exercise: Exercise; index: number } | null>(null);
  const [showWorkoutModifier, setShowWorkoutModifier] = useState(false);

  // Workout state management functions
  const clearWorkoutState = useCallback(() => {
    try {
      localStorage.removeItem('neurafit-workout-state');
    } catch (error) {
      console.warn('Failed to clear workout state:', error);
    }
  }, []);

  const saveWorkoutState = useCallback(() => {
    if (!currentWorkout || !isWorkoutActive) return;

    const workoutState = {
      workout: currentWorkout,
      currentExerciseIndex,
      completedExercises: Array.from(completedExercises),
      exerciseTimer,
      restTimer,
      isResting,
      workoutStartTime: workoutStartTime?.toISOString(),
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem('neurafit-workout-state', JSON.stringify(workoutState));
    } catch (error) {
      console.warn('Failed to save workout state:', error);
    }
  }, [currentWorkout, isWorkoutActive, currentExerciseIndex, completedExercises, exerciseTimer, restTimer, isResting, workoutStartTime]);

  const loadWorkoutState = useCallback(() => {
    try {
      const savedState = localStorage.getItem('neurafit-workout-state');
      if (!savedState) return null;

      const workoutState = JSON.parse(savedState);

      // Check if the saved state is recent (within 24 hours)
      const stateAge = Date.now() - new Date(workoutState.timestamp).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (stateAge > maxAge) {
        localStorage.removeItem('neurafit-workout-state');
        return null;
      }

      return workoutState;
    } catch (error) {
      console.warn('Failed to load workout state:', error);
      localStorage.removeItem('neurafit-workout-state');
      return null;
    }
  }, []);

  // Confirmation for stopping workout
  const handleStopWorkout = useCallback(() => {
    if (window.confirm('Are you sure you want to stop this workout? Your progress will be lost.')) {
      setIsWorkoutActive(false);
      setIsResting(false);
      setRestTimer(0);
      setExerciseTimer(0);
      setCurrentExerciseIndex(0);
      setCompletedExercises(new Set());
      setWorkoutStartTime(null);

      // Clear saved workout state
      clearWorkoutState();

      toast({
        title: 'Workout Stopped',
        description: 'You can start a new workout anytime.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast, clearWorkoutState]);

  // Theme colors - hooks must be called at top level
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const completedColor = useColorModeValue('green.500', 'green.300');
  const tipsBgColor = useColorModeValue('blue.50', 'blue.900');
  const tipsTextColor = useColorModeValue('blue.700', 'blue.200');

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
    setGenerationStatus(retryCount > 0 ? `Retrying workout generation (attempt ${retryCount + 1}/3)...` : 'Generating your personalized workout...');
    const startTime = performance.now();
    const maxRetries = 2; // Allow up to 2 retries for 503 errors

    try {
      // Configure the API client with user info
      neuraStackClient.configure({
        userId: user?.uid || '',
      });

      // Only show service status warning on first attempt, not retries
      if (retryCount === 0) {
        // Reset service status to unknown at start
        setServiceStatus('unknown');

        // Skip health check to avoid false degraded warnings
        // Let the actual workout generation call determine service status
      }

      // Build user metadata for the workout API with converted names
      const goalNames = convertGoalCodesToNames(profile.goals || []);
      const equipmentNames = convertEquipmentCodesToNames(profile.equipment || []);

      // Convert goal labels back to API values for the API request
      const goalValues = goalNames.map(label => {
        const goal = FITNESS_GOALS.find(g => g.label === label);
        return goal ? goal.value : label.toLowerCase().replace(' ', '_');
      });

      // Ensure age is provided (required by API)
      const userAge = profile.age || 25; // Default to 25 if not provided

      const userMetadata: WorkoutUserMetadata = {
        age: userAge, // Age is required by the API
        fitnessLevel: profile.fitnessLevel,
        gender: profile.gender || 'Rather Not Say',
        weight: profile.weight,
        goals: goalValues, // Use API values for backend
        equipment: equipmentNames, // Use full names instead of codes
        timeAvailable: profile.availableTime,
        injuries: profile.injuries || [],
        daysPerWeek: profile.timeAvailability?.daysPerWeek || 3,
        minutesPerSession: profile.timeAvailability?.minutesPerSession || profile.availableTime,
      };

      // Build workout history from recent workouts
      const recentWorkouts = workoutPlans
        .filter(w => w.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 5); // Last 5 workouts

      const workoutHistory: WorkoutHistoryEntry[] = recentWorkouts.map(w => ({
        date: new Date(w.completedAt!).toISOString().split('T')[0],
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
        timeout: retryCount > 0 ? 90000 : 60000 // Increase timeout on retries: 60s first attempt, 90s on retries
      });

      // If we get here, the service is working - update status to healthy
      setServiceStatus('healthy');

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
            sessionId: response.correlationId || 'unknown',
            version: '1.0.0'
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

        // Trigger haptic feedback for successful generation
        triggerHaptic('success');

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Determine if this is a retryable error
      const isRetryableError = errorMessage.includes('503') ||
                              errorMessage.includes('500') ||
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('temporarily unavailable') ||
                              errorMessage.includes('Service Unavailable') ||
                              errorMessage.includes('Internal Server Error');

      // If this is a retryable error and we have retries left, don't show error to user yet
      if (isRetryableError && retryCount < maxRetries) {
        console.log(`Retrying workout generation (attempt ${retryCount + 1}/${maxRetries + 1}) after error:`, errorMessage);

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay));

        setIsGenerating(false); // Reset state for retry
        return generateWorkout(retryCount + 1);
      }

      // Only log and show error if we've exhausted retries or it's not retryable
      console.error('Error generating workout (final attempt):', error);

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
  }, [isGenerating, profile, user?.uid, workoutPlans, selectedWorkoutType, toast]);

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

  // Helper function to convert goal codes to readable names with deduplication
  const convertGoalCodesToNames = useCallback((goalCodes: string[]): string[] => {
    if (!goalCodes || !Array.isArray(goalCodes)) return [];

    const validGoalNames = goalCodes
      .map(code => {
        // Handle both codes and already converted names
        const goal = FITNESS_GOALS.find(g => g.code === code || g.value === code || g.label.toLowerCase() === code.toLowerCase());
        return goal ? goal.label : null; // Use readable label for display
      })
      .filter((name): name is NonNullable<typeof name> => name !== null && name.length > 0);

    // Remove duplicates and invalid entries
    return [...new Set(validGoalNames)];
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

  // Build comprehensive natural language workout request for the API
  const buildWorkoutRequest = useCallback((profile: any, recentWorkouts: any[], workoutType: string) => {
    // Convert goal codes to readable names (already formatted)
    const goalNames = convertGoalCodesToNames(profile.goals || []);
    const primaryGoals = goalNames.slice(0, 2).join(' and ');
    const allGoals = goalNames.join(', ');

    // Convert equipment codes to full names
    const equipmentNames = convertEquipmentCodesToNames(profile.equipment);
    const equipment = equipmentNames.length > 0 ? equipmentNames.join(', ') : 'bodyweight only';

    // Get workout type description
    const selectedType = workoutTypes.find(type => type.value === workoutType);
    const workoutTypeDescription = selectedType ? selectedType.label : 'Mixed Training';

    // Build user profile context
    const userContext = [];
    if (profile.age) userContext.push(`${profile.age} years old`);
    if (profile.gender && profile.gender !== 'Rather Not Say') userContext.push(profile.gender.toLowerCase());
    if (profile.weight) userContext.push(`${profile.weight} lbs`);

    const userInfo = userContext.length > 0 ? `I am ${userContext.join(', ')}. ` : '';

    // Build fitness context
    const fitnessContext = `I am at a ${profile.fitnessLevel} fitness level`;

    // Build time availability context
    const timeContext = profile.timeAvailability
      ? ` and typically work out ${profile.timeAvailability.daysPerWeek} days per week for ${profile.timeAvailability.minutesPerSession} minutes per session`
      : '';

    // Build injury/limitation context
    const injuryContext = profile.injuries && profile.injuries.length > 0
      ? ` I have the following injuries or limitations to consider: ${profile.injuries.join(', ')}.`
      : ' I have no current injuries or limitations.';

    // Build recent workout context
    const recentWorkoutContext = recentWorkouts.length > 0
      ? ` Recently, I completed a ${recentWorkouts[0].difficulty} ${recentWorkouts[0].type || 'workout'} that included ${recentWorkouts[0].exercises.slice(0, 3).join(', ')}.`
      : '';

    // Build equipment context
    const equipmentContext = ` I have access to: ${equipment}.`;

    // Build goal context
    const goalContext = ` My primary fitness goals are: ${allGoals}.`;

    return `${userInfo}${fitnessContext}${timeContext}.${injuryContext}${recentWorkoutContext}

Please create a personalized ${workoutTypeDescription.toLowerCase()} workout for exactly ${profile.availableTime} minutes.${goalContext}${equipmentContext}

Requirements:
- Workout type: ${workoutTypeDescription}
- Duration: ${profile.availableTime} minutes
- Difficulty: ${profile.fitnessLevel}
- Focus: ${primaryGoals}
- Include proper warm-up (3-5 minutes)
- Include cool-down/stretching (3-5 minutes)
- Provide clear exercise instructions and form tips
- Consider my injury limitations
- Use only available equipment

Please structure the workout with specific exercises, sets, reps, rest periods, and detailed instructions.`;
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

    // Trigger haptic feedback for workout start
    triggerHaptic('success');

    // Prevent screen sleep during workout
    if (isMobile && workoutConfig.preventSleep) {
      workoutConfig.preventSleep().catch(() => {
        // Silently fail if wake lock is not supported
      });
    }

    toast({
      title: 'Workout Started!',
      description: 'Good luck with your training session.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast, triggerHaptic, isMobile, workoutConfig]);

  const completeExercise = () => {
    if (!currentWorkout) return;

    const newCompleted = new Set(completedExercises);
    newCompleted.add(currentExerciseIndex);
    setCompletedExercises(newCompleted);

    // Trigger haptic feedback for exercise completion
    triggerHaptic('medium');

    if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
      // Start rest period
      const currentExercise = currentWorkout.exercises[currentExerciseIndex];
      setRestTimer(currentExercise.restTime);
      setIsResting(true);
      setCurrentExerciseIndex(prev => prev + 1);
      setExerciseTimer(0);
    } else {
      // Workout complete - stronger haptic feedback
      triggerHaptic('success');
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

    // Clear saved workout state since workout is complete
    clearWorkoutState();

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

  // Exercise swapping functionality
  const handleSwapExercise = useCallback((exerciseIndex: number) => {
    if (!currentWorkout) return;

    const exercise = currentWorkout.exercises[exerciseIndex];
    setExerciseToSwap({ exercise, index: exerciseIndex });
    setShowExerciseSwapper(true);
  }, [currentWorkout]);

  const handleExerciseSwapped = useCallback((newExercise: Exercise) => {
    if (!currentWorkout || !exerciseToSwap) return;

    const updatedExercises = [...currentWorkout.exercises];
    updatedExercises[exerciseToSwap.index] = newExercise;

    const updatedWorkout: WorkoutPlan = {
      ...currentWorkout,
      exercises: updatedExercises,
    };

    setCurrentWorkout(updatedWorkout);
    setExerciseToSwap(null);

    toast({
      title: 'Exercise Swapped!',
      description: `Replaced with ${newExercise.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [currentWorkout, exerciseToSwap, toast]);

  const handleCloseSwapper = useCallback(() => {
    setShowExerciseSwapper(false);
    setExerciseToSwap(null);
  }, []);

  // Workout modification functionality
  const handleModifyWorkout = useCallback(() => {
    setShowWorkoutModifier(true);
  }, []);

  const handleWorkoutModified = useCallback(async (modifications: WorkoutModifications) => {
    if (!currentWorkout) return;

    setIsGenerating(true);
    setGenerationStatus('Regenerating workout with your modifications...');

    try {
      // Update the selected workout type if changed
      if (modifications.workoutType) {
        setSelectedWorkoutType(modifications.workoutType);
      }

      // Create a modified workout request based on modifications

      // Build comprehensive workout request with modifications
      const modifiedProfile = {
        ...profile,
        fitnessLevel: modifications.difficulty || profile.fitnessLevel,
        availableTime: modifications.duration || profile.availableTime,
      };

      // Use the same comprehensive request builder
      const workoutRequest = buildWorkoutRequest(modifiedProfile, [], modifications.workoutType || selectedWorkoutType);

      // Convert goal labels back to API values for the API request
      const goalNames = convertGoalCodesToNames(profile.goals || []);
      const goalValues = goalNames.map(label => {
        const goal = FITNESS_GOALS.find(g => g.label === label);
        return goal ? goal.value : label.toLowerCase().replace(' ', '_');
      });

      const userMetadata: WorkoutUserMetadata = {
        age: profile.age || 25, // Ensure age is provided (required by API)
        fitnessLevel: modifications.difficulty || profile.fitnessLevel,
        gender: profile.gender || 'Rather Not Say',
        weight: profile.weight,
        goals: goalValues, // Use API values for backend
        equipment: convertEquipmentCodesToNames(profile.equipment || []),
        timeAvailable: modifications.duration || profile.availableTime,
        injuries: profile.injuries || [],
        daysPerWeek: profile.timeAvailability?.daysPerWeek || 3,
        minutesPerSession: modifications.duration || profile.timeAvailability?.minutesPerSession || profile.availableTime,
      };

      const workoutAPIRequest: WorkoutAPIRequest = {
        userMetadata,
        workoutHistory: [],
        workoutRequest
      };

      const response = await neuraStackClient.generateWorkout(workoutAPIRequest, {
        userId: user?.uid || '',
        timeout: 60000
      });

      if (response.status === 'success' && response.data) {
        const workout = response.data.workout;
        const workoutPlan = transformAPIWorkoutToPlan(workout);

        const enhancedWorkout: WorkoutPlan = {
          ...workoutPlan,
          focusAreas: modifications.focusAreas,
          workoutType: modifications.workoutType as any,
          generationContext: {
            userContext: { userMetadata, workoutHistory: [], workoutRequest },
            aiModelsUsed: [response.data.metadata.model],
            generationTime: performance.now(),
            sessionId: response.correlationId || 'unknown',
            version: '1.0.0'
          }
        };

        setCurrentWorkout(enhancedWorkout);

        toast({
          title: 'Workout Modified!',
          description: 'Your workout has been regenerated with the new parameters.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error modifying workout:', error);
      toast({
        title: 'Modification Failed',
        description: 'Unable to modify workout. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  }, [currentWorkout, profile, selectedWorkoutType, user?.uid, toast]);

  const handleCloseModifier = useCallback(() => {
    setShowWorkoutModifier(false);
  }, []);

  // Load saved workout state on component mount
  useEffect(() => {
    const savedState = loadWorkoutState();
    if (savedState && !currentWorkout) {
      // Ask user if they want to resume the saved workout
      const shouldResume = window.confirm(
        'You have an unfinished workout from earlier. Would you like to resume where you left off?'
      );

      if (shouldResume) {
        setCurrentWorkout(savedState.workout);
        setCurrentExerciseIndex(savedState.currentExerciseIndex);
        setCompletedExercises(new Set(savedState.completedExercises));
        setExerciseTimer(savedState.exerciseTimer);
        setRestTimer(savedState.restTimer);
        setIsResting(savedState.isResting);
        setIsWorkoutActive(true);
        setWorkoutStartTime(savedState.workoutStartTime ? new Date(savedState.workoutStartTime) : new Date());

        toast({
          title: 'Workout Resumed',
          description: 'Continuing from where you left off.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        clearWorkoutState();
      }
    }
  }, [loadWorkoutState, clearWorkoutState, currentWorkout, toast]);

  // Save workout state whenever it changes
  useEffect(() => {
    if (isWorkoutActive && currentWorkout) {
      saveWorkoutState();
    }
  }, [isWorkoutActive, currentWorkout, currentExerciseIndex, completedExercises, exerciseTimer, restTimer, isResting, saveWorkoutState]);

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

  // Remove duplicate loading state - using ModernLoadingAnimation instead

  if (!currentWorkout) {
    return (
      <VStack spacing={{ base: 4, md: 6, lg: 8 }} p={{ base: 3, md: 4, lg: 6 }} align="stretch">
        {/* Service Status Indicator - Only show when service is actually unavailable */}
        {serviceStatus === 'unavailable' && (
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="xl"
            p={{ base: 3, md: 4 }}
            mx={{ base: 2, md: 0 }}
            textAlign="center"
          >
            <Text fontSize={{ base: "xs", md: "sm" }} color="red.700" fontWeight="medium">
              Workout service temporarily unavailable - using backup workouts
            </Text>
          </Box>
        )}

        <Box textAlign="center" px={{ base: 1, md: 0 }}>
          <Text fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} fontWeight="bold" color={textColor} mb={{ base: 2, md: 3 }}>
            Ready for Your Workout?
          </Text>
          <Text color={subtextColor} fontSize={{ base: "sm", md: "md", lg: "lg" }} px={{ base: 2, md: 0 }}>
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
                    Focus on: {convertGoalCodesToNames(profile.goals || []).join(', ')}
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
                      size={{ base: "lg", md: "md" }}
                      onClick={() => setSelectedWorkoutType(type.value)}
                      w="full"
                      h={{ base: "72px", md: "70px", lg: "76px" }}
                      minH={{ base: "72px", md: "70px" }}
                      flexDirection="column"
                      gap={1}
                      position="relative"
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'lg',
                        borderColor: 'blue.300',
                        bg: selectedWorkoutType === type.value ? 'blue.600' : 'gray.50'
                      }}
                      _active={{
                        transform: 'translateY(0px)'
                      }}
                      transition="all 0.2s ease-in-out"
                      bg={selectedWorkoutType === type.value ? 'blue.500' : 'transparent'}
                      borderWidth="2px"
                      borderColor={selectedWorkoutType === type.value ? "blue.500" : "gray.300"}
                      // Enhanced touch targets for mobile
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                      }}
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

        <VStack spacing={{ base: 3, md: 4 }} px={{ base: 2, md: 0 }}>
          <Button
            colorScheme="blue"
            size="lg"
            w="100%"
            leftIcon={<Icon as={PiLightningBold} />}
            onClick={() => generateWorkout()}
            py={{ base: 5, md: 6 }}
            isLoading={isGenerating}
            loadingText={generationStatus || "Generating..."}
            minH={{ base: "64px", md: "auto" }}
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            borderRadius="xl"
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
            // Enhanced touch targets for mobile
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            Generate AI Workout
          </Button>

          <Button
            variant="ghost"
            onClick={onBack}
            size={{ base: "lg", md: "md" }}
            minH={{ base: "48px", md: "auto" }}
            fontSize={{ base: "md", md: "md" }}
            // Enhanced touch targets for mobile
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
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

      {/* Exercise Swapper Modal */}
      {exerciseToSwap && (
        <ExerciseSwapper
          isOpen={showExerciseSwapper}
          onClose={handleCloseSwapper}
          currentExercise={exerciseToSwap.exercise}
          onSwapExercise={handleExerciseSwapped}
          workoutType={selectedWorkoutType}
        />
      )}

      {/* Workout Modifier Modal */}
      {currentWorkout && (
        <WorkoutModifier
          isOpen={showWorkoutModifier}
          onClose={handleCloseModifier}
          currentWorkout={currentWorkout}
          onModifyWorkout={handleWorkoutModified}
        />
      )}

      <Box
        minH="100%"
        maxH="100vh"
        overflow={{ base: "auto", md: "auto" }}
        overflowX="hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
        className={`neurafit-scroll-container ${isWorkoutActive ? 'neurafit-workout-active' : ''} neurafit-no-zoom`}
      >
      <VStack spacing={{ base: 3, md: 4, lg: 6 }} p={{ base: 2, md: 3, lg: 4 }} align="stretch" w="100%" className="neurafit-workout-container">
      {/* Workout Header */}
      <Card bg={bgColor} borderColor={borderColor} shadow={{ base: "lg", md: "md" }} mx={{ base: 1, md: 0 }}>
        <CardBody p={{ base: 3, md: 4, lg: 6 }}>
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            <HStack justify="space-between" align="start" flexWrap={{ base: "wrap", md: "nowrap" }}>
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize={{ base: "lg", md: "xl", lg: "2xl" }} fontWeight="bold" color={textColor} lineHeight="1.2">
                  {currentWorkout.name}
                </Text>
                <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
                  <Badge colorScheme="blue" fontSize={{ base: "xs", md: "sm" }} px={2} py={1}>
                    {currentWorkout.difficulty}
                  </Badge>
                  <Text fontSize={{ base: "sm", md: "md" }} color={subtextColor} fontWeight="medium">
                    {currentWorkout.duration} min
                  </Text>
                </HStack>
              </VStack>

              <VStack align="end" spacing={2}>
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

                {!isWorkoutActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    leftIcon={<Icon as={PiGearBold} />}
                    onClick={handleModifyWorkout}
                  >
                    Modify
                  </Button>
                )}
              </VStack>
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

      {/* Rest Timer - Enhanced for mobile */}
      <AnimatePresence>
        {isResting && (
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            mx={{ base: 1, md: 0 }}
          >
            <Card bg="orange.50" borderColor="orange.200" borderWidth="2px" shadow="lg">
              <CardBody textAlign="center" py={{ base: 6, md: 4 }}>
                <Text fontSize={{ base: "xl", md: "lg" }} fontWeight="bold" color="orange.600" mb={{ base: 3, md: 2 }}>
                  Rest Time
                </Text>
                <Text fontSize={{ base: "4xl", md: "2xl" }} fontWeight="bold" color="orange.700" className="neurafit-timer-display">
                  {formatTime(restTimer)}
                </Text>
                <Text fontSize={{ base: "md", md: "sm" }} color="orange.500" mt={{ base: 2, md: 1 }} fontWeight="medium">
                  Get ready for the next exercise
                </Text>
                {/* Next exercise preview */}
                {currentExerciseIndex < currentWorkout.exercises.length && (
                  <Text fontSize={{ base: "sm", md: "xs" }} color="orange.400" mt={2}>
                    Next: {currentWorkout.exercises[currentExerciseIndex]?.name}
                  </Text>
                )}

                {/* Skip Rest Button */}
                <Button
                  colorScheme="orange"
                  variant="outline"
                  size={{ base: "md", md: "sm" }}
                  mt={{ base: 4, md: 3 }}
                  leftIcon={<Icon as={PiSkipForwardBold} />}
                  onClick={() => {
                    setIsResting(false);
                    setRestTimer(0);
                    triggerHaptic('light');
                  }}
                  minH={{ base: "48px", md: "auto" }}
                  fontSize={{ base: "md", md: "sm" }}
                  borderRadius="xl"
                  _hover={{
                    bg: 'orange.100',
                    transform: 'translateY(-1px)',
                    shadow: 'md'
                  }}
                  _active={{
                    transform: 'translateY(0px)',
                    shadow: 'sm'
                  }}
                  transition="all 0.2s ease-in-out"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  Skip Rest
                </Button>
              </CardBody>
            </Card>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Current Exercise - Enhanced for mobile */}
      {!isResting && isWorkoutActive && (
        <Card bg={bgColor} borderColor={borderColor} borderWidth="3px" shadow="xl" mx={{ base: 1, md: 0 }}>
          <CardBody p={{ base: 4, md: 6 }} className="neurafit-exercise-display">
            <VStack spacing={{ base: 4, md: 5 }} align="stretch">
              <HStack justify="space-between" align="start" flexWrap={{ base: "wrap", md: "nowrap" }}>
                <Text fontSize={{ base: "xl", md: "lg" }} fontWeight="bold" color={textColor} lineHeight="1.2" flex={1}>
                  {currentWorkout.exercises[currentExerciseIndex]?.name}
                </Text>
                <Badge colorScheme="blue" fontSize={{ base: "sm", md: "xs" }} px={3} py={1} borderRadius="full">
                  {currentExerciseIndex + 1} / {currentWorkout.exercises.length}
                </Badge>
              </HStack>

              <Divider />

              {/* Exercise Stats - Enhanced for mobile */}
              <VStack spacing={{ base: 4, md: 3 }} align="stretch">
                <HStack spacing={{ base: 4, md: 6 }} justify="center" flexWrap="wrap">
                  {currentWorkout.exercises[currentExerciseIndex]?.sets > 0 && (
                    <VStack spacing={1} minW={{ base: "80px", md: "auto" }}>
                      <Text fontSize={{ base: "3xl", md: "2xl" }} fontWeight="bold" color={activeColor}>
                        {currentWorkout.exercises[currentExerciseIndex]?.sets}
                      </Text>
                      <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor} fontWeight="bold">SETS</Text>
                    </VStack>
                  )}

                  {currentWorkout.exercises[currentExerciseIndex]?.reps > 0 && (
                    <VStack spacing={1} minW={{ base: "80px", md: "auto" }}>
                      <Text fontSize={{ base: "3xl", md: "2xl" }} fontWeight="bold" color={activeColor}>
                        {currentWorkout.exercises[currentExerciseIndex]?.reps}
                      </Text>
                      <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor} fontWeight="bold">REPS</Text>
                    </VStack>
                  )}

                  {currentWorkout.exercises[currentExerciseIndex]?.duration > 0 && (
                    <VStack spacing={1} minW={{ base: "80px", md: "auto" }}>
                      <Text fontSize={{ base: "3xl", md: "2xl" }} fontWeight="bold" color={activeColor}>
                        {currentWorkout.exercises[currentExerciseIndex]?.duration}s
                      </Text>
                      <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor} fontWeight="bold">DURATION</Text>
                    </VStack>
                  )}
                </HStack>

                {/* Instructions - Enhanced for mobile */}
                <Box bg={useColorModeValue('gray.50', 'gray.700')} p={{ base: 4, md: 3 }} borderRadius="xl">
                  <Text fontSize={{ base: "md", md: "sm" }} color={textColor} lineHeight="1.5" fontWeight="medium">
                    {currentWorkout.exercises[currentExerciseIndex]?.instructions}
                  </Text>
                </Box>

                {/* Tips - Enhanced for mobile */}
                {currentWorkout.exercises[currentExerciseIndex]?.tips && (
                  <Box bg={tipsBgColor} p={{ base: 4, md: 3 }} borderRadius="xl" borderWidth="1px" borderColor={useColorModeValue('blue.200', 'blue.600')}>
                    <HStack align="start" spacing={2}>
                      <Icon as={PiLightningBold} color={useColorModeValue('blue.500', 'blue.400')} mt={1} />
                      <Text fontSize={{ base: "sm", md: "sm" }} color={tipsTextColor} fontWeight="medium" lineHeight="1.4">
                        {currentWorkout.exercises[currentExerciseIndex]?.tips}
                      </Text>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Exercise List - Enhanced for mobile */}
      {!isWorkoutActive && (
        <VStack spacing={{ base: 3, md: 4 }} align="stretch" flex={1} overflowY="auto" className="neurafit-exercise-list" px={{ base: 1, md: 0 }}>
          {currentWorkout.exercises.map((exercise, index) => (
            <Card
              key={index}
              bg={bgColor}
              borderColor={borderColor}
              opacity={completedExercises.has(index) ? 0.7 : 1}
              shadow={{ base: "md", md: "sm" }}
              borderWidth="1px"
              _hover={{
                shadow: "lg",
                transform: "translateY(-1px)"
              }}
              transition="all 0.2s ease-in-out"
            >
              <CardBody p={{ base: 4, md: 3 }}>
                <VStack spacing={{ base: 3, md: 2 }} align="stretch">
                  {/* Exercise Header */}
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack spacing={2} align="center">
                        <Text fontWeight="bold" color={textColor} fontSize={{ base: "md", md: "sm" }} lineHeight="1.2">
                          {exercise.name}
                        </Text>
                        {completedExercises.has(index) && (
                          <Icon as={PiCheckBold} color={completedColor} boxSize={{ base: 5, md: 4 }} />
                        )}
                      </HStack>

                      {/* Exercise Stats */}
                      <HStack spacing={{ base: 3, md: 4 }} fontSize={{ base: "sm", md: "xs" }} color={subtextColor} fontWeight="medium">
                        {exercise.sets > 0 && <Text>{exercise.sets} sets</Text>}
                        {exercise.reps > 0 && <Text>{exercise.reps} reps</Text>}
                        {exercise.duration > 0 && <Text>{exercise.duration}s</Text>}
                      </HStack>
                    </VStack>

                    {/* Swap Exercise Button - Enhanced for mobile */}
                    <Button
                      size={{ base: "sm", md: "xs" }}
                      variant="ghost"
                      colorScheme="blue"
                      leftIcon={<Icon as={PiSwapBold} />}
                      onClick={() => handleSwapExercise(index)}
                      isDisabled={isWorkoutActive}
                      minH={{ base: "40px", md: "auto" }}
                      fontSize={{ base: "sm", md: "xs" }}
                      // Enhanced touch targets for mobile
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                      }}
                    >
                      Swap
                    </Button>
                  </HStack>

                  {/* Exercise Instructions */}
                  <Text fontSize={{ base: "sm", md: "xs" }} color={subtextColor} noOfLines={{ base: 3, md: 2 }} lineHeight="1.4">
                    {exercise.instructions}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Action Buttons */}
      <VStack spacing={{ base: 3, md: 4 }} px={{ base: 2, md: 0 }}>
        {!isWorkoutActive ? (
          <Button
            colorScheme="blue"
            size="lg"
            w="100%"
            leftIcon={<Icon as={PiPlayBold} />}
            onClick={startWorkout}
            py={{ base: 5, md: 6 }}
            minH={{ base: "64px", md: "auto" }}
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            borderRadius="xl"
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
            // Enhanced touch targets for mobile
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            Start Workout
          </Button>
        ) : (
          <VStack spacing={{ base: 3, md: 4 }} w="100%">
            <Button
              colorScheme="green"
              size="lg"
              w="100%"
              leftIcon={<Icon as={PiCheckBold} />}
              onClick={completeExercise}
              isDisabled={isResting}
              py={{ base: 5, md: 6 }}
              minH={{ base: "64px", md: "auto" }}
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              borderRadius="xl"
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
              // Enhanced touch targets for mobile
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              {currentExerciseIndex === currentWorkout.exercises.length - 1 ? 'Finish Workout' : 'Complete Exercise'}
            </Button>

            <Button
              colorScheme="red"
              variant="outline"
              size={{ base: "lg", md: "md" }}
              w="100%"
              leftIcon={<Icon as={PiStopBold} />}
              onClick={handleStopWorkout}
              minH={{ base: "56px", md: "auto" }}
              fontSize={{ base: "md", md: "lg" }}
              borderRadius="xl"
              // Enhanced touch targets for mobile
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              Stop Workout
            </Button>
          </VStack>
        )}

        {!isWorkoutActive && (
          <Button
            variant="ghost"
            onClick={onBack}
            size={{ base: "lg", md: "md" }}
            minH={{ base: "48px", md: "auto" }}
            fontSize={{ base: "md", md: "md" }}
            // Enhanced touch targets for mobile
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
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
