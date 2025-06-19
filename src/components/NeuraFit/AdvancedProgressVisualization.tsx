import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Badge,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award, 
  Activity, 
  Zap,
  Trophy,
  Clock
} from 'lucide-react';

interface WorkoutData {
  date: string;
  duration: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  averageRPE: number;
  strengthScore: number;
  enduranceScore: number;
}

interface GoalProgress {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  category: 'strength' | 'endurance' | 'weight' | 'frequency';
}

interface AdvancedProgressVisualizationProps {
  workoutHistory: WorkoutData[];
  goals: GoalProgress[];
  currentStreak: number;
  totalWorkouts: number;
  averageWorkoutDuration: number;
  totalCaloriesBurned: number;
}

const COLORS = ['#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5'];

export const AdvancedProgressVisualization: React.FC<AdvancedProgressVisualizationProps> = ({
  workoutHistory,
  goals,
  currentStreak,
  totalWorkouts,
  averageWorkoutDuration,
  totalCaloriesBurned
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  // Calculate trends and insights
  const progressInsights = useMemo(() => {
    if (workoutHistory.length < 2) return null;

    const recent = workoutHistory.slice(-7); // Last 7 workouts
    const previous = workoutHistory.slice(-14, -7); // Previous 7 workouts

    const recentAvg = recent.reduce((sum, w) => sum + w.duration, 0) / recent.length;
    const previousAvg = previous.length > 0 
      ? previous.reduce((sum, w) => sum + w.duration, 0) / previous.length 
      : recentAvg;

    const durationTrend = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    const recentCalories = recent.reduce((sum, w) => sum + w.caloriesBurned, 0) / recent.length;
    const previousCalories = previous.length > 0
      ? previous.reduce((sum, w) => sum + w.caloriesBurned, 0) / previous.length
      : recentCalories;

    const caloriesTrend = ((recentCalories - previousCalories) / previousCalories) * 100;

    return {
      durationTrend,
      caloriesTrend,
      recentAvgDuration: recentAvg,
      recentAvgCalories: recentCalories
    };
  }, [workoutHistory]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return workoutHistory.slice(-30).map((workout, index) => ({
      ...workout,
      day: index + 1,
      formattedDate: new Date(workout.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [workoutHistory]);

  // Goal completion data for pie chart
  const goalCompletionData = useMemo(() => {
    const completed = goals.filter(g => g.current >= g.target).length;
    const inProgress = goals.filter(g => g.current < g.target && g.current > 0).length;
    const notStarted = goals.filter(g => g.current === 0).length;

    return [
      { name: 'Completed', value: completed, color: '#38A169' },
      { name: 'In Progress', value: inProgress, color: '#D69E2E' },
      { name: 'Not Started', value: notStarted, color: '#E53E3E' }
    ];
  }, [goals]);

  return (
    <VStack spacing={6} w="100%">
      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="100%">
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" color={subtextColor}>Current Streak</StatLabel>
              <StatNumber fontSize="2xl" color="orange.500">
                {currentStreak}
              </StatNumber>
              <StatHelpText fontSize="xs">
                <Icon as={Calendar} mr={1} />
                days
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" color={subtextColor}>Total Workouts</StatLabel>
              <StatNumber fontSize="2xl" color="blue.500">
                {totalWorkouts}
              </StatNumber>
              <StatHelpText fontSize="xs">
                <Icon as={Activity} mr={1} />
                completed
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" color={subtextColor}>Avg Duration</StatLabel>
              <StatNumber fontSize="2xl" color="green.500">
                {Math.round(averageWorkoutDuration)}
              </StatNumber>
              <StatHelpText fontSize="xs">
                <Icon as={Clock} mr={1} />
                minutes
                {progressInsights && (
                  <StatArrow 
                    type={progressInsights.durationTrend > 0 ? 'increase' : 'decrease'} 
                    ml={1}
                  />
                )}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" color={subtextColor}>Total Calories</StatLabel>
              <StatNumber fontSize="2xl" color="red.500">
                {Math.round(totalCaloriesBurned)}
              </StatNumber>
              <StatHelpText fontSize="xs">
                <Icon as={Zap} mr={1} />
                burned
                {progressInsights && (
                  <StatArrow 
                    type={progressInsights.caloriesTrend > 0 ? 'increase' : 'decrease'} 
                    ml={1}
                  />
                )}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Workout Trends Chart */}
      <Card w="100%" bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={TrendingUp} color="blue.500" />
              <Text fontSize="lg" fontWeight="bold">Workout Trends</Text>
            </HStack>
            <Badge colorScheme="blue" variant="subtle">Last 30 Days</Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  fontSize={12}
                  tick={{ fill: subtextColor }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: subtextColor }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: bgColor, 
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#3182CE" 
                  fill="#3182CE" 
                  fillOpacity={0.3}
                  name="Duration (min)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>

      {/* Goals Progress */}
      <Card w="100%" bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={Target} color="green.500" />
              <Text fontSize="lg" fontWeight="bold">Goal Progress</Text>
            </HStack>
            <Badge colorScheme="green" variant="subtle">
              {goals.filter(g => g.current >= g.target).length}/{goals.length} Complete
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {goals.map((goal) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100);
              const isCompleted = goal.current >= goal.target;
              const daysLeft = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return (
                <Box key={goal.id}>
                  <HStack justify="space-between" mb={2}>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="medium">{goal.title}</Text>
                      <Text fontSize="xs" color={subtextColor}>
                        {goal.current} / {goal.target} {goal.unit}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Badge 
                        colorScheme={isCompleted ? 'green' : daysLeft < 7 ? 'red' : 'blue'}
                        variant="subtle"
                      >
                        {isCompleted ? 'Complete' : `${daysLeft} days left`}
                      </Badge>
                      <Text fontSize="xs" color={subtextColor}>
                        {Math.round(progress)}%
                      </Text>
                    </VStack>
                  </HStack>
                  <Progress 
                    value={progress} 
                    colorScheme={isCompleted ? 'green' : progress > 75 ? 'blue' : 'orange'}
                    borderRadius="full"
                    size="sm"
                  />
                </Box>
              );
            })}
          </VStack>
        </CardBody>
      </Card>

      {/* Performance Breakdown */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
        {/* Strength vs Endurance */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <HStack>
              <Icon as={Award} color="purple.500" />
              <Text fontSize="lg" fontWeight="bold">Performance Balance</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box h="200px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    fontSize={10}
                    tick={{ fill: subtextColor }}
                  />
                  <YAxis 
                    fontSize={10}
                    tick={{ fill: subtextColor }}
                  />
                  <Tooltip />
                  <Bar dataKey="strengthScore" fill="#805AD5" name="Strength" />
                  <Bar dataKey="enduranceScore" fill="#38A169" name="Endurance" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Goal Completion Overview */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <HStack>
              <Icon as={Trophy} color="gold" />
              <Text fontSize="lg" fontWeight="bold">Goal Overview</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box h="200px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {goalCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <VStack spacing={2} mt={4}>
              {goalCompletionData.map((entry, index) => (
                <HStack key={index} justify="space-between" w="100%">
                  <HStack>
                    <Box w={3} h={3} bg={entry.color} borderRadius="full" />
                    <Text fontSize="sm">{entry.name}</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold">{entry.value}</Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Insights and Recommendations */}
      {progressInsights && (
        <Card w="100%" bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <HStack>
              <Icon as={TrendingUp} color="blue.500" />
              <Text fontSize="lg" fontWeight="bold">Insights & Recommendations</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack>
                <Icon 
                  as={progressInsights.durationTrend > 0 ? TrendingUp : TrendingUp} 
                  color={progressInsights.durationTrend > 0 ? 'green.500' : 'red.500'}
                  transform={progressInsights.durationTrend < 0 ? 'rotate(180deg)' : 'none'}
                />
                <Text fontSize="sm">
                  Your workout duration has {progressInsights.durationTrend > 0 ? 'increased' : 'decreased'} by{' '}
                  <Text as="span" fontWeight="bold" color={progressInsights.durationTrend > 0 ? 'green.500' : 'red.500'}>
                    {Math.abs(progressInsights.durationTrend).toFixed(1)}%
                  </Text>{' '}
                  compared to last week.
                </Text>
              </HStack>
              
              <Divider />
              
              <HStack>
                <Icon 
                  as={progressInsights.caloriesTrend > 0 ? Zap : Zap} 
                  color={progressInsights.caloriesTrend > 0 ? 'green.500' : 'orange.500'}
                />
                <Text fontSize="sm">
                  You're burning an average of{' '}
                  <Text as="span" fontWeight="bold" color="blue.500">
                    {Math.round(progressInsights.recentAvgCalories)}
                  </Text>{' '}
                  calories per workout this week.
                </Text>
              </HStack>
              
              <Divider />
              
              <HStack>
                <Icon as={Target} color="purple.500" />
                <Text fontSize="sm">
                  Keep up the great work! Consider increasing intensity or duration to continue progressing.
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default AdvancedProgressVisualization;
