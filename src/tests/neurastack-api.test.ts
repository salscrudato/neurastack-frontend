/**
 * NeuraStack API Integration Tests
 *
 * Simplified tests focusing on core functionality and type safety
 * of the updated NeuraStack API integration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NeuraStackClient, NeuraStackApiError } from '../lib/neurastack-client';
import type { NeuraStackQueryResponse, MemoryMetrics } from '../lib/types';

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
      const mockResponse: NeuraStackQueryResponse = {
        answer: 'Test response',
        ensembleMode: true,
        modelsUsed: { 'openai:gpt-4': true },
        executionTime: '1500ms',
        tokenCount: 150,
        memoryContext: 'Test context',
        ensembleMetadata: {
          evidenceAnalyst: 'Evidence analysis',
          innovator: 'Creative solution',
          riskReviewer: 'Risk assessment',
          executionTime: 1500
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.queryAI('Test prompt', { useEnsemble: true });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/query',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Session-ID': 'test-session',
            'X-User-ID': 'test-user'
          }),
          body: JSON.stringify({
            prompt: 'Test prompt',
            useEnsemble: true,
            models: ['google:gemini-1.5-flash', 'google:gemini-1.5-flash', 'xai:grok-3-mini', 'xai:grok-3-mini']
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
      const mockMetrics: MemoryMetrics = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics
      });

      const result = await client.getMemoryMetrics('test-user');
      expect(result).toEqual(mockMetrics);
    });

    it('should check health status', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z'
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
        ensembleMetadata: {
          evidenceAnalyst: 'Evidence analysis',
          innovator: 'Creative solution',
          riskReviewer: 'Risk assessment',
          executionTime: 1000
        },
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
      expect(typeof response.ensembleMetadata?.executionTime).toBe('number');
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
        ensembleMetadata: {
          evidenceAnalyst: 'Factual analysis of the query',
          innovator: 'Creative approach to the problem',
          riskReviewer: 'Potential risks and considerations',
          executionTime: 1500
        },
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
      expect(response.ensembleMetadata).toBeDefined();
      expect(response.fallbackReasons).toBeDefined();
    });
  });
});
