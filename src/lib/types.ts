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

/** New Ensemble API Response Types */
export interface EnsembleRole {
  role: "gpt4o" | "gemini" | "claude";
  content: string;
  model: string;
  provider: "openai" | "gemini" | "claude";
  status: "fulfilled" | "rejected";
  wordCount: number;
  confidence?: number;
  responseTime?: number;
  characterCount?: number;
  quality?: number;
  metadata?: Record<string, unknown>;
}

export interface EnsembleSynthesis {
  content: string;
  model: string;
  provider: "openai" | "gemini" | "claude";
  status: "success" | "failed";
  error?: string;
  overallConfidence?: number;
  synthesisStrategy?: string;
  votingResults?: Record<string, unknown>;
  isFineTuned?: boolean;
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
  age?: number; // User's age - primary field for API integration
  weight?: number; // User's weight in lbs - primary field for API integration
  gender?: 'male' | 'female' | 'rather_not_say'; // User's gender
  injuries?: string[]; // Any injuries or limitations

  // Legacy category fields (kept for backward compatibility)
  ageCategory?: string; // User's age category (e.g., 'YOUNG_ADULT', 'ADULT', etc.)
  weightCategory?: string; // User's weight category (e.g., 'MODERATE', 'HEAVY', etc.)

  // Workout preferences
  workoutPreferences?: {
    preferredWorkoutTime?: 'morning' | 'afternoon' | 'evening';
    workoutReminders?: boolean;
    voiceCoaching?: boolean;

    // Rest timer preferences
    restTimerPreferences?: {
      autoStartNextSet?: boolean; // Auto-start next set after rest
      soundEnabled?: boolean; // Play sound when rest is complete
      vibrationEnabled?: boolean; // Haptic feedback during rest
      warningTime?: number; // Seconds before rest ends to show warning (default: 5)
      defaultRestTime?: number; // Default rest time in seconds
      customRestTimes?: { [exerciseType: string]: number }; // Custom rest times by exercise type
    };
  };
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
  workoutType?: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed' | 'upper_body' | 'lower_body' | 'push' | 'pull' | 'core' | 'yoga' | 'pilates' | 'functional' | 'full_body' | 'legs';
  estimatedCalories?: number;
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
    userContext?: Record<string, unknown>; // Legacy field - backend handles this now
    aiModelsUsed?: string[]; // Legacy field - backend handles this now
    generationTime: number;
    sessionId: string;
    correlationId?: string; // API correlation ID for tracking
    approach?: string; // AI approach used for generation
    version: string; // Track workout generation version
    adaptations?: string[]; // Track what adaptations were made
    // Enhanced backend personalization data
    personalizationInsights?: {
      appliedProgressiveOverload: boolean;
      difficultyAdjustment: number;
      varietyScore: number;
      personalizedNotes: string[];
    };
    userProgress?: {
      totalWorkoutsCompleted: number;
      currentStreak: number;
      averageCompletionRate: number;
      fitnessLevelProgression: string;
    };
    nextWorkoutRecommendations?: {
      suggestedRestDays: number;
      recommendedNextType: string;
      progressionOpportunities: string[];
    };
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

  // Performance metrics per set
  weight?: number[]; // Weight used for each set (in lbs)
  rpe?: number[]; // Rate of perceived exertion for each set (1-10 scale)
  formRating?: number[]; // Form quality rating for each set (1-5 scale)
  setNotes?: string[]; // Optional notes for each set

  // Rest timer enhancements
  customRestTime?: number; // Custom rest time for this exercise (overrides default)
  restTimerPreferences?: {
    autoStart?: boolean; // Auto-start next set after rest
    soundEnabled?: boolean; // Play sound when rest is complete
    vibrationEnabled?: boolean; // Haptic feedback during rest
    warningTime?: number; // Seconds before rest ends to show warning (default: 5)
  };

  // Weight tracking metadata
  weightHistory?: {
    date: Date;
    weights: number[]; // Weight for each set on this date
    reps: number[]; // Actual reps completed for each set
    notes?: string;
  }[];

