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
import type { Exercise, FitnessProfile, WorkoutHistoryEntry, WorkoutPlan, WorkoutSpecification, WorkoutUserMetadata } from '../../lib/types';
import { useAuthStore } from '../../store/useAuthStore';
import { useFitnessStore } from '../../store/useFitnessStore';
import { getRepresentativeAge, getRepresentativeWeight } from '../../utils/personalInfoUtils';
import { applyProgressiveOverload, calculateProgressionMetrics, generateProgressionNotes } from '../../utils/progressiveOverload';
import { isValidWorkoutType, validateFitnessProfile, validateWorkoutPlan } from '../../utils/typeValidation';
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

  // Performance monitoring for workout generation
  // const { startTracking, endTracking, getPerformanceStats } = useWorkoutPerformanceMonitoring();

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
  const instructionsBgColor = useColorModeValue('gray.50', 'gray.700');
  const tipsBorderColor = useColorModeValue('blue.200', 'blue.600');
  const tipsIconColor = useColorModeValue('blue.500', 'blue.400');

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
      value: 'pilates',
      label: 'Pilates',
      description: 'Core-focused low-impact exercises'
    },
    {
      value: 'functional',
      label: 'Functional Training',
      description: 'Real-world movement patterns'
    },
    {
      value: 'full_body',
      label: 'Full Body',
      description: 'Complete body workout targeting all muscle groups'
    },
    {
      value: 'legs',
      label: 'Leg Focus',
      description: 'Comprehensive lower body and leg training'
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

  // Enhanced workout request builder with safety and progression considerations
  const buildEnhancedAdditionalNotes = useCallback((
    profile: FitnessProfile,
    _recentWorkouts: WorkoutHistoryEntry[],
    workoutType: string,
    allWorkouts: WorkoutPlan[]
  ): string => {
    const notes: string[] = [];

    // Safety considerations for injuries
    if (profile.injuries && profile.injuries.length > 0) {
      notes.push(`🚨 SAFETY PRIORITY: User has reported injuries: ${profile.injuries.join(', ')}. Please provide exercise modifications and avoid contraindicated movements. Include proper warm-up and cool-down sequences.`);
    } else {
      notes.push('Include proper warm-up and form cues for injury prevention.');
    }

    // Progressive overload based on workout history
    const completedWorkouts = allWorkouts.filter(w => w.completedAt);
    if (completedWorkouts.length > 0) {
      const avgCompletionRate = completedWorkouts.reduce((acc, w) => acc + (w.completionRate || 0), 0) / completedWorkouts.length;

      if (avgCompletionRate > 0.9) {
        notes.push('📈 PROGRESSION: User consistently completes workouts. Gradually increase difficulty, add complexity, or extend duration.');
      } else if (avgCompletionRate < 0.7) {
        notes.push('📉 ADAPTATION: User struggles with completion. Focus on achievable goals, reduce intensity, and emphasize proper form.');
      } else {
        notes.push('📊 MAINTENANCE: User shows good progress. Maintain current difficulty with slight variations.');
      }
    } else {
      notes.push('🌟 BEGINNER-FRIENDLY: This appears to be an early workout. Focus on form over intensity, include detailed instructions.');
    }

    // Equipment-specific safety notes
    const equipmentNames = convertEquipmentCodesToNames(profile.equipment || []);
    if (equipmentNames.includes('Barbell') || equipmentNames.includes('Dumbbells')) {
      notes.push('⚖️ WEIGHT SAFETY: Include proper lifting form cues, recommend starting with lighter weights, and emphasize controlled movements.');
    }

    // Age-specific considerations
    const userAge = getRepresentativeAge(profile);
    if (userAge >= 50) {
      notes.push('👥 AGE CONSIDERATION: Focus on joint-friendly exercises, longer warm-ups, and mobility work. Avoid high-impact movements unless specifically requested.');
    }

    // Workout type specific guidance
    const typeSpecificNotes: Record<string, string> = {
      'yoga': 'Focus on breath awareness, proper alignment, and modifications for different skill levels.',
      'pilates': 'Emphasize core engagement, precise movements, and mind-body connection.',
      'hiit': 'Include work-to-rest ratios, intensity scaling options, and recovery periods.',
      'functional': 'Focus on movement patterns used in daily life, multi-planar movements.',
      'flexibility': 'Include both static and dynamic stretches, hold times, and breathing cues.'
    };

    if (typeSpecificNotes[workoutType]) {
      notes.push(`🎯 ${workoutType.toUpperCase()} FOCUS: ${typeSpecificNotes[workoutType]}`);
    }

    return notes.join(' ');
  }, []);

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

      // Build user metadata for the workout API with optimized conversions
      const goalValues = convertGoalsToAPIValues(profile.goals || []);
      const equipmentAPINames = convertEquipmentCodesToAPINames(profile.equipment || []);

      // Get representative age and weight from numeric values (prioritized) or categories (fallback)
      const userAge = getRepresentativeAge(profile);
      const userWeight = getRepresentativeWeight(profile);

      // Debug logging for age/weight handling
      if (import.meta.env.DEV) {
        console.log('🔍 Age/Weight Processing:', {
          profileAge: profile.age,
          profileAgeCategory: profile.ageCategory,
          resolvedAge: userAge,
          profileWeight: profile.weight,
          profileWeightCategory: profile.weightCategory,
          resolvedWeight: userWeight
        });
      }

      // Optimized user metadata - consistent and concise
      const userMetadata: WorkoutUserMetadata = {
        age: userAge, // Age is required by the API
        fitnessLevel: profile.fitnessLevel,
        gender: profile.gender || 'Rather Not Say',
        weight: userWeight,
        goals: goalValues, // Use API values for backend
        equipment: equipmentAPINames, // Use API-standard names
        timeAvailable: profile.availableTime,
        injuries: profile.injuries || [],
        daysPerWeek: profile.timeAvailability?.daysPerWeek || 3,
        minutesPerSession: profile.availableTime, // Use consistent time value
      };

      // Build optimized workout history - limit to most recent and essential data
      const recentWorkouts = workoutPlans
        .filter(w => w.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 2); // Only last 2 workouts for efficiency

      const workoutHistory: WorkoutHistoryEntry[] = recentWorkouts.map(w => ({
        date: new Date(w.completedAt!).toISOString().split('T')[0],
        type: (w.workoutType as 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed') || 'mixed',
        duration: w.duration,
        exercises: w.exercises.slice(0, 4).map(e => e.name), // Limit to 4 exercises
        difficulty: w.difficulty,
        rating: 4 // Default rating since we don't track this yet
      }));

      // Calculate progressive overload metrics
      const progressionMetrics = calculateProgressionMetrics(workoutPlans, profile);

      // Apply progressive overload to workout parameters
      const baseWorkoutParams = {
        duration: profile.availableTime,
        difficulty: profile.fitnessLevel
      };

      const adjustedParams = applyProgressiveOverload(baseWorkoutParams, progressionMetrics);

      // Enhanced workout specification with progressive overload
      const workoutSpecification: WorkoutSpecification = {
        workoutType: selectedWorkoutType as any, // Type assertion for supported workout types
        duration: adjustedParams.duration, // Use progression-adjusted duration
        difficulty: adjustedParams.difficulty, // Use progression-adjusted difficulty
        focusAreas: goalValues, // Use API values directly
        equipment: equipmentAPINames // Use API-standard equipment names
      };

      // Create enhanced additional notes with safety and progression considerations
      const additionalNotes = buildEnhancedAdditionalNotes(profile, workoutHistory, selectedWorkoutType, workoutPlans);
      const progressionNotes = generateProgressionNotes(progressionMetrics, selectedWorkoutType);
      const combinedNotes = `${additionalNotes} ${progressionNotes}`;

      // Generate HIGHLY UNIQUE identifiers to guarantee fresh workout generation
      const timestamp = new Date().toISOString();
      const nanoTime = performance.now().toString().replace('.', '');
      const randomId1 = Math.random().toString(36).substring(2, 15);
      const randomId2 = Math.random().toString(36).substring(2, 15);
      const userHash = user?.uid ? user.uid.substring(0, 8) : 'anon';
      const browserFingerprint = navigator.userAgent.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');

      // Multi-layered unique identifiers to prevent ANY caching
      const requestId = `workout-fresh-${Date.now()}-${nanoTime}-${randomId1}-${randomId2}-${userHash}-${retryCount}`;
      const sessionContext = `${selectedWorkoutType}-${profile.fitnessLevel}-${profile.availableTime}min-${timestamp}-${browserFingerprint}`;
      const correlationId = `gen-${Date.now()}-${nanoTime}-${randomId1}-${Math.random().toString(36).substring(2, 10)}`;

      // Additional entropy for absolute uniqueness (removed unused variable)

      // Client-side request validation
      const requestValidation = validateWorkoutRequest({
        userMetadata,
        workoutSpecification,
        selectedWorkoutType,
        profile
      });

      if (!requestValidation.isValid) {
        toast({
          title: 'Request Validation Error',
          description: requestValidation.errors.join(', '),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsGenerating(false);
        setGenerationStatus('');
        return;
      }

      // Create API request aligned with new documentation format
      const workoutAPIRequest = {
        // User metadata according to new API spec
        userMetadata: {
          age: userMetadata.age,
          fitnessLevel: userMetadata.fitnessLevel, // Any string as per new docs
          gender: userMetadata.gender,
          weight: userMetadata.weight,
          goals: goalValues, // Any goals as strings
          equipment: equipmentAPINames, // Any equipment as strings
          timeAvailable: userMetadata.timeAvailable,
          injuries: userMetadata.injuries || [],
          daysPerWeek: userMetadata.daysPerWeek || 3,
          minutesPerSession: userMetadata.timeAvailable
        },

        // Workout history (optional) - convert to proper format
        workoutHistory: [], // Empty for now - will implement proper conversion later

        // Natural language workout description (required)
        workoutRequest: buildIntelligentWorkoutRequest(
          profile,
          recentWorkouts,
          selectedWorkoutType,
          profile.goals ? convertGoalCodesToNames(profile.goals) : undefined
        ),

        // Enhanced format (recommended) - workoutSpecification
        workoutSpecification: {
          workoutType: selectedWorkoutType, // Any workout type as string
          duration: profile.availableTime, // Minutes
          difficulty: profile.fitnessLevel, // Any difficulty level as string
          focusAreas: goalValues, // Any focus areas as strings
          equipment: equipmentAPINames // Any equipment as strings
        },

        // Additional notes (optional)
        additionalNotes: combinedNotes.length > 500
          ? combinedNotes.substring(0, 497) + '...' // Respect API limits
          : combinedNotes,

        // Optional tracking fields
        requestId,
        timestamp,
        sessionContext,
        correlationId
      };

      // Request logging for new API format
      console.group('🏋️ Workout Generation Request (New API Format)');
      console.log('');
      console.log('🎯 WORKOUT SPECIFICATION:');
      console.log(`  📋 Workout Type: %c${workoutAPIRequest.workoutSpecification?.workoutType}%c`, 'color: #00ff00; font-weight: bold;', 'color: inherit;');
      console.log(`  ⏱️ Duration: ${workoutAPIRequest.workoutSpecification?.duration} minutes`);
      console.log(`  🎚️ Difficulty: ${workoutAPIRequest.workoutSpecification?.difficulty}`);
      console.log(`  🎯 Focus Areas: ${workoutAPIRequest.workoutSpecification?.focusAreas?.join(', ') || 'None specified'}`);
      console.log(`  🛠️ Equipment: ${workoutAPIRequest.workoutSpecification?.equipment?.join(', ') || 'None specified'}`);
      console.log('');
      console.log('📝 NATURAL LANGUAGE REQUEST:');
      console.log(`  ${workoutAPIRequest.workoutRequest.substring(0, 200)}...`);
      console.log('');
      console.log('📝 ADDITIONAL NOTES:');
      console.log(`  ${workoutAPIRequest.additionalNotes || 'None specified'}`);
      console.log('');
      console.log('🆔 TRACKING IDENTIFIERS:');
      console.log('  🆔 Request ID:', requestId);
      console.log('  ⏰ Timestamp:', timestamp);
      console.log('  🔗 Correlation ID:', correlationId);
      console.log('  📊 Session Context:', sessionContext);
      console.log('  👤 User Hash:', user?.uid?.substring(0, 8) || 'anon');
      console.log('  🔄 Retry Attempt:', retryCount);
      console.log('');
      console.log('📤 FULL REQUEST PAYLOAD:');
      console.log(JSON.stringify(workoutAPIRequest, null, 2));
      console.log('');
      console.log('⚙️ REQUEST OPTIONS:');
      console.log('  👤 User ID:', user?.uid || 'anonymous');
      console.log('  ⏱️ Timeout:', '60s (as per new API docs)');
      console.log('  🌐 Backend URL:', 'https://neurastack-backend-638289111765.us-central1.run.app');
      console.groupEnd();

      // Call the workout API with new format and proper timeout
      const response = await neuraStackClient.generateWorkout(workoutAPIRequest, {
        userId: user?.uid || '',
        timeout: 60000, // 60s timeout as per new API documentation
        useEnsemble: false // Use single best model for workout generation
      });

      // Comprehensive response logging
      console.group('🎯 Workout Generation Response');
      console.log('📥 Full Response:', JSON.stringify(response, null, 2));
      console.log('✅ Response Status:', response.status);
      console.log('🔗 Correlation ID:', response.correlationId);
      console.log('⏱️ Generation Time:', performance.now() - startTime, 'ms');
      if (response.data?.workout) {
        // Handle both new and legacy API formats for logging
        const workout = response.data.workout;
        const exerciseCount = workout.mainWorkout?.exercises?.length || workout.exercises?.length || 0;

        console.log('🏋️ Workout Details:', {
          type: workout.type,
          duration: workout.duration,
          exerciseCount,
          difficulty: workout.difficulty,
          equipment: workout.equipment,
          hasMainWorkout: !!workout.mainWorkout,
          hasExercises: !!workout.exercises,
          hasWarmup: !!workout.warmup,
          hasCooldown: !!workout.cooldown,
          professionalNotes: !!workout.professionalNotes
        });
      }
      if (response.data?.metadata) {
        console.log('📊 Response Metadata:', response.data.metadata);
      }
      console.groupEnd();

      // If we get here, the service is working - update status to healthy
      setServiceStatus('healthy');

      if (response.status === 'success' && response.data) {
        // Validate the API response structure for new format
        const workout = response.data.workout;
        if (!workout) {
          throw new Error('Invalid workout data received from API');
        }

        // Check for valid exercises structure - handle both new and legacy formats
        const hasMainWorkout = workout.mainWorkout && workout.mainWorkout.exercises && Array.isArray(workout.mainWorkout.exercises);
        const hasLegacyExercises = workout.exercises && Array.isArray(workout.exercises);

        if (!hasMainWorkout && !hasLegacyExercises) {
          throw new Error('Invalid workout data received from API - no exercises found');
        }

        // Check for empty exercises array
        if (hasMainWorkout && workout.mainWorkout!.exercises.length === 0) {
          throw new Error('Invalid workout data received from API - empty exercise list');
        }

        if (hasLegacyExercises && workout.exercises!.length === 0) {
          throw new Error('Invalid workout data received from API - empty exercise list');
        }

        // Apply type correction if there's a mismatch
        const correctedWorkout = correctWorkoutTypeMismatch(workout, selectedWorkoutType);

        // Transform the API response to our internal WorkoutPlan format
        const workoutPlan = transformAPIWorkoutToPlan(correctedWorkout);

        // Enhance workout with additional metadata
        const enhancedWorkout: WorkoutPlan = {
          ...workoutPlan,
          generationContext: {
            userContext: {
              userMetadata,
              workoutHistory,
              workoutRequest: workoutAPIRequest.workoutRequest || '',
              workoutSpecification: workoutAPIRequest.workoutSpecification,
              additionalNotes: workoutAPIRequest.additionalNotes
            },
            aiModelsUsed: [response.data.metadata.model],
            generationTime: performance.now() - startTime,
            sessionId: response.correlationId || 'unknown',
            version: '1.0.0'
          }
        };

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

        // Clear loading state after a brief delay to ensure workout renders
        setTimeout(() => {
          setIsGenerating(false);
          setGenerationStatus('');
        }, 100);
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

  // Helper function to convert goal codes to API values (optimized)
  const convertGoalsToAPIValues = useCallback((goalCodes: string[]): string[] => {
    if (!goalCodes || !Array.isArray(goalCodes)) return [];

    const goalMapping: Record<string, string> = {
      'LW': 'lose_weight',
      'BM': 'build_muscle',
      'IC': 'improve_cardio',
      'GF': 'general_fitness',
      'AP': 'athletic_performance'
    };

    const validGoalValues = goalCodes
      .map(code => goalMapping[code])
      .filter((value): value is string => value !== undefined);

    return [...new Set(validGoalValues)];
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

  // Helper function to convert equipment codes to API-standard names
  const convertEquipmentCodesToAPINames = useCallback((equipmentCodes: string[]): string[] => {
    if (!equipmentCodes || !Array.isArray(equipmentCodes)) return [];

    const apiMapping: Record<string, string> = {
      'BW': 'bodyweight',
      'DB': 'dumbbells',
      'BB': 'barbell',
      'KB': 'kettlebells',
      'RB': 'resistance_bands',
      'TM': 'treadmill',
      'BK': 'exercise_bike',
      'YM': 'yoga_mat'
    };

    const validEquipmentNames = equipmentCodes
      .map(code => apiMapping[code])
      .filter((name): name is string => name !== undefined && name.length > 0);

    // Remove duplicates
    return [...new Set(validEquipmentNames)];
  }, []);

  // Helper function to convert equipment codes to readable names for display
  const convertEquipmentCodesToNames = useCallback((equipmentCodes: string[]): string[] => {
    return equipmentCodes.map(code => {
      const equipment = equipmentOptions.find(e => e.code === code);
      return equipment ? equipment.label.toLowerCase() : code.toLowerCase();
    });
  }, []);

  // Client-side request validation
  const validateWorkoutRequest = useCallback((requestData: {
    userMetadata: any;
    workoutSpecification: any;
    selectedWorkoutType: string;
    profile: any;
  }) => {
    const errors: string[] = [];

    // Validate user metadata
    if (!requestData.userMetadata.age || requestData.userMetadata.age < 13 || requestData.userMetadata.age > 100) {
      errors.push('Invalid age: must be between 13 and 100');
    }

    if (!requestData.userMetadata.fitnessLevel || !['beginner', 'intermediate', 'advanced'].includes(requestData.userMetadata.fitnessLevel)) {
      errors.push('Invalid fitness level');
    }

    if (!requestData.userMetadata.timeAvailable || requestData.userMetadata.timeAvailable < 5 || requestData.userMetadata.timeAvailable > 180) {
      errors.push('Invalid workout duration: must be between 5 and 180 minutes');
    }

    // Validate workout specification
    if (!requestData.workoutSpecification.workoutType) {
      errors.push('Workout type is required');
    }

    if (!requestData.workoutSpecification.duration || requestData.workoutSpecification.duration < 5) {
      errors.push('Workout duration must be at least 5 minutes');
    }

    // Validate goals array
    if (requestData.userMetadata.goals && !Array.isArray(requestData.userMetadata.goals)) {
      errors.push('Goals must be an array');
    }

    // Validate equipment array
    if (requestData.userMetadata.equipment && !Array.isArray(requestData.userMetadata.equipment)) {
      errors.push('Equipment must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Helper function to convert gender for API compatibility
  // const convertGenderForAPI = useCallback((gender?: string): 'male' | 'female' | 'rather_not_say' | undefined => {
  //   if (!gender) return undefined;
  //   if (gender === 'Rather Not Say') return 'rather_not_say';
  //   if (gender === 'Male') return 'male';
  //   if (gender === 'Female') return 'female';
  //   return undefined; // fallback for unknown values
  // }, []);

  // Removed unused helper functions to fix TypeScript errors

  // Correct workout type mismatch from backend
  const correctWorkoutTypeMismatch = useCallback((workout: any, requestedType: string): any => {
    if (!workout || !workout.type || !requestedType) return workout;

    const normalizeType = (type: string) => type.toLowerCase().replace(/[_-]/g, '');
    const requestedNormalized = normalizeType(requestedType);
    const receivedNormalized = normalizeType(workout.type);

    // Check if types match (exact or partial)
    const exactMatch = workout.type === requestedType;
    const partialMatch = receivedNormalized.includes(requestedNormalized.split('_')[0]) ||
                        requestedNormalized.includes(receivedNormalized);

    // If there's no match, correct the type
    if (!exactMatch && !partialMatch) {
      console.log(`🔧 Correcting workout type mismatch: ${workout.type} → ${requestedType}`);
      return {
        ...workout,
        type: requestedType
      };
    }

    // For partial matches, decide if we should correct based on context
    if (!exactMatch && partialMatch) {
      // Handle specific cases where backend uses abbreviated forms
      const shouldCorrect = (
        (requestedType === 'upper_body' && workout.type === 'pull') ||
        (requestedType === 'upper_body' && workout.type === 'push') ||
        (requestedType === 'lower_body' && workout.type === 'legs') ||
        (requestedType === 'push_day' && workout.type === 'push') ||
        (requestedType === 'pull_day' && workout.type === 'pull') ||
        (requestedType === 'leg_day' && workout.type === 'legs')
      );

      if (shouldCorrect) {
        console.log(`🔧 Correcting abbreviated workout type: ${workout.type} → ${requestedType}`);
        return {
          ...workout,
          type: requestedType
        };
      }
    }

    return workout;
  }, []);

  // Build intelligent, flexible workout request that leverages full API capabilities
  const buildIntelligentWorkoutRequest = useCallback((profile: any, recentWorkouts: any[], workoutType: string, userGoals?: string[]) => {
    const selectedType = workoutTypes.find(type => type.value === workoutType);
    const workoutTypeDescription = selectedType ? selectedType.label : 'Mixed Training';

    // Build contextual workout history for variety and progression
    const workoutHistoryContext = recentWorkouts.length > 0
      ? `Recent workout history: ${recentWorkouts.slice(0, 2).map((w: any) =>
          `${w.name || 'Workout'} (${w.exercises?.length || 0} exercises, ${w.duration || 0}min)`
        ).join(', ')}. Ensure variety and avoid repetition.`
      : 'No recent workout history - create a foundational session.';

    // Build comprehensive equipment context
    const equipmentContext = profile.equipment && profile.equipment.length > 0
      ? `Available equipment: ${profile.equipment.join(', ')}. Utilize equipment effectively for maximum training benefit.`
      : 'Bodyweight exercises only - focus on progressive calisthenics and functional movements.';

    // Build detailed goals context
    const goalsContext = userGoals && userGoals.length > 0
      ? `Primary training objectives: ${userGoals.join(', ')}. Structure exercises to directly support these goals.`
      : 'General fitness improvement - create a balanced, well-rounded session.';

    // Build comprehensive injury/limitation context
    const limitationsContext = profile.injuries && profile.injuries.length > 0
      ? `CRITICAL: Avoid exercises that may aggravate: ${profile.injuries.join(', ')}. Provide safe alternatives and modifications.`
      : 'No reported injuries - full range of exercises available.';

    // Determine experience-based complexity
    const complexityGuidanceMap = {
      'beginner': 'Focus on fundamental movement patterns, proper form instruction, and gradual progression. Include detailed form cues and common mistakes to avoid.',
      'intermediate': 'Include moderate complexity exercises with progression options. Balance challenge with safety. Provide technique refinements.',
      'advanced': 'Challenge with complex movements, advanced techniques, and higher intensity. Include performance optimization tips and advanced progressions.'
    };
    const complexityGuidance = complexityGuidanceMap[profile.fitnessLevel as keyof typeof complexityGuidanceMap] || 'Adapt complexity to user capabilities.';

    // Create professional-grade workout prompt
    return `You are an elite personal trainer designing a ${workoutTypeDescription.toLowerCase()} workout for a ${profile.fitnessLevel} client.

CLIENT PROFILE:
- Training Duration: ${profile.availableTime} minutes
- Experience Level: ${profile.fitnessLevel} (${complexityGuidance})
- ${equipmentContext}
- ${goalsContext}
- ${limitationsContext}

TRAINING CONTEXT:
${workoutHistoryContext}

PROFESSIONAL REQUIREMENTS:
1. STRUCTURE: Create a complete periodized session with:
   - Dynamic warm-up (5-8 minutes): Movement preparation and activation
   - Main training block: Progressive exercise selection with optimal loading
   - Cool-down (3-5 minutes): Recovery and mobility work

2. EXERCISE PRESCRIPTION:
   - Provide precise sets, reps, and rest intervals based on training goals
   - Include RPE (Rate of Perceived Exertion) guidance for intensity
   - Specify tempo and range of motion cues where applicable
   - Ensure proper exercise sequencing and muscle group balance

3. COACHING EXCELLENCE:
   - Detailed form instructions with key coaching cues
   - Common mistakes and how to avoid them
   - Progression and regression options for each exercise
   - Safety considerations and contraindications

4. PERSONALIZATION:
   - Adapt exercise selection to available equipment and space
   - Consider individual limitations and provide modifications
   - Ensure appropriate challenge level for fitness experience
   - Include motivational elements and variety

5. PROFESSIONAL STANDARDS:
   - Evidence-based exercise selection and programming
   - Logical progression and flow between exercises
   - Time-efficient structure that maximizes training effect
   - Clear, actionable instructions a client can follow independently

Create a workout that demonstrates the expertise of a certified personal trainer with advanced exercise science knowledge.`;
  }, [workoutTypes]);

  // Build additional notes for specific user requirements (Enhanced API format)
  const buildAdditionalNotes = useCallback((profile: any, recentWorkouts: any[], workoutType: string) => {
    const notes: string[] = [];

    // Add comprehensive injury considerations with professional guidance
    if (profile.injuries && profile.injuries.length > 0) {
      notes.push(`SAFETY PRIORITY: Completely avoid exercises that may aggravate: ${profile.injuries.join(', ')}. Provide safe alternatives and modifications for affected areas.`);
    }

    // Add recent workout context for intelligent variety and progression
    if (recentWorkouts.length > 0) {
      const recentExercises = recentWorkouts[0].exercises
        .slice(0, 3)
        .map((ex: any) => typeof ex === 'string' ? ex : ex.name || 'exercise')
        .join(', ');
      notes.push(`VARIETY REQUIREMENT: Avoid repeating these recent exercises: ${recentExercises}. Provide fresh movement patterns and muscle activation strategies.`);
    }

    // Add specific workout type preferences with professional programming principles
    const workoutTypeNotes: Record<string, string> = {
      'mixed': 'BALANCED TRAINING: Integrate strength, cardiovascular, and mobility components using periodization principles. Ensure smooth transitions between training modalities.',
      'strength': 'STRENGTH FOCUS: Emphasize progressive overload, compound movements, and muscle hypertrophy. Include proper loading parameters and rest intervals for strength gains.',
      'cardio': 'CARDIOVASCULAR TRAINING: Maintain target heart rate zones with varied movement patterns. Include both steady-state and interval components for optimal adaptation.',
      'hiit': 'HIGH-INTENSITY INTERVALS: Structure work-to-rest ratios scientifically (typically 1:1 to 1:3). Monitor intensity through RPE and ensure adequate recovery between intervals.',
      'flexibility': 'MOBILITY & FLEXIBILITY: Focus on dynamic stretching, PNF techniques, and range of motion improvement. Include both static and dynamic components.',
      'upper_body': 'UPPER BODY SPECIALIZATION: Balance pushing and pulling movements in 1:1 ratio. Target all planes of motion and include rotational stability work.',
      'lower_body': 'LOWER BODY FOCUS: Emphasize hip-dominant and knee-dominant movement patterns. Include unilateral work for balance and stability.',
      'push_day': 'PUSHING MOVEMENTS: Target chest, shoulders, and triceps with varied angles and grip positions. Progress from compound to isolation exercises.',
      'pull_day': 'PULLING MOVEMENTS: Focus on back, biceps, and rear delts with emphasis on postural muscles. Include both vertical and horizontal pulling patterns.',
      'leg_day': 'LOWER BODY SPECIALIZATION: Target quadriceps, hamstrings, glutes, and calves with compound and accessory movements. Include single-leg stability work.',
      'core': 'CORE SPECIALIZATION: Emphasize anti-extension, anti-flexion, and anti-rotation exercises. Include both stability and dynamic core training.',
      'yoga': 'YOGA PRACTICE: Include flowing sequences, breath work, and mindfulness. Balance strength, flexibility, and mental focus components.',
      'pilates': 'PILATES METHOD: Emphasize core control, precise movement, and mind-body connection. Focus on quality over quantity with controlled movements.',
      'crossfit': 'FUNCTIONAL FITNESS: Include varied functional movements at high intensity. Combine weightlifting, gymnastics, and metabolic conditioning.',
      'bodyweight': 'CALISTHENICS TRAINING: Use progressive bodyweight exercises with leverage and range of motion modifications. Focus on movement quality and control.',
      'functional': 'FUNCTIONAL MOVEMENT: Emphasize real-world movement patterns, multi-planar exercises, and practical strength applications.'
    };

    if (workoutTypeNotes[workoutType]) {
      notes.push(workoutTypeNotes[workoutType]);
    }

    // Add equipment-specific programming notes
    if (profile.equipment && profile.equipment.length > 0) {
      const equipmentNames = convertEquipmentCodesToNames(profile.equipment);
      if (equipmentNames.includes('none') || equipmentNames.includes('bodyweight')) {
        notes.push('BODYWEIGHT SPECIALIZATION: Use progressive calisthenics with leverage modifications, tempo variations, and range of motion progressions.');
      } else {
        notes.push(`EQUIPMENT UTILIZATION: Maximize training effect using available equipment: ${equipmentNames.join(', ')}. Include equipment-specific techniques and safety protocols.`);
      }
    }

    // Add time-specific programming considerations
    if (profile.availableTime <= 15) {
      notes.push('TIME-EFFICIENT PROGRAMMING: Use compound movements, supersets, and minimal rest periods. Focus on maximum training density and metabolic impact.');
    } else if (profile.availableTime >= 60) {
      notes.push('COMPREHENSIVE SESSION: Include extended warm-up with movement preparation, detailed main training blocks with adequate rest, and thorough cool-down with recovery protocols.');
    } else {
      notes.push('OPTIMAL DURATION: Balance training volume with recovery. Include efficient exercise selection and appropriate rest intervals for training adaptations.');
    }

    // Add fitness level specific programming notes
    const fitnessLevelNotes: Record<string, string> = {
      'beginner': 'BEGINNER PROGRAMMING: Prioritize movement quality over intensity. Include detailed form instruction, basic movement patterns, and conservative progression. Focus on building exercise habits and confidence.',
      'intermediate': 'INTERMEDIATE PROGRAMMING: Include moderate complexity exercises with clear progression pathways. Balance challenge with safety. Introduce advanced techniques gradually with proper instruction.',
      'advanced': 'ADVANCED PROGRAMMING: Challenge with complex movement patterns, advanced training techniques, and higher intensities. Include performance optimization strategies and sophisticated periodization.'
    };

    if (fitnessLevelNotes[profile.fitnessLevel]) {
      notes.push(fitnessLevelNotes[profile.fitnessLevel]);
    }

    // Add professional standards note
    notes.push('PROFESSIONAL STANDARDS: Apply evidence-based exercise science principles, ensure proper exercise sequencing, and maintain the highest safety standards throughout the session.');

    return notes.length > 0 ? notes.join(' ') : '';
  }, [convertEquipmentCodesToNames]);

  // Transform API workout response to internal WorkoutPlan format
  const transformAPIWorkoutToPlan = useCallback((apiWorkout: any): WorkoutPlan => {
    // Handle both new and legacy API formats
    let exercisesList: any[] = [];

    // Check for new API format with mainWorkout structure
    if (apiWorkout.mainWorkout && apiWorkout.mainWorkout.exercises && Array.isArray(apiWorkout.mainWorkout.exercises)) {
      exercisesList = apiWorkout.mainWorkout.exercises;
    }
    // Fallback to legacy format
    else if (apiWorkout.exercises && Array.isArray(apiWorkout.exercises)) {
      exercisesList = apiWorkout.exercises;
    }
    else {
      throw new Error('Invalid workout structure received from API - no exercises found');
    }

    if (exercisesList.length === 0) {
      throw new Error('Invalid workout structure received from API - empty exercise list');
    }

    // Transform API exercises to internal format with validation
    const exercises: Exercise[] = exercisesList.map((apiExercise: any, index: number) => {
      if (!apiExercise.name) {
        throw new Error(`Exercise ${index + 1} is missing a name`);
      }

      // Parse reps - handle both string ranges (e.g., "8-12") and numbers
      let reps = 10; // default
      if (typeof apiExercise.reps === 'number') {
        reps = apiExercise.reps;
      } else if (typeof apiExercise.reps === 'string') {
        const repsMatch = apiExercise.reps.match(/(\d+)/);
        reps = repsMatch ? parseInt(repsMatch[1]) : 10;
      }

      // Parse rest time - handle both restTime and restInterval fields
      let restTime = 60; // default
      if (typeof apiExercise.restTime === 'number') {
        restTime = apiExercise.restTime;
      } else if (typeof apiExercise.restInterval === 'string') {
        const restMatch = apiExercise.restInterval.match(/(\d+)/);
        restTime = restMatch ? parseInt(restMatch[1]) : 60;
      }

      // Combine primary and secondary muscles for target muscles
      const targetMuscles = [];
      if (Array.isArray(apiExercise.primaryMuscles)) {
        targetMuscles.push(...apiExercise.primaryMuscles);
      }
      if (Array.isArray(apiExercise.secondaryMuscles)) {
        targetMuscles.push(...apiExercise.secondaryMuscles);
      }
      if (Array.isArray(apiExercise.targetMuscles)) {
        targetMuscles.push(...apiExercise.targetMuscles);
      }
      if (targetMuscles.length === 0) {
        targetMuscles.push('general');
      }

      // Combine form cues and tips
      const tips = [];
      if (apiExercise.tips) {
        tips.push(apiExercise.tips);
      }
      if (Array.isArray(apiExercise.formCues)) {
        tips.push(...apiExercise.formCues);
      }
      const combinedTips = tips.length > 0 ? tips.join(' ') : 'Focus on controlled movements';

      return {
        name: apiExercise.name,
        sets: typeof apiExercise.sets === 'number' ? apiExercise.sets : 3,
        reps,
        duration: typeof apiExercise.duration === 'number' ? apiExercise.duration : 0,
        restTime,
        instructions: apiExercise.instructions || 'Perform exercise with proper form',
        tips: combinedTips,
        targetMuscles: targetMuscles.map(m => m.toLowerCase()),
        equipment: Array.isArray(apiExercise.equipment) ? apiExercise.equipment : ['bodyweight'],
        intensity: apiExercise.intensity || apiExercise.rpe || 'moderate',
        progressionNotes: Array.isArray(apiExercise.progressionNotes)
          ? apiExercise.progressionNotes
          : [apiExercise.progressions || apiExercise.progressionNotes || 'Progress gradually'],
        modifications: Array.isArray(apiExercise.modifications)
          ? apiExercise.modifications
          : (apiExercise.regressions ? [apiExercise.regressions] : []),
        safetyNotes: apiExercise.safetyNotes ||
                    (Array.isArray(apiExercise.commonMistakes) ? `Avoid: ${apiExercise.commonMistakes.join(', ')}` : 'Listen to your body and maintain proper form')
      };
    });

    // Parse duration string to number (e.g., "45 minutes" -> 45)
    let duration = profile.availableTime;
    if (apiWorkout.duration) {
      const durationMatch = String(apiWorkout.duration).match(/(\d+)/);
      duration = durationMatch ? parseInt(durationMatch[1]) : profile.availableTime;
    }

    // Safe warmup processing - handle new API format
    let warmupExercises: any[] = [];
    let warmupDuration = 3; // default

    if (apiWorkout.warmup) {
      if (Array.isArray(apiWorkout.warmup)) {
        // Legacy format - direct array
        warmupExercises = apiWorkout.warmup;
      } else if (apiWorkout.warmup.phases && Array.isArray(apiWorkout.warmup.phases)) {
        // New format - phases with exercises
        warmupExercises = apiWorkout.warmup.phases.flatMap((phase: any) =>
          Array.isArray(phase.exercises) ? phase.exercises : []
        );
      } else if (apiWorkout.warmup.exercises && Array.isArray(apiWorkout.warmup.exercises)) {
        // Alternative new format - direct exercises
        warmupExercises = apiWorkout.warmup.exercises;
      }

      // Parse duration from new format
      if (apiWorkout.warmup.duration) {
        const durationMatch = String(apiWorkout.warmup.duration).match(/(\d+)/);
        warmupDuration = durationMatch ? parseInt(durationMatch[1]) / 60 : 3; // convert to minutes
      } else if (warmupExercises.length > 0) {
        warmupDuration = warmupExercises.reduce((total: number, w: any) => {
          const exerciseDuration = w.duration || 60;
          const durationMatch = String(exerciseDuration).match(/(\d+)/);
          return total + (durationMatch ? parseInt(durationMatch[1]) : 60);
        }, 0) / 60;
      }
    }

    // Safe cooldown processing - handle new API format
    let cooldownExercises: any[] = [];
    let cooldownDuration = 2; // default

    if (apiWorkout.cooldown) {
      if (Array.isArray(apiWorkout.cooldown)) {
        // Legacy format - direct array
        cooldownExercises = apiWorkout.cooldown;
      } else if (apiWorkout.cooldown.phases && Array.isArray(apiWorkout.cooldown.phases)) {
        // New format - phases with exercises
        cooldownExercises = apiWorkout.cooldown.phases.flatMap((phase: any) =>
          Array.isArray(phase.exercises) ? phase.exercises : []
        );
      } else if (apiWorkout.cooldown.exercises && Array.isArray(apiWorkout.cooldown.exercises)) {
        // Alternative new format - direct exercises
        cooldownExercises = apiWorkout.cooldown.exercises;
      }

      // Parse duration from new format
      if (apiWorkout.cooldown.duration) {
        const durationMatch = String(apiWorkout.cooldown.duration).match(/(\d+)/);
        cooldownDuration = durationMatch ? parseInt(durationMatch[1]) / 60 : 2; // convert to minutes
      } else if (cooldownExercises.length > 0) {
        cooldownDuration = cooldownExercises.reduce((total: number, c: any) => {
          const exerciseDuration = c.duration || 60;
          const durationMatch = String(exerciseDuration).match(/(\d+)/);
          return total + (durationMatch ? parseInt(durationMatch[1]) : 60);
        }, 0) / 60;
      }
    }

    // Generate unique workout ID with timestamp and random component
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Map backend workout type to our internal format
    const mapWorkoutType = (backendType: string, requestedType: string): string => {
      // Handle common backend abbreviations and new workout types
      const typeMapping: Record<string, string> = {
        'lower': 'lower_body',
        'upper': 'upper_body',
        'push': 'push_day',
        'pull': 'pull_day',
        'leg': 'leg_day',
        'legs': 'leg_day',
        'yoga': 'yoga',
        'pilates': 'pilates',
        'functional': 'functional',
        'functional_training': 'functional'
      };

      // Return mapped type or fall back to requested type or backend type
      return typeMapping[backendType.toLowerCase()] || requestedType || backendType;
    };

    const mappedWorkoutType = mapWorkoutType(apiWorkout.type, selectedWorkoutType);

    // Build comprehensive coaching notes from new API format
    const coachingNotes = [];
    if (apiWorkout.professionalGuidance) {
      if (apiWorkout.professionalGuidance.intensityGuidance) {
        coachingNotes.push(apiWorkout.professionalGuidance.intensityGuidance);
      }
      if (apiWorkout.professionalGuidance.safetyConsiderations) {
        coachingNotes.push(apiWorkout.professionalGuidance.safetyConsiderations);
      }
      if (apiWorkout.professionalGuidance.progressionPlan) {
        coachingNotes.push(apiWorkout.professionalGuidance.progressionPlan);
      }
    }
    if (apiWorkout.notes) {
      coachingNotes.push(apiWorkout.notes);
    }
    const finalCoachingNotes = coachingNotes.length > 0
      ? coachingNotes.join(' ')
      : 'Focus on proper form and listen to your body';

    return {
      id: uniqueId,
      name: apiWorkout.type ?
        (apiWorkout.type.charAt(0).toUpperCase() + apiWorkout.type.slice(1).replace('_', ' ') + ' Workout') :
        `AI Generated ${workoutTypes.find(t => t.value === selectedWorkoutType)?.label || 'Mixed'} Workout`,
      duration,
      difficulty: apiWorkout.difficulty || profile.fitnessLevel,
      exercises,
      createdAt: new Date(),
      completedAt: null,
      focusAreas: Array.isArray(apiWorkout.tags) ? apiWorkout.tags : ['general'],
      workoutType: mappedWorkoutType as 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed' | 'upper_body' | 'lower_body' | 'push' | 'pull' | 'core',
      coachingNotes: finalCoachingNotes,
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

    // Generate unique fallback workout ID
    const uniqueId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    return {
      id: uniqueId,
      name: `Basic ${workoutTypeName} Workout`,
      duration: profile.availableTime,
      difficulty: profile.fitnessLevel,
      exercises: basicExercises,
      createdAt: new Date(),
      completedAt: null,
      workoutType: selectedWorkoutType as 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed' | 'upper_body' | 'lower_body' | 'push' | 'pull' | 'core' | 'yoga' | 'pilates' | 'functional' | 'full_body' | 'legs',
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

      // Enhanced workout specification for modifications
      const goalValues = convertGoalsToAPIValues(profile.goals || []);
      const equipmentAPINames = convertEquipmentCodesToAPINames(profile.equipment || []);

      const modificationWorkoutSpecification: WorkoutSpecification = {
        workoutType: (modifications.workoutType || selectedWorkoutType) as any,
        duration: modifications.duration || profile.availableTime,
        difficulty: modifications.difficulty || profile.fitnessLevel,
        focusAreas: modifications.focusAreas || goalValues, // Use API values directly
        equipment: equipmentAPINames // Use API-standard equipment names
      };

      // Create additional notes for modifications
      const modificationNotes = buildAdditionalNotes(modifiedProfile, [], modifications.workoutType || selectedWorkoutType);
      const specificModificationNotes = [
        modificationNotes,
        modifications.focusAreas ? `Focus specifically on: ${modifications.focusAreas.join(', ')}` : '',
        modifications.intensity ? `Adjust intensity to: ${modifications.intensity}` : '',
        'This is a modification of a previous workout - provide fresh exercises and variety'
      ].filter(Boolean).join('. ');

      // Use optimized goal conversion (already done above)

      // Get representative age and weight for modification
      const userAge = getRepresentativeAge(profile);
      const userWeight = getRepresentativeWeight(profile);

      // Debug logging for modification age/weight handling
      if (import.meta.env.DEV) {
        console.log('🔧 Modification Age/Weight Processing:', {
          profileAge: profile.age,
          profileAgeCategory: profile.ageCategory,
          resolvedAge: userAge,
          profileWeight: profile.weight,
          profileWeightCategory: profile.weightCategory,
          resolvedWeight: userWeight
        });
      }

      const userMetadata: WorkoutUserMetadata = {
        age: userAge, // Use numeric age (prioritized) or category fallback
        fitnessLevel: modifications.difficulty || profile.fitnessLevel,
        gender: profile.gender || 'Rather Not Say',
        weight: userWeight,
        goals: goalValues, // Use API values for backend
        equipment: equipmentAPINames, // Use API-standard equipment names
        timeAvailable: modifications.duration || profile.availableTime,
        injuries: profile.injuries || [],
        daysPerWeek: profile.timeAvailability?.daysPerWeek || 3,
        minutesPerSession: modifications.duration || profile.timeAvailability?.minutesPerSession || profile.availableTime,
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
      const correlationId = `mod-${Date.now()}-${nanoTime}-${randomId1}-${Math.random().toString(36).substring(2, 10)}`;

      // Additional entropy for modification uniqueness (removed unused variable)

      // Create modification API request aligned with new documentation format
      const workoutAPIRequest = {
        // User metadata according to new API spec
        userMetadata: {
          age: userMetadata.age,
          fitnessLevel: modifications.difficulty || userMetadata.fitnessLevel,
          gender: userMetadata.gender,
          weight: userMetadata.weight,
          goals: goalValues,
          equipment: equipmentAPINames,
          timeAvailable: modifications.duration || userMetadata.timeAvailable,
          injuries: userMetadata.injuries || [],
          daysPerWeek: userMetadata.daysPerWeek || 3,
          minutesPerSession: modifications.duration || userMetadata.timeAvailable
        },

        // Workout history (optional)
        workoutHistory: [], // Empty for modifications

        // Natural language workout description (required)
        workoutRequest: buildIntelligentWorkoutRequest(
          modifiedProfile,
          [],
          modifications.workoutType || selectedWorkoutType,
          modifications.focusAreas
        ),

        // Enhanced format (recommended) - workoutSpecification
        workoutSpecification: modificationWorkoutSpecification,

        // Additional notes (optional)
        additionalNotes: specificModificationNotes.length > 500
          ? specificModificationNotes.substring(0, 497) + '...'
          : specificModificationNotes,

        // Optional tracking fields
        requestId,
        timestamp,
        sessionContext,
        correlationId
      };

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
        useEnsemble: false // Use single best model for consistency
      });

      // Comprehensive modification response logging
      console.group('🎯 Workout Modification Response');
      console.log('📥 Modification Response:', JSON.stringify(response, null, 2));
      console.log('✅ Response Status:', response.status);
      console.log('🔗 Correlation ID:', response.correlationId);
      if (response.data?.workout) {
        // Handle both new and legacy API formats for logging
        const workout = response.data.workout;
        const exerciseCount = workout.mainWorkout?.exercises?.length || workout.exercises?.length || 0;

        console.log('🏋️ Modified Workout Details:', {
          type: workout.type,
          duration: workout.duration,
          exerciseCount,
          difficulty: workout.difficulty,
          hasMainWorkout: !!workout.mainWorkout,
          hasExercises: !!workout.exercises,
          hasWarmup: !!workout.warmup,
          hasCooldown: !!workout.cooldown
        });
      }
      console.groupEnd();

      if (response.status === 'success' && response.data) {
        const workout = response.data.workout;

        // Apply type correction if there's a mismatch
        const correctedWorkout = correctWorkoutTypeMismatch(workout, selectedWorkoutType);

        const workoutPlan = transformAPIWorkoutToPlan(correctedWorkout);

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
