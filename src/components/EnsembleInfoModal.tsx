/**
 * Ensemble Info Modal Component
 *
 * Displays detailed AI ensemble confidence and voting metrics in a clean,
 * modern 2-column layout with visual indicators and progress bars.
 */

import {
    Badge,
    Box,
    CircularProgress,
    CircularProgressLabel,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Progress,
    SimpleGrid,
    Text,
    VStack
} from "@chakra-ui/react";

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

const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
};

const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
};

const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return "#10B981"; // Green
    if (confidence > 0.6) return "#F59E0B"; // Amber
    if (confidence > 0.4) return "#EF4444"; // Red
    return "#DC2626"; // Dark Red
};

const getConsensusLabel = (consensus: string): string => {
    switch (consensus) {
        case 'very-strong': return 'Very Strong';
        case 'strong': return 'Strong';
        case 'moderate': return 'Moderate';
        case 'weak': return 'Weak';
        case 'very-weak': return 'Very Weak';
        default: return 'Unknown';
    }
};

// ============================================================================
// Compact Metric Components
// ============================================================================

interface CompactMetricProps {
    label: string;
    value: string | number;
    color?: string;
    type?: 'progress' | 'badge' | 'text';
    progress?: number;
}

const CompactMetric = ({ label, value, color, type = 'text', progress }: CompactMetricProps) => {
    const textColor = '#1E293B';
    const mutedColor = '#64748B';

    return (
        <Flex justify="space-between" align="center" py={2}>
            <Text fontSize="sm" color={mutedColor} fontWeight="500">
                {label}
            </Text>

            {type === 'progress' && typeof progress === 'number' && (
                <Box w="120px">
                    <Progress
                        value={progress * 100}
                        colorScheme={color === '#10B981' ? 'green' : color === '#F59E0B' ? 'yellow' : 'red'}
                        size="sm"
                        borderRadius="full"
                        bg="rgba(226, 232, 240, 0.3)"
                    />
                    <Text fontSize="xs" color={color || textColor} textAlign="right" mt={1}>
                        {value}
                    </Text>
                </Box>
            )}

            {type === 'badge' && (
                <Badge
                    colorScheme={color === '#10B981' ? 'green' : color === '#F59E0B' ? 'yellow' : 'red'}
                    variant="solid"
                    borderRadius="md"
                    px={2}
                    py={1}
                    fontSize="xs"
                >
                    {value}
                </Badge>
            )}

            {type === 'text' && (
                <Text fontSize="sm" fontWeight="600" color={color || textColor}>
                    {value}
                </Text>
            )}
        </Flex>
    );
};

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



    // Extract data from ensemble response following API documentation
    const synthesis = ensembleData?.synthesis || {};
    const voting = ensembleData?.voting || {};
    const metadata = ensembleData?.metadata || ensembleData || {};
    const confidenceAnalysis = metadata?.confidenceAnalysis || {};
    const roles = ensembleData?.roles || [];

    // Additional data extraction for enhanced metrics
    const votingAnalysis = confidenceAnalysis?.votingAnalysis || {};
    const qualityDistribution = confidenceAnalysis?.qualityDistribution || {};
    const costEstimate = metadata?.costEstimate || {};

    // Calculate derived metrics with better fallbacks and proper data access
    const votingCertainty = votingAnalysis.distributionEntropy !== undefined ?
        Math.max(0, 1 - votingAnalysis.distributionEntropy) :
        (voting.confidence || 0.5); // Fallback to voting confidence if entropy not available

    const totalModels = metadata?.totalRoles || roles.length ||
        (ensembleData?.models ? ensembleData.models.length : 0);

    const successfulModels = metadata?.successfulRoles ||
        roles.filter((role: any) => role.status === 'fulfilled').length ||
        (ensembleData?.models ? ensembleData.models.filter((model: any) => model.status === 'success').length : 0);

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
                    <VStack align="start" spacing={3}>
                        <Flex align="center" gap={3}>
                            <Box>
                                <Text fontSize="2xl" fontWeight="bold" color={textColor} letterSpacing="-0.025em">
                                    Ensemble Intelligence
                                </Text>
                                <Text fontSize="sm" color={mutedColor} fontWeight="500" mt={1}>
                                    Advanced multi-model collaboration insights
                                </Text>
                            </Box>
                        </Flex>
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
                    <VStack spacing={4} align="stretch">

                        {/* Primary Dashboard - Most Important Metrics */}
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                            {/* 1. Overall Confidence Score */}
                            <Box
                                bg="white"
                                borderRadius="xl"
                                p={4}
                                border="1px solid"
                                borderColor="rgba(226, 232, 240, 0.6)"
                                boxShadow="0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                textAlign="center"
                            >
                                <CircularProgress
                                    value={(confidenceAnalysis.overallConfidence || 0) * 100}
                                    color={getConfidenceColor(confidenceAnalysis.overallConfidence || 0)}
                                    size="60px"
                                    thickness="8px"
                                >
                                    <CircularProgressLabel fontSize="sm" fontWeight="bold">
                                        {formatPercentage(confidenceAnalysis.overallConfidence || 0)}
                                    </CircularProgressLabel>
                                </CircularProgress>
                                <Text fontSize="sm" fontWeight="600" color={textColor} mt={2}>
                                    Overall Confidence
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                    Primary reliability indicator
                                </Text>
                            </Box>

                            {/* 2. Consensus Strength */}
                            <Box
                                bg="white"
                                borderRadius="xl"
                                p={4}
                                border="1px solid"
                                borderColor="rgba(226, 232, 240, 0.6)"
                                boxShadow="0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                textAlign="center"
                            >
                                <Badge
                                    colorScheme={
                                        (voting.consensus === 'very-strong' || voting.consensus === 'strong') ? 'green' :
                                        voting.consensus === 'moderate' ? 'yellow' :
                                        voting.consensus ? 'red' : 'gray'
                                    }
                                    variant="solid"
                                    borderRadius="md"
                                    px={3}
                                    py={2}
                                    fontSize="sm"
                                    fontWeight="600"
                                >
                                    {voting.consensus ? getConsensusLabel(voting.consensus) :
                                     (synthesis.confidence && synthesis.confidence > 0.8) ? 'STRONG' :
                                     (synthesis.confidence && synthesis.confidence > 0.6) ? 'MODERATE' : 'WEAK'}
                                </Badge>
                                <Text fontSize="sm" fontWeight="600" color={textColor} mt={2}>
                                    Consensus Strength
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                    Model agreement level
                                </Text>
                            </Box>

                            {/* 3. Winning Model & Confidence */}
                            <Box
                                bg="white"
                                borderRadius="xl"
                                p={4}
                                border="1px solid"
                                borderColor="rgba(226, 232, 240, 0.6)"
                                boxShadow="0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                textAlign="center"
                            >
                                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                    {voting.winner ? voting.winner.toUpperCase() : 'No Winner'}
                                </Text>
                                <Text fontSize="md" fontWeight="600" color={getConfidenceColor(voting.confidence || 0)}>
                                    {voting.confidence ? formatPercentage(voting.confidence) : '0%'}
                                </Text>
                                <Text fontSize="sm" fontWeight="600" color={textColor} mt={1}>
                                    Winning Model
                                </Text>
                                <Text fontSize="xs" color={mutedColor}>
                                    Best performing response
                                </Text>
                            </Box>
                        </SimpleGrid>

                        {/* Secondary Metrics - Important Context */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                            {/* Model Agreement & Response Consistency */}
                            <Box
                                bg="white"
                                borderRadius="xl"
                                p={4}
                                border="1px solid"
                                borderColor="rgba(226, 232, 240, 0.6)"
                                boxShadow="0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                            >
                                <Text fontSize="sm" fontWeight="bold" color={textColor} mb={3}>
                                    Model Analysis
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    <CompactMetric
                                        label="Model Agreement"
                                        value={formatPercentage(confidenceAnalysis.modelAgreement || 0)}
                                        type="progress"
                                        progress={confidenceAnalysis.modelAgreement || 0}
                                        color={getConfidenceColor(confidenceAnalysis.modelAgreement || 0)}
                                    />
                                    <CompactMetric
                                        label="Response Consistency"
                                        value={formatPercentage(confidenceAnalysis.responseConsistency || 0)}
                                        type="progress"
                                        progress={confidenceAnalysis.responseConsistency || 0}
                                        color={getConfidenceColor(confidenceAnalysis.responseConsistency || 0)}
                                    />
                                    <CompactMetric
                                        label="Synthesis Confidence"
                                        value={formatPercentage(synthesis.confidence?.score || 0)}
                                        type="progress"
                                        progress={synthesis.confidence?.score || 0}
                                        color={getConfidenceColor(synthesis.confidence?.score || 0)}
                                    />
                                </VStack>
                            </Box>

                            {/* Voting Analysis & Performance */}
                            <Box
                                bg="white"
                                borderRadius="xl"
                                p={4}
                                border="1px solid"
                                borderColor="rgba(226, 232, 240, 0.6)"
                                boxShadow="0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                            >
                                <Text fontSize="sm" fontWeight="bold" color={textColor} mb={3}>
                                    Voting & Performance
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    <CompactMetric
                                        label="Voting Certainty"
                                        value={formatPercentage(votingCertainty)}
                                        type="progress"
                                        progress={votingCertainty}
                                        color={getConfidenceColor(votingCertainty)}
                                    />
                                    <CompactMetric
                                        label="Winner Margin"
                                        value={`${formatPercentage(votingAnalysis.winnerMargin || voting.margin || 0)} lead`}
                                        type="text"
                                        color={textColor}
                                    />
                                    <CompactMetric
                                        label="Success Rate"
                                        value={`${successfulModels}/${totalModels} models`}
                                        type="text"
                                        color={successfulModels === totalModels ? '#10B981' : '#F59E0B'}
                                    />
                                </VStack>
                            </Box>
                        </SimpleGrid>

                        {/* Performance & Cost Metrics */}
                        <Box
                            bg="white"
                            borderRadius="xl"
                            p={4}
                            border="1px solid"
                            borderColor="rgba(226, 232, 240, 0.6)"
                            boxShadow="0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                        >
                            <Text fontSize="sm" fontWeight="bold" color={textColor} mb={3}>
                                Performance Metrics
                            </Text>
                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                <Box textAlign="center">
                                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                        {formatTime(metadata.processingTimeMs || 0)}
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor}>Processing Time</Text>
                                </Box>
                                <Box textAlign="center">
                                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                        {formatCost(costEstimate.totalCost || 0)}
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor}>Cost Estimate</Text>
                                </Box>
                                {qualityDistribution && (qualityDistribution.high !== undefined) && (
                                    <>
                                        <Box textAlign="center">
                                            <Text fontSize="lg" fontWeight="bold" color="#10B981">
                                                {qualityDistribution.high || 0}
                                            </Text>
                                            <Text fontSize="xs" color={mutedColor}>High Quality</Text>
                                        </Box>
                                        <Box textAlign="center">
                                            <Text fontSize="lg" fontWeight="bold" color="#F59E0B">
                                                {(qualityDistribution.medium || 0) + (qualityDistribution.low || 0)}
                                            </Text>
                                            <Text fontSize="xs" color={mutedColor}>Med/Low Quality</Text>
                                        </Box>
                                    </>
                                )}
                            </SimpleGrid>
                        </Box>

                        {/* Model Voting Weights & Recommendation */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                            {/* Model Voting Weights */}
                            {voting.weights && Object.keys(voting.weights).length > 0 && (
                                <Box
                                    bg="white"
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor="rgba(226, 232, 240, 0.6)"
                                    boxShadow="0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                >
                                    <Text fontSize="sm" fontWeight="bold" color={textColor} mb={3}>
                                        Model Voting Weights
                                    </Text>
                                    <VStack spacing={1} align="stretch">
                                        {Object.entries(voting.weights).map(([model, weight]) => (
                                            <Flex key={model} justify="space-between" align="center" py={1}>
                                                <Text fontSize="sm" color={mutedColor} fontWeight="500">
                                                    {model.toUpperCase()}
                                                </Text>
                                                <Box textAlign="right">
                                                    <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                        {formatPercentage(weight as number)}
                                                    </Text>
                                                    <Box
                                                        w="60px"
                                                        h="2px"
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
                                                </Box>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Box>
                            )}

                            {/* Actionable Recommendation */}
                            {voting.recommendation && (
                                <Box
                                    bg={voting.consensus === 'very-strong' || voting.consensus === 'strong' ? 'green.50' :
                                       voting.consensus === 'moderate' ? 'yellow.50' : 'red.50'}
                                    borderRadius="xl"
                                    p={4}
                                    border="1px solid"
                                    borderColor={voting.consensus === 'very-strong' || voting.consensus === 'strong' ? 'green.200' :
                                               voting.consensus === 'moderate' ? 'yellow.200' : 'red.200'}
                                >
                                    <Text fontSize="sm" fontWeight="bold" color={textColor} mb={2}>
                                        Recommendation
                                    </Text>
                                    <Flex align="flex-start" gap={2}>
                                        <Badge
                                            colorScheme={voting.consensus === 'very-strong' || voting.consensus === 'strong' ? 'green' :
                                                       voting.consensus === 'moderate' ? 'yellow' : 'red'}
                                            variant="solid"
                                            borderRadius="md"
                                            px={2}
                                            py={1}
                                            fontSize="xs"
                                            flexShrink={0}
                                        >
                                            {getConsensusLabel(voting.consensus || 'unknown')}
                                        </Badge>
                                        <Text fontSize="sm" color={textColor} lineHeight="1.4">
                                            {voting.recommendation}
                                        </Text>
                                    </Flex>
                                </Box>
                            )}
                        </SimpleGrid>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
