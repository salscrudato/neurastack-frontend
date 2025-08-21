/**
 * Enhanced Analytics Modal Component
 *
 * Comprehensive analytics experience with rich visualizations, actionable insights,
 * and detailed performance metrics from the NeuraStack AI ensemble.
 */

import {
    Badge,
    Box,
    Circle,
    Grid,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Progress,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack,
    Wrap,
    WrapItem,
    useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useMemo } from 'react';
import {
    PiBrainBold,
    PiChartBarBold,
    PiClockBold,
    PiGaugeBold,
    PiLightningBold,
    PiScalesBold,
    PiShieldCheckBold,
    PiTrendUpBold
} from "react-icons/pi";

const MotionBox = motion(Box);

interface EnhancedAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    analyticsData: any; // Full API response data
}

// Enhanced metric card component
const MetricCard = ({ 
    icon, 
    label, 
    value, 
    subValue, 
    color = "blue.500", 
    trend,
    description 
}: {
    icon: any;
    label: string;
    value: string | number;
    subValue?: string;
    color?: string;
    trend?: 'up' | 'down' | 'stable';
    description?: string;
}) => {
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    
    const getTrendIcon = () => {
        switch (trend) {
            case 'up': return PiTrendUpBold;
            case 'down': return PiTrendUpBold; // Will be rotated
            default: return null;
        }
    };

    const TrendIcon = getTrendIcon();

    return (
        <MotionBox
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            p={4}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
            _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)"
            }}
            transition="all 0.2s"
        >
            <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                    <Circle size="40px" bg={color} color="white">
                        <Icon as={icon} boxSize={5} />
                    </Circle>
                    {TrendIcon && (
                        <Icon 
                            as={TrendIcon} 
                            color={trend === 'up' ? 'green.500' : 'red.500'}
                            transform={trend === 'down' ? 'rotate(180deg)' : 'none'}
                        />
                    )}
                </HStack>
                
                <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.500" fontWeight="500">
                        {label}
                    </Text>
                    <Text fontSize="2xl" fontWeight="700" color="gray.800">
                        {value}
                    </Text>
                    {subValue && (
                        <Text fontSize="sm" color="gray.600">
                            {subValue}
                        </Text>
                    )}
                    {description && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            {description}
                        </Text>
                    )}
                </VStack>
            </VStack>
        </MotionBox>
    );
};

// Model performance comparison component
const ModelPerformanceChart = ({ models }: { models: any[] }) => {
    
    return (
        <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="600" color="gray.800">
                Model Performance Comparison
            </Text>
            
            {models.map((model, index) => {
                const confidence = model.confidence?.score || 0;
                const responseTime = model.responseTime || 0;

                // Calculate quality score from multiple factors
                const calculateQuality = (model: any) => {
                    // If we have a direct quality score, use it
                    if (typeof model.quality === 'number') {
                        return model.quality;
                    }

                    // Calculate based on available metrics
                    let qualityScore = 0.5; // Base score

                    if (model.quality) {
                        // Complexity factor
                        if (model.quality.complexity === 'very-high') qualityScore += 0.3;
                        else if (model.quality.complexity === 'high') qualityScore += 0.2;
                        else if (model.quality.complexity === 'medium') qualityScore += 0.1;

                        // Structure factor
                        if (model.quality.hasStructure) qualityScore += 0.1;

                        // Word count factor (reasonable length)
                        const wordCount = model.quality.wordCount || 0;
                        if (wordCount > 100 && wordCount < 1000) qualityScore += 0.1;

                        // Ensure score is between 0 and 1
                        qualityScore = Math.min(1, Math.max(0, qualityScore));
                    }

                    return qualityScore;
                };

                const quality = calculateQuality(model);
                
                return (
                    <Box key={model.model || index} p={4} bg="gray.50" borderRadius="lg">
                        <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                                <HStack spacing={2}>
                                    <Circle size="24px" bg="blue.500" color="white">
                                        <PiBrainBold size={12} />
                                    </Circle>
                                    <Text fontWeight="600" color="gray.800">
                                        {model.model || 'Unknown Model'}
                                    </Text>
                                </HStack>
                                <Badge 
                                    colorScheme={model.status === 'fulfilled' ? 'green' : 'red'}
                                    variant="subtle"
                                >
                                    {model.status || 'Unknown'}
                                </Badge>
                            </HStack>
                            
                            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
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
                                    <Progress 
                                        value={Math.max(0, 100 - (responseTime / 100))} 
                                        size="sm" 
                                        colorScheme="green"
                                        borderRadius="full"
                                        w="100%"
                                    />
                                    <Text fontSize="xs" fontWeight="600">
                                        {responseTime}ms
                                    </Text>
                                </VStack>
                                
                                <VStack spacing={1}>
                                    <Text fontSize="xs" color="gray.500">Quality</Text>
                                    <Progress 
                                        value={quality * 100} 
                                        size="sm" 
                                        colorScheme="purple"
                                        borderRadius="full"
                                        w="100%"
                                    />
                                    <Text fontSize="xs" fontWeight="600">
                                        {(quality * 100).toFixed(0)}%
                                    </Text>
                                </VStack>
                            </Grid>
                        </VStack>
                    </Box>
                );
            })}
        </VStack>
    );
};

