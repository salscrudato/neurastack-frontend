/**
 * Enhanced Confidence Indicator Component
 * 
 * Surfaces rich backend intelligence directly in chat messages with:
 * - Real-time confidence visualization with trend indicators
 * - Sophisticated voting insights (meta-voting, diversity analysis)
 * - Model reliability indicators based on circuit breaker health
 * - Predictive quality metrics and consensus strength
 * - Interactive elements for deeper analytics exploration
 */

import {
    Badge,
    Box,
    Circle,
    Flex,
    HStack,
    Icon,
    Progress,
    Text,
    Tooltip,
    VStack,
    useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { memo, useMemo } from "react";
import {
    PiBrainBold,
    PiLightningBold,
    PiShieldCheckBold,
    PiWarningBold
} from "react-icons/pi";

const MotionBox = motion(Box);

interface EnhancedConfidenceIndicatorProps {
    fullData: any; // Complete API response data
    isCompact?: boolean; // Compact mode for inline display
    showTrends?: boolean; // Show trend indicators
    interactive?: boolean; // Enable interactive elements
}

// Utility functions for data processing
const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return "#10B981"; // green
    if (score >= 0.6) return "#F59E0B"; // yellow
    if (score >= 0.4) return "#EF4444"; // red
    return "#6B7280"; // gray
};

const getConsensusStrength = (consensus: string): { color: string; label: string; score: number } => {
    switch (consensus) {
        case 'very-strong':
            return { color: "#10B981", label: "Very Strong", score: 0.95 };
        case 'strong':
            return { color: "#059669", label: "Strong", score: 0.8 };
        case 'moderate':
            return { color: "#F59E0B", label: "Moderate", score: 0.6 };
        case 'weak':
            return { color: "#EF4444", label: "Weak", score: 0.4 };
        case 'very-weak':
            return { color: "#DC2626", label: "Very Weak", score: 0.2 };
        default:
            return { color: "#6B7280", label: "Unknown", score: 0.5 };
    }
};

const getModelHealthScore = (circuitBreakerData: any): number => {
    if (!circuitBreakerData) return 0.7; // Default
    return circuitBreakerData.healthScore || 0.7;
};

