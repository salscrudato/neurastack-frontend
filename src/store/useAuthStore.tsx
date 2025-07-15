import type { User as FirebaseUser } from 'firebase/auth';
import { create } from 'zustand';

interface AuthState {
  user: FirebaseUser | null;
  isLoading: boolean;
  setUser: (u: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));