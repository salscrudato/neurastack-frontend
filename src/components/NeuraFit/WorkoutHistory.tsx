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
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack
} from '@chakra-ui/react';
import { format, formatDistanceToNow } from 'date-fns';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    PiArrowLeftBold,
    PiChartLineBold,
    PiClockBold,
    PiMedalBold,
    PiScalesBold,
    PiStarFill,
    PiTargetBold
} from 'react-icons/pi';
import { neuraStackClient } from '../../lib/neurastack-client';
import type { WorkoutSessionSummary } from '../../lib/types';
import { useAuthStore } from '../../store/useAuthStore';

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
  const { user } = useAuthStore();
  const toast = useToast();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSessionSummary[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const subtextColor = useColorModeValue('gray.600', 'gray.300');

  // Load workout history from new API
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // setError(null);

        // Add a small delay to ensure backend has processed any recent completions
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Call new workout history API with proper filtering parameters
        const response = await neuraStackClient.getWorkoutHistory({
          limit: 50,
          userId: user.uid,
          includeDetails: true,  // Include detailed workout information
          includeIncomplete: false  // Only show completed workouts in history
        });

        // CRITICAL DEBUG: Log workout history response
        console.group('🆔 WORKOUT ID FLOW - History Response');
        console.log('📥 History Response:', JSON.stringify(response, null, 2));
        if (response.data?.workouts) {
          console.log('📊 Workout IDs in History:', response.data.workouts.map(w => ({
            id: w.workoutId,
            type: w.type,
            completed: w.completed,
            date: w.date
          })));
        }
        console.groupEnd();

        if (response.status === 'success' && response.data) {
          // Transform API response to WorkoutSessionSummary format
          const transformedHistory: WorkoutSessionSummary[] = response.data.workouts
            .filter((workout: any) => workout.completed) // Extra filter to ensure only completed workouts
            .map((workout: any) => ({
              id: workout.workoutId || workout.id,
              workoutName: workout.type || workout.workoutType,
              date: new Date(workout.date || workout.completedAt),
              duration: workout.duration,
              exercisesCompleted: workout.exercises?.filter((ex: any) => ex.completed).length || 0,
              totalExercises: workout.exercises?.length || 0,
              completionRate: workout.completionPercentage || (workout.exercises?.length > 0 ? (workout.exercises.filter((ex: any) => ex.completed).length / workout.exercises.length) * 100 : 0),
              totalWeightLifted: 0, // Could be calculated from exercise data if needed
              averageRPE: undefined,
              overallRating: workout.rating,
              workoutType: workout.type || workout.workoutType,
              status: 'completed' as 'completed' | 'abandoned' | 'completed_early', // Only completed workouts now
              personalRecordsAchieved: 0 // Could be enhanced based on exercise data
            }));

          setWorkoutHistory(transformedHistory);
          // setError(null);
        } else {
          const errorMessage = response.message || 'Failed to load workout history';
          console.warn('Failed to load workout history:', errorMessage);
          // setError(errorMessage);
          setWorkoutHistory([]);

          toast({
            title: 'Unable to Load History',
            description: 'Your workout history could not be loaded. Please try again.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
        console.error('Failed to load workout history:', errorMessage, error);
        // setError(errorMessage);
        setWorkoutHistory([]);

        toast({
          title: 'Connection Error',
          description: 'Unable to connect to workout history service. Please check your connection and try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user?.uid, toast]);

  // Retry function for failed loads (currently unused)
  /*
  const retryLoadHistory = useCallback(() => {
    if (user?.uid) {
      const loadHistory = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const response = await neuraStackClient.getWorkoutHistory({
            limit: 50,
            userId: user.uid,
            includeDetails: true,  // Include detailed workout information
            includeIncomplete: false  // Only show completed workouts in history
          });

          if (response.status === 'success' && response.data) {
            const transformedHistory: WorkoutSessionSummary[] = response.data.workouts.map((workout: any) => ({
              id: workout.workoutId || workout.id,
              workoutName: workout.type || workout.workoutType,
              date: new Date(workout.date || workout.completedAt),
              duration: workout.duration,
              exercisesCompleted: workout.exercises?.filter((ex: any) => ex.completed).length || 0,
              totalExercises: workout.exercises?.length || 0,
              completionRate: workout.completionPercentage || (workout.exercises?.length > 0 ? (workout.exercises.filter((ex: any) => ex.completed).length / workout.exercises.length) * 100 : 0),
              totalWeightLifted: 0,
              averageRPE: undefined,
              overallRating: workout.rating,
              workoutType: workout.type || workout.workoutType,
              status: workout.completed ? 'completed' : 'abandoned' as 'completed' | 'abandoned' | 'completed_early',
              personalRecordsAchieved: 0
            }));

            setWorkoutHistory(transformedHistory);
            // setError(null);

            toast({
              title: 'History Loaded',
              description: 'Your workout history has been successfully loaded.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          } else {
            throw new Error(response.message || 'Failed to load workout history');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
          // setError(errorMessage);

          toast({
            title: 'Retry Failed',
            description: 'Still unable to load workout history. Please try again later.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadHistory();
    }
  }, [user?.uid, toast]);
  */

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

  /*
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'completed_early': return 'blue';
      case 'abandoned':
      case 'stopped':
      case 'incomplete': return 'red';
      case 'in_progress': return 'yellow';
      default: return 'gray';
    }
  };
  */

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'COMPLETED';
      case 'completed_early': return 'FINISHED EARLY';
      case 'abandoned': return 'STOPPED';
      case 'stopped': return 'STOPPED';
      case 'incomplete': return 'INCOMPLETE';
      case 'in_progress': return 'IN PROGRESS';
      default: return status?.toUpperCase() || 'UNKNOWN';
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
      bg="linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)"
      overflow="auto"
      position="relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
      sx={{
        '@media (max-width: 768px)': {
          height: 'calc(100vh - 56px)',
          minHeight: 'calc(100vh - 56px)',
          maxHeight: 'calc(100vh - 56px)',
        },
        '@media (min-width: 769px)': {
          height: 'calc(100vh - 64px)',
          minHeight: 'calc(100vh - 64px)',
          maxHeight: 'calc(100vh - 64px)',
        }
      }}
    >
      <VStack spacing={{ base: 3, md: 4 }} p={{ base: 3, md: 4 }} maxW="5xl" mx="auto" h="100%" justify="flex-start" pb={{ base: 6, md: 8 }}>
        {/* Futuristic Header */}
        <Box
          w="100%"
          bg="rgba(255, 255, 255, 0.05)"
          backdropFilter="blur(20px)"
          borderRadius={{ base: "lg", md: "xl" }}
          border="1px solid rgba(255, 255, 255, 0.1)"
          p={{ base: 3, md: 4 }}
          mb={{ base: 1, md: 2 }}
        >
          <HStack justify="space-between" align="center">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Icon as={PiArrowLeftBold} />}
              onClick={onBack}
              color="rgba(255, 255, 255, 0.8)"
              bg="rgba(79, 156, 249, 0.1)"
              borderRadius="lg"
              _hover={{
                bg: "rgba(79, 156, 249, 0.2)",
                transform: "translateY(-1px)",
                shadow: "0 4px 12px rgba(79, 156, 249, 0.3)"
              }}
              _active={{
                transform: "translateY(0px)"
              }}
              transition="all 0.2s ease-in-out"
              fontSize="sm"
              fontWeight="medium"
            >
              Dashboard
            </Button>

            <VStack spacing={0} textAlign="center">
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="white" letterSpacing="wide">
                WORKOUT HISTORY
              </Text>
              <Text fontSize={{ base: "2xs", md: "xs" }} color="rgba(255, 255, 255, 0.6)" fontWeight="medium">
                Neural Fitness Analytics
              </Text>
            </VStack>

            <Box w="20" /> {/* Spacer for centering */}
          </HStack>
        </Box>

        {/* Enhanced Stats Grid with Better Visual Hierarchy */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 2, md: 4 }} w="100%">
          <Box
            bg="linear-gradient(135deg, rgba(79, 156, 249, 0.15) 0%, rgba(79, 156, 249, 0.05) 100%)"
            backdropFilter="blur(20px)"
            borderRadius={{ base: "xl", md: "2xl" }}
            border="1px solid rgba(79, 156, 249, 0.3)"
            p={{ base: 3, md: 5 }}
            position="relative"
            overflow="hidden"
            _hover={{
              bg: "linear-gradient(135deg, rgba(79, 156, 249, 0.25) 0%, rgba(79, 156, 249, 0.1) 100%)",
              transform: "translateY(-3px)",
              shadow: "0 12px 40px rgba(79, 156, 249, 0.4)"
            }}
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            cursor="pointer"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              bg: "linear-gradient(90deg, #4F9CF9, #6366F1)",
              borderRadius: "2xl 2xl 0 0"
            }}
          >
            <VStack spacing={{ base: 2, md: 3 }} align="center">
              <Box
                bg="rgba(79, 156, 249, 0.2)"
                borderRadius={{ base: "lg", md: "xl" }}
                p={{ base: 2, md: 3 }}
                border="1px solid rgba(79, 156, 249, 0.3)"
              >
                <Icon as={PiTargetBold} boxSize={{ base: 4, md: 6 }} color="#4F9CF9" />
              </Box>
              <VStack spacing={1}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="white" lineHeight="1">
                  {workoutStats.totalWorkouts}
                </Text>
                <Text fontSize={{ base: "2xs", md: "xs" }} color="rgba(255, 255, 255, 0.8)" fontWeight="semibold" letterSpacing="wider">
                  WORKOUTS
                </Text>
              </VStack>
            </VStack>
          </Box>

          <Box
            bg="linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)"
            backdropFilter="blur(20px)"
            borderRadius={{ base: "xl", md: "2xl" }}
            border="1px solid rgba(16, 185, 129, 0.3)"
            p={{ base: 3, md: 5 }}
            position="relative"
            overflow="hidden"
            _hover={{
              bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 100%)",
              transform: "translateY(-3px)",
              shadow: "0 12px 40px rgba(16, 185, 129, 0.4)"
            }}
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            cursor="pointer"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              bg: "linear-gradient(90deg, #10B981, #059669)",
              borderRadius: "2xl 2xl 0 0"
            }}
          >
            <VStack spacing={{ base: 2, md: 3 }} align="center">
              <Box
                bg="rgba(16, 185, 129, 0.2)"
                borderRadius={{ base: "lg", md: "xl" }}
                p={{ base: 2, md: 3 }}
                border="1px solid rgba(16, 185, 129, 0.3)"
              >
                <Icon as={PiClockBold} boxSize={{ base: 4, md: 6 }} color="#10B981" />
              </Box>
              <VStack spacing={1}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="white" lineHeight="1">
                  {Math.round(workoutStats.totalTimeMinutes / 60)}h
                </Text>
                <Text fontSize={{ base: "2xs", md: "xs" }} color="rgba(255, 255, 255, 0.8)" fontWeight="semibold" letterSpacing="wider">
                  TRAINED
                </Text>
              </VStack>
            </VStack>
          </Box>

          <Box
            bg="linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)"
            backdropFilter="blur(20px)"
            borderRadius={{ base: "xl", md: "2xl" }}
            border="1px solid rgba(139, 92, 246, 0.3)"
            p={{ base: 3, md: 5 }}
            position="relative"
            overflow="hidden"
            _hover={{
              bg: "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.1) 100%)",
              transform: "translateY(-3px)",
              shadow: "0 12px 40px rgba(139, 92, 246, 0.4)"
            }}
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            cursor="pointer"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              bg: "linear-gradient(90deg, #8B5CF6, #7C3AED)",
              borderRadius: "2xl 2xl 0 0"
            }}
          >
            <VStack spacing={{ base: 2, md: 3 }} align="center">
              <Box
                bg="rgba(139, 92, 246, 0.2)"
                borderRadius={{ base: "lg", md: "xl" }}
                p={{ base: 2, md: 3 }}
                border="1px solid rgba(139, 92, 246, 0.3)"
              >
                <Icon as={PiScalesBold} boxSize={{ base: 4, md: 6 }} color="#8B5CF6" />
              </Box>
              <VStack spacing={1}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="white" lineHeight="1">
                  {Math.round(workoutStats.averageCompletionRate)}%
                </Text>
                <Text fontSize={{ base: "2xs", md: "xs" }} color="rgba(255, 255, 255, 0.8)" fontWeight="semibold" letterSpacing="wider">
                  AVG RATE
                </Text>
              </VStack>
            </VStack>
          </Box>

          <Box
            bg="linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)"
            backdropFilter="blur(20px)"
            borderRadius={{ base: "xl", md: "2xl" }}
            border="1px solid rgba(245, 158, 11, 0.3)"
            p={{ base: 3, md: 5 }}
            position="relative"
            overflow="hidden"
            _hover={{
              bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)",
              transform: "translateY(-3px)",
              shadow: "0 12px 40px rgba(245, 158, 11, 0.4)"
            }}
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            cursor="pointer"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              bg: "linear-gradient(90deg, #F59E0B, #D97706)",
              borderRadius: "2xl 2xl 0 0"
            }}
          >
            <VStack spacing={{ base: 2, md: 3 }} align="center">
              <Box
                bg="rgba(245, 158, 11, 0.2)"
                borderRadius={{ base: "lg", md: "xl" }}
                p={{ base: 2, md: 3 }}
                border="1px solid rgba(245, 158, 11, 0.3)"
              >
                <Icon as={PiMedalBold} boxSize={{ base: 4, md: 6 }} color="#F59E0B" />
              </Box>
              <VStack spacing={1}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="white" lineHeight="1">
                  {workoutStats.averageRating.toFixed(1)}
                </Text>
                <Text fontSize={{ base: "2xs", md: "xs" }} color="rgba(255, 255, 255, 0.8)" fontWeight="semibold" letterSpacing="wider">
                  AVG RATING
                </Text>
              </VStack>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Enhanced Workout History Section */}
        <Box
          bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          border="1px solid rgba(255, 255, 255, 0.15)"
          w="100%"
          overflow="hidden"
          shadow="0 8px 32px rgba(0, 0, 0, 0.3)"
        >
          {/* Enhanced Header with Action Button */}
          <Box p={{ base: 3, md: 5 }} borderBottom="1px solid rgba(255, 255, 255, 0.1)">
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="white" letterSpacing="wide">
                  RECENT SESSIONS
                </Text>
                <Text fontSize={{ base: "2xs", md: "xs" }} color="rgba(255, 255, 255, 0.6)" fontWeight="medium">
                  {workoutHistory.length} workouts completed
                </Text>
              </VStack>
              {workoutHistory.length > 0 && (
                <Button
                  size={{ base: "xs", md: "sm" }}
                  variant="ghost"
                  color="rgba(79, 156, 249, 0.9)"
                  bg="rgba(79, 156, 249, 0.1)"
                  border="1px solid rgba(79, 156, 249, 0.3)"
                  borderRadius={{ base: "md", md: "lg" }}
                  fontSize={{ base: "2xs", md: "xs" }}
                  fontWeight="semibold"
                  px={{ base: 2, md: 4 }}
                  _hover={{
                    bg: "rgba(79, 156, 249, 0.2)",
                    transform: "translateY(-1px)",
                    shadow: "0 4px 12px rgba(79, 156, 249, 0.3)"
                  }}
                  _active={{
                    transform: "translateY(0px)"
                  }}
                  transition="all 0.2s ease-in-out"
                  onClick={onStartNewWorkout}
                >
                  NEW WORKOUT
                </Button>
              )}
            </HStack>
          </Box>

          {workoutHistory.length === 0 ? (
            <Box p={12} textAlign="center">
              <VStack spacing={6}>
                <Box
                  bg="linear-gradient(135deg, rgba(79, 156, 249, 0.2) 0%, rgba(79, 156, 249, 0.05) 100%)"
                  borderRadius="full"
                  p={6}
                  border="2px solid rgba(79, 156, 249, 0.3)"
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    inset: "-2px",
                    borderRadius: "full",
                    background: "linear-gradient(45deg, #4F9CF9, #6366F1, #8B5CF6)",
                    zIndex: -1,
                    opacity: 0.3
                  }}
                >
                  <Icon as={PiChartLineBold} boxSize={12} color="#4F9CF9" />
                </Box>
                <VStack spacing={3}>
                  <Text fontSize="xl" fontWeight="bold" color="white" letterSpacing="wide">
                    START YOUR FITNESS JOURNEY
                  </Text>
                  <Text fontSize="md" color="rgba(255, 255, 255, 0.7)" maxW="300px" lineHeight="1.6">
                    Complete your first workout to unlock detailed analytics and track your progress
                  </Text>
                </VStack>
                <Button
                  onClick={onStartNewWorkout}
                  leftIcon={<Icon as={PiTargetBold} />}
                  size="lg"
                  borderRadius="xl"
                  px={8}
                  py={4}
                  fontSize="md"
                  fontWeight="bold"
                  bg="linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)"
                  color="white"
                  border="1px solid rgba(79, 156, 249, 0.5)"
                  _hover={{
                    bg: "linear-gradient(135deg, #3182CE 0%, #553C9A 100%)",
                    transform: 'translateY(-2px)',
                    shadow: '0 8px 25px rgba(79, 156, 249, 0.5)'
                  }}
                  _active={{
                    transform: 'translateY(0px)'
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  START FIRST WORKOUT
                </Button>
              </VStack>
            </Box>
          ) : (
            <VStack spacing={{ base: 1, md: 2 }} align="stretch" p={{ base: 1, md: 2 }}>
              {workoutHistory.map((workout) => (
                <Box
                  key={workout.id}
                  bg="linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)"
                  borderRadius={{ base: "lg", md: "xl" }}
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  p={{ base: 3, md: 5 }}
                  cursor="pointer"
                  onClick={() => handleWorkoutClick(workout)}
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    bg: "linear-gradient(135deg, rgba(79, 156, 249, 0.1) 0%, rgba(79, 156, 249, 0.02) 100%)",
                    transform: "translateY(-2px)",
                    shadow: "0 8px 25px rgba(79, 156, 249, 0.2)",
                    borderColor: "rgba(79, 156, 249, 0.3)"
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _before={{
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    bg: workout.status === 'completed' ?
                      "linear-gradient(180deg, #10B981, #059669)" :
                      workout.status === 'completed_early' ?
                      "linear-gradient(180deg, #4F9CF9, #3182CE)" :
                      "linear-gradient(180deg, #EF4444, #DC2626)",
                    borderRadius: "0 4px 4px 0"
                  }}
                >
                  <HStack spacing={{ base: 2, md: 4 }} align="center" w="100%">
                    {/* Enhanced Date Display */}
                    <VStack align="center" spacing={1} minW={{ base: "50px", md: "70px" }}>
                      <Box
                        bg="rgba(79, 156, 249, 0.1)"
                        borderRadius={{ base: "md", md: "lg" }}
                        p={{ base: 1.5, md: 2 }}
                        border="1px solid rgba(79, 156, 249, 0.2)"
                      >
                        <VStack spacing={0}>
                          <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="bold" color="#4F9CF9" letterSpacing="wide">
                            {format(workout.date, 'MMM').toUpperCase()}
                          </Text>
                          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="white" lineHeight="1">
                            {format(workout.date, 'd')}
                          </Text>
                        </VStack>
                      </Box>
                    </VStack>

                    {/* Enhanced Workout Info */}
                    <VStack align="start" spacing={{ base: 1, md: 2 }} flex={1}>
                      <HStack spacing={{ base: 2, md: 3 }} align="center" w="100%">
                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color="white" noOfLines={1} flex={1}>
                          {workout.workoutName}
                        </Text>
                        <Badge
                          bg={workout.status === 'completed' ?
                            "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))" :
                            workout.status === 'completed_early' ?
                            "linear-gradient(135deg, rgba(79, 156, 249, 0.2), rgba(79, 156, 249, 0.1))" :
                            "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))"}
                          color={workout.status === 'completed' ? '#10B981' :
                                 workout.status === 'completed_early' ? '#4F9CF9' : '#EF4444'}
                          variant="subtle"
                          borderRadius={{ base: "md", md: "lg" }}
                          px={{ base: 2, md: 3 }}
                          py={1}
                          fontSize={{ base: "2xs", md: "xs" }}
                          fontWeight="bold"
                          border="1px solid"
                          borderColor={workout.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' :
                                      workout.status === 'completed_early' ? 'rgba(79, 156, 249, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
                        >
                          {getStatusText(workout.status)}
                        </Badge>
                      </HStack>

                      <HStack spacing={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} color="rgba(255, 255, 255, 0.7)" flexWrap="wrap">
                        <HStack spacing={1}>
                          <Icon as={PiClockBold} boxSize={{ base: 3, md: 4 }} color="#4F9CF9" />
                          <Text fontWeight="medium">{workout.duration} min</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={PiTargetBold} boxSize={{ base: 3, md: 4 }} color="#10B981" />
                          <Text fontWeight="medium">{workout.exercisesCompleted}/{workout.totalExercises} exercises</Text>
                        </HStack>
                        {workout.overallRating && (
                          <HStack spacing={1}>
                            <Icon as={PiStarFill} boxSize={{ base: 3, md: 4 }} color="#F59E0B" />
                            <Text fontWeight="medium">{workout.overallRating}/5</Text>
                          </HStack>
                        )}
                      </HStack>
                    </VStack>

                    {/* Enhanced Progress Display */}
                    <VStack align="center" spacing={2} minW={{ base: "60px", md: "90px" }}>
                      <Box
                        bg="rgba(79, 156, 249, 0.1)"
                        borderRadius={{ base: "md", md: "lg" }}
                        p={{ base: 2, md: 3 }}
                        border="1px solid rgba(79, 156, 249, 0.2)"
                        textAlign="center"
                      >
                        <VStack spacing={{ base: 1, md: 2 }}>
                          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="white" lineHeight="1">
                            {Math.round(workout.completionRate)}%
                          </Text>
                          <Progress
                            value={workout.completionRate}
                            size={{ base: "xs", md: "sm" }}
                            colorScheme={workout.completionRate === 100 ? "green" : "blue"}
                            borderRadius="full"
                            bg="rgba(255, 255, 255, 0.1)"
                            w={{ base: "35px", md: "50px" }}
                            sx={{
                              '& > div': {
                                background: workout.completionRate === 100 ?
                                  "linear-gradient(90deg, #10B981, #059669)" :
                                  "linear-gradient(90deg, #4F9CF9, #3182CE)"
                              }
                            }}
                          />
                          <Text fontSize={{ base: "2xs", md: "xs" }} color="rgba(255, 255, 255, 0.6)" fontWeight="medium">
                            COMPLETE
                          </Text>
                        </VStack>
                      </Box>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>

      {/* Futuristic Workout Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />
        <ModalContent
          bg="rgba(15, 15, 35, 0.95)"
          backdropFilter="blur(20px)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          borderRadius="xl"
          color="white"
        >
          <ModalHeader
            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
            fontSize="lg"
            fontWeight="bold"
            letterSpacing="wide"
          >
            {selectedWorkout?.workoutName}
          </ModalHeader>
          <ModalCloseButton color="rgba(255, 255, 255, 0.7)" />
          <ModalBody pb={6}>
            {selectedWorkout && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box
                    bg="rgba(79, 156, 249, 0.1)"
                    borderRadius="lg"
                    p={4}
                    border="1px solid rgba(79, 156, 249, 0.2)"
                  >
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color="rgba(255, 255, 255, 0.6)" fontWeight="medium">
                        DURATION
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="white">
                        {selectedWorkout.duration} min
                      </Text>
                      <Text fontSize="xs" color="rgba(255, 255, 255, 0.5)">
                        {formatDistanceToNow(selectedWorkout.date, { addSuffix: true })}
                      </Text>
                    </VStack>
                  </Box>

                  <Box
                    bg="rgba(16, 185, 129, 0.1)"
                    borderRadius="lg"
                    p={4}
                    border="1px solid rgba(16, 185, 129, 0.2)"
                  >
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color="rgba(255, 255, 255, 0.6)" fontWeight="medium">
                        COMPLETION
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="white">
                        {Math.round(selectedWorkout.completionRate)}%
                      </Text>
                      <Text fontSize="xs" color="rgba(255, 255, 255, 0.5)">
                        {selectedWorkout.exercisesCompleted} of {selectedWorkout.totalExercises} exercises
                      </Text>
                    </VStack>
                  </Box>
                </SimpleGrid>

                <Divider borderColor="rgba(255, 255, 255, 0.1)" />

                <SimpleGrid columns={2} spacing={4}>
                  {selectedWorkout.totalWeightLifted && (
                    <Box
                      bg="rgba(139, 92, 246, 0.1)"
                      borderRadius="lg"
                      p={4}
                      border="1px solid rgba(139, 92, 246, 0.2)"
                    >
                      <VStack spacing={1} align="start">
                        <Text fontSize="xs" color="rgba(255, 255, 255, 0.6)" fontWeight="medium">
                          WEIGHT LIFTED
                        </Text>
                        <Text fontSize="xl" fontWeight="bold" color="white">
                          {Math.round(selectedWorkout.totalWeightLifted)} lbs
                        </Text>
                      </VStack>
                    </Box>
                  )}

                  {selectedWorkout.averageRPE && (
                    <Box
                      bg="rgba(245, 158, 11, 0.1)"
                      borderRadius="lg"
                      p={4}
                      border="1px solid rgba(245, 158, 11, 0.2)"
                    >
                      <VStack spacing={1} align="start">
                        <Text fontSize="xs" color="rgba(255, 255, 255, 0.6)" fontWeight="medium">
                          AVERAGE RPE
                        </Text>
                        <Text fontSize="xl" fontWeight="bold" color="white">
                          {selectedWorkout.averageRPE.toFixed(1)}/10
                        </Text>
                      </VStack>
                    </Box>
                  )}
                </SimpleGrid>

                {selectedWorkout.personalRecordsAchieved > 0 && (
                  <>
                    <Divider borderColor="rgba(255, 255, 255, 0.1)" />
                    <Box
                      bg="rgba(245, 158, 11, 0.1)"
                      borderRadius="lg"
                      p={4}
                      border="1px solid rgba(245, 158, 11, 0.2)"
                      textAlign="center"
                    >
                      <HStack justify="center" spacing={2}>
                        <Icon as={PiMedalBold} color="#F59E0B" boxSize={5} />
                        <Text fontSize="md" fontWeight="bold" color="#F59E0B">
                          {selectedWorkout.personalRecordsAchieved} PERSONAL RECORD{selectedWorkout.personalRecordsAchieved > 1 ? 'S' : ''} ACHIEVED
                        </Text>
                      </HStack>
                    </Box>
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
