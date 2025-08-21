/**
 * Meta-Voting Intelligence Dashboard
 * 
 * Revolutionary visualization of AI ensemble decision-making process.
 * Showcases sophisticated voting algorithms, diversity analysis, and
 * real-time ensemble intelligence with innovative data utilization.
 */

import {
    Badge,
    Box,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Progress,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack,
    useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useMemo } from 'react';
import {
    PiBrainBold,
    PiChartBarBold,
    PiGaugeBold,
    PiNetworkBold,
    PiScalesBold,
    PiShieldCheckBold,
    PiStarBold,
    PiTrendUpBold
} from "react-icons/pi";

const MotionBox = motion(Box);
// const MotionFlex = motion(Flex); // Unused for now

interface MetaVotingIntelligenceDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    votingData: any; // Full voting data from API response
    rolesData: any[]; // Individual model responses
    synthesisData: any; // Synthesis information
}

// Animated confidence indicator (unused for now)
/*
const ConfidenceIndicator = ({ confidence, label }: { confidence: number; label: string }) => {
    const color = confidence > 0.8 ? 'green' : confidence > 0.6 ? 'blue' : confidence > 0.4 ? 'yellow' : 'red';

    return (
        <VStack spacing={2}>
            <Circle size="60px" bg={`${color}.50`} border={`2px solid`} borderColor={`${color}.200`}>
                <Text fontSize="sm" fontWeight="700" color={`${color}.700`}>
                    {Math.round(confidence * 100)}%
                </Text>
            </Circle>
            <Text fontSize="xs" color="gray.600" textAlign="center" maxW="80px">
                {label}
            </Text>
        </VStack>
    );
};
*/

// Real-time voting visualization
const VotingVisualization = ({ voting }: { voting: any }) => {
    const weights = voting?.weights || {};
    const winner = voting?.winner;
    const confidence = voting?.confidence || 0;

    return (
        <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align="center">
                <HStack spacing={2}>
                    <Icon as={PiScalesBold} color="purple.500" boxSize={5} />
                    <Text fontSize="lg" fontWeight="600" color="gray.800">
                        Ensemble Voting Results
                    </Text>
                </HStack>
                <Badge colorScheme="purple" variant="solid" px={3} py={1}>
                    {Math.round(confidence * 100)}% Consensus
                </Badge>
            </HStack>

            <SimpleGrid columns={3} spacing={4}>
                {Object.entries(weights).map(([model, weight]: [string, any]) => (
                    <MotionBox
                        key={model}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        p={4}
                        bg={model === winner ? "purple.50" : "gray.50"}
                        borderRadius="lg"
                        border="2px solid"
                        borderColor={model === winner ? "purple.200" : "gray.200"}
                        position="relative"
                    >
                        {model === winner && (
                            <Icon
                                as={PiStarBold}
                                position="absolute"
                                top={2}
                                right={2}
                                color="purple.500"
                                boxSize={4}
                            />
                        )}
                        <VStack spacing={2}>
                            <Text fontSize="sm" fontWeight="600" color="gray.700" textTransform="capitalize">
                                {model}
                            </Text>
                            <Progress
                                value={weight * 100}
                                colorScheme={model === winner ? "purple" : "gray"}
                                size="lg"
                                borderRadius="full"
                                w="full"
                            />
                            <Text fontSize="xs" color="gray.600">
                                {Math.round(weight * 100)}% weight
                            </Text>
                        </VStack>
                    </MotionBox>
                ))}
            </SimpleGrid>
        </VStack>
    );
};

// Diversity analysis visualization
const DiversityAnalysis = ({ diversityData }: { diversityData: any }) => {
    const overallDiversity = diversityData?.overallDiversity || 0;
    const diversityWeights = diversityData?.diversityWeights || {};

    return (
        <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
                <Icon as={PiNetworkBold} color="blue.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="600" color="gray.800">
                    Response Diversity Analysis
                </Text>
            </HStack>

            <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                <VStack spacing={3}>
                    <HStack justify="space-between" w="full">
                        <Text fontSize="sm" fontWeight="600" color="blue.700">
                            Overall Diversity Score
                        </Text>
                        <Badge colorScheme="blue" variant="solid">
                            {Math.round(overallDiversity * 100)}%
                        </Badge>
                    </HStack>
                    <Progress
                        value={overallDiversity * 100}
                        colorScheme="blue"
                        size="lg"
                        borderRadius="full"
                        w="full"
                    />
                    <Text fontSize="xs" color="blue.600" textAlign="center">
                        Higher diversity indicates more varied perspectives from AI models
                    </Text>
                </VStack>
            </Box>

            <SimpleGrid columns={3} spacing={3}>
                {Object.entries(diversityWeights).map(([model, weight]: [string, any]) => (
                    <Box key={model} p={3} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                        <VStack spacing={2}>
                            <Text fontSize="xs" fontWeight="600" color="gray.700" textTransform="capitalize">
                                {model}
                            </Text>
                            <Text fontSize="lg" fontWeight="700" color="blue.600">
                                {weight?.toFixed(2)}x
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                Diversity Factor
                            </Text>
                        </VStack>
                    </Box>
                ))}
            </SimpleGrid>
        </VStack>
    );
};

