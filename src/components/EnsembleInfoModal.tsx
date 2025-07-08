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
import {
    PiBrainBold,
    PiChartBarBold,
    PiCheckCircleBold,
    PiGaugeBold,
    PiLightningBold,
    PiScalesBold,
    PiShieldCheckBold,
    PiTargetBold,
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



    // Enhanced data extraction following actual API response structure
    const synthesis = ensembleData?.synthesis || {};
    const voting = ensembleData?.voting || {};
    const metadata = ensembleData?.metadata || synthesis?.metadata || {};
    const roles = Array.isArray(ensembleData?.roles) ? ensembleData.roles : [];

    // Extract metrics from actual API response structure
    const successfulModels = roles.filter((role: any) => role.status === 'fulfilled').length;
    const totalModels = roles.length || 3;

    // Response time from metadata or calculate from roles
    const responseTimeSeconds = Math.round((metadata.processingTimeMs ||
                                          roles.reduce((sum: number, role: any) => sum + (role.responseTime || 0), 0)) / 1000);

    // Confidence score from synthesis.confidence.score (primary source per API docs)
    const confidenceScore = Math.round((synthesis.confidence?.score || 0) * 100);

    // Overall confidence from synthesis.overallConfidence (as seen in actual response)
    const overallConfidence = Math.round((synthesis.overallConfidence || synthesis.confidence?.score || 0) * 100);

    // Model agreement - calculate from synthesis metadata or roles
    const averageConfidence = metadata.averageConfidence ||
                             (roles.length > 0 ? roles.reduce((sum: number, role: any) => sum + (role.confidence?.score || 0), 0) / roles.length : 0);
    const modelAgreement = Math.round(averageConfidence * 100);



    // Find winning model - highest confidence score from roles
    const winningModel = roles.length > 0 ? roles.reduce((prev: any, current: any) => {
        const prevScore = prev.confidence?.score || 0;
        const currentScore = current.confidence?.score || 0;
        return currentScore > prevScore ? current : prev;
    }) : null;

    // Quality distribution - use synthesis.qualityScore and role quality
    const highQualityCount = roles.filter((role: any) => (role.confidence?.score || 0) > 0.8).length;
    const medLowQualityCount = roles.length - highQualityCount;

    // Success rate calculation
    const successRate = totalModels > 0 ? Math.round((successfulModels / totalModels) * 100) : 0;



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
                                    <Icon as={PiShieldCheckBold} boxSize={6} color={getConfidenceColor(confidenceScore / 100)} mb={2} />
                                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                                        {confidenceScore}%
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
                                        {successRate}%
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
                                                {winningModel ? (winningModel.model || winningModel.role || 'UNKNOWN').toUpperCase() : 'NO CLEAR WINNER'}
                                            </Text>
                                        </HStack>
                                        <Text fontSize="2xl" fontWeight="bold" color={getConfidenceColor(winningModel?.confidence?.score || 0)}>
                                            {winningModel ? `${Math.round((winningModel.confidence?.score || 0) * 100)}%` : '0%'}
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
                                                    {formatPercentage(modelAgreement / 100)}
                                                </Text>
                                            </Flex>
                                            <Progress
                                                value={modelAgreement}
                                                colorScheme={
                                                    modelAgreement > 80 ? "green" :
                                                    modelAgreement > 60 ? "yellow" : "red"
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
