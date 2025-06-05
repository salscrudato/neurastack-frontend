/**
 * NeuraStack API Client - Latest Backend Integration
 * 
 * Comprehensive TypeScript client for the NeuraStack backend API
 * with full type safety, error handling, and modern features.
 */

import type {
  NeuraStackQueryRequest,
  NeuraStackQueryResponse,
  MemoryMetrics,
  SessionContext,
  EnsembleRequest,
  EnsembleResponse,
  LegacyEnsembleMetadata,
  SubAnswer
} from './types';
import { cacheManager } from './cacheManager';

// ============================================================================
// Error Types
// ============================================================================

export interface NeuraStackError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export type NeuraStackErrorCode = 400 | 401 | 429 | 500 | 503;

// ============================================================================
// Client Configuration
// ============================================================================

export interface NeuraStackClientConfig {
  /** Base URL for the NeuraStack API */
  baseUrl?: string;
  
  /** Default session ID */
  sessionId?: string;
  
  /** Default user ID */
  userId?: string;
  
  /** Default authentication token */
  authToken?: string;
  
  /** Default request timeout (ms) */
  timeout?: number;
  
  /** Whether to use ensemble mode by default */
  useEnsemble?: boolean;
}

export interface NeuraStackRequestOptions {
  /** Session ID for conversation continuity */
  sessionId?: string;
  
  /** User ID for memory scoping */
  userId?: string;
  
  /** Authentication token */
  authToken?: string;
  
  /** Request timeout in milliseconds */
  timeout?: number;
  
  /** AbortController signal for cancellation */
  signal?: AbortSignal;
}

// ============================================================================
// Constants
// ============================================================================

export const NEURASTACK_ENDPOINTS = {
  ENSEMBLE: '/ensemble-test',
  QUERY: '/api/query', // Legacy endpoint for backward compatibility
  MEMORY_METRICS: '/api/memory/metrics',
  MEMORY_CONTEXT: '/api/memory/context',
  HEALTH: '/health'
} as const;

export const NEURASTACK_MODELS = {
  OPENAI_GPT4: 'openai:gpt-4',
  OPENAI_GPT35: 'openai:gpt-3.5-turbo',
  GOOGLE_GEMINI: 'google:gemini-1.5-flash',
  XAI_GROK: 'xai:grok-3-mini'
} as const;

// Default model configuration for API requests
export const DEFAULT_MODELS = [
  'google:gemini-1.5-flash',
  'google:gemini-1.5-flash',
  'xai:grok-3-mini',
  'xai:grok-3-mini'
] as const;

export const NEURASTACK_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  SESSION_ID: 'X-Session-ID',
  USER_ID: 'X-User-ID',
  AUTHORIZATION: 'Authorization'
} as const;

// ============================================================================
// API Client Implementation
// ============================================================================

export class NeuraStackClient {
  private config: Required<NeuraStackClientConfig>;

