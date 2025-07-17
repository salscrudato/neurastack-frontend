/**
 * Enhanced Individual Model Modal Component
 *
 * Displays individual AI model analytics with modern, innovative design
 * following the NeuraStack API integration guide for optimal data utilization.
 * Optimized for informative insights without cost information.
 * Incorporates 2025 UI/UX trends: minimalist design, enhanced animations, seamless UX.
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
    Spinner,
    Text,
    VStack
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    PiShieldCheckBold
} from "react-icons/pi";
import { commonModalProps, commonOverlayStyles } from './shared/modalConfig';

interface IndividualModelModalProps {
    isOpen: boolean;
    onClose: () => void;
    modelData: {
        model: string;
        answer: string;
        role?: string;
        provider?: string;
        tokenCount?: number;
        executionTime?: number;
        status: 'success' | 'failed' | 'timeout';
        errorReason?: string;
        wordCount?: number;
        confidence?: {
            score: number;
            level: string;
            factors: string[];
        };
        responseTime?: number;
        characterCount?: number;
        quality?: number | {
            wordCount: number;
            sentenceCount: number;
            averageWordsPerSentence: number;
            hasStructure: boolean;
            hasReasoning: boolean;
            complexity: string;
        };
        metadata?: Record<string, unknown>;
    } | null;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export function IndividualModelModal({
    isOpen,
    onClose,
    modelData
}: IndividualModelModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    // Remove unused clipboard functionality to fix TypeScript warnings

    useEffect(() => {
        if (modelData) {
            setIsLoading(false);
        }
    }, [modelData]);

    const formatModelName = (model: string | undefined | null) => {
        // Handle undefined, null, or empty model values
        if (!model || typeof model !== 'string') {
            return 'UNKNOWN';
        }

        const modelLower = model.toLowerCase();
        if (modelLower.includes('gpt')) return 'GPT-4o';
        if (modelLower.includes('gemini')) return 'Gemini';
        if (modelLower.includes('claude')) return 'Claude';
        return model.toString().toUpperCase();
    };

    const getConfidenceColor = (level: string) => {
        switch (level) {
            case 'high': return 'green';
            case 'medium': return 'yellow';
            case 'low': return 'red';
            default: return 'gray';
        }
    };

    const textColor = "#1A202C";
    const modalBg = "#FFFFFF";

    if (isLoading) {
        return (
            <Modal {...commonModalProps} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay {...commonOverlayStyles} />
                <ModalContent
                    mx={{ base: 2, md: 4 }}
                    mt={{
                      base: "calc(var(--header-height-mobile) + env(safe-area-inset-top, 0px) + 16px)",
                      md: "calc(var(--header-height-desktop) + 16px)"
                    }}
                    mb={{ base: 2, md: 4 }}
                    sx={{ zIndex: 'var(--z-modal)' }}
                >
                    <ModalBody display="flex" justifyContent="center" alignItems="center" minH="200px">
                        <Spinner size="lg" color="#4F9CF9" />
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    if (!modelData) {
        return null;
    }

    const qualityData = typeof modelData.quality === 'object' ? modelData.quality : null;

    return (
        <Modal {...commonModalProps} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay {...commonOverlayStyles} />
            <ModalContent
                as={motion.div}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                bg={modalBg}
                borderRadius="2xl"
                maxH="85vh"
                maxW="700px"
                mx={{ base: 4, md: 6 }}
                mt={{
                  base: "calc(var(--header-height-mobile) + env(safe-area-inset-top, 0px) + 16px)",
                  md: "calc(var(--header-height-desktop) + 16px)"
                }}
                mb={{ base: 4, md: 6 }}
                overflow="hidden"
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                border="1px solid"
                borderColor="rgba(226, 232, 240, 0.8)"
                sx={{
                    zIndex: 'var(--z-modal)',
                }}
            >
                {/* Optimized Header */}
                <ModalHeader
                    bg="linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)"
                    borderTopRadius="2xl"
                    borderBottom="1px solid"
                    borderColor="rgba(226, 232, 240, 0.6)"
                    pb={4}
                    pt={4}
                    px={6}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between" w="100%">
                        <VStack align="start" spacing={1} flex={1}>
                            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                                {formatModelName(modelData?.model)}
                            </Text>
                            {modelData.confidence && (
                                <Badge
                                    colorScheme={getConfidenceColor(modelData.confidence.level)}
                                    variant="solid"
                                    size="sm"
                                    borderRadius="full"
                                    px={2}
                                    py={0.5}
                                    fontSize="xs"
                                >
                                    {Math.round(modelData.confidence.score * 100)}% Confidence
                                </Badge>
                            )}
                        </VStack>
                    </Box>
                </ModalHeader>

                {/* Custom Close Button */}
                <Box
                    position="absolute"
                    top={{ base: "16px", md: "20px" }}
                    right={{ base: "16px", md: "20px" }}
                    zIndex="calc(var(--z-modal) + 100)"
                    sx={{
                        display: 'block !important',
                        visibility: 'visible !important',
                        opacity: '1 !important',
                    }}
                >
                    <ModalCloseButton
                        color="#4F9CF9"
                        _hover={{ bg: "blue.50" }}
                        borderRadius="full"
                        size="lg"
                        fontSize="16px"
                        bg="white"
                        border="2px solid"
                        borderColor="#4F9CF9"
                        boxShadow="0 2px 8px rgba(79, 156, 249, 0.15)"
                        sx={{
                            position: 'static !important',
                            top: 'auto !important',
                            right: 'auto !important',
                            transform: 'none !important',
                            margin: '0 !important',
                        }}
                    />
                </Box>

                <ModalBody p={0} overflow="hidden">
                    <VStack spacing={0} align="stretch" h="100%">

                        {/* Metrics Section */}
                        <Box p={6} bg="#F8FAFC">
                            <VStack spacing={4} align="stretch">
                                <HStack spacing={2}>
                                    <Icon as={PiShieldCheckBold} color="#10B981" boxSize={5} />
                                    <Text fontSize="md" fontWeight="600" color={textColor}>
                                        Performance Metrics
                                    </Text>
                                </HStack>

                                <VStack spacing={3} align="stretch">
                                    {/* Confidence Score */}
                                    {modelData.confidence && (
                                        <Box>
                                            <Flex justify="space-between" align="center" mb={2}>
                                                <Text fontSize="sm" fontWeight="500" color="#6B7280">
                                                    Confidence Score
                                                </Text>
                                                <Badge colorScheme={getConfidenceColor(modelData.confidence.level)}>
                                                    {Math.round(modelData.confidence.score * 100)}%
                                                </Badge>
                                            </Flex>
                                            <Progress
                                                value={modelData.confidence.score * 100}
                                                colorScheme={getConfidenceColor(modelData.confidence.level)}
                                                size="sm"
                                                borderRadius="full"
                                            />
                                            <VStack align="start" mt={2} spacing={1}>
                                                {modelData.confidence.factors.map((factor, index) => (
                                                    <Text key={index} fontSize="xs" color="#6B7280">• {factor}</Text>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}

                                    {/* Response Time */}
                                    {modelData.responseTime && (
                                        <Flex justify="space-between" align="center">
                                            <Text fontSize="sm" fontWeight="500" color="#6B7280">
                                                Response Time
                                            </Text>
                                            <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                {modelData.responseTime}ms
                                            </Text>
                                        </Flex>
                                    )}

                                    {/* Word Count */}
                                    {modelData.wordCount && (
                                        <Flex justify="space-between" align="center">
                                            <Text fontSize="sm" fontWeight="500" color="#6B7280">
                                                Word Count
                                            </Text>
                                            <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                {modelData.wordCount}
                                            </Text>
                                        </Flex>
                                    )}

                                    {/* Quality Metrics */}
                                    {qualityData && (
                                        <Box>
                                            <Text fontSize="sm" fontWeight="500" color="#6B7280" mb={2}>
                                                Quality Analysis
                                            </Text>
                                            <VStack align="stretch" spacing={1}>
                                                <Flex justify="space-between">
                                                    <Text fontSize="xs" color="#6B7280">Sentence Count</Text>
                                                    <Text fontSize="xs">{qualityData.sentenceCount}</Text>
                                                </Flex>
                                                <Flex justify="space-between">
                                                    <Text fontSize="xs" color="#6B7280">Avg Words/Sentence</Text>
                                                    <Text fontSize="xs">{qualityData.averageWordsPerSentence.toFixed(1)}</Text>
                                                </Flex>
                                                <Flex justify="space-between">
                                                    <Text fontSize="xs" color="#6B7280">Has Structure</Text>
                                                    <Text fontSize="xs">{qualityData.hasStructure ? 'Yes' : 'No'}</Text>
                                                </Flex>
                                                <Flex justify="space-between">
                                                    <Text fontSize="xs" color="#6B7280">Has Reasoning</Text>
                                                    <Text fontSize="xs">{qualityData.hasReasoning ? 'Yes' : 'No'}</Text>
                                                </Flex>
                                                <Flex justify="space-between">
                                                    <Text fontSize="xs" color="#6B7280">Complexity</Text>
                                                    <Text fontSize="xs">{qualityData.complexity}</Text>
                                                </Flex>
                                            </VStack>
                                        </Box>
                                    )}

                                    {/* Status */}
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm" fontWeight="500" color="#6B7280">
                                            Status
                                        </Text>
                                        <Badge
                                            colorScheme={modelData.status === 'success' ? 'green' : 'red'}
                                            variant="solid"
                                        >
                                            {(modelData.status || 'unknown').toString().toUpperCase()}
                                        </Badge>
                                    </Flex>

                                    {/* Error Reason if failed */}
                                    {modelData.status !== 'success' && modelData.errorReason && (
                                        <Box mt={4}>
                                            <Text fontSize="sm" fontWeight="500" color="red.600" mb={2}>
                                                Error Details
                                            </Text>
                                            <Text fontSize="xs" color="#6B7280">
                                                {modelData.errorReason}
                                            </Text>
                                        </Box>
                                    )}
                                </VStack>
                            </VStack>
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}