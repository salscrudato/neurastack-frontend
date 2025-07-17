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
    Spinner,
    Text,
    VStack
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from 'react';
import {
    PiBrainBold,
    PiChartBarBold,
    PiCheckCircleBold,
    PiScalesBold,
    PiShieldCheckBold,
    PiWarningCircleBold
} from "react-icons/pi";
import { commonModalProps, commonOverlayStyles, modalSizes } from './shared/modalConfig';

interface EnsembleInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    ensembleData: {
        status: "success" | "error";
        data?: {
            synthesis: {
                content: string;
                confidence: {
                    score: number;
                    level: "high" | "medium" | "low" | "very-low";
                    factors: string[];
                };
                status: "success" | "error";
                processingTime: number;
            };
            voting: {
                winner: string;
                confidence: number;
                consensus: "strong" | "moderate" | "weak";
                weights: Record<string, number>;
            };
            roles: Array<{
                role: string;
                content: string;
                status: "fulfilled" | "rejected";
                confidence: {
                    score: number;
                    level: "high" | "medium" | "low" | "very-low";
                    factors: string[];
                };
                quality: {
                    wordCount: number;
                    hasStructure: boolean;
                    hasReasoning: boolean;
                };
                metadata: {
                    model: string;
                    provider: string;
                    processingTime: number;
                };
            }>;
            metadata: {
                timestamp: string;
                correlationId: string;
                tier: string;
                processingTime?: number;
            };
        };
        correlationId?: string;
    } | null;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};



