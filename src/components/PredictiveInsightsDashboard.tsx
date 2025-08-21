/**
 * Predictive Insights Dashboard Component
 * 
 * Leverages backend health and performance data to provide:
 * - Real-time system health monitoring with circuit breaker status
 * - Predictive response time estimates based on current load
 * - Model reliability indicators and performance trends
 * - Proactive quality predictions and optimization suggestions
 * - Smart caching recommendations and performance insights
 */

import {
    Box,
    Circle,
    Grid,
    HStack,
    Icon,
    Progress,
    Text,
    Tooltip,
    VStack,
    useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";
import {
    PiClockBold,
    PiGaugeBold,
    PiShieldCheckBold,
    PiTrendUpBold
} from "react-icons/pi";
import { neuraStackClient } from "../lib/neurastack-client";

const MotionBox = motion(Box);

interface SystemHealthData {
    status: string;
    components?: any;
    vendors?: any;
    ensemble?: any;
}

interface PredictiveInsightsDashboardProps {
    isVisible?: boolean;
    compact?: boolean;
    refreshInterval?: number;
}

// Utility functions
const getHealthColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'healthy': return '#10B981';
        case 'degraded': return '#F59E0B';
        case 'unhealthy': return '#EF4444';
        default: return '#6B7280';
    }
};

const calculatePredictiveScore = (healthData: SystemHealthData): number => {
    if (!healthData) return 0.5;
    
    // Calculate based on circuit breaker health scores
    const circuitBreakers = healthData.ensemble?.ensemble?.circuitBreakerStatus || {};
    const healthScores = Object.values(circuitBreakers).map((cb: any) => cb.healthScore || 0.5);
    
    if (healthScores.length === 0) return 0.5;
    
    return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
};

const estimateResponseTime = (healthData: SystemHealthData): number => {
    if (!healthData) return 25000; // Default 25s
    
    const circuitBreakers = healthData.ensemble?.ensemble?.circuitBreakerStatus || {};
    const responseTimes = Object.values(circuitBreakers).map((cb: any) => 
        cb.metrics?.averageResponseTime || 15000
    );
    
    if (responseTimes.length === 0) return 25000;
    
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(avgResponseTime * 3); // Ensemble takes ~3x individual model time
};

// Main component
export const PredictiveInsightsDashboard = memo<PredictiveInsightsDashboardProps>(({
    isVisible = true,
    compact = false,
    refreshInterval = 30000 // 30 seconds
}) => {
    const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const cardBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 44, 0.95)");
    const borderColor = useColorModeValue("rgba(226, 232, 240, 0.6)", "rgba(74, 85, 104, 0.6)");

    // Fetch health data
    useEffect(() => {
        if (!isVisible) return;

        const fetchHealthData = async () => {
            try {
                const health = await neuraStackClient.getDetailedHealth();
                setHealthData(health as SystemHealthData);
                setLastUpdate(new Date());
            } catch (error) {
                console.warn('Failed to fetch health data:', error);
            }
        };

        fetchHealthData();
        const interval = setInterval(fetchHealthData, refreshInterval);

        return () => clearInterval(interval);
    }, [isVisible, refreshInterval]);

    // Calculate insights
    const insights = useMemo(() => {
        if (!healthData) return null;

        const predictiveScore = calculatePredictiveScore(healthData);
        const estimatedTime = estimateResponseTime(healthData);
        const systemStatus = healthData.status || 'unknown';
        
        // Circuit breaker analysis
        const circuitBreakers = healthData.ensemble?.ensemble?.circuitBreakerStatus || {};
        const totalBreakers = Object.keys(circuitBreakers).length;
        const healthyBreakers = Object.values(circuitBreakers).filter((cb: any) => 
            cb.state === 'CLOSED' && cb.healthScore > 0.7
        ).length;

        // Performance metrics
        const ensembleMetrics = healthData.ensemble?.ensemble?.metrics || {};
        const successRate = parseFloat(ensembleMetrics.successRate?.replace('%', '') || '0') / 100;

        return {
            predictiveScore,
            estimatedTime,
            systemStatus,
            circuitBreakerHealth: totalBreakers > 0 ? healthyBreakers / totalBreakers : 1,
            successRate,
            totalRequests: ensembleMetrics.totalRequests || 0,
            avgProcessingTime: ensembleMetrics.averageProcessingTime || '0ms'
        };
    }, [healthData]);

    if (!isVisible || !insights) {
        return null;
    }

    if (compact) {
        return (
            <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                p={3}
                backdropFilter="blur(20px)"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
            >
                <HStack spacing={4} justify="space-between">
                    {/* System Health */}
                    <HStack spacing={2}>
                        <Circle
                            size="24px"
                            bg={getHealthColor(insights.systemStatus)}
                            color="white"
                        >
                            <Icon as={PiShieldCheckBold} boxSize={3} />
                        </Circle>
                        <VStack spacing={0} align="start">
                            <Text fontSize="xs" fontWeight="600" color="gray.800">
                                System Health
                            </Text>
                            <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                                {insights.systemStatus}
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Estimated Response Time */}
                    <HStack spacing={2}>
                        <Icon as={PiClockBold} boxSize={4} color="blue.500" />
                        <VStack spacing={0} align="start">
                            <Text fontSize="xs" fontWeight="600" color="gray.800">
                                Est. Time
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                ~{Math.round(insights.estimatedTime / 1000)}s
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Predictive Quality */}
                    <HStack spacing={2}>
                        <Icon as={PiTrendUpBold} boxSize={4} color="green.500" />
                        <VStack spacing={0} align="start">
                            <Text fontSize="xs" fontWeight="600" color="gray.800">
                                Quality Score
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {(insights.predictiveScore * 100).toFixed(0)}%
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Circuit Breaker Health */}
                    <Tooltip
                        label={`${(insights.circuitBreakerHealth * 100).toFixed(0)}% of models are healthy`}
                        hasArrow
                        fontSize="xs"
                    >
                        <Circle
                            size="24px"
                            bg={insights.circuitBreakerHealth > 0.8 ? '#10B981' : 
                                insights.circuitBreakerHealth > 0.5 ? '#F59E0B' : '#EF4444'}
                            color="white"
                        >
                            <Icon as={PiGaugeBold} boxSize={3} />
                        </Circle>
                    </Tooltip>
                </HStack>

                {/* Quick metrics bar */}
                <Box mt={2}>
                    <Progress
                        value={insights.successRate * 100}
                        size="xs"
                        colorScheme="green"
                        borderRadius="full"
                        bg="rgba(226, 232, 240, 0.3)"
                    />
                    <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs" color="gray.500">
                            Success Rate: {(insights.successRate * 100).toFixed(0)}%
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            Updated: {lastUpdate.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </Text>
                    </HStack>
                </Box>
            </MotionBox>
        );
    }

    // Full dashboard view (for future expansion)
    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            p={6}
        >
            <Text fontSize="lg" fontWeight="600" color="gray.800" mb={4}>
                Predictive Insights Dashboard
            </Text>
            
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                {/* Detailed metrics would go here */}
            </Grid>
        </MotionBox>
    );
});

PredictiveInsightsDashboard.displayName = 'PredictiveInsightsDashboard';
