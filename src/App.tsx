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

  // Modern header styling - light mode only
  const headerBg = 'rgba(255, 255, 255, 0.95)';
  const headerBorderColor = 'rgba(229, 231, 235, 0.8)';
  const headerBoxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';

  // Subtle blur-based transitions for page content
  const getTransitionVariants = (pathname: string) => {
    const isAppRoute = pathname.startsWith('/apps/');
    const isChatRoute = pathname === '/chat';
    const isAppsRoute = pathname === '/apps';

    if (isAppRoute) {
      // Apps slide in from right with subtle blur
      return {
        initial: { opacity: 0, x: 20, filter: "blur(8px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -20, filter: "blur(8px)" }
      };
    } else if (isChatRoute || isAppsRoute) {
      // Main pages have gentle vertical movement with blur
      return {
        initial: { opacity: 0, y: 15, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -15, filter: "blur(6px)" }
      };
    } else {
      // Default subtle transition
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
          backdropFilter="blur(10px)"
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