  // Exercise progression tracking
  lastPerformed?: Date;
  personalBest?: {
    maxWeight: number;
    maxReps: number;
    bestVolume: number; // weight * reps * sets
    achievedDate: Date;
  };

  // Exercise metadata
  category?: 'compound' | 'isolation' | 'cardio' | 'flexibility' | 'core' | 'warmup' | 'cooldown';
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

// Enhanced completed exercise tracking
export interface CompletedExercise {
  exerciseIndex: number;
  exerciseId: string;
  exerciseName: string;
  plannedSets: number;
  completedSets: CompletedSet[];
  skipped: boolean;
  completedAt: Date;
  totalTimeSpent: number; // in seconds
  averageRPE?: number;
  averageFormRating?: number;
  exerciseNotes?: string;
  personalRecordAchieved?: boolean;
  progressionFromLastTime?: {
    weightIncrease?: number;
    repsIncrease?: number;
    setsIncrease?: number;
  };
}

// Individual set tracking
export interface CompletedSet {
  setIndex: number;
  weight?: number; // undefined for bodyweight or N/A
  actualReps: number;
  plannedReps: number | string;
  rpe?: number; // 1-10 scale
  formRating?: number; // 1-5 scale
  restTimeAfter?: number; // actual rest time taken after this set
  setNotes?: string;
  completedAt: Date;
  isPersonalRecord?: boolean;
}

// ============================================================================
// New Optimized Workout API Types (2-endpoint system)
// ============================================================================

// Generate Workout Request Types (Updated to match latest API spec)
export interface WorkoutUserMetadata {
  // Required fields per API specification
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoals?: string[]; // Non-empty array of predefined goals
  goals?: string[]; // Alternative field name for goals
  equipment: string[]; // Can be empty for bodyweight
  age: number; // 13-100
  gender: 'male' | 'female' | 'rather_not_say'; // API expects lowercase, allow rather_not_say
  weight?: number; // 30-500 (API spec range) - make optional to handle undefined
  injuries: string[]; // Can be empty
  daysPerWeek: number; // 1-7
  minutesPerSession: number; // 10-180
  timeAvailable?: number; // Alternative field name for available time
}

export interface WorkoutGenerateRequest {
  // Required fields per API documentation
  age: number; // Required: If a range is selected, send the middle value
  fitnessLevel: string; // Required: "beginner", "intermediate", "advanced"
  equipment: string[]; // Required: ["Dumbbells", "Resistance Bands", etc.]
  goals: string[]; // Required: ["strength", "weight loss", etc.]

