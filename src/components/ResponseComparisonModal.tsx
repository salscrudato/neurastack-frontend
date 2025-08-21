/**
 * Response Comparison Modal Component
 *
 * Provides side-by-side comparison of different AI model responses with:
 * - Visual diff highlighting
 * - Performance metrics comparison
 * - Quality analysis
 * - User preference tracking
 */

import {
    Badge,
    Box,
    Button,
    Circle,
    Grid,
    GridItem,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Progress,
    Select,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    VStack,
    useColorModeValue,
    useToast
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useMemo, useState } from 'react';
import {
    PiBrainBold,
    PiClockBold,
    PiEyeBold,
    PiHeartBold,
    PiScalesBold,
    PiStarBold
} from "react-icons/pi";
import { LazyMarkdown } from './LazyMarkdown';

const MotionBox = motion(Box);

interface ResponseComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    responses: any[]; // Individual model responses
    synthesizedResponse?: string;
    onPreferenceSelect?: (modelId: string, preference: 'like' | 'dislike') => void;
}

// Model configuration for consistent styling
const MODEL_CONFIG = {
    'gpt-4o-mini': { color: '#10A37F', name: 'GPT-4o', provider: 'OpenAI' },
    'gemini-1.5-flash': { color: '#4285F4', name: 'Gemini', provider: 'Google' },
    'claude-3-5-haiku-latest': { color: '#FF6B35', name: 'Claude', provider: 'Anthropic' }
} as const;

// Response card component
const ResponseCard = ({ 
    response, 
    isSelected, 
    onSelect, 
    onPreference,
    showMetrics = true 
}: {
    response: any;
    isSelected: boolean;
    onSelect: () => void;
    onPreference?: (preference: 'like' | 'dislike') => void;
    showMetrics?: boolean;
}) => {
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue(
        isSelected ? "blue.300" : "gray.200", 
        isSelected ? "blue.500" : "gray.600"
    );
    const toast = useToast();
    
    const config = MODEL_CONFIG[response.model as keyof typeof MODEL_CONFIG];
    const confidence = response.confidence?.score || 0;
    const responseTime = response.responseTime || 0;
    const wordCount = response.quality?.wordCount || response.wordCount || 0;
    
    const handlePreference = (preference: 'like' | 'dislike') => {
        onPreference?.(preference);
        toast({
            title: `Preference recorded`,
            description: `You ${preference}d the ${config?.name || response.model} response`,
            status: 'success',
            duration: 2000,
            isClosable: true,
        });
    };

    return (
        <MotionBox
            bg={cardBg}
            border="2px solid"
            borderColor={borderColor}
            borderRadius="xl"
            p={4}
            cursor="pointer"
            onClick={onSelect}
            boxShadow={isSelected ? "0 8px 24px rgba(79, 156, 249, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.05)"}
            _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
            }}
            transition="all 0.2s"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <VStack spacing={4} align="stretch">
                {/* Header */}
                <HStack justify="space-between" align="center">
                    <HStack spacing={3}>
                        <Circle size="32px" bg={config?.color || 'gray.500'} color="white">
                            <PiBrainBold size={16} />
                        </Circle>
                        <VStack spacing={0} align="start">
                            <Text fontSize="md" fontWeight="600" color="gray.800">
                                {config?.name || response.model}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {config?.provider || 'Unknown Provider'}
                            </Text>
                        </VStack>
                    </HStack>
                    
                    <Badge 
                        colorScheme={response.status === 'fulfilled' ? 'green' : 'red'}
                        variant="subtle"
                    >
                        {response.status || 'Unknown'}
                    </Badge>
                </HStack>

                {/* Metrics */}
                {showMetrics && (
                    <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                        <VStack spacing={1}>
                            <Text fontSize="xs" color="gray.500">Confidence</Text>
                            <Progress 
                                value={confidence * 100} 
                                size="sm" 
                                colorScheme="blue"
                                borderRadius="full"
                                w="100%"
                            />
                            <Text fontSize="xs" fontWeight="600">
                                {(confidence * 100).toFixed(0)}%
                            </Text>
                        </VStack>
                        
                        <VStack spacing={1}>
                            <Text fontSize="xs" color="gray.500">Speed</Text>
                            <HStack spacing={1}>
                                <PiClockBold size={10} />
                                <Text fontSize="xs" fontWeight="600">
                                    {responseTime}ms
                                </Text>
                            </HStack>
                        </VStack>
                        
                        <VStack spacing={1}>
                            <Text fontSize="xs" color="gray.500">Length</Text>
                            <Text fontSize="xs" fontWeight="600">
                                {wordCount} words
                            </Text>
                        </VStack>
                    </Grid>
                )}

                {/* Response Content Preview */}
                <Box
                    maxH="200px"
                    overflowY="auto"
                    p={3}
                    bg="gray.50"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                >
                    <Text fontSize="sm" color="gray.700" noOfLines={8}>
                        {response.content || response.answer || 'No response content'}
                    </Text>
                </Box>

                {/* Preference Actions */}
                {onPreference && (
                    <HStack justify="center" spacing={4}>
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<PiHeartBold />}
                            colorScheme="red"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePreference('like');
                            }}
                        >
                            Like
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<PiStarBold />}
                            colorScheme="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePreference('dislike');
                            }}
                        >
                            Dislike
                        </Button>
                    </HStack>
                )}
            </VStack>
        </MotionBox>
    );
};

