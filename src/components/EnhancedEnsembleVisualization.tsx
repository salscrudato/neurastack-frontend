/**
 * Enhanced Ensemble Visualization
 * 
 * Next-generation visualization of AI ensemble decision-making with advanced
 * real-time analytics, predictive insights, and interactive exploration.
 * Showcases the full potential of the NeuraStack backend data.
 */

import {
    Badge,
    Box,
    Circle,
    Grid,
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
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from 'react';
import {
    PiBrainBold,
    PiChartBarBold,
    PiClockBold,
    PiNetworkBold,
    PiScalesBold,
    PiStarBold
} from "react-icons/pi";

const MotionBox = motion(Box);
// const MotionCircle = motion(Circle); // Unused for now
const MotionGrid = motion(Grid);

interface EnhancedModelState {
    model: string;
    provider: string;
    status: 'idle' | 'processing' | 'completed' | 'failed';
    confidence: number;
    responseTime: number;
    quality: {
        complexity: string;
        hasStructure: boolean;
        hasReasoning: boolean;
        wordCount: number;
    };
    votingWeight: number;
    isWinner: boolean;
    healthScore: number;
}

interface EnhancedEnsembleVisualizationProps {
    isActive: boolean;
    votingData?: any;
    rolesData?: any[];
    synthesisData?: any;
    onModelSelect?: (model: string) => void;
    showPredictiveInsights?: boolean;
}

export function EnhancedEnsembleVisualization({
    isActive,
    votingData,
    rolesData = [],
    onModelSelect
}: EnhancedEnsembleVisualizationProps) {
    const [modelStates, setModelStates] = useState<EnhancedModelState[]>([]);
    // const [animationPhase, setAnimationPhase] = useState<'idle' | 'processing' | 'voting' | 'complete'>('idle'); // Unused for now
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Process backend data into enhanced model states
    const processedModelStates = useMemo(() => {
        if (!rolesData.length) return [];

        return rolesData.map((role) => {
            const votingWeight = votingData?.weights?.[role.model] || 0;
            const isWinner = votingData?.winner === role.role;

            return {
                model: role.model || role.role,
                provider: role.provider || 'unknown',
                status: role.status === 'fulfilled' ? 'completed' : 'failed',
                confidence: role.confidence?.score || 0,
                responseTime: role.responseTime || 0,
                quality: {
                    complexity: role.quality?.complexity || 'medium',
                    hasStructure: role.quality?.hasStructure || false,
                    hasReasoning: role.quality?.hasReasoning || false,
                    wordCount: role.quality?.wordCount || 0
                },
                votingWeight,
                isWinner,
                healthScore: role.confidence?.score || 0.7
            } as EnhancedModelState;
        });
    }, [rolesData, votingData]);

    useEffect(() => {
        if (processedModelStates.length > 0) {
            setModelStates(processedModelStates);
            // setAnimationPhase('complete'); // Commented out as setAnimationPhase is not defined
        }
    }, [processedModelStates]);

    const getProviderColor = (provider: string) => {
        switch (provider.toLowerCase()) {
            case 'openai': return 'green';
            case 'google': case 'gemini': return 'blue';
            case 'anthropic': case 'claude': return 'purple';
            default: return 'gray';
        }
    };

    const getQualityScore = (quality: EnhancedModelState['quality']) => {
        let score = 0;
        if (quality.hasStructure) score += 0.3;
        if (quality.hasReasoning) score += 0.3;
        if (quality.complexity === 'very-high') score += 0.4;
        else if (quality.complexity === 'high') score += 0.3;
        else if (quality.complexity === 'medium') score += 0.2;
        return Math.min(score, 1);
    };

    const EnhancedModelCard = ({ model }: { model: EnhancedModelState }) => {
        const providerColor = getProviderColor(model.provider);
        const qualityScore = getQualityScore(model.quality);
        const isSelected = selectedModel === model.model;

        return (
            <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                    opacity: 1, 
                    scale: isSelected ? 1.05 : model.isWinner ? 1.02 : 1,
                    y: model.isWinner ? -2 : 0
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ duration: 0.3 }}
                p={4}
                bg={model.isWinner ? `${providerColor}.50` : bgColor}
                borderRadius="xl"
                border="2px solid"
                borderColor={model.isWinner ? `${providerColor}.300` : borderColor}
                boxShadow={model.isWinner ? `0 8px 25px rgba(0,0,0,0.1)` : "sm"}
                cursor="pointer"
                onClick={() => {
                    setSelectedModel(isSelected ? null : model.model);
                    onModelSelect?.(model.model);
                }}
                position="relative"
                overflow="hidden"
            >
                {/* Winner indicator */}
                {model.isWinner && (
                    <MotionBox
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        position="absolute"
                        top={2}
                        right={2}
                        zIndex={2}
                    >
                        <Circle size="24px" bg={`${providerColor}.500`} color="white">
                            <Icon as={PiStarBold} boxSize={3} />
                        </Circle>
                    </MotionBox>
                )}

                <VStack spacing={4} align="stretch">
                    {/* Model header */}
                    <HStack justify="space-between" align="start">
                        <VStack spacing={1} align="start">
                            <Text fontSize="sm" fontWeight="700" color="gray.800">
                                {model.model}
                            </Text>
                            <Badge colorScheme={providerColor} variant="subtle" size="sm">
                                {model.provider}
                            </Badge>
                        </VStack>
                        <Circle size="40px" bg={`${providerColor}.100`} border="2px solid" borderColor={`${providerColor}.300`}>
                            <Icon as={PiBrainBold} color={`${providerColor}.600`} boxSize={5} />
                        </Circle>
                    </HStack>

                    {/* Performance metrics */}
                    <SimpleGrid columns={2} spacing={3}>
                        <Stat size="sm">
                            <StatLabel fontSize="xs" color="gray.600">Confidence</StatLabel>
                            <StatNumber fontSize="md" color={`${providerColor}.600`}>
                                {Math.round(model.confidence * 100)}%
                            </StatNumber>
                            <Progress 
                                value={model.confidence * 100} 
                                size="xs" 
                                colorScheme={providerColor}
                                borderRadius="full"
                                mt={1}
                            />
                        </Stat>
                        <Stat size="sm">
                            <StatLabel fontSize="xs" color="gray.600">Quality</StatLabel>
                            <StatNumber fontSize="md" color="blue.600">
                                {Math.round(qualityScore * 100)}%
                            </StatNumber>
                            <Progress 
                                value={qualityScore * 100} 
                                size="xs" 
                                colorScheme="blue"
                                borderRadius="full"
                                mt={1}
                            />
                        </Stat>
                    </SimpleGrid>

                    {/* Voting weight */}
                    <Box p={2} bg="gray.50" borderRadius="md">
                        <HStack justify="space-between" align="center">
                            <HStack spacing={1}>
                                <Icon as={PiScalesBold} boxSize={3} color="gray.500" />
                                <Text fontSize="xs" color="gray.600">Voting Weight</Text>
                            </HStack>
                            <Text fontSize="xs" fontWeight="600" color="gray.700">
                                {Math.round(model.votingWeight * 100)}%
                            </Text>
                        </HStack>
                        <Progress 
                            value={model.votingWeight * 100} 
                            size="xs" 
                            colorScheme="purple"
                            borderRadius="full"
                            mt={1}
                        />
                    </Box>

                    {/* Response metrics */}
                    <HStack justify="space-between" fontSize="xs" color="gray.500">
                        <HStack spacing={1}>
                            <Icon as={PiClockBold} boxSize={3} />
                            <Text>{(model.responseTime / 1000).toFixed(1)}s</Text>
                        </HStack>
                        <HStack spacing={1}>
                            <Icon as={PiChartBarBold} boxSize={3} />
                            <Text>{model.quality.wordCount} words</Text>
                        </HStack>
                    </HStack>

                    {/* Quality indicators */}
                    <HStack spacing={1} flexWrap="wrap">
                        {model.quality.hasStructure && (
                            <Badge colorScheme="green" variant="outline" size="xs">
                                Structured
                            </Badge>
                        )}
                        {model.quality.hasReasoning && (
                            <Badge colorScheme="blue" variant="outline" size="xs">
                                Reasoning
                            </Badge>
                        )}
                        <Badge colorScheme="orange" variant="outline" size="xs">
                            {model.quality.complexity}
                        </Badge>
                    </HStack>
                </VStack>

                {/* Animated background for winner */}
                {model.isWinner && (
                    <MotionBox
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg={`linear-gradient(135deg, ${providerColor}.100 0%, transparent 100%)`}
                        opacity={0.3}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ delay: 0.3 }}
                        pointerEvents="none"
                    />
                )}
            </MotionBox>
        );
    };

    const EnsembleMetrics = () => {
        if (!votingData) return null;

        const metrics = [
            {
                label: "Consensus Strength",
                value: votingData.confidence || 0,
                icon: PiScalesBold,
                color: "purple"
            },
            {
                label: "Diversity Score",
                value: votingData.diversityAnalysis?.overallDiversity || 0,
                icon: PiNetworkBold,
                color: "blue"
            },
            {
                label: "Meta-Voting Confidence",
                value: votingData.metaVoting?.confidence || 0,
                icon: PiBrainBold,
                color: "green"
            }
        ];

        return (
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                p={4}
                bg={bgColor}
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
                boxShadow="sm"
            >
                <Text fontSize="lg" fontWeight="600" color="gray.800" mb={4}>
                    Ensemble Intelligence Metrics
                </Text>
                <SimpleGrid columns={3} spacing={4}>
                    {metrics.map((metric) => (
                        <Stat key={metric.label} textAlign="center">
                            <Circle size="40px" bg={`${metric.color}.100`} mx="auto" mb={2}>
                                <Icon as={metric.icon} color={`${metric.color}.600`} boxSize={5} />
                            </Circle>
                            <StatNumber fontSize="lg" color={`${metric.color}.600`}>
                                {Math.round(metric.value * 100)}%
                            </StatNumber>
                            <StatLabel fontSize="xs" color="gray.600">
                                {metric.label}
                            </StatLabel>
                        </Stat>
                    ))}
                </SimpleGrid>
            </MotionBox>
        );
    };

    if (!isActive || modelStates.length === 0) {
        return (
            <Box p={8} textAlign="center" color="gray.500">
                <Icon as={PiBrainBold} boxSize={12} mb={4} />
                <Text fontSize="lg" fontWeight="600">
                    Enhanced Ensemble Visualization
                </Text>
                <Text fontSize="sm">
                    Advanced AI ensemble analytics will appear here during processing
                </Text>
            </Box>
        );
    }

    return (
        <VStack spacing={6} p={6}>
            {/* Ensemble metrics overview */}
            <EnsembleMetrics />

            {/* Model cards grid */}
            <MotionGrid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap={6}
                w="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, staggerChildren: 0.1 }}
            >
                {modelStates.map((model) => (
                    <EnhancedModelCard key={model.model} model={model} />
                ))}
            </MotionGrid>

            {/* Selected model details */}
            <AnimatePresence>
                {selectedModel && (
                    <MotionBox
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        p={4}
                        bg="blue.50"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="blue.200"
                        w="full"
                    >
                        <Text fontSize="md" fontWeight="600" color="blue.700" mb={2}>
                            Detailed Analysis: {selectedModel}
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                            Advanced model insights and performance analytics would be displayed here
                            based on the selected model's comprehensive data from the backend.
                        </Text>
                    </MotionBox>
                )}
            </AnimatePresence>
        </VStack>
    );
}
