import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SplashPage } from './pages/SplashPage';
import { ChatPage }   from './pages/ChatPage';
import { useAuthStore } from './store/useAuthStore';
import { motion } from 'framer-motion';

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  const user = useAuthStore(s => s.user);
  return (
    <PageWrapper>
      <Routes>
        <Route path="/"       element={<SplashPage />} />
        <Route path="/chat"   element={user ? <ChatPage /> : <Navigate to="/" />} />
        <Route path="*"       element={<Navigate to="/" />} />
      </Routes>
    </PageWrapper>
  );
}