import { Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex } from "@chakra-ui/react";
import AddToHomeButton from "./components/AddToHomeScreen";
import { usePerformanceLogger } from "./hooks/usePerformanceMonitor";
import LoadingSpinner from "./components/LoadingSpinner";
import { Header } from "./components/Header";
import UpdateNotification from "./components/UpdateNotification";
import "./styles/mobile-scrolling.css";
import "./styles/modern-enhancements.css";

/* Enhanced page content transitions with static header */
const PageContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Check if current route should show header
  const isSplashPage = location.pathname === '/';

  // Modern header styling - transparent
  const headerBg = 'transparent';
  const headerBorderColor = 'transparent';
  const headerBoxShadow = 'none';

  // Simplified transitions for streamlined app structure
  const getTransitionVariants = (pathname: string) => {
    const isChatRoute = pathname === '/chat';
    const isHistoryRoute = pathname === '/history';
    const isNeuraFitRoute = pathname === '/neurafit';

    if (isChatRoute || isHistoryRoute || isNeuraFitRoute) {
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
    <Flex direction="column" h="100vh" w="100%" overflow="hidden" overflowX="hidden">
      {/* Static Header - only show on non-splash pages */}
      {!isSplashPage && (
        <Box
          position="relative"
          zIndex={10}
          w="100%"
          bg={headerBg}
          borderBottom="1px solid"
          borderColor={headerBorderColor}
          boxShadow={headerBoxShadow}
          flexShrink={0}
        >
          <Header />
        </Box>
      )}

      {/* Animated Page Content */}
      <Box flex="1" position="relative" overflow="hidden">
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
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              backfaceVisibility: "hidden"
            }}
          >
            <Box h="100%" w="100%" overflow="hidden">
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

  return (
    <PageContentWrapper>
      <AddToHomeButton />
      <UpdateNotification />
      <Suspense fallback={<Fallback />}>
        <Outlet />
      </Suspense>
    </PageContentWrapper>
  );
}
