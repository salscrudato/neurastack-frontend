import { Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddToHomeButton from "./components/AddToHomeScreen";
import { usePerformanceLogger } from "./hooks/usePerformanceMonitor";
import LoadingSpinner from "./components/LoadingSpinner";

/* Shared page-enter / exit animation */
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
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
  usePerformanceLogger(false);

  return (
    <PageWrapper>
      <AddToHomeButton />
      <Suspense fallback={<Fallback />}>
        <Outlet />
      </Suspense>
    </PageWrapper>
  );
}
