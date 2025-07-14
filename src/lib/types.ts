/* ============================================================================
 * NeuraStack Frontend API Types - Updated for Latest Backend Integration
 * ========================================================================== */

/** Canonical provider keys we support today */
export type ModelProvider = "openai" | "gemini" | "claude";

/** Available tiers for cost optimization */
export type NeuraStackTier = "free" | "premium";

/** Chat message interface */
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/* ============================================================================
 * NeuraStack API Request/Response Types (Latest Backend Version)
 * ========================================================================== */

/** Request interface for NeuraStack Ensemble API - matches backend documentation */
export interface EnsembleRequest {
  prompt: string; // Required. The user's question or request to the AI ensemble
}

/** Legacy request interface for backward compatibility */
export interface NeuraStackQueryRequest {
  /** The user's prompt/question */
  prompt: string;

  /** Use 4-AI ensemble for better responses (recommended) */
  useEnsemble?: boolean;

  /** Specific models to use (optional) */
  models?: string[];

  /** Maximum tokens in response (optional - backend controls based on tier) */
  maxTokens?: number;

  /** Temperature for response creativity (0-1) */
  temperature?: number;
}

/** Headers for NeuraStack API requests */
export interface NeuraStackHeaders {
  'Content-Type': 'application/json';
  'X-Session-Id'?: string; // Updated to match API documentation
  'X-User-Id'?: string;
  'Authorization'?: string;
  'X-Requested-With'?: string;
  [key: string]: string | undefined;
}

/** Per‑model answer as returned by the backend - Updated for new ensemble API */
export interface SubAnswer {
  model: string;          // Full model key like "gpt-4o-mini", "gemini-1.5-flash"
  content: string;        // The model's native response (API uses 'content' field)
  role?: string;          // Role in ensemble mode (e.g., "gpt4o", "gemini", "claude")
  provider?: string;      // Provider name (e.g., "openai", "gemini", "claude")
  status?: 'fulfilled' | 'rejected'; // Response status from new API
  reason?: string;        // Rejection reason if status is 'rejected'
  wordCount?: number;     // Word count of the response

  // Enhanced metadata from API response for customer-centric insights
  confidence?: {
    score: number;           // 0-1 confidence score
    level: string;           // "low", "medium", "high"
    factors?: string[];      // Specific confidence reasoning
  };

  // Performance metrics
  responseTime?: number;     // Processing time in milliseconds
  characterCount?: number;   // Response character count
  tokenCount?: number;       // Token count for the response

  // Quality analysis
  quality?: number | {       // Can be simple number or detailed object
    wordCount: number;
    sentenceCount: number;
    averageWordsPerSentence: number;
    hasStructure: boolean;
    hasReasoning: boolean;
    complexity: string;      // "low", "medium", "high"
  };

  // Model reliability and metadata
  metadata?: Record<string, unknown>;            // Flexible metadata object from API

  // Legacy fields for backward compatibility
  answer?: string;           // Fallback to content field
  overallConfidence?: number;     // Overall confidence score (0-1)
  synthesisStrategy?: string;     // Strategy used (e.g., "consensus")
  votingResults?: Array<{         // Voting results from ensemble
    role: string;
    model: string;
    confidence: number;
    weightedScore: number;
    confidenceLevel: string;
  }>;
  isFineTuned?: boolean;         // Whether model is fine-tuned
}

/** New Ensemble API Response Types - Updated to match actual API structure */
export interface EnsembleRole {
  role: "gpt4o" | "gemini" | "claude";
  content: string;
  model: string;
  provider: "openai" | "gemini" | "claude";
  status: "fulfilled" | "rejected";
  wordCount: number;
  characterCount: number;
  responseTime: number;
  confidence: {
    score: number;
    level: "high" | "medium" | "low";
    factors: string[];
  };
  metadata: {
    confidenceLevel: "high" | "medium" | "low";
    modelReliability: number;
    processingTime: number;
    tokenCount: number;
    complexity: "high" | "medium" | "low";
  };
  quality: {
    wordCount: number;
    sentenceCount: number;
    averageWordsPerSentence: number;
    hasStructure: boolean;
    hasReasoning: boolean;
    complexity: "high" | "medium" | "low";
  };
  _confidenceDescription?: string;
  _qualityDescription?: string;
  _metadataDescription?: string;
}

