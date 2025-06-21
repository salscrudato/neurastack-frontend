import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { FitnessProfile, WorkoutPlan } from '../lib/types';
import {
    loadFitnessProfile,
    saveFitnessProfile,
    subscribeFitnessProfile,
    updateFitnessLevel as updateFitnessLevelFirestore
} from '../services/fitnessDataService';

interface FitnessState {
  // Profile state
  profile: FitnessProfile;

  // Onboarding state
  currentStep: number;
  totalSteps: number;
  isEditingFromDashboard: boolean; // Track if user is editing from dashboard

  // Current workout only (backend handles history)
  currentWorkout: WorkoutPlan | null;

  // Legacy workout plans for backward compatibility (deprecated - use backend API)
  workoutPlans?: WorkoutPlan[];

  // Loading states
  isLoading: boolean;
  isProfileLoaded: boolean;

  // Actions
  updateProfile: (updates: Partial<FitnessProfile>) => void;
  updateFitnessLevel: (level: 'beginner' | 'intermediate' | 'advanced', code: 'B' | 'I' | 'A') => void;
  updateGoals: (goals: string[]) => Promise<void>;
  toggleGoal: (goalCode: string) => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Navigation actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  startEditingFromDashboard: (step: number) => void;
  finishEditingFromDashboard: () => void;

  // Workout actions (simplified - backend handles history)
  setCurrentWorkout: (workout: WorkoutPlan | null) => void;

  // Firestore sync actions (simplified)
  loadProfileFromFirestore: () => Promise<void>;
  syncToFirestore: () => Promise<void>;
  subscribeToFirestore: () => () => void;
}

const defaultProfile: FitnessProfile = {
  fitnessLevel: 'beginner',
  goals: [],
  equipment: [],
  availableTime: 30,
  workoutDays: [],
  timeAvailability: {
    daysPerWeek: 3,
    minutesPerSession: 30,
  },
  completedOnboarding: false,
  // Enhanced fields for workout API integration
  age: undefined, // Primary field for API integration
  weight: undefined, // Primary field for API integration
  gender: undefined,
  injuries: [],

  // Legacy category fields (kept for backward compatibility)
  ageCategory: undefined, // Legacy category-based age field
  weightCategory: undefined, // Legacy category-based weight field
};

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: defaultProfile,
      currentStep: 0,
      totalSteps: 6, // Updated to include PersonalInfo and Injuries steps
      isEditingFromDashboard: false,
      currentWorkout: null,
      workoutPlans: [], // Legacy property for backward compatibility
      isLoading: false,
      isProfileLoaded: false,

      // Profile actions with Firestore sync
      updateProfile: async (updates) => {
        const newProfile = { ...get().profile, ...updates };

        // Update local state immediately
        set(() => ({
          profile: newProfile
        }));

        // Sync to Firestore
        try {
          await saveFitnessProfile(newProfile);
        } catch (error) {
          console.warn('Failed to sync profile to Firestore:', error);
        }
      },

      // Enhanced fitness level update with Firestore sync
      updateFitnessLevel: async (level, code) => {
        const newProfile = {
          ...get().profile,
          fitnessLevel: level,
          fitnessLevelCode: code
        };

        // Update local state immediately
        set(() => ({
          profile: newProfile
        }));

        // Sync to Firestore
        try {
          await updateFitnessLevelFirestore(level, code);
        } catch (error) {
          console.warn('Failed to sync fitness level to Firestore:', error);
        }
      },

      // Enhanced goals update with Firestore sync
      updateGoals: async (goals) => {
        const newProfile = {
          ...get().profile,
          goals
        };

        // Update local state immediately
        set(() => ({
          profile: newProfile
        }));

        // Sync to Firestore
        try {
          await saveFitnessProfile(newProfile);
        } catch (error) {
          console.warn('Failed to sync goals to Firestore:', error);
        }
      },

      // Toggle individual goal with Firestore sync
      toggleGoal: async (goalCode) => {
        const currentGoals = get().profile.goals || [];
        const isSelected = currentGoals.includes(goalCode);

        let newGoals;
        if (isSelected) {
          newGoals = currentGoals.filter(goal => goal !== goalCode);
        } else {
          newGoals = [...currentGoals, goalCode];
        }

        const newProfile = {
          ...get().profile,
          goals: newGoals
        };

        // Update local state immediately
        set(() => ({
          profile: newProfile
        }));

        // Sync to Firestore
        try {
          await saveFitnessProfile(newProfile);
        } catch (error) {
          console.warn('Failed to sync goal toggle to Firestore:', error);
        }
      },

      completeOnboarding: () => {
        set(state => ({
          profile: { ...state.profile, completedOnboarding: true },
          currentStep: 0
        }));
      },

      resetOnboarding: () => {
        set({
          profile: { ...defaultProfile, completedOnboarding: false },
          currentStep: 0
        });
      },

      // Navigation actions
      nextStep: () => {
        set(state => ({
          currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
        }));
      },

      prevStep: () => {
        set(state => ({
          currentStep: Math.max(state.currentStep - 1, 0)
        }));
      },

      goToStep: (step) => {
        const { totalSteps } = get();
        set({
          currentStep: Math.max(0, Math.min(step, totalSteps - 1))
        });
      },

      startEditingFromDashboard: (step) => {
        const { totalSteps } = get();
        set({
          currentStep: Math.max(0, Math.min(step, totalSteps - 1)),
          isEditingFromDashboard: true
        });
      },

      finishEditingFromDashboard: () => {
        set({
          isEditingFromDashboard: false,
          currentStep: 0
        });
      },

      // Workout actions (simplified - backend handles persistence)
      setCurrentWorkout: (workout) => {
        set({ currentWorkout: workout });
      },

      // Firestore sync actions
      loadProfileFromFirestore: async () => {
        set({ isLoading: true });

        try {
          const profile = await loadFitnessProfile();
          if (profile) {
            set({
              profile,
              isProfileLoaded: true,
              isLoading: false
            });
          } else {
            set({
              isProfileLoaded: true,
              isLoading: false
            });
          }
        } catch (error) {
          console.warn('Failed to load profile from Firestore:', error);
          set({
            isLoading: false,
            isProfileLoaded: true
          });
        }
      },

      syncToFirestore: async () => {
        const { profile } = get();

        try {
          // Sync profile only (backend handles workout data)
          await saveFitnessProfile(profile);
          console.log('✅ Profile synced to Firestore');
        } catch (error) {
          console.warn('Failed to sync profile to Firestore:', error);
        }
      },

      subscribeToFirestore: () => {
        return subscribeFitnessProfile((profile) => {
          if (profile) {
            set({ profile, isProfileLoaded: true });
          }
        });
      },
    }),
    {
      name: 'neurafit-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        // Only store profile - backend handles workout data
      }),
    }
  )
);
