import {
    Badge,
    Card,
    CardBody,
    HStack,
    Icon,
    Progress,
    Text,
    Tooltip,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { memo } from 'react';
import {
    PiChartLineBold,
    PiLightbulbBold,
    PiShieldCheckBold,
    PiTargetBold,
    PiTrendUpBold,
    PiUserBold
} from 'react-icons/pi';
import type { PersonalizationMetadata } from '../../lib/types';

interface PersonalizationStatusCardProps {
  personalizationMetadata?: PersonalizationMetadata;
  isCompact?: boolean;
}

const PersonalizationStatusCard = memo<PersonalizationStatusCardProps>(({ 
  personalizationMetadata, 
  isCompact = false 
}) => {
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.300');

  if (!personalizationMetadata) {
    return null;
  }

  const { applied, confidence, dataQuality, insights, adjustments } = personalizationMetadata;

  // Get color scheme based on data quality
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'green';
      case 'medium': return 'blue';
      case 'low': return 'yellow';
      case 'insufficient': return 'orange';
      case 'no_data': return 'gray';
      default: return 'gray';
    }
  };

  // Get risk level color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  if (isCompact) {
    return (
      <Card 
        bg={bgColor} 
        borderColor={borderColor} 
        backdropFilter="blur(12px)" 
        borderRadius="xl"
        size="sm"
      >
        <CardBody p={3}>
          <HStack spacing={3} justify="space-between">
            <HStack spacing={2}>
              <Icon 
                as={applied ? PiUserBold : PiLightbulbBold} 
                color={applied ? "green.500" : "gray.500"} 
                boxSize={4} 
              />
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                {applied ? "Personalized" : "Standard"}
              </Text>
            </HStack>
            
            {applied && (
              <HStack spacing={2}>
                <Badge colorScheme={getQualityColor(dataQuality)} variant="subtle" fontSize="xs">
                  {dataQuality}
                </Badge>
                <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                  {Math.round(confidence * 100)}%
                </Badge>
              </HStack>
            )}
          </HStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card 
      bg={bgColor} 
      borderColor={borderColor} 
      backdropFilter="blur(12px)" 
      borderRadius="xl"
    >
      <CardBody p={4}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon 
                as={applied ? PiUserBold : PiLightbulbBold} 
                color={applied ? "green.500" : "gray.500"} 
                boxSize={5} 
              />
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                {applied ? "AI Personalization Active" : "Standard Workout"}
              </Text>
            </HStack>
            
            <Badge 
              colorScheme={applied ? "green" : "gray"} 
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
            >
              {applied ? "Personalized" : "Standard"}
            </Badge>
          </HStack>

          {applied && (
            <>
              {/* Confidence and Quality Metrics */}
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <VStack spacing={1} align="start" flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color={textColor}>
                      Confidence Score
                    </Text>
                    <HStack spacing={2} width="100%">
                      <Progress 
                        value={confidence * 100} 
                        colorScheme="blue" 
                        size="sm" 
                        flex={1}
                        borderRadius="full"
                      />
                      <Text fontSize="sm" color={subtextColor} minW="40px">
                        {Math.round(confidence * 100)}%
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>

                <HStack justify="space-between" wrap="wrap" spacing={2}>
                  <Tooltip label={`Data quality: ${dataQuality}`}>
                    <Badge colorScheme={getQualityColor(dataQuality)} variant="subtle">
                      <HStack spacing={1}>
                        <Icon as={PiChartLineBold} boxSize={3} />
                        <Text>{dataQuality} data</Text>
                      </HStack>
                    </Badge>
                  </Tooltip>
                  
                  <Tooltip label={`Risk assessment: ${insights.riskLevel}`}>
                    <Badge colorScheme={getRiskColor(insights.riskLevel)} variant="subtle">
                      <HStack spacing={1}>
                        <Icon as={PiShieldCheckBold} boxSize={3} />
                        <Text>{insights.riskLevel} risk</Text>
                      </HStack>
                    </Badge>
                  </Tooltip>

                  {insights.progressiveOverloadReady && (
                    <Tooltip label="Ready for increased difficulty">
                      <Badge colorScheme="green" variant="subtle">
                        <HStack spacing={1}>
                          <Icon as={PiTrendUpBold} boxSize={3} />
                          <Text>progression ready</Text>
                        </HStack>
                      </Badge>
                    </Tooltip>
                  )}
                </HStack>
              </VStack>

              {/* Adjustments Applied */}
              {(adjustments.intensity !== 1.0 || adjustments.duration !== 0 || adjustments.volume !== 1.0) && (
                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>
                    Personalization Adjustments
                  </Text>
                  <VStack spacing={1} align="stretch">
                    {adjustments.intensity !== 1.0 && (
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Icon as={PiTargetBold} color="orange.500" boxSize={3} />
                          <Text fontSize="sm" color={subtextColor}>Intensity</Text>
                        </HStack>
                        <Text fontSize="sm" color={textColor}>
                          {adjustments.intensity > 1 ? '+' : ''}{((adjustments.intensity - 1) * 100).toFixed(0)}%
                        </Text>
                      </HStack>
                    )}
                    
                    {adjustments.duration !== 0 && (
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Icon as={PiTargetBold} color="blue.500" boxSize={3} />
                          <Text fontSize="sm" color={subtextColor}>Duration</Text>
                        </HStack>
                        <Text fontSize="sm" color={textColor}>
                          {adjustments.duration > 0 ? '+' : ''}{adjustments.duration} min
                        </Text>
                      </HStack>
                    )}
                    
                    {adjustments.volume !== 1.0 && (
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Icon as={PiTargetBold} color="purple.500" boxSize={3} />
                          <Text fontSize="sm" color={subtextColor}>Volume</Text>
                        </HStack>
                        <Text fontSize="sm" color={textColor}>
                          {adjustments.volume > 1 ? '+' : ''}{((adjustments.volume - 1) * 100).toFixed(0)}%
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              )}

              {/* Recommendations Count */}
              {insights.recommendationCount > 0 && (
                <HStack>
                  <Icon as={PiLightbulbBold} color="purple.500" boxSize={4} />
                  <Text fontSize="sm" color={textColor}>
                    {insights.recommendationCount} AI recommendation{insights.recommendationCount > 1 ? 's' : ''} applied
                  </Text>
                </HStack>
              )}
            </>
          )}

          {!applied && personalizationMetadata.reason && (
            <HStack>
              <Icon as={PiLightbulbBold} color="gray.500" boxSize={4} />
              <Text fontSize="sm" color={subtextColor}>
                {personalizationMetadata.reason === 'anonymous_user' ? 
                  'Sign in to unlock AI personalization based on your workout history' :
                  personalizationMetadata.reason
                }
              </Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
});

PersonalizationStatusCard.displayName = 'PersonalizationStatusCard';

export default PersonalizationStatusCard;