export interface EnsembleSynthesis {
  content: string;
  model: string;
  provider: "openai" | "gemini" | "claude";
  status: "success" | "failed";
  isFineTuned: boolean;
  synthesisStrategy: string;
  overallConfidence: number;
  confidence: {
    score: number;
    level: "high" | "medium" | "low";
    factors: string[];
  };
  _confidenceDescription?: string;
  qualityScore: number;
  _qualityScoreDescription?: string;
  metadata: {
    basedOnResponses: number;
    _basedOnResponsesDescription?: string;
    averageConfidence: number;
    _averageConfidenceDescription?: string;
    consensusLevel: "high" | "moderate" | "low";
    _consensusLevelDescription?: string;
  };
}

export interface EnsembleVoting {
  winner: string;
  _winnerDescription?: string;
  confidence: number;
  _confidenceDescription?: string;
  consensus: "strong" | "moderate" | "weak" | "very-weak";
  _consensusDescription?: string;
  weights: Record<string, number>;
  _weightsDescription?: string;
  recommendation: string;
  _recommendationDescription?: string;
}

export interface EnsembleConfidenceAnalysis {
  overallConfidence: number;
  _overallConfidenceDescription?: string;
  modelAgreement: number;
  _modelAgreementDescription?: string;
  responseConsistency: number;
  _responseConsistencyDescription?: string;
  qualityDistribution: {
    high: number;
    medium: number;
    low: number;
    veryLow: number;
    averageScore: number;
    scoreRange: {
      min: number;
      max: number;
    };
    totalResponses: number;
  };
  _qualityDistributionDescription?: string;
  votingAnalysis: {
    consensusStrength: "strong" | "moderate" | "weak" | "very-weak";
    _consensusStrengthDescription?: string;
    winnerMargin: number;
    _winnerMarginDescription?: string;
    distributionEntropy: number;
    _distributionEntropyDescription?: string;
  };
}

export interface EnsembleMetadata {
  totalRoles: number;
  successfulRoles: number;
  failedRoles: number;
  synthesisStatus: "success" | "failed";
  processingTimeMs: number;
  sessionId: string;
  memoryContextUsed: boolean;
  responseQuality: number;
  correlationId: string;
  contextOptimization: {
    tokensUsed: number;
    tokensAvailable: number;
    efficiency: number;
    sectionsIncluded: number;
    hierarchicalContext: boolean;
  };
  timestamp: string; // ISO 8601 format
  version: string; // API version
  confidenceAnalysis: EnsembleConfidenceAnalysis;
  costEstimate: {
    totalCost: number;
    breakdown: {
      inputTokens: number;
      outputTokens: number;
      inputCost: number;
      outputCost: number;
    };
  };
  _costEstimateDescription?: string;
  synthesis?: any; // Allow synthesis data for UI
}

export interface EnsembleData {
  prompt: string;
  userId: string;
  sessionId: string;
  synthesis: EnsembleSynthesis;
  roles: EnsembleRole[];
  voting: EnsembleVoting;
  metadata: EnsembleMetadata;
}

export interface EnsembleResponse {
  status: "success" | "error";
  data?: EnsembleData;
  message?: string;
  error?: string;
  timestamp?: string;
  correlationId?: string;
}

/* ============================================================================
 * Enhanced Monitoring & Tier Management Types
 * ========================================================================== */

/** System Health Status */
export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load: number[];
  };
}

/** Vendor Health Status */
export interface VendorHealth {
  openai: {
    status: "healthy" | "degraded" | "unhealthy";
    responseTime: number;
    errorRate: number;
  };
  gemini: {
    status: "healthy" | "degraded" | "unhealthy";
    responseTime: number;
    errorRate: number;
  };
  claude: {
    status: "healthy" | "degraded" | "unhealthy";
    responseTime: number;
    errorRate: number;
  };
}

