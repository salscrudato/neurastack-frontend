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
}

/** Per‑model answer as returned by the backend */
export interface SubAnswer {
  model: ModelProvider;   // "openai"
  version: string;        // "gpt-4"
  answer: string;         // The model's native response
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
}