  constructor(config: NeuraStackClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl ||
        import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ||
        "https://neurastack-backend-638289111765.us-central1.run.app",
      sessionId: config.sessionId || crypto.randomUUID(),
      userId: config.userId || '',
      authToken: config.authToken || '',
      timeout: config.timeout || 60000, // 60 seconds to accommodate ensemble processing
      useEnsemble: config.useEnsemble ?? true
    };
  }

  /**
   * Update client configuration
   */
  configure(config: Partial<NeuraStackClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Query the AI with a prompt using the new Ensemble API
   */
  async queryAI(
    prompt: string,
    options: NeuraStackRequestOptions & Partial<NeuraStackQueryRequest> = {}
  ): Promise<NeuraStackQueryResponse> {
    const requestBody: EnsembleRequest = {
      prompt
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Log the outgoing request
    console.group('🚀 NeuraStack Ensemble API Request');
    console.log('📤 Endpoint:', `${this.config.baseUrl}/ensemble-test`);
    console.log('📋 Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🔧 Headers:', headers);
    console.log('⚙️ Config:', {
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      timeout: this.config.timeout
    });
    console.groupEnd();

    // Only add headers that are explicitly allowed by the API CORS configuration
    const sessionId = options.sessionId || this.config.sessionId;
    const userId = options.userId || this.config.userId;
    const authToken = options.authToken || this.config.authToken;

    // According to API docs, only these headers are allowed:
    // Content-Type, Authorization, X-Requested-With, X-User-Id

    // Temporarily removing all custom headers due to CORS restrictions
    // The API documentation shows these are allowed, but the server CORS config seems more restrictive
    // if (sessionId) headers['X-Session-ID'] = sessionId;
    // if (userId && userId.trim() !== '') headers['X-User-Id'] = userId;
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    // Log session and user info for debugging without sending in headers
    if (sessionId) {
      console.log('🔗 Session ID (not sent due to CORS):', sessionId);
    }
    if (userId) {
      console.log('🆔 User ID (not sent due to CORS):', userId);
    }

    const ensembleResponse = await this.makeRequest<EnsembleResponse>(
      NEURASTACK_ENDPOINTS.ENSEMBLE,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: options.signal,
        timeout: options.timeout || this.config.timeout
      }
    );

    // Transform the ensemble response to match the expected NeuraStackQueryResponse format
    return this.transformEnsembleResponse(ensembleResponse);
  }

  /**
   * Get memory metrics for a user (with caching)
   */
  async getMemoryMetrics(userId?: string): Promise<MemoryMetrics> {
    const targetUserId = userId || this.config.userId;
    const cacheKey = `memory-metrics-${targetUserId}`;

    // Try cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Temporarily commented out due to CORS policy restrictions
    // if (targetUserId) headers['X-User-Id'] = targetUserId;
    if (this.config.authToken) headers['Authorization'] = `Bearer ${this.config.authToken}`;

    const result = await this.makeRequest<MemoryMetrics>(
      NEURASTACK_ENDPOINTS.MEMORY_METRICS,
      {
        method: 'GET',
        headers
      }
    );

    // Cache the result for 2 minutes
    cacheManager.set(cacheKey, result, {
      ttl: 2 * 60 * 1000,
      tags: ['api', 'memory', 'metrics']
    });

    return result;
  }

  /**
   * Get session context
   */
  async getSessionContext(_sessionId?: string): Promise<SessionContext> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Temporarily commented out due to CORS policy restrictions
    // const targetSessionId = sessionId || this.config.sessionId;
    // if (targetSessionId) headers['X-Session-ID'] = targetSessionId;
    if (this.config.authToken) headers['Authorization'] = `Bearer ${this.config.authToken}`;

    return this.makeRequest<SessionContext>(
      NEURASTACK_ENDPOINTS.MEMORY_CONTEXT,
      {
        method: 'GET',
        headers
      }
    );
  }

  /**
   * Check service health (with caching)
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    const cacheKey = 'health-check';

    // Try cache first (short TTL for health checks)
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.makeRequest<{ status: string; message: string }>(
      NEURASTACK_ENDPOINTS.HEALTH,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // Cache for 30 seconds
    cacheManager.set(cacheKey, result, {
      ttl: 30 * 1000,
      tags: ['api', 'health']
    });

    return result;
  }

  /**
   * Transform ensemble response to legacy format for backward compatibility
   */
  private transformEnsembleResponse(ensembleResponse: EnsembleResponse): NeuraStackQueryResponse {
    if (ensembleResponse.status !== 'success' || !ensembleResponse.data) {
      throw new NeuraStackApiError({
        error: ensembleResponse.error || 'Ensemble API Error',
        message: ensembleResponse.message || 'Failed to get successful response from ensemble API',
        statusCode: 500,
        timestamp: ensembleResponse.timestamp || new Date().toISOString()
      });
    }

    const { data } = ensembleResponse;

    // Create individual responses for UI display
    const individualResponses: SubAnswer[] = data.roles.map(role => ({
      model: role.model,
      answer: role.content,
      role: this.mapRoleToDisplayName(role.role)
    }));

    // Create models used mapping
    const modelsUsed: Record<string, boolean> = {};
    data.roles.forEach(role => {
      modelsUsed[role.model] = role.status === 'fulfilled';
    });

    // Create legacy ensemble metadata
    const ensembleMetadata: LegacyEnsembleMetadata = {
      evidenceAnalyst: data.roles.find(r => r.role === 'evidence_analyst')?.content || '',
      innovator: data.roles.find(r => r.role === 'innovator')?.content || '',
      riskReviewer: data.roles.find(r => r.role === 'risk_reviewer')?.content || '',
      executionTime: data.metadata.processingTimeMs
    };

    // Estimate token count (rough approximation: 1 token ≈ 4 characters)
    const tokenCount = Math.ceil(data.synthesis.content.length / 4);

    return {
      answer: data.synthesis.content,
      ensembleMode: true,
      modelsUsed,
      executionTime: `${data.metadata.processingTimeMs}ms`,
      tokenCount,
      ensembleMetadata,
      individualResponses,
      fallbackReasons: data.roles
        .filter(role => role.status === 'rejected')
        .reduce((acc, role) => {
          acc[role.model] = 'Role execution failed';
          return acc;
        }, {} as Record<string, string>)
    };
  }

  /**
   * Map API role names to display names
   */
  private mapRoleToDisplayName(role: string): string {
    switch (role) {
      case 'evidence_analyst': return 'Evidence Analyst';
      case 'innovator': return 'Innovator';
      case 'risk_reviewer': return 'Risk Reviewer';
      default: return role;
    }
  }

  /**
   * Generic request method with error handling and timeout
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number }
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        signal: options.signal || controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);

        // Log API errors
        console.group('❌ NeuraStack API Error');
        console.log('🚫 Status:', response.status, response.statusText);
        console.log('📋 Error Data:', JSON.stringify(errorData, null, 2));
        console.log('🔗 URL:', `${this.config.baseUrl}${endpoint}`);
        console.groupEnd();

        throw new NeuraStackApiError(errorData);
      }

      const data = await response.json();

      // Log the API response
      console.group('📥 NeuraStack API Response');
      console.log('✅ Status:', response.status, response.statusText);
      console.log('📊 Response Data:', JSON.stringify(data, null, 2));
      console.log('⏱️ Response Headers:', Object.fromEntries(response.headers.entries()));
      console.groupEnd();

      return data as T;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof NeuraStackApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new NeuraStackApiError({
          error: 'Request Timeout',
          message: 'Request timed out. Please try again.',
          statusCode: 408,
          timestamp: new Date().toISOString()
        });
      }

      throw new NeuraStackApiError({
        error: 'Network Error',
        message: 'Failed to connect to NeuraStack API. Please check your connection.',
        statusCode: 0,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<NeuraStackError> {
    try {
      const errorData = await response.json();
      return {
        error: errorData.error || 'API Error',
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status as NeuraStackErrorCode,
        timestamp: errorData.timestamp || new Date().toISOString()
      };
    } catch {
      return {
        error: 'API Error',
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status as NeuraStackErrorCode,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ============================================================================
// Custom Error Class
// ============================================================================

export class NeuraStackApiError extends Error {
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly retryable: boolean;

  constructor(errorData: NeuraStackError) {
    super(errorData.message);
    this.name = 'NeuraStackApiError';
    this.statusCode = errorData.statusCode;
    this.timestamp = errorData.timestamp;
    this.retryable = this.isRetryable(errorData.statusCode);
  }

  private isRetryable(statusCode: number): boolean {
    return statusCode >= 500 || statusCode === 429 || statusCode === 408;
  }
}

// ============================================================================
// Default Client Instance
// ============================================================================

export const neuraStackClient = new NeuraStackClient();
