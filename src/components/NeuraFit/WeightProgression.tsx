import {
    Box,
    Card,
    CardBody,
    CardHeader,
    HStack,
    Icon,
    Progress,
    Stat,
    StatArrow,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { memo, useMemo } from 'react';
import { PiScalesBold, PiTargetBold, PiTrendDownBold, PiTrendUpBold } from 'react-icons/pi';
import type { Exercise } from '../../lib/types';

interface WeightProgressionProps {
  exercise: Exercise;
  recentSessions?: {
    date: Date;
    weights: number[];
    reps: number[];
    notes?: string;
  }[];
  showTrends?: boolean;
  compact?: boolean;
}

export const WeightProgression = memo<WeightProgressionProps>(({
  exercise,
  recentSessions = [],
  showTrends = true,
  compact = false
}) => {
  // Color scheme
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.900', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');

  // Calculate progression metrics
  const progressionData = useMemo(() => {
    const allSessions = [
      ...recentSessions,
      ...(exercise.weightHistory || [])
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (allSessions.length === 0) {
      return {
        currentMax: exercise.weight ? Math.max(...exercise.weight) : 0,
        previousMax: 0,
        trend: 'stable' as const,
        progressPercentage: 0,
        totalVolume: 0,
        averageWeight: 0,
        sessionsCount: 0
      };
    }

    const currentSession = allSessions[allSessions.length - 1];
    const previousSession = allSessions.length > 1 ? allSessions[allSessions.length - 2] : null;

    const currentMax = Math.max(...(currentSession.weights || [0]));
    const previousMax = previousSession ? Math.max(...(previousSession.weights || [0])) : 0;

    const trend = currentMax > previousMax ? 'up' : 
                  currentMax < previousMax ? 'down' : 'stable';

    const progressPercentage = previousMax > 0 ? 
      ((currentMax - previousMax) / previousMax) * 100 : 0;

    // Calculate total volume (weight * reps * sets)
    const totalVolume = allSessions.reduce((sum, session) => {
      const sessionVolume = session.weights.reduce((sessionSum, weight, index) => {
        const reps = session.reps[index] || exercise.reps;
        return sessionSum + (weight * reps);
      }, 0);
      return sum + sessionVolume;
    }, 0);

    const averageWeight = allSessions.reduce((sum, session) => {
      const sessionAvg = session.weights.reduce((a, b) => a + b, 0) / session.weights.length;
      return sum + sessionAvg;
    }, 0) / allSessions.length;

    return {
      currentMax,
      previousMax,
      trend,
      progressPercentage: Math.abs(progressPercentage),
      totalVolume,
      averageWeight,
      sessionsCount: allSessions.length
    };
  }, [exercise, recentSessions]);

  // Personal best information
  const personalBest = useMemo(() => {
    if (exercise.personalBest) {
      return exercise.personalBest;
    }

    // Calculate from available data
    const allWeights = [
      ...(exercise.weight || []),
      ...recentSessions.flatMap(s => s.weights),
      ...(exercise.weightHistory || []).flatMap(h => h.weights)
    ];

    if (allWeights.length === 0) return null;

    return {
      maxWeight: Math.max(...allWeights),
      maxReps: exercise.reps, // Simplified for now
      bestVolume: Math.max(...allWeights) * exercise.reps * exercise.sets,
      achievedDate: new Date()
    };
  }, [exercise, recentSessions]);

  if (compact) {
    return (
      <HStack spacing={4} p={3} bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor}>
        <Icon as={PiScalesBold} color="blue.500" boxSize={5} />
        <VStack spacing={1} align="start" flex={1}>
          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            Current: {progressionData.currentMax || 'No data'} lbs
          </Text>
          {showTrends && progressionData.trend !== 'stable' && (
            <HStack spacing={1}>
              <Icon 
                as={progressionData.trend === 'up' ? PiTrendUpBold : PiTrendDownBold} 
                color={progressionData.trend === 'up' ? successColor : warningColor}
                boxSize={3}
              />
              <Text 
                fontSize="xs" 
                color={progressionData.trend === 'up' ? successColor : warningColor}
              >
                {progressionData.progressPercentage.toFixed(1)}%
              </Text>
            </HStack>
          )}
        </VStack>
        {personalBest && (
          <VStack spacing={0} align="end">
            <Text fontSize="xs" color={subtextColor}>PR</Text>
            <Text fontSize="sm" fontWeight="bold" color={successColor}>
              {personalBest.maxWeight} lbs
            </Text>
          </VStack>
        )}
      </HStack>
    );
  }

  return (
    <Card bg={bgColor} borderColor={borderColor}>
      <CardHeader pb={2}>
        <HStack spacing={2}>
          <Icon as={PiScalesBold} color="blue.500" boxSize={5} />
          <Text fontSize="md" fontWeight="bold" color={textColor}>
            Weight Progression
          </Text>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Current Stats */}
          <HStack spacing={4} justify="space-around">
            <Stat textAlign="center" size="sm">
              <StatLabel fontSize="xs">Current Max</StatLabel>
              <StatNumber fontSize="lg" color="blue.500">
                {progressionData.currentMax || 0} lbs
              </StatNumber>
              {showTrends && progressionData.trend !== 'stable' && (
                <StatHelpText mb={0}>
                  <StatArrow type={progressionData.trend === 'up' ? 'increase' : 'decrease'} />
                  {progressionData.progressPercentage.toFixed(1)}%
                </StatHelpText>
              )}
            </Stat>

            {personalBest && (
              <Stat textAlign="center" size="sm">
                <StatLabel fontSize="xs">Personal Best</StatLabel>
                <StatNumber fontSize="lg" color={successColor}>
                  {personalBest.maxWeight} lbs
                </StatNumber>
                <StatHelpText mb={0} fontSize="xs">
                  All-time record
                </StatHelpText>
              </Stat>
            )}

            <Stat textAlign="center" size="sm">
              <StatLabel fontSize="xs">Sessions</StatLabel>
              <StatNumber fontSize="lg" color="purple.500">
                {progressionData.sessionsCount}
              </StatNumber>
              <StatHelpText mb={0} fontSize="xs">
                Tracked workouts
              </StatHelpText>
            </Stat>
          </HStack>

          {/* Progress to Personal Best */}
          {personalBest && progressionData.currentMax > 0 && (
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color={textColor}>Progress to PR</Text>
                <Text fontSize="sm" color={subtextColor}>
                  {((progressionData.currentMax / personalBest.maxWeight) * 100).toFixed(0)}%
                </Text>
              </HStack>
              <Progress
                value={(progressionData.currentMax / personalBest.maxWeight) * 100}
                colorScheme="green"
                size="sm"
                borderRadius="full"
              />
            </Box>
          )}

          {/* Volume and Average */}
          {progressionData.totalVolume > 0 && (
            <HStack spacing={4} justify="space-around" pt={2} borderTop="1px" borderColor={borderColor}>
              <VStack spacing={1}>
                <Icon as={PiTargetBold} color="orange.500" boxSize={4} />
                <Text fontSize="xs" color={subtextColor}>Total Volume</Text>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  {Math.round(progressionData.totalVolume).toLocaleString()} lbs
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Icon as={PiScalesBold} color="blue.500" boxSize={4} />
                <Text fontSize="xs" color={subtextColor}>Avg Weight</Text>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  {progressionData.averageWeight.toFixed(1)} lbs
                </Text>
              </VStack>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
});

WeightProgression.displayName = 'WeightProgression';