/** Ensemble Health Status */
export interface EnsembleHealth {
  status: "healthy" | "degraded" | "unhealthy";
  averageResponseTime: number;
  successRate: number;
  activeConnections: number;
}

/** Detailed Health Check Response */
export interface DetailedHealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  components: {
    system: SystemHealth;
    vendors: VendorHealth;
    ensemble: EnsembleHealth;
  };
}

/** Request Metrics */
export interface RequestMetrics {
  total: number;
  successful: number;
  failed: number;
  rate: number; // requests per minute
}

/** Performance Metrics */
export interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
}

/** Resource Metrics */
export interface ResourceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  queueSize: number;
}

/** Error Metrics */
export interface ErrorMetrics {
  total: number;
  byType: Record<string, number>;
  byVendor: Record<string, number>;
  rate: number; // errors per minute
}

/** Vendor Metrics */
export interface VendorMetrics {
  openai: {
    requests: number;
    errors: number;
    averageResponseTime: number;
  };
  gemini: {
    requests: number;
    errors: number;
    averageResponseTime: number;
  };
  claude: {
    requests: number;
    errors: number;
    averageResponseTime: number;
  };
}

/** Ensemble Metrics */
export interface EnsembleMetrics {
  totalRequests: number;
  successfulEnsembles: number;
  averageModelsPerRequest: number;
  synthesisSuccessRate: number;
}

/** System Metrics Response */
export interface MetricsResponse {
  timestamp: string;
  system: {
    requests: RequestMetrics;
    performance: PerformanceMetrics;
    resources: ResourceMetrics;
    errors: ErrorMetrics;
  };
  vendors: VendorMetrics;
  ensemble: EnsembleMetrics;
  tier: string; // Current tier (free/premium)
  costEstimate: string; // Estimated cost per request
}

/** Model Configuration */
export interface ModelConfig {
  name: string;
  provider: string;
  costPerToken: number;
  maxTokens: number;
  features: string[];
}

/** Tier Limits */
export interface TierLimits {
  requestsPerHour: number;
  requestsPerDay: number;
  maxPromptLength: number;
  maxWordsPerResponse: number;
  features: string[];
}

/** Tier Details */
export interface TierDetails {
  name: string;
  description: string;
  models: Record<string, ModelConfig>;
  limits: TierLimits;
  estimatedCostPerRequest: string;
  responseTime: string;
  quality: string;
}

/** Tier Comparison */
export interface TierComparison {
  costSavings: string;
  qualityRatio: string;
  speedRatio: string;
  features: string[];
}

/** Tier Information Response */
export interface TierInfoResponse {
  status: "success";
  data: {
    currentTier: NeuraStackTier;
    configuration: {
      models: Record<string, ModelConfig>;
      limits: TierLimits;
      estimatedCostPerRequest: string;
    };
    availableTiers: {
      free: TierDetails;
      premium: TierDetails;
    };
    costComparison: {
      free: TierComparison;
      premium: TierComparison;
    };
  };
  timestamp: string;
}

/** Cost Estimate Request */
export interface CostEstimateRequest {
  prompt: string;
  tier?: NeuraStackTier;
}

/** Cost Estimate Response */
export interface CostEstimateResponse {
  status: "success";
  data: {
    prompt: {
      length: number;
      estimatedTokens: number;
    };
    tier: string;
    estimatedCost: {
      total: string;
      breakdown: {
        promptTokens: number;
        responseTokens: number;
        modelsUsed: number;
      };
    };
    comparison: {
      free: string;
      premium: string;
    };
  };
  timestamp: string;
}

/* ============================================================================
 * Memory Management Types
 * ========================================================================== */



export interface StoreMemoryRequest {
  userId: string;
  sessionId: string;
  content: string;
  isUserPrompt?: boolean; // Default: true
  responseQuality?: number; // 0-1 scale, optional
  modelUsed?: string; // Optional
  ensembleMode?: boolean; // Default: false
}

export interface StoreMemoryResponse {
  success: boolean;
  memoryId: string;
  memoryType: MemoryType;
  importance: number;
  compositeScore: number;
}

