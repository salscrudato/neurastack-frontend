/**
 * Ensemble Overview Component
 * 
 * Displays overall ensemble performance metrics, synthesis strategy,
 * model agreement levels, and quality distribution for user testing purposes.
 */

import {
    Badge,
    Box,
    Divider,
    Flex,
    HStack,
    Icon,
    SimpleGrid,
    Text,
    VStack
} from '@chakra-ui/react';
import {
    PiChartBarBold,
    PiCheckCircleBold,
    PiClockBold,
    PiCurrencyDollarBold,
    PiTargetBold
} from 'react-icons/pi';
import type { EnsembleOverviewData } from '../hooks/useModelResponses';

// ============================================================================
// Component Props
// ============================================================================

interface EnsembleOverviewProps {
  /** Ensemble overview data */
  data: EnsembleOverviewData;
  
  /** Whether to show compact view */
  compact?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function EnsembleOverview({ data, compact = false }: EnsembleOverviewProps) {
  // Modern color values
  const cardBg = 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)';
  const borderColor = '#E2E8F0';
  const textColor = '#1E293B';
  const mutedColor = '#64748B';
  const accentColor = '#4F9CF9';

  // Calculate success rate
  const successRate = data.totalRoles > 0 ? (data.successfulRoles / data.totalRoles) * 100 : 0;
  
  // Format processing time
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981'; // Green
    if (confidence >= 0.6) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const confidenceColor = data.confidenceAnalysis?.overallConfidence 
    ? getConfidenceColor(data.confidenceAnalysis.overallConfidence)
    : '#64748B';

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      p={compact ? 4 : 6}
      w="100%"
    >
      <VStack spacing={compact ? 3 : 4} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Text fontSize={compact ? "md" : "lg"} fontWeight="700" color={textColor}>
              Ensemble Performance
            </Text>
            <Text fontSize="sm" color={mutedColor} fontWeight="500">
              AI model collaboration insights
            </Text>
          </VStack>
          
          <Badge
            colorScheme={data.synthesisStatus === 'success' ? 'green' : 'red'}
            variant="solid"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            fontWeight="600"
          >
            {data.synthesisStatus.toUpperCase()}
          </Badge>
        </Flex>

        {/* Key Metrics Grid */}
        <SimpleGrid columns={compact ? 2 : 4} spacing={compact ? 3 : 4}>
          {/* Success Rate */}
          <VStack spacing={1} align="center">
            <Icon as={PiCheckCircleBold} color="#10B981" boxSize={5} />
            <Text fontSize="xl" fontWeight="700" color={textColor}>
              {Math.round(successRate)}%
            </Text>
            <Text fontSize="xs" color={mutedColor} fontWeight="600" textAlign="center">
              SUCCESS RATE
            </Text>
          </VStack>

          {/* Processing Time */}
          <VStack spacing={1} align="center">
            <Icon as={PiClockBold} color={accentColor} boxSize={5} />
            <Text fontSize="xl" fontWeight="700" color={textColor}>
              {formatTime(data.processingTimeMs)}
            </Text>
            <Text fontSize="xs" color={mutedColor} fontWeight="600" textAlign="center">
              TOTAL TIME
            </Text>
          </VStack>

          {/* Overall Confidence */}
          {data.confidenceAnalysis?.overallConfidence && (
            <VStack spacing={1} align="center">
              <Icon as={PiTargetBold} color={confidenceColor} boxSize={5} />
              <Text fontSize="xl" fontWeight="700" color={textColor}>
                {Math.round(data.confidenceAnalysis.overallConfidence * 100)}%
              </Text>
              <Text fontSize="xs" color={mutedColor} fontWeight="600" textAlign="center">
                CONFIDENCE
              </Text>
            </VStack>
          )}

          {/* Model Agreement */}
          {data.confidenceAnalysis?.modelAgreement && (
            <VStack spacing={1} align="center">
              <Icon as={PiChartBarBold} color="#8B5CF6" boxSize={5} />
              <Text fontSize="xl" fontWeight="700" color={textColor}>
                {Math.round(data.confidenceAnalysis.modelAgreement * 100)}%
              </Text>
              <Text fontSize="xs" color={mutedColor} fontWeight="600" textAlign="center">
                AGREEMENT
              </Text>
            </VStack>
          )}
        </SimpleGrid>

        {/* Quality Distribution */}
        {data.confidenceAnalysis?.qualityDistribution && !compact && (
          <>
            <Divider borderColor={borderColor} />
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" fontWeight="600" color={textColor}>
                Quality Distribution
              </Text>
              
              <VStack spacing={2} align="stretch">
                {/* High Quality */}
                <HStack justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Box w="12px" h="12px" borderRadius="full" bg="#10B981" />
                    <Text fontSize="sm" color={textColor} fontWeight="500">
                      High Quality
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={textColor} fontWeight="600">
                    {data.confidenceAnalysis.qualityDistribution.high} models
                  </Text>
                </HStack>

                {/* Medium Quality */}
                <HStack justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Box w="12px" h="12px" borderRadius="full" bg="#F59E0B" />
                    <Text fontSize="sm" color={textColor} fontWeight="500">
                      Medium Quality
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={textColor} fontWeight="600">
                    {data.confidenceAnalysis.qualityDistribution.medium} models
                  </Text>
                </HStack>

                {/* Low Quality */}
                <HStack justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Box w="12px" h="12px" borderRadius="full" bg="#EF4444" />
                    <Text fontSize="sm" color={textColor} fontWeight="500">
                      Low Quality
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={textColor} fontWeight="600">
                    {data.confidenceAnalysis.qualityDistribution.low} models
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </>
        )}

        {/* Cost Information */}
        {data.costEstimate && !compact && (
          <>
            <Divider borderColor={borderColor} />
            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                <Icon as={PiCurrencyDollarBold} color="#F59E0B" boxSize={4} />
                <Text fontSize="sm" color={textColor} fontWeight="600">
                  Estimated Cost
                </Text>
              </HStack>
              <VStack align="end" spacing={0}>
                <Text fontSize="sm" color={textColor} fontWeight="700">
                  {data.costEstimate.estimatedCost}
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  {data.costEstimate.totalTokens} tokens
                </Text>
              </VStack>
            </HStack>
          </>
        )}

        {/* Synthesis Strategy */}
        {data.synthesisStrategy && (
          <HStack justify="center" align="center" pt={2}>
            <Badge
              colorScheme="blue"
              variant="subtle"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="600"
            >
              Strategy: {data.synthesisStrategy.toUpperCase()}
            </Badge>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
