/**
 * API Response Analytics Component
 * 
 * Displays comprehensive analytics and insights from the NeuraStack API response
 * including performance metrics, cost analysis, and quality indicators.
 * Mobile-first design with enhanced data visualization.
 */

import {
    Badge,
    Box,
    Flex,
    HStack,
    Icon,
    Progress,
    SimpleGrid,
    Text,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { memo } from 'react';
import {
    PiChartBarBold,
    PiClockBold,
    PiCurrencyDollarBold,
    PiLightningBold,
    PiTargetBold,
    PiTrendUpBold
} from 'react-icons/pi';

// ============================================================================
// Component Props
// ============================================================================

interface APIResponseAnalyticsProps {
    /** API response metadata */
    metadata: any;
    /** Whether to show compact view */
    compact?: boolean;
    /** Whether to show on mobile */
    showOnMobile?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
};

const formatCost = (cost: number) => {
    if (cost < 0.001) return `$${(cost * 1000).toFixed(3)}k`;
    return `$${cost.toFixed(4)}`;
};

const getPerformanceColor = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return '#10B981'; // Green
    if (value >= thresholds.fair) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
};

const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981'; // Green
    if (confidence >= 0.6) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
};

// ============================================================================
// Metric Component
// ============================================================================

interface MetricProps {
    label: string;
    value: string | number;
    icon: any;
    color?: string;
    tooltip?: string;
    progress?: number;
    compact?: boolean;
}

const Metric = memo(function Metric({ 
    label, 
    value, 
    icon, 
    color = '#64748B', 
    tooltip, 
    progress,
    compact = false 
}: MetricProps) {
    const content = (
        <VStack 
            spacing={compact ? 1 : 2} 
            align="center" 
            p={compact ? 2 : 3}
            bg="rgba(255, 255, 255, 0.8)"
            borderRadius="lg"
            border="1px solid"
            borderColor="rgba(226, 232, 240, 0.6)"
            minH={compact ? "60px" : "80px"}
            justify="center"
        >
            <Icon as={icon} color={color} boxSize={compact ? 4 : 5} />
            <Text 
                fontSize={compact ? "sm" : "md"} 
                fontWeight="700" 
                color="#1E293B"
                textAlign="center"
            >
                {value}
            </Text>
            <Text 
                fontSize="xs" 
                color="#64748B" 
                fontWeight="600" 
                textAlign="center"
                letterSpacing="0.025em"
            >
                {label.toUpperCase()}
            </Text>
            {progress !== undefined && (
                <Progress
                    value={progress * 100}
                    colorScheme={
                        progress > 0.8 ? "green" : progress > 0.6 ? "yellow" : "red"
                    }
                    size="sm"
                    w="100%"
                    borderRadius="full"
                />
            )}
        </VStack>
    );

    if (tooltip) {
        return (
            <Tooltip label={tooltip} hasArrow fontSize="xs">
                {content}
            </Tooltip>
        );
    }

    return content;
});

// ============================================================================
// Main Component
// ============================================================================

