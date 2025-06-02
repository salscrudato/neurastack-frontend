import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
  Badge,
  Card,
  CardBody,
  Spinner,
  useToast,
  Flex,
  Progress,
  Divider,
} from '@chakra-ui/react';
import {
  PiPlayBold,
  PiStopBold,
  PiCheckBold,
  PiTimerBold,
  PiTargetBold,
  PiLightningBold,
} from 'react-icons/pi';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitnessStore } from '../../store/useFitnessStore';
import { queryStack } from '../../lib/api';
import type { WorkoutPlan, Exercise } from '../../lib/types';

const MotionBox = motion(Box);

interface WorkoutGeneratorProps {
  onWorkoutComplete: (workout: WorkoutPlan) => void;
  onBack: () => void;
}

export default function WorkoutGenerator({ onWorkoutComplete, onBack }: WorkoutGeneratorProps) {
  const { profile, addWorkoutPlan } = useFitnessStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.300');
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const completedColor = useColorModeValue('green.500', 'green.300');

  // Timer effect for exercise and rest periods
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
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
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutActive, isResting, currentWorkout]);

  const generateWorkout = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a personalized workout plan based on this fitness profile:
      - Fitness Level: ${profile.fitnessLevel}
      - Goals: ${profile.goals.join(', ')}
      - Available Equipment: ${profile.equipment.join(', ')}
      - Available Time: ${profile.availableTime} minutes
      - Workout Days: ${profile.workoutDays.join(', ')}

      Please provide a structured workout with:
      1. 5-8 exercises appropriate for the fitness level
      2. Sets, reps, and duration for each exercise
      3. Rest periods between exercises
      4. Form tips and modifications
      5. Total estimated workout time

      Format as JSON with this structure:
      {
        "name": "Workout Name",
        "duration": 30,
        "difficulty": "beginner|intermediate|advanced",
        "exercises": [
          {
            "name": "Exercise Name",
            "sets": 3,
            "reps": 12,
            "duration": 30,
            "restTime": 60,
            "instructions": "How to perform the exercise",
            "tips": "Form tips and modifications",
            "targetMuscles": ["muscle1", "muscle2"]
          }
        ]
      }`;

      const response = await queryStack(prompt, false);

      // Parse the AI response to extract workout data
      const workoutData = parseWorkoutResponse(response.answer);
      
      if (workoutData) {
        setCurrentWorkout(workoutData);
        toast({
          title: 'Workout Generated!',
          description: `Your personalized ${workoutData.name} is ready.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to parse workout data');
      }
    } catch (error) {
      console.error('Error generating workout:', error);
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate workout. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const parseWorkoutResponse = (response: string): WorkoutPlan | null => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const workoutData = JSON.parse(jsonMatch[0]);
        return {
          id: Date.now().toString(),
          name: workoutData.name || 'AI Generated Workout',
          duration: workoutData.duration || profile.availableTime,
          difficulty: workoutData.difficulty || profile.fitnessLevel,
          exercises: workoutData.exercises || [],
          createdAt: new Date(),
          completedAt: null,
        };
      }
      
      // Fallback: create a basic workout if JSON parsing fails
      return createFallbackWorkout();
    } catch (error) {
      console.error('Error parsing workout response:', error);
      return createFallbackWorkout();
    }
  };

  const createFallbackWorkout = (): WorkoutPlan => {
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
      name: 'Basic Bodyweight Workout',
      duration: profile.availableTime,
      difficulty: profile.fitnessLevel,
      exercises: basicExercises,
      createdAt: new Date(),
      completedAt: null,
    };
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setCurrentExerciseIndex(0);
    setExerciseTimer(0);
    setCompletedExercises(new Set());
    toast({
      title: 'Workout Started!',
      description: 'Good luck with your training session.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

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

  const finishWorkout = () => {
    if (!currentWorkout) return;

    const completedWorkout = {
      ...currentWorkout,
      completedAt: new Date(),
    };

    addWorkoutPlan(completedWorkout);
    onWorkoutComplete(completedWorkout);
    
    toast({
      title: 'Workout Complete!',
      description: 'Great job! Your progress has been saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          AI is creating a personalized workout based on your profile...
        </Text>
      </Flex>
    );
  }

  if (!currentWorkout) {
    return (
      <VStack spacing={8} p={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={2}>
            Ready for Your Workout?
          </Text>
          <Text color={subtextColor}>
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

        <VStack spacing={4}>
          <Button
            colorScheme="blue"
            size="lg"
            w="100%"
            leftIcon={<Icon as={PiLightningBold} />}
            onClick={generateWorkout}
            py={6}
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
    <Box
      h="100%"
      overflow={{ base: "auto", md: "auto" }}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <VStack spacing={6} p={4} align="stretch" minH="100%">
      {/* Workout Header */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  {currentWorkout.name}
                </Text>
                <HStack spacing={4}>
                  <Badge colorScheme="blue">{currentWorkout.difficulty}</Badge>
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

            {/* Progress Bar */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color={subtextColor}>
                  Progress
                </Text>
                <Text fontSize="sm" color={subtextColor}>
                  {completedExercises.size} / {currentWorkout.exercises.length}
                </Text>
              </HStack>
              <Progress
                value={(completedExercises.size / currentWorkout.exercises.length) * 100}
                colorScheme="green"
                size="sm"
                borderRadius="full"
              />
            </Box>
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
                  <Box bg={useColorModeValue('blue.50', 'blue.900')} p={3} borderRadius="md">
                    <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')}>
                      💡 {currentWorkout.exercises[currentExerciseIndex]?.tips}
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
  );
}
