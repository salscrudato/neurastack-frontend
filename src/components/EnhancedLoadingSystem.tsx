import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Spinner,
  Progress,
  Skeleton,
  SkeletonText,
  VStack,
  HStack,
  Circle,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import useAdvancedMobileOptimization from '../hooks/useAdvancedMobileOptimization';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Loading state types
type LoadingType = 'spinner' | 'progress' | 'skeleton' | 'dots' | 'pulse' | 'shimmer';

interface LoadingProps {
  type?: LoadingType;
  message?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  isFullScreen?: boolean;
  showProgress?: boolean;
  animated?: boolean;
  reducedMotion?: boolean;
}

// Optimized dot animation for mobile
const DotLoader: React.FC<{ size: string; color: string; reducedMotion: boolean }> = ({ 
  size, 
  color, 
  reducedMotion 
}) => {
  const dotSize = useMemo(() => {
    switch (size) {
      case 'sm': return '6px';
      case 'md': return '8px';
      case 'lg': return '10px';
      case 'xl': return '12px';
      default: return '8px';
    }
  }, [size]);

  const animationDuration = reducedMotion ? 2 : 1.4;

  return (
    <HStack spacing={2}>
      {[0, 1, 2].map((index) => (
        <Circle
          key={index}
          size={dotSize}
          bg={color}
          as={motion.div}
          animate={reducedMotion ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={reducedMotion ? {} : {
            duration: animationDuration,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut",
          } as any}
        />
      ))}
    </HStack>
  );
};

// Shimmer effect for skeleton loading
const ShimmerLoader: React.FC<{ width?: string; height?: string; borderRadius?: string }> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
}) => {
  return (
    <Box
      width={width}
      height={height}
      borderRadius={borderRadius}
      bg="gray.200"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left="-100%"
        width="100%"
        height="100%"
        background="linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"
        as={motion.div}
        animate={{
          left: ['−100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        } as any}
      />
    </Box>
  );
};

// Pulse animation for loading states
const PulseLoader: React.FC<{ size: string; color: string; reducedMotion: boolean }> = ({
  size,
  color,
  reducedMotion,
}) => {
  const pulseSize = useMemo(() => {
    switch (size) {
      case 'sm': return '40px';
      case 'md': return '60px';
      case 'lg': return '80px';
      case 'xl': return '100px';
      default: return '60px';
    }
  }, [size]);

  return (
    <Box position="relative" width={pulseSize} height={pulseSize}>
      <Circle
        size={pulseSize}
        bg={color}
        opacity={0.6}
        as={motion.div}
        animate={reducedMotion ? {} : {
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.2, 0.6],
        }}
        transition={reducedMotion ? {} : {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        } as any}
      />
      <Circle
        size={`calc(${pulseSize} * 0.6)`}
        bg={color}
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        as={motion.div}
        animate={reducedMotion ? {} : {
          scale: [1, 0.8, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={reducedMotion ? {} : {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        } as any}
      />
    </Box>
  );
};

// Main Enhanced Loading Component
export const EnhancedLoadingSystem: React.FC<LoadingProps> = ({
  type = 'spinner',
  message = 'Loading...',
  progress,
  size = 'md',
  color,
  isFullScreen = false,
  showProgress = false,
  animated = true,
  reducedMotion: propReducedMotion,
}) => {
  const {
    isMobile,
    deviceCapabilities,
    performanceMetrics,
  } = useAdvancedMobileOptimization();

  const [loadingMessage, setLoadingMessage] = useState(message);
  const [currentProgress, setCurrentProgress] = useState(progress || 0);

  // Determine if animations should be reduced
  const shouldReduceMotion = propReducedMotion ?? deviceCapabilities?.reducedMotion ?? false;
  
  // Adaptive color based on theme and device capabilities
  const adaptiveColor = useColorModeValue(
    color || '#4F9CF9',
    color || '#63B3ED'
  );

  // Performance-optimized loading messages
  const loadingMessages = useMemo(() => [
    'Loading...',
    'Processing...',
    'Almost ready...',
    'Finalizing...',
  ], []);

  // Rotate loading messages for better UX
  useEffect(() => {
    if (!animated || shouldReduceMotion) return;

    const interval = setInterval(() => {
      setLoadingMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [animated, shouldReduceMotion, loadingMessages]);

  // Simulate progress for better perceived performance
  useEffect(() => {
    if (progress !== undefined) {
      setCurrentProgress(progress);
      return;
    }

    if (!showProgress) return;

    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [progress, showProgress]);

  // Render loading content based on type
  const renderLoadingContent = () => {
    switch (type) {
      case 'dots':
        return <DotLoader size={size} color={adaptiveColor} reducedMotion={shouldReduceMotion} />;
      
      case 'pulse':
        return <PulseLoader size={size} color={adaptiveColor} reducedMotion={shouldReduceMotion} />;
      
      case 'shimmer':
        return (
          <VStack spacing={3} width="100%">
            <ShimmerLoader width="80%" height="20px" />
            <ShimmerLoader width="60%" height="16px" />
            <ShimmerLoader width="90%" height="18px" />
          </VStack>
        );
      
      case 'skeleton':
        return (
          <VStack spacing={4} width="100%">
            <Skeleton height="20px" width="80%" />
            <SkeletonText mt="4" noOfLines={3} spacing="4" />
            <Skeleton height="40px" width="60%" />
          </VStack>
        );
      
      case 'progress':
        return (
          <VStack spacing={4} width="100%">
            <Progress
              value={currentProgress}
              size={size}
              colorScheme="blue"
              width="100%"
              borderRadius="full"
              bg="gray.100"
              hasStripe={!shouldReduceMotion}
              isAnimated={!shouldReduceMotion}
            />
            {showProgress && (
              <Text fontSize="sm" color="gray.600">
                {Math.round(currentProgress)}%
              </Text>
            )}
          </VStack>
        );
      
      case 'spinner':
      default:
        return (
          <Spinner
            size={size}
            color={adaptiveColor}
            thickness="3px"
            speed={shouldReduceMotion ? "2s" : "0.8s"}
            emptyColor="gray.200"
          />
        );
    }
  };

  // Container styles based on screen type
  const containerStyles = useMemo(() => {
    const baseStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      p: 6,
    };

    if (isFullScreen) {
      return {
        ...baseStyles,
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
      };
    }

    return {
      ...baseStyles,
      minH: isMobile ? '200px' : '300px',
      borderRadius: 'lg',
      bg: 'white',
      boxShadow: 'sm',
    };
  }, [isFullScreen, isMobile]);

  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: shouldReduceMotion ? 1 : 0.9,
      y: shouldReduceMotion ? 0 : 20,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
        ease: "easeOut",
      },
    },
    exit: { 
      opacity: 0, 
      scale: shouldReduceMotion ? 1 : 0.9,
      y: shouldReduceMotion ? 0 : -20,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <MotionFlex
        {...containerStyles}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        {renderLoadingContent()}
        
        {message && (
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: shouldReduceMotion ? 0.1 : 0.3 }}
          >
            <Text
              fontSize={isMobile ? 'sm' : 'md'}
              color="gray.600"
              textAlign="center"
              fontWeight="medium"
            >
              {loadingMessage}
            </Text>
          </MotionBox>
        )}

        {/* Performance indicator for development */}
        {process.env.NODE_ENV === 'development' && performanceMetrics.frameRate < 50 && (
          <Text fontSize="xs" color="orange.500" mt={2}>
            ⚠️ Low FPS: {performanceMetrics.frameRate}
          </Text>
        )}
      </MotionFlex>
    </AnimatePresence>
  );
};

// Specialized loading components for common use cases
export const ChatLoadingIndicator: React.FC = () => (
  <EnhancedLoadingSystem
    type="dots"
    message="AI is thinking..."
    size="sm"
    animated={true}
  />
);

export const PageLoadingIndicator: React.FC = () => (
  <EnhancedLoadingSystem
    type="spinner"
    message="Loading page..."
    size="lg"
    isFullScreen={true}
    animated={true}
  />
);

export const ContentSkeletonLoader: React.FC = () => (
  <EnhancedLoadingSystem
    type="skeleton"
    animated={true}
  />
);

export const ProgressLoader: React.FC<{ progress: number; message?: string }> = ({ 
  progress, 
  message = "Processing..." 
}) => (
  <EnhancedLoadingSystem
    type="progress"
    progress={progress}
    message={message}
    showProgress={true}
    animated={true}
  />
);

export default EnhancedLoadingSystem;
