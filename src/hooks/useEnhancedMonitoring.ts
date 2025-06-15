/**
 * Enhanced Monitoring Hooks for NeuraStack API
 * 
 * Provides hooks for system health monitoring, metrics tracking,
 * tier management, and cost estimation with real-time updates.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { neuraStackClient, NeuraStackApiError } from '../lib/neurastack-client';
import type {
  DetailedHealthResponse,
  MetricsResponse,
  TierInfoResponse,
  CostEstimateRequest,
  CostEstimateResponse,
  NeuraStackTier
} from '../lib/types';

// ============================================================================
// System Health Hook
// ============================================================================

export interface UseSystemHealthResult {
  /** Current health status */
  health: DetailedHealthResponse | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh health status */
  refresh: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
  /** Auto-refresh enabled */
  autoRefresh: boolean;
  /** Toggle auto-refresh */
  toggleAutoRefresh: () => void;
}

export function useSystemHealth(autoRefreshInterval = 30000): UseSystemHealthResult {
  const [health, setHealth] = useState<DetailedHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await neuraStackClient.getDetailedHealth();
      setHealth(result);
    } catch (err) {
      const errorMessage = err instanceof NeuraStackApiError 
        ? err.message 
        : 'Failed to fetch system health';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      // Initial fetch
      refresh();
      
      // Set up interval
      intervalRef.current = setInterval(refresh, autoRefreshInterval);
    } else {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refresh, autoRefreshInterval]);

  return {
    health,
    loading,
    error,
    refresh,
    clearError,
    autoRefresh,
    toggleAutoRefresh
  };
}

// ============================================================================
// System Metrics Hook
// ============================================================================

export interface UseSystemMetricsResult {
  /** Current metrics */
  metrics: MetricsResponse | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh metrics */
  refresh: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
  /** Auto-refresh enabled */
  autoRefresh: boolean;
  /** Toggle auto-refresh */
  toggleAutoRefresh: () => void;
}

export function useSystemMetrics(autoRefreshInterval = 60000): UseSystemMetricsResult {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await neuraStackClient.getSystemMetrics();
      setMetrics(result);
    } catch (err) {
      const errorMessage = err instanceof NeuraStackApiError 
        ? err.message 
        : 'Failed to fetch system metrics';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      // Initial fetch
      refresh();
      
      // Set up interval
      intervalRef.current = setInterval(refresh, autoRefreshInterval);
    } else {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refresh, autoRefreshInterval]);

  return {
    metrics,
    loading,
    error,
    refresh,
    clearError,
    autoRefresh,
    toggleAutoRefresh
  };
}

// ============================================================================
// Tier Management Hook
// ============================================================================

export interface UseTierManagementResult {
  /** Current tier information */
  tierInfo: TierInfoResponse | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh tier info */
  refresh: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
  /** Current tier */
  currentTier: NeuraStackTier | null;
  /** Available tiers */
  availableTiers: TierInfoResponse['data']['availableTiers'] | null;
  /** Cost comparison */
  costComparison: TierInfoResponse['data']['costComparison'] | null;
}

// Fallback data for development/demo purposes
const fallbackTierInfo: TierInfoResponse = {
    status: 'success',
    data: {
      currentTier: 'free',
      configuration: {
        models: {
          'gpt-4o-mini': {
            name: 'GPT-4o Mini',
            provider: 'openai',
            costPerToken: 0.00015,
            maxTokens: 128000,
            features: ['fast', 'cost-effective']
          }
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
          description: 'Cost-optimized AI responses with 90-95% savings',
          models: {},
          limits: {
            requestsPerHour: 10,
            requestsPerDay: 50,
            maxPromptLength: 1000,
            maxWordsPerResponse: 100,
            features: ['Basic ensemble', 'Memory context', 'Standard support']
          },
          estimatedCostPerRequest: '$0.003',
          responseTime: '5-15 seconds',
          quality: '85-90%'
        },
        premium: {
          name: 'Premium Tier',
          description: 'Maximum quality and performance for critical applications',
          models: {},
          limits: {
            requestsPerHour: 100,
            requestsPerDay: 1000,
            maxPromptLength: 5000,
            maxWordsPerResponse: 200,
            features: ['Advanced ensemble', 'Priority memory', 'Premium support', 'Advanced analytics']
          },
          estimatedCostPerRequest: '$0.08',
          responseTime: '8-20 seconds',
          quality: '95-100%'
        }
      },
      costComparison: {
        free: {
          costSavings: '90-95%',
          qualityRatio: '85-90%',
          speedRatio: '80-90%',
          features: ['Cost optimized', 'Good quality', 'Standard speed']
        },
        premium: {
          costSavings: '0%',
          qualityRatio: '100%',
          speedRatio: '100%',
          features: ['Maximum quality', 'Fastest response', 'Priority support']
        }
      }
    },
    timestamp: new Date().toISOString()
  };

export function useTierManagement(): UseTierManagementResult {
  const [tierInfo, setTierInfo] = useState<TierInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await neuraStackClient.getTierInfo();
      setTierInfo(result);
    } catch (err) {
      const errorMessage = err instanceof NeuraStackApiError
        ? err.message
        : 'Failed to fetch tier information';

      console.warn('Tier info API failed, using fallback data:', errorMessage);

      // Use fallback data instead of showing error
      setTierInfo(fallbackTierInfo);
      setError(null); // Don't show error, just use fallback
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    tierInfo: tierInfo || fallbackTierInfo,
    loading,
    error,
    refresh,
    clearError,
    currentTier: tierInfo?.data?.currentTier || fallbackTierInfo.data.currentTier,
    availableTiers: tierInfo?.data?.availableTiers || fallbackTierInfo.data.availableTiers,
    costComparison: tierInfo?.data?.costComparison || fallbackTierInfo.data.costComparison
  };
}

// ============================================================================
// Cost Estimation Hook
// ============================================================================

export interface UseCostEstimationResult {
  /** Estimate cost for a prompt */
  estimateCost: (prompt: string, tier?: NeuraStackTier) => Promise<CostEstimateResponse>;
  /** Current estimation result */
  estimation: CostEstimateResponse | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Clear error state */
  clearError: () => void;
  /** Clear estimation result */
  clearEstimation: () => void;
}

export function useCostEstimation(): UseCostEstimationResult {
  const [estimation, setEstimation] = useState<CostEstimateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimateCost = useCallback(async (prompt: string, tier?: NeuraStackTier): Promise<CostEstimateResponse> => {
    setLoading(true);
    setError(null);

    try {
      const request: CostEstimateRequest = { prompt, tier };
      const result = await neuraStackClient.estimateCost(request);
      setEstimation(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof NeuraStackApiError 
        ? err.message 
        : 'Failed to estimate cost';
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearEstimation = useCallback(() => {
    setEstimation(null);
  }, []);

  return {
    estimateCost,
    estimation,
    loading,
    error,
    clearError,
    clearEstimation
  };
}
