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
    TierConfigResponse,
    TierDowngradeRequest,
    TierDowngradeResponse,
    TierInfoResponse,
    TierUpgradeRequest,
    TierUpgradeResponse,
    UserTierInfoResponse
} from './types';

// Additional tier management imports


// ============================================================================
// Error Types
// ============================================================================

export interface NeuraStackError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  correlationId?: string; // For debugging issues per API spec
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
  // Enhanced ensemble endpoint (when backend is ready)
  ENHANCED_ENSEMBLE: '/api/enhanced-ensemble',



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
  ESTIMATE_COST: '/estimate-cost',

  // Tier management endpoints
  USER_TIER_INFO: '/tiers/info',
  TIER_UPGRADE: '/tiers/upgrade',
  TIER_DOWNGRADE: '/tiers/downgrade',
  TIER_CONFIG: '/tiers/config'
} as const;

// Models are managed by the backend ensemble - no hardcoding needed
// According to API integration guide, ensemble uses:
// - OpenAI: gpt-4o-mini
// - Google: gemini-1.5-flash
// - Anthropic: claude-3-5-haiku-latest

export const NEURASTACK_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  SESSION_ID: 'X-Session-Id',
  USER_ID: 'X-User-Id',
  CORRELATION_ID: 'X-Correlation-ID',
  AUTHORIZATION: 'Authorization'
} as const;

// ============================================================================
// API Client Implementation
// ============================================================================

export class NeuraStackClient {
  private config: Required<NeuraStackClientConfig>;

