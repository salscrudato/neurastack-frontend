/**
 * NeuraStack API Client - Latest Backend Integration
 * 
 * Comprehensive TypeScript client for the NeuraStack backend API
 * with full type safety, error handling, and modern features.
 */

// Removed cacheManager import - NO CACHING for fresh API calls
import type {
    CostEstimateRequest,
    CostEstimateResponse,
    DetailedHealthResponse,
    EnsembleResponse,
    MemoryAnalyticsResponse,
    MemoryContextRequest,
    MemoryContextResponse,
    MemoryHealthResponse,
    MemoryMetrics,
    MetricsResponse,
    NeuraStackQueryRequest,
    NeuraStackQueryResponse,
    RetrieveMemoryRequest,
    SessionContext,
    StoreMemoryRequest,
    StoreMemoryResponse,
    SubAnswer,
    TierInfoResponse,
    WorkoutAPIRequest,
    WorkoutAPIResponse
} from './types';

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
  // Primary ensemble endpoint (enhanced with production features)
  DEFAULT_ENSEMBLE: '/default-ensemble',
  // Legacy ensemble endpoint (maintained for backward compatibility)
  ENSEMBLE: '/ensemble-test',
  QUERY: '/api/query', // Legacy endpoint for backward compatibility

  // Workout generation endpoint
  WORKOUT: '/workout',

  // Memory management endpoints
  MEMORY_STORE: '/memory/store',
  MEMORY_RETRIEVE: '/memory/retrieve',
  MEMORY_CONTEXT: '/memory/context',
  MEMORY_ANALYTICS: '/memory/analytics',
  MEMORY_HEALTH: '/memory/health',

  // Enhanced monitoring endpoints
  HEALTH: '/health',
  HEALTH_DETAILED: '/health-detailed',
  METRICS: '/metrics',
  TIER_INFO: '/tier-info',
  ESTIMATE_COST: '/estimate-cost'
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
    // Determine the appropriate backend URL based on environment
    const getBackendUrl = () => {
      // If explicitly provided in config, use that
      if (config.baseUrl) {
        return config.baseUrl.replace(/\/$/, "");
      }

      // Check for environment variable
      if (import.meta.env.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
      }

      // Auto-detect local development
      const isLocalDev = import.meta.env.DEV ||
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('local');

      if (isLocalDev) {
        return "http://localhost:8080";
      }

      // Default to production
      return "https://neurastack-backend-638289111765.us-central1.run.app";
    };

    const backendUrl = getBackendUrl();



    this.config = {
      baseUrl: backendUrl,
      sessionId: config.sessionId || crypto.randomUUID(),
      userId: config.userId || '',
      authToken: config.authToken || '',
      timeout: config.timeout || 30000, // 30 seconds (backend timeout is 25s + buffer)
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
   * Query the AI with a prompt using the enhanced Default Ensemble API
   */
  async queryAI(
    prompt: string,
    options: NeuraStackRequestOptions & Partial<NeuraStackQueryRequest> = {}
  ): Promise<NeuraStackQueryResponse> {
    // Prepare request body according to backend documentation
    const requestBody = {
      prompt: prompt || "Quick sanity check: explain AI in 1-2 lines."
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add required headers according to backend documentation
    const userId = options.userId || this.config.userId;
    if (userId && userId.trim() !== '') {
      headers['X-User-Id'] = userId;
    }

    // Generate correlation ID for request tracking (optional but recommended)
    const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    headers['X-Correlation-ID'] = correlationId;

    // Add authentication if available
    const authToken = options.authToken || this.config.authToken;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Log the outgoing request (development only)
    if (import.meta.env.DEV) {
      console.group('🚀 NeuraStack Default Ensemble API Request');
      console.log('📤 Endpoint:', `${this.config.baseUrl}${NEURASTACK_ENDPOINTS.DEFAULT_ENSEMBLE}`);
      console.log('📋 Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('🔧 Headers:', headers);
      console.log('⚙️ Config:', {
        sessionId: this.config.sessionId,
        userId: this.config.userId,
        timeout: this.config.timeout,
        correlationId
      });
      console.groupEnd();
    }

    const ensembleResponse = await this.makeRequest<EnsembleResponse>(
      NEURASTACK_ENDPOINTS.DEFAULT_ENSEMBLE,
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
   * Get memory metrics for a user (NO CACHING for fresh data)
   */
  async getMemoryMetrics(userId?: string): Promise<MemoryMetrics> {
    const targetUserId = userId || this.config.userId;

    if (!targetUserId) {
      // Return empty metrics if no user ID
      return {
        totalMemories: 0,
        averageImportance: 0,
        averageCompressionRatio: 0,
        totalTokensSaved: 0,
        memoryByType: {
          working: 0,
          short_term: 0,
          long_term: 0,
          semantic: 0,
          episodic: 0
        },
        retentionStats: {
          active: 0,
          archived: 0,
          expired: 0
        },
        accessPatterns: {
          hourly: new Array(24).fill(0),
          daily: new Array(7).fill(0),
          weekly: new Array(4).fill(0)
        }
      };
    }

    // NO CACHING - Always fetch fresh memory metrics

    try {
      const analyticsResponse = await this.getMemoryAnalytics(targetUserId);

      // Transform analytics response to legacy MemoryMetrics format
      const result: MemoryMetrics = {
        totalMemories: analyticsResponse.metrics.totalMemories,
        averageImportance: analyticsResponse.metrics.averageImportance,
        averageCompressionRatio: 0.7, // Default value since not in new API
        totalTokensSaved: 0, // Default value since not in new API
        memoryByType: analyticsResponse.metrics.memoryTypes as Record<string, number>,
        retentionStats: {
          active: analyticsResponse.metrics.totalMemories - analyticsResponse.metrics.archivedCount,
          archived: analyticsResponse.metrics.archivedCount,
          expired: 0 // Default value since not in new API
        },
        accessPatterns: {
          hourly: new Array(24).fill(0),
          daily: new Array(7).fill(0),
          weekly: new Array(4).fill(0)
        }
      };

      // NO CACHING - Return fresh result
      return result;
    } catch (error) {
      console.warn('Failed to get memory analytics:', error);
      // Return empty metrics on error
      return {
        totalMemories: 0,
        averageImportance: 0,
        averageCompressionRatio: 0,
        totalTokensSaved: 0,
        memoryByType: {
          working: 0,
          short_term: 0,
          long_term: 0,
          semantic: 0,
          episodic: 0
        },
        retentionStats: {
          active: 0,
          archived: 0,
          expired: 0
        },
        accessPatterns: {
          hourly: new Array(24).fill(0),
          daily: new Array(7).fill(0),
          weekly: new Array(4).fill(0)
        }
      };
    }
  }

  /**
   * Get session context
   */
  async getSessionContext(sessionId?: string): Promise<SessionContext> {
    const targetSessionId = sessionId || this.config.sessionId;
    const userId = this.config.userId;

    if (!userId || !targetSessionId) {
      // Return empty context if no user or session
      return {
        sessionId: targetSessionId || '',
        userId: userId || '',
        context: '',
        memoryCount: 0,
        lastActivity: new Date().toISOString()
      };
    }

    try {
      const memoryContext = await this.getMemoryContext({
        userId,
        sessionId: targetSessionId,
        maxTokens: 2048
      });

      return {
        sessionId: targetSessionId,
        userId,
        context: memoryContext.context,
        memoryCount: memoryContext.estimatedTokens,
        lastActivity: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Failed to get memory context:', error);
      return {
        sessionId: targetSessionId,
        userId,
        context: '',
        memoryCount: 0,
        lastActivity: new Date().toISOString()
      };
    }
  }

  /**
   * Check service health (with caching)
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    // NO CACHING - Always fetch fresh health status
    const result = await this.makeRequest<{ status: string; message: string }>(
      NEURASTACK_ENDPOINTS.HEALTH,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    return result;
  }

  /**
   * Store a memory for future context
   */
  async storeMemory(request: StoreMemoryRequest): Promise<StoreMemoryResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (request.userId) headers['X-User-Id'] = request.userId;

    return this.makeRequest<StoreMemoryResponse>(
      NEURASTACK_ENDPOINTS.MEMORY_STORE,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      }
    );
  }

  /**
   * Retrieve memories based on criteria
   */
  async retrieveMemories(request: RetrieveMemoryRequest): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (request.userId) headers['X-User-Id'] = request.userId;

    return this.makeRequest<any>(
      NEURASTACK_ENDPOINTS.MEMORY_RETRIEVE,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      }
    );
  }

  /**
   * Get memory context for AI prompts
   */
  async getMemoryContext(request: MemoryContextRequest): Promise<MemoryContextResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (request.userId) headers['X-User-Id'] = request.userId;
    if (request.sessionId) headers['X-Session-Id'] = request.sessionId;

    return this.makeRequest<MemoryContextResponse>(
      NEURASTACK_ENDPOINTS.MEMORY_CONTEXT,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      }
    );
  }

  /**
   * Get memory analytics for a user
   */
  async getMemoryAnalytics(userId: string): Promise<MemoryAnalyticsResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (userId) headers['X-User-Id'] = userId;

    return this.makeRequest<MemoryAnalyticsResponse>(
      `${NEURASTACK_ENDPOINTS.MEMORY_ANALYTICS}/${userId}`,
      {
        method: 'GET',
        headers
      }
    );
  }

  /**
   * Check memory system health
   */
  async checkMemoryHealth(): Promise<MemoryHealthResponse> {
    return this.makeRequest<MemoryHealthResponse>(
      NEURASTACK_ENDPOINTS.MEMORY_HEALTH,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  /**
   * Get detailed system health check with component status
   */
  async getDetailedHealth(): Promise<DetailedHealthResponse> {
    // NO CACHING - Always fetch fresh detailed health status
    const result = await this.makeRequest<DetailedHealthResponse>(
      NEURASTACK_ENDPOINTS.HEALTH_DETAILED,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    return result;
  }

  /**
   * Get comprehensive system metrics (NO CACHING for real-time data)
   */
  async getSystemMetrics(): Promise<MetricsResponse> {
    // NO CACHING - Always fetch fresh system metrics
    const result = await this.makeRequest<MetricsResponse>(
      NEURASTACK_ENDPOINTS.METRICS,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    return result;
  }

  /**
   * Get current tier information and available options
   */
  async getTierInfo(): Promise<TierInfoResponse> {
    // NO CACHING - Always fetch fresh tier info
    const result = await this.makeRequest<TierInfoResponse>(
      NEURASTACK_ENDPOINTS.TIER_INFO,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    return result;
  }

  /**
   * Estimate cost for processing a specific prompt
   */
  async estimateCost(request: CostEstimateRequest): Promise<CostEstimateResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    return this.makeRequest<CostEstimateResponse>(
      NEURASTACK_ENDPOINTS.ESTIMATE_COST,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      }
    );
  }

  /**
   * Generate a personalized workout using the dedicated workout API endpoint
   * NO CACHING - Always makes fresh API calls for workout generation
   */
  async generateWorkout(
    request: WorkoutAPIRequest,
    options: NeuraStackRequestOptions = {}
  ): Promise<WorkoutAPIResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add user identification headers
    const userId = options.userId || this.config.userId;
    if (userId && userId.trim() !== '') {
      headers['X-User-Id'] = userId;
    }

    // Generate correlation ID for request tracking - always unique to prevent caching
    const correlationId = `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
    headers['X-Correlation-ID'] = correlationId;

    // Add cache-busting headers to ensure fresh API calls
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
    headers['X-Requested-At'] = new Date().toISOString();

    // Log the outgoing workout request (development only)
    if (import.meta.env.DEV) {
      console.group('🏋️ NeuraStack Workout API Request');
      console.log('📤 Endpoint:', `${this.config.baseUrl}${NEURASTACK_ENDPOINTS.WORKOUT}`);
      console.log('📋 Request Body:', JSON.stringify(request, null, 2));
      console.log('🔧 Headers:', headers);
      console.log('⚙️ Config:', {
        userId: this.config.userId,
        timeout: this.config.timeout,
        correlationId
      });
      console.groupEnd();
    }

    try {
      const workoutResponse = await this.makeRequest<WorkoutAPIResponse>(
        NEURASTACK_ENDPOINTS.WORKOUT,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(request),
          signal: options.signal,
          timeout: options.timeout || this.config.timeout
        }
      );

      // Log successful workout generation
      console.group('🎯 Workout Generation Success');
      console.log('✅ Status:', workoutResponse.status);
      console.log('🏋️ Workout Type:', workoutResponse.data?.workout.type);
      console.log('⏱️ Duration:', workoutResponse.data?.workout.duration);
      console.log('📊 Exercise Count:', workoutResponse.data?.workout.exercises.length);
      console.log('🔗 Correlation ID:', workoutResponse.correlationId);
      console.groupEnd();

      return workoutResponse;
    } catch (error) {
      console.group('❌ Workout Generation Error');
      console.log('🚫 Error:', error);
      console.log('🔗 Correlation ID:', correlationId);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Transform ensemble response to simplified format for new API
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

    // Create individual responses for UI display using new format
    const individualResponses: SubAnswer[] = data.roles.map(role => ({
      model: role.model,
      answer: role.content,
      role: role.role, // Keep the original role for reference
      provider: this.extractProviderFromModel(role.model), // Extract provider from model name
      status: 'success', // All roles in successful response are considered successful
      wordCount: role.content ? role.content.split(' ').length : 0
    }));

    // Create models used mapping
    const modelsUsed: Record<string, boolean> = {};
    data.roles.forEach(role => {
      modelsUsed[role.model] = true; // All models in response are considered used
    });

    // Estimate token count (rough approximation: 1 token ≈ 4 characters)
    const tokenCount = Math.ceil(data.synthesis.content.length / 4);

    return {
      answer: data.synthesis.content,
      ensembleMode: true,
      modelsUsed,
      executionTime: `${data.metadata.processingTimeMs}ms`,
      tokenCount,
      individualResponses,
      fallbackReasons: {} // No fallback reasons for successful responses
    };
  }

  /**
   * Extract provider name from model string
   */
  private extractProviderFromModel(model: string): string {
    if (model.includes('gpt') || model.includes('openai')) return 'OPENAI';
    if (model.includes('gemini') || model.includes('google')) return 'GOOGLE';
    if (model.includes('claude') || model.includes('anthropic')) return 'ANTHROPIC';
    if (model.includes('grok') || model.includes('xai')) return 'XAI';
    return 'UNKNOWN';
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
