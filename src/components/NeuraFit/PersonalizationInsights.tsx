import {
    Badge,
    Card,
    CardBody,
    Divider,
    HStack,
    Icon,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { memo } from 'react';
import {
    PiArrowUpBold,
    PiCalendarBold,
    PiLightbulbBold,
    PiMedalBold,
    PiTargetBold,
    PiTrendUpBold
} from 'react-icons/pi';
import type { PersonalizationMetadata, WorkoutPlan } from '../../lib/types';

interface PersonalizationInsightsProps {
  workout: WorkoutPlan;
  personalizationMetadata?: PersonalizationMetadata; // Enhanced metadata from API
}

const PersonalizationInsights = memo<PersonalizationInsightsProps>(({ workout, personalizationMetadata }) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.300');
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');

  // Use enhanced metadata if available, otherwise fall back to legacy data
  const enhancedPersonalization = personalizationMetadata;
  const legacyInsights = workout.generationContext?.personalizationInsights;
  const userProgress = workout.generationContext?.userProgress;
  const recommendations = workout.generationContext?.nextWorkoutRecommendations;

  // Don't render if no personalization data is available
  if (!enhancedPersonalization && !legacyInsights && !userProgress && !recommendations) {
    return null;
  }

  return (
    <Card bg={bgColor} borderColor={borderColor} backdropFilter="blur(10px)" borderRadius="xl">
      <CardBody p={4}>
        <VStack spacing={4} align="stretch">
          <HStack>
            <Icon as={PiLightbulbBold} color="blue.500" boxSize={5} />
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              AI Personalization Insights
            </Text>
            {enhancedPersonalization && (
              <Badge
                colorScheme={enhancedPersonalization.applied ? "green" : "gray"}
                variant="subtle"
                fontSize="xs"
              >
                {enhancedPersonalization.applied ? "Personalized" : "Standard"}
              </Badge>
            )}
          </HStack>

          {/* Enhanced Personalization Data */}
          {enhancedPersonalization && (
            <VStack spacing={3} align="stretch">
              {enhancedPersonalization.applied && (
                <>
                  <HStack justify="space-between" wrap="wrap">
                    <Badge colorScheme="blue" variant="subtle">
                      {(enhancedPersonalization.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                    <Badge colorScheme="purple" variant="subtle">
                      {enhancedPersonalization.dataQuality} data quality
                    </Badge>
                    <Badge
                      colorScheme={
                        enhancedPersonalization.insights.riskLevel === 'low' ? 'green' :
                        enhancedPersonalization.insights.riskLevel === 'medium' ? 'yellow' : 'red'
                      }
                      variant="subtle"
                    >
                      {enhancedPersonalization.insights.riskLevel} risk
                    </Badge>
                  </HStack>

                  {enhancedPersonalization.insights.progressiveOverloadReady && (
                    <HStack>
                      <Icon as={PiTrendUpBold} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>
                        Ready for progressive overload - workout difficulty increased
                      </Text>
                    </HStack>
                  )}

                  {enhancedPersonalization.adjustments.intensity !== 1.0 && (
                    <HStack>
                      <Icon as={PiTargetBold} color="orange.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>
                        Intensity adjusted {enhancedPersonalization.adjustments.intensity > 1 ? 'up' : 'down'} by{' '}
                        {Math.abs((enhancedPersonalization.adjustments.intensity - 1) * 100).toFixed(0)}%
                      </Text>
                    </HStack>
                  )}

                  {enhancedPersonalization.adjustments.duration !== 0 && (
                    <HStack>
                      <Icon as={PiCalendarBold} color="blue.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>
                        Duration adjusted by {enhancedPersonalization.adjustments.duration > 0 ? '+' : ''}
                        {enhancedPersonalization.adjustments.duration} minutes
                      </Text>
                    </HStack>
                  )}

                  {enhancedPersonalization.insights.recommendationCount > 0 && (
                    <HStack>
                      <Icon as={PiMedalBold} color="purple.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>
                        {enhancedPersonalization.insights.recommendationCount} personalization{enhancedPersonalization.insights.recommendationCount > 1 ? 's' : ''} applied
                      </Text>
                    </HStack>
                  )}
                </>
              )}

              {!enhancedPersonalization.applied && enhancedPersonalization.reason && (
                <HStack>
                  <Icon as={PiLightbulbBold} color="gray.500" boxSize={4} />
                  <Text fontSize="sm" color={subtextColor}>
                    {enhancedPersonalization.reason === 'anonymous_user' ?
                      'Sign in to get personalized workouts based on your history' :
                      enhancedPersonalization.reason
                    }
                  </Text>
                </HStack>
              )}
            </VStack>
          )}

          {/* Legacy Personalization Data (fallback) */}
          {!enhancedPersonalization && legacyInsights && (
            <VStack spacing={3} align="stretch">
              {legacyInsights.appliedProgressiveOverload && (
                <HStack>
                  <Icon as={PiTrendUpBold} color="green.500" boxSize={4} />
                  <Text fontSize="sm" color={textColor}>
                    Progressive overload applied based on your workout history
                  </Text>
                </HStack>
              )}

              {legacyInsights.difficultyAdjustment !== 1.0 && (
                <HStack>
                  <Icon as={PiTargetBold} color="orange.500" boxSize={4} />
                  <Text fontSize="sm" color={textColor}>
                    Difficulty adjusted {legacyInsights.difficultyAdjustment > 1 ? 'up' : 'down'} by{' '}
                    {Math.abs((legacyInsights.difficultyAdjustment - 1) * 100).toFixed(0)}%
                  </Text>
                </HStack>
              )}

              {legacyInsights.varietyScore > 0.7 && (
                <HStack>
                  <Icon as={PiMedalBold} color="purple.500" boxSize={4} />
                  <Text fontSize="sm" color={textColor}>
                    High variety score - fresh exercises to keep you engaged
                  </Text>
                </HStack>
              )}

              {legacyInsights.personalizedNotes && legacyInsights.personalizedNotes.length > 0 && (
                <VStack align="stretch" spacing={1}>
                  {legacyInsights.personalizedNotes.map((note, index) => (
                    <Text key={index} fontSize="sm" color={subtextColor} fontStyle="italic">
                      • {note}
                    </Text>
                  ))}
                </VStack>
              )}
            </VStack>
          )}

          {userProgress && (
            <>
              <Divider />
              <VStack spacing={2} align="stretch">
                <Text fontSize="md" fontWeight="semibold" color={textColor}>
                  Your Progress
                </Text>
                <HStack justify="space-between" wrap="wrap" spacing={2}>
                  <Badge colorScheme="blue" variant="subtle">
                    {userProgress.totalWorkoutsCompleted} workouts completed
                  </Badge>
                  <Badge colorScheme="green" variant="subtle">
                    {userProgress.currentStreak} day streak
                  </Badge>
                  <Badge colorScheme="purple" variant="subtle">
                    {(userProgress.averageCompletionRate * 100).toFixed(0)}% completion rate
                  </Badge>
                </HStack>
                {userProgress.fitnessLevelProgression && (
                  <HStack>
                    <Icon as={PiArrowUpBold} color="green.500" boxSize={4} />
                    <Text fontSize="sm" color={textColor}>
                      {userProgress.fitnessLevelProgression}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </>
          )}

          {recommendations && (
            <>
              <Divider />
              <VStack spacing={2} align="stretch">
                <Text fontSize="md" fontWeight="semibold" color={textColor}>
                  Recommendations
                </Text>
                
                {recommendations.suggestedRestDays > 0 && (
                  <HStack>
                    <Icon as={PiCalendarBold} color="orange.500" boxSize={4} />
                    <Text fontSize="sm" color={textColor}>
                      Consider {recommendations.suggestedRestDays} rest day{recommendations.suggestedRestDays > 1 ? 's' : ''} before your next workout
                    </Text>
                  </HStack>
                )}

                {recommendations.recommendedNextType && (
                  <HStack>
                    <Icon as={PiTargetBold} color="blue.500" boxSize={4} />
                    <Text fontSize="sm" color={textColor}>
                      Next workout: {recommendations.recommendedNextType}
                    </Text>
                  </HStack>
                )}

                {recommendations.progressionOpportunities && recommendations.progressionOpportunities.length > 0 && (
                  <VStack align="stretch" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color={textColor}>
                      Growth opportunities:
                    </Text>
                    {recommendations.progressionOpportunities.map((opportunity, index) => (
                      <Text key={index} fontSize="sm" color={subtextColor}>
                        • {opportunity}
                      </Text>
                    ))}
                  </VStack>
                )}
              </VStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
});

PersonalizationInsights.displayName = 'PersonalizationInsights';

export default PersonalizationInsights;