  constructor(config: NeuraStackClientConfig = {}) {
    // Determine the appropriate backend URL based on environment with enhanced validation
    const getBackendUrl = () => {
      // If explicitly provided in config, use that (highest priority)
      if (config.baseUrl) {
        return config.baseUrl.replace(/\/$/, "");
      }

      // Check for environment variable (second priority)
      const envUrl = import.meta.env.VITE_BACKEND_URL;
      if (envUrl && envUrl.trim() !== '') {
        const cleanUrl = envUrl.replace(/\/$/, "");

        // CRITICAL: Prevent localhost in production builds
        if (cleanUrl.includes('localhost') && import.meta.env.PROD) {
          console.error('🚨 CRITICAL: Production build detected localhost URL!');
          console.error('🚨 Environment variable VITE_BACKEND_URL contains localhost in production');
          console.error('🚨 Forcing production URL to prevent connection failures...');
          return "https://neurastack-backend-638289111765.us-central1.run.app";
        }

        return cleanUrl;
      }

      // ALWAYS use production URL as fallback
      // This ensures production builds never accidentally use localhost
      return "https://neurastack-backend-638289111765.us-central1.run.app";
    };

    const backendUrl = getBackendUrl();

    /**
     * ============================================================================
     * BACKEND URL DETECTION DEBUG OUTPUT
     * ============================================================================
     *
     * This debug output helps you understand how the NeuraStack client determines
     * which backend URL to use. The detection follows this priority order:
     *
     * 1. EXPLICIT CONFIG: If baseUrl is provided in client config
     * 2. ENVIRONMENT VARIABLE: If VITE_BACKEND_URL is set in .env files
     * 3. FALLBACK: Always uses production backend as default
     *
     * EXPECTED OUTPUTS:
     * - Production: "https://neurastack-backend-638289111765.us-central1.run.app" (default)
     * - Override: Whatever URL is set in VITE_BACKEND_URL or config.baseUrl
     *
     * TROUBLESHOOTING:
     * - To use localhost in development: Set VITE_BACKEND_URL=http://localhost:8080 in .env.local
     * - Environment variables take precedence over defaults
     * - No automatic localhost detection to prevent production issues
     */

    // Log backend URL configuration for debugging (development only)
    if (import.meta.env.DEV) {
      console.group('🔧 NeuraStack Client Configuration');
      console.log('');
      console.log('📍 FINAL BACKEND URL:', `%c${backendUrl}`, 'color: #00ff00; font-weight: bold; font-size: 14px;');
      console.log('');
      console.log('🔍 Detection Details:');
      console.log('  🌐 Current Hostname:', window.location.hostname);
      console.log('  🏗️  Vite DEV Mode:', import.meta.env.DEV ? '✅ Enabled' : '❌ Disabled');
      console.log('  🏗️  Vite PROD Mode:', import.meta.env.PROD ? '✅ Enabled' : '❌ Disabled');
      console.log('  📝 VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL || '❌ Not Set');
      console.log('  🎯 Config BaseURL:', config.baseUrl || '❌ Not Provided');
      console.log('  🔒 Mode:', import.meta.env.MODE);
      console.log('');

      // Show which detection method was used
      if (config.baseUrl) {
        console.log('🎯 URL Source: %cExplicit Config Override%c', 'color: #ff9500; font-weight: bold;', 'color: inherit;');
      } else if (import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_BACKEND_URL.trim() !== '') {
        console.log('🎯 URL Source: %cEnvironment Variable (VITE_BACKEND_URL)%c', 'color: #ff9500; font-weight: bold;', 'color: inherit;');
      } else {
        console.log('🎯 URL Source: %cDefault Production Backend%c', 'color: #0099ff; font-weight: bold;', 'color: inherit;');
      }
    }

    // CRITICAL: Validate that we're not using localhost in production
    if (backendUrl.includes('localhost') && import.meta.env.PROD) {
      console.error('🚨 CRITICAL ERROR: Production build is trying to use localhost!');
      console.error('🚨 This will cause connection failures in production.');
      console.error('🚨 Forcing production URL...');
      // Force production URL if localhost detected in production
      const forcedUrl = "https://neurastack-backend-638289111765.us-central1.run.app";
      console.log('🔧 FORCED URL:', `%c${forcedUrl}`, 'color: #ff0000; font-weight: bold;');
      this.config = {
        baseUrl: forcedUrl,
        sessionId: config.sessionId || crypto.randomUUID(),
        userId: config.userId || '',
        authToken: config.authToken || '',
        timeout: config.timeout || 45000, // 45 seconds minimum per API integration guide
        useEnsemble: config.useEnsemble ?? true
      };
      console.groupEnd();
      return;
    }

    console.log('');
    console.log('💡 Tips:');
    console.log('  • To use localhost: Set VITE_BACKEND_URL=http://localhost:8080 in .env.local');
    console.log('  • To use production: Remove VITE_BACKEND_URL or set to production URL');
    console.log('  • No automatic localhost detection - must be explicitly configured');
    console.log('  • This prevents production builds from accidentally using localhost');
    console.groupEnd();

    this.config = {
      baseUrl: backendUrl,
      sessionId: config.sessionId || crypto.randomUUID(),
      userId: config.userId || '',
      authToken: config.authToken || '',
      timeout: config.timeout || 45000, // 45 seconds minimum per API integration guide (responses take 15-30s)
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
    // Get user ID and session ID
    const userId = options.userId || this.config.userId;
    const sessionId = options.sessionId || this.config.sessionId;

    // Generate correlation ID in the required format: ensemble-{{timestamp}}-{{userID}}
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-${userId || 'anonymous'}`;

    // Prepare request body according to backend documentation
    // Note: sessionId goes in headers (X-Session-Id), NOT in request body
    const requestBody = {
      prompt: prompt || "Quick sanity check: explain AI in 1-2 lines.",
      explain: (options as any).explain ?? false // Default to false per API guide
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add required headers according to backend documentation
    if (userId && userId.trim() !== '') {
      headers['X-User-Id'] = userId;
    }

    // Add session ID header
    if (sessionId && sessionId.trim() !== '') {
      headers['X-Session-Id'] = sessionId;
    }

    // Add correlation ID header for request tracking
    headers['X-Correlation-ID'] = correlationId;

    // Log the outgoing request (development only)
    if (import.meta.env.DEV) {
      console.group('🚀 NeuraStack Default Ensemble API Request');
      console.log('📤 Endpoint:', `${this.config.baseUrl}${NEURASTACK_ENDPOINTS.DEFAULT_ENSEMBLE}`);
      console.log('📋 Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('🔧 Headers (CORS-compliant):', headers);
      console.log('⚙️ Config:', {
        sessionId: this.config.sessionId,
        userId: this.config.userId,
        timeout: this.config.timeout,
        correlationId: correlationId + ' (for logging only)'
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
          'Content-Type': 'application/json'
        },
        bustCache: true
      }
    );

    return result;
  }

  /**
   * Store a memory for future context
   */
  async storeMemory(request: StoreMemoryRequest): Promise<StoreMemoryResponse> {
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-${request.userId || 'anonymous'}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId
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
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-${request.userId || 'anonymous'}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId
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
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-${request.userId || 'anonymous'}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId
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
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-${userId || 'anonymous'}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId
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
          'Content-Type': 'application/json'
        },
        bustCache: true
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
          'Content-Type': 'application/json'
        },
        bustCache: true
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
          'Content-Type': 'application/json'
        },
        bustCache: true
      }
    );

    return result;
  }

  /**
   * Estimate cost for processing a specific prompt
   */
  async estimateCost(request: CostEstimateRequest): Promise<CostEstimateResponse> {
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-anonymous`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId
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

  // ============================================================================
  // Tier Management Methods
  // ============================================================================

  /**
   * Get user tier information and usage statistics
   */
  async getUserTierInfo(userId: string): Promise<UserTierInfoResponse> {
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-${userId || 'anonymous'}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId
    };

    if (userId) headers['X-User-Id'] = userId;

    return this.makeRequest<UserTierInfoResponse>(
      `${NEURASTACK_ENDPOINTS.USER_TIER_INFO}/${userId}`,
      {
        method: 'GET',
        headers,
        bustCache: true
      }
    );
  }

  /**
   * Upgrade user to premium tier
   */
  async upgradeTier(request: TierUpgradeRequest): Promise<TierUpgradeResponse> {
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-${request.userId || 'anonymous'}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId
    };

    if (request.userId) headers['X-User-Id'] = request.userId;

    return this.makeRequest<TierUpgradeResponse>(
      NEURASTACK_ENDPOINTS.TIER_UPGRADE,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      }
    );
  }

