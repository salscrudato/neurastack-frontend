/**
 * Real-time AI Ensemble Visualization Component
 * 
 * Provides live visualization of AI models processing user queries with:
 * - Real-time confidence scores and processing states
 * - Model agreement indicators and consensus building
 * - Processing time comparison and quality metrics
 * - Smooth animations and progressive disclosure
 */

import {
    Badge,
    Box,
    Circle,
    Flex,
    HStack,
    Icon,
    Progress,
    Text,
    VStack,
    useColorModeValue
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    PiBrainBold,
    PiCheckBold,
    PiClockBold,
    PiLightningBold,
    PiScalesBold,
    PiShieldCheckBold,
    PiTrendUpBold,
    PiWarningBold
} from "react-icons/pi";

// Animation wrapper
const MotionBox = motion(Box);

// Types for processing states
interface ModelProcessingState {
    model: string;
    provider: 'openai' | 'google' | 'anthropic';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    confidence?: number;
    processingTime?: number;
    quality?: number;
    responseLength?: number;
}

// Sophisticated voting stages
interface VotingStage {
    stage: 'traditional' | 'diversity' | 'historical' | 'meta-voting' | 'abstention' | 'synthesis';
    status: 'pending' | 'processing' | 'completed' | 'skipped';
    description: string;
    confidence?: number;
    winner?: string;
    reasoning?: string;
}

interface EnsembleVisualizationProps {
    isProcessing: boolean;
    models?: ModelProcessingState[];
    overallProgress?: number;
    consensusLevel?: number;
    estimatedTime?: number;
    votingStages?: VotingStage[];
    showAdvancedFeatures?: boolean;
    onComplete?: () => void;
}

// Model configuration with colors and icons
const MODEL_CONFIG = {
    'gpt-4o-mini': {
        provider: 'openai',
        color: '#10A37F',
        name: 'GPT-4o',
        icon: PiBrainBold
    },
    'gemini-1.5-flash': {
        provider: 'google',
        color: '#4285F4',
        name: 'Gemini',
        icon: PiLightningBold
    },
    'claude-3-5-haiku-latest': {
        provider: 'anthropic',
        color: '#FF6B35',
        name: 'Claude',
        icon: PiBrainBold
    }
} as const;

// Animation variants
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.3 }
    }
};

const modelCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3 }
    },
    processing: {
        scale: [1, 1.02, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const pulseVariants = {
    pulse: {
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// Voting Stage Indicator Component
const VotingStageIndicator = ({ stage }: { stage: VotingStage }) => {
    const getStageIcon = () => {
        switch (stage.stage) {
            case 'traditional': return PiScalesBold;
            case 'diversity': return PiTrendUpBold;
            case 'historical': return PiClockBold;
            case 'meta-voting': return PiBrainBold;
            case 'abstention': return PiWarningBold;
            case 'synthesis': return PiShieldCheckBold;
            default: return PiBrainBold;
        }
    };

    const getStageColor = () => {
        switch (stage.status) {
            case 'completed': return '#10B981';
            case 'processing': return '#4F9CF9';
            case 'skipped': return '#94A3B8';
            default: return '#E5E7EB';
        }
    };

    const StageIcon = getStageIcon();

    return (
        <HStack spacing={3} p={2} borderRadius="lg" bg="rgba(255, 255, 255, 0.5)">
            <Circle size="24px" bg={getStageColor()} color="white">
                <Icon as={StageIcon} boxSize={3} />
            </Circle>
            <VStack spacing={0} align="start" flex={1}>
                <Text fontSize="xs" fontWeight="600" color="gray.800" textTransform="capitalize">
                    {stage.stage.replace('-', ' ')}
                </Text>
                <Text fontSize="xs" color="gray.500">
                    {stage.description}
                </Text>
            </VStack>
            {stage.status === 'processing' && (
                <Box>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Icon as={PiLightningBold} boxSize={3} color="#4F9CF9" />
                    </motion.div>
                </Box>
            )}
            {stage.status === 'completed' && stage.winner && (
                <Badge colorScheme="green" fontSize="xs">
                    {stage.winner}
                </Badge>
            )}
        </HStack>
    );
};

// Individual Model Processing Card
const ModelProcessingCard = ({ model }: { model: ModelProcessingState; isActive: boolean }) => {
    const config = MODEL_CONFIG[model.model as keyof typeof MODEL_CONFIG];
    const IconComponent = config?.icon || PiBrainBold;
    
    const cardBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 44, 0.95)");
    const borderColor = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(74, 85, 104, 0.8)");
    
    const getStatusColor = () => {
        switch (model.status) {
            case 'completed': return '#10B981';
            case 'processing': return config?.color || '#4F9CF9';
            case 'failed': return '#EF4444';
            default: return '#94A3B8';
        }
    };

    const getStatusIcon = () => {
        switch (model.status) {
            case 'completed': return PiCheckBold;
            case 'processing': return IconComponent;
            case 'failed': return PiClockBold;
            default: return IconComponent;
        }
    };

    const StatusIcon = getStatusIcon();

    return (
        <MotionBox
            variants={modelCardVariants}
            animate={model.status === 'processing' ? 'processing' : 'visible'}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            p={4}
            position="relative"
            overflow="hidden"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
            backdropFilter="blur(10px)"
            _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)"
            }}
        >
            {/* Processing glow effect */}
            {model.status === 'processing' && (
                <MotionBox
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg={`linear-gradient(135deg, ${config?.color}20, transparent)`}
                    borderRadius="xl"
                    variants={pulseVariants}
                    animate="pulse"
                />
            )}
            
            <VStack spacing={3} align="stretch" position="relative" zIndex={1}>
                {/* Model Header */}
                <HStack justify="space-between" align="center">
                    <HStack spacing={2}>
                        <Circle
                            size="32px"
                            bg={getStatusColor()}
                            color="white"
                            boxShadow="0 2px 8px rgba(0, 0, 0, 0.15)"
                        >
                            <StatusIcon size={16} />
                        </Circle>
                        <VStack spacing={0} align="start">
                            <Text fontSize="sm" fontWeight="600" color="gray.800">
                                {config?.name || model.model}
                            </Text>
                            <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                                {model.status}
                            </Text>
                        </VStack>
                    </HStack>
                    
                    {model.processingTime && (
                        <HStack spacing={1}>
                            <PiClockBold size={12} color="#6B7280" />
                            <Text fontSize="xs" color="gray.500">
                                {model.processingTime}ms
                            </Text>
                        </HStack>
                    )}
                </HStack>

                {/* Progress Indicators */}
                {model.status === 'processing' && (
                    <VStack spacing={2} align="stretch">
                        <Progress
                            value={model.confidence ? model.confidence * 100 : 0}
                            size="sm"
                            colorScheme="blue"
                            bg="gray.100"
                            borderRadius="full"
                            hasStripe
                            isAnimated
                        />
                        <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.500">
                                Confidence
                            </Text>
                            <Text fontSize="xs" fontWeight="500" color="gray.700">
                                {model.confidence ? `${(model.confidence * 100).toFixed(0)}%` : '...'}
                            </Text>
                        </HStack>
                    </VStack>
                )}

                {/* Completed Metrics */}
                {model.status === 'completed' && (
                    <HStack justify="space-between" fontSize="xs">
                        <VStack spacing={0} align="center">
                            <Text color="gray.500">Quality</Text>
                            <Text fontWeight="600" color="green.600">
                                {model.quality ? `${(model.quality * 100).toFixed(0)}%` : 'N/A'}
                            </Text>
                        </VStack>
                        <VStack spacing={0} align="center">
                            <Text color="gray.500">Length</Text>
                            <Text fontWeight="600" color="blue.600">
                                {model.responseLength || 0}
                            </Text>
                        </VStack>
                    </HStack>
                )}
            </VStack>
        </MotionBox>
    );
};

