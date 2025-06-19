import {
    Box,
    Button,
    Card,
    CardBody,
    FormControl,
    FormLabel,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import {
    PiArrowClockwiseBold,
    PiClockBold,
    PiGearBold,
    PiLightningBold,
    PiTargetBold
} from 'react-icons/pi';
import type { WorkoutPlan } from '../../lib/types';

interface WorkoutModifierProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkout: WorkoutPlan;
  onModifyWorkout: (modifications: WorkoutModifications) => void;
}

export interface WorkoutModifications {
  workoutType?: string;
  duration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  focusAreas?: string[];
  intensity?: 'low' | 'moderate' | 'high';
}

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Strength Training', description: 'Build muscle and power' },
  { value: 'cardio', label: 'Cardio', description: 'Improve cardiovascular health' },
  { value: 'hiit', label: 'HIIT', description: 'High-intensity interval training' },
  { value: 'flexibility', label: 'Flexibility', description: 'Improve mobility and flexibility' },
  { value: 'mixed', label: 'Mixed', description: 'Combination of different types' },
];

const FOCUS_AREAS = [
  'Upper Body',
  'Lower Body',
  'Core',
  'Full Body',
  'Arms',
  'Legs',
  'Back',
  'Chest',
  'Shoulders',
  'Glutes',
];

export default function WorkoutModifier({
  isOpen,
  onClose,
  currentWorkout,
  onModifyWorkout,
}: WorkoutModifierProps) {
  const [workoutType, setWorkoutType] = useState<'mixed' | 'strength' | 'cardio' | 'hiit' | 'flexibility'>(
    (currentWorkout.workoutType as 'mixed' | 'strength' | 'cardio' | 'hiit' | 'flexibility') || 'mixed'
  );
  const [duration, setDuration] = useState(currentWorkout.duration);
  const [difficulty, setDifficulty] = useState(currentWorkout.difficulty);
  const [focusAreas, setFocusAreas] = useState<string[]>(currentWorkout.focusAreas || []);
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const currentWorkoutBg = useColorModeValue('blue.50', 'blue.900');
  const changesSummaryBg = useColorModeValue('green.50', 'green.900');

  const handleFocusAreaToggle = useCallback((area: string) => {
    setFocusAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area);
      } else {
        return [...prev, area];
      }
    });
  }, []);

  const handleApplyModifications = useCallback(() => {
    const modifications: WorkoutModifications = {
      workoutType,
      duration,
      difficulty,
      focusAreas,
      intensity,
    };
    
    onModifyWorkout(modifications);
    onClose();
  }, [workoutType, duration, difficulty, focusAreas, intensity, onModifyWorkout, onClose]);

  const hasChanges = 
    workoutType !== (currentWorkout.workoutType || 'mixed') ||
    duration !== currentWorkout.duration ||
    difficulty !== currentWorkout.difficulty ||
    JSON.stringify(focusAreas) !== JSON.stringify(currentWorkout.focusAreas || []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor} maxH="90vh">
        <ModalHeader>
          <HStack>
            <Icon as={PiGearBold} color="blue.500" />
            <Text>Modify Workout</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Current Workout Info */}
            <Card bg={currentWorkoutBg} borderColor="blue.200">
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="bold" color={textColor}>
                    Current Workout
                  </Text>
                  <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                    {currentWorkout.name}
                  </Text>
                  <HStack spacing={4} fontSize="sm" color={subtextColor}>
                    <HStack>
                      <Icon as={PiClockBold} />
                      <Text>{currentWorkout.duration} min</Text>
                    </HStack>
                    <HStack>
                      <Icon as={PiTargetBold} />
                      <Text>{currentWorkout.difficulty}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={PiLightningBold} />
                      <Text>{currentWorkout.exercises.length} exercises</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Workout Type */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold">
                Workout Type
              </FormLabel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {WORKOUT_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={workoutType === type.value ? "solid" : "outline"}
                    colorScheme={workoutType === type.value ? "blue" : "gray"}
                    size="md"
                    onClick={() => setWorkoutType(type.value as 'mixed' | 'strength' | 'cardio' | 'hiit' | 'flexibility')}
                    h="60px"
                    flexDirection="column"
                    gap={1}
                  >
                    <Text fontSize="sm" fontWeight="semibold">
                      {type.label}
                    </Text>
                    <Text fontSize="xs" color={workoutType === type.value ? "blue.100" : subtextColor}>
                      {type.description}
                    </Text>
                  </Button>
                ))}
              </SimpleGrid>
            </FormControl>

            {/* Duration */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold">
                Duration: {duration} minutes
              </FormLabel>
              <Box px={4}>
                <Slider
                  value={duration}
                  onChange={setDuration}
                  min={15}
                  max={90}
                  step={15}
                  colorScheme="blue"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
              </Box>
              <HStack justify="space-between" fontSize="xs" color={subtextColor} mt={2}>
                <Text>15 min</Text>
                <Text>30 min</Text>
                <Text>45 min</Text>
                <Text>60 min</Text>
                <Text>90 min</Text>
              </HStack>
            </FormControl>

            {/* Difficulty */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold">
                Difficulty Level
              </FormLabel>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                bg={bgColor}
                borderColor={borderColor}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </FormControl>

            {/* Focus Areas */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold">
                Focus Areas (Optional)
              </FormLabel>
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                {FOCUS_AREAS.map((area) => {
                  const isSelected = focusAreas.includes(area);
                  return (
                    <Button
                      key={area}
                      size="sm"
                      variant={isSelected ? "solid" : "outline"}
                      colorScheme={isSelected ? "blue" : "gray"}
                      onClick={() => handleFocusAreaToggle(area)}
                    >
                      {area}
                    </Button>
                  );
                })}
              </SimpleGrid>
            </FormControl>

            {/* Intensity */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold">
                Workout Intensity
              </FormLabel>
              <HStack spacing={3}>
                {(['low', 'moderate', 'high'] as const).map((level) => (
                  <Button
                    key={level}
                    flex={1}
                    variant={intensity === level ? "solid" : "outline"}
                    colorScheme={intensity === level ? "blue" : "gray"}
                    onClick={() => setIntensity(level)}
                    textTransform="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </HStack>
            </FormControl>

            {/* Changes Summary */}
            {hasChanges && (
              <Card bg={changesSummaryBg} borderColor="green.200">
                <CardBody>
                  <VStack spacing={2} align="stretch">
                    <Text fontWeight="semibold" color="green.600">
                      Changes to Apply:
                    </Text>
                    <VStack spacing={1} align="start" fontSize="sm">
                      {workoutType !== (currentWorkout.workoutType || 'mixed') && (
                        <Text color={subtextColor}>
                          • Workout type: {WORKOUT_TYPES.find(t => t.value === workoutType)?.label}
                        </Text>
                      )}
                      {duration !== currentWorkout.duration && (
                        <Text color={subtextColor}>
                          • Duration: {duration} minutes
                        </Text>
                      )}
                      {difficulty !== currentWorkout.difficulty && (
                        <Text color={subtextColor}>
                          • Difficulty: {difficulty}
                        </Text>
                      )}
                      {JSON.stringify(focusAreas) !== JSON.stringify(currentWorkout.focusAreas || []) && (
                        <Text color={subtextColor}>
                          • Focus areas: {focusAreas.join(', ') || 'None'}
                        </Text>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleApplyModifications}
              isDisabled={!hasChanges}
              leftIcon={<Icon as={PiArrowClockwiseBold} />}
            >
              Regenerate Workout
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
