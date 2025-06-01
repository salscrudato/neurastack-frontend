import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FitnessProfile, WorkoutPlan } from '../lib/types';

interface FitnessState {
  // Profile state
  profile: FitnessProfile;
  
  // Onboarding state
  currentStep: number;
  totalSteps: number;
  
  // Workout plans
  workoutPlans: WorkoutPlan[];
  currentWorkout: WorkoutPlan | null;
  
  // Actions
  updateProfile: (updates: Partial<FitnessProfile>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Navigation actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Workout actions
  setCurrentWorkout: (workout: WorkoutPlan | null) => void;
  addWorkoutPlan: (plan: WorkoutPlan) => void;
}

const defaultProfile: FitnessProfile = {
  fitnessLevel: 'beginner',
  goals: [],
  equipment: [],
  timeAvailability: {
    daysPerWeek: 3,
    minutesPerSession: 30,
  },
  completedOnboarding: false,
};

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: defaultProfile,
      currentStep: 0,
      totalSteps: 4,
      workoutPlans: [],
      currentWorkout: null,

      // Profile actions
      updateProfile: (updates) => {
        set(state => ({
          profile: { ...state.profile, ...updates }
        }));
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

      // Workout actions
      setCurrentWorkout: (workout) => {
        set({ currentWorkout: workout });
      },

      addWorkoutPlan: (plan) => {
        set(state => ({
          workoutPlans: [...state.workoutPlans, plan]
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
