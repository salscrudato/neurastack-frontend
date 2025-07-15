/**
 * Authentication Guard Component
 *
 * Optimized for fast authentication checks with minimal delays.
 * Uses centralized auth state management to prevent race conditions.
 */

import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import LoadingSpinner from './LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/'
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        navigate(redirectTo, { replace: true, state: { from: location.pathname } });
      } else if (!requireAuth && user && location.pathname === '/') {
        navigate('/chat', { replace: true });
      }
    }
  }, [user, isLoading, requireAuth, navigate, redirectTo, location.pathname]);

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="100vh" bg="white">
        <LoadingSpinner size="lg" message="Authenticating..." fullScreen={false} />
      </Box>
    );
  }

  if (requireAuth && !user) return null;

  return <>{children}</>;
}

export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; redirectTo?: string } = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

export function useAuthGuard() {
  const user = useAuthStore(s => s.user);

  return {
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous ?? false,
    user,
    isLoading: false,
  };
}