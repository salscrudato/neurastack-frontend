/**
 * React Hooks for NeuraStack AI Integration
 * 
 * Custom hooks for easy integration with the NeuraStack API
 * providing state management, error handling, and caching.
 */

import { useState, useCallback, useRef } from 'react';
import { neuraStackClient, NeuraStackApiError } from '../lib/neurastack-client';
import type {
  NeuraStackQueryRequest,
  NeuraStackQueryResponse,
  MemoryMetrics,
  SessionContext
} from '../lib/types';

// ============================================================================
// Hook Types
// ============================================================================

export interface UseNeuraStackAIResult {
  /** Function to query the AI */
  queryAI: (prompt: string, options?: Partial<NeuraStackQueryRequest>) => Promise<NeuraStackQueryResponse>;
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Last response */
  response: NeuraStackQueryResponse | null;
  
  /** Clear error state */
  clearError: () => void;
  
  /** Cancel current request */
  cancel: () => void;
}

export interface UseMemoryMetricsResult {
  /** Memory metrics data */
  metrics: MemoryMetrics | null;
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Function to refresh metrics */
  refresh: () => Promise<void>;
  
  /** Clear error state */
  clearError: () => void;
}

export interface UseSessionContextResult {
  /** Session context data */
  context: SessionContext | null;
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Function to refresh context */
  refresh: () => Promise<void>;
  
  /** Clear error state */
  clearError: () => void;
}

// ============================================================================
// Main AI Query Hook
// ============================================================================

export function useNeuraStackAI(): UseNeuraStackAIResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<NeuraStackQueryResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const queryAI = useCallback(async (
    prompt: string,
    options: Partial<NeuraStackQueryRequest> = {}
  ): Promise<NeuraStackQueryResponse> => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await neuraStackClient.queryAI(prompt, {
        ...options,
        signal: abortControllerRef.current.signal
      });

      setResponse(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof NeuraStackApiError 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      throw err;

    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  return {
    queryAI,
    loading,
    error,
    response,
    clearError,
    cancel
  };
}

// ============================================================================
// Memory Metrics Hook
// ============================================================================

export function useMemoryMetrics(userId?: string): UseMemoryMetricsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await neuraStackClient.getMemoryMetrics(userId);
      setMetrics(result);
    } catch (err) {
      const errorMessage = err instanceof NeuraStackApiError 
        ? err.message 
        : 'Failed to load memory metrics';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    metrics,
    loading,
    error,
    refresh,
    clearError
  };
}

// ============================================================================
// Session Context Hook
// ============================================================================

export function useSessionContext(sessionId?: string): UseSessionContextResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<SessionContext | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await neuraStackClient.getSessionContext(sessionId);
      setContext(result);
    } catch (err) {
      const errorMessage = err instanceof NeuraStackApiError 
        ? err.message 
        : 'Failed to load session context';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    context,
    loading,
    error,
    refresh,
    clearError
  };
}

// ============================================================================
// Health Check Hook
// ============================================================================

export function useHealthCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ status: string; message: string } | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await neuraStackClient.healthCheck();
      setStatus(result);
    } catch (err) {
      const errorMessage = err instanceof NeuraStackApiError 
        ? err.message 
        : 'Health check failed';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    status,
    loading,
    error,
    checkHealth,
    clearError
  };
}

// ============================================================================
// Utility Hook for Client Configuration
// ============================================================================

export function useNeuraStackConfig() {
  const updateConfig = useCallback((config: Parameters<typeof neuraStackClient.configure>[0]) => {
    neuraStackClient.configure(config);
  }, []);

  return { updateConfig };
}
