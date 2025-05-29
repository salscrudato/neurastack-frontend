import { Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddToHomeButton from "./components/AddToHomeScreen";

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

/* Minimal fallback while suspense loads a page */
const Fallback = () => (
  <div className="flex h-full w-full items-center justify-center text-gray-400">
    Loading…
  </div>
);

export default function App() {
  return (
    <PageWrapper>
      <AddToHomeButton />
      <Suspense fallback={<Fallback />}>
        <Outlet />
      </Suspense>
    </PageWrapper>
  );
}
