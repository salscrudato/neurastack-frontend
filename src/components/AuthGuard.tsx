/**
 * Authentication Guard Component
 * 
 * Provides route protection and authentication state management.
 * Handles Firebase auth state changes and redirects unauthenticated users.
 */

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { auth } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';
import LoadingSpinner from './LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard component that protects routes and manages authentication state
 */
export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/' 
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const setUser = useAuthStore(s => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user?.uid, 'isAnonymous:', user?.isAnonymous);
      
      setUser(user);
      setIsAuthenticated(!!user);
      setIsLoading(false);

      // Handle authentication requirements
      if (requireAuth && !user) {
        console.log('🚫 Authentication required, redirecting to:', redirectTo);
        navigate(redirectTo, { 
          replace: true,
          state: { from: location.pathname }
        });
      } else if (!requireAuth && user && location.pathname === '/') {
        // User is authenticated but on splash page, redirect to chat
        console.log('✅ User authenticated, redirecting to /chat');
        navigate('/chat', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [setUser, navigate, location.pathname, requireAuth, redirectTo]);

  // Show loading spinner while checking auth state
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
          message="Checking authentication..." 
          fullScreen={false}
        />
      </Box>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
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
 * Hook for checking authentication status
 */
export function useAuthGuard() {
  const user = useAuthStore(s => s.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous ?? false,
    user,
    isLoading
  };
}
