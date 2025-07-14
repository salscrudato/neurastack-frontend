import { Box } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
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
    <>
      {/* Header - Always rendered outside main container for proper positioning */}
      {!isSplashPage && <Header />}

      {/* Main Content Container */}
      <Box
        w="100%"
        h="100vh"
        position="relative"
        sx={{
          minHeight: '100vh',
          height: '100vh',
          maxHeight: '100vh',
          '@supports (-webkit-touch-callout: none)': {
            minHeight: '-webkit-fill-available',
            height: '-webkit-fill-available',
            maxHeight: '-webkit-fill-available',
          },
          overflow: 'hidden',
          paddingLeft: 'max(env(safe-area-inset-left), 0px)',
          paddingRight: 'max(env(safe-area-inset-right), 0px)',
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
              height: "100%",
              backfaceVisibility: "hidden"
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </>
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
      <Suspense fallback={<Fallback />}>
        <Outlet />
      </Suspense>
    </PageContentWrapper>
  );
}