// Consensus analysis component
const ConsensusAnalysis = ({ voting, synthesis }: { voting: any; synthesis: any }) => {
    const consensusLevel = voting?.consensus || 'medium';
    const winner = voting?.winner || 'unknown';
    const confidence = synthesis?.confidence?.score || 0;
    
    const getConsensusColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'strong': return 'green';
            case 'moderate': return 'yellow';
            case 'weak': return 'orange';
            default: return 'red';
        }
    };

    return (
        <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="600" color="gray.800">
                Consensus Analysis
            </Text>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <VStack spacing={2} align="center">
                        <Circle size="48px" bg="blue.500" color="white">
                            <PiScalesBold size={24} />
                        </Circle>
                        <Text fontSize="sm" color="blue.700" fontWeight="500">
                            Consensus Level
                        </Text>
                        <Badge 
                            colorScheme={getConsensusColor(consensusLevel)}
                            size="lg"
                            textTransform="capitalize"
                        >
                            {consensusLevel}
                        </Badge>
                    </VStack>
                </Box>
                
                <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                    <VStack spacing={2} align="center">
                        <Circle size="48px" bg="green.500" color="white">
                            <PiShieldCheckBold size={24} />
                        </Circle>
                        <Text fontSize="sm" color="green.700" fontWeight="500">
                            Overall Confidence
                        </Text>
                        <Text fontSize="2xl" fontWeight="700" color="green.800">
                            {(confidence * 100).toFixed(0)}%
                        </Text>
                    </VStack>
                </Box>
            </Grid>
            
            <Box p={4} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
                <HStack justify="space-between" align="center">
                    <VStack spacing={1} align="start">
                        <Text fontSize="sm" color="purple.700" fontWeight="500">
                            Winning Model
                        </Text>
                        <Text fontSize="lg" fontWeight="600" color="purple.800" textTransform="capitalize">
                            {winner}
                        </Text>
                    </VStack>
                    <Circle size="40px" bg="purple.500" color="white">
                        <PiBrainBold size={20} />
                    </Circle>
                </HStack>
            </Box>
        </VStack>
    );
};

