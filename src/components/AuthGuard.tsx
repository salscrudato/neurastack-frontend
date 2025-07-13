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

/**
 * AuthGuard component that protects routes using centralized auth state
 * No longer sets up its own auth listener to prevent conflicts
 */
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
    // Quick timeout to allow auth state to initialize
    const quickTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Very short timeout for fast loading

    return () => clearTimeout(quickTimeout);
  }, []);

  useEffect(() => {
    // Handle navigation based on auth state changes
    if (!isLoading) {
      if (requireAuth && !user) {
        navigate(redirectTo, {
          replace: true,
          state: { from: location.pathname }
        });
      } else if (!requireAuth && user && location.pathname === '/') {
        // User is authenticated but on splash page, redirect to chat immediately
        navigate('/chat', { replace: true });
      }
    }
  }, [user, isLoading, requireAuth, navigate, redirectTo, location.pathname]);

  // Show minimal loading for very short time
  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="white"
      >
        <LoadingSpinner
          size="lg"
          message="Loading..."
          fullScreen={false}
        />
      </Box>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting routes
 */
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

/**
 * Hook for checking authentication status using centralized state
 */
export function useAuthGuard() {
  const user = useAuthStore(s => s.user);

  return {
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous ?? false,
    user,
    isLoading: false // No loading since we use centralized auth state
  };
}