  // Optional fields
  gender?: string; // Optional: "male", "female"
  weight?: number; // Optional: lbs
  injuries?: string[]; // Optional: ["lower_back", "knee", etc.]
  timeAvailable?: number; // Optional: minutes (10-120)
  daysPerWeek?: number; // Optional: 1-7
  workoutType?: string; // Optional: free-form text like "Push Day - (Sub Text Description)"
  otherInformation?: string; // Optional: free-form additional context entered by the user
}

// Enhanced Workout Response Types (Updated to match latest API spec)
export interface WorkoutExerciseDetail {
  name: string;
  sets: number;
  reps: string; // e.g., "8-10", "30 seconds", "to failure"
  duration: number; // in seconds, 0 for rep-based exercises
  rest: string; // e.g., "90 seconds", "2 minutes"
  instructions: string[];
  targetMuscles: string[];
  equipment: string[];
  modifications: string[];
}

export interface WorkoutPhase {
  exercises: WorkoutExerciseDetail[];
}

// Enhanced Personalization Types (matching API documentation)
export interface PersonalizationMetadata {
  applied: boolean;
  confidence: number; // 0-1 confidence score
  dataQuality: 'high' | 'medium' | 'low' | 'insufficient' | 'no_data';
  adjustments: {
    duration: number; // Minutes adjusted from base duration (can be negative)
    intensity: number; // Intensity multiplier (1.0 = no change, >1.0 = harder, <1.0 = easier)
    volume: number; // Volume multiplier (1.0 = no change, >1.0 = more sets/reps)
  };
  insights: {
    progressiveOverloadReady: boolean; // User is ready for difficulty progression
    riskLevel: 'low' | 'medium' | 'high'; // Overall risk assessment
    recommendationCount: number; // Number of personalization recommendations applied
  };
  reason?: string; // Reason why personalization wasn't applied (if applicable)
}

export interface WorkoutGenerateResponse {
  status: 'success' | 'error';
  data?: {
    workoutId: string; // CRITICAL: Backend-provided workout ID for completion tracking (at top level)
    workout: {
      type: string;
      duration: number; // minutes
      difficulty: string;
      equipment: string[];
      warmup: {
        name: string;
        duration: string;
        instructions: string;
      }[];
      mainWorkout: {
        structure: string;
        exercises: {
          name: string;
          category: string;
          sets: number;
          reps: string;
          rest: string;
          instructions: string;
          targetMuscles: string[];
        }[];
      };
      cooldown: {
        name: string;
        duration: string;
        instructions: string;
      }[];
      coachingTips: string[];
    };
    metadata: {
      model: string;
      provider: string;
      timestamp: string;
      correlationId: string;
      userId: string;
      debug: {
        requestFormat: string;
        isEnhancedFormat: boolean;
        parsedWorkoutType: string;
        professionalStandards: {
          certificationLevel: string;
          programmingApproach: string;
          qualityScore: number;
        };
        workoutStructureValidation: {
          hasWarmup: boolean;
          hasMainWorkout: boolean;
          hasCooldown: boolean;
          exerciseCount: number;
        };
      };
    };
  };
  correlationId: string;
  timestamp: string;
  message?: string;
}

// Complete Workout Request Types - Enhanced API Specification
export interface WorkoutCompleteRequest {
  workoutId: string; // Required: from generate response
  completed: boolean; // Required: true/false
  completionPercentage?: number; // Optional: 0-100 (auto-calculated if not provided)
  actualDuration?: number; // Optional: actual workout duration in minutes
  startedAt?: string; // Optional: when workout was started (ISO string)
  completedAt?: string; // Optional: when workout was finished (ISO string)
  exercises: { // Required: detailed exercise completion data
    name: string;
    type?: string; // Optional: exercise type
    muscleGroups?: string; // Optional: target muscle groups
    completed: boolean; // Required: whether exercise was completed
    difficulty?: 'too_easy' | 'just_right' | 'too_hard'; // Optional: exercise difficulty
    notes?: string; // Optional: exercise-specific notes
    sets: { // Required: detailed set tracking
      setNumber?: number; // Optional: set number (API expects this)
      reps: number; // Required: actual reps completed
      weight: number; // Required: weight used (0 for bodyweight)
      duration?: number; // Optional: duration for time-based exercises
      distance?: number; // Optional: distance for cardio exercises
      restTime?: string; // Optional: rest time after set
      completed: boolean; // Required: whether set was completed
      notes?: string; // Optional: set-specific notes
      targetReps?: number; // Optional: target reps for comparison
      targetWeight?: number; // Optional: target weight for comparison
    }[];
    totalReps?: number; // Optional: total reps across all sets (API expects this)
    totalWeight?: number; // Optional: total weight across all sets (API expects this)
    targetSets?: number; // Optional: planned number of sets
    targetReps?: number; // Optional: planned reps per set
  }[];
  feedback?: { // Optional: overall workout feedback
    rating?: number; // Optional: 1-5 overall rating
    difficulty?: 'too_easy' | 'just_right' | 'too_hard'; // Optional: overall difficulty perception
    enjoyment?: number; // Optional: 1-5 enjoyment rating
    energy?: number; // Optional: 1-5 energy level after workout
    notes?: string; // Optional: general feedback notes
    injuries?: string[]; // Optional: any injuries that occurred
    environment?: { // Optional: workout environment details
      location?: string;
      temperature?: string;
    };
    wouldRecommend?: boolean; // Optional: would recommend this workout
  };
}

export interface WorkoutCompleteResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    workoutId: string;
    completed: boolean;
    completionPercentage: number;
    exercisesTracked: number;
    completedExercises: number;
    skippedExercises: number;
    totalWeight?: number; // Total weight lifted across all exercises
    totalReps?: number; // Total reps completed
    actualDuration?: number; // Actual workout duration
    processed: boolean;
    nextRecommendations?: { // AI-generated recommendations for next workout
      restDays?: number;
      focusAreas?: string[];
      adjustments?: string[];
      progressionSuggestions?: string[];
    };
  };
  correlationId: string;
  timestamp: string;
}

