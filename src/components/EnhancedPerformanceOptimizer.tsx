/**
 * Enhanced Performance Optimizer Component
 * 
 * Advanced performance monitoring and optimization for the NeuraStack frontend.
 * Implements intelligent caching, predictive preloading, and performance analytics
 * to achieve <1s Time to Interactive target.
 */

import { Badge, HStack, Icon, Progress, Text, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PiGaugeBold } from 'react-icons/pi';

interface PerformanceMetrics {
    timeToInteractive: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    bundleSize: number;
    cacheHitRate: number;
    apiResponseTime: number;
}

interface OptimizationStrategy {
    name: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    implemented: boolean;
    estimatedImprovement: number; // in milliseconds
}

export const usePerformanceOptimizer = () => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        timeToInteractive: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        bundleSize: 0,
        cacheHitRate: 0,
        apiResponseTime: 0
    });

    const [optimizations] = useState<OptimizationStrategy[]>([
        {
            name: 'Intelligent Response Caching',
            description: 'Cache AI responses with semantic similarity matching',
            impact: 'high',
            implemented: false,
            estimatedImprovement: 800
        },
        {
            name: 'Predictive Model Preloading',
            description: 'Preload likely next models based on conversation context',
            impact: 'medium',
            implemented: false,
            estimatedImprovement: 300
        },
        {
            name: 'Advanced Bundle Splitting',
            description: 'Split analytics components for lazy loading',
            impact: 'high',
            implemented: false,
            estimatedImprovement: 400
        },
        {
            name: 'Service Worker Optimization',
            description: 'Implement advanced caching strategies',
            impact: 'medium',
            implemented: false,
            estimatedImprovement: 200
        }
    ]);

    // Measure Core Web Vitals
    const measurePerformance = useCallback(() => {
        if (typeof window === 'undefined') return;

        // Time to Interactive approximation
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationTiming) {
            const tti = navigationTiming.domInteractive - navigationTiming.fetchStart;
            const fcp = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
            
            setMetrics(prev => ({
                ...prev,
                timeToInteractive: tti,
                firstContentfulPaint: fcp
            }));
        }

        // Measure bundle size (approximation)
        const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const jsSize = resourceEntries
            .filter(entry => entry.name.includes('.js'))
            .reduce((total, entry) => total + (entry.transferSize || 0), 0);
        
        setMetrics(prev => ({
            ...prev,
            bundleSize: jsSize / 1024 // Convert to KB
        }));
    }, []);

    // Implement intelligent caching
    const implementResponseCache = useCallback(() => {
        const CACHE_KEY = 'neurastack-response-cache';
        const MAX_CACHE_SIZE = 50;
        const SIMILARITY_THRESHOLD = 0.8;

        const cache = {
            get: (prompt: string) => {
                try {
                    const cached = localStorage.getItem(CACHE_KEY);
                    if (!cached) return null;
                    
                    const cacheData = JSON.parse(cached);
                    const now = Date.now();
                    
                    // Find similar prompts using simple similarity
                    for (const entry of cacheData.entries || []) {
                        if (now - entry.timestamp > 24 * 60 * 60 * 1000) continue; // 24h expiry
                        
                        const similarity = calculateSimilarity(prompt, entry.prompt);
                        if (similarity > SIMILARITY_THRESHOLD) {
                            return entry.response;
                        }
                    }
                    return null;
                } catch {
                    return null;
                }
            },
            
            set: (prompt: string, response: any) => {
                try {
                    const cached = localStorage.getItem(CACHE_KEY);
                    const cacheData = cached ? JSON.parse(cached) : { entries: [] };
                    
                    // Add new entry
                    cacheData.entries.unshift({
                        prompt,
                        response,
                        timestamp: Date.now()
                    });
                    
                    // Limit cache size
                    if (cacheData.entries.length > MAX_CACHE_SIZE) {
                        cacheData.entries = cacheData.entries.slice(0, MAX_CACHE_SIZE);
                    }
                    
                    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                } catch {
                    // Silently fail if storage is full
                }
            }
        };

        return cache;
    }, []);

    // Simple text similarity calculation
    const calculateSimilarity = (text1: string, text2: string): number => {
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        
        return intersection.length / union.length;
    };

    // Predictive preloading based on conversation context
    const implementPredictivePreloading = useCallback(() => {
        const preloadStrategies = {
            // Preload analytics components when user shows interest
            preloadAnalytics: () => {
                import('../components/LazyAnalyticsComponents');
            },
            
            // Preload comparison modal for multi-model responses
            preloadComparison: () => {
                import('../components/ResponseComparisonModal');
            },
            
            // Preload enhanced features based on usage patterns
            preloadEnhanced: () => {
                import('../components/EnhancedAnalyticsModal');
            }
        };

        return preloadStrategies;
    }, []);

    useEffect(() => {
        measurePerformance();
        
        // Set up performance observer for real-time metrics
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        setMetrics(prev => ({
                            ...prev,
                            largestContentfulPaint: entry.startTime
                        }));
                    }
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            
            return () => observer.disconnect();
        }
    }, [measurePerformance]);

    const performanceScore = useMemo(() => {
        const { timeToInteractive, firstContentfulPaint, largestContentfulPaint } = metrics;
        
        let score = 100;
        
        // TTI scoring (target: <1000ms)
        if (timeToInteractive > 1000) {
            score -= Math.min(50, (timeToInteractive - 1000) / 100);
        }
        
        // FCP scoring (target: <1800ms)
        if (firstContentfulPaint > 1800) {
            score -= Math.min(25, (firstContentfulPaint - 1800) / 100);
        }
        
        // LCP scoring (target: <2500ms)
        if (largestContentfulPaint > 2500) {
            score -= Math.min(25, (largestContentfulPaint - 2500) / 100);
        }
        
        return Math.max(0, Math.round(score));
    }, [metrics]);

    return {
        metrics,
        optimizations,
        performanceScore,
        implementResponseCache,
        implementPredictivePreloading,
        measurePerformance
    };
};

