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
    WorkoutCompleteRequest,
    WorkoutCompleteResponse,
    WorkoutGenerateRequest,
    WorkoutGenerateResponse
} from './types';



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

  // New optimized workout endpoints (2-endpoint system) - Using actual backend endpoints
  WORKOUT_GENERATE: '/workout/generate-workout',
  WORKOUT_COMPLETE: '/workout/complete-workout',

  // Legacy workout endpoint (for backward compatibility)
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

    // ALWAYS log backend URL configuration for debugging
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
        timeout: config.timeout || 60000,
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
      timeout: config.timeout || 60000, // 60 seconds (API spec: responses may take 5-20s, up to 60+ seconds)
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
    // Generate correlation ID for request tracking
    const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare request body according to backend documentation
    const requestBody = {
      prompt: prompt || "Quick sanity check: explain AI in 1-2 lines.",
      sessionId: options.sessionId || this.config.sessionId
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add required headers according to backend documentation
    const userId = options.userId || this.config.userId;
    if (userId && userId.trim() !== '') {
      headers['X-User-Id'] = userId;
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
    // Note: X-Session-Id header removed to avoid CORS issues

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
   * Generate a personalized workout using the new flexible API specification
   *
   * Updated to match the new flexible API documentation:
   * - Flexible field mapping supporting natural language
   * - Optional fields with string or array support
   * - Free-form additionalInformation field
   */
  async generateWorkout(
    request: WorkoutGenerateRequest,
    options: NeuraStackRequestOptions = {}
  ): Promise<WorkoutGenerateResponse> {
    // Generate unique identifiers for request tracking
    const timestamp = Date.now();
    const randomPart1 = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    const correlationId = `workout-gen-${timestamp}-${randomPart1}-${randomPart2}`;

    // Prepare the request according to new API specification
    const apiRequest: WorkoutGenerateRequest = {
      age: request.age,
      fitnessLevel: request.fitnessLevel,
      equipment: request.equipment,
      goals: request.goals,
      gender: request.gender,
      weight: request.weight,
      injuries: request.injuries,
      timeAvailable: request.timeAvailable,
      daysPerWeek: request.daysPerWeek,
      workoutType: request.workoutType,
      otherInformation: request.otherInformation
    };

    // Prepare headers according to new API documentation
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add optional X-User-Id header for personalization
    const userId = options.userId || this.config.userId;
    if (userId && userId.trim() !== '') {
      headers['X-User-Id'] = userId;
    }

    // Add correlation ID for tracking
    headers['X-Correlation-ID'] = correlationId;

    try {
      // Use the new generate workout endpoint
      const workoutEndpoint = NEURASTACK_ENDPOINTS.WORKOUT_GENERATE;

      // Development logging for new flexible API
      if (import.meta.env.DEV) {
        console.group('🏋️ NeuraStack Flexible Workout API Request');
        console.log('');
        console.log('📍 WORKOUT REQUEST:');
        console.log(`  🎯 Workout Type: %c${request.workoutType || 'Not specified'}%c`, 'color: #00ff00; font-weight: bold;', 'color: inherit;');
        console.log(`  ⏱️ Duration: ${request.timeAvailable || 'Not specified'} minutes`);
        console.log(`  🎚️ Fitness Level: ${request.fitnessLevel}`);
        console.log(`  🎯 Goals: ${Array.isArray(request.goals) ? request.goals.join(', ') : request.goals || 'Not specified'}`);
        console.log(`  🎂 Age: ${request.age}`);
        console.log(`  👤 Gender: ${request.gender || 'Not specified'}`);
        console.log(`  ⚖️ Weight: ${request.weight || 'Not specified'}`);
        console.log('  ✅ Using New Flexible API Specification');
        console.log('');
        console.log('🌐 REQUEST DETAILS:');
        console.log('  📤 Endpoint:', `${this.config.baseUrl}${workoutEndpoint}`);
        console.log('  📋 Request Body:', JSON.stringify(apiRequest, null, 2));
        console.log('  📋 Headers:', headers);
        console.log('  ⚙️ Options:', {
          userId: userId || 'anonymous',
          timeout: options.timeout || 60000
        });
        console.groupEnd();
      }

      const workoutResponse = await this.makeRequest<WorkoutGenerateResponse>(
        workoutEndpoint,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(apiRequest),
          signal: options.signal,
          timeout: options.timeout || 60000,
          bustCache: false
        }
      );

      // Success logging for new flexible API
      if (import.meta.env.DEV) {
        console.group('🎯 Workout Generation Success (Flexible API)');
        console.log('');
        console.log('✅ RESPONSE STATUS:', workoutResponse.status);
        console.log('🔗 Correlation ID:', workoutResponse.correlationId);
        console.log('⏰ Timestamp:', workoutResponse.timestamp);
        console.log('');

        if (workoutResponse.data?.workout) {
          const workout = workoutResponse.data.workout;
          console.log('🏋️ WORKOUT DETAILS:');
          console.log(`  📋 Type: %c${workout.type}%c`, 'color: #00ff00; font-weight: bold;', 'color: inherit;');
          console.log(`  ⏱️ Duration: ${workout.duration} minutes`);
          console.log(`  🎯 Difficulty: ${workout.difficulty}`);
          console.log(`  🏋️ Equipment: ${workout.equipment?.join(', ') || 'N/A'}`);
          console.log(`  💡 Coaching Tips: ${workout.coachingTips?.length || 0} tips`);

          // Workout phases (new structure)
          console.log('');
          console.log('📋 WORKOUT STRUCTURE:');
          console.log(`  🔥 Warmup: ${workout.warmup?.length || 0} exercises`);
          console.log(`  💪 Main Exercises: ${workout.mainWorkout?.exercises?.length || 0} exercises`);
          console.log(`  🧘 Cooldown: ${workout.cooldown?.length || 0} exercises`);
          console.log(`  🏗️ Structure: ${workout.mainWorkout?.structure || 'N/A'}`);

          // Quality metrics from debug metadata
          if (workoutResponse.data?.metadata?.debug) {
            const debug = workoutResponse.data.metadata.debug;
            console.log('');
            console.log('📊 QUALITY METRICS:');
            console.log(`  🎯 Quality Score: ${debug.professionalStandards?.qualityScore || 'N/A'}`);
            console.log(`  🏆 Certification Level: ${debug.professionalStandards?.certificationLevel || 'N/A'}`);
            console.log(`  ✅ Structure Valid: ${debug.workoutStructureValidation?.hasWarmup && debug.workoutStructureValidation?.hasMainWorkout && debug.workoutStructureValidation?.hasCooldown ? 'Yes' : 'No'}`);
          }
        }

        console.log('');
        console.log('📊 METADATA:');
        console.log(`  🤖 Model: ${workoutResponse.data?.metadata?.model || 'Unknown'}`);
        console.log(`  🏢 Provider: ${workoutResponse.data?.metadata?.provider || 'Unknown'}`);
        console.log(`  👤 User ID: ${workoutResponse.data?.metadata?.userId || 'Unknown'}`);
        console.log(`  ⏰ Timestamp: ${workoutResponse.data?.metadata?.timestamp || 'Unknown'}`);
        console.log(`  🔗 Correlation ID: ${workoutResponse.data?.metadata?.correlationId || 'Unknown'}`);

        console.groupEnd();
      }

      return workoutResponse;
    } catch (error) {
      // Error logging for optimized API
      console.group('❌ Workout Generation Error (Optimized API)');
      console.log('');
      console.log('🚫 ERROR DETAILS:');
      console.log('  💥 Error:', error);
      console.log('  🔗 Correlation ID:', correlationId);
      console.log('  ⏰ Timestamp:', new Date().toISOString());
      console.log('');
      console.log('📋 REQUEST CONTEXT:');
      console.log('  🎯 Workout Type:', request.workoutType || 'Not specified');
      console.log('  👤 User ID:', userId || 'anonymous');
      console.log('  🌐 Endpoint:', `${this.config.baseUrl}${NEURASTACK_ENDPOINTS.WORKOUT_GENERATE}`);
      console.log('');
      console.log('🔧 TROUBLESHOOTING:');
      console.log('  • Check if backend is running and accessible');
      console.log('  • Verify request format matches optimized API documentation');
      console.log('  • Check network connectivity');
      console.log('  • Review timeout settings (should be 60+ seconds)');
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Complete a workout with optional feedback using the new optimized API endpoint
   *
   * Features:
   * - Simple completion tracking
   * - Optional user feedback
   * - Backend memory management
   */
  async completeWorkout(
    request: WorkoutCompleteRequest,
    options: NeuraStackRequestOptions = {}
  ): Promise<WorkoutCompleteResponse> {
    // Generate unique identifiers for request tracking
    const timestamp = Date.now();
    const randomPart1 = Math.random().toString(36).substring(2, 15);
    const correlationId = `workout-complete-${timestamp}-${randomPart1}`;

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add required X-User-Id header (per API documentation)
    const userId = options.userId || this.config.userId;
    if (userId && userId.trim() !== '') {
      headers['X-User-Id'] = userId;
    }

    // Add correlation ID for tracking
    headers['X-Correlation-ID'] = correlationId;

    try {
      // Development logging
      if (import.meta.env.DEV) {
        console.group('🏁 NeuraStack Workout Complete API Request');
        console.log('');
        console.log('📍 COMPLETION REQUEST:');
        console.log(`  🆔 Workout ID: ${request.workoutId}`);
        console.log(`  ✅ Completed: ${request.completed}`);
        console.log(`  ⭐ Rating: ${request.rating || 'Not provided'}`);
        console.log(`  🎚️ Difficulty: ${request.difficulty || 'Not provided'}`);
        console.log(`  ⏱️ Actual Duration: ${request.actualDuration || 'Not provided'} minutes`);
        console.log('');
        console.log('🌐 REQUEST DETAILS:');
        console.log('  📤 Endpoint:', `${this.config.baseUrl}${NEURASTACK_ENDPOINTS.WORKOUT_COMPLETE}`);
        console.log('  📋 Request Body:', JSON.stringify(request, null, 2));
        console.log('  📋 Headers:', headers);
        console.groupEnd();
      }

      const completeResponse = await this.makeRequest<WorkoutCompleteResponse>(
        NEURASTACK_ENDPOINTS.WORKOUT_COMPLETE,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(request),
          signal: options.signal,
          timeout: options.timeout || 30000, // Shorter timeout for completion
          bustCache: false
        }
      );

      // Success logging
      if (import.meta.env.DEV) {
        console.group('🎯 Workout Completion Success');
        console.log('');
        console.log('✅ RESPONSE STATUS:', completeResponse.status);
        console.log('💬 Message:', completeResponse.message || 'No message');
        console.log('🔗 Correlation ID:', completeResponse.correlationId);
        console.log('⏰ Timestamp:', completeResponse.timestamp);

        if (completeResponse.data) {
          console.log('📊 COMPLETION DATA:');
          console.log(`  🆔 Workout ID: ${completeResponse.data.workoutId}`);
          console.log(`  ✅ Completed: ${completeResponse.data.completed}`);
          console.log(`  🔄 Processed: ${completeResponse.data.processed}`);
        }

        console.groupEnd();
      }

      return completeResponse;
    } catch (error) {
      // Error logging
      console.group('❌ Workout Completion Error');
      console.log('');
      console.log('🚫 ERROR DETAILS:');
      console.log('  💥 Error:', error);
      console.log('  🔗 Correlation ID:', correlationId);
      console.log('  🆔 Workout ID:', request.workoutId);
      console.log('');
      console.log('📋 REQUEST CONTEXT:');
      console.log('  👤 User ID:', userId || 'anonymous');
      console.log('  🌐 Endpoint:', `${this.config.baseUrl}${NEURASTACK_ENDPOINTS.WORKOUT_COMPLETE}`);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Transform ensemble response to simplified format for new API
   * Following API spec: synthesis.content is main response, roles are individual responses
   */
  private transformEnsembleResponse(ensembleResponse: EnsembleResponse): NeuraStackQueryResponse {
    // Always check status === 'success' before processing (per API spec)
    if (ensembleResponse.status !== 'success' || !ensembleResponse.data) {
      throw new NeuraStackApiError({
        error: ensembleResponse.error || 'Ensemble API Error',
        message: ensembleResponse.message || 'Failed to get successful response from ensemble API',
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
    const individualResponses: SubAnswer[] = (data.roles || []).map(role => {
      // Look for ensemble data in multiple possible locations
      const ensembleData = data.synthesis || data || ensembleResponse.data || {};

      return {
        model: role.model,
        answer: role.content,
        role: role.role, // Keep the original role for reference
        provider: this.extractProviderFromModel(role.model), // Extract provider from model name
        status: role.status === 'fulfilled' ? 'success' : 'failed', // Map API status to SubAnswer format
        wordCount: role.content ? role.content.split(' ').length : 0,

        // Enhanced metadata from API response for customer-centric insights
        confidence: role.confidence ? {
          score: role.confidence,
          level: role.confidence > 0.8 ? 'high' : role.confidence > 0.5 ? 'medium' : 'low',
          factors: ['AI model confidence score']
        } : undefined,
        responseTime: role.responseTime,
        characterCount: role.characterCount,
        quality: role.quality ? {
          wordCount: role.content ? role.content.split(' ').length : 0,
          sentenceCount: Math.ceil((role.content ? role.content.split(' ').length : 0) / 15), // Rough estimate
          averageWordsPerSentence: 15, // Default estimate
          hasStructure: true,
          hasReasoning: true,
          complexity: 'medium'
        } : undefined,
        metadata: role.metadata ? {
          confidenceLevel: role.confidence ? (role.confidence > 0.8 ? 'high' : role.confidence > 0.5 ? 'medium' : 'low') : 'medium',
          modelReliability: role.confidence || 0.7,
          processingTime: role.responseTime || 0,
          tokenCount: Math.ceil((role.characterCount || 0) / 4), // Rough token estimate
          complexity: 'medium'
        } : undefined,

        // Include ensemble data for enhanced model cards (check multiple locations)
        overallConfidence: ensembleData.overallConfidence || (ensembleResponse as any).overallConfidence,
        synthesisStrategy: ensembleData.synthesisStrategy || (ensembleResponse as any).synthesisStrategy,
        votingResults: ensembleData.votingResults || (ensembleResponse as any).votingResults,
        isFineTuned: ensembleData.isFineTuned || (ensembleResponse as any).isFineTuned
      };
    });

    // Create models used mapping
    const modelsUsed: Record<string, boolean> = {};
    (data.roles || []).forEach(role => {
      modelsUsed[role.model] = role.status === 'fulfilled'; // Only count successful models
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
      metadata: data.metadata // Performance metrics and quality indicators per API spec
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
    options: RequestInit & { timeout?: number; bustCache?: boolean }
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

    // Add cache-busting parameter to URL if requested (CORS-compliant approach)
    let finalEndpoint = endpoint;
    if (options.bustCache !== false) { // Default to true unless explicitly set to false
      const separator = endpoint.includes('?') ? '&' : '?';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      finalEndpoint = `${endpoint}${separator}_t=${timestamp}&_r=${random}`;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}${finalEndpoint}`, {
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
