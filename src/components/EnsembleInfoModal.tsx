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
    ModalHeader,
    ModalOverlay,
    Progress,
    SimpleGrid,
    Text,
    Tooltip,
    VStack
} from "@chakra-ui/react";
import {
    PiBrainBold,
    PiChartBarBold,
    PiCheckCircleBold,
    PiClockBold,
    PiCpuBold,
    PiGaugeBold,
    PiLightningBold,
    PiScalesBold,
    PiShieldCheckBold,
    PiTargetBold,
    PiTrendUpBold,
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
// Helper Functions
// ============================================================================

const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
};

const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return "#10B981"; // Green
    if (confidence > 0.6) return "#F59E0B"; // Amber
    if (confidence > 0.4) return "#EF4444"; // Red
    return "#DC2626"; // Dark Red
};

const getBadgeColor = (type: 'confidence' | 'models' | 'response', value?: number): string => {
    switch (type) {
        case 'confidence':
            return value && value > 80 ? '#10B981' : value && value > 60 ? '#F59E0B' : '#EF4444';
        case 'models':
            return '#4F9CF9'; // Blue for models
        case 'response':
            return '#8B5CF6'; // Purple for response time
        default:
            return '#64748B';
    }
};

const calculateModelAgreement = (roles: any[]): number => {
    if (!roles || roles.length < 2) return 0;

    // Simple agreement calculation based on confidence score variance
    const confidenceScores = roles
        .map(role => role.confidence?.score || 0)
        .filter(score => score > 0);

    if (confidenceScores.length < 2) return 0;

    const mean = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
    const variance = confidenceScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / confidenceScores.length;

    // Convert variance to agreement (lower variance = higher agreement)
    return Math.max(0, 1 - (variance * 4)); // Scale variance to 0-1 range
};

const findWinningModel = (roles: any[], voting?: any): { model: string; confidence: number } | null => {
    if (!roles || roles.length === 0) return null;

    // First try to use the voting winner from API
    if (voting?.winner) {
        const winnerRole = roles.find(role =>
            role.role === voting.winner ||
            role.model?.includes(voting.winner) ||
            voting.winner.includes(role.role)
        );

        if (winnerRole) {
            return {
                model: winnerRole.model || winnerRole.role,
                confidence: winnerRole.confidence?.score || 0.5
            };
        }

        // If we have a winner but can't find the role, still show the winner
        return {
            model: voting.winner,
            confidence: voting.confidence || 0.5
        };
    }

    // Fallback to highest confidence model
    const winner = roles.reduce((prev, current) => {
        const prevScore = prev.confidence?.score || 0;
        const currentScore = current.confidence?.score || 0;
        return currentScore > prevScore ? current : prev;
    });

    return winner.confidence?.score > 0 ? {
        model: winner.model || winner.role,
        confidence: winner.confidence.score
    } : null;
};

// ============================================================================
// Enhanced Header Badge Components
// ============================================================================

interface HeaderBadgeProps {
    label: string;
    value: string;
    color: string;
    icon?: React.ComponentType;
}

const HeaderBadge = ({ label, value, color, icon: IconComponent }: HeaderBadgeProps) => (
    <Badge
        bg={color}
        color="white"
        px={3}
        py={2}
        borderRadius="lg"
        fontSize="xs"
        fontWeight="600"
        display="flex"
        alignItems="center"
        gap={1}
        textTransform="uppercase"
        letterSpacing="0.5px"
    >
        {IconComponent && <Icon as={IconComponent} boxSize={3} />}
        {value} {label}
    </Badge>
);



// ============================================================================
// Main Component
// ============================================================================

