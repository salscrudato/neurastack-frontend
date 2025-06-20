/**
 * Enhanced Workout History Component
 * 
 * Comprehensive workout log viewing system with detailed history,
 * exercise progression tracking, and performance analytics.
 */

import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Progress,
    SimpleGrid,
    Spacer,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    useColorModeValue,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import { format, formatDistanceToNow } from 'date-fns';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    PiArrowLeftBold,
    PiCalendarBold,
    PiChartLineBold,
    PiClockBold,
    PiMedalBold,
    PiScalesBold,
    PiTargetBold
} from 'react-icons/pi';
import type { WorkoutSessionSummary } from '../../lib/types';
import { loadWorkoutSessionHistory } from '../../services/workoutSessionService';

interface WorkoutHistoryProps {
  onBack: () => void;
  onStartNewWorkout: () => void;
}

interface WorkoutStats {
  totalWorkouts: number;
  totalTimeMinutes: number;
  averageRating: number;
  totalWeightLifted: number;
  personalRecords: number;
  averageCompletionRate: number;
  currentStreak: number;
  favoriteWorkoutType: string;
}

const WorkoutHistory = memo<WorkoutHistoryProps>(({ onBack, onStartNewWorkout }) => {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSessionSummary[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const glassBorder = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');

  // Load workout history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const history = await loadWorkoutSessionHistory(50);
        setWorkoutHistory(history);
      } catch (error) {
        console.error('Failed to load workout history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Calculate workout statistics
  const workoutStats = useMemo((): WorkoutStats => {
    if (workoutHistory.length === 0) {
      return {
        totalWorkouts: 0,
        totalTimeMinutes: 0,
        averageRating: 0,
        totalWeightLifted: 0,
        personalRecords: 0,
        averageCompletionRate: 0,
        currentStreak: 0,
        favoriteWorkoutType: 'None'
      };
    }

    const totalWorkouts = workoutHistory.length;
    const totalTimeMinutes = workoutHistory.reduce((sum, w) => sum + w.duration, 0);
    const ratingsSum = workoutHistory.reduce((sum, w) => sum + (w.overallRating || 0), 0);
    const ratingsCount = workoutHistory.filter(w => w.overallRating).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
    const totalWeightLifted = workoutHistory.reduce((sum, w) => sum + (w.totalWeightLifted || 0), 0);
    const personalRecords = workoutHistory.reduce((sum, w) => sum + w.personalRecordsAchieved, 0);
    const averageCompletionRate = workoutHistory.reduce((sum, w) => sum + w.completionRate, 0) / totalWorkouts;

    // Calculate current streak (simplified)
    let currentStreak = 0;
    const today = new Date();
    for (const workout of workoutHistory) {
      const daysDiff = Math.floor((today.getTime() - workout.date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= currentStreak + 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Find favorite workout type
    const workoutTypeCounts = workoutHistory.reduce((acc, w) => {
      acc[w.workoutType] = (acc[w.workoutType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favoriteWorkoutType = Object.entries(workoutTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mixed';

    return {
      totalWorkouts,
      totalTimeMinutes,
      averageRating,
      totalWeightLifted,
      personalRecords,
      averageCompletionRate,
      currentStreak,
      favoriteWorkoutType
    };
  }, [workoutHistory]);

  const handleWorkoutClick = useCallback((workout: WorkoutSessionSummary) => {
    setSelectedWorkout(workout);
    onOpen();
  }, [onOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'completed_early': return 'blue';
      case 'abandoned': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'completed_early': return 'Finished Early';
      case 'abandoned': return 'Stopped';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Box h="100%" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Icon as={PiClockBold} boxSize={12} color="blue.400" />
          <Text color={subtextColor}>Loading workout history...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      h="100%"
      bgGradient="linear(135deg, #f7fafc 0%, #edf2f7 100%)"
      overflow="auto"
      position="relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <VStack spacing={4} p={4} maxW="4xl" mx="auto" h="100%" justify="flex-start">
        {/* Header */}
        <VStack spacing={2} textAlign="center" w="100%" py={2}>
          <HStack w="100%" justify="space-between" align="center">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Icon as={PiArrowLeftBold} />}
              onClick={onBack}
              color="gray.600"
              _hover={{ bg: "gray.100" }}
            >
              Back
            </Button>
            <Spacer />
          </HStack>
          <Text fontSize="xl" fontWeight="bold" color="gray.700">
            Workout History
          </Text>
          <Text fontSize="sm" color={subtextColor}>
            Your fitness journey at a glance
          </Text>
        </VStack>

        {/* Statistics Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} w="100%">
          <Card bg={cardBg} backdropFilter="blur(10px)" border="1px solid" borderColor={glassBorder} borderRadius="xl">
            <CardBody p={3} textAlign="center">
              <VStack spacing={1}>
                <Icon as={PiTargetBold} boxSize={5} color="blue.400" />
                <Text fontSize="lg" fontWeight="bold" color="blue.500">
                  {workoutStats.totalWorkouts}
                </Text>
                <Text fontSize="xs" color={subtextColor}>workouts</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} backdropFilter="blur(10px)" border="1px solid" borderColor={glassBorder} borderRadius="xl">
            <CardBody p={3} textAlign="center">
              <VStack spacing={1}>
                <Icon as={PiClockBold} boxSize={5} color="green.400" />
                <Text fontSize="lg" fontWeight="bold" color="green.500">
                  {Math.round(workoutStats.totalTimeMinutes / 60)}h
                </Text>
                <Text fontSize="xs" color={subtextColor}>total time</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} backdropFilter="blur(10px)" border="1px solid" borderColor={glassBorder} borderRadius="xl">
            <CardBody p={3} textAlign="center">
              <VStack spacing={1}>
                <Icon as={PiScalesBold} boxSize={5} color="purple.400" />
                <Text fontSize="lg" fontWeight="bold" color="purple.500">
                  {Math.round(workoutStats.totalWeightLifted)}
                </Text>
                <Text fontSize="xs" color={subtextColor}>lbs lifted</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} backdropFilter="blur(10px)" border="1px solid" borderColor={glassBorder} borderRadius="xl">
            <CardBody p={3} textAlign="center">
              <VStack spacing={1}>
                <Icon as={PiMedalBold} boxSize={5} color="orange.400" />
                <Text fontSize="lg" fontWeight="bold" color="orange.500">
                  {workoutStats.personalRecords}
                </Text>
                <Text fontSize="xs" color={subtextColor}>PRs</Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Workout List */}
        <VStack spacing={3} w="100%" align="stretch">
          <Text fontSize="md" fontWeight="semibold" color={textColor}>
            Recent Workouts
          </Text>
          
          {workoutHistory.length === 0 ? (
            <Card bg={cardBg} backdropFilter="blur(10px)" border="1px solid" borderColor={glassBorder} borderRadius="xl">
              <CardBody p={6} textAlign="center">
                <VStack spacing={4}>
                  <Icon as={PiChartLineBold} boxSize={12} color="gray.400" />
                  <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                    No workouts yet
                  </Text>
                  <Text fontSize="sm" color={subtextColor}>
                    Complete your first workout to see it here
                  </Text>
                  <Button
                    colorScheme="blue"
                    onClick={onStartNewWorkout}
                    leftIcon={<Icon as={PiTargetBold} />}
                  >
                    Start First Workout
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            workoutHistory.map((workout) => (
              <Card
                key={workout.id}
                bg={cardBg}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor={glassBorder}
                borderRadius="xl"
                cursor="pointer"
                onClick={() => handleWorkoutClick(workout)}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                }}
                transition="all 0.3s ease"
              >
                <CardBody p={4}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack spacing={2}>
                        <Text fontSize="md" fontWeight="semibold" color={textColor}>
                          {workout.workoutName}
                        </Text>
                        <Badge colorScheme={getStatusColor(workout.status)} variant="subtle">
                          {getStatusText(workout.status)}
                        </Badge>
                      </HStack>
                      
                      <HStack spacing={4} fontSize="sm" color={subtextColor}>
                        <HStack spacing={1}>
                          <Icon as={PiCalendarBold} boxSize={3} />
                          <Text>{format(workout.date, 'MMM d, yyyy')}</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={PiClockBold} boxSize={3} />
                          <Text>{workout.duration}min</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={PiTargetBold} boxSize={3} />
                          <Text>{workout.exercisesCompleted}/{workout.totalExercises}</Text>
                        </HStack>
                      </HStack>
                      
                      <Progress
                        value={workout.completionRate}
                        size="sm"
                        colorScheme="blue"
                        borderRadius="full"
                        w="100%"
                      />
                    </VStack>
                    
                    <VStack spacing={1} align="end" minW="60px">
                      {workout.overallRating && (
                        <HStack spacing={1}>
                          <Text fontSize="sm" fontWeight="bold" color="orange.500">
                            {workout.overallRating.toFixed(1)}
                          </Text>
                          <Text fontSize="xs" color={subtextColor}>★</Text>
                        </HStack>
                      )}
                      {workout.personalRecordsAchieved > 0 && (
                        <Badge colorScheme="orange" variant="solid" fontSize="xs">
                          {workout.personalRecordsAchieved} PR
                        </Badge>
                      )}
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))
          )}
        </VStack>
      </VStack>

      {/* Workout Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedWorkout?.workoutName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedWorkout && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel>Duration</StatLabel>
                    <StatNumber>{selectedWorkout.duration} min</StatNumber>
                    <StatHelpText>
                      {formatDistanceToNow(selectedWorkout.date, { addSuffix: true })}
                    </StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Completion</StatLabel>
                    <StatNumber>{Math.round(selectedWorkout.completionRate)}%</StatNumber>
                    <StatHelpText>
                      {selectedWorkout.exercisesCompleted} of {selectedWorkout.totalExercises} exercises
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Divider />

                <SimpleGrid columns={2} spacing={4}>
                  {selectedWorkout.totalWeightLifted && (
                    <Stat>
                      <StatLabel>Weight Lifted</StatLabel>
                      <StatNumber>{Math.round(selectedWorkout.totalWeightLifted)} lbs</StatNumber>
                    </Stat>
                  )}
                  
                  {selectedWorkout.averageRPE && (
                    <Stat>
                      <StatLabel>Average RPE</StatLabel>
                      <StatNumber>{selectedWorkout.averageRPE.toFixed(1)}/10</StatNumber>
                    </Stat>
                  )}
                </SimpleGrid>

                {selectedWorkout.personalRecordsAchieved > 0 && (
                  <>
                    <Divider />
                    <HStack justify="center">
                      <Icon as={PiMedalBold} color="orange.500" boxSize={6} />
                      <Text fontSize="lg" fontWeight="bold" color="orange.500">
                        {selectedWorkout.personalRecordsAchieved} Personal Record{selectedWorkout.personalRecordsAchieved > 1 ? 's' : ''} Achieved!
                      </Text>
                    </HStack>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
});

WorkoutHistory.displayName = 'WorkoutHistory';

export default WorkoutHistory;
