// Feedback strings for weekly time commitment, used for the summary box below
const TIME_COMMITMENT_FEEDBACK = [
  {
    min: 0,
    max: 89,
    text: "Perfect for beginners - start small and build consistency!",
  },
  {
    min: 90,
    max: 179,
    text: "Great balance - ideal for steady progress!",
  },
  {
    min: 180,
    max: 299,
    text: "Excellent commitment - you'll see great results!",
  },
  {
    min: 300,
    max: Infinity,
    text: "Impressive dedication - perfect for serious fitness goals!",
  },
];

// Helper to select feedback string based on total minutes per week
function getTimeCommitmentFeedback(totalMinutes: number) {
  return (
    TIME_COMMITMENT_FEEDBACK.find(
      (range) => totalMinutes >= range.min && totalMinutes <= range.max
    )?.text || ""
  );
}
import {
    Badge,
    Box,
    FormControl,
    FormLabel,
    HStack,
    Slider,
    SliderFilledTrack,
    SliderMark,
    SliderThumb,
    SliderTrack,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { useFitnessStore } from '../../store/useFitnessStore';
import NavigationButtons from './NavigationButtons';

interface TimeStepProps {
  onNext: () => void;
  onPrev: () => void;
  isEditingFromDashboard?: boolean;
}

// Refactored: Flattened time availability state in profile, added accessibility & test attributes, and centralized feedback strings.
export default function TimeStep({ onNext, onPrev, isEditingFromDashboard = false }: TimeStepProps) {
  // Use flat keys for time availability in the profile
  const { profile, updateProfile, completeOnboarding } = useFitnessStore();

  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Update timeAvailability in profile
  const handleDaysChange = (days: number) => {
    updateProfile({
      timeAvailability: {
        ...profile.timeAvailability,
        daysPerWeek: days,
        minutesPerSession: profile.timeAvailability?.minutesPerSession || 30
      }
    });
  };

  // Update timeAvailability in profile
  const handleMinutesChange = (minutes: number) => {
    updateProfile({
      timeAvailability: {
        ...profile.timeAvailability,
        daysPerWeek: profile.timeAvailability?.daysPerWeek || 3,
        minutesPerSession: minutes
      }
    });
  };

  // Fire analytics event on completion (placeholder)
  const handleComplete = () => {
    // Fire analytics event with selected values
    const daysPerWeek = profile.timeAvailability?.daysPerWeek || 0;
    const minutesPerSession = profile.timeAvailability?.minutesPerSession || 0;
    console.log(`Time step completed: ${daysPerWeek} days, ${minutesPerSession} minutes`);

    // Only complete onboarding if this is the initial setup, not editing
    if (!isEditingFromDashboard) {
      completeOnboarding();
    }
    onNext();
  };

  // Calculate total time commitment using timeAvailability
  const totalMinutesPerWeek =
    (profile.timeAvailability?.daysPerWeek || 0) * (profile.timeAvailability?.minutesPerSession || 0);

  // Get feedback string for current selection
  const feedback = getTimeCommitmentFeedback(totalMinutesPerWeek);

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Header */}
      <VStack spacing={2} textAlign="center" mb={2}>
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
          How much time can you commit?
        </Text>
        <Text
          fontSize={{ base: "sm", md: "md" }}
          color={subtextColor}
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          fontWeight="medium"
        >
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
            {profile.timeAvailability?.daysPerWeek || 0} days × {profile.timeAvailability?.minutesPerSession || 0} minutes
          </Badge>
        </VStack>
      </Box>

      {/* Days per week slider */}
      <FormControl>
        <FormLabel color={textColor} mb={4}>
          <HStack justify="space-between">
            <Text>Days per week</Text>
            <Badge colorScheme="blue">{profile.timeAvailability?.daysPerWeek || 1} days</Badge>
          </HStack>
        </FormLabel>
        <Box px={4}>
          <Slider
            value={profile.timeAvailability?.daysPerWeek || 1}
            onChange={handleDaysChange}
            min={1}
            max={7}
            step={1}
            colorScheme="blue"
            aria-valuenow={profile.timeAvailability?.daysPerWeek || 1}
            aria-valuetext={`${profile.timeAvailability?.daysPerWeek || 1} days`}
            data-cy="days-slider"
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
            <Badge colorScheme="green">{profile.timeAvailability?.minutesPerSession || 30} min</Badge>
          </HStack>
        </FormLabel>
        <Box px={4}>
          <Slider
            value={profile.timeAvailability?.minutesPerSession || 30}
            onChange={handleMinutesChange}
            min={15}
            max={90}
            step={15}
            colorScheme="green"
            aria-valuenow={profile.timeAvailability?.minutesPerSession || 30}
            aria-valuetext={`${profile.timeAvailability?.minutesPerSession || 30} minutes`}
            data-cy="minutes-slider"
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
          {feedback}
        </Text>
      </Box>

      {/* Navigation buttons */}
      <NavigationButtons
        onBack={onPrev}
        onNext={handleComplete}
        nextLabel={isEditingFromDashboard ? "Save" : "Complete Setup"}
        backLabel={isEditingFromDashboard ? "Back to Dashboard" : "Back"}
      />
    </VStack>
  );
}