export const APIResponseAnalytics = memo(function APIResponseAnalytics({
    metadata,
    compact = false,
    showOnMobile = true
}: APIResponseAnalyticsProps) {
    if (!metadata) return null;

    const {
        processingTimeMs,
        totalRoles,
        successfulRoles,
        failedRoles,
        confidenceAnalysis,
        costEstimate,
        synthesis,
        voting
    } = metadata;

    // Calculate derived metrics
    const successRate = totalRoles > 0 ? (successfulRoles / totalRoles) : 0;
    const overallConfidence = confidenceAnalysis?.overallConfidence || 0;
    const modelAgreement = confidenceAnalysis?.modelAgreement || 0;
    const responseConsistency = confidenceAnalysis?.responseConsistency || 0;

    // Performance thresholds
    const timeThresholds = { good: 2000, fair: 5000 }; // ms
    const confidenceThresholds = { good: 0.8, fair: 0.6 };

    return (
        <Box
            display={{ base: showOnMobile ? "block" : "none", md: "block" }}
            w="100%"
        >
            <VStack spacing={compact ? 2 : 3} align="stretch">
                {/* Performance Metrics */}
                <SimpleGrid 
                    columns={{ base: 2, sm: 3, md: 4, lg: 5 }} 
                    spacing={{ base: 2, md: 3 }}
                >
                    {/* Processing Time */}
                    {processingTimeMs && (
                        <Metric
                            label="Response Time"
                            value={formatTime(processingTimeMs)}
                            icon={PiClockBold}
                            color={getPerformanceColor(processingTimeMs, timeThresholds)}
                            tooltip={`Total processing time: ${processingTimeMs}ms`}
                            compact={compact}
                        />
                    )}

                    {/* Success Rate */}
                    <Metric
                        label="Success Rate"
                        value={`${Math.round(successRate * 100)}%`}
                        icon={PiTargetBold}
                        color={getPerformanceColor(successRate, confidenceThresholds)}
                        tooltip={`${successfulRoles}/${totalRoles} models succeeded`}
                        progress={successRate}
                        compact={compact}
                    />

                    {/* Overall Confidence */}
                    {overallConfidence > 0 && (
                        <Metric
                            label="Confidence"
                            value={`${Math.round(overallConfidence * 100)}%`}
                            icon={PiTrendUpBold}
                            color={getConfidenceColor(overallConfidence)}
                            tooltip="Overall response confidence score"
                            progress={overallConfidence}
                            compact={compact}
                        />
                    )}

                    {/* Model Agreement */}
                    {modelAgreement > 0 && (
                        <Metric
                            label="Agreement"
                            value={`${Math.round(modelAgreement * 100)}%`}
                            icon={PiChartBarBold}
                            color={getConfidenceColor(modelAgreement)}
                            tooltip="Level of agreement between AI models"
                            progress={modelAgreement}
                            compact={compact}
                        />
                    )}

                    {/* Cost Estimate */}
                    {costEstimate?.totalCost && (
                        <Metric
                            label="Cost"
                            value={formatCost(costEstimate.totalCost)}
                            icon={PiCurrencyDollarBold}
                            color="#F59E0B"
                            tooltip={`Estimated cost for ${costEstimate.totalTokens || 0} tokens`}
                            compact={compact}
                        />
                    )}
                </SimpleGrid>

                {/* Enhanced Insights - Mobile Optimized */}
                {!compact && (
                    <Flex
                        direction={{ base: "column", sm: "row" }}
                        gap={{ base: 2, sm: 3 }}
                        wrap="wrap"
                        justify="flex-start"
                        align={{ base: "stretch", sm: "center" }}
                    >
                        {/* Synthesis Strategy */}
                        {synthesis?.synthesisStrategy && (
                            <Badge
                                colorScheme="blue"
                                variant="subtle"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize={{ base: "xs", md: "sm" }}
                                fontWeight="600"
                            >
                                Strategy: {synthesis.synthesisStrategy.toUpperCase()}
                            </Badge>
                        )}

                        {/* Voting Winner */}
                        {voting?.winner && (
                            <Badge
                                colorScheme="purple"
                                variant="subtle"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize={{ base: "xs", md: "sm" }}
                                fontWeight="600"
                            >
                                Winner: {voting.winner.toUpperCase()}
                            </Badge>
                        )}

                        {/* Response Consistency */}
                        {responseConsistency > 0 && (
                            <Badge
                                colorScheme={
                                    responseConsistency > 0.8 ? "green" :
                                    responseConsistency > 0.6 ? "yellow" : "red"
                                }
                                variant="subtle"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize={{ base: "xs", md: "sm" }}
                                fontWeight="600"
                            >
                                {Math.round(responseConsistency * 100)}% Consistency
                            </Badge>
                        )}
                    </Flex>
                )}
            </VStack>
        </Box>
    );
});
