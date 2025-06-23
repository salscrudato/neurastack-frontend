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
    Spacer,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import {
    PiArrowDownBold,
    PiArrowLeftBold,
    PiArrowUpBold,
    PiChartLineBold,
    PiClockBold,
    PiFireBold,
    PiTargetBold
} from 'react-icons/pi';
import { useFitnessStore } from '../../store/useFitnessStore';
// import type { WorkoutPlan } from '../../lib/types'; // Commented out for now

interface ProgressTrackerProps {
  onBack: () => void;
  onStartNewWorkout: () => void;
}

interface ProgressStats {
  totalWorkouts: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageWorkoutTime: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
  favoriteWorkoutType: string;
  improvementTrend: 'up' | 'down' | 'stable';
}

export default function ProgressTracker({ onBack, onStartNewWorkout }: ProgressTrackerProps) {
  const { workoutPlans } = useFitnessStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');

  // Calculate progress statistics
  const progressStats = useMemo((): ProgressStats => {
    const completedWorkouts = (workoutPlans || []).filter((w: any) => w.completedAt);
    const now = new Date();
    
    // Filter workouts by selected period
    const getFilteredWorkouts = () => {
      if (selectedPeriod === 'all') return completedWorkouts;
      
      const cutoffDate = new Date();
      if (selectedPeriod === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      }
      
      return completedWorkouts.filter((w: any) =>
        w.completedAt && new Date(w.completedAt) >= cutoffDate
      );
    };

    const filteredWorkouts = getFilteredWorkouts();
    const totalMinutes = filteredWorkouts.reduce((sum: number, w: any) => sum + w.duration, 0);
    
    // Calculate streaks
    const sortedWorkouts = completedWorkouts
      .sort((a: any, b: any) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].completedAt!);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1;
        tempStreak = 1;
      } else if (i > 0) {
        const prevWorkoutDate = new Date(sortedWorkouts[i - 1].completedAt!);
        prevWorkoutDate.setHours(0, 0, 0, 0);
        const prevDaysDiff = Math.floor((prevWorkoutDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (prevDaysDiff === 1) {
          tempStreak++;
          if (i === 0 || currentStreak > 0) currentStreak++;
        } else {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          tempStreak = 1;
          if (currentStreak > 0 && i > 0) currentStreak = 0;
        }
      }
    }
    
    if (tempStreak > longestStreak) longestStreak = tempStreak;

    // Weekly goal progress (assuming goal is 3 workouts per week)
    const weeklyGoal = 3;
    const thisWeekWorkouts = completedWorkouts.filter((w: any) => {
      const workoutDate = new Date(w.completedAt!);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return workoutDate >= weekStart;
    }).length;
    
    const weeklyGoalProgress = Math.min((thisWeekWorkouts / weeklyGoal) * 100, 100);

    // Monthly goal progress (assuming goal is 12 workouts per month)
    const monthlyGoal = 12;
    const thisMonthWorkouts = completedWorkouts.filter((w: any) => {
      const workoutDate = new Date(w.completedAt!);
      return workoutDate.getMonth() === now.getMonth() && 
             workoutDate.getFullYear() === now.getFullYear();
    }).length;
    
    const monthlyGoalProgress = Math.min((thisMonthWorkouts / monthlyGoal) * 100, 100);

    // Favorite workout type
    const workoutTypes = completedWorkouts.reduce((acc: Record<string, number>, w: any) => {
      acc[w.name] = (acc[w.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteWorkoutType = Object.entries(workoutTypes)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None yet';

    // Improvement trend (simplified)
    const recentWorkouts = completedWorkouts.slice(0, 5);
    const olderWorkouts = completedWorkouts.slice(5, 10);
    const recentAvg = recentWorkouts.reduce((sum: number, w: any) => sum + w.duration, 0) / recentWorkouts.length || 0;
    const olderAvg = olderWorkouts.reduce((sum: number, w: any) => sum + w.duration, 0) / olderWorkouts.length || 0;
    
    let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.1) improvementTrend = 'up';
    else if (recentAvg < olderAvg * 0.9) improvementTrend = 'down';

    return {
      totalWorkouts: filteredWorkouts.length,
      totalMinutes,
      currentStreak,
      longestStreak,
      averageWorkoutTime: filteredWorkouts.length > 0 ? Math.round(totalMinutes / filteredWorkouts.length) : 0,
      weeklyGoalProgress,
      monthlyGoalProgress,
      favoriteWorkoutType,
      improvementTrend,
    };
  }, [workoutPlans, selectedPeriod]);



  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTrendIcon = () => {
    switch (progressStats.improvementTrend) {
      case 'up': return PiArrowUpBold;
      case 'down': return PiArrowDownBold;
      default: return PiChartLineBold;
    }
  };

  const getTrendColor = () => {
    switch (progressStats.improvementTrend) {
      case 'up': return successColor;
      case 'down': return warningColor;
      default: return subtextColor;
    }
  };

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const glassBorder = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');

  return (
    <Box
      h="100%"
      bgGradient="linear(135deg, #f7fafc 0%, #edf2f7 100%)"
      overflow={{ base: "auto", md: "auto" }}
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
      <VStack spacing={{ base: 4, md: 5 }} p={{ base: 4, md: 5 }} maxW="4xl" mx="auto" h="100%" justify="flex-start" pb={{ base: 6, md: 8 }}>
        {/* Compact Header with Back Button */}
        <VStack spacing={2} textAlign="center" w="100%" py={{ base: 2, md: 3 }}>
          <HStack w="100%" justify="space-between" align="center">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Icon as={PiArrowLeftBold} />}
              onClick={onBack}
              color="gray.600"
              _hover={{ bg: "gray.100" }}
            >
              Dashboard
            </Button>
            <Spacer />
          </HStack>
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="gray.700">
            Progress & Analytics
          </Text>
        </VStack>

        {/* Period Selector */}
        <HStack spacing={2} justify="center">
          {(['week', 'month', 'all'] as const).map((period) => (
            <Button
              key={period}
              size="sm"
              variant={selectedPeriod === period ? 'solid' : 'ghost'}
              colorScheme="blue"
              onClick={() => setSelectedPeriod(period)}
              textTransform="capitalize"
              borderRadius="xl"
              _hover={{
                bg: selectedPeriod === period ? undefined : "blue.50",
              }}
            >
              {period === 'all' ? 'All Time' : `This ${period}`}
            </Button>
          ))}
        </HStack>

        {/* Compact Analytics Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} w="100%">
          <Card
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={glassBorder}
            borderRadius="xl"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <CardBody p={3} textAlign="center">
              <VStack spacing={1}>
                <Icon as={PiFireBold} boxSize={5} color="orange.400" />
                <Text fontSize="lg" fontWeight="bold" color="orange.500">
                  {progressStats.currentStreak}
                </Text>
                <Text fontSize="xs" color={subtextColor}>
                  day streak
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={glassBorder}
            borderRadius="xl"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <CardBody p={3} textAlign="center">
              <VStack spacing={1}>
                <Icon as={PiClockBold} boxSize={5} color="blue.400" />
                <Text fontSize="lg" fontWeight="bold" color="blue.500">
                  {formatDuration(progressStats.totalMinutes)}
                </Text>
                <Text fontSize="xs" color={subtextColor}>
                  total time
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={glassBorder}
            borderRadius="xl"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <CardBody p={3} textAlign="center">
              <VStack spacing={1}>
                <Icon as={PiChartLineBold} boxSize={5} color="purple.400" />
                <Text fontSize="lg" fontWeight="bold" color="purple.500">
                  {progressStats.averageWorkoutTime}m
                </Text>
                <Text fontSize="xs" color={subtextColor}>
                  avg duration
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={glassBorder}
            borderRadius="xl"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <CardBody p={3} textAlign="center">
              <VStack spacing={1}>
                <Icon as={getTrendIcon()} boxSize={5} color={getTrendColor()} />
                <Text fontSize="lg" fontWeight="bold" color={getTrendColor()}>
                  {progressStats.improvementTrend === 'up' ? '↗️' :
                   progressStats.improvementTrend === 'down' ? '↘️' : '→'}
                </Text>
                <Text fontSize="xs" color={subtextColor}>
                  trend
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Combined Progress & Insights */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="100%">
          {/* Monthly Goal Progress */}
          <Card
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={glassBorder}
            borderRadius="xl"
          >
            <CardBody p={4}>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                    Monthly Goal
                  </Text>
                  <Badge
                    colorScheme={progressStats.monthlyGoalProgress >= 100 ? "green" : progressStats.monthlyGoalProgress >= 50 ? "blue" : "orange"}
                    variant="subtle"
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {Math.round(progressStats.monthlyGoalProgress)}%
                  </Badge>
                </HStack>

                <Progress
                  value={progressStats.monthlyGoalProgress}
                  size="md"
                  colorScheme={progressStats.monthlyGoalProgress >= 100 ? "green" : progressStats.monthlyGoalProgress >= 50 ? "blue" : "orange"}
                  borderRadius="full"
                  bg="gray.100"
                />

                <Text fontSize="xs" color={subtextColor} textAlign="center">
                  {progressStats.monthlyGoalProgress >= 100 ?
                    "🎉 Goal achieved!" :
                    `${Math.round(progressStats.monthlyGoalProgress)}% complete`
                  }
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Personal Insights */}
          <Card
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={glassBorder}
            borderRadius="xl"
          >
            <CardBody p={4}>
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  Insights
                </Text>

                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xs" color={subtextColor}>Favorite</Text>
                    <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2} fontSize="xs">
                      {progressStats.favoriteWorkoutType}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="xs" color={subtextColor}>Best Streak</Text>
                    <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2} fontSize="xs">
                      {progressStats.longestStreak} days
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="xs" color={subtextColor}>Trend</Text>
                    <HStack spacing={1}>
                      <Icon as={getTrendIcon()} color={getTrendColor()} boxSize={3} />
                      <Badge
                        colorScheme={progressStats.improvementTrend === 'up' ? 'green' : progressStats.improvementTrend === 'down' ? 'red' : 'gray'}
                        variant="subtle"
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                      >
                        {progressStats.improvementTrend === 'up' ? 'Up' :
                         progressStats.improvementTrend === 'down' ? 'Down' : 'Stable'}
                      </Badge>
                    </HStack>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Compact Action Button */}
        <Button
          size="md"
          w="100%"
          maxW="300px"
          h="50px"
          leftIcon={<Icon as={PiTargetBold} boxSize={5} />}
          onClick={onStartNewWorkout}
          fontSize="md"
          fontWeight="bold"
          borderRadius="xl"
          bgGradient="linear(135deg, blue.400 0%, purple.500 100%)"
          color="white"
          boxShadow="0 6px 20px rgba(66, 153, 225, 0.3)"
          _hover={{
            bgGradient: "linear(135deg, blue.500 0%, purple.600 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(66, 153, 225, 0.4)"
          }}
          _active={{
            transform: "translateY(-1px)"
          }}
          transition="all 0.3s ease"
        >
          Start New Workout
        </Button>
      </VStack>
    </Box>
  );
}