// Workout History API Types
export interface WorkoutHistoryEntry {
  workoutId: string; // API returns workoutId, not id
  date: string; // API returns date field
  status: string; // API includes status field
  type: string; // API returns type, not workoutType
  duration: number; // in minutes
  difficulty: string;
  completed: boolean;
  completionPercentage?: number;
  rating?: number; // 1-5
  actualDuration?: number; // in minutes
  exercises: {
    name: string;
    sets?: string; // API format
    reps?: string; // API format
    type?: string; // API includes type
    completed?: boolean;
    actualSets?: number;
    actualReps?: string;
    notes?: string;
  }[];
  notes?: string;
  feedback?: {
    difficulty?: 'too_easy' | 'just_right' | 'too_hard';
    enjoyment?: number; // 1-5
    energy?: string; // "low", "medium", "high"
  };
}

export interface WorkoutHistoryResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    workouts: WorkoutHistoryEntry[];
    stats: {
      totalWorkouts: number;
      completedWorkouts: number;
      completionRate: number;
      averageRating: number;
      averageDuration: number;
      currentStreak: number;
      longestStreak: number;
      lastWorkout: string;
      preferredWorkoutTypes: Record<string, number>;
    };
  };
  correlationId: string;
  timestamp: string;
}

// ============================================================================
// Predefined Options for New API System
// ============================================================================

// Fitness Goals Options (predefined for multi-select)
export const FITNESS_GOALS_OPTIONS = [
  'Weight Loss',
  'Muscle Building',
  'Strength Training',
  'Cardiovascular Health',
  'Flexibility & Mobility',
  'Athletic Performance',
  'General Fitness',
  'Rehabilitation',
  'Stress Relief',
  'Endurance Training',
  'Functional Fitness',
  'Body Composition',
  'Balance & Coordination',
  'Injury Prevention'
] as const;

export type FitnessGoal = typeof FITNESS_GOALS_OPTIONS[number];

// Equipment Types (predefined for multi-select)
export const EQUIPMENT_TYPES = [
  'Dumbbells',
  'Barbell',
  'Resistance Bands',
  'Kettlebells',
  'Pull-up Bar',
  'Yoga Mat',
  'Stability Ball',
  'Medicine Ball',
  'Cable Machine',
  'Treadmill',
  'Stationary Bike',
  'Rowing Machine',
  'Bench',
  'Squat Rack',
  'TRX/Suspension Trainer',
  'Foam Roller',
  'Jump Rope',
  'Battle Ropes',
  'Bosu Ball',
  'Resistance Loops',
  'Ankle Weights',
  'Weight Plates',
  'Gymnastic Rings',
  'Parallette Bars',
  'No Equipment/Bodyweight'
] as const;

export type EquipmentType = typeof EQUIPMENT_TYPES[number];

// Common Injury Types (predefined for multi-select)
export const COMMON_INJURY_TYPES = [
  'Lower Back Pain',
  'Knee Issues',
  'Shoulder Impingement',
  'Neck Pain',
  'Ankle Sprain',
  'Wrist Pain',
  'Hip Flexor Tightness',
  'Plantar Fasciitis',
  'Tennis Elbow',
  'Rotator Cuff Injury',
  'Sciatica',
  'IT Band Syndrome',
  'Hamstring Strain',
  'Achilles Tendonitis',
  'Carpal Tunnel',
  'Previous Surgery',
  'Arthritis',
  'Herniated Disc',
  'No Injuries'
] as const;

export type CommonInjury = typeof COMMON_INJURY_TYPES[number];

// ============================================================================
// API Specification Constants (from latest documentation)
// ============================================================================

