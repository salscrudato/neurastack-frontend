/**
 * Enhanced Ensemble Info Modal Component
 *
 * Displays comprehensive AI ensemble analytics with modern, innovative design
 * following the NeuraStack API integration guide for optimal data utilization.
 * Optimized for informative insights without cost information.
 */

import {
    Badge,
    Box,
    Flex,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalOverlay,
    Progress,
    SimpleGrid,
    Text,
    Tooltip,
    VStack
} from "@chakra-ui/react";
import { useState } from 'react';
import {
    PiBrainBold,
    PiChartBarBold,
    PiCheckCircleBold,
    PiLightningBold,
    PiScalesBold,
    PiShieldCheckBold,
    PiWarningCircleBold
} from "react-icons/pi";

// ============================================================================
// Component Props
// ============================================================================

interface EnsembleInfoModalProps {
    /** Whether modal is open */
    isOpen: boolean;

    /** Close modal callback */
    onClose: () => void;

    /** Ensemble metadata from API response */
    ensembleData: any;
}

// ============================================================================
// Helper Functions (defined inside component for proper scope)
// ============================================================================











// ============================================================================
// Main Component
// ============================================================================

export function EnsembleInfoModal({
    isOpen,
    onClose,
    ensembleData
}: EnsembleInfoModalProps) {
    // Mobile help modal state
    const [mobileHelpModal, setMobileHelpModal] = useState<{
        isOpen: boolean;
        title: string;
        content: string;
    }>({
        isOpen: false,
        title: '',
        content: ''
    });

    // Check if mobile
    const isMobile = window.innerWidth < 768;

    // Handle mobile metric click
    const handleMobileMetricClick = (title: string, content: string) => {
        if (isMobile) {
            setMobileHelpModal({
                isOpen: true,
                title,
                content
            });
        }
    };

    // Close mobile help modal
    const closeMobileHelpModal = () => {
        setMobileHelpModal({
            isOpen: false,
            title: '',
            content: ''
        });
    };

    // Modern color values - light mode only
    const modalBg = '#FFFFFF';
    const textColor = '#1E293B';
    const mutedColor = '#64748B';

    // Helper function to get confidence color
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return "#10B981"; // Green
        if (confidence >= 0.6) return "#F59E0B"; // Yellow
        return "#EF4444"; // Red
    };

    // Helper function to format percentage
    const formatPercentage = (value: number) => {
        return `${Math.round(value * 100)}%`;
    };

    // Helper function to get consensus strength color and description
    const getConsensusInfo = (strength: string) => {
        switch (strength) {
            case 'very-strong':
                return { color: '#10B981', description: 'Very Strong', icon: PiCheckCircleBold };
            case 'strong':
                return { color: '#059669', description: 'Strong', icon: PiCheckCircleBold };
            case 'moderate':
                return { color: '#F59E0B', description: 'Moderate', icon: PiScalesBold };
            case 'weak':
                return { color: '#F97316', description: 'Weak', icon: PiWarningCircleBold };
            case 'very-weak':
                return { color: '#EF4444', description: 'Very Weak', icon: PiWarningCircleBold };
            default:
                return { color: '#6B7280', description: 'Unknown', icon: PiScalesBold };
        }
    };

    // Helper function to format entropy (0-1 scale, higher = more distributed)
    const getEntropyDescription = (entropy: number) => {
        if (entropy >= 0.8) return { level: 'High Diversity', color: '#8B5CF6' };
        if (entropy >= 0.6) return { level: 'Moderate Diversity', color: '#F59E0B' };
        if (entropy >= 0.4) return { level: 'Low Diversity', color: '#10B981' };
        return { level: 'Very Low Diversity', color: '#6B7280' };
    };

    // Debug: Log the ensemble data structure
    if (import.meta.env.DEV && ensembleData && isOpen) {
        console.group('🔍 EnsembleInfoModal Data Debug');
        console.log('📊 ensembleData keys:', Object.keys(ensembleData));
        console.log('📊 ensembleData.confidenceAnalysis:', ensembleData.confidenceAnalysis);
        console.log('📊 ensembleData.synthesis:', ensembleData.synthesis);
        console.log('📊 ensembleData.voting:', ensembleData.voting);
        console.log('📊 ensembleData.roles:', ensembleData.roles);
        if (ensembleData.confidenceAnalysis) {
            console.log('📊 modelAgreement:', ensembleData.confidenceAnalysis.modelAgreement);
            console.log('📊 responseConsistency:', ensembleData.confidenceAnalysis.responseConsistency);
            console.log('📊 overallConfidence:', ensembleData.confidenceAnalysis.overallConfidence);
        }
        // Additional voting debug
        if (ensembleData.voting) {
            console.log('📊 voting.winner:', ensembleData.voting.winner);
            console.log('📊 voting.confidence:', ensembleData.voting.confidence);
            console.log('📊 voting.weights:', ensembleData.voting.weights);
            console.log('📊 voting full object:', JSON.stringify(ensembleData.voting, null, 2));
        }
        // Check if voting data might be elsewhere
        if (ensembleData.votingAnalysis) {
            console.log('📊 votingAnalysis:', JSON.stringify(ensembleData.votingAnalysis, null, 2));
        }
        console.groupEnd();
    }



    // Enhanced data extraction with comprehensive null/undefined handling for new API structure
    // The ensembleData contains the full metadata structure from the API response
    // Structure: { ...data.metadata, synthesis: data.synthesis }
    const synthesis = ensembleData?.synthesis || {};
    const voting = ensembleData?.voting || {}; // voting is at the top level of metadata
    const metadata = ensembleData || {};
    const roles = Array.isArray(ensembleData?.roles) ? ensembleData.roles : [];
    const confidenceAnalysis = ensembleData?.confidenceAnalysis || {};
    const votingAnalysis = confidenceAnalysis?.votingAnalysis || {};

    // Extract metrics with proper fallbacks and type safety
    const totalModels = Math.max(roles.length, metadata?.totalRoles || 1); // Prevent division by zero

    // Response time from metadata (primary source)
    const processingTimeMs = metadata?.processingTimeMs || 0;
    const responseTimeSeconds = Math.max(0, Math.round(processingTimeMs / 1000));

    // Overall confidence from confidence analysis (primary source)
    const overallConfidence = Math.round(Math.max(0, Math.min(100,
        (confidenceAnalysis?.overallConfidence || synthesis?.confidence?.score || 0) * 100
    )));

    // Model agreement from confidence analysis
    const modelAgreement = Math.round(Math.max(0, Math.min(100,
        (confidenceAnalysis?.modelAgreement || 0) * 100
    )));

    // Response consistency from confidence analysis
    const responseConsistency = Math.round(Math.max(0, Math.min(100,
        (confidenceAnalysis?.responseConsistency || 0) * 100
    )));



    // Quality distribution from confidence analysis
    const qualityDistribution = confidenceAnalysis?.qualityDistribution || {
        high: 0,
        medium: 0,
        low: 0,
        veryLow: 0,
        averageScore: 0,
        totalResponses: totalModels
    };

    // Voting analysis metrics
    const consensusStrength = votingAnalysis?.consensusStrength || 'unknown';
    const distributionEntropy = votingAnalysis?.distributionEntropy || 0;

    // Synthesis metadata
    const synthesisMetadata = synthesis?.metadata || {};
    const basedOnResponses = synthesisMetadata?.basedOnResponses || totalModels;
    const averageConfidence = Math.round((synthesisMetadata?.averageConfidence || 0) * 100);
    const consensusLevel = synthesisMetadata?.consensusLevel || 'unknown';



    // Don't render if no ensemble data is available
    if (!ensembleData) {
        return null;
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size={{ base: "full", md: "2xl" }}
                scrollBehavior="inside"
            >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent
                bg={modalBg}
                borderRadius={{ base: 0, md: "2xl" }}
                maxH={{ base: "90vh", md: "85vh" }}
                maxW={{ base: "95vw", md: "900px" }}
                mx={{ base: 0, md: 4 }}
                my={{ base: 0, md: "7.5vh" }}
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                border="1px solid"
                borderColor="rgba(226, 232, 240, 0.8)"
            >
                <ModalCloseButton
                    color="#4F9CF9"
                    _hover={{
                        bg: "rgba(79, 156, 249, 0.1)",
                        color: "#3B82F6"
                    }}
                    _focus={{
                        boxShadow: "0 0 0 2px rgba(79, 156, 249, 0.3)"
                    }}
                    size="lg"
                    zIndex={9999}
                    position="absolute"
                    top={4}
                    right={4}
                />

                {/* Body */}
                <ModalBody p={4} bg="#FAFBFC">
                    <VStack spacing={6} align="stretch">

                        {/* Intelligence Overview - Hero Section */}
                        <Box
                            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            borderRadius="2xl"
                            p={6}
                            color="white"
                            position="relative"
                            overflow="hidden"
                        >
                            <Box
                                position="absolute"
                                top="0"
                                right="0"
                                w="100px"
                                h="100px"
                                bg="rgba(255, 255, 255, 0.1)"
                                borderRadius="full"
                                transform="translate(30px, -30px)"
                            />
                            <HStack spacing={4} align="center">
                                <Icon as={PiBrainBold} boxSize={8} />
                                <VStack align="start" spacing={1}>
                                    <Text fontSize="xl" fontWeight="bold">
                                        AI Intelligence Analysis
                                    </Text>
                                    <Text fontSize="sm" opacity={0.9}>
                                        Multi-model synthesis performance
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        {/* Core Metrics Grid - Redesigned */}
                        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                            {/* Overall Confidence */}
                            <Tooltip
                                label="Primary reliability indicator based on model consensus and response quality"
                                isDisabled={isMobile}
                            >
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor={isMobile ? "pointer" : "help"}
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
                                    onClick={() => handleMobileMetricClick(
                                        "Confidence",
                                        "Primary reliability indicator based on model consensus and response quality"
                                    )}
                                >
                                    <Icon as={PiShieldCheckBold} boxSize={6} color={getConfidenceColor(overallConfidence / 100)} mb={2} />
                                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                                        {overallConfidence}%
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase">
                                        Confidence
                                    </Text>
                                </Box>
                            </Tooltip>

                            {/* Model Agreement */}
                            <Tooltip
                                label="Level of agreement between different AI models in their responses"
                                isDisabled={isMobile}
                            >
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor={isMobile ? "pointer" : "help"}
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
                                    onClick={() => handleMobileMetricClick(
                                        "Agreement",
                                        "Level of agreement between different AI models in their responses"
                                    )}
                                >
                                    <Icon as={PiScalesBold} boxSize={6} color={getConfidenceColor(modelAgreement / 100)} mb={2} />
                                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                                        {modelAgreement}%
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase">
                                        Agreement
                                    </Text>
                                </Box>
                            </Tooltip>

                            {/* Response Speed */}
                            <Tooltip
                                label="Total processing time for ensemble response generation"
                                isDisabled={isMobile}
                            >
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor={isMobile ? "pointer" : "help"}
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
                                    onClick={() => handleMobileMetricClick(
                                        "Response Time",
                                        "Total processing time for ensemble response generation"
                                    )}
                                >
                                    <Icon as={PiLightningBold} boxSize={6} color="#F59E0B" mb={2} />
                                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                                        {responseTimeSeconds}s
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase">
                                        Response Time
                                    </Text>
                                </Box>
                            </Tooltip>



                            {/* Consensus Strength */}
                            <Tooltip
                                label="How strongly the AI models agree on the response approach and content"
                                isDisabled={isMobile}
                            >
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor={isMobile ? "pointer" : "help"}
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
                                    onClick={() => handleMobileMetricClick(
                                        "Consensus",
                                        "How strongly the AI models agree on the response approach and content"
                                    )}
                                >
                                    <Icon as={getConsensusInfo(consensusStrength).icon} boxSize={5} color={getConsensusInfo(consensusStrength).color} mb={2} />
                                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                        {getConsensusInfo(consensusStrength).description}
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase">
                                        Consensus
                                    </Text>
                                </Box>
                            </Tooltip>



                            {/* Response Diversity */}
                            <Tooltip
                                label="How diverse the AI model responses were (higher = more varied approaches)"
                                isDisabled={isMobile}
                            >
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor={isMobile ? "pointer" : "help"}
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
                                    onClick={() => handleMobileMetricClick(
                                        "Diversity",
                                        "How diverse the AI model responses were (higher = more varied approaches)"
                                    )}
                                >
                                    <Icon as={PiBrainBold} boxSize={5} color={getEntropyDescription(distributionEntropy).color} mb={2} />
                                    <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                        {getEntropyDescription(distributionEntropy).level}
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase">
                                        Diversity
                                    </Text>
                                </Box>
                            </Tooltip>

                            {/* Average Model Confidence */}
                            <Tooltip
                                label="Average confidence score across all contributing AI models"
                                isDisabled={isMobile}
                            >
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor={isMobile ? "pointer" : "help"}
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
                                    onClick={() => handleMobileMetricClick(
                                        "Avg Confidence",
                                        "Average confidence score across all contributing AI models"
                                    )}
                                >
                                    <Icon as={PiShieldCheckBold} boxSize={5} color={getConfidenceColor(averageConfidence / 100)} mb={2} />
                                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                        {averageConfidence}%
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase">
                                        Avg Confidence
                                    </Text>
                                </Box>
                            </Tooltip>
                        </SimpleGrid>

                        {/* Advanced Analytics Section */}
                        <Box>


                            {/* Response Quality & Consistency Analysis */}
                            <Box
                                bg="white"
                                borderRadius="xl"
                                p={6}
                                border="1px solid"
                                borderColor="rgba(226, 232, 240, 0.6)"
                                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            >
                                <HStack spacing={3} mb={4}>
                                    <Icon as={PiChartBarBold} boxSize={6} color="#8B5CF6" />
                                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                        Quality Analysis
                                    </Text>
                                </HStack>

                                <VStack spacing={4} align="stretch">
                                    {/* Quality Distribution */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                                            Response Quality Distribution
                                        </Text>
                                        <SimpleGrid columns={4} spacing={3}>
                                            <Box textAlign="center" p={3} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                                                <Text fontSize="xl" fontWeight="bold" color="#10B981">
                                                    {qualityDistribution.high}
                                                </Text>
                                                <Text fontSize="xs" fontWeight="600" color={textColor}>
                                                    High
                                                </Text>
                                                <Text fontSize="xs" color={mutedColor}>
                                                    &gt;80%
                                                </Text>
                                            </Box>
                                            <Box textAlign="center" p={3} bg="yellow.50" borderRadius="lg" border="1px solid" borderColor="yellow.200">
                                                <Text fontSize="xl" fontWeight="bold" color="#F59E0B">
                                                    {qualityDistribution.medium}
                                                </Text>
                                                <Text fontSize="xs" fontWeight="600" color={textColor}>
                                                    Medium
                                                </Text>
                                                <Text fontSize="xs" color={mutedColor}>
                                                    60-80%
                                                </Text>
                                            </Box>
                                            <Box textAlign="center" p={3} bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.200">
                                                <Text fontSize="xl" fontWeight="bold" color="#F97316">
                                                    {qualityDistribution.low}
                                                </Text>
                                                <Text fontSize="xs" fontWeight="600" color={textColor}>
                                                    Low
                                                </Text>
                                                <Text fontSize="xs" color={mutedColor}>
                                                    40-60%
                                                </Text>
                                            </Box>
                                            <Box textAlign="center" p={3} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200">
                                                <Text fontSize="xl" fontWeight="bold" color="#EF4444">
                                                    {qualityDistribution.veryLow}
                                                </Text>
                                                <Text fontSize="xs" fontWeight="600" color={textColor}>
                                                    Very Low
                                                </Text>
                                                <Text fontSize="xs" color={mutedColor}>
                                                    &lt;40%
                                                </Text>
                                            </Box>
                                        </SimpleGrid>

                                        {/* Quality Score Range */}
                                        <Box mt={4} p={3} bg="gray.50" borderRadius="lg">
                                            <HStack justify="space-between" mb={2}>
                                                <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                    Quality Score Range
                                                </Text>
                                                <Badge colorScheme="blue" variant="subtle">
                                                    {Math.round((qualityDistribution.scoreRange?.min || 0) * 100)}% - {Math.round((qualityDistribution.scoreRange?.max || 0) * 100)}%
                                                </Badge>
                                            </HStack>
                                            <Progress
                                                value={Math.round((qualityDistribution.averageScore || 0) * 100)}
                                                colorScheme={qualityDistribution.averageScore >= 0.8 ? "green" : qualityDistribution.averageScore >= 0.6 ? "yellow" : "red"}
                                                size="sm"
                                                borderRadius="full"
                                            />
                                            <Text fontSize="xs" color={mutedColor} mt={1}>
                                                Average: {Math.round((qualityDistribution.averageScore || 0) * 100)}%
                                            </Text>
                                        </Box>
                                    </Box>

                                    {/* Response Consistency Metrics */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                                            Consistency Metrics
                                        </Text>
                                        <VStack spacing={2} align="stretch">
                                            <Flex justify="space-between" align="center">
                                                <Text fontSize="sm" color={mutedColor}>Response Consistency</Text>
                                                <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                    {responseConsistency}%
                                                </Text>
                                            </Flex>
                                            <Progress
                                                value={responseConsistency}
                                                colorScheme={
                                                    responseConsistency > 80 ? "green" :
                                                    responseConsistency > 60 ? "yellow" : "red"
                                                }
                                                size="sm"
                                                borderRadius="full"
                                            />

                                            <Flex justify="space-between" align="center">
                                                <Text fontSize="sm" color={mutedColor}>Synthesis Confidence</Text>
                                                <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                    {formatPercentage(synthesis.confidence?.score || synthesis.overallConfidence || 0)}
                                                </Text>
                                            </Flex>
                                            <Progress
                                                value={(synthesis.confidence?.score || synthesis.overallConfidence || 0) * 100}
                                                colorScheme={
                                                    (synthesis.confidence?.score || synthesis.overallConfidence || 0) > 0.8 ? "green" :
                                                    (synthesis.confidence?.score || synthesis.overallConfidence || 0) > 0.6 ? "yellow" : "red"
                                                }
                                                size="sm"
                                                borderRadius="full"
                                            />
                                        </VStack>
                                    </Box>
                                </VStack>
                            </Box>
                        </Box>

                        {/* Synthesis Insights */}
                        <Box
                            bg="white"
                            borderRadius="xl"
                            p={6}
                            border="1px solid"
                            borderColor="rgba(226, 232, 240, 0.6)"
                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        >
                            <HStack spacing={3} mb={4}>
                                <Icon as={PiBrainBold} boxSize={6} color="#6366F1" />
                                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                    Synthesis Intelligence
                                </Text>
                            </HStack>

                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                <Box textAlign="center" p={4} bg="blue.50" borderRadius="lg">
                                    <Text fontSize="xl" fontWeight="bold" color="#4F9CF9">
                                        {basedOnResponses}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="600" color={textColor}>
                                        Models Used
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor}>
                                        Contributing
                                    </Text>
                                </Box>

                                <Box textAlign="center" p={4} bg="purple.50" borderRadius="lg">
                                    <Text fontSize="xl" fontWeight="bold" color="#8B5CF6">
                                        {synthesis?.synthesisStrategy?.toUpperCase() || 'UNKNOWN'}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="600" color={textColor}>
                                        Strategy
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor}>
                                        Synthesis
                                    </Text>
                                </Box>

                                <Box textAlign="center" p={4} bg="green.50" borderRadius="lg">
                                    <Text fontSize="xl" fontWeight="bold" color="#10B981">
                                        {Math.round((synthesis?.qualityScore || 0) * 100)}%
                                    </Text>
                                    <Text fontSize="sm" fontWeight="600" color={textColor}>
                                        Quality
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor}>
                                        Synthesis
                                    </Text>
                                </Box>

                                <Box textAlign="center" p={4} bg="orange.50" borderRadius="lg">
                                    <Badge colorScheme={consensusLevel === 'high' ? 'green' : consensusLevel === 'medium' ? 'yellow' : 'red'} variant="solid">
                                        {consensusLevel.toUpperCase()}
                                    </Badge>
                                    <Text fontSize="sm" fontWeight="600" color={textColor} mt={1}>
                                        Consensus
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor}>
                                        Level
                                    </Text>
                                </Box>
                            </SimpleGrid>
                        </Box>

                        {/* Actionable Insights & Recommendations */}
                        {voting.recommendation && (
                            <Box
                                bg={
                                    overallConfidence > 80 ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' :
                                    overallConfidence > 60 ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' :
                                    'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
                                }
                                borderRadius="xl"
                                p={6}
                                border="2px solid"
                                borderColor={
                                    overallConfidence > 80 ? '#10B981' :
                                    overallConfidence > 60 ? '#F59E0B' : '#EF4444'
                                }
                                position="relative"
                                overflow="hidden"
                            >
                                <Box
                                    position="absolute"
                                    top="-20px"
                                    right="-20px"
                                    w="80px"
                                    h="80px"
                                    bg="rgba(255, 255, 255, 0.2)"
                                    borderRadius="full"
                                />

                                <HStack spacing={3} mb={4}>
                                    <Icon
                                        as={PiBrainBold}
                                        boxSize={6}
                                        color={
                                            overallConfidence > 80 ? '#10B981' :
                                            overallConfidence > 60 ? '#F59E0B' : '#EF4444'
                                        }
                                    />
                                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                        AI Ensemble Recommendation
                                    </Text>
                                </HStack>

                                <VStack align="start" spacing={3}>
                                    <HStack spacing={2}>
                                        <Badge
                                            bg={
                                                overallConfidence > 80 ? '#10B981' :
                                                overallConfidence > 60 ? '#F59E0B' : '#EF4444'
                                            }
                                            color="white"
                                            px={3}
                                            py={1}
                                            borderRadius="md"
                                            fontSize="sm"
                                            fontWeight="700"
                                        >
                                            {overallConfidence > 80 ? 'HIGH CONFIDENCE' :
                                             overallConfidence > 60 ? 'MODERATE CONFIDENCE' : 'LOW CONFIDENCE'}
                                        </Badge>
                                        <Text fontSize="sm" color={textColor} fontWeight="600">
                                            {overallConfidence}% Overall Reliability
                                        </Text>
                                    </HStack>

                                    <Text fontSize="sm" color={textColor} lineHeight="1.6">
                                        {voting.recommendation}
                                    </Text>
                                </VStack>
                            </Box>
                        )}

                        {/* Consistency Banner */}
                        <Box
                            bg="linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
                            borderRadius="xl"
                            p={4}
                            border="1px solid"
                            borderColor="#F59E0B"
                            textAlign="center"
                        >
                            <HStack justify="center" spacing={2}>
                                <Icon as={PiScalesBold} boxSize={5} color="#F59E0B" />
                                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                    {responseConsistency}% CONSISTENCY
                                </Text>
                            </HStack>
                            <Text fontSize="sm" color={mutedColor} mt={1}>
                                Model response alignment score
                            </Text>
                        </Box>

                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>

        {/* Mobile Help Modal */}
        <Modal
            isOpen={mobileHelpModal.isOpen}
            onClose={closeMobileHelpModal}
            size="sm"
            isCentered
        >
            <ModalOverlay bg="blackAlpha.600" />
            <ModalContent
                mx={4}
                borderRadius="2xl"
                bg="white"
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            >
                <ModalCloseButton
                    color="blue.500"
                    fontSize="lg"
                    fontWeight="bold"
                    _hover={{ bg: "blue.50" }}
                    borderRadius="full"
                />
                <ModalBody p={6}>
                    <VStack spacing={4} align="start">
                        <Text fontSize="lg" fontWeight="bold" color="gray.800">
                            {mobileHelpModal.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                            {mobileHelpModal.content}
                        </Text>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
        </>
    );
}
