import { Box, Flex } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import UpdateNotification from "./components/UpdateNotification";

import "./styles/global.css";
import "./styles/utilities.css";
import { authManager } from "./utils/authUtils";
import "./utils/mobileInit"; // Initialize mobile optimizations

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
        minHeight: ['100vh', '100dvh', '100svh'],
        height: ['100vh', '100dvh'],
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available',
          height: '-webkit-fill-available',
        },
        overflow: 'hidden',
        '@media (max-width: 768px)': {
          minHeight: 'max(100vh, 100dvh)',
          height: 'max(100vh, 100dvh)',
          maxHeight: 'max(100vh, 100dvh)',
        },
        paddingLeft: 'max(env(safe-area-inset-left), 0px)',
        paddingRight: 'max(env(safe-area-inset-right), 0px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        contain: 'layout style paint',
        willChange: 'auto',
      }}
    >
      {!isSplashPage && <Header />}
      <Box
        flex="1"
        position="relative"
        w="100%"
        sx={{
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          contain: 'layout style',
          willChange: 'auto',
          // For non-splash pages, add padding for header
          paddingTop: !isSplashPage ? {
            base: 'calc(env(safe-area-inset-top, 0px) + 56px)',
            md: '60px'
          } : 0,
          minHeight: !isSplashPage ? {
            base: 'calc(100vh - env(safe-area-inset-top, 0px) - 56px)',
            md: 'calc(100vh - 60px)'
          } : '100vh',
          '@supports (height: 100dvh)': {
            minHeight: !isSplashPage ? {
              base: 'calc(100dvh - env(safe-area-inset-top, 0px) - 56px)',
              md: 'calc(100dvh - 60px)'
            } : '100dvh',
          },
          '@media (max-width: 768px)': {
            touchAction: 'pan-y',
            // Ensure proper spacing for mobile header
            paddingTop: !isSplashPage ? 'calc(env(safe-area-inset-top, 0px) + 56px)' : 0,
            minHeight: !isSplashPage
              ? 'calc(100vh - env(safe-area-inset-top, 0px) - 56px)'
              : '100vh',
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
  useEffect(() => {
    authManager.initialize();
    return () => authManager.cleanup();
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