/**
 * API Validation Tests
 * 
 * Tests to verify that our API implementation matches the backend documentation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { neuraStackClient } from '../lib/neurastack-client';
import type { WorkoutAPIRequest, WorkoutAPIResponse, EnsembleResponse } from '../lib/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('NeuraStack API Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset client configuration
    neuraStackClient.configure({
      baseUrl: 'https://test-backend.com',
      userId: 'test-user-123',
      sessionId: 'test-session-456'
    });
  });

  describe('Default Ensemble API (/default-ensemble)', () => {
    it('should send correct request format', async () => {
      const mockResponse: EnsembleResponse = {
        status: 'success',
        data: {
          prompt: 'Test prompt',
          userId: 'test-user-123',
          sessionId: 'test-session-456',
          synthesis: {
            content: 'Test response',
            model: 'gpt-4o',
            provider: 'openai',
            status: 'success',
            overallConfidence: 0.87,
            synthesisStrategy: 'consensus'
          },
          roles: [
            {
              role: 'gpt4o',
              content: 'GPT-4o response',
              model: 'gpt-4o-mini',
              confidence: 0.85
            },
            {
              role: 'gemini',
              content: 'Gemini response',
              model: 'gemini-1.5-flash',
              confidence: 0.90
            },
            {
              role: 'claude',
              content: 'Claude response',
              model: 'claude-3-haiku-20240307',
              confidence: 0.82
            }
          ],
          metadata: {
            processingTimeMs: 12000,
            memoryContextUsed: true,
            responseQuality: 0.88,
            timestamp: '2025-06-18T20:00:00.000Z'
          }
        },
        correlationId: 'test-correlation-id'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await neuraStackClient.queryAI('Test prompt');

      expect(fetch).toHaveBeenCalledWith(
        'https://test-backend.com/default-ensemble',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-User-Id': 'test-user-123',
            'X-Correlation-ID': expect.any(String)
          }),
          body: JSON.stringify({
            prompt: 'Test prompt'
          })
        })
      );
    });

    it('should handle missing X-User-Id gracefully', async () => {
      neuraStackClient.configure({ userId: '' });

      const mockResponse: EnsembleResponse = {
        status: 'success',
        data: {
          prompt: 'Test prompt',
          userId: '',
          sessionId: 'test-session-456',
          synthesis: {
            content: 'Test response',
            model: 'gpt-4o',
            provider: 'openai',
            status: 'success',
            overallConfidence: 0.87,
            synthesisStrategy: 'consensus'
          },
          roles: [],
          metadata: {
            processingTimeMs: 12000,
            memoryContextUsed: false,
            responseQuality: 0.88,
            timestamp: '2025-06-18T20:00:00.000Z'
          }
        }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await neuraStackClient.queryAI('Test prompt');

      const callArgs = (fetch as any).mock.calls[0];
      expect(callArgs[1].headers).not.toHaveProperty('X-User-Id');
    });
  });

  describe('Workout API (/workout)', () => {
    it('should send correct request format', async () => {
      const workoutRequest: WorkoutAPIRequest = {
        userMetadata: {
          age: 28,
          fitnessLevel: 'beginner',
          goals: ['strength', 'cardio'],
          equipment: ['dumbbells', 'resistance_bands']
        },
        workoutHistory: [
          {
            date: '2025-06-15',
            type: 'upper_body',
            duration: 45
          }
        ],
        workoutRequest: 'Create a 30-minute beginner strength workout'
      };

      const mockResponse: WorkoutAPIResponse = {
        status: 'success',
        data: {
          workout: {
            type: 'mixed',
            duration: '30 minutes',
            difficulty: 'beginner',
            equipment: ['none'],
            exercises: [
              {
                name: 'Bodyweight Squats',
                category: 'strength',
                sets: 2,
                reps: '10-12',
                rest: '30 seconds',
                instructions: 'Detailed exercise instructions...',
                modifications: 'Easier variations...',
                targetMuscles: ['quadriceps', 'hamstrings', 'glutes']
              }
            ],
            warmup: [
              {
                name: 'Arm Circles',
                duration: '2 minutes',
                instructions: 'Warmup instructions...'
              }
            ],
            cooldown: [
              {
                name: 'Standing Forward Bend',
                duration: '2 minutes',
                instructions: 'Cooldown instructions...'
              }
            ],
            calorieEstimate: '150-200 calories',
            notes: 'Additional workout notes...'
          },
          metadata: {
            model: 'gpt-4o-mini',
            timestamp: '2025-06-18T20:00:00.000Z'
          }
        }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await neuraStackClient.generateWorkout(workoutRequest, {
        userId: 'test-user-123'
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://test-backend.com/workout',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-User-Id': 'test-user-123',
            'X-Correlation-ID': expect.any(String)
          }),
          body: JSON.stringify(workoutRequest)
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 Bad Request errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Bad request',
          message: 'Invalid input',
          statusCode: 400,
          timestamp: '2025-06-18T20:00:00.000Z'
        })
      });

      await expect(neuraStackClient.queryAI('Test prompt')).rejects.toThrow('Invalid input');
    });

    it('should handle 429 Rate Limit errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({
          error: 'Rate limit exceeded',
          message: 'Too many requests',
          statusCode: 429,
          timestamp: '2025-06-18T20:00:00.000Z'
        })
      });

      await expect(neuraStackClient.queryAI('Test prompt')).rejects.toThrow('Too many requests');
    });

    it('should handle 500 Server errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: 'Server error',
          message: 'Internal server error',
          statusCode: 500,
          timestamp: '2025-06-18T20:00:00.000Z'
        })
      });

      await expect(neuraStackClient.queryAI('Test prompt')).rejects.toThrow('Internal server error');
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout after configured duration', async () => {
      // Mock a request that never resolves
      (fetch as any).mockImplementationOnce(() => new Promise(() => {}));

      neuraStackClient.configure({ timeout: 100 }); // 100ms timeout for test

      await expect(neuraStackClient.queryAI('Test prompt')).rejects.toThrow('Request timed out');
    });
  });
});