export function EnsembleInfoModal({
    isOpen,
    onClose,
    ensembleData
}: EnsembleInfoModalProps) {
    // Modern color values - light mode only
    const modalBg = '#FFFFFF';
    const textColor = '#1E293B';
    const mutedColor = '#64748B';



    // Enhanced data extraction with robust error handling following API integration guide
    const synthesis = ensembleData?.synthesis || {};
    const voting = ensembleData?.voting || {};
    const metadata = ensembleData?.metadata || ensembleData || {};
    const confidenceAnalysis = metadata?.confidenceAnalysis || {};
    const roles = Array.isArray(ensembleData?.roles) ? ensembleData.roles : [];

    // Additional data extraction for enhanced metrics
    const votingAnalysis = confidenceAnalysis?.votingAnalysis || {};
    const qualityDistribution = confidenceAnalysis?.qualityDistribution || {};

    // Header badge calculations with proper fallbacks following API integration guide
    const confidenceScore = Math.round(
        (synthesis.confidence?.score ||
         confidenceAnalysis.overallConfidence ||
         synthesis.overallConfidence ||
         0) * 100
    );

    const successfulModels = metadata?.successfulRoles ||
                           roles.filter((role: any) => role.status === 'fulfilled').length ||
                           0;

    const totalModels = metadata?.totalRoles ||
                       roles.length ||
                       3; // Default to 3 models based on API structure

    const responseTimeSeconds = Math.round((metadata.processingTimeMs || 0) / 1000);

    // Overall confidence for main display with multiple fallback sources
    const overallConfidence = Math.round(
        (confidenceAnalysis.overallConfidence ||
         synthesis.confidence?.score ||
         synthesis.overallConfidence ||
         0) * 100
    );

    // Model agreement for consensus with fallback calculation
    const modelAgreement = Math.round(
        (confidenceAnalysis.modelAgreement ||
         (roles.length > 1 ? calculateModelAgreement(roles) : 0)) * 100
    );

    // Find winning model with enhanced logic - use voting.winner from API
    const winningModel = findWinningModel(roles, voting);

    // Quality distribution using API's qualityDistribution data
    const highQualityCount = qualityDistribution?.high !== undefined ?
                           qualityDistribution.high :
                           roles.filter((role: any) => (role.confidence?.score || 0) > 0.8).length;
    const medLowQualityCount = qualityDistribution?.medium !== undefined && qualityDistribution?.low !== undefined ?
                              (qualityDistribution.medium + qualityDistribution.low) :
                              Math.max(0, roles.length - highQualityCount);



    return (
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
                {/* Header */}
                <ModalHeader
                    bg="linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)"
                    borderTopRadius={{ base: 0, md: "2xl" }}
                    borderBottom="1px solid"
                    borderColor="rgba(226, 232, 240, 0.6)"
                    pb={6}
                    pt={6}
                >
                    <VStack align="start" spacing={4}>
                        <Flex justify="space-between" align="center" w="100%">
                            <Box>
                                <Text fontSize="2xl" fontWeight="bold" color={textColor} letterSpacing="-0.025em">
                                    AI Ensemble Analytics
                                </Text>
                                <Text fontSize="sm" color={mutedColor} fontWeight="500" mt={1}>
                                    Comprehensive multi-model intelligence insights
                                </Text>
                            </Box>
                            <ModalCloseButton
                                position="static"
                                color="#4F9CF9"
                                _hover={{ bg: "rgba(79, 156, 249, 0.1)" }}
                                _focus={{ boxShadow: "0 0 0 2px rgba(79, 156, 249, 0.3)" }}
                            />
                        </Flex>

                        {/* Enhanced Header Badges */}
                        <HStack spacing={2} wrap="wrap" justify="center" w="100%">
                            <HeaderBadge
                                label="CONFIDENCE"
                                value={`${confidenceScore}%`}
                                color={getBadgeColor('confidence', confidenceScore)}
                                icon={PiTrendUpBold}
                            />
                            <HeaderBadge
                                label="MODELS"
                                value={`${successfulModels}/${totalModels}`}
                                color={getBadgeColor('models')}
                                icon={PiCpuBold}
                            />
                            <HeaderBadge
                                label="RESPONSE"
                                value={`${responseTimeSeconds}S`}
                                color={getBadgeColor('response')}
                                icon={PiClockBold}
                            />
                        </HStack>
                    </VStack>
                </ModalHeader>

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
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            {/* Overall Confidence */}
                            <Tooltip label="Primary reliability indicator based on model consensus and response quality">
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor="help"
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
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
                            <Tooltip label="Level of agreement between different AI models in their responses">
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor="help"
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
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
                            <Tooltip label="Total processing time for ensemble response generation">
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor="help"
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
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

                            {/* Success Rate */}
                            <Tooltip label="Percentage of AI models that successfully contributed to the response">
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    textAlign="center"
                                    cursor="help"
                                    _hover={{
                                        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }}
                                    transition="all 0.2s ease"
                                >
                                    <Icon as={PiTargetBold} boxSize={6} color="#10B981" mb={2} />
                                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                                        {Math.round((successfulModels / totalModels) * 100)}%
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase">
                                        Success Rate
                                    </Text>
                                </Box>
                            </Tooltip>
                        </SimpleGrid>

                        {/* Advanced Analytics Section */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            {/* Winning Model Analysis */}
                            <Box
                                bg="white"
                                borderRadius="xl"
                                p={6}
                                border="1px solid"
                                borderColor="rgba(226, 232, 240, 0.6)"
                                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            >
                                <HStack spacing={3} mb={4}>
                                    <Icon as={PiGaugeBold} boxSize={6} color="#4F9CF9" />
                                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                        Model Performance
                                    </Text>
                                </HStack>

                                <VStack spacing={4} align="stretch">
                                    <Box textAlign="center" p={4} bg="gray.50" borderRadius="lg">
                                        <HStack justify="center" spacing={2} mb={2}>
                                            <Icon
                                                as={winningModel ? PiCheckCircleBold : PiWarningCircleBold}
                                                color={winningModel ? '#10B981' : '#F59E0B'}
                                                boxSize={5}
                                            />
                                            <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                                {winningModel ? winningModel.model.toUpperCase() : 'NO CLEAR WINNER'}
                                            </Text>
                                        </HStack>
                                        <Text fontSize="2xl" fontWeight="bold" color={getConfidenceColor(winningModel?.confidence || 0)}>
                                            {winningModel ? `${Math.round(winningModel.confidence * 100)}%` : '0%'}
                                        </Text>
                                        <Text fontSize="sm" color={mutedColor}>
                                            Best performing model
                                        </Text>
                                    </Box>

                                    {/* Voting Analysis */}
                                    {voting.weights && Object.keys(voting.weights).length > 0 && (
                                        <VStack spacing={2} align="stretch">
                                            <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                Model Voting Weights
                                            </Text>
                                            {Object.entries(voting.weights).map(([model, weight]) => (
                                                <Flex key={model} justify="space-between" align="center" py={1}>
                                                    <Text fontSize="sm" color={mutedColor} fontWeight="500">
                                                        {model.toUpperCase()}
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                            {formatPercentage(weight as number)}
                                                        </Text>
                                                        <Box
                                                            w="40px"
                                                            h="4px"
                                                            bg="gray.200"
                                                            borderRadius="full"
                                                            overflow="hidden"
                                                        >
                                                            <Box
                                                                w={`${(weight as number) * 100}%`}
                                                                h="100%"
                                                                bg={model === voting.winner ? '#10B981' : '#4F9CF9'}
                                                                borderRadius="full"
                                                            />
                                                        </Box>
                                                    </HStack>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    )}
                                </VStack>
                            </Box>

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
                                        <SimpleGrid columns={2} spacing={4}>
                                            <Box textAlign="center" p={3} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                                                <Text fontSize="2xl" fontWeight="bold" color="#10B981">
                                                    {highQualityCount}
                                                </Text>
                                                <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                    High Quality
                                                </Text>
                                                <Text fontSize="xs" color={mutedColor}>
                                                    Score &gt; 80%
                                                </Text>
                                            </Box>
                                            <Box textAlign="center" p={3} bg="yellow.50" borderRadius="lg" border="1px solid" borderColor="yellow.200">
                                                <Text fontSize="2xl" fontWeight="bold" color="#F59E0B">
                                                    {medLowQualityCount}
                                                </Text>
                                                <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                    Med/Low Quality
                                                </Text>
                                                <Text fontSize="xs" color={mutedColor}>
                                                    Score ≤ 80%
                                                </Text>
                                            </Box>
                                        </SimpleGrid>
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
                                                    {formatPercentage(confidenceAnalysis.responseConsistency || 0)}
                                                </Text>
                                            </Flex>
                                            <Progress
                                                value={(confidenceAnalysis.responseConsistency || 0) * 100}
                                                colorScheme={
                                                    (confidenceAnalysis.responseConsistency || 0) > 0.8 ? "green" :
                                                    (confidenceAnalysis.responseConsistency || 0) > 0.6 ? "yellow" : "red"
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
                        </SimpleGrid>

                        {/* Advanced Voting Analysis */}
                        {votingAnalysis.winnerMargin !== undefined && (
                            <Box
                                bg="white"
                                borderRadius="xl"
                                p={6}
                                border="1px solid"
                                borderColor="rgba(226, 232, 240, 0.6)"
                                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            >
                                <HStack spacing={3} mb={4}>
                                    <Icon as={PiGaugeBold} boxSize={6} color="#10B981" />
                                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                        Voting Intelligence
                                    </Text>
                                </HStack>

                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                    {/* Winner Margin */}
                                    <Box textAlign="center" p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                                        <Text fontSize="xl" fontWeight="bold" color="#4F9CF9">
                                            {Math.round(votingAnalysis.winnerMargin * 100)}%
                                        </Text>
                                        <Text fontSize="sm" fontWeight="600" color={textColor}>
                                            Winner Margin
                                        </Text>
                                        <Text fontSize="xs" color={mutedColor}>
                                            Lead over second place
                                        </Text>
                                    </Box>

                                    {/* Voting Entropy */}
                                    <Box textAlign="center" p={4} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
                                        <Text fontSize="xl" fontWeight="bold" color="#8B5CF6">
                                            {Math.round((1 - (votingAnalysis.distributionEntropy || 0)) * 100)}%
                                        </Text>
                                        <Text fontSize="sm" fontWeight="600" color={textColor}>
                                            Voting Certainty
                                        </Text>
                                        <Text fontSize="xs" color={mutedColor}>
                                            Decision clarity
                                        </Text>
                                    </Box>

                                    {/* Consensus Strength */}
                                    <Box textAlign="center" p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                                        <Badge
                                            bg={
                                                modelAgreement > 80 ? '#10B981' :
                                                modelAgreement > 60 ? '#F59E0B' : '#EF4444'
                                            }
                                            color="white"
                                            px={3}
                                            py={1}
                                            borderRadius="md"
                                            fontSize="sm"
                                            fontWeight="700"
                                            textTransform="uppercase"
                                        >
                                            {modelAgreement > 80 ? 'STRONG' :
                                             modelAgreement > 60 ? 'MODERATE' : 'WEAK'}
                                        </Badge>
                                        <Text fontSize="sm" fontWeight="600" color={textColor} mt={2}>
                                            Consensus
                                        </Text>
                                        <Text fontSize="xs" color={mutedColor}>
                                            {modelAgreement}% agreement
                                        </Text>
                                    </Box>
                                </SimpleGrid>
                            </Box>
                        )}

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

                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
