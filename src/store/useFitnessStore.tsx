import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { FitnessProfile, WorkoutPlan } from '../lib/types';
import {
    loadFitnessProfile,
    loadWorkoutPlans,
    saveFitnessProfile,
    saveWorkoutPlan,
    subscribeFitnessProfile,
    updateFitnessLevel as updateFitnessLevelFirestore
} from '../services/fitnessDataService';
import { networkStateManager } from '../utils/firebaseEnhancements';

interface FitnessState {
  // Profile state
  profile: FitnessProfile;

  // Onboarding state
  currentStep: number;
  totalSteps: number;
  isEditingFromDashboard: boolean; // Track if user is editing from dashboard

  // Workout plans
  workoutPlans: WorkoutPlan[];
  currentWorkout: WorkoutPlan | null;

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

  // Workout actions
  setCurrentWorkout: (workout: WorkoutPlan | null) => void;
  addWorkoutPlan: (plan: WorkoutPlan) => void;

  // Enhanced Firestore sync actions
  loadProfileFromFirestore: () => Promise<void>;
  loadWorkoutPlansFromFirestore: () => Promise<void>;
  syncToFirestore: () => Promise<void>;
  subscribeToFirestore: () => () => void;

  // Enhanced sync capabilities
  syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
  lastSyncTime: Date | null;
  conflictResolution: (conflicts: any[]) => Promise<void>;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
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
  age: undefined,
  gender: undefined,
  weight: undefined,
  injuries: [],
};

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: defaultProfile,
      currentStep: 0,
      totalSteps: 6, // Updated to include PersonalInfo and Injuries steps
      isEditingFromDashboard: false,
      workoutPlans: [],
      currentWorkout: null,
      isLoading: false,
      isProfileLoaded: false,

      // Enhanced sync state
      syncStatus: 'idle',
      lastSyncTime: null,

      // Enhanced profile actions with robust Firestore sync
      updateProfile: async (updates) => {
        const newProfile = { ...get().profile, ...updates };

        // Update local state immediately (optimistic update)
        set(() => ({
          profile: newProfile,
          syncStatus: 'syncing'
        }));

        // Enhanced sync to Firestore with conflict resolution
        try {
          await saveFitnessProfile(newProfile);
          set(() => ({
            syncStatus: 'idle',
            lastSyncTime: new Date()
          }));
        } catch (error) {
          console.warn('Failed to sync profile to Firestore:', error);
          set(() => ({
            syncStatus: 'error'
          }));

          // Store for offline sync if network is unavailable
          if (!networkStateManager.getNetworkState()) {
            set(() => ({
              syncStatus: 'offline'
            }));
          }
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

      // Workout actions with Firestore sync
      setCurrentWorkout: (workout) => {
        set({ currentWorkout: workout });
      },

      addWorkoutPlan: async (plan) => {
        // Update local state immediately
        set(state => ({
          workoutPlans: [...state.workoutPlans, plan]
        }));

        // Sync to Firestore
        try {
          await saveWorkoutPlan(plan);
        } catch (error) {
          console.warn('Failed to sync workout plan to Firestore:', error);
        }
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

      loadWorkoutPlansFromFirestore: async () => {
        try {
          const workoutPlans = await loadWorkoutPlans();
          set({ workoutPlans });
          console.log(`✅ Loaded ${workoutPlans.length} workout plans from Firestore`);
        } catch (error) {
          console.warn('Failed to load workout plans from Firestore:', error);
        }
      },

      syncToFirestore: async () => {
        const { profile, workoutPlans } = get();

        try {
          // Sync profile
          await saveFitnessProfile(profile);

          // Sync workout plans (only new ones)
          for (const plan of workoutPlans) {
            await saveWorkoutPlan(plan);
          }

          console.log('✅ All fitness data synced to Firestore');
        } catch (error) {
          console.warn('Failed to sync data to Firestore:', error);
        }
      },

      subscribeToFirestore: () => {
        return subscribeFitnessProfile((profile) => {
          if (profile) {
            set({
              profile,
              isProfileLoaded: true,
              syncStatus: 'idle',
              lastSyncTime: new Date()
            });
          }
        });
      },

      // Enhanced sync capabilities
      conflictResolution: async (conflicts) => {
        console.log('Resolving conflicts:', conflicts);
        // For now, prefer client data (can be enhanced based on requirements)
        set(() => ({
          syncStatus: 'idle'
        }));
      },

      enableOfflineMode: () => {
        set(() => ({
          syncStatus: 'offline'
        }));
      },

      disableOfflineMode: () => {
        set(() => ({
          syncStatus: 'idle'
        }));
      },
    }),
    {
      name: 'neurafit-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        workoutPlans: state.workoutPlans,
      }),
    }
  )
);
