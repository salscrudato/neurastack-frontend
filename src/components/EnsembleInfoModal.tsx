/**
 * Ensemble Info Modal Component
 * 
 * Displays detailed information about the AI ensemble approach including
 * synthesis strategy, confidence analysis, voting details, and model performance.
 */

import {
    Badge,
    Box,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
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

const formatCurrency = (value: number): string => {
    return `$${value.toFixed(6)}`;
};

const formatTime = (ms: number): string => {
    return `${(ms / 1000).toFixed(2)}s`;
};

const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return "#059669"; // Green
    if (confidence > 0.6) return "#D97706"; // Orange
    return "#DC2626"; // Red
};

const getConsensusLabel = (level: string): string => {
    switch (level) {
        case 'strong': return 'Strong Consensus';
        case 'moderate': return 'Moderate Consensus';
        case 'weak': return 'Weak Consensus';
        default: return 'Unknown';
    }
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
    const headerBg = '#F8FAFC';
    const borderColor = '#E2E8F0';
    const textColor = '#1E293B';
    const mutedColor = '#64748B';
    const cardBg = 'linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%)';

    // Debug: Log the actual data structure (temporary)
    if (isOpen && ensembleData) {
        console.log('🔍 EnsembleInfoModal Data:', {
            ensembleData,
            synthesis: ensembleData?.synthesis,
            voting: ensembleData?.voting,
            metadata: ensembleData?.metadata,
            confidenceAnalysis: ensembleData?.metadata?.confidenceAnalysis,
            roles: ensembleData?.roles
        });
    }

    // Extract data from ensemble response with multiple fallback paths
    const synthesis = ensembleData?.synthesis || {};
    const voting = ensembleData?.voting || {};
    const metadata = ensembleData?.metadata || ensembleData || {};
    const confidenceAnalysis = metadata?.confidenceAnalysis || {};
    const roles = ensembleData?.roles || [];

    // Additional data extraction for different API response formats
    const votingAnalysis = confidenceAnalysis?.votingAnalysis || {};
    const contextOptimization = metadata?.contextOptimization || {};

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={{ base: "full", md: "xl" }}
            scrollBehavior="inside"
        >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent
                bg={modalBg}
                borderRadius={{ base: 0, md: "xl" }}
                maxH={{ base: "90vh", md: "80vh" }}
                maxW={{ base: "90vw", md: "800px" }}
                mx={{ base: 0, md: 4 }}
                my={{ base: 0, md: "10vh" }}
            >
                {/* Header */}
                <ModalHeader
                    bg={headerBg}
                    borderTopRadius={{ base: 0, md: "xl" }}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    pb={4}
                >
                    <VStack align="start" spacing={2}>
                        <Text fontSize="xl" fontWeight="bold" color={textColor}>
                            AI Ensemble Information
                        </Text>
                        <Text fontSize="sm" color={mutedColor} fontWeight="500">
                            Detailed insights into the ensemble approach and model collaboration
                        </Text>
                    </VStack>
                </ModalHeader>

                <ModalCloseButton />

                {/* Body */}
                <ModalBody p={4}>
                    <VStack spacing={4} align="stretch">

                        {/* Compact Data Grid */}
                        <SimpleGrid columns={2} spacing={3} fontSize="sm">

                            {/* Synthesis Strategy */}
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                    SYNTHESIS STRATEGY
                                </Text>
                                <Text color={textColor} fontWeight="600">
                                    {synthesis.synthesisStrategy || metadata.synthesisStrategy || 'Simple'}
                                </Text>
                            </Box>

                            {/* Status */}
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                    STATUS
                                </Text>
                                <Badge
                                    colorScheme={
                                        (synthesis.status === 'success' || metadata.synthesisStatus === 'success') ? 'green' : 'red'
                                    }
                                    variant="solid"
                                    borderRadius="md"
                                    px={2}
                                    py={1}
                                    fontSize="xs"
                                >
                                    {(synthesis.status || metadata.synthesisStatus || 'SUCCESS').toUpperCase()}
                                </Badge>
                            </Box>

                            {/* Overall Confidence */}
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                    OVERALL CONFIDENCE
                                </Text>
                                <Text
                                    color={getConfidenceColor(
                                        confidenceAnalysis.overallConfidence ||
                                        synthesis.overallConfidence ||
                                        0
                                    )}
                                    fontWeight="700"
                                    fontSize="md"
                                >
                                    {formatPercentage(
                                        confidenceAnalysis.overallConfidence ||
                                        synthesis.overallConfidence ||
                                        0
                                    )}
                                </Text>
                            </Box>

                            {/* Model Agreement */}
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                    MODEL AGREEMENT
                                </Text>
                                <Text
                                    color={getConfidenceColor(confidenceAnalysis.modelAgreement || 0)}
                                    fontWeight="700"
                                    fontSize="md"
                                >
                                    {formatPercentage(confidenceAnalysis.modelAgreement || 0)}
                                </Text>
                            </Box>

                            {/* Winning Model */}
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                    WINNING MODEL
                                </Text>
                                <Text color={textColor} fontWeight="600">
                                    {(voting.winner || 'N/A').toUpperCase()}
                                </Text>
                            </Box>

                            {/* Consensus Level */}
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                    CONSENSUS
                                </Text>
                                <Badge
                                    colorScheme={
                                        voting.consensus === 'strong' ? 'green' :
                                        voting.consensus === 'moderate' ? 'yellow' : 'red'
                                    }
                                    variant="solid"
                                    borderRadius="md"
                                    px={2}
                                    py={1}
                                    fontSize="xs"
                                >
                                    {getConsensusLabel(voting.consensus || 'weak')}
                                </Badge>
                            </Box>

                            {/* Processing Time */}
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                    PROCESSING TIME
                                </Text>
                                <Text color={textColor} fontWeight="600">
                                    {formatTime(metadata.processingTimeMs || 0)}
                                </Text>
                            </Box>

                            {/* Success Rate */}
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                    SUCCESS RATE
                                </Text>
                                <Text color={textColor} fontWeight="600">
                                    {metadata.successfulRoles || 0}/{metadata.totalRoles || 0}
                                </Text>
                            </Box>

                            {/* Cost Estimate */}
                            {metadata.costEstimate && (
                                <Box>
                                    <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                        COST ESTIMATE
                                    </Text>
                                    <Text color={textColor} fontWeight="600">
                                        {formatCurrency(metadata.costEstimate.totalCost)}
                                    </Text>
                                </Box>
                            )}

                            {/* Response Quality */}
                            {metadata.responseQuality && (
                                <Box>
                                    <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                        QUALITY SCORE
                                    </Text>
                                    <Text color={textColor} fontWeight="600">
                                        {Math.round(metadata.responseQuality * 100)}%
                                    </Text>
                                </Box>
                            )}

                            {/* Response Consistency */}
                            {confidenceAnalysis.responseConsistency !== undefined && (
                                <Box>
                                    <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                        RESPONSE CONSISTENCY
                                    </Text>
                                    <Text
                                        color={getConfidenceColor(confidenceAnalysis.responseConsistency)}
                                        fontWeight="700"
                                        fontSize="md"
                                    >
                                        {formatPercentage(confidenceAnalysis.responseConsistency)}
                                    </Text>
                                </Box>
                            )}

                            {/* Consensus Strength */}
                            {votingAnalysis.consensusStrength && (
                                <Box>
                                    <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                        CONSENSUS STRENGTH
                                    </Text>
                                    <Badge
                                        colorScheme={
                                            votingAnalysis.consensusStrength === 'strong' ? 'green' :
                                            votingAnalysis.consensusStrength === 'moderate' ? 'yellow' : 'red'
                                        }
                                        variant="solid"
                                        borderRadius="md"
                                        px={2}
                                        py={1}
                                        fontSize="xs"
                                    >
                                        {votingAnalysis.consensusStrength.toUpperCase()}
                                    </Badge>
                                </Box>
                            )}

                            {/* Token Efficiency */}
                            {contextOptimization.efficiency && (
                                <Box>
                                    <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                        TOKEN EFFICIENCY
                                    </Text>
                                    <Text color={textColor} fontWeight="600">
                                        {Math.round(contextOptimization.efficiency * 100)}%
                                    </Text>
                                </Box>
                            )}

                            {/* Memory Context */}
                            {metadata.memoryContextUsed !== undefined && (
                                <Box>
                                    <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                        MEMORY CONTEXT
                                    </Text>
                                    <Badge
                                        colorScheme={metadata.memoryContextUsed ? 'green' : 'gray'}
                                        variant="solid"
                                        borderRadius="md"
                                        px={2}
                                        py={1}
                                        fontSize="xs"
                                    >
                                        {metadata.memoryContextUsed ? 'ENABLED' : 'DISABLED'}
                                    </Badge>
                                </Box>
                            )}

                            {/* API Version */}
                            {metadata.version && (
                                <Box>
                                    <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={1}>
                                        API VERSION
                                    </Text>
                                    <Text color={textColor} fontWeight="600">
                                        5.16
                                    </Text>
                                </Box>
                            )}

                        </SimpleGrid>

                        {/* Model Weights */}
                        {voting.weights && Object.keys(voting.weights).length > 0 && (
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={2} textTransform="uppercase">
                                    Model Voting Weights
                                </Text>
                                <SimpleGrid columns={1} spacing={2}>
                                    {Object.entries(voting.weights).map(([model, weight]) => (
                                        <Flex key={model} justify="space-between" align="center" py={1}>
                                            <Text fontSize="sm" color={textColor} fontWeight="500">
                                                {model.toUpperCase()}
                                            </Text>
                                            <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                {formatPercentage(weight as number)}
                                            </Text>
                                        </Flex>
                                    ))}
                                </SimpleGrid>
                            </Box>
                        )}

                        {/* Individual Model Performance */}
                        {roles && roles.length > 0 && (
                            <Box>
                                <Text color={mutedColor} fontSize="xs" fontWeight="500" mb={2} textTransform="uppercase">
                                    Individual Model Performance
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    {roles.map((role: any, index: number) => (
                                        <Flex
                                            key={index}
                                            justify="space-between"
                                            align="center"
                                            p={2}
                                            bg={cardBg}
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor={borderColor}
                                        >
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                    {role.provider?.toUpperCase()} - {role.model?.toUpperCase()}
                                                </Text>
                                                <Text fontSize="xs" color={mutedColor}>
                                                    {role.wordCount || 0} words • {formatTime(role.responseTime || 0)}
                                                </Text>
                                            </VStack>
                                            <VStack align="end" spacing={0}>
                                                <Badge
                                                    colorScheme={role.status === 'fulfilled' ? 'green' : 'red'}
                                                    variant="solid"
                                                    borderRadius="md"
                                                    px={2}
                                                    py={1}
                                                    fontSize="xs"
                                                >
                                                    {role.status?.toUpperCase() || 'UNKNOWN'}
                                                </Badge>
                                                {role.confidence && (
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="600"
                                                        color={getConfidenceColor(role.confidence.score || 0)}
                                                    >
                                                        {formatPercentage(role.confidence.score || 0)}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Flex>
                                    ))}
                                </VStack>
                            </Box>
                        )}




                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
