/**
 * Enhanced Mobile Experience Component
 * 
 * Advanced mobile optimizations including pull-to-refresh, swipe gestures,
 * intelligent keyboard handling, and mobile-specific UI enhancements for
 * the NeuraStack chat interface.
 */

import { Box, Icon, Text, useToast, VStack } from '@chakra-ui/react';
import type { PanInfo } from 'framer-motion';
import { motion, useAnimation } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PiArrowClockwiseBold, PiArrowLeftBold, PiArrowRightBold } from 'react-icons/pi';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

const MotionBox = motion(Box);

interface EnhancedMobileExperienceProps {
    children: React.ReactNode;
    onRefresh?: () => Promise<void>;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    enablePullToRefresh?: boolean;
    enableSwipeGestures?: boolean;
}

export const EnhancedMobileExperience = ({
    children,
    onRefresh,
    onSwipeLeft,
    onSwipeRight,
    enablePullToRefresh = true,
    enableSwipeGestures = true
}: EnhancedMobileExperienceProps) => {
    const { isMobile, triggerHaptic } = useMobileOptimization();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const controls = useAnimation();
    const toast = useToast();
    
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const startX = useRef(0);

    // Pull-to-refresh implementation
    const handlePanStart = useCallback((_event: any, info: PanInfo) => {
        if (!isMobile || !enablePullToRefresh) return;
        
        startY.current = info.point.y;
        startX.current = info.point.x;
    }, [isMobile, enablePullToRefresh]);

    const handlePanMove = useCallback((_event: any, info: PanInfo) => {
        if (!isMobile || !enablePullToRefresh || isRefreshing) return;
        
        const deltaY = info.point.y - startY.current;
        const deltaX = Math.abs(info.point.x - startX.current);
        
        // Only trigger pull-to-refresh if scrolled to top and pulling down
        const isAtTop = containerRef.current?.scrollTop === 0;
        const isPullingDown = deltaY > 0;
        const isVerticalGesture = deltaY > deltaX;
        
        if (isAtTop && isPullingDown && isVerticalGesture) {
            const distance = Math.min(deltaY * 0.5, 100); // Damping effect
            setPullDistance(distance);
            
            if (distance > 60) {
                triggerHaptic('medium');
            }
        }
    }, [isMobile, enablePullToRefresh, isRefreshing, triggerHaptic]);

    const handlePanEnd = useCallback(async (_event: any, info: PanInfo) => {
        if (!isMobile || !enablePullToRefresh || isRefreshing) return;
        
        const deltaY = info.point.y - startY.current;
        const deltaX = info.point.x - startX.current;
        // const _velocity = info.velocity.y; // Unused for now
        
        // Determine gesture type
        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100;
        const isPullToRefresh = deltaY > 60 && Math.abs(deltaX) < 50;
        
        if (isHorizontalSwipe && enableSwipeGestures) {
            // Handle horizontal swipes
            if (deltaX > 0 && onSwipeRight) {
                triggerHaptic('swipe');
                onSwipeRight();
                toast({
                    title: "Swiped Right",
                    description: "Previous conversation",
                    status: "info",
                    duration: 1000,
                    isClosable: false
                });
            } else if (deltaX < 0 && onSwipeLeft) {
                triggerHaptic('swipe');
                onSwipeLeft();
                toast({
                    title: "Swiped Left",
                    description: "Next conversation",
                    status: "info",
                    duration: 1000,
                    isClosable: false
                });
            }
        } else if (isPullToRefresh && onRefresh) {
            // Handle pull-to-refresh
            setIsRefreshing(true);
            triggerHaptic('success');
            
            try {
                await onRefresh();
                toast({
                    title: "Refreshed",
                    description: "Chat updated successfully",
                    status: "success",
                    duration: 2000,
                    isClosable: true
                });
            } catch (error) {
                toast({
                    title: "Refresh Failed",
                    description: "Please try again",
                    status: "error",
                    duration: 3000,
                    isClosable: true
                });
            } finally {
                setIsRefreshing(false);
            }
        }
        
        // Reset pull distance
        setPullDistance(0);
        controls.start({ y: 0 });
    }, [isMobile, enablePullToRefresh, enableSwipeGestures, isRefreshing, onRefresh, onSwipeLeft, onSwipeRight, triggerHaptic, toast, controls]);

    // Enhanced keyboard handling for mobile
    useEffect(() => {
        if (!isMobile) return;

        const handleVisualViewportChange = () => {
            if (window.visualViewport) {
                const viewportHeight = window.visualViewport.height;
                const windowHeight = window.innerHeight;
                const keyboardHeight = windowHeight - viewportHeight;
                
                // Adjust layout when keyboard appears
                if (keyboardHeight > 150) {
                    document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
                    document.documentElement.style.setProperty('--keyboard-visible', '1');
                } else {
                    document.documentElement.style.setProperty('--keyboard-height', '0px');
                    document.documentElement.style.setProperty('--keyboard-visible', '0');
                }
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleVisualViewportChange);
            return () => window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
        }
    }, [isMobile]);

    // Render pull-to-refresh indicator
    const renderPullToRefreshIndicator = () => {
        if (!isMobile || !enablePullToRefresh) return null;
        
        const progress = Math.min(pullDistance / 60, 1);
        const isReady = pullDistance > 60;
        
        return (
            <MotionBox
                position="absolute"
                top={0}
                left="50%"
                transform="translateX(-50%)"
                zIndex={10}
                initial={{ opacity: 0, y: -50 }}
                animate={{ 
                    opacity: pullDistance > 10 ? 1 : 0,
                    y: pullDistance > 10 ? pullDistance - 50 : -50
                }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
                <VStack
                    spacing={2}
                    p={3}
                    bg="white"
                    borderRadius="full"
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
                    border="2px solid"
                    borderColor={isReady ? "green.400" : "gray.300"}
                >
                    <Icon
                        as={PiArrowClockwiseBold}
                        boxSize={5}
                        color={isReady ? "green.500" : "gray.500"}
                        style={{
                            transform: `rotate(${progress * 360}deg)`,
                            transition: 'transform 0.2s ease'
                        }}
                    />
                    <Text fontSize="xs" color={isReady ? "green.600" : "gray.600"} fontWeight="600">
                        {isRefreshing ? "Refreshing..." : isReady ? "Release to refresh" : "Pull to refresh"}
                    </Text>
                </VStack>
            </MotionBox>
        );
    };

    // Render swipe indicators
    const renderSwipeIndicators = () => {
        if (!isMobile || !enableSwipeGestures) return null;
        
        return (
            <>
                {/* Left swipe indicator */}
                <MotionBox
                    position="fixed"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={5}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 0.3, x: 0 }}
                    transition={{ delay: 2, duration: 0.5 }}
                >
                    <VStack spacing={1} align="center">
                        <Icon as={PiArrowRightBold} boxSize={6} color="gray.400" />
                        <Text fontSize="xs" color="gray.400">Swipe</Text>
                    </VStack>
                </MotionBox>
                
                {/* Right swipe indicator */}
                <MotionBox
                    position="fixed"
                    right={4}
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={5}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 0.3, x: 0 }}
                    transition={{ delay: 2, duration: 0.5 }}
                >
                    <VStack spacing={1} align="center">
                        <Icon as={PiArrowLeftBold} boxSize={6} color="gray.400" />
                        <Text fontSize="xs" color="gray.400">Swipe</Text>
                    </VStack>
                </MotionBox>
            </>
        );
    };

    if (!isMobile) {
        return <>{children}</>;
    }

    return (
        <MotionBox
            ref={containerRef}
            position="relative"
            width="100%"
            height="100%"
            overflow="hidden"
            onPanStart={handlePanStart}
            onPan={handlePanMove}
            onPanEnd={handlePanEnd}
            animate={controls}
            style={{
                touchAction: 'pan-y', // Allow vertical panning for pull-to-refresh
            }}
        >
            {renderPullToRefreshIndicator()}
            {renderSwipeIndicators()}
            
            <Box
                width="100%"
                height="100%"
                overflow="auto"
                style={{
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain'
                }}
            >
                {children}
            </Box>
        </MotionBox>
    );
};

// Hook for enhanced mobile chat features
export const useEnhancedMobileChat = () => {
    const { isMobile, triggerHaptic } = useMobileOptimization();
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    
    useEffect(() => {
        if (!isMobile) return;
        
        const handleKeyboardToggle = () => {
            const keyboardVisible = document.documentElement.style.getPropertyValue('--keyboard-visible') === '1';
            setIsKeyboardVisible(keyboardVisible);
        };
        
        // Listen for keyboard visibility changes
        const observer = new MutationObserver(handleKeyboardToggle);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        return () => observer.disconnect();
    }, [isMobile]);
    
    const scrollToBottom = useCallback(() => {
        if (isMobile) {
            // Smooth scroll to bottom with mobile optimization
            const chatContainer = document.querySelector('[role="log"]');
            if (chatContainer) {
                chatContainer.scrollTo({
                    top: chatContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [isMobile]);
    
    return {
        isMobile,
        isKeyboardVisible,
        triggerHaptic,
        scrollToBottom
    };
};
