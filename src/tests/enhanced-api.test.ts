/**
 * Enhanced NeuraStack API Integration Tests
 * 
 * Tests for the new backend API features including enhanced monitoring,
 * tier management, cost estimation, and default ensemble endpoint.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { neuraStackClient } from '../lib/neurastack-client';
import type {
  DetailedHealthResponse,
  MetricsResponse,
  TierInfoResponse,
  CostEstimateRequest,
  CostEstimateResponse,
  EnsembleResponse
} from '../lib/types';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Enhanced NeuraStack API Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    
    // Configure client for testing
    neuraStackClient.configure({
      baseUrl: 'https://test-api.neurastack.ai',
      sessionId: 'test-session-123',
      userId: 'test-user-456',
      useEnsemble: true
    });
  });

  describe('Default Ensemble Endpoint', () => {
    it('should use the new /default-ensemble endpoint', async () => {
      const mockResponse: EnsembleResponse = {
        status: 'success',
        data: {
          prompt: 'Test prompt',
          userId: 'test-user-456',
          synthesis: {
            content: 'Test synthesis response',
            model: 'gpt-4o',
            provider: 'openai',
            status: 'success'
          },
          roles: [
            {
              role: 'gpt4o',
              content: 'GPT-4o response',
              model: 'gpt-4o',
              provider: 'openai',
              status: 'fulfilled',
              wordCount: 10
            },
            {
              role: 'gemini',
              content: 'Gemini response',
              model: 'gemini-2.0-flash',
              provider: 'gemini',
              status: 'fulfilled',
              wordCount: 12
            },
            {
              role: 'claude',
              content: 'Claude response',
              model: 'claude-opus-4',
              provider: 'claude',
              status: 'fulfilled',
              wordCount: 15
            }
          ],
          metadata: {
            totalRoles: 3,
            successfulRoles: 3,
            failedRoles: 0,
            synthesisStatus: 'success',
            processingTimeMs: 12450,
            timestamp: '2025-01-15T10:30:45.123Z',
            version: 'v3.0.0',
            correlationId: 'test-correlation-123',
            memoryContextUsed: true,
            responseQuality: 0.95
          }
        },
        timestamp: '2025-01-15T10:30:45.123Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers()
      });

      const result = await neuraStackClient.queryAI('Test prompt');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.neurastack.ai/default-ensemble',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Session-Id': 'test-session-123',
            'X-User-Id': 'test-user-456',
            'X-Correlation-ID': expect.any(String)
          }),
          body: JSON.stringify({
            prompt: 'Test prompt',
            sessionId: 'test-session-123'
          })
        })
      );

      expect(result.answer).toBe('Test synthesis response');
      expect(result.ensembleMode).toBe(true);
      expect(result.individualResponses).toHaveLength(3);
    });
  });

  describe('Enhanced Monitoring', () => {
    it('should fetch detailed health status', async () => {
      const mockHealthResponse: DetailedHealthResponse = {
        status: 'healthy',
        timestamp: '2025-01-15T10:30:45.123Z',
        version: 'v3.0.0',
        components: {
          system: {
            status: 'healthy',
            uptime: 86400,
            memory: { used: 1024, total: 4096, percentage: 25 },
            cpu: { usage: 15.5, load: [0.5, 0.3, 0.2] }
          },
          vendors: {
            openai: { status: 'healthy', responseTime: 1200, errorRate: 0.01 },
            gemini: { status: 'healthy', responseTime: 1100, errorRate: 0.02 },
            claude: { status: 'healthy', responseTime: 1300, errorRate: 0.01 }
          },
          ensemble: {
            status: 'healthy',
            averageResponseTime: 12000,
            successRate: 0.98,
            activeConnections: 25
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealthResponse,
        headers: new Headers()
      });

      const result = await neuraStackClient.getDetailedHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.neurastack.ai/health-detailed',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      expect(result.status).toBe('healthy');
      expect(result.components.system.status).toBe('healthy');
      expect(result.components.vendors.openai.status).toBe('healthy');
    });

    it('should fetch system metrics', async () => {
      const mockMetricsResponse: MetricsResponse = {
        timestamp: '2025-01-15T10:30:45.123Z',
        system: {
          requests: { total: 1000, successful: 980, failed: 20, rate: 50.5 },
          performance: { averageResponseTime: 1200, p95ResponseTime: 2000, p99ResponseTime: 3000, throughput: 45.2 },
          resources: { memoryUsage: 25.5, cpuUsage: 15.2, activeConnections: 25, queueSize: 5 },
          errors: { total: 20, byType: { timeout: 10, network: 5, api: 5 }, byVendor: { openai: 8, gemini: 7, claude: 5 }, rate: 1.2 }
        },
        vendors: {
          openai: { requests: 350, errors: 8, averageResponseTime: 1200 },
          gemini: { requests: 330, errors: 7, averageResponseTime: 1100 },
          claude: { requests: 320, errors: 5, averageResponseTime: 1300 }
        },
        ensemble: {
          totalRequests: 1000,
          successfulEnsembles: 980,
          averageModelsPerRequest: 2.8,
          synthesisSuccessRate: 0.95
        },
        tier: 'free',
        costEstimate: '$0.003'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetricsResponse,
        headers: new Headers()
      });

      const result = await neuraStackClient.getSystemMetrics();

      expect(result.tier).toBe('free');
      expect(result.system.requests.total).toBe(1000);
      expect(result.ensemble.successfulEnsembles).toBe(980);
    });
  });

  describe('Tier Management', () => {
    it('should fetch tier information', async () => {
      const mockTierResponse: TierInfoResponse = {
        status: 'success',
        data: {
          currentTier: 'free',
          configuration: {
            models: {
              'gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'openai', costPerToken: 0.00015, maxTokens: 128000, features: ['fast', 'cost-effective'] }
            },
            limits: {
              requestsPerHour: 10,
              requestsPerDay: 50,
              maxPromptLength: 1000,
              maxWordsPerResponse: 100,
              features: ['basic-ensemble', 'memory-context']
            },
            estimatedCostPerRequest: '$0.003'
          },
          availableTiers: {
            free: {
              name: 'Free Tier',
              description: 'Cost-optimized AI responses',
              models: {},
              limits: { requestsPerHour: 10, requestsPerDay: 50, maxPromptLength: 1000, maxWordsPerResponse: 100, features: [] },
              estimatedCostPerRequest: '$0.003',
              responseTime: '5-15 seconds',
              quality: '85-90%'
            },
            premium: {
              name: 'Premium Tier',
              description: 'Maximum quality and performance',
              models: {},
              limits: { requestsPerHour: 100, requestsPerDay: 1000, maxPromptLength: 5000, maxWordsPerResponse: 200, features: [] },
              estimatedCostPerRequest: '$0.08',
              responseTime: '8-20 seconds',
              quality: '95-100%'
            }
          },
          costComparison: {
            free: { costSavings: '90-95%', qualityRatio: '85-90%', speedRatio: '80-90%', features: [] },
            premium: { costSavings: '0%', qualityRatio: '100%', speedRatio: '100%', features: [] }
          }
        },
        timestamp: '2025-01-15T10:30:45.123Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTierResponse,
        headers: new Headers()
      });

      const result = await neuraStackClient.getTierInfo();

      expect(result.data.currentTier).toBe('free');
      expect(result.data.availableTiers.free.name).toBe('Free Tier');
      expect(result.data.availableTiers.premium.name).toBe('Premium Tier');
    });
  });

  describe('Cost Estimation', () => {
    it('should estimate costs for a prompt', async () => {
      const mockCostResponse: CostEstimateResponse = {
        status: 'success',
        data: {
          prompt: { length: 50, estimatedTokens: 12 },
          tier: 'free',
          estimatedCost: {
            total: '$0.003456',
            breakdown: { promptTokens: 12, responseTokens: 150, modelsUsed: 3 }
          },
          comparison: { free: '$0.003456', premium: '$0.08234' }
        },
        timestamp: '2025-01-15T10:30:45.123Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCostResponse,
        headers: new Headers()
      });

      const request: CostEstimateRequest = {
        prompt: 'Test prompt for cost estimation',
        tier: 'free'
      };

      const result = await neuraStackClient.estimateCost(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.neurastack.ai/estimate-cost',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        })
      );

      expect(result.data.tier).toBe('free');
      expect(result.data.estimatedCost.total).toBe('$0.003456');
      expect(result.data.comparison.free).toBe('$0.003456');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: 'Server Error',
          message: 'Internal server error occurred',
          timestamp: '2025-01-15T10:30:45.123Z'
        })
      });

      await expect(neuraStackClient.queryAI('Test prompt')).rejects.toThrow('Internal server error occurred');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(neuraStackClient.queryAI('Test prompt')).rejects.toThrow('Failed to connect to NeuraStack API');
    });
  });
});
