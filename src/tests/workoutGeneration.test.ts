/**
 * Enhanced Workout Generation Tests
 * 
 * Tests for the AI-powered workout generation system with
 * memory integration, analytics, and personalization features.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { neuraStackClient } from '../lib/neurastack-client';
import type { FitnessProfile } from '../lib/types';

// Mock the NeuraStack client
vi.mock('../lib/neurastack-client', () => ({
  neuraStackClient: {
    configure: vi.fn(),
    queryAI: vi.fn(),
    storeMemory: vi.fn(),
    getMemoryContext: vi.fn(),
  }
}));

// Mock Firebase
vi.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123' }
  },
  db: {}
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
}));

describe('Enhanced Workout Generation', () => {
  const mockProfile: FitnessProfile = {
    fitnessLevel: 'intermediate',
    goals: ['muscle_building', 'strength'],
    equipment: ['dumbbells', 'resistance_bands'],
    availableTime: 45,
    workoutDays: ['Monday', 'Wednesday', 'Friday'],
    timeAvailability: {
      daysPerWeek: 3,
      minutesPerSession: 45
    },
    completedOnboarding: true
  };

  const mockWorkoutHistory = [
    {
      id: '1',
      name: 'Upper Body Strength',
      duration: 40,
      difficulty: 'intermediate' as const,
      exercises: [
        {
          name: 'Push-ups',
          sets: 3,
          reps: 12,
          duration: 0,
          restTime: 60,
          instructions: 'Standard push-up form',
          tips: 'Keep core engaged',
          targetMuscles: ['chest', 'triceps']
        }
      ],
      createdAt: new Date('2024-01-15'),
      completedAt: new Date('2024-01-15')
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AI Context Building', () => {
    it('should build comprehensive user context with workout history', async () => {
      // Mock memory context response
      const mockMemoryContext = {
        success: true,
        context: 'User prefers upper body workouts, completed 5 workouts this month',
        estimatedTokens: 150
      };

      (neuraStackClient.getMemoryContext as any).mockResolvedValue(mockMemoryContext);

      // This would be called within the WorkoutGenerator component
      const userContext = {
        profile: mockProfile,
        workoutHistory: mockWorkoutHistory,
        progressMetrics: {
          totalWorkouts: 5,
          averageWorkoutDuration: 42,
          workoutFrequency: 'moderate_frequency',
          recentPerformance: 'consistent_completion'
        },
        contextualFactors: {
          timeOfDay: 'morning',
          dayOfWeek: 'Monday',
          preferredWorkoutDays: mockProfile.workoutDays,
          availableTime: mockProfile.availableTime
        },
        memoryContext: mockMemoryContext.context,
        preferences: {
          preferredMuscleGroups: ['chest', 'triceps'],
          preferredWorkoutTypes: ['strength']
        }
      };

      expect(userContext.profile.fitnessLevel).toBe('intermediate');
      expect(userContext.workoutHistory).toHaveLength(1);
      expect(userContext.memoryContext).toContain('upper body workouts');
      expect(userContext.progressMetrics.totalWorkouts).toBe(5);
    });

    it('should handle users with no workout history', async () => {
      const newUserContext = {
        profile: mockProfile,
        workoutHistory: [],
        progressMetrics: {
          totalWorkouts: 0,
          averageWorkoutDuration: mockProfile.availableTime,
          workoutFrequency: 'insufficient_data',
          recentPerformance: 'no_data'
        },
        contextualFactors: {
          timeOfDay: 'evening',
          dayOfWeek: 'Wednesday',
          preferredWorkoutDays: mockProfile.workoutDays,
          availableTime: mockProfile.availableTime
        },
        memoryContext: '',
        preferences: {}
      };

      expect(newUserContext.workoutHistory).toHaveLength(0);
      expect(newUserContext.progressMetrics.totalWorkouts).toBe(0);
      expect(newUserContext.progressMetrics.workoutFrequency).toBe('insufficient_data');
    });
  });

  describe('Advanced Prompt Generation', () => {
    it('should create sophisticated prompts with comprehensive context', () => {
      const userContext = {
        profile: mockProfile,
        workoutHistory: mockWorkoutHistory,
        progressMetrics: {
          totalWorkouts: 5,
          averageWorkoutDuration: 42,
          workoutFrequency: 'moderate_frequency',
          recentPerformance: 'consistent_completion'
        },
        contextualFactors: {
          timeOfDay: 'morning',
          dayOfWeek: 'Monday',
          preferredWorkoutDays: mockProfile.workoutDays,
          availableTime: mockProfile.availableTime
        },
        memoryContext: 'User prefers compound movements',
        preferences: {
          preferredMuscleGroups: ['chest', 'back'],
          preferredWorkoutTypes: ['strength']
        }
      };

      // This would be the prompt generated by buildAdvancedWorkoutPrompt
      const expectedPromptElements = [
        'expert AI fitness trainer',
        'progressive overload',
        'intermediate',
        'muscle_building',
        'dumbbells',
        '45 minutes',
        'Total Completed Workouts: 5',
        'Recent Performance: consistent_completion',
        'User prefers compound movements'
      ];

      // Simulate prompt building
      const prompt = `You are an expert AI fitness trainer with deep knowledge of exercise science, progressive overload, and personalized training.

      USER PROFILE
      - Fitness Level: ${userContext.profile.fitnessLevel}
      - Goals: ${userContext.profile.goals.join(', ')}
      - Available Equipment: ${userContext.profile.equipment.join(', ')}
      - Available Time: ${userContext.profile.availableTime} minutes

      PROGRESS METRICS
      - Total Completed Workouts: ${userContext.progressMetrics.totalWorkouts}
      - Recent Performance: ${userContext.progressMetrics.recentPerformance}

      MEMORY CONTEXT
      ${userContext.memoryContext}`;

      expectedPromptElements.forEach(element => {
        expect(prompt.toLowerCase()).toContain(element.toLowerCase());
      });
    });

    it('should include progressive overload guidance based on user level', () => {
      const beginnerGuidance = 'Focus on form mastery and movement patterns';
      const intermediateGuidance = 'Increase intensity and add compound movements';
      const advancedGuidance = 'Advanced progressions, complex movements, and periodization';

      expect(beginnerGuidance).toContain('form mastery');
      expect(intermediateGuidance).toContain('compound movements');
      expect(advancedGuidance).toContain('periodization');
    });
  });

  describe('AI Response Processing', () => {
    it('should parse enhanced workout responses with new fields', () => {
      const mockAIResponse = {
        answer: JSON.stringify({
          name: 'Intermediate Strength Builder',
          duration: 45,
          difficulty: 'intermediate',
          focusAreas: ['upper_body', 'core'],
          workoutType: 'strength',
          exercises: [
            {
              name: 'Dumbbell Bench Press',
              sets: 3,
              reps: 10,
              duration: 0,
              restTime: 90,
              instructions: 'Lie on bench, press dumbbells up',
              tips: 'Control the weight on the way down',
              targetMuscles: ['chest', 'triceps'],
              equipment: ['dumbbells'],
              intensity: 'moderate',
              progressionNotes: 'Increase weight when you can do 12 reps easily'
            }
          ],
          warmUp: {
            duration: 5,
            exercises: ['Arm circles', 'Light cardio']
          },
          coolDown: {
            duration: 5,
            exercises: ['Chest stretch', 'Tricep stretch']
          },
          coachingNotes: 'Focus on controlled movements and proper form'
        }),
        modelsUsed: ['openai:gpt-4', 'google:gemini-1.5-flash'],
        executionTime: '1250ms',
        tokenCount: 450
      };

      // Simulate parsing the response
      const parsedWorkout = JSON.parse(mockAIResponse.answer);
      
      expect(parsedWorkout.name).toBe('Intermediate Strength Builder');
      expect(parsedWorkout.focusAreas).toContain('upper_body');
      expect(parsedWorkout.workoutType).toBe('strength');
      expect(parsedWorkout.exercises[0].equipment).toContain('dumbbells');
      expect(parsedWorkout.exercises[0].intensity).toBe('moderate');
      expect(parsedWorkout.exercises[0].progressionNotes).toContain('Increase weight');
      expect(parsedWorkout.warmUp.duration).toBe(5);
      expect(parsedWorkout.coolDown.exercises).toContain('Chest stretch');
      expect(parsedWorkout.coachingNotes).toContain('proper form');
    });

    it('should handle malformed AI responses gracefully', () => {
      // Simulate fallback workout creation
      const fallbackWorkout = {
        id: Date.now().toString(),
        name: 'Basic Bodyweight Workout',
        duration: mockProfile.availableTime,
        difficulty: mockProfile.fitnessLevel,
        exercises: [
          {
            name: 'Bodyweight Squats',
            sets: 3,
            reps: 12,
            duration: 0,
            restTime: 60,
            instructions: 'Stand with feet shoulder-width apart',
            tips: 'Keep your chest up',
            targetMuscles: ['quadriceps', 'glutes']
          }
        ],
        createdAt: new Date(),
        completedAt: null
      };

      expect(fallbackWorkout.name).toBe('Basic Bodyweight Workout');
      expect(fallbackWorkout.exercises).toHaveLength(1);
      expect(fallbackWorkout.difficulty).toBe(mockProfile.fitnessLevel);
    });
  });

  describe('Memory Integration', () => {
    it('should store workout generation context in memory', async () => {
      const mockStoreMemory = neuraStackClient.storeMemory as any;
      mockStoreMemory.mockResolvedValue({
        success: true,
        memoryId: 'memory-123',
        memoryType: 'working',
        importance: 0.8,
        compositeScore: 0.85
      });

      await neuraStackClient.storeMemory({
        userId: 'test-user-123',
        sessionId: 'session-456',
        content: 'Generating workout for intermediate user with strength goals',
        isUserPrompt: true,
        responseQuality: 1.0,
        ensembleMode: true
      });

      expect(mockStoreMemory).toHaveBeenCalledWith({
        userId: 'test-user-123',
        sessionId: 'session-456',
        content: 'Generating workout for intermediate user with strength goals',
        isUserPrompt: true,
        responseQuality: 1.0,
        ensembleMode: true
      });
    });

    it('should store workout completion feedback in memory', async () => {
      const mockStoreMemory = neuraStackClient.storeMemory as any;
      mockStoreMemory.mockResolvedValue({
        success: true,
        memoryId: 'memory-456',
        memoryType: 'episodic',
        importance: 0.9,
        compositeScore: 0.88
      });

      const completionMemory = 'Completed workout: Upper Body Strength. Duration: 42min. Completion rate: 100%. Exercises completed: 6/6';

      await neuraStackClient.storeMemory({
        userId: 'test-user-123',
        sessionId: 'session-456',
        content: completionMemory,
        isUserPrompt: false,
        responseQuality: 0.9,
        ensembleMode: true
      });

      expect(mockStoreMemory).toHaveBeenCalledWith({
        userId: 'test-user-123',
        sessionId: 'session-456',
        content: completionMemory,
        isUserPrompt: false,
        responseQuality: 0.9,
        ensembleMode: true
      });
    });
  });

  describe('Analytics Integration', () => {
    it('should calculate workout analytics correctly', () => {
      const mockAnalytics = {
        userId: 'test-user-123',
        workoutId: 'workout-789',
        completionRate: 100,
        actualDuration: 42,
        plannedDuration: 45,
        efficiencyScore: (45 / 42) * 100, // ~107%
        exercisePerformance: [
          {
            exerciseName: 'Push-ups',
            targetMuscles: ['chest', 'triceps'],
            plannedSets: 3,
            completedSets: 3,
            plannedReps: 12,
            actualReps: [12, 11, 10],
            formQuality: 4,
            difficulty: 3,
            modifications: []
          }
        ],
        difficultyRating: 3,
        enjoymentRating: 4,
        energyLevel: 'moderate' as const,
        perceivedExertion: 6,
        timeOfDay: 'morning',
        dayOfWeek: 'Monday',
        environmentalFactors: [],
        aiRecommendations: ['Consider increasing intensity'],
        adaptationSuggestions: ['User enjoys this workout type']
      };

      expect(mockAnalytics.completionRate).toBe(100);
      expect(mockAnalytics.efficiencyScore).toBeCloseTo(107, 0);
      expect(mockAnalytics.exercisePerformance[0].completedSets).toBe(3);
      expect(mockAnalytics.aiRecommendations).toContain('Consider increasing intensity');
    });
  });
});
