import {
  Box,
  VStack,
  Text,
  Button,
  useColorModeValue,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  FormControl,
  FormLabel,
  Badge,
} from '@chakra-ui/react';
import { useFitnessStore } from '../../store/useFitnessStore';

interface TimeStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function TimeStep({ onNext, onPrev }: TimeStepProps) {
  const { profile, updateProfile, completeOnboarding } = useFitnessStore();
  
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleDaysChange = (days: number) => {
    updateProfile({
      timeAvailability: {
        ...profile.timeAvailability,
        daysPerWeek: days
      }
    });
  };

  const handleMinutesChange = (minutes: number) => {
    updateProfile({
      timeAvailability: {
        ...profile.timeAvailability,
        minutesPerSession: minutes
      }
    });
  };

  const handleComplete = () => {
    completeOnboarding();
    onNext();
  };

  const totalMinutesPerWeek = profile.timeAvailability.daysPerWeek * profile.timeAvailability.minutesPerSession;

  return (
    <VStack spacing={8} align="stretch" w="100%">
      {/* Header */}
      <VStack spacing={2} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          How much time can you commit?
        </Text>
        <Text fontSize="md" color={subtextColor}>
          Set your weekly workout schedule
        </Text>
      </VStack>

      {/* Time commitment summary */}
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={6}
        textAlign="center"
      >
        <VStack spacing={2}>
          <Text fontSize="3xl" fontWeight="bold" color="blue.500">
            {totalMinutesPerWeek}
          </Text>
          <Text fontSize="sm" color={subtextColor}>
            minutes per week
          </Text>
          <Badge colorScheme="blue" variant="subtle">
            {profile.timeAvailability.daysPerWeek} days × {profile.timeAvailability.minutesPerSession} minutes
          </Badge>
        </VStack>
      </Box>

      {/* Days per week slider */}
      <FormControl>
        <FormLabel color={textColor} mb={4}>
          <HStack justify="space-between">
            <Text>Days per week</Text>
            <Badge colorScheme="blue">{profile.timeAvailability.daysPerWeek} days</Badge>
          </HStack>
        </FormLabel>
        <Box px={4}>
          <Slider
            value={profile.timeAvailability.daysPerWeek}
            onChange={handleDaysChange}
            min={1}
            max={7}
            step={1}
            colorScheme="blue"
          >
            <SliderMark value={1} mt={2} ml={-2} fontSize="xs" color={subtextColor}>
              1
            </SliderMark>
            <SliderMark value={3} mt={2} ml={-2} fontSize="xs" color={subtextColor}>
              3
            </SliderMark>
            <SliderMark value={5} mt={2} ml={-2} fontSize="xs" color={subtextColor}>
              5
            </SliderMark>
            <SliderMark value={7} mt={2} ml={-2} fontSize="xs" color={subtextColor}>
              7
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Box>
      </FormControl>

      {/* Minutes per session slider */}
      <FormControl>
        <FormLabel color={textColor} mb={4}>
          <HStack justify="space-between">
            <Text>Minutes per session</Text>
            <Badge colorScheme="green">{profile.timeAvailability.minutesPerSession} min</Badge>
          </HStack>
        </FormLabel>
        <Box px={4}>
          <Slider
            value={profile.timeAvailability.minutesPerSession}
            onChange={handleMinutesChange}
            min={15}
            max={90}
            step={15}
            colorScheme="green"
          >
            <SliderMark value={15} mt={2} ml={-2} fontSize="xs" color={subtextColor}>
              15
            </SliderMark>
            <SliderMark value={30} mt={2} ml={-2} fontSize="xs" color={subtextColor}>
              30
            </SliderMark>
            <SliderMark value={60} mt={2} ml={-2} fontSize="xs" color={subtextColor}>
              60
            </SliderMark>
            <SliderMark value={90} mt={2} ml={-2} fontSize="xs" color={subtextColor}>
              90
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Box>
      </FormControl>

      {/* Workout intensity indicator */}
      <Box
        bg={useColorModeValue('blue.50', 'blue.900')}
        border="1px solid"
        borderColor={useColorModeValue('blue.200', 'blue.700')}
        borderRadius="lg"
        p={4}
      >
        <Text fontSize="sm" color={useColorModeValue('blue.800', 'blue.200')} textAlign="center">
          {totalMinutesPerWeek < 90 && "Perfect for beginners - start small and build consistency!"}
          {totalMinutesPerWeek >= 90 && totalMinutesPerWeek < 180 && "Great balance - ideal for steady progress!"}
          {totalMinutesPerWeek >= 180 && totalMinutesPerWeek < 300 && "Excellent commitment - you'll see great results!"}
          {totalMinutesPerWeek >= 300 && "Impressive dedication - perfect for serious fitness goals!"}
        </Text>
      </Box>

      {/* Navigation buttons */}
      <HStack spacing={4} justify="space-between" pt={4}>
        <Button
          variant="outline"
          onClick={onPrev}
          size="lg"
          flex={1}
        >
          Back
        </Button>
        <Button
          colorScheme="blue"
          onClick={handleComplete}
          size="lg"
          flex={1}
        >
          Complete Setup
        </Button>
      </HStack>
    </VStack>
  );
}
