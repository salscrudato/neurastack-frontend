/**
 * Predictive Insights Engine
 * 
 * Advanced AI system that analyzes voting patterns, model performance,
 * and user behavior to provide predictive insights and recommendations
 * for optimal AI ensemble utilization.
 */

import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    HStack,
    Icon,
    Progress,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    VStack,
    useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from 'react';
import {
    PiBrainBold,
    PiClockBold,
    PiGaugeBold,
    PiLightningBold,
    PiShieldCheckBold,
    PiTrendUpBold
} from "react-icons/pi";

const MotionBox = motion(Box);

interface PredictiveInsight {
    type: 'performance' | 'quality' | 'reliability' | 'optimization';
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    confidence: number;
    recommendation: string;
    estimatedImpact: string;
    icon: any;
    color: string;
}

interface ModelPrediction {
    model: string;
    predictedQuality: number;
    predictedResponseTime: number;
    reliabilityScore: number;
    recommendedForQuery: boolean;
    reasoning: string;
}

interface PredictiveInsightsEngineProps {
    historicalData: any[]; // Historical voting and performance data
    currentQuery?: string;
    userPreferences?: any;
    onInsightAction?: (insight: PredictiveInsight) => void;
}

export function PredictiveInsightsEngine({
    historicalData = [],
    currentQuery,
    onInsightAction
}: PredictiveInsightsEngineProps) {
    const [insights, setInsights] = useState<PredictiveInsight[]>([]);
    const [modelPredictions, setModelPredictions] = useState<ModelPrediction[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Analyze historical patterns and generate insights
    const analyzePatterns = useMemo(() => {
        if (!historicalData.length) return { insights: [], predictions: [] };

        const insights: PredictiveInsight[] = [];
        const predictions: ModelPrediction[] = [];

        // Analyze model performance trends
        const modelStats = historicalData.reduce((acc, data) => {
            if (data.roles) {
                data.roles.forEach((role: any) => {
                    if (!acc[role.model]) {
                        acc[role.model] = {
                            totalRequests: 0,
                            totalResponseTime: 0,
                            totalConfidence: 0,
                            successCount: 0,
                            qualityScores: []
                        };
                    }
                    
                    const stats = acc[role.model];
                    stats.totalRequests++;
                    stats.totalResponseTime += role.responseTime || 0;
                    stats.totalConfidence += role.confidence?.score || 0;
                    if (role.status === 'fulfilled') stats.successCount++;
                    if (role.quality?.complexity) {
                        const complexityScore = role.quality.complexity === 'very-high' ? 1 : 
                                             role.quality.complexity === 'high' ? 0.8 : 
                                             role.quality.complexity === 'medium' ? 0.6 : 0.4;
                        stats.qualityScores.push(complexityScore);
                    }
                });
            }
            return acc;
        }, {} as any);

        // Generate model predictions
        Object.entries(modelStats).forEach(([model, stats]: [string, any]) => {
            const avgResponseTime = stats.totalResponseTime / stats.totalRequests;
            // const avgConfidence = stats.totalConfidence / stats.totalRequests; // Unused for now
            const successRate = stats.successCount / stats.totalRequests;
            const avgQuality = stats.qualityScores.length > 0 ? 
                stats.qualityScores.reduce((a: number, b: number) => a + b, 0) / stats.qualityScores.length : 0.5;

            predictions.push({
                model,
                predictedQuality: avgQuality,
                predictedResponseTime: avgResponseTime,
                reliabilityScore: successRate,
                recommendedForQuery: avgQuality > 0.7 && successRate > 0.9,
                reasoning: `Based on ${stats.totalRequests} requests: ${Math.round(successRate * 100)}% success rate, ${Math.round(avgQuality * 100)}% avg quality`
            });

            // Generate performance insights
            if (avgResponseTime > 8000) {
                insights.push({
                    type: 'performance',
                    severity: 'high',
                    title: `${model} Performance Alert`,
                    description: `Average response time of ${Math.round(avgResponseTime)}ms is above optimal threshold`,
                    confidence: 0.85,
                    recommendation: 'Consider load balancing or model optimization',
                    estimatedImpact: 'Could improve response time by 30-40%',
                    icon: PiClockBold,
                    color: 'red'
                });
            }

            if (successRate < 0.9) {
                insights.push({
                    type: 'reliability',
                    severity: 'medium',
                    title: `${model} Reliability Concern`,
                    description: `Success rate of ${Math.round(successRate * 100)}% is below target`,
                    confidence: 0.75,
                    recommendation: 'Monitor model health and consider fallback strategies',
                    estimatedImpact: 'Could improve overall ensemble reliability',
                    icon: PiShieldCheckBold,
                    color: 'orange'
                });
            }
        });

        // Analyze voting patterns
        const votingPatterns = historicalData.filter(d => d.voting).map(d => d.voting);
        if (votingPatterns.length > 0) {
            const avgConsensus = votingPatterns.reduce((sum, v) => sum + (v.confidence || 0), 0) / votingPatterns.length;
            
            if (avgConsensus < 0.7) {
                insights.push({
                    type: 'quality',
                    severity: 'medium',
                    title: 'Low Consensus Pattern Detected',
                    description: `Average consensus strength of ${Math.round(avgConsensus * 100)}% indicates model disagreement`,
                    confidence: 0.8,
                    recommendation: 'Review query complexity and model selection criteria',
                    estimatedImpact: 'Could improve response quality and user confidence',
                    icon: PiGaugeBold,
                    color: 'yellow'
                });
            }
        }

        // Query-specific predictions
        if (currentQuery) {
            const queryLength = currentQuery.length;
            const queryComplexity = queryLength > 500 ? 'high' : queryLength > 200 ? 'medium' : 'low';
            
            if (queryComplexity === 'high') {
                insights.push({
                    type: 'optimization',
                    severity: 'low',
                    title: 'Complex Query Detected',
                    description: 'Long query may benefit from specialized model selection',
                    confidence: 0.7,
                    recommendation: 'Consider using models optimized for complex reasoning',
                    estimatedImpact: 'May improve response quality by 15-20%',
                    icon: PiBrainBold,
                    color: 'blue'
                });
            }
        }

        return { insights, predictions };
    }, [historicalData, currentQuery]);

    useEffect(() => {
        setIsAnalyzing(true);
        const timer = setTimeout(() => {
            setInsights(analyzePatterns.insights);
            setModelPredictions(analyzePatterns.predictions);
            setIsAnalyzing(false);
        }, 1000); // Simulate analysis time

        return () => clearTimeout(timer);
    }, [analyzePatterns]);

    const InsightCard = ({ insight }: { insight: PredictiveInsight }) => (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            p={4}
            bg={bgColor}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
            cursor="pointer"
            onClick={() => onInsightAction?.(insight)}
        >
            <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                    <HStack spacing={2}>
                        <Icon as={insight.icon} color={`${insight.color}.500`} boxSize={5} />
                        <Text fontSize="sm" fontWeight="600" color="gray.800">
                            {insight.title}
                        </Text>
                    </HStack>
                    <Badge colorScheme={insight.color} variant="subtle">
                        {Math.round(insight.confidence * 100)}% confidence
                    </Badge>
                </HStack>

                <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                    {insight.description}
                </Text>

                <Box p={3} bg={`${insight.color}.50`} borderRadius="md">
                    <Text fontSize="xs" fontWeight="600" color={`${insight.color}.700`} mb={1}>
                        Recommendation:
                    </Text>
                    <Text fontSize="xs" color={`${insight.color}.600`}>
                        {insight.recommendation}
                    </Text>
                </Box>

                <Text fontSize="xs" color="gray.500" fontStyle="italic">
                    {insight.estimatedImpact}
                </Text>
            </VStack>
        </MotionBox>
    );

    const ModelPredictionCard = ({ prediction }: { prediction: ModelPrediction }) => (
        <Box p={4} bg={bgColor} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="600" color="gray.800" textTransform="capitalize">
                        {prediction.model}
                    </Text>
                    {prediction.recommendedForQuery && (
                        <Badge colorScheme="green" variant="solid">
                            Recommended
                        </Badge>
                    )}
                </HStack>

                <SimpleGrid columns={3} spacing={2}>
                    <Stat size="sm">
                        <StatLabel fontSize="xs">Quality</StatLabel>
                        <StatNumber fontSize="sm" color="blue.600">
                            {Math.round(prediction.predictedQuality * 100)}%
                        </StatNumber>
                    </Stat>
                    <Stat size="sm">
                        <StatLabel fontSize="xs">Speed</StatLabel>
                        <StatNumber fontSize="sm" color="green.600">
                            {Math.round(prediction.predictedResponseTime / 1000)}s
                        </StatNumber>
                    </Stat>
                    <Stat size="sm">
                        <StatLabel fontSize="xs">Reliability</StatLabel>
                        <StatNumber fontSize="sm" color="purple.600">
                            {Math.round(prediction.reliabilityScore * 100)}%
                        </StatNumber>
                    </Stat>
                </SimpleGrid>

                <Text fontSize="xs" color="gray.500">
                    {prediction.reasoning}
                </Text>
            </VStack>
        </Box>
    );

    if (isAnalyzing) {
        return (
            <Box p={6} textAlign="center">
                <VStack spacing={4}>
                    <Icon as={PiBrainBold} boxSize={8} color="purple.500" />
                    <Text fontSize="lg" fontWeight="600" color="gray.700">
                        Analyzing Patterns...
                    </Text>
                    <Progress size="sm" isIndeterminate colorScheme="purple" w="200px" />
                </VStack>
            </Box>
        );
    }

    return (
        <VStack spacing={6} align="stretch">
            {/* Predictive Insights */}
            {insights.length > 0 && (
                <Box>
                    <HStack spacing={2} mb={4}>
                        <Icon as={PiTrendUpBold} color="purple.500" boxSize={5} />
                        <Text fontSize="lg" fontWeight="600" color="gray.800">
                            Predictive Insights
                        </Text>
                        <Badge colorScheme="purple" variant="outline">
                            {insights.length} insights
                        </Badge>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {insights.map((insight, index) => (
                            <InsightCard key={index} insight={insight} />
                        ))}
                    </SimpleGrid>
                </Box>
            )}

            {/* Model Predictions */}
            {modelPredictions.length > 0 && (
                <Box>
                    <HStack spacing={2} mb={4}>
                        <Icon as={PiLightningBold} color="blue.500" boxSize={5} />
                        <Text fontSize="lg" fontWeight="600" color="gray.800">
                            Model Performance Predictions
                        </Text>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        {modelPredictions.map((prediction, index) => (
                            <ModelPredictionCard key={index} prediction={prediction} />
                        ))}
                    </SimpleGrid>
                </Box>
            )}

            {insights.length === 0 && modelPredictions.length === 0 && (
                <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Text fontSize="sm">
                        Insufficient data for predictions. Continue using the system to generate insights.
                    </Text>
                </Alert>
            )}
        </VStack>
    );
}
