/**
 * Performance Monitor Component
 * 
 * Real-time performance monitoring and optimization suggestions
 * for the NeuraStack frontend application.
 */

import {
    Box,
    Button,
    Circle,
    Collapse,
    Grid,
    HStack,
    Icon,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    VStack,
    useColorModeValue,
    useDisclosure
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';
import {
    PiChartBarBold,
    PiClockBold,
    PiEyeBold,
    PiGaugeBold,
    PiLightningBold,
    PiMemoryBold,
    PiTrendUpBold,
    PiWarningBold
} from "react-icons/pi";

const MotionBox = motion(Box);

interface PerformanceMetrics {
    fps: number;
    memoryUsage: number;
    loadTime: number;
    renderTime: number;
    apiResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
    userInteractions: number;
}

interface PerformanceAlert {
    type: 'warning' | 'error' | 'info';
    message: string;
    suggestion: string;
    timestamp: number;
}

export const PerformanceMonitor = ({ 
    enabled = false,
    position = 'bottom-right' 
}: { 
    enabled?: boolean;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        fps: 60,
        memoryUsage: 0,
        loadTime: 0,
        renderTime: 0,
        apiResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        userInteractions: 0
    });

    const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
    const { isOpen, onToggle } = useDisclosure();
    
    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Performance monitoring
    useEffect(() => {
        if (!enabled) return;

        let frameCount = 0;
        let lastTime = performance.now();
        let animationId: number;

        // FPS monitoring
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                setMetrics(prev => ({ ...prev, fps }));
                
                // Alert for low FPS
                if (fps < 30) {
                    addAlert('warning', `Low FPS detected: ${fps}`, 'Consider reducing animations or optimizing renders');
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            animationId = requestAnimationFrame(measureFPS);
        };

        // Memory monitoring
        const measureMemory = () => {
            if ('memory' in performance) {
                const memory = (performance as any).memory;
                const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                setMetrics(prev => ({ ...prev, memoryUsage }));
                
                // Alert for high memory usage
                if (memoryUsage > 100) {
                    addAlert('warning', `High memory usage: ${memoryUsage}MB`, 'Consider clearing cache or reducing data retention');
                }
            }
        };

        // Start monitoring
        measureFPS();
        const memoryInterval = setInterval(measureMemory, 5000);

        // Measure initial load time
        if (document.readyState === 'complete') {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            setMetrics(prev => ({ ...prev, loadTime }));
        }

        return () => {
            cancelAnimationFrame(animationId);
            clearInterval(memoryInterval);
        };
    }, [enabled]);

    const addAlert = (type: PerformanceAlert['type'], message: string, suggestion: string) => {
        const alert: PerformanceAlert = {
            type,
            message,
            suggestion,
            timestamp: Date.now()
        };
        
        setAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts
    };

    // Performance score calculation
    const calculateScore = () => {
        let score = 100;
        
        if (metrics.fps < 60) score -= (60 - metrics.fps) * 2;
        if (metrics.memoryUsage > 50) score -= (metrics.memoryUsage - 50) * 0.5;
        if (metrics.loadTime > 3000) score -= (metrics.loadTime - 3000) / 100;
        if (metrics.cacheHitRate < 0.8) score -= (0.8 - metrics.cacheHitRate) * 50;
        
        return Math.max(0, Math.round(score));
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'green.500';
        if (score >= 70) return 'yellow.500';
        return 'red.500';
    };

    const getPositionStyles = () => {
        const base = { position: 'fixed' as const, zIndex: 9999 };
        switch (position) {
            case 'bottom-right': return { ...base, bottom: 4, right: 4 };
            case 'bottom-left': return { ...base, bottom: 4, left: 4 };
            case 'top-right': return { ...base, top: 4, right: 4 };
            case 'top-left': return { ...base, top: 4, left: 4 };
            default: return { ...base, bottom: 4, right: 4 };
        }
    };

    if (!enabled) return null;

    const score = calculateScore();

    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={getPositionStyles()}
        >
            <VStack spacing={2} align="stretch">
                {/* Compact Performance Indicator */}
                <MotionBox
                    bg={bg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    p={3}
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                    cursor="pointer"
                    onClick={onToggle}
                    _hover={{ transform: "translateY(-2px)" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <HStack spacing={3}>
                        <Circle size="32px" bg={getScoreColor(score)} color="white">
                            <Icon as={PiGaugeBold} boxSize={4} />
                        </Circle>
                        <VStack spacing={0} align="start">
                            <Text fontSize="sm" fontWeight="600" color="gray.800">
                                Performance
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                Score: {score}/100
                            </Text>
                        </VStack>
                        <Icon 
                            as={PiEyeBold} 
                            color="gray.400" 
                            transform={isOpen ? "rotate(180deg)" : "none"}
                            transition="transform 0.2s"
                        />
                    </HStack>
                </MotionBox>

                {/* Detailed Metrics Panel */}
                <Collapse in={isOpen}>
                    <MotionBox
                        bg={bg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="xl"
                        p={4}
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                        w="300px"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <VStack spacing={4} align="stretch">
                            {/* Performance Score */}
                            <Box textAlign="center">
                                <Text fontSize="lg" fontWeight="600" color="gray.800" mb={2}>
                                    Performance Score
                                </Text>
                                <Circle size="60px" bg={getScoreColor(score)} color="white" mx="auto">
                                    <Text fontSize="xl" fontWeight="700">
                                        {score}
                                    </Text>
                                </Circle>
                            </Box>

                            {/* Key Metrics */}
                            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                <Stat size="sm">
                                    <StatLabel fontSize="xs">FPS</StatLabel>
                                    <StatNumber fontSize="md">{metrics.fps}</StatNumber>
                                    <StatHelpText fontSize="xs">
                                        <Icon as={PiClockBold} mr={1} />
                                        Real-time
                                    </StatHelpText>
                                </Stat>
                                
                                <Stat size="sm">
                                    <StatLabel fontSize="xs">Memory</StatLabel>
                                    <StatNumber fontSize="md">{metrics.memoryUsage}MB</StatNumber>
                                    <StatHelpText fontSize="xs">
                                        <Icon as={PiMemoryBold} mr={1} />
                                        JS Heap
                                    </StatHelpText>
                                </Stat>
                                
                                <Stat size="sm">
                                    <StatLabel fontSize="xs">Load Time</StatLabel>
                                    <StatNumber fontSize="md">{(metrics.loadTime / 1000).toFixed(1)}s</StatNumber>
                                    <StatHelpText fontSize="xs">
                                        <Icon as={PiLightningBold} mr={1} />
                                        Initial
                                    </StatHelpText>
                                </Stat>
                                
                                <Stat size="sm">
                                    <StatLabel fontSize="xs">Cache Hit</StatLabel>
                                    <StatNumber fontSize="md">{(metrics.cacheHitRate * 100).toFixed(0)}%</StatNumber>
                                    <StatHelpText fontSize="xs">
                                        <Icon as={PiTrendUpBold} mr={1} />
                                        Efficiency
                                    </StatHelpText>
                                </Stat>
                            </Grid>

                            {/* Performance Alerts */}
                            {alerts.length > 0 && (
                                <VStack spacing={2} align="stretch">
                                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                                        Recent Alerts
                                    </Text>
                                    {alerts.slice(0, 3).map((alert, index) => (
                                        <Box
                                            key={index}
                                            p={2}
                                            bg={alert.type === 'error' ? 'red.50' : 'yellow.50'}
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor={alert.type === 'error' ? 'red.200' : 'yellow.200'}
                                        >
                                            <HStack spacing={2}>
                                                <Icon 
                                                    as={PiWarningBold} 
                                                    color={alert.type === 'error' ? 'red.500' : 'yellow.500'}
                                                    boxSize={3}
                                                />
                                                <VStack spacing={0} align="start" flex={1}>
                                                    <Text fontSize="xs" fontWeight="500">
                                                        {alert.message}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.600">
                                                        {alert.suggestion}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            )}

                            {/* Quick Actions */}
                            <HStack spacing={2}>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    leftIcon={<PiMemoryBold />}
                                    onClick={() => {
                                        // Trigger garbage collection if available
                                        if ('gc' in window) {
                                            (window as any).gc();
                                            addAlert('info', 'Memory cleanup triggered', 'Garbage collection completed');
                                        }
                                    }}
                                >
                                    Clear Memory
                                </Button>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    leftIcon={<PiChartBarBold />}
                                    onClick={() => {
                                        // Reset metrics
                                        setMetrics({
                                            fps: 60,
                                            memoryUsage: 0,
                                            loadTime: 0,
                                            renderTime: 0,
                                            apiResponseTime: 0,
                                            cacheHitRate: 0,
                                            errorRate: 0,
                                            userInteractions: 0
                                        });
                                        setAlerts([]);
                                    }}
                                >
                                    Reset
                                </Button>
                            </HStack>
                        </VStack>
                    </MotionBox>
                </Collapse>
            </VStack>
        </MotionBox>
    );
};
