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
  VStack,
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
}

const WorkoutCompletion = memo(function WorkoutCompletion({
  workout,
  completedExercises,
  actualDuration,
  onComplete,
  onSkip
}: WorkoutCompletionProps) {
  const { user } = useAuthStore();
  const toast = useToast();
  
  const [completed, setCompleted] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'too_easy' | 'just_right' | 'too_hard' | undefined>();
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Color values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
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
      // Send completion data to new optimized API endpoint
      await neuraStackClient.completeWorkout({
        workoutId: workout.id,
        completed,
        rating: rating > 0 ? rating : undefined,
        difficulty,
        notes: notes.trim() || undefined,
        actualDuration
      }, {
        userId: user.uid
      });

      // Show success animation
      setShowSuccess(true);

      // Complete after animation
      setTimeout(() => {
        setShowSuccess(false);
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('Error submitting workout completion:', error);
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
            <Box textAlign="center">
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor} mb={2}>
                Workout Summary
              </Text>
              <Text color={subtextColor} fontSize={{ base: "sm", md: "md" }}>
                You completed {completedExercises.size} of {workout.exercises.length} exercises ({completionRate.toFixed(0)}%)
              </Text>
            </Box>

            <Card bg={bgColor} borderColor={borderColor} shadow="md">
              <CardBody p={6}>
                <VStack spacing={6} align="stretch">
                  {/* Completion Status */}
                  <Box>
                    <Text fontWeight="semibold" color={textColor} mb={3}>
                      Did you complete the workout?
                    </Text>
                    <HStack spacing={4} justify="center">
                      <Button
                        leftIcon={<Icon as={PiCheckCircleBold} />}
                        variant={completed ? 'solid' : 'outline'}
                        colorScheme={completed ? 'green' : 'gray'}
                        onClick={() => setCompleted(true)}
                        size="lg"
                      >
                        Yes
                      </Button>
                      <Button
                        leftIcon={<Icon as={PiXCircleBold} />}
                        variant={!completed ? 'solid' : 'outline'}
                        colorScheme={!completed ? 'red' : 'gray'}
                        onClick={() => setCompleted(false)}
                        size="lg"
                      >
                        No
                      </Button>
                    </HStack>
                  </Box>

                  {/* Optional Rating */}
                  <Box>
                    <Text fontWeight="semibold" color={textColor} mb={3}>
                      Rate this workout (optional)
                    </Text>
                    {renderStarRating(rating, setRating)}
                  </Box>

                  {/* Optional Difficulty */}
                  <Box>
                    <Text fontWeight="semibold" color={textColor} mb={3}>
                      How was the difficulty? (optional)
                    </Text>
                    <HStack spacing={3} justify="center">
                      {(['too_easy', 'just_right', 'too_hard'] as const).map((level) => (
                        <Button
                          key={level}
                          size="sm"
                          variant={difficulty === level ? 'solid' : 'outline'}
                          colorScheme={difficulty === level ? 'blue' : 'gray'}
                          onClick={() => setDifficulty(level)}
                        >
                          {level === 'too_easy' ? 'Too Easy' : 
                           level === 'just_right' ? 'Just Right' : 'Too Hard'}
                        </Button>
                      ))}
                    </HStack>
                  </Box>

                  {/* Optional Notes */}
                  <Box>
                    <Text fontWeight="semibold" color={textColor} mb={3}>
                      Any notes? (optional)
                    </Text>
                    <Textarea
                      placeholder="Share your thoughts about this workout..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      resize="vertical"
                    />
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            <HStack spacing={3} flexDirection={{ base: "column", sm: "row" }}>
              <Button
                variant="ghost"
                onClick={onSkip}
                flex={1}
                size="lg"
                w={{ base: "100%", sm: "auto" }}
              >
                Skip
              </Button>
              <Button
                colorScheme="blue"
                onClick={submitCompletion}
                isLoading={isSubmitting}
                loadingText="Saving..."
                flex={1}
                size="lg"
                w={{ base: "100%", sm: "auto" }}
              >
                Save Progress
              </Button>
            </HStack>
          </VStack>
        </Box>
      </MotionBox>
    </>
  );
});

export default WorkoutCompletion;
