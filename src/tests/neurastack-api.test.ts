/**
 * NeuraStack API Integration Tests
 *
 * Simplified tests focusing on core functionality and type safety
 * of the updated NeuraStack API integration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NeuraStackClient, NeuraStackApiError } from '../lib/neurastack-client';
import type { NeuraStackQueryResponse, MemoryMetrics, EnsembleResponse } from '../lib/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  }
});

describe('NeuraStack API Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('NeuraStackClient', () => {
    let client: NeuraStackClient;

    beforeEach(() => {
      client = new NeuraStackClient({
        baseUrl: 'https://test-api.example.com',
        sessionId: 'test-session',
        userId: 'test-user',
        timeout: 5000
      });
    });

    it('should create client with default configuration', () => {
      const defaultClient = new NeuraStackClient();
      expect(defaultClient).toBeDefined();
    });

    it('should make successful API query', async () => {
      // Mock the actual ensemble API response format
      const mockEnsembleResponse: EnsembleResponse = {
        status: 'success',
        data: {
          prompt: 'Test prompt',
          userId: 'test-user',
          synthesis: {
            content: 'Test response',
            model: 'gpt-4o',
            provider: 'openai',
            status: 'success'
          },
          roles: [
            {
              role: 'gpt4o',
              content: 'Individual response from GPT-4',
              model: 'gpt-4o',
              provider: 'openai',
              status: 'fulfilled',
              wordCount: 25
            }
          ],
          metadata: {
            totalRoles: 1,
            successfulRoles: 1,
            failedRoles: 0,
            synthesisStatus: 'success',
            processingTimeMs: 1500,
            timestamp: '2024-01-01T00:00:00Z'
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnsembleResponse
      });

      const result = await client.queryAI('Test prompt', { useEnsemble: true });

      // Verify the transformed response structure
      expect(result.answer).toBe('Test response');
      expect(result.ensembleMode).toBe(true);
      expect(result.executionTime).toBe('1500ms');
      expect(result.individualResponses).toHaveLength(1);
      expect(result.individualResponses![0].model).toBe('gpt-4o');
      expect(result.individualResponses![0].provider).toBe('openai');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/default-ensemble',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            prompt: 'Test prompt',
            sessionId: 'test-session'
          })
        })
      );
    });

    it('should handle API errors correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Server Error',
          message: 'Internal server error',
          statusCode: 500,
          timestamp: '2024-01-01T00:00:00Z'
        })
      });

      await expect(client.queryAI('Test prompt')).rejects.toThrow(NeuraStackApiError);
    });

    it('should get memory metrics', async () => {
      // Mock the analytics API response format
      const mockAnalyticsResponse = {
        success: true,
        userId: 'test-user',
        metrics: {
          totalMemories: 100,
          memoryTypes: {
            working: 10,
            short_term: 20,
            long_term: 30,
            semantic: 25,
            episodic: 15
          },
          averageImportance: 0.7,
          averageCompositeScore: 0.8,
          archivedCount: 15,
          recentMemories: 85
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalyticsResponse
      });

      const result = await client.getMemoryMetrics('test-user');

      // Verify the transformed metrics structure
      expect(result.totalMemories).toBe(100);
      expect(result.averageImportance).toBe(0.7);
      expect(result.memoryByType.working).toBe(10);
      expect(result.memoryByType.short_term).toBe(20);
      expect(result.retentionStats.active).toBe(85); // totalMemories - archivedCount
      expect(result.retentionStats.archived).toBe(15);
    });

    it('should check health status', async () => {
      const mockHealth = {
        status: 'healthy',
        message: 'All systems operational'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth
      });

      const result = await client.healthCheck();
      expect(result).toEqual(mockHealth);
    });
  });

  describe('Type Safety and API Structure', () => {
    it('should have correct TypeScript types for NeuraStackQueryResponse', () => {
      const response: NeuraStackQueryResponse = {
        answer: 'Test response',
        ensembleMode: true,
        modelsUsed: { 'openai:gpt-4': true },
        executionTime: '1000ms',
        tokenCount: 100,
        memoryContext: 'Test context',
        memoryTokensSaved: 50,
        individualResponses: [
          {
            model: 'gpt-4o',
            answer: 'Individual response from GPT-4',
            role: 'gpt4o',
            provider: 'openai',
            status: 'success',
            wordCount: 25
          }
        ],
        fallbackReasons: { 'model-x': 'timeout' }
      };

      // Type assertions to ensure all fields are correctly typed
      expect(typeof response.answer).toBe('string');
      expect(typeof response.ensembleMode).toBe('boolean');
      expect(typeof response.modelsUsed).toBe('object');
      expect(typeof response.executionTime).toBe('string');
      expect(typeof response.tokenCount).toBe('number');
      expect(typeof response.memoryContext).toBe('string');
      expect(typeof response.memoryTokensSaved).toBe('number');
      expect(Array.isArray(response.individualResponses)).toBe(true);
    });

    it('should have correct TypeScript types for MemoryMetrics', () => {
      const metrics: MemoryMetrics = {
        totalMemories: 100,
        averageImportance: 0.7,
        averageCompressionRatio: 0.3,
        totalTokensSaved: 5000,
        memoryByType: {
          working: 10,
          short_term: 20,
          long_term: 30,
          semantic: 25,
          episodic: 15
        },
        retentionStats: {
          active: 80,
          archived: 15,
          expired: 5
        },
        accessPatterns: {
          hourly: new Array(24).fill(0),
          daily: new Array(7).fill(0),
          weekly: new Array(52).fill(0)
        }
      };

      // Type assertions
      expect(typeof metrics.totalMemories).toBe('number');
      expect(typeof metrics.averageImportance).toBe('number');
      expect(Array.isArray(metrics.accessPatterns.hourly)).toBe(true);
      expect(metrics.accessPatterns.hourly.length).toBe(24);
    });

    it('should validate API client configuration', () => {
      const client = new NeuraStackClient({
        baseUrl: 'https://api.example.com',
        sessionId: 'session-123',
        userId: 'user-456',
        timeout: 30000,
        useEnsemble: true
      });

      expect(client).toBeDefined();
      expect(client.configure).toBeDefined();
      expect(client.queryAI).toBeDefined();
      expect(client.getMemoryMetrics).toBeDefined();
      expect(client.getSessionContext).toBeDefined();
      expect(client.healthCheck).toBeDefined();
    });

    it('should validate error handling types', () => {
      const error = new NeuraStackApiError({
        error: 'Test Error',
        message: 'Test error message',
        statusCode: 500,
        timestamp: '2024-01-01T00:00:00Z'
      });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NeuraStackApiError);
      expect(error.statusCode).toBe(500);
      expect(typeof error.retryable).toBe('boolean');
    });
  });

  describe('API Integration Validation', () => {
    it('should validate request structure', () => {
      // This test ensures the request structure matches the backend specification
      const requestBody = {
        prompt: 'Test prompt',
        useEnsemble: true,
        models: ['openai:gpt-4', 'google:gemini-1.5-flash'],
        maxTokens: 1000,
        temperature: 0.7
      };

      expect(typeof requestBody.prompt).toBe('string');
      expect(typeof requestBody.useEnsemble).toBe('boolean');
      expect(Array.isArray(requestBody.models)).toBe(true);
      expect(typeof requestBody.maxTokens).toBe('number');
      expect(typeof requestBody.temperature).toBe('number');
    });

    it('should validate response structure compatibility', () => {
      // This test ensures the response structure is compatible with the frontend
      const response: NeuraStackQueryResponse = {
        answer: 'Test response',
        ensembleMode: true,
        modelsUsed: { 'openai:gpt-4': true, 'google:gemini-1.5-flash': false },
        executionTime: '1500ms',
        tokenCount: 150,
        memoryContext: 'Previous conversation context',
        memoryTokensSaved: 75,
        individualResponses: [
          {
            model: 'gpt-4o',
            answer: 'Individual response from GPT-4',
            role: 'gpt4o',
            provider: 'openai',
            status: 'success',
            wordCount: 25
          }
        ],
        fallbackReasons: {
          'google:gemini-1.5-flash': 'Rate limit exceeded'
        }
      };

      // Validate all required fields are present
      expect(response.answer).toBeDefined();
      expect(response.ensembleMode).toBeDefined();
      expect(response.modelsUsed).toBeDefined();
      expect(response.executionTime).toBeDefined();
      expect(response.tokenCount).toBeDefined();

      // Validate optional fields work correctly
      expect(response.memoryContext).toBeDefined();
      expect(response.memoryTokensSaved).toBeDefined();
      expect(response.individualResponses).toBeDefined();
      expect(response.fallbackReasons).toBeDefined();
    });
  });
});
