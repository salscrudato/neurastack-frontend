import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  useColorModeValue,
  useToast,
  VStack,
  HStack,
  Text,
  Badge,
  Slide,
  useDisclosure,
} from '@chakra-ui/react';
import { motion, useMotionValue } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import {
  PiArrowLeftBold,
  PiArrowRightBold,
  PiHandSwipeLeftBold,
} from 'react-icons/pi';

const MotionBox = motion(Box);

interface SwipeGestureConfig {
  threshold: number;
  velocity: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchOptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  colorScheme?: string;
  isDisabled?: boolean;
  hapticFeedback?: boolean;
  touchTarget?: 'small' | 'medium' | 'large';
}

// Enhanced haptic feedback utility
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[type]);
  }
  
  // iOS haptic feedback (if available)
  if ('hapticFeedback' in window) {
    try {
      (window as any).hapticFeedback.impact(type);
    } catch (error) {
      console.debug('Haptic feedback not available');
    }
  }
};

// Touch-optimized button component
export const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  children,
  onClick,
  size = 'md',
  variant = 'solid',
  colorScheme = 'blue',
  isDisabled = false,
  hapticFeedback = true,
  touchTarget = 'medium',
  ...props
}) => {
  const touchTargetSizes = {
    small: { minH: '44px', minW: '44px' },
    medium: { minH: '48px', minW: '48px' },
    large: { minH: '56px', minW: '56px' },
  };

  const handleClick = useCallback(() => {
    if (hapticFeedback) {
      triggerHapticFeedback('light');
    }
    onClick?.();
  }, [onClick, hapticFeedback]);

  return (
    <Button
      size={size}
      variant={variant}
      colorScheme={colorScheme}
      isDisabled={isDisabled}
      onClick={handleClick}
      {...touchTargetSizes[touchTarget]}
      _active={{
        transform: 'scale(0.95)',
        transition: 'transform 0.1s',
      }}
      _focus={{
        boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

// Swipe gesture hook
export const useSwipeGesture = (config: SwipeGestureConfig) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const handlePan = useCallback((_event: any, info: PanInfo) => {
    x.set(info.offset.x);
    y.set(info.offset.y);
  }, [x, y]);

  const handlePanEnd = useCallback((_event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Check horizontal swipes
    if (Math.abs(offset.x) > config.threshold && Math.abs(velocity.x) > config.velocity) {
      if (offset.x > 0) {
        config.onSwipeRight?.();
        triggerHapticFeedback('medium');
      } else {
        config.onSwipeLeft?.();
        triggerHapticFeedback('medium');
      }
    }
    
    // Check vertical swipes
    if (Math.abs(offset.y) > config.threshold && Math.abs(velocity.y) > config.velocity) {
      if (offset.y > 0) {
        config.onSwipeDown?.();
        triggerHapticFeedback('medium');
      } else {
        config.onSwipeUp?.();
        triggerHapticFeedback('medium');
      }
    }
    
    // Reset position
    x.set(0);
    y.set(0);
  }, [config, x, y]);

  return {
    x,
    y,
    onPan: handlePan,
    onPanEnd: handlePanEnd,
  };
};

// Mobile navigation component with swipe gestures
interface MobileNavigationProps {
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  showBackButton?: boolean;
  showForwardButton?: boolean;
  title?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onNavigateBack,
  onNavigateForward,
  showBackButton = true,
  showForwardButton = false,
  title,
}) => {
  const swipeConfig: SwipeGestureConfig = {
    threshold: 50,
    velocity: 500,
    onSwipeRight: onNavigateBack,
    onSwipeLeft: onNavigateForward,
  };
  
  const { x, onPan, onPanEnd } = useSwipeGesture(swipeConfig);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <MotionBox
      position="sticky"
      top={0}
      zIndex={10}
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      p={3}
      onPan={onPan}
      onPanEnd={onPanEnd}
      style={{ x }}
    >
      <HStack justify="space-between" align="center">
        {showBackButton ? (
          <TouchOptimizedButton
            size="sm"
            variant="ghost"
            onClick={onNavigateBack}
            touchTarget="large"
          >
            <PiArrowLeftBold />
          </TouchOptimizedButton>
        ) : (
          <Box w="48px" />
        )}
        
        {title && (
          <Text fontWeight="semibold" fontSize="md" textAlign="center" flex={1}>
            {title}
          </Text>
        )}
        
        {showForwardButton ? (
          <TouchOptimizedButton
            size="sm"
            variant="ghost"
            onClick={onNavigateForward}
            touchTarget="large"
          >
            <PiArrowRightBold />
          </TouchOptimizedButton>
        ) : (
          <Box w="48px" />
        )}
      </HStack>
    </MotionBox>
  );
};

// Mobile experience enhancement component
export const MobileExperienceEnhancer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isOpen: showGestureHint, onOpen: showHint, onClose: hideHint } = useDisclosure();
  const toast = useToast();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Monitor orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Back Online',
        description: 'Your connection has been restored',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Offline Mode',
        description: 'You can continue using the app offline',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Show gesture hint for first-time mobile users
  useEffect(() => {
    if (isMobile && !localStorage.getItem('neurastack_gesture_hint_shown')) {
      setTimeout(() => {
        showHint();
        localStorage.setItem('neurastack_gesture_hint_shown', 'true');
      }, 2000);
    }
  }, [isMobile, showHint]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Box position="relative" minH="100vh">
      {/* Mobile-specific styles */}
      <style>
        {`
          /* Prevent zoom on input focus */
          input, textarea, select {
            font-size: 16px !important;
          }
          
          /* Improve touch scrolling */
          * {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Prevent pull-to-refresh */
          body {
            overscroll-behavior-y: contain;
          }
        `}
      </style>

      {/* Status indicators */}
      <Box position="fixed" top={2} right={2} zIndex={1000}>
        <VStack spacing={1}>
          {!isOnline && (
            <Badge colorScheme="orange" variant="solid" fontSize="xs">
              Offline
            </Badge>
          )}
          {orientation === 'landscape' && (
            <Badge colorScheme="blue" variant="outline" fontSize="xs">
              Landscape
            </Badge>
          )}
        </VStack>
      </Box>

      {/* Gesture hint */}
      <Slide direction="bottom" in={showGestureHint} style={{ zIndex: 999 }}>
        <Box
          position="fixed"
          bottom={4}
          left={4}
          right={4}
          mx="auto"
          maxW="sm"
          bg={useColorModeValue('white', 'gray.800')}
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
          borderRadius="xl"
          boxShadow="xl"
          p={4}
        >
          <VStack spacing={3}>
            <HStack spacing={2}>
              <PiHandSwipeLeftBold size={20} />
              <Text fontWeight="semibold" fontSize="sm">
                Swipe Gestures Available
              </Text>
            </HStack>
            <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} textAlign="center">
              Swipe left/right to navigate, long press for context menus
            </Text>
            <TouchOptimizedButton size="sm" onClick={hideHint}>
              Got it!
            </TouchOptimizedButton>
          </VStack>
        </Box>
      </Slide>

      {children}
    </Box>
  );
};

export default MobileExperienceEnhancer;
