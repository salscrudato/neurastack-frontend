/**
 * Authentication Store
 *
 * Global state management for user authentication using Zustand.
 * This store keeps track of the currently logged-in user throughout the app.
 *
 * Used by components to:
 * - Check if a user is logged in
 * - Get user information (name, email, photo)
 * - Update user state when login/logout happens
 */

import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';

/**
 * Authentication State Interface
 */
interface AuthState {
  user: FirebaseUser | null;  // Current user object from Firebase, or null if not logged in
  setUser: (u: FirebaseUser | null) => void;  // Function to update the user state
}

/**
 * Authentication Store
 *
 * Creates a Zustand store for managing authentication state.
 * This is a simple store that just holds the current user and provides a way to update it.
 */
export const useAuthStore = create<AuthState>(set => ({
  user: null,  // Initially no user is logged in
  setUser: user => set({ user }),  // Update the user state when called
}));