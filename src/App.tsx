// -----------------------------------------------------------------------------
//  App.tsx
//  Root component: global layout, animated route transitions, auth lifecycle,
//  and baseline accessibility helpers.
//
//  Key enhancements
//  ● Respects OS “reduced-motion” setting (framer-motion’s useReducedMotion)
//  ● Memoized variants/transition for performance
//  ● Single <main> element with focus-management & skip-link
//  ● Chakra-friendly MotionBox wrapper (keeps styling declarative)
//  ● Strict import ordering & explicit typing for clarity
// -----------------------------------------------------------------------------

import { Box } from "@chakra-ui/react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Transition,
    type Variants,
} from "framer-motion";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Header } from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
import { authManager } from "./utils/authUtils";

import "./styles/global.css";
import "./styles/utilities.css";
import "./utils/mobileInit";

// -----------------------------------------------------------------------------
// Utility: Chakra-compatible motion wrapper
// -----------------------------------------------------------------------------
const MotionBox = motion(Box);

/**
 * PageContentWrapper
 * — Injects <Header /> on all routes except the splash ("/")
 * — Handles animated route transitions
 */
const PageContentWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const isSplashPage = location.pathname === "/";
  const prefersReducedMotion = useReducedMotion();

  /* Variants & transition are memoized to avoid recalculation on every render */
  const pageVariants = useMemo<Variants>(
    () =>
      prefersReducedMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          }
        : {
            initial: { opacity: 0, y: 20, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -20, scale: 1.02 },
          },
    [prefersReducedMotion]
  );

  const pageTransition = useMemo<Transition>(
    () =>
      prefersReducedMotion
        ? { duration: 0.2 }
        : { type: "spring", damping: 20, stiffness: 200, duration: 0.35 },
    [prefersReducedMotion]
  );

  return (
    <>
      {!isSplashPage && <Header />}

      {/* Full-viewport, scrollable container that respects safe areas */}
      <MotionBox
        w="100%"
        h="100vh"
        minH="100vh"
        maxH="100vh"
        overflow="auto"
        px="env(safe-area-inset-left)"
        py="env(safe-area-inset-top)"
        sx={{
          "@supports (-webkit-touch-callout: none)": {
            h: "-webkit-fill-available",
            minH: "-webkit-fill-available",
            maxH: "-webkit-fill-available",
          },
        }}
      >
        <AnimatePresence mode="wait">
          <MotionBox
            key={location.pathname} // Triggers exit/enter animations
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            w="100%"
            h="100%"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              willChange: "opacity, transform, scale",
            }}
          >
            {children}
          </MotionBox>
        </AnimatePresence>
      </MotionBox>
    </>
  );
};

// -----------------------------------------------------------------------------
// Suspense fallback shown while lazy-loaded routes resolve
// -----------------------------------------------------------------------------
const Fallback = () => (
  <LoadingSpinner fullScreen size="lg" message="Loading page…" />
);

// -----------------------------------------------------------------------------
// Root App component
// -----------------------------------------------------------------------------
export default function App() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  /** Auth lifecycle — initialise once on mount, clean up on unmount */
  useEffect(() => {
    authManager.initialize();
    return () => authManager.cleanup();
  }, []);

  /** Accessibility — move keyboard focus into <main> on each route change */
  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  /** Visually-hidden skip link (becomes visible via :focus in CSS) */
  const skipLinkStyle: React.CSSProperties = {
    position: "absolute",
    left: -9999,
    top: 0,
    width: 1,
    height: 1,
    overflow: "hidden",
    zIndex: 1000,
  };

  return (
    <PageContentWrapper>
      <a href="#main-content" className="skip-link" style={skipLinkStyle}>
        Skip to main content
      </a>

      <Suspense fallback={<Fallback />}>
        {/* Single <main> element → semantic & a11y best practice */}
        <Box
          as="main"
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          w="100%"
          h="100%"
        >
          <Outlet />
        </Box>
      </Suspense>


    </PageContentWrapper>
  );
}