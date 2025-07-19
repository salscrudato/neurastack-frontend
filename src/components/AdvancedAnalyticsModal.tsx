/**
 * Advanced Analytics Modal Component
 *
 * Displays comprehensive AI ensemble analytics with detailed metrics, voting analysis,
 * quality assessments, and performance data from the NeuraStack API response.
 * Features modern, innovative design with organized sections for deep insights.
 */

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
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

        // Extract additional interesting metrics from the response
        const diversityScore = voting?.diversityAnalysis?.overallDiversity || 0;
        const sophisticatedFeatures = voting?.analytics?.sophisticatedFeaturesUsed || [];
        const qualityMetrics = voting?.abstention?.qualityMetrics || null;

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
            abstentionReasons: voting?.abstention?.reasons || [],

            // New enhanced analytics
            metaVoting: voting?.metaVoting || null,
            tieBreaking: voting?.tieBreaking || null,
            clusterAnalysis: voting?.diversityAnalysis?.clusterAnalysis || null,
            historicalPerformance: voting?.historicalPerformance || null,
            abstentionAnalysis: voting?.abstention || null,

            // Additional interesting metrics
            qualityMetrics,

            // User-friendly metrics
            responseVariety: diversityScore > 0.8 ? 'High' : diversityScore > 0.5 ? 'Medium' : 'Low',
            aiSystemsUsed: sophisticatedFeatures.length,
            overallReliability: qualityMetrics?.overallQuality ? (qualityMetrics.overallQuality * 100).toFixed(0) + '%' : 'N/A'
        };
    }, [analyticsData]);

    if (!analytics) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            {...{ ...commonModalProps, isCentered: false }}
            aria-labelledby="analytics-modal-title"
        >
            <ModalOverlay
                {...commonOverlayStyles}
                zIndex="var(--z-modal-backdrop)"
            />
            <ModalContent
                as={motion.div}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                bg="#FFFFFF"
                borderRadius={{ base: "0", md: "2xl" }}
                h={{
                    base: "calc(100vh - var(--header-height-mobile))",
                    md: "calc(100vh - 40px)"
                }}
                w="100vw"
                maxH={{
                    base: "calc(100vh - var(--header-height-mobile))",
                    md: "calc(100vh - 40px)"
                }}
                maxW="100vw"
                m={{ base: "0 !important", md: "20px auto !important" }}
                p={0}
                boxShadow={{ base: "none", md: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                border={{ base: "none", md: "1px solid" }}
                borderColor="rgba(226, 232, 240, 0.8)"
                overflow="hidden"
                zIndex="var(--z-modal)"
                position="fixed"
                top={{
                    base: "var(--header-height-mobile) !important",
                    md: "20px !important"
                }}
                left={{
                    base: "0 !important",
                    md: "50% !important"
                }}
                right={{
                    base: "0 !important",
                    md: "auto !important"
                }}
                bottom={{
                    base: "0 !important",
                    md: "20px !important"
                }}
                sx={{
                    margin: { base: "0 !important", md: "20px auto !important" },
                    transform: { base: "none !important", md: "translateX(-50%) !important" }
                }}
                display="flex"
                flexDirection="column"
            >
                {/* Sticky Header Container */}
                <Box
                    position="sticky"
                    top={0}
                    zIndex={10}
                    bg="#FFFFFF"
                    borderBottom="1px solid"
                    borderColor="rgba(226, 232, 240, 0.6)"
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                >
                    <ModalHeader
                        bg="linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)"
                        py={{ base: 3, md: 4 }}
                        px={{ base: 4, md: 6 }}
                        borderBottom="none"
                    >
                        <HStack spacing={3}>
                            <Icon as={PiChartBarBold} boxSize={{ base: 5, md: 6 }} color="#4F9CF9" />
                            <Text
                                id="analytics-modal-title"
                                fontSize={{ base: "lg", md: "xl" }}
                                fontWeight="bold"
                                color="#1E293B"
                            >
                                Advanced Analytics Dashboard
                            </Text>
                        </HStack>
                    </ModalHeader>

                    <ModalCloseButton
                        color="#4F9CF9"
                        _hover={{
                            bg: "blue.50",
                            transform: "scale(1.05)"
                        }}
                        _active={{
                            transform: "scale(0.95)"
                        }}
                        borderRadius="full"
                        size={{ base: "md", md: "md" }}
                        top={{ base: 3, md: 4 }}
                        right={{ base: 3, md: 4 }}
                        zIndex={20}
                        bg="rgba(255, 255, 255, 0.9)"
                        backdropFilter="blur(8px)"
                        border="1px solid rgba(79, 156, 249, 0.1)"
                        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        sx={{
                            WebkitBackdropFilter: 'blur(8px)'
                        }}
                    />
                </Box>
                
                {/* Tabs Wrapper */}
                <Tabs
                    variant="unstyled"
                    h="100%"
                    display="flex"
                    flexDirection="column"
                    flex="1"
                >
                    {/* Modern Tab Navigation */}
                    <TabList
                        bg="rgba(248, 250, 252, 0.8)"
                        backdropFilter="blur(12px)"
                        px={{ base: 4, md: 6 }}
                        py={4}
                        borderBottom="1px solid"
                        borderColor="rgba(226, 232, 240, 0.3)"
                        gap={1}
                        overflowX="auto"
                        position="sticky"
                        top="0"
                        zIndex={5}
                        flexShrink={0}
                        css={{
                            '&::-webkit-scrollbar': {
                                display: 'none'
                            },
                            scrollbarWidth: 'none'
                        }}
                    >
                        <Tab
                            fontWeight="600"
                            fontSize={{ base: "sm", md: "md" }}
                            color="#64748B"
                            bg="transparent"
                            border="1px solid transparent"
                            _selected={{
                                bg: "rgba(255, 255, 255, 0.9)",
                                color: "#1E293B",
                                borderColor: "rgba(226, 232, 240, 0.6)",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                transform: "translateY(-1px)"
                            }}
                            _hover={{
                                bg: "rgba(255, 255, 255, 0.6)",
                                color: "#374151",
                                transform: "translateY(-1px)"
                            }}
                            borderRadius="xl"
                            px={{ base: 4, md: 6 }}
                            py={{ base: 3, md: 4 }}
                            minW="fit-content"
                            whiteSpace="nowrap"
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            position="relative"
                            _before={{
                                content: '""',
                                position: "absolute",
                                bottom: "-4px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "0",
                                height: "2px",
                                bg: "#4F9CF9",
                                borderRadius: "full",
                                transition: "width 0.3s ease"
                            }}
                            sx={{
                                '&[aria-selected="true"]::before': {
                                    width: "80%"
                                }
                            }}
                        >
                            Overview
                        </Tab>
                        <Tab
                            fontWeight="600"
                            fontSize={{ base: "sm", md: "md" }}
                            color="#64748B"
                            bg="transparent"
                            border="1px solid transparent"
                            _selected={{
                                bg: "rgba(255, 255, 255, 0.9)",
                                color: "#1E293B",
                                borderColor: "rgba(226, 232, 240, 0.6)",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                transform: "translateY(-1px)"
                            }}
                            _hover={{
                                bg: "rgba(255, 255, 255, 0.6)",
                                color: "#374151",
                                transform: "translateY(-1px)"
                            }}
                            borderRadius="xl"
                            px={{ base: 4, md: 6 }}
                            py={{ base: 3, md: 4 }}
                            minW="fit-content"
                            whiteSpace="nowrap"
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            position="relative"
                            _before={{
                                content: '""',
                                position: "absolute",
                                bottom: "-4px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "0",
                                height: "2px",
                                bg: "#4F9CF9",
                                borderRadius: "full",
                                transition: "width 0.3s ease"
                            }}
                            sx={{
                                '&[aria-selected="true"]::before': {
                                    width: "80%"
                                }
                            }}
                        >
                            Performance
                        </Tab>
                        <Tab
                            fontWeight="600"
                            fontSize={{ base: "sm", md: "md" }}
                            color="#64748B"
                            bg="transparent"
                            border="1px solid transparent"
                            _selected={{
                                bg: "rgba(255, 255, 255, 0.9)",
                                color: "#1E293B",
                                borderColor: "rgba(226, 232, 240, 0.6)",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                transform: "translateY(-1px)"
                            }}
                            _hover={{
                                bg: "rgba(255, 255, 255, 0.6)",
                                color: "#374151",
                                transform: "translateY(-1px)"
                            }}
                            borderRadius="xl"
                            px={{ base: 4, md: 6 }}
                            py={{ base: 3, md: 4 }}
                            minW="fit-content"
                            whiteSpace="nowrap"
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            position="relative"
                            _before={{
                                content: '""',
                                position: "absolute",
                                bottom: "-4px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "0",
                                height: "2px",
                                bg: "#4F9CF9",
                                borderRadius: "full",
                                transition: "width 0.3s ease"
                            }}
                            sx={{
                                '&[aria-selected="true"]::before': {
                                    width: "80%"
                                }
                            }}
                        >
                            Technical Details
                        </Tab>
                    </TabList>

                    {/* Scrollable Content Area */}
                    <ModalBody
                        p={0}
                        overflow="hidden"
                        flex="1"
                        display="flex"
                        flexDirection="column"
                        minH={0}
                    >

                        <TabPanels
                            flex="1"
                            overflow="hidden"
                            h="100%"
                            minH={0}
                        >
                            {/* Overview Tab */}
                            <TabPanel
                                p={0}
                                h="100%"
                                overflow="auto"
                                css={{
                                    '&::-webkit-scrollbar': {
                                        width: '8px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f8fafc',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: '#cbd5e1',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                        background: '#94a3b8'
                                    }
                                }}
                            >
                                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                <Box p={{ base: 4, md: 6 }} pb={{ base: 12, md: 16 }}>
                                <VStack spacing={{ base: 4, md: 6, lg: 8 }} align="stretch" maxW="none" w="100%">
                                    {/* AI Meta-Voting Analysis - Simplified and User-Friendly */}
                                    {analytics.voting?.metaVoting && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                                        >
                                        <Box
                                            bg="rgba(255, 255, 255, 0.8)"
                                            backdropFilter="blur(16px)"
                                            borderRadius="2xl"
                                            p={{ base: 5, md: 6 }}
                                            border="1px solid"
                                            borderColor="rgba(59, 130, 246, 0.15)"
                                            boxShadow="0 8px 32px rgba(59, 130, 246, 0.08)"
                                            position="relative"
                                            _before={{
                                                content: '""',
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: "1px",
                                                background: "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)",
                                                borderRadius: "2xl 2xl 0 0"
                                            }}
                                        >
                                            <HStack spacing={3} mb={4}>
                                                <Icon as={PiBrainBold} boxSize={6} color="#3B82F6" />
                                                <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                    AI Quality Assessment
                                                </Text>
                                            </HStack>
                                            <VStack spacing={4} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                    <GridItem>
                                                        <Box
                                                            textAlign="center"
                                                            p={5}
                                                            bg="rgba(255, 255, 255, 0.9)"
                                                            backdropFilter="blur(8px)"
                                                            borderRadius="xl"
                                                            border="1px solid rgba(59, 130, 246, 0.08)"
                                                            boxShadow="0 2px 8px rgba(59, 130, 246, 0.05)"
                                                        >
                                                            <Text fontSize="xs" color="#64748B" mb={2} fontWeight="500">Best Response Selected</Text>
                                                            <Text fontSize="2xl" fontWeight="700" color="#3B82F6" letterSpacing="tight">
                                                                {analytics.voting.metaVoting.winner?.toUpperCase()}
                                                            </Text>
                                                        </Box>
                                                    </GridItem>
                                                    <GridItem>
                                                        <Box
                                                            textAlign="center"
                                                            p={5}
                                                            bg="rgba(255, 255, 255, 0.9)"
                                                            backdropFilter="blur(8px)"
                                                            borderRadius="xl"
                                                            border="1px solid rgba(16, 185, 129, 0.08)"
                                                            boxShadow="0 2px 8px rgba(16, 185, 129, 0.05)"
                                                        >
                                                            <Text fontSize="xs" color="#64748B" mb={2} fontWeight="500">AI Confidence</Text>
                                                            <Text fontSize="2xl" fontWeight="700" color="#10B981" letterSpacing="tight">
                                                                {(analytics.voting.metaVoting.confidence * 100).toFixed(0)}%
                                                            </Text>
                                                        </Box>
                                                    </GridItem>
                                                </Grid>
                                                {analytics.voting.metaVoting.reasoning && (
                                                    <Box
                                                        p={5}
                                                        bg="rgba(255, 255, 255, 0.9)"
                                                        backdropFilter="blur(8px)"
                                                        borderRadius="xl"
                                                        border="1px solid rgba(59, 130, 246, 0.08)"
                                                        boxShadow="0 2px 8px rgba(59, 130, 246, 0.05)"
                                                    >
                                                        <Text fontSize="sm" fontWeight="600" color="#1E293B" mb={3}>
                                                            Why This Response Was Chosen
                                                        </Text>
                                                        <Text fontSize="sm" color="#475569" lineHeight="1.7">
                                                            {analytics.voting.metaVoting.reasoning}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </Box>
                                        </motion.div>
                                    )}

                                    {/* Overall Quality & Confidence Score - Simplified */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                                    >
                                    <Box
                                        bg="rgba(255, 255, 255, 0.8)"
                                        backdropFilter="blur(16px)"
                                        borderRadius="2xl"
                                        p={{ base: 5, md: 6 }}
                                        border="1px solid"
                                        borderColor="rgba(34, 197, 94, 0.15)"
                                        boxShadow="0 8px 32px rgba(34, 197, 94, 0.08)"
                                        position="relative"
                                        _before={{
                                            content: '""',
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: "1px",
                                            background: "linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.3) 50%, transparent 100%)",
                                            borderRadius: "2xl 2xl 0 0"
                                        }}
                                    >
                                        <HStack spacing={3} mb={4}>
                                            <Icon as={PiShieldCheckBold} boxSize={6} color="#22C55E" />
                                            <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                Overall Quality Score
                                            </Text>
                                        </HStack>
                                        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={{ base: 4, md: 5 }}>
                                            <GridItem>
                                                <Box
                                                    textAlign="center"
                                                    p={{ base: 4, md: 6 }}
                                                    bg="rgba(255, 255, 255, 0.9)"
                                                    backdropFilter="blur(8px)"
                                                    borderRadius="xl"
                                                    border="1px solid rgba(34, 197, 94, 0.08)"
                                                    boxShadow="0 4px 16px rgba(34, 197, 94, 0.06)"
                                                    transition="all 0.2s ease"
                                                    _hover={{
                                                        transform: "translateY(-2px)",
                                                        boxShadow: "0 8px 24px rgba(34, 197, 94, 0.12)"
                                                    }}
                                                    minH={{ base: "120px", md: "140px" }}
                                                    display="flex"
                                                    flexDirection="column"
                                                    justifyContent="center"
                                                >
                                                    <Text fontSize={{ base: "2xs", md: "xs" }} color="#64748B" mb={{ base: 2, md: 3 }} fontWeight="500" letterSpacing="wide">RESPONSE QUALITY</Text>
                                                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" color="#22C55E" mb={{ base: 1, md: 2 }} letterSpacing="tight">
                                                        {(analytics.overallConfidence * 100).toFixed(0)}%
                                                    </Text>
                                                    <Text fontSize={{ base: "2xs", md: "xs" }} color="#94A3B8" textTransform="capitalize" fontWeight="500">
                                                        {analytics.confidenceLevel} Quality
                                                    </Text>
                                                </Box>
                                            </GridItem>
                                            <GridItem>
                                                <Box
                                                    textAlign="center"
                                                    p={6}
                                                    bg="rgba(255, 255, 255, 0.9)"
                                                    backdropFilter="blur(8px)"
                                                    borderRadius="xl"
                                                    border="1px solid rgba(139, 92, 246, 0.08)"
                                                    boxShadow="0 4px 16px rgba(139, 92, 246, 0.06)"
                                                    transition="all 0.2s ease"
                                                    _hover={{
                                                        transform: "translateY(-2px)",
                                                        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.12)"
                                                    }}
                                                >
                                                    <Text fontSize="xs" color="#64748B" mb={3} fontWeight="500" letterSpacing="wide">RESPONSE VARIETY</Text>
                                                    <Text fontSize="3xl" fontWeight="800" color="#8B5CF6" mb={2} letterSpacing="tight">
                                                        {analytics.responseVariety}
                                                    </Text>
                                                    <Text fontSize="xs" color="#94A3B8" fontWeight="500">
                                                        Diversity Level
                                                    </Text>
                                                </Box>
                                            </GridItem>
                                            <GridItem>
                                                <Box
                                                    textAlign="center"
                                                    p={6}
                                                    bg="rgba(255, 255, 255, 0.9)"
                                                    backdropFilter="blur(8px)"
                                                    borderRadius="xl"
                                                    border="1px solid rgba(245, 158, 11, 0.08)"
                                                    boxShadow="0 4px 16px rgba(245, 158, 11, 0.06)"
                                                    transition="all 0.2s ease"
                                                    _hover={{
                                                        transform: "translateY(-2px)",
                                                        boxShadow: "0 8px 24px rgba(245, 158, 11, 0.12)"
                                                    }}
                                                >
                                                    <Text fontSize="xs" color="#64748B" mb={3} fontWeight="500" letterSpacing="wide">AI SYSTEMS USED</Text>
                                                    <Text fontSize="3xl" fontWeight="800" color="#F59E0B" mb={2} letterSpacing="tight">
                                                        {analytics.aiSystemsUsed}
                                                    </Text>
                                                    <Text fontSize="xs" color="#94A3B8" fontWeight="500">
                                                        Advanced Features
                                                    </Text>
                                                </Box>
                                            </GridItem>
                                        </Grid>
                                    </Box>
                                    </motion.div>

                                    {/* Model Performance Comparison - User-Friendly */}
                                    <Box
                                        bg="linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
                                        borderRadius="xl"
                                        p={6}
                                        border="1px solid"
                                        borderColor="rgba(245, 158, 11, 0.2)"
                                        boxShadow="0 4px 12px rgba(245, 158, 11, 0.1)"
                                    >
                                        <HStack spacing={3} mb={4}>
                                            <Icon as={PiScalesBold} boxSize={6} color="#F59E0B" />
                                            <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                Model Performance Comparison
                                            </Text>
                                        </HStack>
                                        <VStack spacing={4} align="stretch">
                                            {analytics.voting?.weights && Object.entries(analytics.voting.weights).map(([model, weight]) => (
                                                <Box key={model} p={4} bg="white" borderRadius="lg" border="1px solid rgba(245, 158, 11, 0.1)">
                                                    <Flex justify="space-between" align="center" mb={2}>
                                                        <HStack spacing={2}>
                                                            <Badge colorScheme="orange" variant="solid" fontSize="xs">
                                                                {model.toUpperCase()}
                                                            </Badge>
                                                            <Text fontSize="sm" color="#64748B">
                                                                Performance Score
                                                            </Text>
                                                        </HStack>
                                                        <Text fontSize="lg" fontWeight="bold" color="#F59E0B">
                                                            {((weight as number) * 100).toFixed(0)}%
                                                        </Text>
                                                    </Flex>
                                                    <Progress
                                                        value={(weight as number) * 100}
                                                        size="lg"
                                                        borderRadius="full"
                                                        bg="rgba(245, 158, 11, 0.08)"
                                                        sx={{
                                                            '& > div': {
                                                                background: "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)",
                                                                borderRadius: "full",
                                                                boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)"
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </VStack>
                                    </Box>

                                    {/* Confidence Analysis - Enhanced with User-Friendly Insights */}
                                    <Box
                                        bg="linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)"
                                        borderRadius="xl"
                                        p={{ base: 6, md: 8, lg: 10 }}
                                        border="1px solid"
                                        borderColor="rgba(139, 92, 246, 0.2)"
                                        boxShadow="0 4px 12px rgba(139, 92, 246, 0.1)"
                                        w="100%"
                                    >
                                        <HStack spacing={3} mb={4}>
                                            <Icon as={PiShieldCheckBold} boxSize={6} color="#8B5CF6" />
                                            <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                Response Analysis
                                            </Text>
                                        </HStack>
                                        <VStack spacing={6} align="stretch">
                                            {/* Key Insights Grid */}
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                <GridItem>
                                                    <Box
                                                        bg="white"
                                                        p={{ base: 4, md: 6 }}
                                                        borderRadius="lg"
                                                        border="1px solid rgba(139, 92, 246, 0.1)"
                                                        textAlign="center"
                                                    >
                                                        <Text fontSize="xs" color="#64748B" mb={2}>Response Reliability</Text>
                                                        <Text fontSize="3xl" fontWeight="bold" color={getConfidenceColor(analytics.confidenceLevel)} mb={1}>
                                                            {(analytics.overallConfidence * 100).toFixed(0)}%
                                                        </Text>
                                                        <Badge
                                                            colorScheme={analytics.confidenceLevel === 'high' || analytics.confidenceLevel === 'very-high' ? 'green' : analytics.confidenceLevel === 'medium' ? 'yellow' : 'red'}
                                                            variant="subtle"
                                                            textTransform="capitalize"
                                                        >
                                                            {analytics.confidenceLevel.replace('-', ' ')} Confidence
                                                        </Badge>
                                                    </Box>
                                                </GridItem>
                                                <GridItem>
                                                    <Box
                                                        bg="white"
                                                        p={{ base: 4, md: 6 }}
                                                        borderRadius="lg"
                                                        border="1px solid rgba(139, 92, 246, 0.1)"
                                                        textAlign="center"
                                                    >
                                                        <Text fontSize="xs" color="#64748B" mb={2}>System Reliability</Text>
                                                        <Text fontSize="3xl" fontWeight="bold" color="#8B5CF6" mb={1}>
                                                            {analytics.overallReliability}
                                                        </Text>
                                                        <Badge colorScheme="purple" variant="subtle">
                                                            Overall Quality
                                                        </Badge>
                                                    </Box>
                                                </GridItem>
                                            </Grid>

                                            {/* Visual Progress Indicator */}
                                            <Box>
                                                <Flex justify="space-between" align="center" mb={2}>
                                                    <Text fontSize="sm" fontWeight="600" color="#1E293B">Response Quality</Text>
                                                    <Text fontSize="sm" color="#64748B">{(analytics.overallConfidence * 100).toFixed(0)}%</Text>
                                                </Flex>
                                                <Progress
                                                    value={analytics.overallConfidence * 100}
                                                    colorScheme={analytics.confidenceLevel === 'high' || analytics.confidenceLevel === 'very-high' ? 'green' : analytics.confidenceLevel === 'medium' ? 'yellow' : 'red'}
                                                    size="lg"
                                                    borderRadius="full"
                                                    bg="rgba(139, 92, 246, 0.1)"
                                                />
                                            </Box>

                                            {/* Quality Insights */}
                                            {analytics.confidenceFactors.length > 0 && (
                                                <Box p={4} bg="white" borderRadius="lg" border="1px solid rgba(139, 92, 246, 0.1)">
                                                    <Text fontSize="sm" fontWeight="600" color="#1E293B" mb={3}>
                                                        What Makes This Response High Quality
                                                    </Text>
                                                    <Wrap spacing={2}>
                                                        {analytics.confidenceFactors.map((factor: any, index: number) => (
                                                            <WrapItem key={index}>
                                                                <Badge
                                                                    colorScheme="purple"
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
                                                </Box>
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Individual Model Responses - User-Friendly */}
                                    <Box
                                        bg="linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)"
                                        borderRadius="xl"
                                        p={6}
                                        pb={8}
                                        border="1px solid"
                                        borderColor="rgba(100, 116, 139, 0.2)"
                                        boxShadow="0 4px 12px rgba(100, 116, 139, 0.1)"
                                    >
                                        <HStack spacing={3} mb={4}>
                                            <Icon as={PiChartBarBold} boxSize={6} color="#64748B" />
                                            <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                Individual AI Model Responses
                                            </Text>
                                        </HStack>
                                        <Text fontSize="sm" color="#64748B" mb={4}>
                                            See how each AI model performed and what they contributed to the final response.
                                        </Text>

                                        <Accordion allowMultiple>
                                            {analytics.roles.map((role: any, index: number) => (
                                                <AccordionItem
                                                    key={index}
                                                    border="1px solid"
                                                    borderColor="rgba(226, 232, 240, 0.4)"
                                                    borderRadius="lg"
                                                    bg="rgba(248, 250, 252, 0.5)"
                                                    mb={4}
                                                    _last={{ mb: 6 }}
                                                >
                                                    <AccordionButton
                                                        p={4}
                                                        bg="rgba(79, 156, 249, 0.03)"
                                                        _hover={{ bg: "rgba(79, 156, 249, 0.08)" }}
                                                        _expanded={{ bg: "rgba(79, 156, 249, 0.12)" }}
                                                        borderRadius="lg"
                                                        border="none"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="space-between"
                                                        w="100%"
                                                        minH="60px"
                                                    >
                                                        <Box flex="1" textAlign="left" pr={4} minW={0}>
                                                            <VStack spacing={2} align="start">
                                                                <HStack spacing={2} wrap="wrap">
                                                                    <Badge colorScheme="blue" variant="solid" fontSize="xs">
                                                                        {role.model || role.role || 'Unknown'}
                                                                    </Badge>
                                                                    <Badge
                                                                        colorScheme={role.status === 'fulfilled' ? 'green' : 'red'}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        fontSize="xs"
                                                                    >
                                                                        {role.status || 'Unknown'}
                                                                    </Badge>
                                                                </HStack>
                                                                {role.confidence && (
                                                                    <Text fontSize="xs" color="#64748B" fontWeight="500">
                                                                        {(role.confidence.score * 100).toFixed(1)}% confidence
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                        </Box>
                                                        <AccordionIcon color="#4F9CF9" boxSize={5} flexShrink={0} />
                                                    </AccordionButton>

                                                    <AccordionPanel p={4} pt={0}>
                                                        {role.content && (
                                                            <Box
                                                                p={4}
                                                                bg="white"
                                                                borderRadius="md"
                                                                border="1px solid"
                                                                borderColor="rgba(226, 232, 240, 0.3)"
                                                                mb={4}
                                                            >
                                                                <Text fontSize="xs" color="#64748B" mb={2} fontWeight="600">
                                                                    FULL RESPONSE
                                                                </Text>
                                                                <Text fontSize="sm" color="#1E293B" lineHeight="1.6" whiteSpace="pre-wrap">
                                                                    {role.content}
                                                                </Text>
                                                            </Box>
                                                        )}

                                                        {/* Additional metrics */}
                                                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                                                            {role.responseTime && (
                                                                <Box>
                                                                    <Text fontSize="xs" color="#64748B" mb={1}>Response Time</Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="#1E293B">
                                                                        {(role.responseTime / 1000).toFixed(2)}s
                                                                    </Text>
                                                                </Box>
                                                            )}
                                                            {role.confidence && (
                                                                <Box>
                                                                    <Text fontSize="xs" color="#64748B" mb={1}>Confidence Score</Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="#1E293B">
                                                                        {(role.confidence.score * 100).toFixed(1)}%
                                                                    </Text>
                                                                </Box>
                                                            )}
                                                            {role.tokens && (
                                                                <Box>
                                                                    <Text fontSize="xs" color="#64748B" mb={1}>Tokens Used</Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="#1E293B">
                                                                        {role.tokens.total || 'N/A'}
                                                                    </Text>
                                                                </Box>
                                                            )}
                                                        </Grid>
                                                    </AccordionPanel>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </Box>
                                </VStack>
                                </Box>
                </motion.div>
                            </TabPanel>

                            {/* Model Performance Tab */}
                            <TabPanel
                                p={0}
                                h="100%"
                                overflow="auto"
                                css={{
                                    '&::-webkit-scrollbar': {
                                        width: '8px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f8fafc',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: '#cbd5e1',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                        background: '#94a3b8'
                                    }
                                }}
                            >
                                <Box p={{ base: 4, md: 6 }} pb={{ base: 12, md: 16 }}>
                                <VStack spacing={{ base: 4, md: 6, lg: 8 }} align="stretch" maxW="none" w="100%">
                                    {/* Performance Overview */}
                                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={{ base: 3, md: 4 }}>
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
                                                    <Grid templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: 2, md: 4 }}>
                                                        <GridItem>
                                                            <VStack spacing={1} align="start">
                                                                <Text fontSize="xs" color="#64748B">Model</Text>
                                                                <Badge colorScheme="blue" variant="solid">
                                                                    {role.model || role.role || 'Unknown'}
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
                                </Box>
                            </TabPanel>

                            {/* Advanced Insights Tab */}
                            <TabPanel
                                p={0}
                                h="100%"
                                overflow="auto"
                                css={{
                                    '&::-webkit-scrollbar': {
                                        width: '8px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f8fafc',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: '#cbd5e1',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                        background: '#94a3b8'
                                    }
                                }}
                            >
                                <Box p={{ base: 4, md: 6 }} pb={{ base: 12, md: 16 }}>
                                <VStack spacing={{ base: 4, md: 6, lg: 8 }} align="stretch" maxW="none" w="100%">

                                    {/* Meta-Voting Analysis */}
                                    {analytics.metaVoting && (
                                        <Box
                                            bg="white"
                                            borderRadius="xl"
                                            p={6}
                                            border="1px solid"
                                            borderColor="rgba(226, 232, 240, 0.6)"
                                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        >
                                            <HStack spacing={3} mb={4}>
                                                <Icon as={PiBrainBold} boxSize={6} color="#8B5CF6" />
                                                <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                    AI Meta-Voting Analysis
                                                </Text>
                                            </HStack>
                                            <VStack spacing={4} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                    <GridItem>
                                                        <Stat
                                                            bg="rgba(139, 92, 246, 0.05)"
                                                            p={4}
                                                            borderRadius="lg"
                                                            border="1px solid rgba(139, 92, 246, 0.1)"
                                                        >
                                                            <StatLabel fontSize="xs" color="#64748B">Meta-Voting Winner</StatLabel>
                                                            <StatNumber fontSize="lg" color="#8B5CF6">
                                                                {analytics.metaVoting.winner || 'N/A'}
                                                            </StatNumber>
                                                            <StatHelpText fontSize="xs" color="#94A3B8">
                                                                AI-selected best response
                                                            </StatHelpText>
                                                        </Stat>
                                                    </GridItem>
                                                    <GridItem>
                                                        <Stat
                                                            bg="rgba(139, 92, 246, 0.05)"
                                                            p={4}
                                                            borderRadius="lg"
                                                            border="1px solid rgba(139, 92, 246, 0.1)"
                                                        >
                                                            <StatLabel fontSize="xs" color="#64748B">Meta Confidence</StatLabel>
                                                            <StatNumber fontSize="lg" color="#8B5CF6">
                                                                {((analytics.metaVoting.confidence || 0) * 100).toFixed(1)}%
                                                            </StatNumber>
                                                            <StatHelpText fontSize="xs" color="#94A3B8">
                                                                AI assessment confidence
                                                            </StatHelpText>
                                                        </Stat>
                                                    </GridItem>
                                                </Grid>
                                                {analytics.metaVoting.reasoning && (
                                                    <Box
                                                        p={4}
                                                        bg="rgba(139, 92, 246, 0.02)"
                                                        borderRadius="lg"
                                                        border="1px solid rgba(139, 92, 246, 0.1)"
                                                    >
                                                        <Text fontSize="xs" fontWeight="600" color="#64748B" mb={2}>
                                                            AI Reasoning:
                                                        </Text>
                                                        <Text fontSize="sm" color="#475569" lineHeight="1.6">
                                                            {analytics.metaVoting.reasoning}
                                                        </Text>
                                                    </Box>
                                                )}
                                                {analytics.metaVoting.ranking && (
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="600" color="#64748B" mb={2}>
                                                            Response Ranking:
                                                        </Text>
                                                        <HStack spacing={2}>
                                                            {analytics.metaVoting.ranking.map((model: string, index: number) => (
                                                                <Badge
                                                                    key={index}
                                                                    colorScheme={index === 0 ? "purple" : index === 1 ? "blue" : "gray"}
                                                                    variant="solid"
                                                                    fontSize="xs"
                                                                >
                                                                    #{index + 1} {model}
                                                                </Badge>
                                                            ))}
                                                        </HStack>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </Box>
                                    )}

                                    {/* Tie-Breaking Analysis */}
                                    {analytics.tieBreaking && analytics.tieBreaking.used && (
                                        <Box
                                            bg="white"
                                            borderRadius="xl"
                                            p={6}
                                            border="1px solid"
                                            borderColor="rgba(226, 232, 240, 0.6)"
                                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        >
                                            <HStack spacing={3} mb={4}>
                                                <Icon as={PiScalesBold} boxSize={6} color="#F59E0B" />
                                                <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                    Tie-Breaking Analysis
                                                </Text>
                                            </HStack>
                                            <VStack spacing={4} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                    <GridItem>
                                                        <Stat
                                                            bg="rgba(245, 158, 11, 0.05)"
                                                            p={4}
                                                            borderRadius="lg"
                                                            border="1px solid rgba(245, 158, 11, 0.1)"
                                                        >
                                                            <StatLabel fontSize="xs" color="#64748B">Strategy Used</StatLabel>
                                                            <StatNumber fontSize="sm" color="#F59E0B">
                                                                {analytics.tieBreaking.strategy?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                                                            </StatNumber>
                                                            <StatHelpText fontSize="xs" color="#94A3B8">
                                                                Tie resolution method
                                                            </StatHelpText>
                                                        </Stat>
                                                    </GridItem>
                                                    <GridItem>
                                                        <Stat
                                                            bg="rgba(245, 158, 11, 0.05)"
                                                            p={4}
                                                            borderRadius="lg"
                                                            border="1px solid rgba(245, 158, 11, 0.1)"
                                                        >
                                                            <StatLabel fontSize="xs" color="#64748B">Final Confidence</StatLabel>
                                                            <StatNumber fontSize="lg" color="#F59E0B">
                                                                {((analytics.tieBreaking.confidence || 0) * 100).toFixed(1)}%
                                                            </StatNumber>
                                                            <StatHelpText fontSize="xs" color="#94A3B8">
                                                                Post tie-breaking
                                                            </StatHelpText>
                                                        </Stat>
                                                    </GridItem>
                                                </Grid>
                                                {analytics.tieBreaking.reasoning && (
                                                    <Box
                                                        p={4}
                                                        bg="rgba(245, 158, 11, 0.02)"
                                                        borderRadius="lg"
                                                        border="1px solid rgba(245, 158, 11, 0.1)"
                                                    >
                                                        <Text fontSize="xs" fontWeight="600" color="#64748B" mb={2}>
                                                            Tie-Breaking Reasoning:
                                                        </Text>
                                                        <Text fontSize="sm" color="#475569" lineHeight="1.6">
                                                            {analytics.tieBreaking.reasoning}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </Box>
                                    )}



                                    {/* Abstention Analysis */}
                                    {analytics.abstentionAnalysis && (
                                        <Box
                                            bg="white"
                                            borderRadius="xl"
                                            p={6}
                                            border="1px solid"
                                            borderColor="rgba(226, 232, 240, 0.6)"
                                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        >
                                            <HStack spacing={3} mb={4}>
                                                <Icon as={PiShieldCheckBold} boxSize={6} color="#EF4444" />
                                                <Text fontSize="lg" fontWeight="bold" color="#1E293B">
                                                    Quality Control Analysis
                                                </Text>
                                            </HStack>
                                            <VStack spacing={4} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                    <GridItem>
                                                        <Stat
                                                            bg={analytics.abstentionAnalysis.triggered ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)"}
                                                            p={4}
                                                            borderRadius="lg"
                                                            border={`1px solid ${analytics.abstentionAnalysis.triggered ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)"}`}
                                                        >
                                                            <StatLabel fontSize="xs" color="#64748B">Abstention Status</StatLabel>
                                                            <StatNumber fontSize="sm" color={analytics.abstentionAnalysis.triggered ? "#EF4444" : "#10B981"}>
                                                                {analytics.abstentionAnalysis.triggered ? "TRIGGERED" : "NOT TRIGGERED"}
                                                            </StatNumber>
                                                            <StatHelpText fontSize="xs" color="#94A3B8">
                                                                Quality control check
                                                            </StatHelpText>
                                                        </Stat>
                                                    </GridItem>
                                                    <GridItem>
                                                        <Stat
                                                            bg="rgba(239, 68, 68, 0.05)"
                                                            p={4}
                                                            borderRadius="lg"
                                                            border="1px solid rgba(239, 68, 68, 0.1)"
                                                        >
                                                            <StatLabel fontSize="xs" color="#64748B">Severity Level</StatLabel>
                                                            <StatNumber fontSize="sm" color="#EF4444">
                                                                {analytics.abstentionAnalysis.severity?.toUpperCase() || 'N/A'}
                                                            </StatNumber>
                                                            <StatHelpText fontSize="xs" color="#94A3B8">
                                                                Risk assessment
                                                            </StatHelpText>
                                                        </Stat>
                                                    </GridItem>
                                                </Grid>
                                                {analytics.abstentionAnalysis.reasons && analytics.abstentionAnalysis.reasons.length > 0 && (
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="600" color="#64748B" mb={2}>
                                                            Abstention Reasons:
                                                        </Text>
                                                        <Wrap spacing={2}>
                                                            {analytics.abstentionAnalysis.reasons.map((reason: string, index: number) => (
                                                                <WrapItem key={index}>
                                                                    <Badge colorScheme="red" variant="subtle" fontSize="xs">
                                                                        {reason.replace(/_/g, ' ').toUpperCase()}
                                                                    </Badge>
                                                                </WrapItem>
                                                            ))}
                                                        </Wrap>
                                                    </Box>
                                                )}
                                                {analytics.abstentionAnalysis.recommendedStrategy && (
                                                    <Box
                                                        p={4}
                                                        bg="rgba(239, 68, 68, 0.02)"
                                                        borderRadius="lg"
                                                        border="1px solid rgba(239, 68, 68, 0.1)"
                                                    >
                                                        <Text fontSize="xs" fontWeight="600" color="#64748B" mb={2}>
                                                            Recommended Strategy:
                                                        </Text>
                                                        <Text fontSize="sm" color="#475569" lineHeight="1.6">
                                                            {analytics.abstentionAnalysis.recommendedStrategy.replace(/_/g, ' ').toUpperCase()}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </Box>
                                    )}

                                </VStack>
                                </Box>
                            </TabPanel>


                        </TabPanels>
                    </ModalBody>
                </Tabs>
            </ModalContent>
        </Modal>
    );
}