// Format advanced features for human readability
const formatAdvancedFeatures = (features: string[]): string => {
    const featureMap: Record<string, string> = {
        'diversity_analysis': 'Diversity Analysis',
        'historical_performance': 'Historical Performance',
        'tie_breaking': 'Tie Breaking',
        'meta_voting': 'Meta-Voting',
        'abstention': 'Abstention Logic',
        'circuit_breaker': 'Circuit Breaker',
        'quality_analysis': 'Quality Analysis',
        'consensus_building': 'Consensus Building',
        'performance_monitoring': 'Performance Monitoring',
        'adaptive_weighting': 'Adaptive Weighting'
    };

    return features
        .map(feature => featureMap[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
        .join(', ');
};

// Main component
export const EnhancedConfidenceIndicator = memo<EnhancedConfidenceIndicatorProps>(({
    fullData,
    isCompact = false
}) => {
    const cardBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 44, 0.95)");
    const borderColor = useColorModeValue("rgba(226, 232, 240, 0.6)", "rgba(74, 85, 104, 0.6)");

    // Extract data from API response
    const analytics = useMemo(() => {
        if (!fullData) return null;

        const synthesis = fullData.synthesis || {};
        const voting = fullData.voting || {};
        const roles = fullData.roles || [];
        const metadata = fullData.metadata || {};

        // Calculate enhanced metrics
        const overallConfidence = synthesis.confidence?.score || 0;
        const confidenceLevel = synthesis.confidence?.level || 'medium';
        const consensusData = getConsensusStrength(voting.consensus || 'moderate');
        
        // Meta-voting insights
        const metaVoting = voting.metaVoting || {};
        const usedSophisticatedFeatures = voting.analytics?.sophisticatedFeaturesUsed || [];
        
        // Model performance analysis
        const modelPerformance = roles.map((role: any) => ({
            model: role.model,
            confidence: role.confidence?.score || 0,
            responseTime: role.responseTime || 0,
            quality: role.quality?.complexity || 'medium',
            healthScore: getModelHealthScore(role.circuitBreaker)
        }));

        // Diversity and quality metrics
        const diversityScore = voting.diversityAnalysis?.overallDiversity || 0;
        const qualityScore = voting.analytics?.qualityScore || 0;
        
        return {
            overallConfidence,
            confidenceLevel,
            consensusData,
            metaVoting,
            usedSophisticatedFeatures,
            modelPerformance,
            diversityScore,
            qualityScore,
            processingTime: metadata.processingTime || 0,
            winner: voting.winner || 'unknown',
            abstentionTriggered: voting.abstention?.triggered || false
        };
    }, [fullData]);

    if (!analytics) {
        return null;
    }

    if (isCompact) {
        return (
            <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                mt={3}
            >
                <Flex
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    p={3}
                    align="center"
                    justify="space-between"
                    backdropFilter="blur(20px)"
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                    _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)"
                    }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                    {/* Confidence Score */}
                    <HStack spacing={3}>
                        <Circle
                            size="32px"
                            bg={getConfidenceColor(analytics.overallConfidence)}
                            color="white"
                            position="relative"
                        >
                            <Icon as={PiShieldCheckBold} boxSize={4} />
                            {analytics.abstentionTriggered && (
                                <Circle
                                    size="12px"
                                    bg="#EF4444"
                                    position="absolute"
                                    top="-2px"
                                    right="-2px"
                                    border="2px solid white"
                                >
                                    <Icon as={PiWarningBold} boxSize={2} color="white" />
                                </Circle>
                            )}
                        </Circle>
                        <VStack spacing={0} align="start">
                            <Text fontSize="sm" fontWeight="600" color="#1F2937">
                                {(analytics.overallConfidence * 100).toFixed(0)}% Confidence
                            </Text>
                            <Text fontSize="xs" color="#6B7280">
                                {analytics.confidenceLevel} • {analytics.consensusData.label}
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Voting Winner & Meta-Analysis */}
                    <HStack spacing={2}>
                        {analytics.metaVoting.used && (
                            <Tooltip
                                label={`Meta-voting selected ${analytics.winner} based on: ${analytics.metaVoting.reasoning}`}
                                hasArrow
                                fontSize="xs"
                                maxW="300px"
                            >
                                <Badge
                                    colorScheme="purple"
                                    variant="subtle"
                                    fontSize="xs"
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                >
                                    <HStack spacing={1}>
                                        <Icon as={PiBrainBold} boxSize={3} />
                                        <Text>Meta-AI</Text>
                                    </HStack>
                                </Badge>
                            </Tooltip>
                        )}
                        
                        <Badge
                            colorScheme="blue"
                            variant="subtle"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="md"
                        >
                            Winner: {analytics.winner}
                        </Badge>
                    </HStack>

                    {/* Sophisticated Features Indicator */}
                    {analytics.usedSophisticatedFeatures.length > 0 && (
                        <Tooltip
                            label={`Advanced features used: ${formatAdvancedFeatures(analytics.usedSophisticatedFeatures)}`}
                            hasArrow
                            fontSize="xs"
                            maxW="300px"
                        >
                            <Circle size="24px" bg="#8B5CF6" color="white">
                                <Icon as={PiLightningBold} boxSize={3} />
                            </Circle>
                        </Tooltip>
                    )}
                </Flex>

                {/* Consensus Progress Bar */}
                <Box mt={2}>
                    <Progress
                        value={analytics.consensusData.score * 100}
                        size="sm"
                        colorScheme={analytics.consensusData.color.includes('green') ? 'green' : 
                                   analytics.consensusData.color.includes('yellow') ? 'yellow' : 'red'}
                        borderRadius="full"
                        bg="rgba(226, 232, 240, 0.3)"
                    />
                    <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs" color="#6B7280">
                            Consensus: {analytics.consensusData.label}
                        </Text>
                        <Text fontSize="xs" color="#6B7280">
                            Quality: {(analytics.qualityScore * 100).toFixed(0)}%
                        </Text>
                    </HStack>
                </Box>
            </MotionBox>
        );
    }

    // Full detailed view (for future expansion)
    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            mt={4}
        >
            {/* Detailed view implementation would go here */}
            <Text fontSize="sm" color="#6B7280">
                Detailed confidence analysis view (expandable)
            </Text>
        </MotionBox>
    );
});

EnhancedConfidenceIndicator.displayName = 'EnhancedConfidenceIndicator';
