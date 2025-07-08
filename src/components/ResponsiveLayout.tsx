import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Flex,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import useAdvancedMobileOptimization from '../hooks/useAdvancedMobileOptimization';
import { performanceMonitor } from '../utils/performanceMonitor';

const MotionBox = motion(Box);

// Layout configuration types
interface LayoutConfig {
  maxWidth: string | object;
  padding: string | object;
  gap: string | object;
  columns: number | object;
  minHeight: string;
}

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'chat' | 'dashboard' | 'landing' | 'mobile-first';
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
  enableAnimations?: boolean;
  optimizeForMobile?: boolean;
}

// Predefined layout configurations
const layoutConfigs: Record<string, LayoutConfig> = {
  default: {
    maxWidth: { base: '100%', sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
    padding: { base: '1rem', sm: '1.5rem', md: '2rem', lg: '2.5rem', xl: '3rem' },
    gap: { base: '1rem', sm: '1.5rem', md: '2rem' },
    columns: { base: 1, md: 2, lg: 3 },
    minHeight: '100vh',
  },
  chat: {
    maxWidth: { base: '100%', md: '850px', lg: '950px', xl: '1050px' },
    padding: { base: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem' },
    gap: { base: '0.75rem', sm: '1rem', md: '1.25rem' },
    columns: 1,
    minHeight: '100vh',
  },
  dashboard: {
    maxWidth: { base: '100%', lg: '1200px', xl: '1400px', '2xl': '1600px' },
    padding: { base: '1rem', sm: '1.5rem', md: '2rem', lg: '3rem' },
    gap: { base: '1.5rem', md: '2rem', lg: '2.5rem' },
    columns: { base: 1, md: 2, lg: 3, xl: 4 },
    minHeight: '100vh',
  },
  landing: {
    maxWidth: { base: '100%', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    padding: { base: '1rem', sm: '2rem', md: '3rem', lg: '4rem', xl: '5rem' },
    gap: { base: '2rem', md: '3rem', lg: '4rem' },
    columns: { base: 1, lg: 2 },
    minHeight: '100vh',
  },
  'mobile-first': {
    maxWidth: { base: '100%', sm: '100%', md: '768px', lg: '1024px' },
    padding: { base: '0.75rem', sm: '1rem', md: '1.5rem' },
    gap: { base: '0.5rem', sm: '0.75rem', md: '1rem' },
    columns: { base: 1, sm: 1, md: 2 },
    minHeight: '100vh',
  },
};

// Animation variants for smooth transitions
const layoutVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

const childVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Main ResponsiveLayout component
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  variant = 'default',
  showSidebar = false,
  sidebarContent,
  headerContent,
  footerContent,
  className,
  enableAnimations = true,
  optimizeForMobile = true,
}) => {
  const {
    isMobile,
    isTablet,
    keyboardVisible,
    deviceCapabilities,
    performanceMetrics,
  } = useAdvancedMobileOptimization();

  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // Get layout configuration
  const config = layoutConfigs[variant] || layoutConfigs.default;

  // Responsive values
  const maxWidth = useBreakpointValue(
    typeof config.maxWidth === 'object' ? config.maxWidth : { base: config.maxWidth }
  );
  const padding = useBreakpointValue(
    typeof config.padding === 'object' ? config.padding : { base: config.padding }
  );
  const gap = useBreakpointValue(
    typeof config.gap === 'object' ? config.gap : { base: config.gap }
  );

  // Performance optimization: disable animations on low-end devices
  const shouldAnimate = useMemo(() => {
    if (!enableAnimations) return false;
    if (deviceCapabilities?.reducedMotion) return false;
    if (performanceMetrics.frameRate < 30) return false;
    return true;
  }, [enableAnimations, deviceCapabilities?.reducedMotion, performanceMetrics.frameRate]);

  // Mobile-specific optimizations
  const mobileOptimizations = useMemo(() => {
    if (!optimizeForMobile || !isMobile) return {};

    return {
      // Optimize for mobile performance
      willChange: 'transform',
      backfaceVisibility: 'hidden' as const,
      WebkitOverflowScrolling: 'touch' as const,
      overscrollBehavior: 'contain' as const,
      
      // Mobile-specific spacing
      paddingBottom: keyboardVisible ? '0' : 'env(safe-area-inset-bottom, 0px)',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingLeft: 'env(safe-area-inset-left, 0px)',
      paddingRight: 'env(safe-area-inset-right, 0px)',
      
      // Optimize touch interactions
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    };
  }, [optimizeForMobile, isMobile, keyboardVisible]);

  // Layout initialization
  useEffect(() => {
    performanceMonitor.startRender('ResponsiveLayout');
    
    // Simulate layout calculation time
    const timer = setTimeout(() => {
      setIsLayoutReady(true);
      performanceMonitor.endRender('ResponsiveLayout');
    }, 50);

    return () => clearTimeout(timer);
  }, [variant]);

  // Sidebar configuration
  const sidebarWidth = useMemo(() => {
    if (!showSidebar || !sidebarContent) return 0;
    if (isMobile) return '100%';
    if (isTablet) return '280px';
    return '320px';
  }, [showSidebar, sidebarContent, isMobile, isTablet]);

  // Main content area width calculation
  const contentWidth = useMemo(() => {
    if (!showSidebar || isMobile) return '100%';
    return `calc(100% - ${sidebarWidth})`;
  }, [showSidebar, isMobile, sidebarWidth]);

  // Background styles with theme support
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const contentBg = useColorModeValue('white', 'gray.800');

  if (!isLayoutReady) {
    return (
      <Box
        minH="100vh"
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box>Loading layout...</Box>
      </Box>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <MotionBox
        key={variant}
        className={className}
        minH={config.minHeight}
        bg={bgColor}
        position="relative"
        overflow="hidden"
        variants={shouldAnimate ? layoutVariants : undefined}
        initial={shouldAnimate ? 'hidden' : undefined}
        animate={shouldAnimate ? 'visible' : undefined}
        exit={shouldAnimate ? 'exit' : undefined}
        sx={mobileOptimizations}
      >
        {/* Header */}
        {headerContent && (
          <MotionBox
            variants={shouldAnimate ? childVariants : undefined}
            position="sticky"
            top={0}
            zIndex={100}
            bg={contentBg}
            borderBottom="1px solid"
            borderColor="gray.200"
            backdropFilter="blur(8px)"
          >
            {headerContent}
          </MotionBox>
        )}

        {/* Main layout container */}
        <Flex
          direction={{ base: 'column', md: showSidebar ? 'row' : 'column' }}
          minH={headerContent ? 'calc(100vh - 80px)' : '100vh'}
          position="relative"
        >
          {/* Sidebar */}
          {showSidebar && sidebarContent && (
            <MotionBox
              variants={shouldAnimate ? childVariants : undefined}
              width={sidebarWidth}
              bg={contentBg}
              borderRight={{ base: 'none', md: '1px solid' }}
              borderColor="gray.200"
              position={{ base: 'relative', md: 'sticky' }}
              top={{ base: 'auto', md: headerContent ? '80px' : '0' }}
              height={{ base: 'auto', md: headerContent ? 'calc(100vh - 80px)' : '100vh' }}
              overflowY="auto"
              zIndex={50}
              display={isMobile && keyboardVisible ? 'none' : 'block'}
            >
              {sidebarContent}
            </MotionBox>
          )}

          {/* Main content area */}
          <MotionBox
            variants={shouldAnimate ? childVariants : undefined}
            flex="1"
            width={contentWidth}
            position="relative"
            bg={variant === 'chat' ? 'transparent' : contentBg}
            overflowX="hidden"
            overflowY="auto"
          >
            <Container
              maxW={maxWidth}
              p={padding}
              mx="auto"
              position="relative"
              minH="100%"
            >
              <Box
                display="flex"
                flexDirection="column"
                gap={gap}
                minH="100%"
              >
                {children}
              </Box>
            </Container>
          </MotionBox>
        </Flex>

        {/* Footer */}
        {footerContent && (
          <MotionBox
            variants={shouldAnimate ? childVariants : undefined}
            bg={contentBg}
            borderTop="1px solid"
            borderColor="gray.200"
            mt="auto"
          >
            {footerContent}
          </MotionBox>
        )}

        {/* Performance indicator for development */}
        {process.env.NODE_ENV === 'development' && performanceMetrics.frameRate < 50 && (
          <Box
            position="fixed"
            bottom="20px"
            right="20px"
            bg="orange.500"
            color="white"
            px={3}
            py={1}
            borderRadius="md"
            fontSize="xs"
            zIndex={9999}
          >
            Low FPS: {performanceMetrics.frameRate}
          </Box>
        )}
      </MotionBox>
    </AnimatePresence>
  );
};

// Specialized layout components
export const ChatLayout: React.FC<{ children: React.ReactNode; headerContent?: React.ReactNode }> = ({
  children,
  headerContent,
}) => (
  <ResponsiveLayout
    variant="chat"
    headerContent={headerContent}
    enableAnimations={true}
    optimizeForMobile={true}
  >
    {children}
  </ResponsiveLayout>
);

export const DashboardLayout: React.FC<{
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
}> = ({ children, sidebarContent, headerContent }) => (
  <ResponsiveLayout
    variant="dashboard"
    showSidebar={!!sidebarContent}
    sidebarContent={sidebarContent}
    headerContent={headerContent}
    enableAnimations={true}
    optimizeForMobile={true}
  >
    {children}
  </ResponsiveLayout>
);

export const LandingLayout: React.FC<{
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}> = ({ children, headerContent, footerContent }) => (
  <ResponsiveLayout
    variant="landing"
    headerContent={headerContent}
    footerContent={footerContent}
    enableAnimations={true}
    optimizeForMobile={true}
  >
    {children}
  </ResponsiveLayout>
);

export const MobileFirstLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ResponsiveLayout
    variant="mobile-first"
    enableAnimations={true}
    optimizeForMobile={true}
  >
    {children}
  </ResponsiveLayout>
);

export default ResponsiveLayout;