export const EnhancedAnalyticsModal = ({
    isOpen,
    onClose,
    analyticsData
}: EnhancedAnalyticsModalProps) => {
    const overlayBg = useColorModeValue("rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.6)");

    const analytics = useMemo(() => {
        if (!analyticsData?.data) return null;

        const data = analyticsData.data;
        const synthesis = data.synthesis;
        const voting = data.voting;
        const roles = data.roles || [];
        const metadata = data.metadata;

        // Process roles data
        const processedRoles = roles.filter((role: any) => role && typeof role === 'object');
        const successfulRoles = processedRoles.filter((role: any) => role.status === 'fulfilled');
        const failedRoles = processedRoles.filter((role: any) => role.status !== 'fulfilled');

        // Calculate averages
        const avgResponseTime = processedRoles.length > 0
            ? processedRoles.reduce((sum: number, role: any) => sum + (role.responseTime || 0), 0) / processedRoles.length
            : 0;

        const avgConfidence = processedRoles.length > 0
            ? processedRoles.reduce((sum: number, role: any) => sum + (role.confidence?.score || 0), 0) / processedRoles.length
            : 0;

        // Extract processing time from multiple possible locations
        const processingTime = metadata?.processingTimeMs ||
                              metadata?.processingTime ||
                              data.processingTime ||
                              data.metadata?.totalProcessingTime ||
                              Math.round(avgResponseTime) || 0;

        // Debug logging to understand data structure
        if (import.meta.env.DEV) {
            console.log('Analytics Data Debug:', {
                metadata,
                data,
                processingTime,
                avgResponseTime,
                roles: processedRoles.map((r: any) => ({
                    model: r.model,
                    responseTime: r.responseTime,
                    quality: r.quality
                }))
            });
        }

        return {
            synthesis,
            voting,
            roles: processedRoles,
            metadata,
            stats: {
                totalModels: processedRoles.length,
                successfulModels: successfulRoles.length,
                failedModels: failedRoles.length,
                avgResponseTime: Math.round(avgResponseTime),
                avgConfidence,
                processingTime
            }
        };
    }, [analyticsData]);

    if (!analytics) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                <ModalOverlay bg={overlayBg} backdropFilter="blur(8px)" />
                <ModalContent>
                    <ModalHeader>Analytics</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Text color="gray.500">No analytics data available</Text>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
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
                    <HStack spacing={3}>
                        <Circle size="32px" bg="blue.500" color="white">
                            <PiChartBarBold size={16} />
                        </Circle>
                        <Text>Enhanced AI Analytics</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody pb={6}>
                    <Tabs variant="soft-rounded" colorScheme="blue">
                        <TabList mb={6}>
                            <Tab>Overview</Tab>
                            <Tab>Model Performance</Tab>
                            <Tab>Consensus Analysis</Tab>
                            <Tab>Quality Metrics</Tab>
                        </TabList>

                        <TabPanels>
                            {/* Overview Tab */}
                            <TabPanel p={0}>
                                <VStack spacing={6} align="stretch">
                                    {/* Key Metrics Grid */}
                                    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                                        <MetricCard
                                            icon={PiBrainBold}
                                            label="Models Used"
                                            value={analytics.stats.totalModels}
                                            subValue={`${analytics.stats.successfulModels} successful`}
                                            color="blue.500"
                                            description="AI models in ensemble"
                                        />
                                        <MetricCard
                                            icon={PiClockBold}
                                            label="Processing Time"
                                            value={`${analytics.stats.processingTime}ms`}
                                            subValue={`Avg: ${analytics.stats.avgResponseTime}ms`}
                                            color="green.500"
                                            description="Total ensemble processing"
                                        />
                                        <MetricCard
                                            icon={PiGaugeBold}
                                            label="Avg Confidence"
                                            value={`${(analytics.stats.avgConfidence * 100).toFixed(0)}%`}
                                            subValue={analytics.synthesis?.confidence?.level || 'medium'}
                                            color="purple.500"
                                            description="Model confidence average"
                                        />
                                        <MetricCard
                                            icon={PiLightningBold}
                                            label="Synthesis Quality"
                                            value={`${(analytics.synthesis?.qualityScore * 100 || 75).toFixed(0)}%`}
                                            subValue={analytics.synthesis?.synthesisStrategy || 'consensus'}
                                            color="orange.500"
                                            description="Final response quality"
                                        />
                                    </Grid>

                                    {/* Quick Insights */}
                                    <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                                        <VStack spacing={3} align="stretch">
                                            <Text fontSize="lg" fontWeight="600" color="blue.800">
                                                Quick Insights
                                            </Text>
                                            <Wrap spacing={2}>
                                                <WrapItem>
                                                    <Badge colorScheme="green" variant="subtle">
                                                        {analytics.voting?.consensus || 'Medium'} Consensus
                                                    </Badge>
                                                </WrapItem>
                                                <WrapItem>
                                                    <Badge colorScheme="blue" variant="subtle">
                                                        Winner: {analytics.voting?.winner || 'Unknown'}
                                                    </Badge>
                                                </WrapItem>
                                                <WrapItem>
                                                    <Badge colorScheme="purple" variant="subtle">
                                                        {analytics.synthesis?.isFineTuned ? 'Fine-tuned' : 'Standard'} Models
                                                    </Badge>
                                                </WrapItem>
                                            </Wrap>
                                        </VStack>
                                    </Box>
                                </VStack>
                            </TabPanel>

                            {/* Model Performance Tab */}
                            <TabPanel p={0}>
                                <ModelPerformanceChart models={analytics.roles} />
                            </TabPanel>

                            {/* Consensus Analysis Tab */}
                            <TabPanel p={0}>
                                <ConsensusAnalysis
                                    voting={analytics.voting}
                                    synthesis={analytics.synthesis}
                                />
                            </TabPanel>

                            {/* Quality Metrics Tab */}
                            <TabPanel p={0}>
                                <VStack spacing={4} align="stretch">
                                    <Text fontSize="lg" fontWeight="600" color="gray.800">
                                        Response Quality Analysis
                                    </Text>

                                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                                        {analytics.roles.map((model: any, index: number) => (
                                            <Box key={index} p={4} bg="gray.50" borderRadius="lg">
                                                <VStack spacing={3} align="stretch">
                                                    <Text fontWeight="600" color="gray.800">
                                                        {model.model || 'Unknown Model'}
                                                    </Text>

                                                    <VStack spacing={2} align="stretch">
                                                        <HStack justify="space-between">
                                                            <Text fontSize="sm" color="gray.600">Word Count</Text>
                                                            <Text fontSize="sm" fontWeight="500">
                                                                {model.quality?.wordCount || model.wordCount || 0}
                                                            </Text>
                                                        </HStack>
                                                        <HStack justify="space-between">
                                                            <Text fontSize="sm" color="gray.600">Sentences</Text>
                                                            <Text fontSize="sm" fontWeight="500">
                                                                {model.quality?.sentenceCount || 0}
                                                            </Text>
                                                        </HStack>
                                                        <HStack justify="space-between">
                                                            <Text fontSize="sm" color="gray.600">Complexity</Text>
                                                            <Badge
                                                                size="sm"
                                                                colorScheme={
                                                                    model.quality?.complexity === 'very-high' ? 'purple' :
                                                                    model.quality?.complexity === 'high' ? 'red' :
                                                                    model.quality?.complexity === 'medium' ? 'yellow' : 'green'
                                                                }
                                                            >
                                                                {(model.quality?.complexity || 'medium').toUpperCase()}
                                                            </Badge>
                                                        </HStack>
                                                        <HStack justify="space-between">
                                                            <Text fontSize="sm" color="gray.600">Structure</Text>
                                                            <Badge
                                                                size="sm"
                                                                colorScheme={model.quality?.hasStructure ? 'green' : 'red'}
                                                            >
                                                                {model.quality?.hasStructure ? 'Yes' : 'No'}
                                                            </Badge>
                                                        </HStack>
                                                    </VStack>
                                                </VStack>
                                            </Box>
                                        ))}
                                    </Grid>
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </MotionBox>
        </Modal>
    );
};
