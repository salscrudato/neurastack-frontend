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
  StatHelpText,
  Progress,
  Badge,
} from '@chakra-ui/react';
import {
  PiTrophyBold,
  PiTargetBold,
  PiChartLineBold,
  PiFireBold,
  PiClockBold,
  PiArrowUpBold,
  PiArrowDownBold,
} from 'react-icons/pi';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFitnessStore } from '../../store/useFitnessStore';
// import type { WorkoutPlan } from '../../lib/types'; // Commented out for now

const MotionBox = motion(Box);

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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');

  // Calculate progress statistics
  const progressStats = useMemo((): ProgressStats => {
    const completedWorkouts = workoutPlans.filter(w => w.completedAt);
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
      
      return completedWorkouts.filter(w => 
        w.completedAt && new Date(w.completedAt) >= cutoffDate
      );
    };

    const filteredWorkouts = getFilteredWorkouts();
    const totalMinutes = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
    
    // Calculate streaks
    const sortedWorkouts = completedWorkouts
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    
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
    const thisWeekWorkouts = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.completedAt!);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return workoutDate >= weekStart;
    }).length;
    
    const weeklyGoalProgress = Math.min((thisWeekWorkouts / weeklyGoal) * 100, 100);

    // Monthly goal progress (assuming goal is 12 workouts per month)
    const monthlyGoal = 12;
    const thisMonthWorkouts = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.completedAt!);
      return workoutDate.getMonth() === now.getMonth() && 
             workoutDate.getFullYear() === now.getFullYear();
    }).length;
    
    const monthlyGoalProgress = Math.min((thisMonthWorkouts / monthlyGoal) * 100, 100);

    // Favorite workout type
    const workoutTypes = completedWorkouts.reduce((acc, w) => {
      acc[w.name] = (acc[w.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteWorkoutType = Object.entries(workoutTypes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None yet';

    // Improvement trend (simplified)
    const recentWorkouts = completedWorkouts.slice(0, 5);
    const olderWorkouts = completedWorkouts.slice(5, 10);
    const recentAvg = recentWorkouts.reduce((sum, w) => sum + w.duration, 0) / recentWorkouts.length || 0;
    const olderAvg = olderWorkouts.reduce((sum, w) => sum + w.duration, 0) / olderWorkouts.length || 0;
    
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

  // Achievement system
  const achievements = useMemo(() => {
    const completed = [];
    
    if (progressStats.totalWorkouts >= 1) completed.push({ name: 'First Workout', icon: PiTrophyBold, color: 'green' });
    if (progressStats.totalWorkouts >= 5) completed.push({ name: 'Consistent', icon: PiTargetBold, color: 'blue' });
    if (progressStats.totalWorkouts >= 10) completed.push({ name: 'Dedicated', icon: PiFireBold, color: 'orange' });
    if (progressStats.currentStreak >= 3) completed.push({ name: 'On Fire', icon: PiFireBold, color: 'red' });
    if (progressStats.totalMinutes >= 300) completed.push({ name: '5 Hour Club', icon: PiClockBold, color: 'purple' });
    
    return completed;
  }, [progressStats]);

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

  return (
    <VStack spacing={6} p={4} align="stretch" h="100%">
      {/* Header */}
      <Box textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={2}>
          Your Fitness Progress
        </Text>
        <Text color={subtextColor}>
          Track your journey and celebrate your achievements
        </Text>
      </Box>

      {/* Period Selector */}
      <HStack spacing={2} justify="center">
        {(['week', 'month', 'all'] as const).map((period) => (
          <Button
            key={period}
            size="sm"
            variant={selectedPeriod === period ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => setSelectedPeriod(period)}
            textTransform="capitalize"
          >
            {period === 'all' ? 'All Time' : `This ${period}`}
          </Button>
        ))}
      </HStack>

      {/* Main Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody textAlign="center" py={4}>
            <Stat>
              <StatLabel fontSize="xs" color={subtextColor}>Workouts</StatLabel>
              <StatNumber fontSize="2xl" color={primaryColor}>
                {progressStats.totalWorkouts}
              </StatNumber>
              <StatHelpText fontSize="xs">
                {selectedPeriod === 'week' ? 'This week' : 
                 selectedPeriod === 'month' ? 'This month' : 'Total'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody textAlign="center" py={4}>
            <Stat>
              <StatLabel fontSize="xs" color={subtextColor}>Time Trained</StatLabel>
              <StatNumber fontSize="2xl" color={primaryColor}>
                {formatDuration(progressStats.totalMinutes)}
              </StatNumber>
              <StatHelpText fontSize="xs">
                Total duration
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody textAlign="center" py={4}>
            <Stat>
              <StatLabel fontSize="xs" color={subtextColor}>Current Streak</StatLabel>
              <StatNumber fontSize="2xl" color={successColor}>
                {progressStats.currentStreak}
              </StatNumber>
              <StatHelpText fontSize="xs">
                Days in a row
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody textAlign="center" py={4}>
            <Stat>
              <StatLabel fontSize="xs" color={subtextColor}>Avg Duration</StatLabel>
              <StatNumber fontSize="2xl" color={primaryColor}>
                {progressStats.averageWorkoutTime}m
              </StatNumber>
              <StatHelpText fontSize="xs">
                Per workout
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Goals Progress */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold" color={textColor}>
              Goal Progress
            </Text>
            
            <VStack spacing={3} align="stretch">
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color={subtextColor}>Weekly Goal</Text>
                  <Text fontSize="sm" color={subtextColor}>
                    {Math.round(progressStats.weeklyGoalProgress)}%
                  </Text>
                </HStack>
                <Progress
                  value={progressStats.weeklyGoalProgress}
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                />
              </Box>
              
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color={subtextColor}>Monthly Goal</Text>
                  <Text fontSize="sm" color={subtextColor}>
                    {Math.round(progressStats.monthlyGoalProgress)}%
                  </Text>
                </HStack>
                <Progress
                  value={progressStats.monthlyGoalProgress}
                  colorScheme="blue"
                  size="sm"
                  borderRadius="full"
                />
              </Box>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="semibold" color={textColor}>
                Achievements
              </Text>
              
              <HStack spacing={3} flexWrap="wrap">
                {achievements.map((achievement, index) => (
                  <MotionBox
                    key={achievement.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge
                      colorScheme={achievement.color}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                    >
                      <HStack spacing={1}>
                        <Icon as={achievement.icon} />
                        <Text>{achievement.name}</Text>
                      </HStack>
                    </Badge>
                  </MotionBox>
                ))}
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Insights */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold" color={textColor}>
              Insights
            </Text>
            
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color={subtextColor}>Favorite Workout</Text>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  {progressStats.favoriteWorkoutType}
                </Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color={subtextColor}>Longest Streak</Text>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  {progressStats.longestStreak} days
                </Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color={subtextColor}>Performance Trend</Text>
                <HStack spacing={1}>
                  <Icon as={getTrendIcon()} color={getTrendColor()} />
                  <Text fontSize="sm" fontWeight="medium" color={getTrendColor()}>
                    {progressStats.improvementTrend === 'up' ? 'Improving' :
                     progressStats.improvementTrend === 'down' ? 'Declining' : 'Stable'}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <VStack spacing={3}>
        <Button
          colorScheme="blue"
          size="lg"
          w="100%"
          leftIcon={<Icon as={PiTargetBold} />}
          onClick={onStartNewWorkout}
          py={6}
        >
          Start New Workout
        </Button>
        
        <Button
          variant="ghost"
          onClick={onBack}
          size="md"
        >
          Back to Dashboard
        </Button>
      </VStack>
    </VStack>
  );
}
