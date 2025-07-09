/**
 * Modern Ensemble Info Modal Component
 *
 * Clean, simple display of AI ensemble analytics with focus on essential metrics.
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
    SimpleGrid,
    Text,
    VStack
} from "@chakra-ui/react";
import {
    PiBrainBold,
    PiClockBold,
    PiShieldCheckBold,
    PiUsersThreeBold
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
    ensembleData: {
        confidenceAnalysis?: {
            overallConfidence?: number;
            modelAgreement?: number;
            responseConsistency?: number;
        };
        roles?: Array<{
            model: string;
            provider?: string;
            confidence?: number;
            status: string;
            responseTime?: number;
        }>;
        processingTimeMs?: number;
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
};

const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return "#10b981"; // Green
    if (confidence >= 0.6) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
};

// ============================================================================
// Main Component
// ============================================================================

export function EnsembleInfoModal({
    isOpen,
    onClose,
    ensembleData
}: EnsembleInfoModalProps) {
    // Extract data with safe defaults
    const confidenceAnalysis = ensembleData?.confidenceAnalysis || {};
    const roles = ensembleData?.roles || [];
    const processingTimeMs = ensembleData?.processingTimeMs || 0;

    // Calculate metrics
    const overallConfidence = confidenceAnalysis.overallConfidence || 0;
    const modelAgreement = confidenceAnalysis.modelAgreement || 0;
    const responseTimeSeconds = Math.round(processingTimeMs / 1000);
    const totalModels = roles.length;

    if (!ensembleData) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            isCentered
        >
            <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
            <ModalContent
                bg="#ffffff"
                borderRadius="18px"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.15)"
                border="1px solid #e5e7eb"
                mx={4}
            >
                <ModalHeader
                    pb={4}
                    borderBottom="1px solid #f3f4f6"
                >
                    <HStack spacing={3}>
                        <Icon as={PiBrainBold} boxSize={6} color="#3b82f6" />
                        <Text fontSize="lg" fontWeight="600" color="#1f2937">
                            AI Ensemble Analysis
                        </Text>
                    </HStack>
                </ModalHeader>

                <ModalCloseButton
                    color="#6b7280"
                    _hover={{ color: "#374151" }}
                />

                <ModalBody p={6}>
                    <VStack spacing={6} align="stretch">
                        {/* Key Metrics */}
                        <SimpleGrid columns={2} spacing={4}>
                            {/* Overall Confidence */}
                            <Box
                                bg="#f9fafb"
                                borderRadius="12px"
                                p={4}
                                textAlign="center"
                                border="1px solid #f3f4f6"
                            >
                                <Icon 
                                    as={PiShieldCheckBold} 
                                    boxSize={8} 
                                    color={getConfidenceColor(overallConfidence)}
                                    mb={2}
                                />
                                <Text fontSize="2xl" fontWeight="700" color="#1f2937" mb={1}>
                                    {formatPercentage(overallConfidence)}
                                </Text>
                                <Text fontSize="sm" color="#6b7280" fontWeight="500">
                                    Confidence
                                </Text>
                            </Box>

                            {/* Model Agreement */}
                            <Box
                                bg="#f9fafb"
                                borderRadius="12px"
                                p={4}
                                textAlign="center"
                                border="1px solid #f3f4f6"
                            >
                                <Icon 
                                    as={PiUsersThreeBold} 
                                    boxSize={8} 
                                    color={getConfidenceColor(modelAgreement)}
                                    mb={2}
                                />
                                <Text fontSize="2xl" fontWeight="700" color="#1f2937" mb={1}>
                                    {formatPercentage(modelAgreement)}
                                </Text>
                                <Text fontSize="sm" color="#6b7280" fontWeight="500">
                                    Agreement
                                </Text>
                            </Box>

                            {/* Response Time */}
                            <Box
                                bg="#f9fafb"
                                borderRadius="12px"
                                p={4}
                                textAlign="center"
                                border="1px solid #f3f4f6"
                            >
                                <Icon 
                                    as={PiClockBold} 
                                    boxSize={8} 
                                    color="#6b7280"
                                    mb={2}
                                />
                                <Text fontSize="2xl" fontWeight="700" color="#1f2937" mb={1}>
                                    {responseTimeSeconds}s
                                </Text>
                                <Text fontSize="sm" color="#6b7280" fontWeight="500">
                                    Response Time
                                </Text>
                            </Box>

                            {/* Total Models */}
                            <Box
                                bg="#f9fafb"
                                borderRadius="12px"
                                p={4}
                                textAlign="center"
                                border="1px solid #f3f4f6"
                            >
                                <Icon 
                                    as={PiBrainBold} 
                                    boxSize={8} 
                                    color="#3b82f6"
                                    mb={2}
                                />
                                <Text fontSize="2xl" fontWeight="700" color="#1f2937" mb={1}>
                                    {totalModels}
                                </Text>
                                <Text fontSize="sm" color="#6b7280" fontWeight="500">
                                    Models Used
                                </Text>
                            </Box>
                        </SimpleGrid>

                        {/* Model List */}
                        {roles.length > 0 && (
                            <Box>
                                <Text fontSize="md" fontWeight="600" color="#1f2937" mb={3}>
                                    Contributing Models
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    {roles.map((role, index) => (
                                        <Flex
                                            key={index}
                                            justify="space-between"
                                            align="center"
                                            p={3}
                                            bg="#f9fafb"
                                            borderRadius="8px"
                                            border="1px solid #f3f4f6"
                                        >
                                            <HStack spacing={3}>
                                                <Text fontSize="sm" fontWeight="500" color="#1f2937">
                                                    {role.provider || role.model}
                                                </Text>
                                                <Badge
                                                    colorScheme={role.status === 'fulfilled' ? 'green' : 'red'}
                                                    size="sm"
                                                    borderRadius="full"
                                                >
                                                    {role.status === 'fulfilled' ? 'Success' : 'Failed'}
                                                </Badge>
                                            </HStack>
                                            {role.confidence && (
                                                <Text 
                                                    fontSize="sm" 
                                                    fontWeight="600"
                                                    color={getConfidenceColor(role.confidence)}
                                                >
                                                    {formatPercentage(role.confidence)}
                                                </Text>
                                            )}
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
