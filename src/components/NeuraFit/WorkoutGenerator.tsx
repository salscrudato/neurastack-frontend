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
    Textarea,
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
import { useMobileOptimization } from '../../hooks/useMobileOptimization';
import { neuraStackClient } from '../../lib/neurastack-client';
import type { Exercise, PersonalizationMetadata, WorkoutPlan, WorkoutUserMetadata } from '../../lib/types';
import { useAuthStore } from '../../store/useAuthStore';
import { useFitnessStore } from '../../store/useFitnessStore';
// Removed complex data processing imports - backend handles this
import { isValidWorkoutType, validateFitnessProfile, validateWorkoutPlan } from '../../utils/typeValidation';
import ExerciseSwapper from './ExerciseSwapper';
import ModernLoadingAnimation from './ModernLoadingAnimation';
import ModernProgressIndicator from './ModernProgressIndicator';
import WorkoutCompletion from './WorkoutCompletion';
import type { WorkoutModifications } from './WorkoutModifier';
import WorkoutModifier from './WorkoutModifier';

// Import PersonalizationInsights component
import PersonalizationInsights from './PersonalizationInsights';
import PersonalizationStatusCard from './PersonalizationStatusCard';

// Import constants for code-to-label conversion
import equipmentOptions from '../../constants/equipmentOptions';
import { FITNESS_GOALS } from '../../constants/fitnessGoals';

const MotionBox = motion(Box);

interface WorkoutGeneratorProps {
  onWorkoutComplete: (workout: WorkoutPlan) => void;
  onBack: () => void;
}