  /**
   * Downgrade user to free tier
   */
  async downgradeTier(request: TierDowngradeRequest): Promise<TierDowngradeResponse> {
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-${request.userId || 'anonymous'}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId
    };

    if (request.userId) headers['X-User-Id'] = request.userId;

    return this.makeRequest<TierDowngradeResponse>(
      NEURASTACK_ENDPOINTS.TIER_DOWNGRADE,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      }
    );
  }

  /**
   * Get tier configurations for all available tiers
   */
  async getTierConfigurations(): Promise<TierConfigResponse> {
    const timestamp = Date.now();
    const correlationId = `ensemble-${timestamp}-anonymous`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId
    };

    return this.makeRequest<TierConfigResponse>(
      NEURASTACK_ENDPOINTS.TIER_CONFIG,
      {
        method: 'GET',
        headers,
        bustCache: true
      }
    );
  }

  /**
   * Transform ensemble response to simplified format for new API
   * Following API spec: synthesis.content is main response, roles are individual responses
   */
  private transformEnsembleResponse(ensembleResponse: EnsembleResponse): NeuraStackQueryResponse {
    // Debug: Log the full response structure to understand the data
    if (import.meta.env.DEV) {
      console.group('🔍 Ensemble Response Debug');
      console.log('📊 Full Response:', JSON.stringify(ensembleResponse, null, 2));
      console.log('📊 Status:', ensembleResponse.status);
      console.log('📊 Has Data:', !!ensembleResponse.data);
      console.groupEnd();
    }

    // Always check status === 'success' before processing (per API spec)
    if (ensembleResponse.status !== 'success' || !ensembleResponse.data) {
      const errorMessage = ensembleResponse.message || 'Failed to get successful response from ensemble API';
      const errorDetails = `Status: ${ensembleResponse.status}, Error: ${ensembleResponse.error || 'Unknown'}, Message: ${errorMessage}`;

      console.error('❌ Ensemble processing failed:', errorDetails);

      throw new NeuraStackApiError({
        error: ensembleResponse.error || 'Ensemble processing failed',
        message: errorDetails,
        statusCode: 500,
        timestamp: ensembleResponse.timestamp || new Date().toISOString(),
        correlationId: ensembleResponse.correlationId
      });
    }

    const { data } = ensembleResponse;

    // Debug: Log the full response structure to understand the data
    if (import.meta.env.DEV) {
      console.group('🔍 Ensemble Response Structure Debug');
      console.log('📊 Full Response:', JSON.stringify(ensembleResponse, null, 2));
      console.log('📊 Data Object:', JSON.stringify(data, null, 2));
      console.log('📊 Synthesis:', JSON.stringify(data.synthesis, null, 2));
      console.log('📊 Roles Count:', data.roles?.length || 0);
      console.log('📊 Roles:', JSON.stringify(data.roles, null, 2));
      console.log('📊 Voting:', JSON.stringify(data.voting, null, 2));
      console.log('📊 Metadata:', JSON.stringify(data.metadata, null, 2));
      console.groupEnd();
    }

    // Validate required response structure per API spec
    if (!data.synthesis || !data.synthesis.content) {
      throw new NeuraStackApiError({
        error: 'Invalid Response Structure',
        message: 'Missing synthesis.content in API response',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        correlationId: ensembleResponse.correlationId
      });
    }

    // Create individual responses for UI display using new format
    // roles: Array of individual AI responses (character limited per API spec)
    const individualResponses: SubAnswer[] = (data.roles || []).map((role, index) => {
      // Debug logging for role structure
      if (import.meta.env.DEV) {
        console.log(`🔍 Role ${index} structure:`, {
          role: role?.role,
          model: role?.model,
          provider: role?.provider,
          hasContent: !!role?.content,
          status: role?.status
        });
      }

      // Map role names to model names based on API integration guide
      const getModelFromRole = (roleName: string): string => {
        switch (roleName) {
          case 'gpt4o': return 'gpt-4o-mini';
          case 'gemini': return 'gemini-1.5-flash';
          case 'claude': return 'claude-3-5-haiku-latest';
          default: return roleName || 'unknown-model';
        }
      };

      // Map role names to providers based on API integration guide
      const getProviderFromRole = (roleName: string): string => {
        switch (roleName) {
          case 'gpt4o': return 'openai';
          case 'gemini': return 'google';
          case 'claude': return 'anthropic';
          default: return 'unknown';
        }
      };

      // Ensure role object has required properties with fallbacks
      const safeRole = {
        model: role?.model || getModelFromRole(role?.role),
        content: role?.content || '',
        role: role?.role || 'assistant',
        provider: role?.provider || getProviderFromRole(role?.role),
        status: role?.status
      };

      return {
        model: safeRole.model,
        content: safeRole.content, // Primary field for new API
        answer: safeRole.content,  // Legacy field for backward compatibility
        role: safeRole.role, // Keep the original role for reference
        provider: safeRole.provider || this.extractProviderFromModel(safeRole.model), // Use API provider or extract from model name
        status: safeRole.status === 'fulfilled' ? 'fulfilled' : 'rejected', // Use new API status format
        reason: safeRole.status === 'rejected' ? 'Model failed to respond' : undefined,
        wordCount: safeRole.content ? safeRole.content.split(' ').length : 0,

        // Enhanced confidence data from API response
        confidence: role.confidence ? {
          score: typeof role.confidence.score === 'number' ? role.confidence.score : 0,
          level: role.confidence.level || 'medium',
          factors: Array.isArray(role.confidence.factors) ? role.confidence.factors : []
        } : undefined,
        responseTime: role.responseTime || 0,
        characterCount: role.characterCount || 0,

        // Quality metrics from API response
        quality: {
          wordCount: role.wordCount || (role.content ? role.content.split(' ').length : 0),
          sentenceCount: role.quality?.sentenceCount || (role.content ? role.content.split(/[.!?]+/).length - 1 : 0),
          averageWordsPerSentence: role.quality?.averageWordsPerSentence || 15,
          hasStructure: role.quality?.hasStructure ?? true,
          hasReasoning: role.quality?.hasReasoning ?? true,
          complexity: role.quality?.complexity || 'medium'
        },

        // Metadata from API response
        metadata: {
          confidenceLevel: role.confidence?.level || 'medium',
          modelReliability: role.confidence?.score || 0.7,
          processingTime: role.responseTime || 0,
          tokenCount: role.metadata?.tokenCount || Math.ceil((role.characterCount || 0) / 4),
          complexity: role.metadata?.complexity || 'medium'
        },

        // Include ensemble data for enhanced model cards
        overallConfidence: data.synthesis?.overallConfidence || data.metadata?.confidenceAnalysis?.overallConfidence,
        synthesisStrategy: data.synthesis?.synthesisStrategy,
        votingResults: data.voting ? [{
          role: role.role, // Keep for backward compatibility
          model: role.model,
          confidence: role.confidence?.score || 0,
          weightedScore: data.voting.weights?.[role.model] || 0, // Use model instead of role for weights
          confidenceLevel: role.confidence?.level || 'medium'
        }] : undefined,
        isFineTuned: data.synthesis?.isFineTuned || false
      };
    });

    // Debug logging for individualResponses
    if (import.meta.env.DEV) {
      console.group('🔍 neurastack-client individualResponses Debug');
      console.log('📊 Created individualResponses count:', individualResponses.length);
      console.log('📊 individualResponses:', individualResponses.map(r => ({
        model: r.model,
        role: r.role,
        provider: r.provider,
        status: r.status,
        hasContent: !!r.content
      })));
      console.groupEnd();
    }

    // Create models used mapping based on model names (aligned with API integration guide)
    const modelsUsed: Record<string, boolean> = {};
    (data.roles || []).forEach(role => {
      // Use the actual model name from the API response as the primary identifier
      const modelName = role.model || (() => {
        // Fallback to role-based mapping only if model field is missing
        switch (role.role) {
          case 'gpt4o': return 'gpt-4o-mini';
          case 'gemini': return 'gemini-1.5-flash';
          case 'claude': return 'claude-3-5-haiku-latest';
          default: return role.role || 'unknown-model';
        }
      })();
      modelsUsed[modelName] = role.status === 'fulfilled'; // Only count successful models
    });

    // Estimate token count (rough approximation: 1 token ≈ 4 characters)
    // synthesis.content: Main AI response (unlimited length per API spec)
    const tokenCount = Math.ceil(data.synthesis.content.length / 4);

    return {
      answer: data.synthesis.content, // Main AI response per API spec
      ensembleMode: true,
      modelsUsed,
      executionTime: `${data.metadata?.processingTimeMs || 0}ms`,
      tokenCount,
      individualResponses, // Individual AI responses (character limited)
      fallbackReasons: {}, // No fallback reasons for successful responses
      correlationId: ensembleResponse.correlationId, // For debugging per API spec
      metadata: {
        ...data.metadata, // Performance metrics and quality indicators per API spec
        synthesis: data.synthesis // Include synthesis data for UI
      },
      // Include raw API response for EnsembleInfoModal
      rawApiResponse: ensembleResponse
    };
  }

  /**
   * Extract provider name from model string
   * Robust handling of undefined/null model values
   * Aligned with NeuraStack AI Ensemble API Integration Guide
   */
  private extractProviderFromModel(model: string | undefined | null): string {
    // Handle undefined, null, or empty model values
    if (!model || typeof model !== 'string') {
      return 'unknown';
    }

    // Convert to lowercase for case-insensitive matching
    const modelLower = model.toLowerCase();

    // Match provider names according to API integration guide
    if (modelLower.includes('gpt') || modelLower.includes('openai')) return 'openai';
    if (modelLower.includes('gemini') || modelLower.includes('google')) return 'google';
    if (modelLower.includes('claude') || modelLower.includes('anthropic')) return 'anthropic';
    if (modelLower.includes('grok') || modelLower.includes('xai')) return 'xai';

    return 'unknown';
  }



  /**
   * Generic request method with error handling and timeout
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number; bustCache?: boolean }
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

    // Add aggressive cache-busting parameters to URL (CORS-compliant approach)
    let finalEndpoint = endpoint;
    if (options.bustCache !== false) { // Default to true unless explicitly set to false
      const separator = endpoint.includes('?') ? '&' : '?';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const appVersion = (__APP_VERSION__ || '3.0.0').replace(/\./g, '');
      const buildTime = (__BUILD_TIME__ || Date.now().toString()).substr(-8);
      finalEndpoint = `${endpoint}${separator}_t=${timestamp}&_r=${random}&_v=${appVersion}&_b=${buildTime}`;
    }

    try {
      // Only use backend-approved headers (no additional cache-busting headers)
      // Cache busting is handled via URL parameters and fetch cache option
      const response = await fetch(`${this.config.baseUrl}${finalEndpoint}`, {
        ...options,
        signal: options.signal || controller.signal,
        // Browser-level cache control (doesn't affect CORS)
        cache: 'no-store'
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

      // Log detailed error information for debugging
      console.group('❌ API Request Error');
      console.error('Error Type:', error instanceof Error ? error.name : typeof error);
      console.error('Error Message:', error instanceof Error ? error.message : String(error));
      console.error('Endpoint:', `${this.config.baseUrl}${finalEndpoint}`);
      console.error('Request Options:', JSON.stringify(options, null, 2));
      console.groupEnd();

      if (error instanceof Error && error.name === 'AbortError') {
        throw new NeuraStackApiError({
          error: 'Request Timeout',
          message: 'Request timed out. Please try again.',
          statusCode: 408,
          timestamp: new Date().toISOString()
        });
      }

      // Enhanced network error with more details
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new NeuraStackApiError({
        error: 'Network Error',
        message: `Failed to connect to NeuraStack API (${this.config.baseUrl}): ${errorMessage}. Please check your connection.`,
        statusCode: 0,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Parse error response from API with correlation ID support
   */
  private async parseErrorResponse(response: Response): Promise<NeuraStackError> {
    try {
      const errorData = await response.json();
      return {
        error: errorData.error || 'API Error',
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status as NeuraStackErrorCode,
        timestamp: errorData.timestamp || new Date().toISOString(),
        correlationId: errorData.correlationId || response.headers.get('X-Correlation-ID') || undefined
      };
    } catch {
      return {
        error: 'API Error',
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status as NeuraStackErrorCode,
        timestamp: new Date().toISOString(),
        correlationId: response.headers.get('X-Correlation-ID') || undefined
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
  public readonly correlationId?: string;

  constructor(errorData: NeuraStackError) {
    super(errorData.message);
    this.name = 'NeuraStackApiError';
    this.statusCode = errorData.statusCode;
    this.timestamp = errorData.timestamp;
    this.correlationId = errorData.correlationId;
    this.retryable = this.isRetryable(errorData.statusCode);
  }

  private isRetryable(statusCode: number): boolean {
    // Implement retry logic for transient failures per API spec
    return statusCode >= 500 || statusCode === 429 || statusCode === 408;
  }
}

// ============================================================================
// Default Client Instance
// ============================================================================

export const neuraStackClient = new NeuraStackClient();
