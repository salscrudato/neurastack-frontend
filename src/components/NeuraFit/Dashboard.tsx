import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Icon,

  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import {
  PiPlayBold,
  PiPersonBold,
  PiTrophyBold,
} from 'react-icons/pi';
import { useFitnessStore } from '../../store/useFitnessStore';

interface DashboardProps {
  onStartWorkout: () => void;
  onEditProfile: () => void;
  onViewProgress: () => void;
  onEditSpecificSetting?: (step: number) => void;
}

export default function Dashboard({ onStartWorkout, onEditProfile, onViewProgress, onEditSpecificSetting }: DashboardProps) {
  const { profile } = useFitnessStore();


  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Calculate total weekly time commitment
  const totalMinutesPerWeek = (profile.timeAvailability?.daysPerWeek || 0) * (profile.timeAvailability?.minutesPerSession || 0);

  // Helper function to format fitness level
  const formatFitnessLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
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
        {/* Welcome message with gradient text styling */}
        <VStack spacing={2} textAlign="center" w="100%" py={2}>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            bgGradient="linear(to-r, blue.400, purple.500)"
            bgClip="text"
            fontWeight="medium"
          >
            Where your personalized fitness journey begins.
          </Text>
        </VStack>

        {/* Quick stats - Clickable to edit specific settings */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="100%">
          <Card
            bg={cardBg}
            as="button"
            onClick={() => onEditSpecificSetting?.(0)}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              bg: "blue.50"
            }}
            _active={{
              transform: "translateY(0)"
            }}
          >
            <CardBody textAlign="center" py={4}>
              <Stat>
                <StatLabel fontSize="xs" color={subtextColor}>Fitness Level</StatLabel>
                <StatNumber fontSize="lg" color="blue.500">
                  {formatFitnessLevel(profile.fitnessLevel)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card
            bg={cardBg}
            as="button"
            onClick={() => onEditSpecificSetting?.(1)}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              bg: "green.50"
            }}
            _active={{
              transform: "translateY(0)"
            }}
          >
            <CardBody textAlign="center" py={4}>
              <Stat>
                <StatLabel fontSize="xs" color={subtextColor}>Goals</StatLabel>
                <StatNumber fontSize="lg" color="green.500">
                  {profile.goals.length}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card
            bg={cardBg}
            as="button"
            onClick={() => onEditSpecificSetting?.(3)}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              bg: "purple.50"
            }}
            _active={{
              transform: "translateY(0)"
            }}
          >
            <CardBody textAlign="center" py={4}>
              <Stat>
                <StatLabel fontSize="xs" color={subtextColor}>Weekly Time</StatLabel>
                <StatNumber fontSize="lg" color="purple.500">
                  {totalMinutesPerWeek}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card
            bg={cardBg}
            as="button"
            onClick={() => onEditSpecificSetting?.(2)}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              bg: "orange.50"
            }}
            _active={{
              transform: "translateY(0)"
            }}
          >
            <CardBody textAlign="center" py={4}>
              <Stat>
                <StatLabel fontSize="xs" color={subtextColor}>Equipment</StatLabel>
                <StatNumber fontSize="lg" color="orange.500">
                  {profile.equipment.length}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>



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
