/* ============================================================================
 * Shared request / response contracts used by api.ts and the chat store
 * ========================================================================== */

/** Canonical provider keys we support today */
export type ModelProvider = "openai" | "google" | "xai";

/** Raw request body sent to /api/query */
export interface ChatRequest {
  prompt: string;
  /** Array of fully‑qualified model keys, e.g. "openai:gpt-4" */
  models: string[];
  /** Whether to use ensemble mode */
  useEnsemble?: boolean;
}

/** Per‑model answer as returned by the backend */
export interface SubAnswer {
  model: string;          // Full model key like "openai:gpt-4"
  answer: string;         // The model's native response
  role?: string;          // Role in ensemble mode (e.g., "Scientific Analyst")
}

/** Ensemble metadata for detailed breakdown */
export interface EnsembleMetadata {
  scientificAnalyst?: string;
  creativeAdvisor?: string;
  devilsAdvocate?: string;
  executionTime?: number;
}

/** Full backend payload */
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
  timeAvailability: {
    daysPerWeek: number;
    minutesPerSession: number;
  };
  completedOnboarding: boolean;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  exercises: Exercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets?: number;
  reps?: number;
  duration?: number; // in seconds
  restTime?: number; // in seconds
  equipment?: string[];
}