// Detailed comparison view
const DetailedComparison = ({ 
    selectedResponses, 
    synthesizedResponse 
}: { 
    selectedResponses: any[]; 
    synthesizedResponse?: string; 
}) => {
    if (selectedResponses.length === 0) {
        return (
            <Box p={8} textAlign="center">
                <Text color="gray.500">Select responses to compare</Text>
            </Box>
        );
    }

    return (
        <VStack spacing={6} align="stretch">
            {/* Synthesized Response (if available) */}
            {synthesizedResponse && (
                <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <VStack spacing={3} align="stretch">
                        <HStack spacing={2}>
                            <Circle size="24px" bg="blue.500" color="white">
                                <PiScalesBold size={12} />
                            </Circle>
                            <Text fontSize="md" fontWeight="600" color="blue.800">
                                Synthesized Response
                            </Text>
                        </HStack>
                        <Box
                            p={3}
                            bg="white"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="blue.200"
                        >
                            <LazyMarkdown>{synthesizedResponse}</LazyMarkdown>
                        </Box>
                    </VStack>
                </Box>
            )}

            {/* Side-by-side comparison */}
            <Grid templateColumns={`repeat(${Math.min(selectedResponses.length, 2)}, 1fr)`} gap={6}>
                {selectedResponses.slice(0, 2).map((response, index) => {
                    const config = MODEL_CONFIG[response.model as keyof typeof MODEL_CONFIG];
                    
                    return (
                        <GridItem key={response.model || index}>
                            <VStack spacing={4} align="stretch">
                                <HStack spacing={3}>
                                    <Circle size="32px" bg={config?.color || 'gray.500'} color="white">
                                        <PiBrainBold size={16} />
                                    </Circle>
                                    <VStack spacing={0} align="start">
                                        <Text fontSize="lg" fontWeight="600" color="gray.800">
                                            {config?.name || response.model}
                                        </Text>
                                        <Text fontSize="sm" color="gray.500">
                                            {config?.provider || 'Unknown Provider'}
                                        </Text>
                                    </VStack>
                                </HStack>

                                {/* Detailed metrics */}
                                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                    <Stat size="sm">
                                        <StatLabel>Confidence</StatLabel>
                                        <StatNumber>{((response.confidence?.score || 0) * 100).toFixed(0)}%</StatNumber>
                                        <StatHelpText>{response.confidence?.level || 'medium'}</StatHelpText>
                                    </Stat>
                                    <Stat size="sm">
                                        <StatLabel>Response Time</StatLabel>
                                        <StatNumber>{response.responseTime || 0}ms</StatNumber>
                                        <StatHelpText>Processing speed</StatHelpText>
                                    </Stat>
                                </Grid>

                                {/* Full response content */}
                                <Box
                                    p={4}
                                    bg="gray.50"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    maxH="400px"
                                    overflowY="auto"
                                >
                                    <LazyMarkdown>{response.content || response.answer || 'No content'}</LazyMarkdown>
                                </Box>
                            </VStack>
                        </GridItem>
                    );
                })}
            </Grid>
        </VStack>
    );
};

