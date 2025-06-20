import { Box, Flex } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AddToHomeButton from "./components/AddToHomeScreen";
import { Header } from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
import PrivacyConsent from "./components/PrivacyConsent";
import UpdateNotification from "./components/UpdateNotification";
import { useAnalytics } from "./hooks/useAnalytics";
import { useFitnessSync } from "./hooks/useFitnessSync";
import { usePerformanceLogger } from "./hooks/usePerformanceMonitor";
import "./styles/mobile-scrolling.css";
import "./styles/modern-enhancements.css";

/* Enhanced page content transitions with static header */
const PageContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Check if current route should show header
  const isSplashPage = location.pathname === '/';

  // Simplified transitions for streamlined app structure
  const getTransitionVariants = (pathname: string) => {
    const isChatRoute = pathname === '/chat';
    const isHistoryRoute = pathname === '/history';
    const isNeuraFitRoute = pathname === '/neurafit';
    const isAdminRoute = pathname === '/admin';

    if (isChatRoute || isHistoryRoute || isNeuraFitRoute || isAdminRoute) {
      // Main pages have gentle horizontal slide with blur
      return {
        initial: { opacity: 0, x: 15, filter: "blur(6px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -15, filter: "blur(6px)" }
      };
    } else {
      // Default subtle transition for splash
      return {
        initial: { opacity: 0, filter: "blur(4px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        exit: { opacity: 0, filter: "blur(4px)" }
      };
    }
  };

  const variants = getTransitionVariants(location.pathname);

  return (
    <Flex
      direction="column"
      h="100vh"
      w="100%"
      overflowX="hidden"
      position="relative"
      // Enhanced mobile viewport support
      sx={{
        minHeight: ['100vh', '100dvh'],
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available',
        },
        // Prevent body scrolling - let content areas handle their own scrolling
        overflow: 'hidden',
      }}
    >
      {/* Fixed Header - only show on non-splash pages */}
      {!isSplashPage && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          w="100%"
          bg="white"
          borderBottom="1px solid rgba(226, 232, 240, 0.8)"
          boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
          flexShrink={0}
          // Enhanced mobile header support
          sx={{
            '@media (max-width: 768px)': {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
            }
          }}
        >
          <Header />
        </Box>
      )}

      {/* Animated Page Content with proper top padding for fixed header */}
      <Box
        flex="1"
        position="relative"
        w="100%"
        pt={!isSplashPage ? "64px" : 0} // Add padding for fixed header
        // Allow natural scrolling with minimal constraints
        sx={{
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          // Mobile-specific optimizations
          '@media (max-width: 768px)': {
            paddingTop: !isSplashPage ? '56px' : 0, // Mobile header height
            minHeight: !isSplashPage ? 'calc(100vh - 56px)' : '100vh',
          },
          // Desktop optimizations
          '@media (min-width: 769px)': {
            paddingTop: !isSplashPage ? '64px' : 0,
            minHeight: !isSplashPage ? 'calc(100vh - 64px)' : '100vh',
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{
              duration: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94],
              filter: { duration: 0.25 }
            }}
            style={{
              width: "100%",
              minHeight: "100%",
              backfaceVisibility: "hidden"
            }}
          >
            <Box w="100%" minH="100%">
              {children}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Flex>
  );
};

/* Enhanced fallback with loading spinner */
const Fallback = () => (
  <LoadingSpinner
    size="lg"
    message="Loading page..."
    fullScreen
  />
);

export default function App() {
  // Disable performance monitoring to reduce console noise
  usePerformanceLogger();

  // Initialize fitness data sync with Firestore
  useFitnessSync();

  // Initialize analytics tracking
  useAnalytics();

  return (
    <PageContentWrapper>
      <AddToHomeButton />
      <UpdateNotification />
      <PrivacyConsent />
      <Suspense fallback={<Fallback />}>
        <Outlet />
      </Suspense>
    </PageContentWrapper>
  );
}
