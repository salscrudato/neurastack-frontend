/**
 * Advanced Analytics Modal Component
 *
 * Displays comprehensive AI ensemble analytics with detailed metrics, voting analysis,
 * quality assessments, and performance data from the NeuraStack API response.
 * Features modern, innovative design with organized sections for deep insights.
 */

import {
    Badge,
    Box,
    Flex,
    Grid,
    GridItem,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Progress,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack,
    Wrap,
    WrapItem
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useMemo } from 'react';
import {
    PiArrowsClockwiseBold,
    PiBrainBold,
    PiChartBarBold,
    PiGaugeBold,
    PiScalesBold,
    PiShieldCheckBold,
    PiTrendUpBold
} from "react-icons/pi";
import { commonModalProps, commonOverlayStyles } from './shared/modalConfig';

interface AdvancedAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    analyticsData: any; // Full API response data
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const getConfidenceColor = (level: string) => {
    switch (level?.toLowerCase()) {
        case 'high': return '#10B981';
        case 'medium': return '#F59E0B';
        case 'low': return '#EF4444';
        case 'very-low': return '#DC2626';
        default: return '#6B7280';
    }
};



export function AdvancedAnalyticsModal({
    isOpen,
    onClose,
    analyticsData
}: AdvancedAnalyticsModalProps) {
    console.log('AdvancedAnalyticsModal props:', { isOpen, analyticsData });

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

        const avgConfidence = successfulRoles.length > 0
            ? successfulRoles.reduce((sum: number, role: any) => sum + (role.confidence?.score || 0), 0) / successfulRoles.length
            : 0;

        const avgWordCount = successfulRoles.length > 0
            ? successfulRoles.reduce((sum: number, role: any) => sum + (role.quality?.wordCount || 0), 0) / successfulRoles.length
            : 0;

        return {
            // Core data
            synthesis,
            voting,
            roles: processedRoles,
            metadata,
            
            // Computed metrics
            totalModels: processedRoles.length,
            successfulModels: successfulRoles.length,
            failedModels: failedRoles.length,
            successRate: processedRoles.length > 0 ? (successfulRoles.length / processedRoles.length) * 100 : 0,
            
            // Performance metrics
            avgResponseTime,
            avgConfidence,
            avgWordCount,
            totalProcessingTime: metadata?.processingTime || 0,
            
            // Voting analysis
            votingWinner: voting?.winner || 'N/A',
            votingConfidence: voting?.confidence || 0,
            consensus: voting?.consensus || 'unknown',
            diversityScore: voting?.diversityAnalysis?.overallDiversity || 0,
            
            // Quality metrics
            overallConfidence: synthesis?.confidence?.score || 0,
            confidenceLevel: synthesis?.confidence?.level || 'unknown',
            confidenceFactors: synthesis?.confidence?.factors || [],
            
            // Advanced analytics
            sophisticatedFeatures: voting?.analytics?.sophisticatedFeaturesUsed || [],
            qualityScore: voting?.analytics?.qualityScore || 0,
            abstentionTriggered: voting?.abstention?.triggered || false,
            abstentionReasons: voting?.abstention?.reasons || []
        };
    }, [analyticsData]);

    if (!analytics) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={{ base: "full", md: "6xl" }}
            {...commonModalProps}
            aria-labelledby="analytics-modal-title"
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
                maxH="90vh"
                maxW="1200px"
                m={{ base: 2, md: 4 }}
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                border="1px solid"
                borderColor="rgba(226, 232, 240, 0.8)"
                overflow="hidden"
            >
                <ModalHeader
                    bg="linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)"
                    borderBottom="1px solid"
                    borderColor="rgba(226, 232, 240, 0.6)"
                    py={6}
                >
                    <HStack spacing={3}>
                        <Icon as={PiChartBarBold} boxSize={6} color="#4F9CF9" />
                        <Text
                            id="analytics-modal-title"
                            fontSize="xl"
                            fontWeight="bold"
                            color="#1E293B"
                        >
                            Advanced Analytics Dashboard
                        </Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton
                    color="#4F9CF9"
                    _hover={{ bg: "blue.50" }}
                    borderRadius="full"
                />
                
                <ModalBody p={0} overflow="auto">
                    <Tabs variant="enclosed" colorScheme="blue">
                        <TabList bg="#F8FAFC" px={6} borderBottom="1px solid" borderColor="rgba(226, 232, 240, 0.6)">
                            <Tab
                                fontWeight="600"
                                fontSize="sm"
                                bg="#2563EB"
                                color="white"
                                _selected={{
                                    bg: "#1D4ED8",
                                    color: "white",
                                    borderColor: "#1D4ED8"
                                }}
                                _hover={{
                                    bg: "#1E40AF",
                                    color: "white"
                                }}
                                borderRadius="md"
                                mr={1}
                            >
                                Overview
                            </Tab>
                            <Tab
                                fontWeight="600"
                                fontSize="sm"
                                bg="#2563EB"
                                color="white"
                                _selected={{
                                    bg: "#1D4ED8",
                                    color: "white",
                                    borderColor: "#1D4ED8"
                                }}
                                _hover={{
                                    bg: "#1E40AF",
                                    color: "white"
                                }}
                                borderRadius="md"
                                mr={1}
                            >
                                Voting Analysis
                            </Tab>
                            <Tab
                                fontWeight="600"
                                fontSize="sm"
                                bg="#2563EB"
                                color="white"
                                _selected={{
                                    bg: "#1D4ED8",
                                    color: "white",
                                    borderColor: "#1D4ED8"
                                }}
                                _hover={{
                                    bg: "#1E40AF",
                                    color: "white"
                                }}
                                borderRadius="md"
                                mr={1}
                            >
                                Model Performance
                            </Tab>

                        </TabList>
                        
                        <TabPanels>
                            {/* Overview Tab */}
                            <TabPanel p={6}>
                                <VStack spacing={6} align="stretch">
                                    {/* AI Meta-Voting Analysis */}
                                    {analytics.voting?.metaVoting && (
                                        <Box
                                            bg="white"
                                            borderRadius="xl"
                                            p={6}
                                            border="1px solid"
                                            borderColor="rgba(226, 232, 240, 0.6)"
                                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        >
                                            <HStack spacing={3} mb={4}>
                                                <Icon as={PiBrainBold} boxSize={6} color="#10B981" />
                                                <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                    AI Meta-Voting Analysis
                                                </Text>
                                            </HStack>
                                            <VStack spacing={4} align="stretch">
                                                <Flex justify="space-between" align="center">
                                                    <Text fontSize="sm" color="#64748B">Meta Winner</Text>
                                                    <Badge colorScheme="green" variant="solid">
                                                        {analytics.voting.metaVoting.winner}
                                                    </Badge>
                                                </Flex>
                                                <Flex justify="space-between" align="center">
                                                    <Text fontSize="sm" color="#64748B">Meta Confidence</Text>
                                                    <Badge colorScheme="blue" variant="solid">
                                                        {(analytics.voting.metaVoting.confidence * 100).toFixed(1)}%
                                                    </Badge>
                                                </Flex>
                                                {analytics.voting.metaVoting.reasoning && (
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="600" color="#1E293B" mb={2}>
                                                            AI Reasoning
                                                        </Text>
                                                        <Text fontSize="xs" color="#64748B" lineHeight="1.5">
                                                            {analytics.voting.metaVoting.reasoning}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </Box>
                                    )}

                                    {/* Overall Confidence/Quality Score */}
                                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                        <GridItem>
                                            <Stat
                                                bg="white"
                                                p={4}
                                                borderRadius="xl"
                                                border="1px solid"
                                                borderColor="rgba(226, 232, 240, 0.6)"
                                                boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                                            >
                                                <StatLabel fontSize="xs" color="#64748B">Overall Confidence</StatLabel>
                                                <StatNumber fontSize="2xl" color={getConfidenceColor(analytics.confidenceLevel)}>
                                                    {(analytics.overallConfidence * 100).toFixed(1)}%
                                                </StatNumber>
                                                <StatHelpText fontSize="xs" color="#94A3B8">
                                                    {analytics.confidenceLevel.toUpperCase()}
                                                </StatHelpText>
                                            </Stat>
                                        </GridItem>

                                        <GridItem>
                                            <Stat
                                                bg="white"
                                                p={4}
                                                borderRadius="xl"
                                                border="1px solid"
                                                borderColor="rgba(226, 232, 240, 0.6)"
                                                boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                                            >
                                                <StatLabel fontSize="xs" color="#64748B">Quality Score</StatLabel>
                                                <StatNumber fontSize="2xl" color="#8B5CF6">
                                                    {(analytics.qualityScore * 100).toFixed(0)}%
                                                </StatNumber>
                                                <StatHelpText fontSize="xs" color="#94A3B8">
                                                    Overall quality
                                                </StatHelpText>
                                            </Stat>
                                        </GridItem>
                                    </Grid>

                                    {/* Confidence Analysis */}
                                    <Box
                                        bg="white"
                                        borderRadius="xl"
                                        p={6}
                                        border="1px solid"
                                        borderColor="rgba(226, 232, 240, 0.6)"
                                        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    >
                                        <HStack spacing={3} mb={4}>
                                            <Icon as={PiShieldCheckBold} boxSize={6} color="#10B981" />
                                            <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                Confidence Analysis
                                            </Text>
                                        </HStack>
                                        <VStack spacing={3} align="stretch">
                                            <Progress
                                                value={analytics.overallConfidence * 100}
                                                colorScheme={analytics.confidenceLevel === 'high' ? 'green' : analytics.confidenceLevel === 'medium' ? 'yellow' : 'red'}
                                                size="lg"
                                                borderRadius="full"
                                            />
                                            <Wrap spacing={2}>
                                                {analytics.confidenceFactors.map((factor: any, index: number) => (
                                                    <WrapItem key={index}>
                                                        <Badge
                                                            colorScheme="blue"
                                                            variant="subtle"
                                                            fontSize="xs"
                                                            px={3}
                                                            py={1}
                                                            borderRadius="full"
                                                        >
                                                            {factor}
                                                        </Badge>
                                                    </WrapItem>
                                                ))}
                                            </Wrap>
                                        </VStack>
                                    </Box>

                                    {/* Individual Model Responses */}
                                    <Box
                                        bg="white"
                                        borderRadius="xl"
                                        p={6}
                                        border="1px solid"
                                        borderColor="rgba(226, 232, 240, 0.6)"
                                        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    >
                                        <HStack spacing={3} mb={4}>
                                            <Icon as={PiChartBarBold} boxSize={6} color="#4F9CF9" />
                                            <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                Individual Model Responses
                                            </Text>
                                        </HStack>
                                        <VStack spacing={4} align="stretch">
                                            {analytics.roles.map((role: any, index: number) => (
                                                <Box
                                                    key={index}
                                                    p={4}
                                                    borderRadius="lg"
                                                    border="1px solid"
                                                    borderColor="rgba(226, 232, 240, 0.4)"
                                                    bg="rgba(248, 250, 252, 0.5)"
                                                >
                                                    <Flex justify="flex-start" align="center" mb={3}>
                                                        <Badge colorScheme="blue" variant="solid">
                                                            {role.role || role.model || 'Unknown'}
                                                        </Badge>
                                                    </Flex>
                                                    {role.content && (
                                                        <Box
                                                            p={3}
                                                            bg="white"
                                                            borderRadius="md"
                                                            border="1px solid"
                                                            borderColor="rgba(226, 232, 240, 0.3)"
                                                        >
                                                            <Text fontSize="sm" color="#1E293B" lineHeight="1.6">
                                                                {role.content.length > 300
                                                                    ? `${role.content.substring(0, 300)}...`
                                                                    : role.content
                                                                }
                                                            </Text>
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </VStack>
                                    </Box>
                                </VStack>
                            </TabPanel>

                            {/* Voting Analysis Tab */}
                            <TabPanel p={6}>
                                <VStack spacing={6} align="stretch">
                                    {/* Voting Overview */}
                                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                                        <GridItem>
                                            <Stat
                                                bg="white"
                                                p={4}
                                                borderRadius="xl"
                                                border="1px solid"
                                                borderColor="rgba(226, 232, 240, 0.6)"
                                                boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                                            >
                                                <StatLabel fontSize="xs" color="#64748B">Voting Winner</StatLabel>
                                                <StatNumber fontSize="xl" color="#10B981">
                                                    {analytics.votingWinner}
                                                </StatNumber>
                                                <StatHelpText fontSize="xs" color="#94A3B8">
                                                    Selected model
                                                </StatHelpText>
                                            </Stat>
                                        </GridItem>

                                        <GridItem>
                                            <Stat
                                                bg="white"
                                                p={4}
                                                borderRadius="xl"
                                                border="1px solid"
                                                borderColor="rgba(226, 232, 240, 0.6)"
                                                boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                                            >
                                                <StatLabel fontSize="xs" color="#64748B">Voting Confidence</StatLabel>
                                                <StatNumber fontSize="xl" color="#4F9CF9">
                                                    {(analytics.votingConfidence * 100).toFixed(1)}%
                                                </StatNumber>
                                                <StatHelpText fontSize="xs" color="#94A3B8">
                                                    Decision strength
                                                </StatHelpText>
                                            </Stat>
                                        </GridItem>

                                        <GridItem>
                                            <Stat
                                                bg="white"
                                                p={4}
                                                borderRadius="xl"
                                                border="1px solid"
                                                borderColor="rgba(226, 232, 240, 0.6)"
                                                boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                                            >
                                                <StatLabel fontSize="xs" color="#64748B">Consensus</StatLabel>
                                                <StatNumber fontSize="xl" color="#8B5CF6">
                                                    {analytics.consensus}
                                                </StatNumber>
                                                <StatHelpText fontSize="xs" color="#94A3B8">
                                                    Agreement level
                                                </StatHelpText>
                                            </Stat>
                                        </GridItem>
                                    </Grid>

                                    {/* Voting Weights */}
                                    <Box
                                        bg="white"
                                        borderRadius="xl"
                                        p={6}
                                        border="1px solid"
                                        borderColor="rgba(226, 232, 240, 0.6)"
                                        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    >
                                        <HStack spacing={3} mb={4}>
                                            <Icon as={PiScalesBold} boxSize={6} color="#4F9CF9" />
                                            <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                Voting Weights
                                            </Text>
                                        </HStack>
                                        <VStack spacing={4} align="stretch">
                                            {analytics.voting?.weights && Object.entries(analytics.voting.weights).map(([model, weight]) => (
                                                <Box key={model}>
                                                    <Flex justify="space-between" align="center" mb={2}>
                                                        <Text fontSize="sm" fontWeight="600" color="#1E293B">
                                                            {model.toUpperCase()}
                                                        </Text>
                                                        <Text fontSize="sm" color="#64748B">
                                                            {((weight as number) * 100).toFixed(1)}%
                                                        </Text>
                                                    </Flex>
                                                    <Progress
                                                        value={(weight as number) * 100}
                                                        colorScheme="blue"
                                                        size="sm"
                                                        borderRadius="full"
                                                    />
                                                </Box>
                                            ))}
                                        </VStack>
                                    </Box>

                                    {/* Diversity Analysis */}
                                    {analytics.voting?.diversityAnalysis && (
                                        <Box
                                            bg="white"
                                            borderRadius="xl"
                                            p={6}
                                            border="1px solid"
                                            borderColor="rgba(226, 232, 240, 0.6)"
                                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        >
                                            <HStack spacing={3} mb={4}>
                                                <Icon as={PiArrowsClockwiseBold} boxSize={6} color="#8B5CF6" />
                                                <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                    Diversity Analysis
                                                </Text>
                                            </HStack>
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                <GridItem>
                                                    <VStack spacing={3} align="stretch">
                                                        <Flex justify="space-between" align="center">
                                                            <Text fontSize="sm" color="#64748B">Overall Diversity</Text>
                                                            <Badge colorScheme="purple" variant="solid">
                                                                {(analytics.diversityScore * 100).toFixed(0)}%
                                                            </Badge>
                                                        </Flex>
                                                        <Flex justify="space-between" align="center">
                                                            <Text fontSize="sm" color="#64748B">Total Clusters</Text>
                                                            <Badge colorScheme="blue" variant="outline">
                                                                {analytics.voting.diversityAnalysis.clusterAnalysis?.totalClusters || 0}
                                                            </Badge>
                                                        </Flex>
                                                        <Flex justify="space-between" align="center">
                                                            <Text fontSize="sm" color="#64748B">Largest Cluster</Text>
                                                            <Badge colorScheme="green" variant="outline">
                                                                {analytics.voting.diversityAnalysis.clusterAnalysis?.largestCluster || 0}
                                                            </Badge>
                                                        </Flex>
                                                    </VStack>
                                                </GridItem>
                                                <GridItem>
                                                    <VStack spacing={2} align="stretch">
                                                        <Text fontSize="sm" fontWeight="600" color="#1E293B" mb={2}>
                                                            Diversity Weights
                                                        </Text>
                                                        {analytics.voting.diversityAnalysis.diversityWeights &&
                                                         Object.entries(analytics.voting.diversityAnalysis.diversityWeights).map(([model, weight]) => (
                                                            <Flex key={model} justify="space-between" align="center">
                                                                <Text fontSize="xs" color="#64748B">
                                                                    {model}
                                                                </Text>
                                                                <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                                                                    {(weight as number).toFixed(2)}x
                                                                </Badge>
                                                            </Flex>
                                                        ))}
                                                    </VStack>
                                                </GridItem>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Meta Voting */}
                                    {analytics.voting?.metaVoting && (
                                        <Box
                                            bg="white"
                                            borderRadius="xl"
                                            p={6}
                                            border="1px solid"
                                            borderColor="rgba(226, 232, 240, 0.6)"
                                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        >
                                            <HStack spacing={3} mb={4}>
                                                <Icon as={PiBrainBold} boxSize={6} color="#10B981" />
                                                <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                    AI Meta-Voting Analysis
                                                </Text>
                                            </HStack>
                                            <VStack spacing={4} align="stretch">
                                                <Flex justify="space-between" align="center">
                                                    <Text fontSize="sm" color="#64748B">Meta Winner</Text>
                                                    <Badge colorScheme="green" variant="solid">
                                                        {analytics.voting.metaVoting.winner}
                                                    </Badge>
                                                </Flex>
                                                <Flex justify="space-between" align="center">
                                                    <Text fontSize="sm" color="#64748B">Meta Confidence</Text>
                                                    <Badge colorScheme="blue" variant="solid">
                                                        {(analytics.voting.metaVoting.confidence * 100).toFixed(1)}%
                                                    </Badge>
                                                </Flex>
                                                {analytics.voting.metaVoting.reasoning && (
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="600" color="#1E293B" mb={2}>
                                                            AI Reasoning
                                                        </Text>
                                                        <Text fontSize="xs" color="#64748B" lineHeight="1.5">
                                                            {analytics.voting.metaVoting.reasoning}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </Box>
                                    )}
                                </VStack>
                            </TabPanel>

                            {/* Model Performance Tab */}
                            <TabPanel p={6}>
                                <VStack spacing={6} align="stretch">
                                    {/* Performance Overview */}
                                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                        <GridItem>
                                            <Stat
                                                bg="white"
                                                p={4}
                                                borderRadius="xl"
                                                border="1px solid"
                                                borderColor="rgba(226, 232, 240, 0.6)"
                                                boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                                            >
                                                <StatLabel fontSize="xs" color="#64748B">Avg Response Time</StatLabel>
                                                <StatNumber fontSize="xl" color="#4F9CF9">
                                                    {(analytics.avgResponseTime / 1000).toFixed(2)}s
                                                </StatNumber>
                                                <StatHelpText fontSize="xs" color="#94A3B8">
                                                    Per model
                                                </StatHelpText>
                                            </Stat>
                                        </GridItem>

                                        <GridItem>
                                            <Stat
                                                bg="white"
                                                p={4}
                                                borderRadius="xl"
                                                border="1px solid"
                                                borderColor="rgba(226, 232, 240, 0.6)"
                                                boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                                            >
                                                <StatLabel fontSize="xs" color="#64748B">Avg Confidence</StatLabel>
                                                <StatNumber fontSize="xl" color="#10B981">
                                                    {(analytics.avgConfidence * 100).toFixed(1)}%
                                                </StatNumber>
                                                <StatHelpText fontSize="xs" color="#94A3B8">
                                                    Model average
                                                </StatHelpText>
                                            </Stat>
                                        </GridItem>

                                        <GridItem>
                                            <Stat
                                                bg="white"
                                                p={4}
                                                borderRadius="xl"
                                                border="1px solid"
                                                borderColor="rgba(226, 232, 240, 0.6)"
                                                boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                                            >
                                                <StatLabel fontSize="xs" color="#64748B">Avg Word Count</StatLabel>
                                                <StatNumber fontSize="xl" color="#8B5CF6">
                                                    {analytics.avgWordCount.toFixed(0)}
                                                </StatNumber>
                                                <StatHelpText fontSize="xs" color="#94A3B8">
                                                    Words per response
                                                </StatHelpText>
                                            </Stat>
                                        </GridItem>

                                        <GridItem>
                                            <Box
                                                bg="white"
                                                borderRadius="xl"
                                                p={6}
                                                border="1px solid"
                                                borderColor="rgba(226, 232, 240, 0.6)"
                                                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                            >
                                                <HStack spacing={3} mb={4}>
                                                    <Icon as={PiGaugeBold} boxSize={6} color="#8B5CF6" />
                                                    <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                        Quality Assessment
                                                    </Text>
                                                </HStack>
                                                <VStack spacing={3} align="stretch">
                                                    <Flex justify="space-between" align="center">
                                                        <Text fontSize="sm" color="#64748B">Overall Quality</Text>
                                                        <Badge colorScheme="purple" variant="solid">
                                                            {(analytics.qualityScore * 100).toFixed(0)}%
                                                        </Badge>
                                                    </Flex>
                                                    <Progress
                                                        value={analytics.qualityScore * 100}
                                                        colorScheme="purple"
                                                        size="lg"
                                                        borderRadius="full"
                                                    />
                                                </VStack>
                                            </Box>
                                        </GridItem>
                                    </Grid>

                                    {/* Individual Model Performance */}
                                    <Box
                                        bg="white"
                                        borderRadius="xl"
                                        p={6}
                                        border="1px solid"
                                        borderColor="rgba(226, 232, 240, 0.6)"
                                        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    >
                                        <HStack spacing={3} mb={4}>
                                            <Icon as={PiTrendUpBold} boxSize={6} color="#10B981" />
                                            <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                Individual Model Performance
                                            </Text>
                                        </HStack>
                                        <VStack spacing={4} align="stretch">
                                            {analytics.roles.map((role: any, index: number) => (
                                                <Box
                                                    key={index}
                                                    p={4}
                                                    borderRadius="lg"
                                                    border="1px solid"
                                                    borderColor="rgba(226, 232, 240, 0.4)"
                                                    bg="rgba(248, 250, 252, 0.5)"
                                                >
                                                    <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                                                        <GridItem>
                                                            <VStack spacing={1} align="start">
                                                                <Text fontSize="xs" color="#64748B">Model</Text>
                                                                <Badge colorScheme="blue" variant="solid">
                                                                    {role.role || role.model || 'Unknown'}
                                                                </Badge>
                                                            </VStack>
                                                        </GridItem>
                                                        <GridItem>
                                                            <VStack spacing={1} align="start">
                                                                <Text fontSize="xs" color="#64748B">Status</Text>
                                                                <Badge
                                                                    colorScheme={role.status === 'fulfilled' ? 'green' : 'red'}
                                                                    variant="solid"
                                                                >
                                                                    {role.status || 'Unknown'}
                                                                </Badge>
                                                            </VStack>
                                                        </GridItem>
                                                        <GridItem>
                                                            <VStack spacing={1} align="start">
                                                                <Text fontSize="xs" color="#64748B">Response Time</Text>
                                                                <Text fontSize="sm" fontWeight="600" color="#1E293B">
                                                                    {role.responseTime ? `${(role.responseTime / 1000).toFixed(2)}s` : 'N/A'}
                                                                </Text>
                                                            </VStack>
                                                        </GridItem>
                                                        <GridItem>
                                                            <VStack spacing={1} align="start">
                                                                <Text fontSize="xs" color="#64748B">Confidence</Text>
                                                                <Text
                                                                    fontSize="sm"
                                                                    fontWeight="600"
                                                                    color={getConfidenceColor(role.confidence?.level || 'unknown')}
                                                                >
                                                                    {role.confidence ? `${(role.confidence.score * 100).toFixed(1)}%` : 'N/A'}
                                                                </Text>
                                                            </VStack>
                                                        </GridItem>
                                                    </Grid>
                                                    {role.confidence?.factors && role.confidence.factors.length > 0 && (
                                                        <Box mt={3}>
                                                            <Text fontSize="xs" color="#64748B" mb={2}>Confidence Factors:</Text>
                                                            <Wrap spacing={1}>
                                                                {role.confidence.factors.map((factor: any, factorIndex: number) => (
                                                                    <WrapItem key={factorIndex}>
                                                                        <Badge
                                                                            colorScheme="gray"
                                                                            variant="subtle"
                                                                            fontSize="2xs"
                                                                            px={2}
                                                                            py={1}
                                                                        >
                                                                            {factor}
                                                                        </Badge>
                                                                    </WrapItem>
                                                                ))}
                                                            </Wrap>
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </VStack>
                                    </Box>
                                </VStack>
                            </TabPanel>


                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
