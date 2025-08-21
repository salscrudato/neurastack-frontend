/**
 * AI Decision Visualization Component
 * 
 * Industry-first implementation of AI ensemble decision transparency.
 * Visualizes the complete voting process from traditional voting through
 * meta-voting to final decision, providing unprecedented insight into
 * AI decision-making processes.
 */

import {
    Badge,
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
import { useMemo } from 'react';
import {
    PiArrowRightBold,
    PiBrainBold,
    PiChartBarBold,
    PiGaugeBold,
    PiLightningBold,
    PiScalesBold,
    PiShieldCheckBold,
    PiTrendUpBold
} from "react-icons/pi";

const MotionBox = motion(Box);

interface VotingStage {
    name: string;
    winner: string;
    confidence: number;
    description: string;
    reasoning?: string;
    weights?: Record<string, number>;
    used?: boolean;
}

interface AIDecisionVisualizationProps {
    votingData: any;
    synthesis: any;
}

// Voting stage configuration
const getVotingStages = (votingData: any): VotingStage[] => {
    const stages: VotingStage[] = [];

    // Traditional Voting Stage
    if (votingData?.traditionalVoting) {
        stages.push({
            name: "Traditional Voting",
            winner: votingData.traditionalVoting.winner || "N/A",
            confidence: votingData.traditionalVoting.confidence || 0,
            description: "Confidence-based voting without sophisticated enhancements",
            weights: votingData.traditionalVoting.weights,
            used: true
        });
    }

    // Diversity Analysis Stage
    if (votingData?.diversityAnalysis) {
        stages.push({
            name: "Diversity Analysis",
            winner: "Analysis Complete",
            confidence: votingData.diversityAnalysis.overallDiversity || 0,
            description: "Semantic diversity analysis showing response uniqueness",
            reasoning: `Overall diversity: ${(votingData.diversityAnalysis.overallDiversity * 100).toFixed(1)}%`,
            used: true
        });
    }

    // Historical Performance Stage
    if (votingData?.historicalPerformance) {
        stages.push({
            name: "Historical Performance",
            winner: "Weights Applied",
            confidence: 1.0, // Historical performance is always applied
            description: "Model weights based on historical voting performance and accuracy",
            weights: votingData.historicalPerformance.weights,
            used: true
        });
    }

    // Tie Breaking Stage
    if (votingData?.tieBreaking?.used) {
        stages.push({
            name: "Tie Breaking",
            winner: votingData.tieBreaking.finalWinner || "N/A",
            confidence: votingData.tieBreaking.confidence || 0,
            description: "Tie-breaking mechanism for inconclusive traditional voting",
            reasoning: votingData.tieBreaking.reasoning,
            used: true
        });
    }

    // Meta-Voting Stage
    if (votingData?.metaVoting?.used) {
        stages.push({
            name: "Meta-Voting",
            winner: votingData.metaVoting.winner || "N/A",
            confidence: votingData.metaVoting.confidence || 0,
            description: "AI-powered meta-voting analysis for quality assessment",
            reasoning: votingData.metaVoting.reasoning,
            used: true
        });
    }

    // Final Decision
    stages.push({
        name: "Final Decision",
        winner: votingData?.winner || "N/A",
        confidence: votingData?.confidence || 0,
        description: "Final ensemble decision after all voting stages",
        reasoning: `Consensus: ${votingData?.consensus || 'Unknown'}`,
        used: true
    });

    return stages;
};

// Stage visualization component
const VotingStageCard = ({ stage, index, isActive }: { stage: VotingStage; index: number; isActive: boolean }) => {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const activeColor = useColorModeValue("blue.500", "blue.300");

    const getStageIcon = (stageName: string) => {
        switch (stageName) {
            case "Traditional Voting": return PiScalesBold;
            case "Diversity Analysis": return PiChartBarBold;
            case "Historical Performance": return PiTrendUpBold;
            case "Tie Breaking": return PiLightningBold;
            case "Meta-Voting": return PiBrainBold;
            case "Final Decision": return PiShieldCheckBold;
            default: return PiGaugeBold;
        }
    };

    const getStageColor = (stageName: string) => {
        switch (stageName) {
            case "Traditional Voting": return "blue";
            case "Diversity Analysis": return "purple";
            case "Historical Performance": return "green";
            case "Tie Breaking": return "orange";
            case "Meta-Voting": return "red";
            case "Final Decision": return "teal";
            default: return "gray";
        }
    };

    const StageIcon = getStageIcon(stage.name);
    const stageColor = getStageColor(stage.name);

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Box
                p={4}
                bg={bgColor}
                borderRadius="lg"
                border="2px solid"
                borderColor={isActive ? activeColor : borderColor}
                position="relative"
                _hover={{ borderColor: activeColor, transform: "translateY(-2px)" }}
                transition="all 0.2s"
            >
                {/* Stage Header */}
                <HStack justify="space-between" mb={3}>
                    <HStack spacing={2}>
                        <Circle size="32px" bg={`${stageColor}.500`} color="white">
                            <Icon as={StageIcon} boxSize={4} />
                        </Circle>
                        <VStack spacing={0} align="start">
                            <Text fontSize="sm" fontWeight="600" color="gray.800">
                                {stage.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                Step {index + 1}
                            </Text>
                        </VStack>
                    </HStack>
                    
                    {stage.confidence > 0 && (
                        <Badge colorScheme={stageColor} variant="subtle">
                            {(stage.confidence * 100).toFixed(0)}%
                        </Badge>
                    )}
                </HStack>

                {/* Winner/Result */}
                <Box mb={3}>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                        Result
                    </Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">
                        {stage.winner}
                    </Text>
                </Box>

                {/* Confidence Progress */}
                {stage.confidence > 0 && (
                    <Box mb={3}>
                        <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color="gray.500">
                                Confidence
                            </Text>
                            <Text fontSize="xs" color="gray.600" fontWeight="500">
                                {(stage.confidence * 100).toFixed(1)}%
                            </Text>
                        </HStack>
                        <Progress
                            value={stage.confidence * 100}
                            colorScheme={stageColor}
                            size="sm"
                            borderRadius="full"
                        />
                    </Box>
                )}

                {/* Description */}
                <Tooltip label={stage.description} hasArrow placement="top">
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {stage.description}
                    </Text>
                </Tooltip>

                {/* Reasoning */}
                {stage.reasoning && (
                    <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="xs" color="gray.700" fontStyle="italic">
                            {stage.reasoning}
                        </Text>
                    </Box>
                )}

                {/* Weights Display */}
                {stage.weights && Object.keys(stage.weights).length > 0 && (
                    <Box mt={2}>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                            Model Weights
                        </Text>
                        <HStack spacing={1} flexWrap="wrap">
                            {Object.entries(stage.weights).map(([model, weight]) => (
                                <Badge key={model} size="sm" colorScheme="gray" variant="outline">
                                    {model}: {typeof weight === 'number' ? weight.toFixed(2) : weight}
                                </Badge>
                            ))}
                        </HStack>
                    </Box>
                )}
            </Box>
        </MotionBox>
    );
};

// Arrow connector component
const StageConnector = ({ index }: { index: number }) => (
    <MotionBox
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 + 0.05 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="40px"
    >
        <Icon as={PiArrowRightBold} color="gray.400" boxSize={5} />
    </MotionBox>
);

export const AIDecisionVisualization = ({ votingData }: AIDecisionVisualizationProps) => {
    const stages = useMemo(() => getVotingStages(votingData), [votingData]);
    
    const sophisticatedFeatures = useMemo(() => {
        return votingData?.analytics?.sophisticatedFeaturesUsed || [];
    }, [votingData]);

    const qualityScore = useMemo(() => {
        return votingData?.analytics?.qualityScore || 0;
    }, [votingData]);

    if (!votingData) {
        return (
            <Box p={6} textAlign="center">
                <Text color="gray.500">No voting data available for visualization</Text>
            </Box>
        );
    }

    return (
        <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
                <HStack spacing={3} mb={2}>
                    <Circle size="32px" bg="purple.500" color="white">
                        <Icon as={PiBrainBold} boxSize={4} />
                    </Circle>
                    <Text fontSize="lg" fontWeight="600" color="gray.800">
                        AI Decision Process Visualization
                    </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                    Complete transparency into how the AI ensemble reached its decision
                </Text>
            </Box>

            {/* Quality Overview */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(auto-fit, minmax(200px, 1fr))" }} gap={4}>
                <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <HStack justify="space-between">
                        <VStack spacing={1} align="start">
                            <Text fontSize="xs" color="blue.600" fontWeight="500">
                                Overall Quality Score
                            </Text>
                            <Text fontSize="lg" fontWeight="600" color="blue.800">
                                {(qualityScore * 100).toFixed(0)}%
                            </Text>
                        </VStack>
                        <Circle size="32px" bg="blue.500" color="white">
                            <Icon as={PiGaugeBold} boxSize={4} />
                        </Circle>
                    </HStack>
                </Box>

                <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                    <HStack justify="space-between">
                        <VStack spacing={1} align="start">
                            <Text fontSize="xs" color="green.600" fontWeight="500">
                                Sophisticated Features
                            </Text>
                            <Text fontSize="lg" fontWeight="600" color="green.800">
                                {sophisticatedFeatures.length}
                            </Text>
                        </VStack>
                        <Circle size="32px" bg="green.500" color="white">
                            <Icon as={PiLightningBold} boxSize={4} />
                        </Circle>
                    </HStack>
                </Box>
            </Grid>

            {/* Sophisticated Features */}
            {sophisticatedFeatures.length > 0 && (
                <Box p={4} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
                    <Text fontSize="sm" fontWeight="600" color="purple.800" mb={2}>
                        Advanced Features Used
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                        {sophisticatedFeatures.map((feature: string, index: number) => (
                            <Badge key={index} colorScheme="purple" variant="subtle">
                                {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                        ))}
                    </HStack>
                </Box>
            )}

            {/* Voting Stages Flow */}
            <Box>
                <Text fontSize="md" fontWeight="600" color="gray.800" mb={4}>
                    Decision Flow
                </Text>
                
                <VStack spacing={0}>
                    {stages.map((stage, index) => (
                        <Box key={index}>
                            <VotingStageCard
                                stage={stage}
                                index={index}
                                isActive={index === stages.length - 1}
                            />
                            {index < stages.length - 1 && (
                                <StageConnector index={index} />
                            )}
                        </Box>
                    ))}
                </VStack>
            </Box>
        </VStack>
    );
};
