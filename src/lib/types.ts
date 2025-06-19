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
  metadata?: Record<string, any>;
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

/** Per‑model answer as returned by the backend */
export interface SubAnswer {
  model: string;          // Full model key like "openai:gpt-4"
  answer: string;         // The model's native response
  role?: string;          // Role in ensemble mode (e.g., "Evidence Analyst")
  provider?: string;      // Provider name (e.g., "openai", "gemini", "claude")
  status?: 'success' | 'failed'; // Response status
  wordCount?: number;     // Word count of the response
}

/** New Ensemble API Response Types */
export interface EnsembleRole {
  role: "gpt4o" | "gemini" | "claude";
  content: string;
  model: string;
  provider: "openai" | "gemini" | "claude";
  status: "fulfilled" | "rejected";
  wordCount: number;
}

export interface EnsembleSynthesis {
  content: string;
  model: string;
  provider: "openai" | "gemini" | "claude";
  status: "success" | "failed";
  error?: string;
}

export interface EnsembleMetadata {
  totalRoles: number;
  successfulRoles: number;
  failedRoles: number;
  synthesisStatus: "success" | "failed";
  processingTimeMs: number;
  timestamp: string; // ISO 8601 format
  version?: string; // API version
  correlationId?: string; // Request tracking ID
  memoryContextUsed?: boolean;
  responseQuality?: number; // 0-1 quality score
}

export interface EnsembleData {
  prompt: string;
  userId: string;
  synthesis: EnsembleSynthesis;
  roles: EnsembleRole[];
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
  /** Primary AI response text */
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

  /** Individual model responses (enhanced feature) */
  individualResponses?: SubAnswer[];
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



/* ============================================================================
 * Fitness Types
 * ========================================================================== */

export interface FitnessProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessLevelCode?: 'B' | 'I' | 'A'; // Token-efficient storage codes
  goals: string[];
  equipment: string[];
  availableTime: number; // minutes per session
  workoutDays: string[]; // days of the week
  timeAvailability: {
    daysPerWeek: number;
    minutesPerSession: number;
  };
  completedOnboarding: boolean;

  // Enhanced fields for workout API integration
  age?: number; // User's age
  gender?: 'male' | 'female' | 'rather_not_say'; // User's gender
  weight?: number; // User's weight in lbs
  injuries?: string[]; // Any injuries or limitations
}

export interface WorkoutPlan {
  id: string;
  name: string;
  duration: number; // in minutes
  exercises: Exercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  completedAt: Date | null;

  // Enhanced fields for AI optimization
  focusAreas?: string[];
  workoutType?: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed' | 'upper_body' | 'lower_body' | 'push' | 'pull' | 'core';
  actualDuration?: number; // actual time taken to complete
  completionRate?: number; // percentage of exercises completed
  coachingNotes?: string;

  // Performance tracking
  caloriesBurned?: number;
  averageHeartRate?: number;
  peakHeartRate?: number;
  perceivedExertion?: number; // 1-10 RPE scale

  // Workout quality metrics
  formQuality?: number; // 1-5 scale
  enjoymentRating?: number; // 1-5 scale
  difficultyRating?: number; // 1-5 scale
  energyLevel?: 'low' | 'moderate' | 'high';

  // AI generation context
  generationContext?: {
    userContext: any;
    aiModelsUsed: string[];
    generationTime: number;
    sessionId: string;
    version: string; // Track workout generation version
    adaptations?: string[]; // Track what adaptations were made
  };

  // Workout structure
  warmUp?: {
    duration: number;
    exercises: Exercise[];
    completed?: boolean;
  };
  coolDown?: {
    duration: number;
    exercises: Exercise[];
    completed?: boolean;
  };

  // Workout state management
  isPaused?: boolean;
  pausedAt?: Date;
  resumedAt?: Date;
  totalPauseTime?: number; // in seconds

  // Social and sharing
  isPublic?: boolean;
  tags?: string[];
  notes?: string; // User notes about the workout
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration: number; // in seconds (0 if not time-based)
  restTime: number; // in seconds
  instructions: string;
  tips: string;
  targetMuscles: string[];

  // Enhanced fields for AI optimization
  equipment?: string[];
  intensity?: 'low' | 'moderate' | 'high';
  progressionNotes?: string[];
  modifications?: string[];
  safetyNotes?: string;

  // Exercise execution tracking
  actualSets?: number;
  actualReps?: number[];
  actualDuration?: number;
  actualRestTime?: number[];
  completed?: boolean;
  skipped?: boolean;
  modified?: boolean;

  // Performance metrics
  weight?: number[]; // Weight used for each set
  rpe?: number[]; // Rate of perceived exertion for each set
  formRating?: number; // 1-5 scale for form quality

  // Exercise metadata
  category?: 'compound' | 'isolation' | 'cardio' | 'flexibility' | 'core';
  primaryMuscle?: string;
  secondaryMuscles?: string[];
  movementPattern?: 'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'rotation';

  // Accessibility and adaptations
  difficultyLevel?: number; // 1-10 scale
  alternatives?: Exercise[]; // Alternative exercises
  prerequisites?: string[]; // Skills/equipment needed
  contraindications?: string[]; // When to avoid this exercise

  // Media and guidance
  videoUrl?: string;
  imageUrl?: string;
  audioInstructions?: string;
}

// ============================================================================
// Workout API Types (for /workout endpoint)
// ============================================================================

