/**
 * Fitness Store Tests
 * 
 * Tests the fitness store functionality including profile management,
 * workout plans, Firestore synchronization, and offline handling.
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FitnessProfile, WorkoutPlan } from '../lib/types';
import { useFitnessStore } from '../store/useFitnessStore';

// Mock the fitness data service
vi.mock('../services/fitnessDataService', () => ({
  loadFitnessProfile: vi.fn(),
  loadWorkoutPlans: vi.fn(),
  saveFitnessProfile: vi.fn(),
  saveWorkoutPlan: vi.fn(),
  subscribeFitnessProfile: vi.fn(),
  updateFitnessLevel: vi.fn(),
}));

// Mock the network state manager
vi.mock('../utils/firebaseEnhancements', () => ({
  networkStateManager: {
    getNetworkState: vi.fn(() => true),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
}));

describe('Fitness Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store state
    useFitnessStore.setState({
      profile: {
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
        age: undefined,
        gender: undefined,
        weight: undefined,
        injuries: [],
      },
      currentStep: 0,
      totalSteps: 6,
      isEditingFromDashboard: false,
      workoutPlans: [],
      currentWorkout: null,
      isLoading: false,
      isProfileLoaded: false,
      syncStatus: 'idle',
      lastSyncTime: null,
    });
  });

  describe('Profile Management', () => {
    it('should update profile correctly', async () => {
      const { result } = renderHook(() => useFitnessStore());

      await act(async () => {
        result.current.updateProfile({
          age: 25,
          gender: 'male',
          weight: 70,
        });
      });

      expect(result.current.profile.age).toBe(25);
      expect(result.current.profile.gender).toBe('male');
      expect(result.current.profile.weight).toBe(70);
      expect(result.current.syncStatus).toBe('syncing');
    });

    it('should update fitness level correctly', async () => {
      const { result } = renderHook(() => useFitnessStore());

      await act(async () => {
        result.current.updateFitnessLevel('intermediate', 'I');
      });

      expect(result.current.profile.fitnessLevel).toBe('intermediate');
      expect(result.current.profile.fitnessLevelCode).toBe('I');
    });

    it('should update goals correctly', async () => {
      const { result } = renderHook(() => useFitnessStore());

      await act(async () => {
        result.current.updateGoals(['weight-loss', 'muscle-gain']);
      });

      expect(result.current.profile.goals).toEqual(['weight-loss', 'muscle-gain']);
    });

    it('should toggle goals correctly', async () => {
      const { result } = renderHook(() => useFitnessStore());

      // Add a goal
      await act(async () => {
        result.current.toggleGoal('weight-loss');
      });

      expect(result.current.profile.goals).toContain('weight-loss');

      // Remove the goal
      await act(async () => {
        result.current.toggleGoal('weight-loss');
      });

      expect(result.current.profile.goals).not.toContain('weight-loss');
    });

    it('should complete onboarding correctly', () => {
      const { result } = renderHook(() => useFitnessStore());

      act(() => {
        result.current.completeOnboarding();
      });

      expect(result.current.profile.completedOnboarding).toBe(true);
      expect(result.current.currentStep).toBe(0);
    });

    it('should reset onboarding correctly', () => {
      const { result } = renderHook(() => useFitnessStore());

      // First complete onboarding
      act(() => {
        result.current.completeOnboarding();
      });

      // Then reset
      act(() => {
        result.current.resetOnboarding();
      });

      expect(result.current.profile.completedOnboarding).toBe(false);
      expect(result.current.currentStep).toBe(0);
    });
  });

  describe('Navigation', () => {
    it('should navigate to next step correctly', () => {
      const { result } = renderHook(() => useFitnessStore());

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should navigate to previous step correctly', () => {
      const { result } = renderHook(() => useFitnessStore());

      // Go to step 2 first
      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.currentStep).toBe(2);

      // Then go back
      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not go beyond step boundaries', () => {
      const { result } = renderHook(() => useFitnessStore());

      // Try to go beyond last step
      act(() => {
        result.current.goToStep(10);
      });

      expect(result.current.currentStep).toBe(5); // totalSteps - 1

      // Try to go before first step
      act(() => {
        result.current.goToStep(-1);
      });

      expect(result.current.currentStep).toBe(0);
    });

    it('should handle dashboard editing mode correctly', () => {
      const { result } = renderHook(() => useFitnessStore());

      act(() => {
        result.current.startEditingFromDashboard(2);
      });

      expect(result.current.isEditingFromDashboard).toBe(true);
      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.finishEditingFromDashboard();
      });

      expect(result.current.isEditingFromDashboard).toBe(false);
      expect(result.current.currentStep).toBe(0);
    });
  });

  describe('Workout Management', () => {
    it('should set current workout correctly', () => {
      const { result } = renderHook(() => useFitnessStore());
      const mockWorkout: WorkoutPlan = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [],
        duration: 30,
        difficulty: 'beginner',
        focusAreas: ['strength'],
        workoutType: 'strength',
        createdAt: new Date(),
        completedAt: null,
      };

      act(() => {
        result.current.setCurrentWorkout(mockWorkout);
      });

      expect(result.current.currentWorkout).toEqual(mockWorkout);
    });

    it('should add workout plan correctly', async () => {
      const { result } = renderHook(() => useFitnessStore());
      const mockWorkout: WorkoutPlan = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [],
        duration: 30,
        difficulty: 'beginner',
        focusAreas: ['strength'],
        workoutType: 'strength',
        createdAt: new Date(),
        completedAt: null,
      };

      await act(async () => {
        result.current.addWorkoutPlan(mockWorkout);
      });

      expect(result.current.workoutPlans).toContain(mockWorkout);
    });
  });

  describe('Sync Status Management', () => {
    it('should handle sync status changes correctly', () => {
      const { result } = renderHook(() => useFitnessStore());

      act(() => {
        result.current.enableOfflineMode();
      });

      expect(result.current.syncStatus).toBe('offline');

      act(() => {
        result.current.disableOfflineMode();
      });

      expect(result.current.syncStatus).toBe('idle');
    });

    it('should handle conflict resolution', async () => {
      const { result } = renderHook(() => useFitnessStore());
      const mockConflicts = [{ field: 'age', clientValue: 25, serverValue: 26 }];

      await act(async () => {
        result.current.conflictResolution(mockConflicts);
      });

      expect(result.current.syncStatus).toBe('idle');
    });
  });

  describe('Firestore Integration', () => {
    it('should load profile from Firestore correctly', async () => {
      const { loadFitnessProfile } = await import('../services/fitnessDataService');
      const mockProfile: FitnessProfile = {
        fitnessLevel: 'intermediate',
        goals: ['muscle-gain'],
        equipment: ['dumbbells'],
        availableTime: 45,
        workoutDays: ['monday', 'wednesday', 'friday'],
        timeAvailability: {
          daysPerWeek: 3,
          minutesPerSession: 45,
        },
        completedOnboarding: true,
        age: 25,
        gender: 'male',
        weight: 70,
        injuries: [],
      };

      vi.mocked(loadFitnessProfile).mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useFitnessStore());

      await act(async () => {
        await result.current.loadProfileFromFirestore();
      });

      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.isProfileLoaded).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle Firestore load errors gracefully', async () => {
      const { loadFitnessProfile } = await import('../services/fitnessDataService');
      vi.mocked(loadFitnessProfile).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useFitnessStore());

      await act(async () => {
        await result.current.loadProfileFromFirestore();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isProfileLoaded).toBe(true);
    });
  });
});