export interface RetrieveMemoryRequest {
  userId: string;
  sessionId?: string; // Optional - filter by session
  memoryTypes?: MemoryType[]; // Optional - filter by types
  maxResults?: number; // Default: 10, max: 50
  minImportance?: number; // Default: 0.3, range: 0-1
  includeArchived?: boolean; // Default: false
  query?: string; // Optional - text search
}

export interface MemoryContextRequest {
  userId: string;
  sessionId: string;
  maxTokens?: number; // Default: 2048, range: 100-8000
}

export interface MemoryContextResponse {
  success: boolean;
  context: string;
  estimatedTokens: number;
}

export interface MemoryAnalyticsResponse {
  success: boolean;
  userId: string;
  metrics: {
    totalMemories: number;
    memoryTypes: Record<string, number>;
    averageImportance: number;
    averageCompositeScore: number;
    archivedCount: number;
    recentMemories: number;
  };
}

export interface MemoryHealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  message: string;
  timestamp: string;
  details: {
    firestoreAvailable: boolean;
    localCacheSize: number;
    testMemoryStored: boolean;
    testMemoryRetrieved: boolean;
  };
}

/** Response interface for NeuraStack API */
export interface NeuraStackQueryResponse {
  /** Primary AI response text (synthesis.content - unlimited length per API spec) */
  answer: string;

  /** Whether ensemble mode was used */
  ensembleMode: boolean;

  /** Which models successfully responded */
  modelsUsed: Record<string, boolean>;

  /** Total execution time */
  executionTime: string;

  /** Memory context summary */
  memoryContext?: string;

  /** Token count for the response */
  tokenCount: number;

  /** Tokens saved through memory compression */
  memoryTokensSaved?: number;

  /** Any fallback reasons if models failed */
  fallbackReasons?: Record<string, string>;

  /** Individual model responses (roles array - character limited per API spec) */
  individualResponses?: SubAnswer[];

  /** Correlation ID for debugging issues per API spec */
  correlationId?: string;

  /** Performance metrics and quality indicators per API spec */
  metadata?: EnsembleMetadata;
}

/* ============================================================================
 * Memory System Types
 * ========================================================================== */

export type MemoryType = 'working' | 'short_term' | 'long_term' | 'semantic' | 'episodic';

export interface MemoryMetrics {
  /** Total number of memories stored */
  totalMemories: number;

  /** Average importance score (0-1) */
  averageImportance: number;

  /** Average compression ratio (0-1) */
  averageCompressionRatio: number;

  /** Total tokens saved through compression */
  totalTokensSaved: number;

  /** Memory count by type */
  memoryByType: Record<MemoryType, number>;

  /** Memory retention statistics */
  retentionStats: {
    active: number;
    archived: number;
    expired: number;
  };

  /** Access patterns (for analytics) */
  accessPatterns: {
    hourly: number[];
    daily: number[];
    weekly: number[];
  };
}

export interface UserMemory {
  id: string;
  userId: string;
  sessionId: string;
  memoryType: MemoryType;

  content: {
    original: string;
    compressed: string;
    keywords: string[];
    concepts: string[];
    sentiment: number;
    importance: number;
  };

  metadata: {
    timestamp: Date;
    context: string;
    conversationTopic: string;
    userIntent: string;
    responseQuality: number;
    tokenCount: number;
    compressedTokenCount: number;
  };

  weights: {
    recency: number;
    importance: number;
    frequency: number;
    emotional: number;
    composite: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface SessionContext {
  sessionId: string;
  userId: string;
  context: string;
  memoryCount: number;
  lastActivity: string;
  memories?: UserMemory[];
  contextSummary?: string;
  totalTokens?: number;
}

/* ============================================================================
 * Legacy Types (for backward compatibility)
 * ========================================================================== */

/** @deprecated Use NeuraStackQueryRequest instead */
export interface ChatRequest {
  prompt: string;
  /** Array of fully‑qualified model keys, e.g. "openai:gpt-4" */
  models: string[];
  /** Whether to use ensemble mode */
  useEnsemble?: boolean;
}





