export interface WorkoutUserMetadata {
  age: number; // Required by API
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  gender?: string;
  weight?: number;
  goals?: string[]; // e.g., ['strength', 'cardio', 'flexibility', 'weight_loss']
  equipment?: string[]; // e.g., ['dumbbells', 'resistance_bands', 'none']
  timeAvailable?: number; // minutes per session
  injuries?: string[];
  daysPerWeek?: number;
  minutesPerSession?: number;
}

export interface WorkoutHistoryEntry {
  date: string; // ISO date string, e.g., "2025-06-15"
  type: string; // e.g., "upper_body"
  duration: number; // minutes
}

export interface WorkoutAPIRequest {
  userMetadata: WorkoutUserMetadata;
  workoutHistory?: WorkoutHistoryEntry[];
  workoutRequest: string; // Natural language description of desired workout
}

export interface WorkoutAPIExercise {
  name: string;
  category: string; // e.g., "strength", "cardio"
  sets: number;
  reps: string; // e.g., "10-12" to allow ranges
  rest: string; // e.g., "30 seconds"
  instructions: string;
  modifications: string; // easier variations
  targetMuscles: string[];
}

export interface WarmupExercise {
  name: string;
  duration: string; // e.g., "2 minutes"
  instructions: string;
}

export interface CooldownExercise {
  name: string;
  duration: string; // e.g., "2 minutes"
  instructions: string;
}

export interface WorkoutAPIPlan {
  type: string; // e.g., "mixed"
  duration: string; // e.g., "30 minutes"
  difficulty: string; // e.g., "beginner"
  equipment: string[]; // e.g., ["none"]
  exercises: WorkoutAPIExercise[];
  warmup: WarmupExercise[];
  cooldown: CooldownExercise[];
  calorieEstimate: string; // e.g., "150-200 calories"
  notes: string; // Additional workout notes
}

export interface WorkoutAPIMetadata {
  model: string; // e.g., "gpt-4o-mini"
  timestamp: string; // ISO timestamp
}

export interface WorkoutAPIResponse {
  status: 'success' | 'error';
  data?: {
    workout: WorkoutAPIPlan;
    metadata: WorkoutAPIMetadata;
  };
  message?: string;
  error?: string;
  timestamp?: string;
  correlationId?: string;
}

// ============================================================================
// Enhanced Workout Session Management
// ============================================================================

export interface WorkoutSession {
  id: string;
  workoutPlanId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned';

  // Session progress
  currentExerciseIndex: number;
  completedExercises: number[];
  skippedExercises: number[];

  // Timing data
  totalDuration: number; // in seconds
  activeTime: number; // time actually exercising
  restTime: number; // time resting
  pauseTime: number; // time paused

  // Performance data
  heartRateData?: HeartRateReading[];
  caloriesBurned?: number;
  averageRPE?: number;

  // Environment and context
  location?: 'home' | 'gym' | 'outdoor' | 'other';
  weather?: string; // for outdoor workouts
  equipment?: string[];

  // Session notes and feedback
  notes?: string;
  mood?: 'energetic' | 'tired' | 'motivated' | 'stressed' | 'neutral';

  // Recovery and adaptation data
  sleepQuality?: number; // 1-5 scale from previous night
  stressLevel?: number; // 1-5 scale
  hydrationLevel?: number; // 1-5 scale
  nutritionTiming?: 'fasted' | 'pre_workout_meal' | 'post_meal';
}

export interface HeartRateReading {
  timestamp: Date;
  bpm: number;
  exerciseIndex?: number;
}

export interface WorkoutAdaptation {
  id: string;
  workoutPlanId: string;
  userId: string;
  adaptationType: 'difficulty_increase' | 'difficulty_decrease' | 'exercise_swap' | 'duration_change' | 'rest_adjustment';
  reason: string;
  originalValue: any;
  adaptedValue: any;
  confidence: number; // 0-1 scale
  appliedAt: Date;
  effectiveFrom: Date;
}

export interface WorkoutRecommendation {
  id: string;
  userId: string;
  type: 'workout_type' | 'exercise_modification' | 'rest_day' | 'intensity_adjustment' | 'nutrition' | 'recovery';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1 scale
  basedOn: string[]; // What data this recommendation is based on
  actionable: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

// ============================================================================
// Progressive Overload and Adaptation
// ============================================================================

export interface ProgressionRule {
  exerciseName: string;
  metric: 'weight' | 'reps' | 'sets' | 'duration' | 'rest_time';
  condition: 'consecutive_completions' | 'rpe_threshold' | 'time_based';
  threshold: number;
  adjustment: {
    type: 'percentage' | 'absolute' | 'step';
    value: number;
  };
  maxAdjustment?: number;
  minAdjustment?: number;
}

export interface UserProgressMetrics {
  userId: string;
  exerciseName: string;

  // Performance tracking
  personalRecords: {
    maxWeight?: number;
    maxReps?: number;
    maxDuration?: number;
    bestForm?: number;
  };

  // Progression tracking
  currentLevel: {
    weight?: number;
    reps?: number;
    sets?: number;
    duration?: number;
  };

  // Adaptation history
  progressionHistory: {
    date: Date;
    metric: string;
    oldValue: number;
    newValue: number;
    reason: string;
  }[];

  // Performance trends
  trends: {
    strength: 'improving' | 'maintaining' | 'declining';
    endurance: 'improving' | 'maintaining' | 'declining';
    consistency: number; // 0-1 scale
  };

  lastUpdated: Date;
}