// Meta-voting intelligence component
const MetaVotingIntelligence = ({ metaVoting }: { metaVoting: any }) => {
    if (!metaVoting?.used) return null;

    return (
        <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
                <Icon as={PiBrainBold} color="green.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="600" color="gray.800">
                    AI Meta-Voting Intelligence
                </Text>
            </HStack>

            <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="600" color="green.700">
                            AI-Selected Winner
                        </Text>
                        <Badge colorScheme="green" variant="solid">
                            {Math.round(metaVoting.confidence * 100)}% confidence
                        </Badge>
                    </HStack>
                    <Text fontSize="lg" fontWeight="700" color="green.800" textTransform="capitalize">
                        {metaVoting.winner}
                    </Text>
                    <Text fontSize="sm" color="green.600" lineHeight="1.4">
                        {metaVoting.reasoning}
                    </Text>
                </VStack>
            </Box>

            {metaVoting.ranking && (
                <Box p={3} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                        Quality Ranking
                    </Text>
                    <HStack spacing={2}>
                        {metaVoting.ranking.map((model: string, index: number) => (
                            <Badge
                                key={model}
                                colorScheme={index === 0 ? "green" : index === 1 ? "blue" : "gray"}
                                variant="solid"
                            >
                                #{index + 1} {model}
                            </Badge>
                        ))}
                    </HStack>
                </Box>
            )}
        </VStack>
    );
};

// Quality metrics dashboard
const QualityMetrics = ({ abstention }: { abstention: any }) => {
    const qualityMetrics = abstention?.qualityMetrics || {};
    
    const metrics = [
        { label: "Overall Quality", value: qualityMetrics.overallQuality, icon: PiGaugeBold, color: "purple" },
        { label: "Success Rate", value: qualityMetrics.successRate, icon: PiShieldCheckBold, color: "green" },
        { label: "Avg Confidence", value: qualityMetrics.avgConfidence, icon: PiTrendUpBold, color: "blue" },
        { label: "Consensus Strength", value: qualityMetrics.consensusStrength, icon: PiScalesBold, color: "orange" }
    ];

    return (
        <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
                <Icon as={PiChartBarBold} color="orange.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="600" color="gray.800">
                    Quality Assessment
                </Text>
            </HStack>

            <SimpleGrid columns={2} spacing={4}>
                {metrics.map((metric) => (
                    <Stat key={metric.label} p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
                        <HStack spacing={3}>
                            <Icon as={metric.icon} color={`${metric.color}.500`} boxSize={5} />
                            <VStack spacing={1} align="start">
                                <StatLabel fontSize="xs" color="gray.600">
                                    {metric.label}
                                </StatLabel>
                                <StatNumber fontSize="lg" color={`${metric.color}.600`}>
                                    {typeof metric.value === 'number' ? 
                                        `${Math.round(metric.value * 100)}%` : 
                                        'N/A'
                                    }
                                </StatNumber>
                            </VStack>
                        </HStack>
                    </Stat>
                ))}
            </SimpleGrid>

            <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="xs" color="gray.600" textAlign="center">
                    Quality metrics are calculated in real-time based on response analysis,
                    model performance, and ensemble consensus strength.
                </Text>
            </Box>
        </VStack>
    );
};

export function MetaVotingIntelligenceDashboard({
    isOpen,
    onClose,
    votingData
}: MetaVotingIntelligenceDashboardProps) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const processedData = useMemo(() => {
        if (!votingData) return null;

        return {
            voting: votingData,
            metaVoting: votingData.metaVoting,
            diversityAnalysis: votingData.diversityAnalysis,
            abstention: votingData.abstention,
            analytics: votingData.analytics
        };
    }, [votingData]);

    if (!processedData) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent
                bg={bgColor}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                boxShadow="xl"
                maxH="90vh"
            >
                <ModalHeader>
                    <HStack spacing={3}>
                        <Icon as={PiBrainBold} color="purple.500" boxSize={6} />
                        <Text fontSize="xl" fontWeight="700" color="gray.800">
                            Meta-Voting Intelligence Dashboard
                        </Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                
                <ModalBody pb={6}>
                    <Tabs variant="soft-rounded" colorScheme="purple">
                        <TabList mb={6}>
                            <Tab>Voting Results</Tab>
                            <Tab>Diversity Analysis</Tab>
                            <Tab>AI Intelligence</Tab>
                            <Tab>Quality Metrics</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <VotingVisualization voting={processedData.voting} />
                            </TabPanel>
                            
                            <TabPanel>
                                <DiversityAnalysis diversityData={processedData.diversityAnalysis} />
                            </TabPanel>
                            
                            <TabPanel>
                                <MetaVotingIntelligence metaVoting={processedData.metaVoting} />
                            </TabPanel>
                            
                            <TabPanel>
                                <QualityMetrics abstention={processedData.abstention} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
