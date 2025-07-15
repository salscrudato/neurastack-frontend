/**
 * Authentication Utilities
 * 
 * Provides enhanced authentication helpers, session management,
 * and security utilities for Firebase Auth.
 */

import type { User } from 'firebase/auth';
import {
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged,
    setPersistence,
    signOut
} from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Enhanced authentication state management
 */
export class AuthManager {
  private static instance: AuthManager;
  private unsubscribe: (() => void) | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Initialize authentication state listener with optimized performance
   */
  initialize(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = onAuthStateChanged(auth, (user) => {
      // Update auth store immediately
      useAuthStore.getState().setUser(user);

      if (user) {
        this.setupSessionManagement(user);
      } else {
        this.clearSessionManagement();
      }
    }, (error) => {
      // Handle auth errors gracefully
      console.warn('Auth state change error:', error);
      useAuthStore.getState().setUser(null);
    });
  }

  /**
   * Setup session management for authenticated users
   */
  private setupSessionManagement(user: User): void {
    // Clear any existing timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    // For anonymous users, set shorter session timeout
    const timeoutDuration = user.isAnonymous 
      ? 24 * 60 * 60 * 1000 // 24 hours for anonymous
      : 7 * 24 * 60 * 60 * 1000; // 7 days for authenticated

    this.sessionTimeout = setTimeout(() => {
      this.signOut();
    }, timeoutDuration);

    // Set appropriate persistence
    const persistence = user.isAnonymous 
      ? browserSessionPersistence 
      : browserLocalPersistence;
    
    setPersistence(auth, persistence).catch(error => {
      console.warn('Failed to set auth persistence:', error);
    });
  }

  /**
   * Clear session management
   */
  private clearSessionManagement(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  /**
   * Enhanced sign out with cleanup
   */
  async signOut(): Promise<void> {
    try {
      this.clearSessionManagement();
      await signOut(auth);
      
      // Clear any cached data
      this.clearUserData();
    } catch (error) {
      // Silent fail for sign out errors
      throw error;
    }
  }

  /**
   * Clear user-specific data on sign out
   */
  private clearUserData(): void {
    try {
      // Clear localStorage items that are user-specific
      const keysToRemove = [
        'fitness-profile',
        'chat-history',
        'user-preferences'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear sessionStorage
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear user data:', error);
    }
  }

  /**
   * Check if current user has required permissions
   */
  hasPermission(permission: string): boolean {
    const user = useAuthStore.getState().user;
    
    if (!user) return false;
    
    // Define permission checks
    switch (permission) {
      case 'admin':
        return user.email === 'sal.scrudato@gmail.com';
      case 'chat':
        return true; // All authenticated users can chat
      case 'history':
        return true; // All authenticated users can view history
      default:
        return false;
    }
  }

  /**
   * Get current user info with security context
   */
  getCurrentUserInfo(): {
    uid: string | null;
    email: string | null;
    isAnonymous: boolean;
    isAuthenticated: boolean;
    permissions: string[];
  } {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      return {
        uid: null,
        email: null,
        isAnonymous: false,
        isAuthenticated: false,
        permissions: []
      };
    }

    const permissions: string[] = [];
    if (this.hasPermission('chat')) permissions.push('chat');
    if (this.hasPermission('history')) permissions.push('history');
    if (this.hasPermission('admin')) permissions.push('admin');

    return {
      uid: user.uid,
      email: user.email,
      isAnonymous: user.isAnonymous,
      isAuthenticated: true,
      permissions
    };
  }

  /**
   * Cleanup on app unmount
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.clearSessionManagement();
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();

/**
 * Hook for using auth manager
 */
export function useAuthManager() {
  return {
    signOut: () => authManager.signOut(),
    hasPermission: (permission: string) => authManager.hasPermission(permission),
    getCurrentUserInfo: () => authManager.getCurrentUserInfo()
  };
}

/**
 * Security utilities
 */
export const authSecurity = {
  /**
   * Validate user session
   */
  validateSession(): boolean {
    const user = useAuthStore.getState().user;
    return !!user;
  },

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return authManager.hasPermission('admin');
  },

  /**
   * Get secure headers for API calls
   */
  async getSecureHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'x-user-id': user.uid,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw new Error('Failed to get authentication token');
    }
  }
};