export function EnsembleInfoModal({
    isOpen,
    onClose,
    ensembleData
}: EnsembleInfoModalProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (ensembleData) {
            setIsLoading(false);
        }
    }, [ensembleData]);

    const hasError = !isLoading && !ensembleData;

    const computedMetrics = useMemo(() => {
        if (!ensembleData?.data) return null;

        const data = ensembleData.data;
        const synthesis = data.synthesis;
        const voting = data.voting;
        const roles = data.roles;
        const metadata = data.metadata;

        return {
            synthesis,
            voting,
            roles,
            overallConfidence: synthesis?.confidence?.score || 0,
            confidenceLevel: synthesis?.confidence?.level || 'unknown',
            votingWinner: voting?.winner || 'N/A',
            votingConfidence: voting?.confidence || 0,
            consensus: voting?.consensus || 'unknown',
            totalModels: roles?.length || 0,
            successfulModels: roles?.filter(r => r.status === 'fulfilled').length || 0,
            processingTime: synthesis?.processingTime || metadata?.processingTime || 0,
            tier: metadata?.tier || 'free'
        };
    }, [ensembleData]);

    const formatPercentage = (value: number) => `${Math.round(value * 100)}%`;

    if (import.meta.env.DEV && ensembleData && isOpen) {
        console.group('🔍 EnsembleInfoModal Data Debug');
        console.log('📊 ensembleData keys:', Object.keys(ensembleData));
        console.log('📊 ensembleData.data keys:', Object.keys(ensembleData.data || {}));
        console.log('📊 synthesis:', ensembleData.data?.synthesis);
        console.log('📊 voting:', ensembleData.data?.voting);
        console.log('📊 roles:', ensembleData.data?.roles);
        console.log('📊 metadata:', ensembleData.data?.metadata);
        console.groupEnd();
    }

    if (!computedMetrics) {
        return null;
    }

    const {
        synthesis,
        voting,
        roles,
        overallConfidence,
        confidenceLevel,
        votingWinner,
        votingConfidence,
        consensus,
        totalModels,
        successfulModels,
        processingTime,
        tier
    } = computedMetrics;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={modalSizes.large}
            {...commonModalProps}
            aria-labelledby="ensemble-modal-title"
            aria-describedby="ensemble-modal-description"
        >
            <ModalOverlay {...commonOverlayStyles} />
            <ModalContent
                as={motion.div}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                bg="#FFFFFF"
                borderRadius="2xl"
                maxH="85vh"
                maxW="900px"
                m={{ base: 2, md: 4 }}
                mt={{ base: "calc(var(--header-height-mobile) + env(safe-area-inset-top, 0px) + 16px)", md: "calc(var(--header-height-desktop) + env(safe-area-inset-top, 0px) + 24px)" }}
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                border="1px solid"
                borderColor="rgba(226, 232, 240, 0.8)"
                overflow="hidden"
                sx={{
                    zIndex: 'var(--z-modal)',
                }}
            >
                <ModalCloseButton
                    color="#4F9CF9"
                    size={{ base: "lg", md: "lg" }}
                    top={{ base: 4, md: 6 }}
                    right={{ base: 4, md: 6 }}
                    minW={{ base: "44px", md: "40px" }}
                    minH={{ base: "44px", md: "40px" }}
                    borderRadius="full"
                    bg="rgba(255, 255, 255, 0.9)"
                    backdropFilter="blur(8px)"
                    border="1px solid rgba(79, 156, 249, 0.2)"
                    _hover={{
                        bg: "rgba(79, 156, 249, 0.1)",
                        color: "#3B82F6",
                        transform: "scale(1.05)"
                    }}
                    _focus={{
                        boxShadow: "0 0 0 2px rgba(79, 156, 249, 0.3)",
                        outline: "none"
                    }}
                    _active={{
                        transform: "scale(0.95)"
                    }}
                    sx={{
                        zIndex: 1402,
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                    }}
                />

                <ModalBody
                    p={{ base: 3, md: 4 }}
                    pt={{ base: 3, md: 4 }}
                    bg="#FAFBFC"
                    overflowY="auto"
                    maxH="100%"
                    css={{
                        '&::-webkit-scrollbar': {
                            width: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '2px',
                        },
                    }}
                >
                    {isLoading ? (
                        <Flex justify="center" align="center" minH="400px" direction="column" gap={4}>
                            <Spinner size="xl" color="#4F9CF9" thickness="4px" />
                            <Text fontSize="lg" color="gray.600" fontWeight="500">
                                Loading ensemble data...
                            </Text>
                        </Flex>
                    ) : hasError ? (
                        <Flex justify="center" align="center" minH="400px" direction="column" gap={4} textAlign="center">
                            <Icon as={PiWarningCircleBold} boxSize={12} color="orange.400" />
                            <Text fontSize="xl" color="gray.700" fontWeight="600">
                                No Ensemble Data Available
                            </Text>
                            <Text fontSize="md" color="gray.500" maxW="md">
                                The ensemble information could not be loaded.
                            </Text>
                        </Flex>
                    ) : (
                        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                            {/* Header */}
                            <Box bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" borderRadius={{ base: "xl", md: "2xl" }} p={{ base: 4, md: 6 }} color="white" position="relative" overflow="hidden">
                                <Box position="absolute" top="0" right="0" w={{ base: "60px", md: "100px" }} h={{ base: "60px", md: "100px" }} bg="rgba(255, 255, 255, 0.1)" borderRadius="full" transform={{ base: "translate(20px, -20px)", md: "translate(30px, -30px)" }} />
                                <HStack spacing={{ base: 3, md: 4 }} align="center">
                                    <Icon as={PiBrainBold} boxSize={{ base: 6, md: 8 }} />
                                    <VStack align="start" spacing={1}>
                                        <Text id="ensemble-modal-title" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                                            AI Ensemble Analysis
                                        </Text>
                                        <Text id="ensemble-modal-description" fontSize={{ base: "xs", md: "sm" }} opacity={0.9}>
                                            Multi-model synthesis performance
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>



                            {/* Confidence Section */}
                            <Box bg="white" borderRadius="xl" p={6} border="1px solid" borderColor="rgba(226, 232, 240, 0.6)" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
                                <HStack spacing={3} mb={4}>
                                    <Icon as={PiShieldCheckBold} boxSize={6} color="#10B981" />
                                    <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                        Confidence Metrics
                                    </Text>
                                </HStack>
                                <VStack spacing={4} align="stretch">
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm" color="#64748B">Synthesis Confidence</Text>
                                        <Badge colorScheme={confidenceLevel === 'high' ? 'green' : confidenceLevel === 'medium' ? 'yellow' : 'red'}>
                                            {formatPercentage(overallConfidence)} ({confidenceLevel})
                                        </Badge>
                                    </Flex>
                                    <Progress value={overallConfidence * 100} colorScheme={overallConfidence >= 0.8 ? 'green' : overallConfidence >= 0.6 ? 'yellow' : 'red'} size="sm" borderRadius="full" />
                                    <VStack align="start" spacing={1}>
                                        {synthesis.confidence.factors.map((factor, index) => (
                                            <Text key={index} fontSize="xs" color="#6B7280">• {factor}</Text>
                                        ))}
                                    </VStack>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm" color="#64748B">Voting Confidence</Text>
                                        <Badge colorScheme={votingConfidence >= 0.8 ? 'green' : votingConfidence >= 0.6 ? 'yellow' : 'red'}>
                                            {formatPercentage(votingConfidence)}
                                        </Badge>
                                    </Flex>
                                    <Progress value={votingConfidence * 100} colorScheme={votingConfidence >= 0.8 ? 'green' : votingConfidence >= 0.6 ? 'yellow' : 'red'} size="sm" borderRadius="full" />
                                </VStack>
                            </Box>

                            {/* Voting Section */}
                            <Box bg="white" borderRadius="xl" p={6} border="1px solid" borderColor="rgba(226, 232, 240, 0.6)" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
                                <HStack spacing={3} mb={4}>
                                    <Icon as={PiScalesBold} boxSize={6} color="#F59E0B" />
                                    <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                        Voting Analysis
                                    </Text>
                                </HStack>
                                <VStack spacing={4} align="stretch">
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm" color="#64748B">Winner</Text>
                                        <Badge colorScheme="blue" variant="solid">
                                            {(votingWinner || 'unknown').toString().toUpperCase()}
                                        </Badge>
                                    </Flex>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm" color="#64748B">Consensus</Text>
                                        <Badge colorScheme={consensus === 'strong' ? 'green' : consensus === 'moderate' ? 'yellow' : 'red'}>
                                            {(consensus || 'unknown').toString().toUpperCase()}
                                        </Badge>
                                    </Flex>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="#1E293B" mb={2}>
                                            Voting Weights
                                        </Text>
                                        <VStack spacing={2} align="stretch">
                                            {Object.entries(voting?.weights || {}).map(([model, weight]) => (
                                                <Flex key={model} justify="space-between" align="center" p={2} bg="gray.50" borderRadius="md">
                                                    <Text fontSize="xs" color="#64748B">{(model || 'unknown').toString().toUpperCase()}</Text>
                                                    <Text fontSize="xs" fontWeight="600" color="#1E293B">{formatPercentage(weight as number)}</Text>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    </Box>
                                </VStack>
                            </Box>

                            {/* Models Section */}
                            <Box bg="white" borderRadius="xl" p={6} border="1px solid" borderColor="rgba(226, 232, 240, 0.6)" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
                                <HStack spacing={3} mb={4}>
                                    <Icon as={PiCheckCircleBold} boxSize={6} color="#10B981" />
                                    <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                        Model Performance
                                    </Text>
                                </HStack>
                                <VStack spacing={4} align="stretch">
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm" color="#64748B">Successful Models</Text>
                                        <Badge colorScheme="green" variant="solid">
                                            {successfulModels}/{totalModels}
                                        </Badge>
                                    </Flex>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="#1E293B" mb={2}>
                                            Individual Models
                                        </Text>
                                        <VStack spacing={2} align="stretch">
                                            {roles?.map((role, index) => (
                                                <Flex key={index} justify="space-between" align="center" p={2} bg="gray.50" borderRadius="md">
                                                    <HStack spacing={2}>
                                                        <Text fontSize="xs" color="#64748B">{(role.role || 'unknown').toString().toUpperCase()}</Text>
                                                        <Badge colorScheme={role.status === 'fulfilled' ? 'green' : 'red'} size="sm">
                                                            {role.status}
                                                        </Badge>
                                                    </HStack>
                                                    <Text fontSize="xs" fontWeight="600" color="#1E293B">
                                                        {formatPercentage(role.confidence?.score || 0)}
                                                    </Text>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    </Box>
                                </VStack>
                            </Box>

                            {/* System Metrics */}
                            <Box bg="white" borderRadius="xl" p={6} border="1px solid" borderColor="rgba(226, 232, 240, 0.6)" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
                                <HStack spacing={3} mb={4}>
                                    <Icon as={PiChartBarBold} boxSize={6} color="#8B5CF6" />
                                    <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                        System Metrics
                                    </Text>
                                </HStack>
                                <VStack spacing={4} align="stretch">
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm" color="#64748B">Processing Time</Text>
                                        <Badge colorScheme="blue" variant="solid">
                                            {(processingTime / 1000).toFixed(1)}s
                                        </Badge>
                                    </Flex>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm" color="#64748B">User Tier</Text>
                                        <Badge colorScheme="purple" variant="solid">
                                            {tier.toUpperCase()}
                                        </Badge>
                                    </Flex>
                                </VStack>
                            </Box>
                        </VStack>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}