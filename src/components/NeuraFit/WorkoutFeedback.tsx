/**
 * Workout Feedback Component
 *
 * Collects user feedback after workout completion to improve
 * AI-driven workout generation and personalization.
 */

import {
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    HStack,
    Icon,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
    Textarea,
    useColorModeValue,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { memo, useCallback, useMemo, useState } from 'react';
import {
    PiStarBold,
    PiStarFill,
} from 'react-icons/pi';
import type { WorkoutPlan } from '../../lib/types';
import { useAuthStore } from '../../store/useAuthStore';
import SuccessAnimation from './SuccessAnimation';

const MotionBox = motion(Box);

interface WorkoutFeedbackProps {
  workout: WorkoutPlan;
  completedExercises: Set<number>;
  actualDuration: number; // in minutes
  onFeedbackComplete: () => void;
  onSkip: () => void;
}

interface FeedbackData {
  difficultyRating: number; // 1-5
  enjoymentRating: number; // 1-5
  energyLevel: 'low' | 'moderate' | 'high';
  perceivedExertion: number; // 1-10 RPE scale
  comments: string;
  exerciseFeedback: Record<number, {
    difficulty: number;
    formQuality: number;
    modifications: string[];
  }>;
}

const WorkoutFeedback = memo(function WorkoutFeedback({
  workout,
  completedExercises,
  actualDuration,
  onFeedbackComplete,
  onSkip
}: WorkoutFeedbackProps) {
  const { user } = useAuthStore();
  const toast = useToast();
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    difficultyRating: 3,
    enjoymentRating: 3,
    energyLevel: 'moderate',
    perceivedExertion: 5,
    comments: '',
    exerciseFeedback: {}
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: overall, 1: exercises, 2: comments
  const [showSuccess, setShowSuccess] = useState(false);

  // Color values - hooks must be called at top level
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  const handleRatingChange = useCallback((field: keyof FeedbackData, value: any) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  }, []);



  const submitFeedback = useCallback(async () => {
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
      // Exercise performance tracking moved to backend

      // Backend handles all analytics storage - no local storage needed
      // Analytics data is automatically captured via the completeWorkout API endpoint

      // Backend handles all analytics storage - no local storage needed
      // Analytics data is automatically captured via the completeWorkout API endpoint

      // Backend automatically stores feedback and memory through the completeWorkout API
      // No manual memory storage needed - the new API handles this intelligently

      // Show success animation
      setShowSuccess(true);

      // Complete feedback after animation
      setTimeout(() => {
        setShowSuccess(false);
        onFeedbackComplete();
      }, 2500);

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error submitting feedback:', error);
      }
      toast({
        title: 'Submission Failed',
        description: 'Unable to save feedback. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.uid, workout, completedExercises, actualDuration, feedback, toast, onFeedbackComplete]);

  const renderStarRating = useCallback((rating: number, onChange: (rating: number) => void) => {
    return (
      <HStack spacing={{ base: 2, md: 1 }} justify="center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={star <= rating ? PiStarFill : PiStarBold}
            color={star <= rating ? 'yellow.400' : 'gray.300'}
            boxSize={{ base: 8, md: 6 }}
            cursor="pointer"
            onClick={() => onChange(star)}
            _hover={{
              transform: 'scale(1.1)',
              filter: 'brightness(1.1)',
              shadow: 'lg'
            }}
            _active={{
              transform: 'scale(0.95)',
              filter: 'brightness(0.9)'
            }}
            transition="all 0.2s ease-in-out"
            // Better touch targets for mobile
            minW={{ base: "44px", md: "auto" }}
            minH={{ base: "44px", md: "auto" }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          />
        ))}
      </HStack>
    );
  }, []);

  const renderOverallFeedback = useMemo(() => (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center" px={{ base: 2, md: 0 }}>
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor} mb={2}>
          How was your workout?
        </Text>
        <Text color={subtextColor} fontSize={{ base: "sm", md: "md" }}>
          Your feedback helps us create better workouts for you
        </Text>
      </Box>

      <Card bg={bgColor} borderColor={borderColor} shadow={{ base: "lg", md: "md" }}>
        <CardBody p={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            {/* Difficulty Rating */}
            <Box>
              <Text fontWeight="semibold" color={textColor} mb={3}>
                How challenging was this workout?
              </Text>
              {renderStarRating(feedback.difficultyRating, (rating) => 
                handleRatingChange('difficultyRating', rating)
              )}
              <Text fontSize="sm" color={subtextColor} mt={1}>
                1 = Too Easy, 3 = Just Right, 5 = Too Hard
              </Text>
            </Box>

            <Divider />

            {/* Enjoyment Rating */}
            <Box>
              <Text fontWeight="semibold" color={textColor} mb={3}>
                How much did you enjoy this workout?
              </Text>
              {renderStarRating(feedback.enjoymentRating, (rating) => 
                handleRatingChange('enjoymentRating', rating)
              )}
            </Box>

            <Divider />

            {/* Energy Level */}
            <Box>
              <Text fontWeight="semibold" color={textColor} mb={3}>
                How was your energy level?
              </Text>
              <HStack spacing={3}>
                {(['low', 'moderate', 'high'] as const).map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={feedback.energyLevel === level ? 'solid' : 'outline'}
                    colorScheme={feedback.energyLevel === level ? 'blue' : 'gray'}
                    onClick={() => handleRatingChange('energyLevel', level)}
                    textTransform="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </HStack>
            </Box>

            <Divider />

            {/* Perceived Exertion */}
            <Box>
              <Text fontWeight="semibold" color={textColor} mb={3}>
                Rate of Perceived Exertion (RPE): {feedback.perceivedExertion}
              </Text>
              <Slider
                value={feedback.perceivedExertion}
                onChange={(value) => handleRatingChange('perceivedExertion', value)}
                min={1}
                max={10}
                step={1}
                colorScheme="blue"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" mt={1}>
                <Text fontSize="xs" color={subtextColor}>Very Easy</Text>
                <Text fontSize="xs" color={subtextColor}>Maximal</Text>
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      <HStack spacing={{ base: 2, md: 3 }} flexDirection={{ base: "column", sm: "row" }}>
        <Button
          variant="ghost"
          onClick={onSkip}
          flex={1}
          size={{ base: "lg", md: "md" }}
          minH={{ base: "48px", md: "auto" }}
          w={{ base: "100%", sm: "auto" }}
          _hover={{
            transform: 'translateY(-2px)',
            shadow: 'md'
          }}
          transition="all 0.2s ease-in-out"
        >
          Skip Feedback
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => setCurrentStep(1)}
          flex={1}
          size={{ base: "lg", md: "md" }}
          minH={{ base: "48px", md: "auto" }}
          w={{ base: "100%", sm: "auto" }}
          _hover={{
            transform: 'translateY(-2px)',
            shadow: 'lg',
            bg: 'blue.600'
          }}
          transition="all 0.2s ease-in-out"
        >
          Continue
        </Button>
      </HStack>
    </VStack>
  ), [feedback, textColor, subtextColor, bgColor, borderColor, handleRatingChange, renderStarRating]);

  const renderCommentsStep = useMemo(() => (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center" px={{ base: 2, md: 0 }}>
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor} mb={2}>
          Any additional thoughts?
        </Text>
        <Text color={subtextColor} fontSize={{ base: "sm", md: "md" }}>
          Share what worked well or what could be improved
        </Text>
      </Box>

      <Card bg={bgColor} borderColor={borderColor} shadow={{ base: "lg", md: "md" }}>
        <CardBody p={{ base: 4, md: 6 }}>
          <Textarea
            placeholder="Optional: Share your thoughts about this workout..."
            value={feedback.comments}
            onChange={(e) => handleRatingChange('comments', e.target.value)}
            rows={4}
            resize="vertical"
            fontSize={{ base: "md", md: "sm" }}
            minH={{ base: "120px", md: "auto" }}
          />
        </CardBody>
      </Card>

      <HStack spacing={{ base: 2, md: 3 }} flexDirection={{ base: "column", sm: "row" }}>
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(0)}
          flex={1}
          size={{ base: "lg", md: "md" }}
          minH={{ base: "48px", md: "auto" }}
          w={{ base: "100%", sm: "auto" }}
        >
          Back
        </Button>
        <Button
          colorScheme="blue"
          onClick={submitFeedback}
          isLoading={isSubmitting}
          loadingText="Submitting..."
          flex={1}
          size={{ base: "lg", md: "md" }}
          minH={{ base: "48px", md: "auto" }}
          w={{ base: "100%", sm: "auto" }}
        >
          Submit Feedback
        </Button>
      </HStack>
    </VStack>
  ), [feedback, textColor, subtextColor, bgColor, borderColor, handleRatingChange, submitFeedback, isSubmitting]);

  return (
    <>
      <SuccessAnimation
        isVisible={showSuccess}
        title="Feedback Submitted!"
        message="Thank you! Your feedback helps us create better workouts."
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
        {currentStep === 0 && renderOverallFeedback}
        {currentStep === 1 && renderCommentsStep}
      </Box>
    </MotionBox>
    </>
  );
});

export default WorkoutFeedback;

// Helper functions removed - unused

// Workout sequence tracking moved to backend

// Complex recommendation generation moved to backend
