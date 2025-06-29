import { Box, Flex } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
import PrivacyConsent from "./components/PrivacyConsent";
import UpdateNotification from "./components/UpdateNotification";
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
        minHeight: ['100vh', '100dvh'],
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available',
        },
        overflow: 'hidden',
        // Enhanced mobile viewport handling
        '@media (max-width: 768px)': {
          minHeight: '100vh',
          height: '100vh',
          maxHeight: '100vh',
        },
        // Safe area support
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
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
          '@media (max-width: 768px)': {
            paddingTop: !isSplashPage ? '56px' : 0,
            minHeight: !isSplashPage ? 'calc(100vh - 56px)' : '100vh',
          },
          '@media (min-width: 769px)': {
            paddingTop: !isSplashPage ? '64px' : 0,
            minHeight: !isSplashPage ? 'calc(100vh - 64px)' : '100vh',
          }
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

  return (
    <PageContentWrapper>
      <UpdateNotification />
      <PrivacyConsent />
      <Suspense fallback={<Fallback />}>
        <Outlet />
      </Suspense>
    </PageContentWrapper>
  );
}