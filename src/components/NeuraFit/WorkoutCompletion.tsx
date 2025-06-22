/**
 * Simplified Workout Completion Component
 * 
 * Provides simple completion tracking with optional feedback
 * for the new optimized 2-endpoint API system.
 */

import {
    Box,
    Button,
    Card,
    CardBody,
    HStack,
    Icon,
    Text,
    Textarea,
    useColorModeValue,
    useToast,
    VStack
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { memo, useCallback, useState } from 'react';
import {
    PiCheckCircleBold,
    PiStarBold,
    PiStarFill,
    PiXCircleBold,
} from 'react-icons/pi';
import { neuraStackClient } from '../../lib/neurastack-client';
import type { WorkoutPlan } from '../../lib/types';
import { useAuthStore } from '../../store/useAuthStore';
import SuccessAnimation from './SuccessAnimation';

const MotionBox = motion(Box);

interface WorkoutCompletionProps {
  workout: WorkoutPlan;
  completedExercises: Set<number>;
  actualDuration: number; // in minutes
  onComplete: () => void;
  onSkip: () => void;
  // Enhanced data for detailed API submission
  exerciseData?: {
    [exerciseIndex: number]: {
      actualSets: number;
      actualReps: number[];
      weights: (number | undefined)[];
      notes?: string;
      difficulty?: 'too_easy' | 'just_right' | 'too_hard';
      restTimes?: string[];
    };
  };
  workoutStartTime?: Date; // When the workout was started
}

const WorkoutCompletion = memo(function WorkoutCompletion({
  workout,
  completedExercises,
  actualDuration,
  onComplete,
  onSkip,
  exerciseData,
  workoutStartTime
}: WorkoutCompletionProps) {
  const { user } = useAuthStore();
  const toast = useToast();
  
  const [completed, setCompleted] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'too_easy' | 'just_right' | 'too_hard' | undefined>();
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Color values
  // const bgColor = useColorModeValue('white', 'gray.800');
  // const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  const submitCompletion = useCallback(async () => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'User authentication required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      setSubmitError(null);

      // Calculate completion percentage
      const completionPercentage = (completedExercises.size / workout.exercises.length) * 100;

      // Prepare detailed exercise data for enhanced API
      const exercisesData = workout.exercises.map((exercise, index) => {
        const isCompleted = completedExercises.has(index);
        const exerciseDetails = exerciseData?.[index];

        // Create sets data with proper structure
        const setsData = [];
        if (isCompleted && exerciseDetails) {
          // Use actual exercise data if available
          for (let i = 0; i < exerciseDetails.actualSets; i++) {
            setsData.push({
              reps: exerciseDetails.actualReps[i] || 0,
              weight: exerciseDetails.weights[i] || 0,
              completed: true,
              targetReps: typeof exercise.reps === 'string' ? parseInt(exercise.reps) : exercise.reps,
              targetWeight: 0, // Will be set by user during workout
              restTime: exerciseDetails.restTimes?.[i] || undefined,
              notes: undefined
            });
          }
        } else if (isCompleted) {
          // Create default sets data for completed exercises without detailed tracking
          const targetReps = typeof exercise.reps === 'string' ? parseInt(exercise.reps) : exercise.reps;
          for (let i = 0; i < exercise.sets; i++) {
            setsData.push({
              reps: targetReps,
              weight: 0,
              completed: true,
              targetReps: targetReps,
              targetWeight: 0
            });
          }
        }

        return {
          name: exercise.name,
          type: exercise.category || 'strength',
          muscleGroups: exercise.targetMuscles?.join(', ') || '',
          completed: isCompleted,
          difficulty: exerciseDetails?.difficulty,
          notes: exerciseDetails?.notes,
          sets: setsData,
          targetSets: exercise.sets,
          targetReps: typeof exercise.reps === 'string' ? parseInt(exercise.reps) : exercise.reps
        };
      });

      // Send completion data to enhanced API endpoint
      const response = await neuraStackClient.completeWorkout({
        workoutId: workout.id,
        completed,
        completionPercentage: Math.round(completionPercentage),
        actualDuration,
        startedAt: workoutStartTime?.toISOString(),
        completedAt: new Date().toISOString(),
        exercises: exercisesData,
        feedback: {
          rating: rating > 0 ? rating : undefined,
          difficulty,
          enjoyment: rating > 0 ? rating : undefined, // Use rating as enjoyment for now
          energy: rating >= 4 ? 4 : rating >= 3 ? 3 : 2, // Convert rating to energy level
          notes: notes.trim() || undefined,
          wouldRecommend: rating >= 4,
          environment: {
            location: 'home', // Default for now
            temperature: 'comfortable'
          }
        }
      }, {
        userId: user.uid
      });

      if (response.status === 'success') {
        toast({
          title: 'Workout Completed!',
          description: 'Your workout has been successfully saved to your history.',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });

        // Show success animation
        setShowSuccess(true);

        // Complete after animation
        setTimeout(() => {
          setShowSuccess(false);
          onComplete();
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to save workout completion');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      console.error('Failed to complete workout:', error);
      setSubmitError(errorMessage);
      toast({
        title: 'Submission Failed',
        description: 'Unable to save completion data. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.uid, workout.id, completed, rating, difficulty, notes, actualDuration, toast, onComplete]);

  const renderStarRating = useCallback((currentRating: number, onChange: (rating: number) => void) => {
    return (
      <HStack spacing={2} justify="center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={star <= currentRating ? PiStarFill : PiStarBold}
            color={star <= currentRating ? 'yellow.400' : 'gray.300'}
            boxSize={6}
            cursor="pointer"
            onClick={() => onChange(star)}
            _hover={{
              transform: 'scale(1.1)',
              filter: 'brightness(1.1)'
            }}
            transition="all 0.2s ease-in-out"
          />
        ))}
      </HStack>
    );
  }, []);

  const completionRate = (completedExercises.size / workout.exercises.length) * 100;

  return (
    <>
      <SuccessAnimation
        isVisible={showSuccess}
        title="Workout Completed!"
        message="Your progress has been saved."
      />

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          p={{ base: 4, md: 6 }}
          maxW={{ base: "100%", sm: "md" }}
          mx="auto"
          minH={{ base: "100vh", md: "auto" }}
          display="flex"
          flexDirection="column"
          justifyContent={{ base: "center", md: "flex-start" }}
        >
          <VStack spacing={6} align="stretch">
            {/* Modern Header with Progress */}
            <VStack spacing={4} textAlign="center" mb={6}>
              <Box
                bg="linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)"
                borderRadius="full"
                p={4}
                shadow="lg"
              >
                <Icon as={PiCheckCircleBold} boxSize={8} color="white" />
              </Box>
              <VStack spacing={2}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                  Workout Complete!
                </Text>
                <Text color={subtextColor} fontSize={{ base: "md", md: "lg" }}>
                  {completedExercises.size} of {workout.exercises.length} exercises • {completionRate.toFixed(0)}% complete
                </Text>
                <Text color={subtextColor} fontSize="sm">
                  Duration: {actualDuration} minutes
                </Text>
              </VStack>
            </VStack>

            {/* Streamlined Feedback Form */}
            <Card
              bg="rgba(255, 255, 255, 0.9)"
              backdropFilter="blur(20px)"
              borderColor="rgba(255, 255, 255, 0.3)"
              borderWidth="1px"
              shadow="0 8px 32px rgba(31, 38, 135, 0.15)"
              borderRadius="2xl"
            >
              <CardBody p={{ base: 5, md: 6 }}>
                <VStack spacing={5} align="stretch">
                  {/* Quick Completion Toggle */}
                  <VStack spacing={3}>
                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                      How did it go?
                    </Text>
                    <HStack spacing={3} justify="center" w="100%">
                      <Button
                        leftIcon={<Icon as={PiCheckCircleBold} />}
                        variant={completed ? 'solid' : 'outline'}
                        colorScheme="green"
                        onClick={() => setCompleted(true)}
                        size="lg"
                        flex={1}
                        borderRadius="xl"
                        bg={completed ? 'green.500' : 'transparent'}
                        borderWidth="2px"
                        borderColor={completed ? 'green.500' : 'green.200'}
                        _hover={{
                          transform: 'translateY(-1px)',
                          shadow: 'md'
                        }}
                      >
                        Completed
                      </Button>
                      <Button
                        leftIcon={<Icon as={PiXCircleBold} />}
                        variant={!completed ? 'solid' : 'outline'}
                        colorScheme="orange"
                        onClick={() => setCompleted(false)}
                        size="lg"
                        flex={1}
                        borderRadius="xl"
                        bg={!completed ? 'orange.500' : 'transparent'}
                        borderWidth="2px"
                        borderColor={!completed ? 'orange.500' : 'orange.200'}
                        _hover={{
                          transform: 'translateY(-1px)',
                          shadow: 'md'
                        }}
                      >
                        Partial
                      </Button>
                    </HStack>
                  </VStack>

                  {/* Difficulty Assessment */}
                  <VStack spacing={3}>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Difficulty Level
                    </Text>
                    <HStack spacing={2} justify="center" w="100%">
                      {(['too_easy', 'just_right', 'too_hard'] as const).map((level) => (
                        <Button
                          key={level}
                          size="md"
                          variant={difficulty === level ? 'solid' : 'outline'}
                          colorScheme="blue"
                          onClick={() => setDifficulty(level)}
                          flex={1}
                          borderRadius="lg"
                          fontSize="sm"
                          bg={difficulty === level ? 'blue.500' : 'transparent'}
                          borderWidth="2px"
                          borderColor={difficulty === level ? 'blue.500' : 'blue.200'}
                          _hover={{
                            transform: 'translateY(-1px)',
                            shadow: 'sm'
                          }}
                        >
                          {level === 'too_easy' ? '😴 Easy' :
                           level === 'just_right' ? '💪 Perfect' : '🔥 Hard'}
                        </Button>
                      ))}
                    </HStack>
                  </VStack>

                  {/* Star Rating */}
                  <VStack spacing={3}>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Overall Rating
                    </Text>
                    {renderStarRating(rating, setRating)}
                  </VStack>

                  {/* Feedback Notes */}
                  <VStack spacing={3}>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Quick Feedback
                    </Text>
                    <Textarea
                      placeholder="How did you feel? Any exercises you loved or want to change?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      resize="vertical"
                      borderRadius="lg"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
                      }}
                      _hover={{
                        borderColor: "blue.300"
                      }}
                      bg="white"
                      fontSize="sm"
                    />
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Modern Action Buttons */}
            <VStack spacing={3} w="100%">
              <Button
                colorScheme="blue"
                onClick={submitCompletion}
                isLoading={isSubmitting}
                loadingText="Saving Progress..."
                size="lg"
                w="100%"
                borderRadius="xl"
                py={6}
                fontSize="lg"
                fontWeight="bold"
                bg="linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                  bg: 'linear-gradient(135deg, #3182CE 0%, #553C9A 100%)'
                }}
                _active={{
                  transform: 'translateY(0px)',
                  shadow: 'lg'
                }}
                transition="all 0.2s ease-in-out"
                shadow="lg"
              >
                Save & Continue
              </Button>
              <Button
                variant="ghost"
                onClick={onSkip}
                size="md"
                w="100%"
                color="gray.500"
                _hover={{
                  bg: "gray.100",
                  color: "gray.700"
                }}
              >
                Skip for now
              </Button>
            </VStack>
          </VStack>
        </Box>
      </MotionBox>
    </>
  );
});

export default WorkoutCompletion;
