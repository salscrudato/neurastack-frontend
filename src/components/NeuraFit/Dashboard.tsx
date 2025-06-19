import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    HStack,
    Icon,
    Progress,
    SimpleGrid,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import {
    PiHeartBold,
    PiPlayBold,
    PiTrophyBold
} from 'react-icons/pi';
import { useFitnessStore } from '../../store/useFitnessStore';

interface DashboardProps {
  onStartWorkout: () => void;
  onViewProgress: () => void;
  onEditSpecificSetting?: (step: number) => void;
}

export default function Dashboard({ onStartWorkout, onViewProgress, onEditSpecificSetting }: DashboardProps) {
  const { profile, workoutPlans } = useFitnessStore();

  const subtextColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const bgColor = useColorModeValue('linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)', 'gray.900');
  const glassBorder = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');

  // Calculate total weekly time commitment
  const totalMinutesPerWeek = (profile.timeAvailability?.daysPerWeek || 0) * (profile.timeAvailability?.minutesPerSession || 0);

  // Calculate current week's progress
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const thisWeekWorkouts = workoutPlans.filter(w => {
    if (!w.completedAt) return false;
    const workoutDate = new Date(w.completedAt);
    return workoutDate >= startOfWeek;
  }).length;

  const weeklyGoal = profile.timeAvailability?.daysPerWeek || 3;
  const weeklyProgress = Math.min((thisWeekWorkouts / weeklyGoal) * 100, 100);

  // Helper function to format fitness level
  const formatFitnessLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };



  // Get current time for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Box
      h="100%"
      bgGradient={bgColor}
      overflow={{ base: "auto", md: "auto" }}
      position="relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <VStack spacing={5} p={{ base: 4, md: 6 }} maxW="4xl" mx="auto" minH="100%">
        {/* Personalized Hero Section */}
        <VStack spacing={3} textAlign="center" w="100%" py={{ base: 3, md: 4 }}>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="medium"
            color="gray.600"
          >
            {getGreeting()}. Your AI-powered workout is waiting.
          </Text>
        </VStack>

        {/* Simplified Stats Overview */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2} w="100%">
          {/* This Week Progress - Featured */}
          <Card
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={glassBorder}
            borderRadius="2xl"
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }}
          >
            <CardBody p={5}>
              <VStack spacing={1} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color={subtextColor}>
                    This Week
                  </Text>
                  <Badge
                    colorScheme={weeklyProgress >= 100 ? "green" : weeklyProgress >= 50 ? "blue" : "orange"}
                    variant="subtle"
                    borderRadius="full"
                    px={5}
                  >
                    {Math.round(weeklyProgress)}%
                  </Badge>
                </HStack>
                <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                  {thisWeekWorkouts}/{weeklyGoal}
                </Text>
                <Progress
                  value={weeklyProgress}
                  size="md"
                  colorScheme={weeklyProgress >= 100 ? "green" : weeklyProgress >= 50 ? "blue" : "orange"}
                  borderRadius="full"
                  bg="gray.100"
                />
                <Text fontSize="xs" color={subtextColor}>
                  {weeklyProgress >= 100 ? "Goal achieved!" : `${weeklyGoal - thisWeekWorkouts} workouts to go`}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Weekly Commitment */}
          <Card
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={glassBorder}
            borderRadius="2xl"
            as="button"
            onClick={() => onEditSpecificSetting?.(5)}
            cursor="pointer"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }}
          >
            <CardBody p={5} textAlign="center">
              <VStack spacing={1}>
                <Icon as={PiHeartBold} boxSize={6} color="purple.400" />
                <Text fontSize="xl" fontWeight="bold" color="purple.500">
                  {totalMinutesPerWeek}
                </Text>
                <Text fontSize="sm" color={subtextColor}>
                  minutes per week
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Profile Customization Grid */}
        <VStack spacing={4} w="100%" maxW="600px">
          <Text fontSize="md" fontWeight="semibold" color="gray.700" textAlign="center">
            Customize Your Profile
          </Text>
          <SimpleGrid columns={2} spacing={4} w="100%">
            {/* Fitness Level */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(0)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={4} textAlign="center">
                <VStack spacing={2}>
                  <Icon as={PiTrophyBold} boxSize={5} color="blue.400" />
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Fitness Level
                  </Text>
                  <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2} fontSize="xs">
                    {formatFitnessLevel(profile.fitnessLevel)}
                  </Badge>
                </VStack>
              </CardBody>
            </Card>

            {/* Goals */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(1)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={4} textAlign="center">
                <VStack spacing={2}>
                  <Icon as={PiHeartBold} boxSize={5} color="green.400" />
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Goals
                  </Text>
                  <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2} fontSize="xs">
                    {profile.goals?.length || 0} selected
                  </Badge>
                </VStack>
              </CardBody>
            </Card>

            {/* Equipment */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(2)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={4} textAlign="center">
                <VStack spacing={2}>
                  <Icon as={PiHeartBold} boxSize={5} color="orange.400" />
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Equipment
                  </Text>
                  <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2} fontSize="xs">
                    {profile.equipment.length} items
                  </Badge>
                </VStack>
              </CardBody>
            </Card>

            {/* Personal Info */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(3)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={4} textAlign="center">
                <VStack spacing={2}>
                  <Icon as={PiHeartBold} boxSize={5} color="teal.400" />
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Personal Info
                  </Text>
                  <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2} fontSize="xs">
                    {profile.age ? `${profile.age} years` : 'Not set'}
                  </Badge>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>



        {/* Primary Action Button */}
        <VStack spacing={4} w="100%">
          <Button
            size="lg"
            w="100%"
            maxW="400px"
            h={{ base: "60px", md: "65px" }}
            leftIcon={<Icon as={PiPlayBold} boxSize={{ base: 6, md: 6 }} />}
            onClick={onStartWorkout}
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            borderRadius="2xl"
            bgGradient="linear(135deg, blue.400 0%, purple.500 100%)"
            color="white"
            border="none"
            boxShadow="0 8px 25px rgba(66, 153, 225, 0.3)"
            _hover={{
              bgGradient: "linear(135deg, blue.500 0%, purple.600 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 12px 35px rgba(66, 153, 225, 0.4)"
            }}
            _active={{
              transform: "translateY(-1px)"
            }}
            transition="all 0.3s ease"
          >
            Generate AI Workout
          </Button>

          {/* Secondary Actions */}
          <Button
            variant="ghost"
            colorScheme="blue"
            size="md"
            w="100%"
            maxW="400px"
            h="50px"
            leftIcon={<Icon as={PiTrophyBold} boxSize={5} />}
            onClick={onViewProgress}
            fontSize="md"
            fontWeight="medium"
            borderRadius="xl"
            _hover={{
              bg: "blue.50",
              transform: "translateY(-1px)",
            }}
            transition="all 0.2s ease"
          >
            View Progress & Analytics
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
