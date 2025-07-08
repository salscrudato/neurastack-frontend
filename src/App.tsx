import { Box, Flex } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import UpdateNotification from "./components/UpdateNotification";
import { usePerformanceOptimization } from "./hooks/usePerformanceOptimization";
import { authManager } from "./utils/authUtils";
// import { useFitnessSync } from "./hooks/useFitnessSync";
import "./styles/global.css";
import "./styles/utilities.css";

// Single transition variant for all pages
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const PageContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isSplashPage = location.pathname === '/';

  return (
    <Flex
      direction="column"
      h="100vh"
      w="100%"
      overflowX="hidden"
      position="relative"
      sx={{
        // Modern viewport units with fallbacks
        minHeight: ['100vh', '100dvh', '100svh'],
        height: ['100vh', '100dvh'],
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available',
          height: '-webkit-fill-available',
        },
        overflow: 'hidden',
        // Enhanced mobile viewport handling with container queries
        '@media (max-width: 768px)': {
          minHeight: 'max(100vh, 100dvh)',
          height: 'max(100vh, 100dvh)',
          maxHeight: 'max(100vh, 100dvh)',
        },
        // Safe area support with enhanced padding
        paddingLeft: 'max(env(safe-area-inset-left), 0px)',
        paddingRight: 'max(env(safe-area-inset-right), 0px)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        // Performance optimizations
        contain: 'layout style paint',
        willChange: 'auto',
      }}
    >
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
        >
          <Header />
        </Box>
      )}
      <Box
        flex="1"
        position="relative"
        w="100%"
        pt={!isSplashPage ? "64px" : 0}
        sx={{
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          // Performance optimizations
          contain: 'layout style',
          willChange: 'auto',
          // Enhanced responsive padding with fluid values
          paddingTop: !isSplashPage ? 'clamp(56px, 15vw, 64px)' : 0,
          minHeight: !isSplashPage
            ? 'calc(100vh - clamp(56px, 15vw, 64px))'
            : '100vh',
          // Modern viewport support
          '@supports (height: 100dvh)': {
            minHeight: !isSplashPage
              ? 'calc(100dvh - clamp(56px, 15vw, 64px))'
              : '100dvh',
          },
          // Enhanced mobile optimizations
          '@media (max-width: 768px)': {
            paddingTop: !isSplashPage ? 'clamp(52px, 12vw, 56px)' : 0,
            minHeight: !isSplashPage ? 'calc(100vh - clamp(52px, 12vw, 56px))' : '100vh',
            touchAction: 'pan-y',
          },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{
              duration: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94]
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

const Fallback = () => (
  <LoadingSpinner
    size="lg"
    message="Loading page..."
    fullScreen
  />
);

export default function App() {
  // useFitnessSync();

  // Initialize performance optimizations
  usePerformanceOptimization({
    enableMetrics: import.meta.env.PROD,
    enableResourceHints: true,
    enableImageOptimization: true,
    enableFontOptimization: true
  });

  // Initialize auth manager
  useEffect(() => {
    authManager.initialize();

    return () => {
      authManager.cleanup();
    };
  }, []);

  return (
    <PageContentWrapper>
      <UpdateNotification />
      <PWAInstallPrompt />
      <Suspense fallback={<Fallback />}>
        <Outlet />
      </Suspense>
    </PageContentWrapper>
  );
}