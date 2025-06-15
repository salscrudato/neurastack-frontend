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

  // Calculate total weekly time commitment
  const totalMinutesPerWeek = (profile.timeAvailability?.daysPerWeek || 0) * (profile.timeAvailability?.minutesPerSession || 0);

  // Helper function to format fitness level
  const formatFitnessLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  // Helper function to format goal codes
  const formatGoalCode = (code: string) => {
    const goalMap: Record<string, string> = {
      'LW': 'Lose Weight',
      'BM': 'Build Muscle',
      'IC': 'Improve Cardio',
      'IF': 'Improve Flexibility',
      'GF': 'General Fitness',
      'AP': 'Athletic Performance'
    };
    return goalMap[code] || code;
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
        {/* Welcome header - Mobile Optimized */}
        <VStack spacing={2} textAlign="center" w="100%" py={2}>
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            bgGradient="linear(to-r, blue.400, purple.500)"
            bgClip="text"
            letterSpacing="tight"
          >
            neurafit
          </Text>
          <Text fontSize={{ base: "sm", md: "md" }} color={subtextColor}>
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
                  {formatFitnessLevel(profile.fitnessLevel)}
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
                    {/* Display short codes and use title attribute for full label tooltip */}
                    {profile.goals.map((goalCode, index) => (
                      <Badge
                        key={index}
                        colorScheme="blue"
                        variant="subtle"
                        title={formatGoalCode(goalCode)}
                      >
                        {goalCode}
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
                    {/* Display short codes and use title attribute for full label tooltip */}
                    {profile.equipment.map((equipmentCode, index) => (
                      <Badge
                        key={index}
                        colorScheme="green"
                        variant="subtle"
                        title={equipmentCode}
                      >
                        {equipmentCode}
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
                    {profile.timeAvailability?.daysPerWeek || 0} days per week, {profile.timeAvailability?.minutesPerSession || 0} minutes per session
                  </Text>
                </Box>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Action buttons - Mobile Optimized */}
        <VStack spacing={4} w="100%">
          <Button
            colorScheme="blue"
            size={{ base: "md", md: "lg" }}
            w="100%"
            leftIcon={<Icon as={PiPlayBold} />}
            onClick={onStartWorkout}
            py={{ base: 4, md: 6 }}
            fontSize={{ base: "md", md: "lg" }}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "lg",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            transition="all 0.2s"
          >
            Generate AI Workout
          </Button>

          <HStack spacing={3} w="100%">
            <Button
              variant="outline"
              colorScheme="blue"
              size={{ base: "sm", md: "md" }}
              flex={1}
              leftIcon={<Icon as={PiTrophyBold} />}
              onClick={onViewProgress}
              fontSize={{ base: "sm", md: "md" }}
            >
              View Progress
            </Button>

            <Button
              variant="outline"
              colorScheme="gray"
              size={{ base: "sm", md: "md" }}
              flex={1}
              leftIcon={<Icon as={PiPersonBold} />}
              onClick={onEditProfile}
              fontSize={{ base: "sm", md: "md" }}
            >
              Edit Profile
            </Button>
          </HStack>

          <Text fontSize={{ base: "xs", md: "sm" }} color={subtextColor} textAlign="center" px={2}>
            AI-powered workouts tailored to your fitness level and goals.
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}
