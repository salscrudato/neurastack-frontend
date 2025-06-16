/**
 * Workout Insights Component
 * 
 * Displays AI-powered insights and analytics about user's workout
 * performance, preferences, and recommendations for improvement.
 */

import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Icon,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Divider,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  PiTrendUpBold,
  PiTrendDownBold,
  PiTargetBold,
  PiHeartBold,
  PiClockBold,
  PiMedalBold,
  PiChartLineBold,
  PiBrainBold,
} from 'react-icons/pi';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { generateWorkoutInsights, type WorkoutInsights } from '../../services/workoutAnalyticsService';
import { useAuthStore } from '../../store/useAuthStore';

const MotionBox = motion(Box);

interface WorkoutInsightsProps {
  onClose?: () => void;
}

const WorkoutInsightsComponent = memo(function WorkoutInsightsComponent({ onClose }: WorkoutInsightsProps) {
  const { user } = useAuthStore();
  const [insights, setInsights] = useState<WorkoutInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize theme colors to prevent unnecessary re-renders
  const colors = useMemo(() => ({
    bgColor: useColorModeValue('white', 'gray.800'),
    borderColor: useColorModeValue('gray.200', 'gray.600'),
    textColor: useColorModeValue('gray.800', 'white'),
    subtextColor: useColorModeValue('gray.600', 'gray.400'),
    activeColor: useColorModeValue('blue.500', 'blue.300'),
    successColor: useColorModeValue('green.500', 'green.300'),
    warningColor: useColorModeValue('orange.500', 'orange.300')
  }), []);

  const { bgColor, borderColor, textColor, subtextColor, activeColor, successColor, warningColor } = colors;

  const loadInsights = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const workoutInsights = await generateWorkoutInsights();
      setInsights(workoutInsights);
    } catch (err) {
      console.error('Error loading workout insights:', err);
      setError('Failed to load workout insights');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const renderProgressTrends = useCallback(() => {
    if (!insights) return null;

    const { progressTrends } = insights;
    const latestCompletion = progressTrends.completionRatesTrend[0] || 0;
    const avgCompletion = progressTrends.completionRatesTrend.reduce((sum, rate) => sum + rate, 0) / progressTrends.completionRatesTrend.length;
    const isImproving = latestCompletion > avgCompletion;

    return (
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <Icon as={PiChartLineBold} color={activeColor} />
            <Text fontWeight="bold" color={textColor}>Progress Trends</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 3, md: 4 }}>
            <Stat>
              <StatLabel>Completion Rate</StatLabel>
              <StatNumber>{latestCompletion.toFixed(1)}%</StatNumber>
              <StatHelpText>
                <StatArrow type={isImproving ? 'increase' : 'decrease'} />
                {Math.abs(latestCompletion - avgCompletion).toFixed(1)}% vs average
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Consistency Score</StatLabel>
              <StatNumber>{insights.patterns.consistencyScore.toFixed(0)}</StatNumber>
              <StatHelpText>
                <StatArrow type={insights.patterns.consistencyScore > 70 ? 'increase' : 'decrease'} />
                {insights.patterns.consistencyScore > 70 ? 'Excellent' : 'Needs improvement'}
              </StatHelpText>
            </Stat>
          </SimpleGrid>

          <Box mt={4}>
            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
              Recent Performance
            </Text>
            <Progress
              value={avgCompletion}
              colorScheme={avgCompletion > 80 ? 'green' : avgCompletion > 60 ? 'blue' : 'orange'}
              size="lg"
              borderRadius="full"
            />
            <Text fontSize="xs" color={subtextColor} mt={1}>
              Average completion rate over last 10 workouts
            </Text>
          </Box>
        </CardBody>
      </Card>
    );
  }, [insights, bgColor, borderColor, textColor, subtextColor, activeColor]);

  const renderPreferences = useCallback(() => {
    if (!insights) return null;

    const { preferences } = insights;

    return (
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <Icon as={PiHeartBold} color={successColor} />
            <Text fontWeight="bold" color={textColor}>Your Preferences</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                Preferred Workout Types
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {preferences.preferredWorkoutTypes.map((type, index) => (
                  <Badge key={index} colorScheme="blue" variant="subtle">
                    {type}
                  </Badge>
                ))}
              </HStack>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                Focus Areas
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {preferences.preferredMuscleGroups.slice(0, 5).map((muscle, index) => (
                  <Badge key={index} colorScheme="green" variant="subtle">
                    {muscle}
                  </Badge>
                ))}
              </HStack>
            </Box>

            <Divider />

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 3, md: 4 }}>
              <Box>
                <Text fontSize="sm" color={subtextColor}>Optimal Time</Text>
                <Text fontWeight="semibold" color={textColor} textTransform="capitalize">
                  {preferences.optimalWorkoutTime.replace('_', ' ')}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color={subtextColor}>Preferred Duration</Text>
                <Text fontWeight="semibold" color={textColor}>
                  {preferences.preferredDuration} min
                </Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>
    );
  }, [insights, bgColor, borderColor, textColor, subtextColor, successColor]);

  const renderPerformancePatterns = useCallback(() => {
    if (!insights) return null;

    const { patterns } = insights;

    return (
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <Icon as={PiTargetBold} color={warningColor} />
            <Text fontWeight="bold" color={textColor}>Performance Patterns</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                Best Performance Days
              </Text>
              <HStack spacing={2}>
                {patterns.bestPerformanceDays.map((day, index) => (
                  <Badge key={index} colorScheme="purple" variant="solid">
                    {day}
                  </Badge>
                ))}
              </HStack>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                Best Performance Times
              </Text>
              <HStack spacing={2}>
                {patterns.bestPerformanceTimes.map((time, index) => (
                  <Badge key={index} colorScheme="cyan" variant="solid">
                    {time.replace('_', ' ')}
                  </Badge>
                ))}
              </HStack>
            </Box>

            <Divider />

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 3, md: 4 }}>
              <Stat>
                <StatLabel>Adherence Rate</StatLabel>
                <StatNumber>{patterns.adherenceRate.toFixed(0)}%</StatNumber>
                <StatHelpText>
                  <Icon 
                    as={patterns.adherenceRate > 70 ? PiTrendUpBold : PiTrendDownBold} 
                    color={patterns.adherenceRate > 70 ? successColor : warningColor}
                  />
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Consistency</StatLabel>
                <StatNumber>{patterns.consistencyScore.toFixed(0)}</StatNumber>
                <StatHelpText>
                  <Icon 
                    as={patterns.consistencyScore > 70 ? PiMedalBold : PiClockBold} 
                    color={patterns.consistencyScore > 70 ? successColor : warningColor}
                  />
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>
    );
  }, [insights, bgColor, borderColor, textColor, warningColor, successColor]);

  const renderAIRecommendations = useCallback(() => {
    if (!insights) return null;

    const { recommendations } = insights;
    const allRecommendations = [
      ...recommendations.nextWorkoutSuggestions,
      ...recommendations.progressionRecommendations,
      ...recommendations.recoveryRecommendations,
      ...recommendations.goalAdjustments
    ];

    if (allRecommendations.length === 0) {
      return null;
    }

    return (
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <Icon as={PiBrainBold} color={activeColor} />
            <Text fontWeight="bold" color={textColor}>AI Recommendations</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {allRecommendations.slice(0, 5).map((recommendation, index) => (
              <Alert key={index} status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertDescription fontSize="sm">
                    {recommendation}
                  </AlertDescription>
                </Box>
              </Alert>
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  }, [insights, bgColor, borderColor, textColor, activeColor]);

  if (isLoading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" color={activeColor} mb={4} />
        <Text color={subtextColor}>Analyzing your workout data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error Loading Insights</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
        <Button mt={4} onClick={loadInsights} colorScheme="blue">
          Retry
        </Button>
      </Box>
    );
  }

  if (!insights) {
    return (
      <Box p={6} textAlign="center">
        <Icon as={PiChartLineBold} boxSize={12} color={subtextColor} mb={4} />
        <Text fontSize="lg" fontWeight="semibold" color={textColor} mb={2}>
          No Insights Available
        </Text>
        <Text color={subtextColor}>
          Complete a few workouts to see personalized insights and recommendations.
        </Text>
      </Box>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <VStack spacing={{ base: 4, md: 6 }} p={{ base: 4, md: 6 }} align="stretch">
        <Box textAlign="center" px={{ base: 2, md: 0 }}>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor} mb={2}>
            Your Workout Insights
          </Text>
          <Text color={subtextColor} fontSize={{ base: "sm", md: "md" }}>
            AI-powered analysis of your fitness journey
          </Text>
        </Box>

        {renderProgressTrends()}
        {renderPreferences()}
        {renderPerformancePatterns()}
        {renderAIRecommendations()}

        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size={{ base: "lg", md: "lg" }}
            minH={{ base: "48px", md: "auto" }}
            w={{ base: "100%", md: "auto" }}
          >
            Close Insights
          </Button>
        )}
      </VStack>
    </MotionBox>
  );
});

export default WorkoutInsightsComponent;
