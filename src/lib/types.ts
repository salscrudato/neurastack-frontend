/* ============================================================================
 * NeuraStack Frontend API Types - Updated for Latest Backend Integration
 * ========================================================================== */

/** Canonical provider keys we support today */
export type ModelProvider = "openai" | "google" | "xai";

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

/** Request interface for NeuraStack API */
export interface NeuraStackQueryRequest {
  /** The user's prompt/question */
  prompt: string;

  /** Use 4-AI ensemble for better responses (recommended) */
  useEnsemble?: boolean;

  /** Specific models to use (optional) */
  models?: string[];

  /** Maximum tokens in response */
  maxTokens?: number;

  /** Temperature for response creativity (0-1) */
  temperature?: number;
}

/** Headers for NeuraStack API requests */
export interface NeuraStackHeaders {
  'Content-Type': 'application/json';
  'X-Session-ID'?: string;
  'X-User-ID'?: string;
  'Authorization'?: string;
  [key: string]: string | undefined;
}

/** Per‑model answer as returned by the backend */
export interface SubAnswer {
  model: string;          // Full model key like "openai:gpt-4"
  answer: string;         // The model's native response
  role?: string;          // Role in ensemble mode (e.g., "Evidence Analyst")
}

/** Updated ensemble metadata structure */
export interface EnsembleMetadata {
  evidenceAnalyst: string;
  innovator: string;
  riskReviewer: string;
  executionTime: number;
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

  /** Ensemble-specific metadata */
  ensembleMetadata?: EnsembleMetadata;

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
  memories: UserMemory[];
  contextSummary: string;
  totalTokens: number;
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

/** @deprecated Use NeuraStackQueryResponse instead */
export interface ChatResponse {
  /** Synthesised, merged answer */
  answer: string;
  /** All individual model answers (order not guaranteed) */
  answers: SubAnswer[];
  /** Which models actually ran (true) vs. errored (false) */
  modelsUsed: Record<string, boolean>;
  /** Reasons for any fallbacks */
  fallbackReasons: Record<string, string>;
  /** Execution time in milliseconds */
  executionTime?: string;
  /** Whether ensemble mode was used */
  ensembleMode?: boolean;
  /** Detailed ensemble breakdown */
  ensembleMetadata?: EnsembleMetadata;
}

/* ============================================================================
 * Travel Planning Types
 * ========================================================================== */

/** Travel search parameters */
export interface TravelSearchParams {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  tripType?: 'roundtrip' | 'oneway' | 'multicity';
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  directFlightsOnly?: boolean;
  flexibleDates?: boolean;
  includeNearbyAirports?: boolean;
  budgetRange?: 'budget' | 'mid' | 'premium' | 'luxury';
}

/** Flight search result */
export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
  bookingUrl: string;
  cabinClass: string;
}

/** Hotel search result */
export interface HotelOption {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  amenities: string[];
  imageUrl?: string;
  bookingUrl: string;
  description?: string;
}

/** Restaurant reservation option */
export interface RestaurantOption {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  availableTimes: string[];
  reservationUrl: string;
  imageUrl?: string;
  description?: string;
}

/** Complete trip itinerary */
export interface TripItinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  flights: FlightOption[];
  hotels: HotelOption[];
  restaurants: RestaurantOption[];
  totalCost: number;
  currency: string;
  status: 'planning' | 'booked' | 'completed';
  createdAt: string;
  updatedAt: string;
}

/** Travel API response wrapper */
export interface TravelApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: {
    page: number;
    totalPages: number;
    totalResults: number;
  };
}

// Fitness types
export interface FitnessProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  equipment: string[];
  availableTime: number; // minutes per session
  workoutDays: string[]; // days of the week
  timeAvailability: {
    daysPerWeek: number;
    minutesPerSession: number;
  };
  completedOnboarding: boolean;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  duration: number; // in minutes
  exercises: Exercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  completedAt: Date | null;
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
}