const WorkoutGenerator = memo(function WorkoutGenerator({ onWorkoutComplete, onBack }: WorkoutGeneratorProps) {
  const { profile, workoutPlans } = useFitnessStore();
  const { user } = useAuthStore();
  const { isMobile, triggerHaptic, workoutConfig } = useMobileOptimization();
  const toast = useToast();

  // Performance monitoring for workout generation
  // const { startTracking, endTracking, getPerformanceStats } = useWorkoutPerformanceMonitoring();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [serviceStatus, setServiceStatus] = useState<'healthy' | 'degraded' | 'unavailable' | 'unknown'>('unknown');
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('mixed');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
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
  const [personalizationMetadata, setPersonalizationMetadata] = useState<PersonalizationMetadata | null>(null);

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
  const instructionsBgColor = useColorModeValue('gray.50', 'gray.700');
  const tipsBorderColor = useColorModeValue('blue.200', 'blue.600');
  const tipsIconColor = useColorModeValue('blue.500', 'blue.400');

  // Helper functions to convert codes to human-readable names
  const getGoalLabels = useCallback((goalCodes: string[]): string[] => {
    if (!goalCodes || goalCodes.length === 0) return [];
    return goalCodes.map(code => {
      const goal = FITNESS_GOALS.find(g => g.code === code);
      return goal ? goal.label : code;
    }).filter(Boolean);
  }, []);

  const getEquipmentLabels = useCallback((equipmentCodes: string[]): string[] => {
    if (!equipmentCodes || equipmentCodes.length === 0) return [];
    return equipmentCodes.map(code => {
      const equipment = equipmentOptions.find(e => e.code === code);
      return equipment ? equipment.label : code;
    }).filter(Boolean);
  }, []);

  // Define workout types with descriptions - ONLY VALID TYPES that pass validation
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
    },
    {
      value: 'yoga',
      label: 'Yoga',
      description: 'Mind-body practice with poses and breathing'
    },
    {
      value: 'full_body',
      label: 'Full Body',
      description: 'Complete body workout targeting all muscle groups'
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
    // ALWAYS GENERATE FRESH WORKOUT - Remove simultaneous generation check for fresh workouts
    // Only prevent multiple calls during retries to avoid infinite loops
    if (isGenerating && retryCount > 0) return;

    // Validate profile before generation
    const profileValidation = validateFitnessProfile(profile);
    if (!profileValidation.isValid) {
      toast({
        title: 'Profile Validation Error',
        description: profileValidation.errors.join(', '),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate workout type selection with detailed debugging
    if (!isValidWorkoutType(selectedWorkoutType)) {
      const validTypes = ['mixed', 'strength', 'cardio', 'hiit', 'flexibility', 'upper_body', 'lower_body', 'push', 'pull', 'core', 'yoga', 'pilates', 'functional', 'full_body', 'legs', 'push_day', 'pull_day', 'leg_day', 'upper', 'lower', 'chest', 'back', 'shoulders', 'arms', 'abs'];

      if (import.meta.env.DEV) {
        console.error('❌ Invalid workout type:', {
          selected: selectedWorkoutType,
          validTypes,
          isValid: isValidWorkoutType(selectedWorkoutType)
        });
      }

      toast({
        title: 'Invalid Workout Type',
        description: `"${selectedWorkoutType}" is not supported. Please select a different workout type.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Debug log for successful validation
    if (import.meta.env.DEV) {
      console.log('✅ Workout type validation passed:', selectedWorkoutType);
    }

    // Check API health before generation (except for retries)
    if (retryCount === 0) {
      try {
        setGenerationStatus('Checking service availability...');
        const healthCheck = await neuraStackClient.healthCheck();
        if (healthCheck.status !== 'healthy' && healthCheck.status !== 'ok') {
          toast({
            title: 'Service Unavailable',
            description: 'Workout generation service is temporarily unavailable. Please try again later.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          setIsGenerating(false);
          setGenerationStatus('');
          return;
        }
      } catch (healthError) {
        console.warn('Health check failed, proceeding with generation:', healthError);
        // Continue with generation even if health check fails
      }
    }

    // Always set loading state for fresh generation
    setIsGenerating(true);
    setGenerationStatus(retryCount > 0 ? `Retrying workout generation (attempt ${retryCount + 1}/3)...` : 'Generating your personalized workout...');
    const startTime = performance.now();
    const maxRetries = 2; // Allow up to 2 retries for 503 errors

    try {
      // Configure the API client with user info - FORCE NO CACHING
      neuraStackClient.configure({
        userId: user?.uid || ''
      });

      // Aggressively clear any potential caches to ensure 100% fresh generation
      if (typeof localStorage !== 'undefined') {
        // Clear all potential workout-related caches
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('workout') ||
            key.includes('neurafit') ||
            key.includes('exercise') ||
            key.includes('generation')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      // Clear any session storage caches
      if (typeof sessionStorage !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (
            key.includes('workout') ||
            key.includes('neurafit') ||
            key.includes('exercise') ||
            key.includes('generation')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
      }

      // Only show service status warning on first attempt, not retries
      if (retryCount === 0) {
        // Reset service status to unknown at start
        setServiceStatus('unknown');

        // Skip health check to avoid false degraded warnings
        // Let the actual workout generation call determine service status
      }

      // Simplified user data preparation - backend handles complex transformations
      const userAge = profile.age || 30; // Simple fallback
      const userWeight = profile.weight || 150; // Simple fallback

      // Debug logging for data being sent
      if (import.meta.env.DEV) {
        console.log('🔍 User Data:', {
          age: userAge,
          weight: userWeight,
          fitnessLevel: profile.fitnessLevel,
          gender: profile.gender,
          goals: profile.goals,
          equipment: profile.equipment
        });
      }

      // Build optimized workout history - limit to most recent and essential data
      // (Not currently used by the new API but kept for potential future use)

      // Enhanced workout specification with progressive overload
      // const workoutSpecification: WorkoutSpecification = {
      //   workoutType: selectedWorkoutType as any, // Type assertion for supported workout types
      //   duration: adjustedParams.duration, // Use progression-adjusted duration
      //   difficulty: adjustedParams.difficulty, // Use progression-adjusted difficulty
      //   focusAreas: goalValues, // Use API values directly
      //   equipment: equipmentAPINames // Use API-standard equipment names
      // };

      // Generate HIGHLY UNIQUE identifiers to guarantee fresh workout generation
      // const timestamp = new Date().toISOString();
      // const nanoTime = performance.now().toString().replace('.', '');
      // const randomId1 = Math.random().toString(36).substring(2, 15);
      // const randomId2 = Math.random().toString(36).substring(2, 15);
      // const userHash = user?.uid ? user.uid.substring(0, 8) : 'anon';
      // const browserFingerprint = navigator.userAgent.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');

      // Multi-layered unique identifiers to prevent ANY caching
      // const requestId = `workout-fresh-${Date.now()}-${nanoTime}-${randomId1}-${randomId2}-${userHash}-${retryCount}`;
      // const sessionContext = `${selectedWorkoutType}-${profile.fitnessLevel}-${profile.availableTime}min-${timestamp}-${browserFingerprint}`;
      // const correlationId = `gen-${Date.now()}-${nanoTime}-${randomId1}-${Math.random().toString(36).substring(2, 10)}`;

      // Additional entropy for absolute uniqueness (removed unused variable)

      // Convert codes to human-readable names for backend processing
      const goalLabels = getGoalLabels(profile.goals || []);
      const equipmentLabels = getEquipmentLabels(profile.equipment || []);

      // Build comprehensive additional information - only include if there's actual content
      const additionalInfoParts = [
        goalLabels.length > 0 ? `Goals: ${goalLabels.join(', ')}` : '',
        `Available ${profile.timeAvailability?.daysPerWeek || 3} days per week`,
        additionalInstructions.trim() ? `Special instructions: ${additionalInstructions.trim()}` : ''
      ].filter(Boolean);

      const additionalInfo = additionalInfoParts.length > 0 ? additionalInfoParts.join('. ') : '';

      // Create flexible API request - new API supports natural language
      const selectedWorkoutTypeData = workoutTypes.find(t => t.value === selectedWorkoutType);
      const humanReadableWorkoutType = selectedWorkoutTypeData
        ? `${selectedWorkoutTypeData.label} - ${selectedWorkoutTypeData.description}`
        : selectedWorkoutType;

      const workoutAPIRequest: any = {
        age: userAge,
        fitnessLevel: profile.fitnessLevel,
        gender: profile.gender,
        weight: userWeight,
        goals: goalLabels, // Human-readable goal names
        equipment: equipmentLabels, // Human-readable equipment names
        injuries: profile.injuries || [], // Keep as-is for now
        timeAvailable: profile.availableTime,
        daysPerWeek: profile.timeAvailability?.daysPerWeek || 3,
        workoutType: humanReadableWorkoutType
      };

      // Only include additionalInformation if there's actual content
      if (additionalInfo.trim()) {
        workoutAPIRequest.additionalInformation = additionalInfo;
      }

      // Skip validation for new flexible API - backend handles all validation
      // The new flexible API accepts natural language inputs and handles validation server-side

      // Request logging for latest API
      console.group('🏋️ Workout Generation Request (Latest API)');
      console.log('');
      console.log('🎯 WORKOUT REQUEST:');
      console.log(`  📋 Workout Type: %c${workoutAPIRequest.workoutType}%c`, 'color: #00ff00; font-weight: bold;', 'color: inherit;');
      console.log(`  ⏱️ Duration: ${workoutAPIRequest.timeAvailable} minutes`);
      console.log(`  🎚️ Fitness Level: ${workoutAPIRequest.fitnessLevel}`);
      console.log(`  🎯 Goals: ${Array.isArray(workoutAPIRequest.goals) ? workoutAPIRequest.goals.join(', ') : workoutAPIRequest.goals || 'None specified'}`);
      console.log(`  🛠️ Equipment: ${Array.isArray(workoutAPIRequest.equipment) ? workoutAPIRequest.equipment.join(', ') : workoutAPIRequest.equipment || 'None specified'}`);
      console.log(`  🩹 Injuries: ${workoutAPIRequest.injuries.join(', ') || 'None'}`);
      console.log('');
      console.log('👤 USER PROFILE:');
      console.log(`  🎂 Age: ${workoutAPIRequest.age}`);
      console.log(`  ⚖️ Weight: ${workoutAPIRequest.weight} lbs`);
      console.log(`  👤 Gender: ${workoutAPIRequest.gender}`);
      console.log(`  📅 Days/Week: ${workoutAPIRequest.daysPerWeek}`);
      console.log('');
      console.log('📝 ADDITIONAL INFORMATION:');
      console.log(`  ${workoutAPIRequest.additionalInformation || 'None provided'}`);
      console.log('');
      console.log('📤 FULL REQUEST PAYLOAD:');
      console.log(JSON.stringify(workoutAPIRequest, null, 2));
      console.log('');
      console.log('⚙️ REQUEST OPTIONS:');
      console.log('  👤 User ID:', user?.uid || 'anonymous');
      console.log('  ⏱️ Timeout:', '60s');
      console.log('  🔄 Retry Attempt:', retryCount);
      console.groupEnd();

      // Call the optimized workout API
      const response = await neuraStackClient.generateWorkout(workoutAPIRequest, {
        userId: user?.uid || '',
        timeout: 60000 // 60s timeout for workout generation
      });

      // Response logging for optimized API
      console.group('🎯 Workout Generation Response (Optimized API)');
      console.log('📥 Full Response:', JSON.stringify(response, null, 2));
      console.log('✅ Response Status:', response.status);
      console.log('🔗 Correlation ID:', response.correlationId);
      console.log('⏱️ Generation Time:', performance.now() - startTime, 'ms');
      if (response.data?.workout) {
        const workout = response.data.workout;
        console.log('🏋️ Workout Details:', {
          type: workout.type,
          duration: workout.duration,
          difficulty: workout.difficulty,
          warmupExercises: workout.warmup?.length || 0,
          mainExercises: workout.exercises?.length || 0,
          cooldownExercises: workout.cooldown?.length || 0,
          hasProfessionalNotes: !!workout.progressionNotes,
          estimatedCalories: workout.calorieEstimate,
          coachingTips: workout.coachingTips?.length || 0
        });
      }
      if (response.data?.metadata) {
        console.log('📊 Response Metadata:', response.data.metadata);
      }
      console.groupEnd();

      // If we get here, the service is working - update status to healthy
      setServiceStatus('healthy');

      if (response.status === 'success' && response.data) {
        // Validate the flexible API response structure
        const workout = response.data.workout;
        if (!workout) {
          throw new Error('Invalid workout data received from API');
        }

        // Validate new flexible workout format
        if (!workout.exercises || !Array.isArray(workout.exercises)) {
          throw new Error('Invalid workout data - no exercises found');
        }

        if (workout.exercises.length === 0) {
          throw new Error('Invalid workout data - empty exercise list');
        }

        // Transform the flexible API response to our internal WorkoutPlan format
        const workoutPlan = transformFlexibleAPIWorkoutToPlan(workout, selectedWorkoutType);

        // Enhanced workout with backend personalization data
        const enhancedWorkout: WorkoutPlan = {
          ...workoutPlan,
          generationContext: {
            sessionId: response.correlationId || 'unknown',
            generationTime: performance.now() - startTime,
            version: '3.0.0', // Updated for backend-optimized API
            // New flexible API metadata
            correlationId: response.correlationId,
            approach: response.data.metadata.approach
          }
        };

        // Store enhanced personalization metadata separately for new UI components
        // New flexible API doesn't include personalization metadata in the same format
        setPersonalizationMetadata(null);

        // Validate the generated workout plan
        const workoutValidation = validateWorkoutPlan(enhancedWorkout);
        if (!workoutValidation.isValid) {
          console.warn('Generated workout failed validation:', workoutValidation.errors);
          toast({
            title: 'Workout Validation Warning',
            description: 'Generated workout has some issues but will proceed. Please review carefully.',
            status: 'warning',
            duration: 4000,
            isClosable: true,
          });
        }

        // Show validation warnings if any
        if (workoutValidation.warnings.length > 0) {
          console.info('Workout validation warnings:', workoutValidation.warnings);
        }

        setCurrentWorkout(enhancedWorkout);

        // Backend automatically handles memory management - no manual storage needed

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

        // Clear loading state after a brief delay to ensure workout renders
        setTimeout(() => {
          setIsGenerating(false);
          setGenerationStatus('');
        }, 100);
      } else {
        throw new Error(response.message || 'Failed to generate workout');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Enhanced error classification and handling
      const errorCode = (error as any)?.statusCode || 0;
      const isRateLimitError = errorCode === 429 || errorMessage.includes('429') || errorMessage.includes('rate limit');
      const isRetryableError = errorMessage.includes('503') ||
                              errorMessage.includes('500') ||
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('temporarily unavailable') ||
                              errorMessage.includes('Service Unavailable') ||
                              errorMessage.includes('Internal Server Error') ||
                              errorCode >= 500;

      // Handle rate limiting with exponential backoff
      if (isRateLimitError && retryCount < maxRetries) {
        const baseDelay = 2000; // 2 seconds base delay
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff

        console.log(`Rate limit detected, retrying in ${delay/1000} seconds (attempt ${retryCount + 1}/${maxRetries + 1})`);

        toast({
          title: 'Rate Limit Exceeded',
          description: `Too many requests. Retrying in ${delay/1000} seconds...`,
          status: 'warning',
          duration: delay,
          isClosable: true,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return generateWorkout(retryCount + 1);
      }

      // If this is a retryable error and we have retries left, don't show error to user yet
      if (isRetryableError && retryCount < maxRetries) {
        console.log(`Retrying workout generation (attempt ${retryCount + 1}/${maxRetries + 1}) after error:`, errorMessage);

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay));

        // Don't reset isGenerating state - keep loading state active during retry
        return generateWorkout(retryCount + 1);
      }

      // Only log and show error if we've exhausted retries or it's not retryable
      console.error('Error generating workout (final attempt):', error);

      let toastDescription = 'Unable to generate workout. Please try again.';
      let toastTitle = 'Generation Failed';

      // Handle specific API errors with more detailed messaging
      if (errorCode === 400 || errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        toastDescription = 'Invalid request data. Please check your profile information and try again.';
        toastTitle = 'Invalid Request';
      } else if (isRateLimitError) {
        toastDescription = 'Too many requests. Please wait a moment before trying again.';
        toastTitle = 'Rate Limit Exceeded';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Request timed out')) {
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

      // Backend provides reliable fallbacks - no frontend fallback needed

      toast({
        title: toastTitle,
        description: toastDescription,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      // Clear loading state on error
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

  // Simplified helper functions - backend handles complex data processing



  // Use simplified validation from utils - backend handles comprehensive validation

  // Note: API conversion functions moved to utils/workoutApiValidation.ts

  // Workout type correction removed - backend handles this

  // Complex workout request building removed - backend handles intelligent prompt generation



  // Legacy transformation function - removed to fix syntax error

  // Transform new flexible API workout response to internal WorkoutPlan format
  const transformFlexibleAPIWorkoutToPlan = useCallback((apiWorkout: any, requestedType: string): WorkoutPlan => {
    // Generate unique workout ID
    const uniqueId = `workout-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Transform main exercises from new API format
    const exercises: Exercise[] = [];

    if (apiWorkout.exercises && Array.isArray(apiWorkout.exercises)) {
      apiWorkout.exercises.forEach((exercise: any) => {
        const restTime = exercise.rest ? parseInt(exercise.rest.replace(/\D/g, '')) : 60;
        exercises.push({
          name: exercise.name,
          sets: exercise.sets || 3,
          reps: exercise.reps || '8-12',
          duration: 0,
          restTime: restTime,
          instructions: exercise.instructions || '',
          tips: exercise.modifications || '',
          targetMuscles: exercise.targetMuscles || [],
          equipment: ['bodyweight'], // Default equipment
          category: 'compound',
          modifications: exercise.modifications ? [exercise.modifications] : []
        });
      });
    }

    // Build coaching notes from new API format
    const coachingNotes = [];
    if (apiWorkout.coachingTips && Array.isArray(apiWorkout.coachingTips)) {
      coachingNotes.push(...apiWorkout.coachingTips);
    }
    if (apiWorkout.progressionNotes) {
      coachingNotes.push(apiWorkout.progressionNotes);
    }
    if (apiWorkout.safetyNotes) {
      coachingNotes.push(apiWorkout.safetyNotes);
    }

    const finalCoachingNotes = coachingNotes.length > 0
      ? coachingNotes.join(' ')
      : 'Focus on proper form and listen to your body';

    return {
      id: uniqueId,
      name: `${apiWorkout.type?.charAt(0).toUpperCase()}${apiWorkout.type?.slice(1).replace('_', ' ')} Workout` ||
            `AI Generated ${workoutTypes.find(t => t.value === requestedType)?.label || 'Mixed'} Workout`,
      duration: apiWorkout.duration || profile.availableTime,
      difficulty: apiWorkout.difficulty || profile.fitnessLevel,
      exercises,
      createdAt: new Date(),
      completedAt: null,
      focusAreas: ['general'],
      workoutType: (requestedType || apiWorkout.type || 'mixed') as 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed' | 'upper_body' | 'lower_body' | 'push' | 'pull' | 'core',
      coachingNotes: finalCoachingNotes,
      warmUp: {
        duration: 5, // Default warmup duration
        exercises: apiWorkout.warmup?.map((w: any) => w.name || 'Dynamic warm-up') || []
      },
      coolDown: {
        duration: 5, // Default cooldown duration
        exercises: apiWorkout.cooldown?.map((c: any) => c.name || 'Cool-down stretch') || []
      },
      estimatedCalories: apiWorkout.calorieEstimate
    };
  }, [profile, workoutTypes]);

  // Legacy transformation function - removed to fix syntax error

  // Fallback workout generation removed - backend provides reliable fallbacks











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

    // const actualDurationMinutes = Math.floor((Date.now() - workoutStartTime.getTime()) / (1000 * 60));

    // const completedWorkout = {
    //   ...currentWorkout,
    //   completedAt: new Date(),
    //   actualDuration: actualDurationMinutes,
    //   completionRate: (completedExercises.size / currentWorkout.exercises.length) * 100
    // };

    // Backend automatically handles memory management - no manual storage needed
    // The completion will be sent via the new completeWorkout API endpoint

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
  }, [currentWorkout, workoutStartTime, completedExercises, user?.uid, toast]);

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

      // Simplified modification data - backend handles complex processing
      const userAge = profile.age || 30; // Simple fallback
      const userWeight = profile.weight || 150; // Simple fallback

      // Simplified user metadata for modifications
      const userMetadata: WorkoutUserMetadata = {
        age: userAge,
        fitnessLevel: modifications.difficulty || profile.fitnessLevel,
        gender: (profile.gender === 'rather_not_say' ? 'male' : profile.gender) as 'male' | 'female',
        weight: userWeight,
        goals: profile.goals || [], // Send raw goals - backend handles conversion
        equipment: profile.equipment || [], // Send raw equipment - backend handles conversion
        timeAvailable: modifications.duration || profile.availableTime,
        injuries: profile.injuries || [],
        daysPerWeek: profile.timeAvailability?.daysPerWeek || 3,
        minutesPerSession: modifications.duration || profile.availableTime,
      };

      // Generate HIGHLY UNIQUE identifiers for fresh modification request
      const timestamp = new Date().toISOString();
      const nanoTime = performance.now().toString().replace('.', '');
      const randomId1 = Math.random().toString(36).substring(2, 15);
      const randomId2 = Math.random().toString(36).substring(2, 15);
      const userHash = user?.uid ? user.uid.substring(0, 8) : 'anon';
      const browserFingerprint = navigator.userAgent.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');

      // Multi-layered unique identifiers for fresh modification
      const requestId = `modify-fresh-${Date.now()}-${nanoTime}-${randomId1}-${randomId2}-${userHash}`;
      const sessionContext = `modify-${modifications.workoutType || selectedWorkoutType}-${modifications.difficulty || profile.fitnessLevel}-${timestamp}-${browserFingerprint}`;
      // const correlationId = `mod-${Date.now()}-${nanoTime}-${randomId1}-${Math.random().toString(36).substring(2, 10)}`;

      // Additional entropy for modification uniqueness (removed unused variable)

      // Convert codes to human-readable names for modification request
      const goalLabels = getGoalLabels(profile.goals || []);
      const equipmentLabels = getEquipmentLabels(profile.equipment || []);

      // Build modification-specific additional information - only include if there's actual content
      const modificationInfoParts = [
        'Workout modification requested',
        modifications.focusAreas?.length ? `Focus areas: ${modifications.focusAreas.join(', ')}` : '',
        goalLabels.length > 0 ? `User goals: ${goalLabels.join(', ')}` : ''
      ].filter(Boolean);

      const modificationInfo = modificationInfoParts.length > 0 ? modificationInfoParts.join('. ') : '';

      // Create flexible modification API request - new API supports natural language
      const modificationWorkoutType = modifications.workoutType || selectedWorkoutType;
      const modificationWorkoutTypeData = workoutTypes.find(t => t.value === modificationWorkoutType);
      const humanReadableModificationWorkoutType = modificationWorkoutTypeData
        ? `${modificationWorkoutTypeData.label} - ${modificationWorkoutTypeData.description}`
        : modificationWorkoutType;

      const workoutAPIRequest: any = {
        age: userAge,
        fitnessLevel: modifications.difficulty || profile.fitnessLevel,
        gender: profile.gender,
        weight: userWeight,
        goals: goalLabels, // Human-readable goal names
        equipment: equipmentLabels, // Human-readable equipment names
        injuries: profile.injuries || [], // Keep as-is for now
        timeAvailable: modifications.duration || profile.availableTime,
        daysPerWeek: profile.timeAvailability?.daysPerWeek || 3,
        workoutType: humanReadableModificationWorkoutType
      };

      // Only include additionalInformation if there's actual content
      if (modificationInfo.trim()) {
        workoutAPIRequest.additionalInformation = modificationInfo;
      }

      // Modification request logging for new API format
      console.group('🔧 Workout Modification Request (New API Format)');
      console.log('📤 Modification Request Payload:', JSON.stringify(workoutAPIRequest, null, 2));
      console.log('🔑 Modification Identifiers:', {
        requestId,
        timestamp,
        sessionContext,
        userHash: user?.uid?.substring(0, 8) || 'anon',
        modifications
      });
      console.groupEnd();

      const response = await neuraStackClient.generateWorkout(workoutAPIRequest, {
        userId: user?.uid || '',
        timeout: 60000, // 60s timeout as per new API documentation
        // useEnsemble: false // Use single best model for consistency
      });

      // Comprehensive modification response logging
      console.group('🎯 Workout Modification Response');
      console.log('📥 Modification Response:', JSON.stringify(response, null, 2));
      console.log('✅ Response Status:', response.status);
      console.log('🔗 Correlation ID:', response.correlationId);
      if (response.data?.workout) {
        // Handle both new and legacy API formats for logging
        const workout = response.data.workout;
        const exerciseCount = workout.exercises?.length || 0;

        console.log('🏋️ Modified Workout Details:', {
          type: workout.type,
          duration: workout.duration,
          exerciseCount,
          difficulty: workout.difficulty,
          hasExercises: !!workout.exercises,
          hasWarmup: !!workout.warmup,
          hasCooldown: !!workout.cooldown
        });
      }
      console.groupEnd();

      if (response.status === 'success' && response.data) {
        const workout = response.data.workout;

        // Use new flexible API transformation
        const workoutPlan = transformFlexibleAPIWorkoutToPlan(workout, modifications.workoutType || selectedWorkoutType);

        const enhancedWorkout: WorkoutPlan = {
          ...workoutPlan,
          focusAreas: modifications.focusAreas,
          workoutType: modifications.workoutType as any,
          generationContext: {
            userContext: { userMetadata, workoutHistory: [], workoutRequest: workoutAPIRequest },
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

        // Clear loading state after a brief delay to ensure workout renders
        setTimeout(() => {
          setIsGenerating(false);
          setGenerationStatus('');
        }, 100);
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

      // Clear loading state on error
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

  // Show completion form after workout completion
  if (showFeedback && currentWorkout && workoutStartTime) {
    const actualDurationMinutes = Math.floor((Date.now() - workoutStartTime.getTime()) / (1000 * 60));

    return (
      <WorkoutCompletion
        workout={currentWorkout}
        completedExercises={completedExercises}
        actualDuration={actualDurationMinutes}
        onComplete={handleFeedbackComplete}
        onSkip={handleSkipFeedback}
      />
    );
  }

  // Show loading animation during generation
  if (isGenerating) {
    return (
      <ModernLoadingAnimation
        isVisible={true}
        messages={[
          'Analyzing your fitness profile...',
          `Selecting optimal ${workoutTypes.find(t => t.value === selectedWorkoutType)?.label.toLowerCase()} exercises...`,
          'Customizing workout intensity...',
          'Personalizing rest periods...',
          `Finalizing your ${workoutTypes.find(t => t.value === selectedWorkoutType)?.label.toLowerCase()} routine...`
        ]}
        title={`Creating Your AI ${workoutTypes.find(t => t.value === selectedWorkoutType)?.label} Workout`}
      />
    );
  }

  // Show workout generation form when no workout exists
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
                    Focus on: {(profile.goals || []).join(', ') || 'General fitness'}
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
                  columns={{ base: 1, sm: 2, md: 3 }}
                  spacing={{ base: 4, md: 5 }}
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
                      h={{ base: "90px", md: "85px", lg: "90px" }}
                      minH={{ base: "90px", md: "85px" }}
                      flexDirection="column"
                      gap={{ base: 2, md: 1 }}
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
                        fontSize={{ base: "md", md: "md" }}
                        fontWeight="semibold"
                        textAlign="center"
                        lineHeight="1.2"
                        color={selectedWorkoutType === type.value ? "white" : textColor}
                      >
                        {type.label}
                      </Text>
                      <Text
                        fontSize={{ base: "sm", md: "xs" }}
                        color={selectedWorkoutType === type.value ? "blue.100" : subtextColor}
                        noOfLines={2}
                        textAlign="center"
                        lineHeight="1.2"
                        px={1}
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

        {/* Additional Instructions Card */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody p={{ base: 5, md: 6 }}>
            <VStack spacing={{ base: 4, md: 5 }} align="stretch">
              <Box textAlign="center">
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor} mb={2}>
                  Additional Instructions (Optional)
                </Text>
                <Text fontSize="sm" color={subtextColor}>
                  Add any specific preferences, modifications, or special requests for your workout
                </Text>
              </Box>

              <Textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g., Focus on form over speed, avoid jumping exercises, include more core work, prefer unilateral exercises..."
                size="lg"
                minH={{ base: "120px", md: "100px" }}
                resize="vertical"
                borderRadius="xl"
                borderColor={borderColor}
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
                }}
                _hover={{
                  borderColor: "blue.300"
                }}
                fontSize={{ base: "md", md: "sm" }}
                lineHeight="1.5"
                bg={bgColor}
                color={textColor}
                maxLength={500}
              />

              {additionalInstructions.length > 0 && (
                <Text fontSize="xs" color={subtextColor} textAlign="right">
                  {additionalInstructions.length}/500 characters
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <VStack spacing={{ base: 3, md: 4 }} px={{ base: 2, md: 0 }}>
          <Button
            colorScheme="blue"
            size="lg"
            w="100%"
            leftIcon={<Icon as={PiLightningBold} />}
            onClick={() => {
              // Force fresh generation - clear any potential state
              if (import.meta.env.DEV) {
                console.log('🔄 FRESH WORKOUT GENERATION TRIGGERED - No caching, guaranteed new workout');
              }
              generateWorkout();
            }}
            py={{ base: 5, md: 6 }}
            isLoading={isGenerating}
            loadingText={generationStatus || "Generating Fresh Workout..."}
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
            Generate Fresh AI Workout
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
      <VStack spacing={{ base: 3, md: 4, lg: 6 }} p={{ base: 3, md: 4, lg: 6 }} align="stretch" w="100%" maxW="4xl" mx="auto" className="neurafit-workout-container">
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

      {/* Personalization Status Card */}
      <PersonalizationStatusCard
        personalizationMetadata={personalizationMetadata || undefined}
        isCompact={false}
      />

      {/* Personalization Insights */}
      <PersonalizationInsights
        workout={currentWorkout}
        personalizationMetadata={personalizationMetadata || undefined}
      />

      {/* Rest Timer - Enhanced for mobile */}
      <AnimatePresence>
        {isResting && (
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            mx={{ base: 1, md: 0 }}
          >
            <Card bg="blue.50" borderColor="blue.200" borderWidth="2px" shadow="lg">
              <CardBody textAlign="center" py={{ base: 6, md: 4 }}>
                <Text fontSize={{ base: "xl", md: "lg" }} fontWeight="bold" color="blue.600" mb={{ base: 3, md: 2 }}>
                  Rest Time
                </Text>
                <Text fontSize={{ base: "4xl", md: "2xl" }} fontWeight="bold" color="blue.700" className="neurafit-timer-display">
                  {formatTime(restTimer)}
                </Text>
                <Text fontSize={{ base: "md", md: "sm" }} color="blue.500" mt={{ base: 2, md: 1 }} fontWeight="medium">
                  Get ready for the next exercise
                </Text>
                {/* Next exercise preview */}
                {currentExerciseIndex < currentWorkout.exercises.length && (
                  <Text fontSize={{ base: "sm", md: "xs" }} color="blue.400" mt={2}>
                    Next: {currentWorkout.exercises[currentExerciseIndex]?.name}
                  </Text>
                )}

                {/* Skip Rest Button */}
                <Button
                  colorScheme="blue"
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
                    bg: 'blue.100',
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
                <Box bg={instructionsBgColor} p={{ base: 4, md: 3 }} borderRadius="xl">
                  <Text fontSize={{ base: "md", md: "sm" }} color={textColor} lineHeight="1.5" fontWeight="medium">
                    {currentWorkout.exercises[currentExerciseIndex]?.instructions}
                  </Text>
                </Box>

                {/* Tips - Enhanced for mobile */}
                {currentWorkout.exercises[currentExerciseIndex]?.tips && (
                  <Box bg={tipsBgColor} p={{ base: 4, md: 3 }} borderRadius="xl" borderWidth="1px" borderColor={tipsBorderColor}>
                    <HStack align="start" spacing={2}>
                      <Icon as={PiLightningBold} color={tipsIconColor} mt={1} />
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
              bg="red.50"
              color="red.600"
              borderColor="red.200"
              borderWidth="1px"
              variant="outline"
              size={{ base: "lg", md: "md" }}
              w="100%"
              leftIcon={<Icon as={PiStopBold} />}
              onClick={handleStopWorkout}
              minH={{ base: "56px", md: "auto" }}
              fontSize={{ base: "md", md: "lg" }}
              borderRadius="xl"
              _hover={{
                bg: 'red.100',
                borderColor: 'red.300',
                color: 'red.700',
                transform: 'translateY(-1px)',
                shadow: 'md'
              }}
              _active={{
                transform: 'translateY(0px)',
                shadow: 'sm'
              }}
              transition="all 0.2s ease-in-out"
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
