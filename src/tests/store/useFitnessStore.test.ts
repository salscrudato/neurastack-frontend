import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFitnessStore } from '../../store/useFitnessStore';

// Mock the Firestore service
vi.mock('../../services/fitnessDataService', () => ({
  saveFitnessProfile: vi.fn().mockResolvedValue(undefined),
  loadFitnessProfile: vi.fn().mockResolvedValue(null),
  updateFitnessLevel: vi.fn().mockResolvedValue(undefined),
  saveWorkoutPlan: vi.fn().mockResolvedValue(undefined),
  loadWorkoutPlans: vi.fn().mockResolvedValue([]),
  subscribeFitnessProfile: vi.fn().mockReturnValue(() => {}),
  trackFitnessLevelSelection: vi.fn()
}));
import type { WorkoutPlan } from '../../lib/types';

describe('useFitnessStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useFitnessStore.getState();
    store.resetOnboarding();
    // Clear workout plans
    useFitnessStore.setState({ workoutPlans: [] });
  });

  it('initializes with default profile', () => {
    const state = useFitnessStore.getState();
    
    expect(state.profile.fitnessLevel).toBe('beginner');
    expect(state.profile.goals).toEqual([]);
    expect(state.profile.equipment).toEqual([]);
    expect(state.profile.completedOnboarding).toBe(false);
    expect(state.currentStep).toBe(0);
    expect(state.totalSteps).toBe(4);
  });

  it('updates profile correctly', () => {
    const store = useFitnessStore.getState();

    store.updateProfile({
      fitnessLevel: 'intermediate',
      goals: ['weight_loss', 'muscle_gain'],
      equipment: ['dumbbells', 'resistance_bands'],
    });

    const updatedState = useFitnessStore.getState();
    expect(updatedState.profile.fitnessLevel).toBe('intermediate');
    expect(updatedState.profile.goals).toEqual(['weight_loss', 'muscle_gain']);
    expect(updatedState.profile.equipment).toEqual(['dumbbells', 'resistance_bands']);
  });

  it('updates fitness level with token-efficient codes', async () => {
    const store = useFitnessStore.getState();

    // Test beginner level
    await store.updateFitnessLevel('beginner', 'B');
    let state = useFitnessStore.getState();
    expect(state.profile.fitnessLevel).toBe('beginner');
    expect(state.profile.fitnessLevelCode).toBe('B');

    // Test intermediate level
    await store.updateFitnessLevel('intermediate', 'I');
    state = useFitnessStore.getState();
    expect(state.profile.fitnessLevel).toBe('intermediate');
    expect(state.profile.fitnessLevelCode).toBe('I');

    // Test advanced level
    await store.updateFitnessLevel('advanced', 'A');
    state = useFitnessStore.getState();
    expect(state.profile.fitnessLevel).toBe('advanced');
    expect(state.profile.fitnessLevelCode).toBe('A');
  });

  it('navigates through onboarding steps correctly', () => {
    const store = useFitnessStore.getState();
    
    // Test next step
    store.nextStep();
    expect(useFitnessStore.getState().currentStep).toBe(1);
    
    store.nextStep();
    expect(useFitnessStore.getState().currentStep).toBe(2);
    
    // Test previous step
    store.prevStep();
    expect(useFitnessStore.getState().currentStep).toBe(1);
    
    // Test go to specific step
    store.goToStep(3);
    expect(useFitnessStore.getState().currentStep).toBe(3);
  });

  it('prevents navigation beyond step boundaries', () => {
    const store = useFitnessStore.getState();
    
    // Try to go before first step
    store.prevStep();
    expect(useFitnessStore.getState().currentStep).toBe(0);
    
    // Go to last step and try to go beyond
    store.goToStep(3);
    store.nextStep();
    expect(useFitnessStore.getState().currentStep).toBe(3);
    
    // Try to go to invalid step
    store.goToStep(10);
    expect(useFitnessStore.getState().currentStep).toBe(3);
    
    store.goToStep(-1);
    expect(useFitnessStore.getState().currentStep).toBe(0);
  });

  it('completes onboarding correctly', () => {
    const store = useFitnessStore.getState();
    
    store.completeOnboarding();
    
    const state = useFitnessStore.getState();
    expect(state.profile.completedOnboarding).toBe(true);
    expect(state.currentStep).toBe(0);
  });

  it('resets onboarding correctly', () => {
    const store = useFitnessStore.getState();
    
    // Complete onboarding and update profile
    store.updateProfile({ fitnessLevel: 'advanced' });
    store.completeOnboarding();
    store.goToStep(2);
    
    // Reset onboarding
    store.resetOnboarding();
    
    const state = useFitnessStore.getState();
    expect(state.profile.completedOnboarding).toBe(false);
    expect(state.profile.fitnessLevel).toBe('beginner');
    expect(state.currentStep).toBe(0);
  });

  it('manages workout plans correctly', () => {
    const store = useFitnessStore.getState();
    
    const mockWorkout: WorkoutPlan = {
      id: '1',
      name: 'Test Workout',
      duration: 30,
      difficulty: 'beginner',
      exercises: [],
      createdAt: new Date(),
      completedAt: null,
    };
    
    // Add workout plan
    store.addWorkoutPlan(mockWorkout);
    
    const state = useFitnessStore.getState();
    expect(state.workoutPlans).toHaveLength(1);
    expect(state.workoutPlans[0]).toEqual(mockWorkout);
    
    // Set current workout
    store.setCurrentWorkout(mockWorkout);
    expect(useFitnessStore.getState().currentWorkout).toEqual(mockWorkout);
    
    // Clear current workout
    store.setCurrentWorkout(null);
    expect(useFitnessStore.getState().currentWorkout).toBeNull();
  });

  it('adds multiple workout plans correctly', () => {
    const store = useFitnessStore.getState();
    
    const workout1: WorkoutPlan = {
      id: '1',
      name: 'Workout 1',
      duration: 30,
      difficulty: 'beginner',
      exercises: [],
      createdAt: new Date(),
      completedAt: null,
    };
    
    const workout2: WorkoutPlan = {
      id: '2',
      name: 'Workout 2',
      duration: 45,
      difficulty: 'intermediate',
      exercises: [],
      createdAt: new Date(),
      completedAt: new Date(),
    };
    
    store.addWorkoutPlan(workout1);
    store.addWorkoutPlan(workout2);
    
    const state = useFitnessStore.getState();
    expect(state.workoutPlans).toHaveLength(2);
    expect(state.workoutPlans[0]).toEqual(workout1);
    expect(state.workoutPlans[1]).toEqual(workout2);
  });

  it('preserves workout plans when resetting onboarding', () => {
    const store = useFitnessStore.getState();
    
    const mockWorkout: WorkoutPlan = {
      id: '1',
      name: 'Test Workout',
      duration: 30,
      difficulty: 'beginner',
      exercises: [],
      createdAt: new Date(),
      completedAt: null,
    };
    
    store.addWorkoutPlan(mockWorkout);
    store.resetOnboarding();
    
    // Workout plans should be preserved
    const state = useFitnessStore.getState();
    expect(state.workoutPlans).toHaveLength(1);
    expect(state.workoutPlans[0]).toEqual(mockWorkout);
  });
});
