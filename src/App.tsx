import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "./store/useAuthStore";
import AddToHomeButton from "./components/AddToHomeScreen";
import AppStorePage from "./pages/AppStorePage";
import NeurataskPage from "./pages/NeurataskPage";

/* ─────────────────────────────────────────── */
/* Lazy-loaded pages (code-splitting)          */
/* ─────────────────────────────────────────── */
const SplashPage = lazy(() => import("./pages/SplashPage").then(module => ({ default: module.SplashPage })));
const ChatPage   = lazy(() => import("./pages/ChatPage").then(module => ({ default: module.ChatPage })));

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
  const user = useAuthStore((s) => s.user);

  return (
    <PageWrapper>
      <AddToHomeButton />
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/"     element={<SplashPage />} />
          <Route
            path="/chat"
            element={user ? <ChatPage /> : <Navigate to="/" />}
          />
          <Route path="/apps" element={<AppStorePage />} />
          <Route path="/apps/neuratask" element={user ? <NeurataskPage /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </PageWrapper>
  );
}
