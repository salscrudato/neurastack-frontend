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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  PiTargetBold,
  PiTrophyBold,
  PiPlayBold,
  PiPersonBold,
} from 'react-icons/pi';
import { useFitnessStore } from '../../store/useFitnessStore';

interface DashboardProps {
  onStartWorkout: () => void;
  onEditProfile: () => void;
  onViewProgress: () => void;
}

export default function Dashboard({ onStartWorkout, onEditProfile, onViewProgress }: DashboardProps) {
  const { profile } = useFitnessStore();
  
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const totalMinutesPerWeek = profile.timeAvailability.daysPerWeek * profile.timeAvailability.minutesPerSession;

  const getGoalLabels = (goals: string[]) => {
    const goalMap: Record<string, string> = {
      'lose_weight': 'Lose Weight',
      'build_muscle': 'Build Muscle',
      'improve_cardio': 'Improve Cardio',
      'increase_flexibility': 'Increase Flexibility',
      'general_fitness': 'General Fitness',
      'athletic_performance': 'Athletic Performance',
    };
    return goals.map(goal => goalMap[goal] || goal);
  };

  const getEquipmentLabels = (equipment: string[]) => {
    const equipmentMap: Record<string, string> = {
      'none': 'No Equipment',
      'dumbbells': 'Dumbbells',
      'resistance_bands': 'Resistance Bands',
      'yoga_mat': 'Yoga Mat',
      'cardio_machine': 'Cardio Machine',
      'kettlebell': 'Kettlebell',
    };
    return equipment.map(eq => equipmentMap[eq] || eq);
  };

  return (
    <Box
      h="100%"
      bg={bgColor}
      overflow={{ base: "auto", md: "auto" }}
      position="relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <VStack spacing={6} p={{ base: 4, md: 6 }} maxW="4xl" mx="auto" minH="100%">
        {/* Welcome header */}
        <VStack spacing={2} textAlign="center" w="100%">
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            neurafit
          </Text>
          <Text fontSize="md" color={subtextColor}>
            Where your personalized fitness journey begins.
          </Text>
        </VStack>

        {/* Quick stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="100%">
          <Card bg={cardBg}>
            <CardBody textAlign="center" py={4}>
              <Stat>
                <StatLabel fontSize="xs" color={subtextColor}>Fitness Level</StatLabel>
                <StatNumber fontSize="lg" color="blue.500">
                  {profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody textAlign="center" py={4}>
              <Stat>
                <StatLabel fontSize="xs" color={subtextColor}>Goals</StatLabel>
                <StatNumber fontSize="lg" color="green.500">
                  {profile.goals.length}
                </StatNumber>
                <StatHelpText fontSize="xs">selected</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody textAlign="center" py={4}>
              <Stat>
                <StatLabel fontSize="xs" color={subtextColor}>Weekly Time</StatLabel>
                <StatNumber fontSize="lg" color="purple.500">
                  {totalMinutesPerWeek}
                </StatNumber>
                <StatHelpText fontSize="xs">minutes</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody textAlign="center" py={4}>
              <Stat>
                <StatLabel fontSize="xs" color={subtextColor}>Equipment</StatLabel>
                <StatNumber fontSize="lg" color="orange.500">
                  {profile.equipment.length}
                </StatNumber>
                <StatHelpText fontSize="xs">items</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Profile summary */}
        <Card bg={cardBg} w="100%">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                  Your Profile
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={PiPersonBold} />}
                  onClick={onEditProfile}
                >
                  Edit
                </Button>
              </HStack>

              <VStack spacing={3} align="stretch">
                {/* Goals */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
                    <Icon as={PiTargetBold} mr={2} />
                    Fitness Goals
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {getGoalLabels(profile.goals).map((goal, index) => (
                      <Badge key={index} colorScheme="blue" variant="subtle">
                        {goal}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                {/* Equipment */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
                    <Icon as={PiTrophyBold} mr={2} />
                    Available Equipment
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {getEquipmentLabels(profile.equipment).map((equipment, index) => (
                      <Badge key={index} colorScheme="green" variant="subtle">
                        {equipment}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                {/* Schedule */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
                    <Icon as={PiTargetBold} mr={2} />
                    Workout Schedule
                  </Text>
                  <Text fontSize="sm" color={subtextColor}>
                    {profile.timeAvailability.daysPerWeek} days per week, {profile.timeAvailability.minutesPerSession} minutes per session
                  </Text>
                </Box>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Action buttons */}
        <VStack spacing={4} w="100%">
          <Button
            colorScheme="blue"
            size="lg"
            w="100%"
            leftIcon={<Icon as={PiPlayBold} />}
            onClick={onStartWorkout}
            py={6}
          >
            Generate AI Workout
          </Button>

          <HStack spacing={3} w="100%">
            <Button
              variant="outline"
              colorScheme="blue"
              size="md"
              flex={1}
              leftIcon={<Icon as={PiTrophyBold} />}
              onClick={onViewProgress}
            >
              View Progress
            </Button>

            <Button
              variant="outline"
              colorScheme="gray"
              size="md"
              flex={1}
              leftIcon={<Icon as={PiPersonBold} />}
              onClick={onEditProfile}
            >
              Edit Profile
            </Button>
          </HStack>

          <Text fontSize="sm" color={subtextColor} textAlign="center">
            AI-powered workouts tailored to your fitness level and goals.
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}
