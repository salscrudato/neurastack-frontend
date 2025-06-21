/**
 * Main App Component
 *
 * This is the root component that wraps all pages and provides:
 * - Navigation header
 * - Page transitions and animations
 * - Global app features (PWA, analytics, etc.)
 * - Mobile-optimized layout and scrolling
 */

// Import UI components and layout tools
import { Box, Flex } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

// Import global app components that appear on every page
import AddToHomeButton from "./components/AddToHomeScreen";  // PWA install prompt
import { Header } from "./components/Header";  // Navigation bar
import LoadingSpinner from "./components/LoadingSpinner";  // Loading indicators
import PrivacyConsent from "./components/PrivacyConsent";  // GDPR compliance
import UpdateNotification from "./components/UpdateNotification";  // App update notifications

// Import hooks for global app functionality
import { useAnalytics } from "./hooks/useAnalytics";  // User behavior tracking
import { useFitnessSync } from "./hooks/useFitnessSync";  // Fitness data synchronization
import { usePerformanceLogger } from "./hooks/usePerformanceMonitor";  // Performance monitoring

// Import CSS for mobile optimization and modern UI enhancements
import "./styles/mobile-scrolling.css";
import "./styles/modern-enhancements.css";

/**
 * Page Content Wrapper Component
 *
 * This component handles the layout and animations for all pages in the app.
 * It provides:
 * - Smooth page transitions when navigating between routes
 * - Responsive header that hides on the splash page
 * - Mobile-optimized scrolling and viewport handling
 */
const PageContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Determine if we should show the navigation header (hide it on the welcome page)
  const isSplashPage = location.pathname === '/';

  /**
   * Get Animation Settings for Page Transitions
   *
   * Different pages get different transition effects:
   * - Main app pages: Horizontal slide with blur effect
   * - Splash page: Simple fade with blur effect
   */
  const getTransitionVariants = (pathname: string) => {
    const isChatRoute = pathname === '/chat';
    const isHistoryRoute = pathname === '/history';
    const isNeuraFitRoute = pathname === '/neurafit';
    const isAdminRoute = pathname === '/admin';

    if (isChatRoute || isHistoryRoute || isNeuraFitRoute || isAdminRoute) {
      // Main pages: gentle horizontal slide with blur for smooth navigation feel
      return {
        initial: { opacity: 0, x: 15, filter: "blur(6px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -15, filter: "blur(6px)" }
      };
    } else {
      // Splash page: simple fade transition
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
      // Mobile viewport optimization - handles different mobile browser behaviors
      sx={{
        minHeight: ['100vh', '100dvh'],  // Use dynamic viewport height when available
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available',  // iOS Safari optimization
        },
        overflow: 'hidden',  // Prevent body scrolling - pages handle their own scrolling
      }}
    >
      {/* Navigation Header - Fixed at top, hidden on splash page */}
      {!isSplashPage && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}  // Ensure header stays above page content
          w="100%"
          bg="white"
          borderBottom="1px solid rgba(226, 232, 240, 0.8)"
          boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
          flexShrink={0}
          // Mobile-specific header positioning
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

      {/* Main Content Area - Animated page transitions with header spacing */}
      <Box
        flex="1"
        position="relative"
        w="100%"
        pt={!isSplashPage ? "64px" : 0}  // Add top padding to account for fixed header
        // Optimized scrolling behavior for mobile devices
        sx={{
          overflowX: 'hidden',  // Prevent horizontal scrolling
          WebkitOverflowScrolling: 'touch',  // Smooth scrolling on iOS
          overscrollBehavior: 'contain',  // Prevent scroll chaining to parent
          // Mobile-specific layout adjustments
          '@media (max-width: 768px)': {
            paddingTop: !isSplashPage ? '56px' : 0,  // Smaller header on mobile
            minHeight: !isSplashPage ? 'calc(100vh - 56px)' : '100vh',
          },
          // Desktop layout
          '@media (min-width: 769px)': {
            paddingTop: !isSplashPage ? '64px' : 0,  // Standard header height
            minHeight: !isSplashPage ? 'calc(100vh - 64px)' : '100vh',
          }
        }}
      >
        {/* Page Transition Animation Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}  // Trigger animation when route changes
            initial={variants.initial}  // Starting animation state
            animate={variants.animate}  // Final animation state
            exit={variants.exit}  // Animation when leaving page
            transition={{
              duration: 0.35,  // Animation duration in seconds
              ease: [0.25, 0.46, 0.45, 0.94],  // Smooth easing curve
              filter: { duration: 0.25 }  // Blur effect timing
            }}
            style={{
              width: "100%",
              minHeight: "100%",
              backfaceVisibility: "hidden"  // Prevent flickering during animation
            }}
          >
            <Box w="100%" minH="100%">
              {children}  {/* This is where the actual page content appears */}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Flex>
  );
};

/**
 * Loading Fallback Component
 *
 * Shows a loading spinner when pages are being loaded (especially lazy-loaded pages).
 * Provides visual feedback to users during page transitions.
 */
const Fallback = () => (
  <LoadingSpinner
    size="lg"
    message="Loading page..."
    fullScreen
  />
);

/**
 * Main App Component Export
 *
 * This is the root component that gets rendered by main.tsx.
 * It sets up global app functionality and renders the current page.
 */
export default function App() {
  // Initialize global app features that run throughout the user session
  usePerformanceLogger();  // Monitor app performance and log metrics
  useFitnessSync();  // Keep fitness data synchronized with the database
  useAnalytics();  // Track user interactions for app improvement

  return (
    <PageContentWrapper>
      {/* Global app components that appear on every page */}
      <AddToHomeButton />  {/* PWA install prompt for mobile users */}
      <UpdateNotification />  {/* Notify users when app updates are available */}
      <PrivacyConsent />  {/* GDPR compliance - privacy consent banner */}

      {/* Page content area with loading fallback for lazy-loaded pages */}
      <Suspense fallback={<Fallback />}>
        <Outlet />  {/* This is where the current page content gets rendered */}
      </Suspense>
    </PageContentWrapper>
  );
}