export const RealTimeEnsembleVisualization = ({
    isProcessing,
    overallProgress = 0,
    consensusLevel = 0,
    estimatedTime = 0,
    showAdvancedFeatures = true
}: EnsembleVisualizationProps) => {
    const [displayModels, setDisplayModels] = useState<ModelProcessingState[]>([]);
    const [currentVotingStages, setCurrentVotingStages] = useState<VotingStage[]>([]);

    // Simulate real-time updates for demo purposes
    useEffect(() => {
        if (!isProcessing) {
            setDisplayModels([]);
            setCurrentVotingStages([]);
            return;
        }

        // Initialize models with default state
        const initialModels: ModelProcessingState[] = [
            { model: 'gpt-4o-mini', provider: 'openai', status: 'pending' },
            { model: 'gemini-1.5-flash', provider: 'google', status: 'pending' },
            { model: 'claude-3-5-haiku-latest', provider: 'anthropic', status: 'pending' }
        ];

        // Initialize voting stages
        const initialVotingStages: VotingStage[] = [
            { stage: 'traditional', status: 'pending', description: 'Basic confidence voting' },
            { stage: 'diversity', status: 'pending', description: 'Analyzing response diversity' },
            { stage: 'historical', status: 'pending', description: 'Historical performance weighting' },
            { stage: 'meta-voting', status: 'pending', description: 'AI-powered meta analysis' },
            { stage: 'abstention', status: 'pending', description: 'Quality threshold check' },
            { stage: 'synthesis', status: 'pending', description: 'Final response synthesis' }
        ];

        setDisplayModels(initialModels);
        setCurrentVotingStages(initialVotingStages);

        // Simulate processing progression
        const progressTimer = setTimeout(() => {
            setDisplayModels(prev => prev.map((model) => ({
                ...model,
                status: 'processing' as const,
                confidence: Math.random() * 0.5 + 0.3 // 30-80% initial confidence
            })));

            // Start voting stages progression
            setCurrentVotingStages(prev => prev.map((stage, index) =>
                index === 0 ? { ...stage, status: 'processing' } : stage
            ));
        }, 500);

        return () => clearTimeout(progressTimer);
    }, [isProcessing]);

    if (!isProcessing && displayModels.length === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            {isProcessing && (
                <MotionBox
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    w="100%"
                    p={4}
                    bg="rgba(255, 255, 255, 0.8)"
                    backdropFilter="blur(20px)"
                    borderRadius="2xl"
                    border="1px solid rgba(226, 232, 240, 0.6)"
                    boxShadow="0 8px 32px rgba(0, 0, 0, 0.08)"
                >
                    <VStack spacing={4} align="stretch">
                        {/* Header */}
                        <Flex justify="space-between" align="center">
                            <HStack spacing={2}>
                                <Circle size="24px" bg="blue.500" color="white">
                                    <PiBrainBold size={12} />
                                </Circle>
                                <Text fontSize="md" fontWeight="600" color="gray.800">
                                    AI Ensemble Processing
                                </Text>
                            </HStack>

                            {estimatedTime > 0 && (
                                <HStack spacing={1}>
                                    <PiClockBold size={14} color="#6B7280" />
                                    <Text fontSize="sm" color="gray.500">
                                        ~{estimatedTime}s
                                    </Text>
                                </HStack>
                            )}
                        </Flex>

                        {/* Overall Progress */}
                        <VStack spacing={2} align="stretch">
                            <Progress
                                value={overallProgress}
                                size="md"
                                colorScheme="blue"
                                bg="gray.100"
                                borderRadius="full"
                                hasStripe
                                isAnimated
                            />
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">
                                    Overall Progress
                                </Text>
                                <Text fontSize="sm" fontWeight="500" color="blue.600">
                                    {overallProgress.toFixed(0)}%
                                </Text>
                            </HStack>
                        </VStack>

                        {/* Model Processing Cards */}
                        <VStack spacing={3} align="stretch">
                            {displayModels.map((model) => (
                                <ModelProcessingCard
                                    key={model.model}
                                    model={model}
                                    isActive={model.status === 'processing'}
                                />
                            ))}
                        </VStack>

                        {/* Advanced Voting Stages */}
                        {showAdvancedFeatures && currentVotingStages.length > 0 && (
                            <Box
                                p={4}
                                bg="rgba(139, 92, 246, 0.05)"
                                borderRadius="xl"
                                border="1px solid rgba(139, 92, 246, 0.2)"
                            >
                                <VStack spacing={3} align="stretch">
                                    <HStack spacing={2}>
                                        <Icon as={PiBrainBold} boxSize={4} color="purple.500" />
                                        <Text fontSize="sm" fontWeight="600" color="purple.700">
                                            Sophisticated Voting Process
                                        </Text>
                                    </HStack>
                                    <VStack spacing={2} align="stretch">
                                        {currentVotingStages.map((stage) => (
                                            <VotingStageIndicator key={stage.stage} stage={stage} />
                                        ))}
                                    </VStack>
                                </VStack>
                            </Box>
                        )}

                        {/* Consensus Indicator */}
                        {consensusLevel > 0 && (
                            <Box
                                p={3}
                                bg="rgba(16, 185, 129, 0.1)"
                                borderRadius="lg"
                                border="1px solid rgba(16, 185, 129, 0.2)"
                            >
                                <HStack justify="space-between">
                                    <Text fontSize="sm" fontWeight="500" color="green.700">
                                        Model Consensus
                                    </Text>
                                    <Text fontSize="sm" fontWeight="600" color="green.600">
                                        {(consensusLevel * 100).toFixed(0)}%
                                    </Text>
                                </HStack>
                                <Progress
                                    value={consensusLevel * 100}
                                    size="sm"
                                    colorScheme="green"
                                    mt={2}
                                    borderRadius="full"
                                />
                            </Box>
                        )}
                    </VStack>
                </MotionBox>
            )}
        </AnimatePresence>
    );
};