// Performance Dashboard Component
export const PerformanceDashboard = ({ compact = false }: { compact?: boolean }) => {
    const { metrics, performanceScore, optimizations } = usePerformanceOptimizer();
    
    const getScoreColor = (score: number) => {
        if (score >= 90) return 'green.500';
        if (score >= 70) return 'yellow.500';
        return 'red.500';
    };

    if (compact) {
        return (
            <HStack spacing={3} p={3} bg="gray.50" borderRadius="lg">
                <Icon as={PiGaugeBold} color={getScoreColor(performanceScore)} boxSize={5} />
                <VStack spacing={0} align="start">
                    <Text fontSize="sm" fontWeight="600">Performance Score</Text>
                    <Text fontSize="xs" color="gray.600">{performanceScore}/100</Text>
                </VStack>
                <Badge colorScheme={performanceScore >= 90 ? 'green' : 'yellow'}>
                    TTI: {metrics.timeToInteractive.toFixed(0)}ms
                </Badge>
            </HStack>
        );
    }

    return (
        <VStack spacing={4} align="stretch" p={4} bg="white" borderRadius="lg" boxShadow="sm">
            <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="600">Performance Analytics</Text>
                <Badge colorScheme={performanceScore >= 90 ? 'green' : 'yellow'} fontSize="sm">
                    Score: {performanceScore}/100
                </Badge>
            </HStack>
            
            <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                    <Text fontSize="sm">Time to Interactive</Text>
                    <Text fontSize="sm" fontWeight="600" color={metrics.timeToInteractive < 1000 ? 'green.600' : 'red.600'}>
                        {metrics.timeToInteractive.toFixed(0)}ms
                    </Text>
                </HStack>
                <Progress 
                    value={Math.min(100, (1000 / Math.max(metrics.timeToInteractive, 1)) * 100)} 
                    colorScheme={metrics.timeToInteractive < 1000 ? 'green' : 'red'}
                    size="sm"
                />
            </VStack>
            
            <Text fontSize="sm" fontWeight="600" color="gray.700">Optimization Opportunities</Text>
            <VStack spacing={2} align="stretch">
                {optimizations.slice(0, 3).map((opt, index) => (
                    <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <VStack spacing={0} align="start" flex={1}>
                            <Text fontSize="xs" fontWeight="600">{opt.name}</Text>
                            <Text fontSize="xs" color="gray.600">{opt.description}</Text>
                        </VStack>
                        <Badge colorScheme={opt.impact === 'high' ? 'red' : 'yellow'} size="sm">
                            -{opt.estimatedImprovement}ms
                        </Badge>
                    </HStack>
                ))}
            </VStack>
        </VStack>
    );
};