export const ResponseComparisonModal = ({
    isOpen,
    onClose,
    responses = [],
    synthesizedResponse,
    onPreferenceSelect
}: ResponseComparisonModalProps) => {
    const [selectedResponses, setSelectedResponses] = useState<any[]>([]);
    const [comparisonMode, setComparisonMode] = useState<'grid' | 'detailed'>('grid');

    const overlayBg = useColorModeValue("rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.6)");

    const validResponses = useMemo(() => {
        return responses.filter(response =>
            response &&
            (response.content || response.answer) &&
            response.model
        );
    }, [responses]);

    const handleResponseSelect = (response: any) => {
        setSelectedResponses(prev => {
            const isSelected = prev.some(r => r.model === response.model);
            if (isSelected) {
                return prev.filter(r => r.model !== response.model);
            } else {
                return [...prev, response].slice(0, 2); // Max 2 for comparison
            }
        });
    };

    const handlePreference = (modelId: string, preference: 'like' | 'dislike') => {
        onPreferenceSelect?.(modelId, preference);
    };

    if (validResponses.length === 0) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} isCentered>
                <ModalOverlay bg={overlayBg} backdropFilter="blur(8px)" />
                <ModalContent>
                    <ModalHeader>Response Comparison</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Text color="gray.500">No responses available for comparison</Text>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "6xl" }} isCentered>
            <ModalOverlay bg={overlayBg} backdropFilter="blur(8px)" />
            <MotionBox
                as={ModalContent}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                maxH="90vh"
                overflowY="auto"
            >
                <ModalHeader>
                    <HStack justify="space-between" align="center">
                        <HStack spacing={3}>
                            <Circle size="32px" bg="purple.500" color="white">
                                <PiEyeBold size={16} />
                            </Circle>
                            <Text>Response Comparison</Text>
                        </HStack>

                        <HStack spacing={3}>
                            <Select
                                size="sm"
                                value={comparisonMode}
                                onChange={(e) => setComparisonMode(e.target.value as 'grid' | 'detailed')}
                                w="auto"
                            >
                                <option value="grid">Grid View</option>
                                <option value="detailed">Detailed View</option>
                            </Select>

                            {selectedResponses.length > 0 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedResponses([])}
                                >
                                    Clear Selection
                                </Button>
                            )}
                        </HStack>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody pb={6}>
                    {comparisonMode === 'grid' ? (
                        <VStack spacing={6} align="stretch">
                            {/* Selection Info */}
                            <Box p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                                <HStack justify="space-between" align="center">
                                    <Text fontSize="sm" color="blue.700">
                                        Select up to 2 responses to compare in detail
                                    </Text>
                                    <Badge colorScheme="blue" variant="subtle">
                                        {selectedResponses.length}/2 selected
                                    </Badge>
                                </HStack>
                            </Box>

                            {/* Response Grid */}
                            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                                {validResponses.map((response, index) => (
                                    <ResponseCard
                                        key={response.model || index}
                                        response={response}
                                        isSelected={selectedResponses.some(r => r.model === response.model)}
                                        onSelect={() => handleResponseSelect(response)}
                                        onPreference={(preference) => handlePreference(response.model, preference)}
                                    />
                                ))}
                            </Grid>

                            {/* Quick comparison stats */}
                            {selectedResponses.length > 1 && (
                                <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                                    <VStack spacing={3} align="stretch">
                                        <Text fontSize="md" fontWeight="600" color="green.800">
                                            Quick Comparison
                                        </Text>

                                        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                                            <VStack spacing={1}>
                                                <Text fontSize="xs" color="green.600">Confidence Winner</Text>
                                                <Text fontSize="sm" fontWeight="600" color="green.800">
                                                    {selectedResponses.reduce((winner, current) =>
                                                        (current.confidence?.score || 0) > (winner.confidence?.score || 0)
                                                            ? current : winner
                                                    ).model}
                                                </Text>
                                            </VStack>

                                            <VStack spacing={1}>
                                                <Text fontSize="xs" color="green.600">Speed Winner</Text>
                                                <Text fontSize="sm" fontWeight="600" color="green.800">
                                                    {selectedResponses.reduce((winner, current) =>
                                                        (current.responseTime || Infinity) < (winner.responseTime || Infinity)
                                                            ? current : winner
                                                    ).model}
                                                </Text>
                                            </VStack>

                                            <VStack spacing={1}>
                                                <Text fontSize="xs" color="green.600">Length Winner</Text>
                                                <Text fontSize="sm" fontWeight="600" color="green.800">
                                                    {selectedResponses.reduce((winner, current) =>
                                                        (current.quality?.wordCount || current.wordCount || 0) >
                                                        (winner.quality?.wordCount || winner.wordCount || 0)
                                                            ? current : winner
                                                    ).model}
                                                </Text>
                                            </VStack>
                                        </Grid>
                                    </VStack>
                                </Box>
                            )}
                        </VStack>
                    ) : (
                        <DetailedComparison
                            selectedResponses={selectedResponses}
                            synthesizedResponse={synthesizedResponse}
                        />
                    )}
                </ModalBody>
            </MotionBox>
        </Modal>
    );
};