export const API_FITNESS_GOALS = [
  'weight_loss', 'muscle_gain', 'strength', 'endurance',
  'flexibility', 'toning', 'general_fitness', 'athletic_performance',
  'rehabilitation', 'stress_relief'
] as const;

export const API_EQUIPMENT_TYPES = [
  'bodyweight', 'dumbbells', 'barbell', 'resistance_bands',
  'kettlebells', 'pull_up_bar', 'yoga_mat', 'bench',
  'cardio_machine', 'cable_machine', 'medicine_ball', 'foam_roller'
] as const;

export const API_INJURY_TYPES = [
  'lower_back', 'knee', 'shoulder', 'neck', 'ankle',
  'wrist', 'hip', 'elbow', 'chronic_pain', 'recent_surgery'
] as const;

export type ApiFitnessGoal = typeof API_FITNESS_GOALS[number];
export type ApiEquipmentType = typeof API_EQUIPMENT_TYPES[number];
export type ApiInjuryType = typeof API_INJURY_TYPES[number];

// Legacy Workout History Entry for backward compatibility (deprecated)
export interface LegacyWorkoutHistoryEntry {
  id: string;
  workoutType: string;
  duration: number;
  difficulty: string;
  completedAt: Date;
  exercises: Exercise[];
  performance?: {
    caloriesBurned?: number;
    averageHeartRate?: number;
    perceivedExertion?: number;
  };
}

// Legacy types for backward compatibility (will be removed)
export interface WorkoutAPIRequest {
  userMetadata: WorkoutUserMetadata;
  workoutHistory?: WorkoutPlan[];
  workoutRequest: string;
  workoutSpecification?: {
    workoutType: string;
    duration: number;
    difficulty: string;
    focusAreas?: string[];
    equipment?: string[];
  };
  additionalNotes?: string;
  requestId?: string;
  timestamp?: string;
  sessionContext?: string;
  correlationId?: string;
}

export interface WorkoutAPIResponse {
  status: 'success' | 'error';
  data?: {
    workout: Record<string, unknown>; // Legacy format
    metadata: {
      model: string;
      provider: string;
      timestamp: string;
      correlationId: string;
      userId: string;
    };
  };
  message?: string;
  timestamp: string;
  correlationId: string;
  retryable?: boolean;
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
  completedExercises: CompletedExercise[];
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
  overallRating?: number; // 1-5 overall workout rating
  workoutNotes?: string; // overall workout notes

  // Environment and context
  location?: 'home' | 'gym' | 'outdoor' | 'other';
  weather?: string; // for outdoor workouts
  equipment?: string[];

  // Enhanced session analytics
  sessionAnalytics?: {
    totalSetsCompleted: number;
    totalRepsCompleted: number;
    totalWeightLifted: number; // sum of all weights across all sets
    averageRestTime: number;
    exerciseCompletionRate: number; // percentage of exercises completed
    strengthProgression?: number; // compared to previous similar workout
    enduranceProgression?: number;
    consistencyScore?: number;
  };

  // Early completion data
  completedEarly?: boolean;
  earlyCompletionReason?: string;
  plannedDuration?: number; // original planned duration

  // Session notes and feedback
  notes?: string;
  mood?: 'energetic' | 'tired' | 'motivated' | 'stressed' | 'neutral';

  // Recovery and adaptation data
  sleepQuality?: number; // 1-5 scale from previous night
  stressLevel?: number; // 1-5 scale
  hydrationLevel?: number; // 1-5 scale
  nutritionTiming?: 'fasted' | 'pre_workout_meal' | 'post_meal';
}

// Workout session summary for history display
export interface WorkoutSessionSummary {
  id: string;
  workoutName: string;
  date: Date;
  duration: number; // in minutes
  exercisesCompleted: number;
  totalExercises: number;
  completionRate: number; // percentage
  totalWeightLifted?: number;
  averageRPE?: number;
  overallRating?: number;
  workoutType: string;
  status: 'completed' | 'abandoned' | 'completed_early';
  personalRecordsAchieved: number;
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
  originalValue: unknown;
  adaptedValue: unknown;
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