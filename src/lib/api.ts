/**
 * src/lib/api.ts
 * ---------------------------------------------------------------------------
 * Tiny, typed wrapper around the Neurastack backend.
 *  – Reads the base‑url from Vite env and falls back to prod Cloud‑Run URL.
 *  – Aborts after 30 s by default (browser‑side timeout).
 *  – Surfaces JSON errors as real `Error` objects (so callers can catch).
 * ---------------------------------------------------------------------------
 */

// Version info - print to console on load
const VERSION = `v_final_${new Date().toLocaleString('en-US', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
}).replace(/[\/\s:]/g, '_')}`;

console.log(`🚀 Neurastack Frontend API Module ${VERSION} loaded successfully!`);

export interface SubAnswer {
  model: string;            // Full model key like "openai:gpt-4"
  answer: string;
  role?: string;            // Role in ensemble mode (e.g., "Scientific Analyst")
}

export interface EnsembleMetadata {
  scientificAnalyst?: string;
  creativeAdvisor?: string;
  devilsAdvocate?: string;
  executionTime?: number;
}

export interface StackResponse {
  answer: string;                              // synthesised answer
  answers?: SubAnswer[];                       // per‑model answers (optional for backward compatibility)
  modelsUsed: Record<string, boolean>;         // e.g. { 'openai:gpt-4': true }
  fallbackReasons?: Record<string, string>;    // key → reason (optional for backward compatibility)
  executionTime?: string;                      // execution time in milliseconds
  ensembleMode?: boolean;                      // whether ensemble mode was used
  ensembleMetadata?: EnsembleMetadata;         // detailed ensemble breakdown
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  retryable?: boolean;
}

// Request cache to prevent duplicate calls
const requestCache = new Map<string, Promise<StackResponse>>();
const CACHE_TTL = 5000; // 5 seconds

// Network status detection
function isOnline(): boolean {
  return navigator.onLine;
}

// Create user-friendly error messages
function createUserFriendlyError(error: any, status?: number): ApiError {
  const apiError = new Error() as ApiError;

  if (!isOnline()) {
    apiError.message = "No internet connection. Please check your network and try again.";
    apiError.retryable = true;
    return apiError;
  }

  if (status) {
    apiError.status = status;

    switch (status) {
      case 429:
        apiError.message = "Too many requests. Please wait a moment and try again.";
        apiError.retryable = true;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        apiError.message = "Server is temporarily unavailable. Please try again in a few moments.";
        apiError.retryable = true;
        break;
      case 400:
        apiError.message = "Invalid request. Please check your input and try again.";
        apiError.retryable = false;
        break;
      case 401:
        apiError.message = "Authentication failed. Please refresh the page and try again.";
        apiError.retryable = false;
        break;
      default:
        apiError.message = `Server error (${status}). Please try again.`;
        apiError.retryable = status >= 500;
    }
  } else if (error.name === 'AbortError') {
    apiError.message = "Request timed out. Please try again.";
    apiError.retryable = true;
  } else {
    apiError.message = "Network error. Please check your connection and try again.";
    apiError.retryable = true;
  }

  return apiError;
}

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ||
  "https://neurastack-server-373148373738.us-central1.run.app";

/** Models sent in every request – hard‑coded for now */
const MODELS = [
  "openai:gpt-4",
  "google:gemini-1.5-flash",
  "xai:grok-3-mini",
];

// Response validation and sanitization
function validateAndSanitizeResponse(data: any): StackResponse {
  // Validate core structure
  if (!data || typeof data !== 'object') {
    throw createUserFriendlyError(
      new Error('Invalid response format from server'),
      undefined
    );
  }

  // Validate and sanitize answer field
  if (!data.answer || typeof data.answer !== 'string') {
    throw createUserFriendlyError(
      new Error('Invalid response structure from server'),
      undefined
    );
  }

  // Sanitize answer text - remove potential harmful content
  const sanitizedAnswer = data.answer
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .trim();

  if (!sanitizedAnswer) {
    throw createUserFriendlyError(
      new Error('Empty response from server'),
      undefined
    );
  }

  // Ensure backward compatibility and validate other fields
  const validatedResponse: StackResponse = {
    answer: sanitizedAnswer,
    answers: Array.isArray(data.answers) ? data.answers : [],
    modelsUsed: data.modelsUsed && typeof data.modelsUsed === 'object' ? data.modelsUsed : {},
    fallbackReasons: data.fallbackReasons && typeof data.fallbackReasons === 'object' ? data.fallbackReasons : {},
    executionTime: typeof data.executionTime === 'string' ? data.executionTime : undefined,
    ensembleMode: typeof data.ensembleMode === 'boolean' ? data.ensembleMode : undefined,
    ensembleMetadata: data.ensembleMetadata && typeof data.ensembleMetadata === 'object' ? data.ensembleMetadata : undefined
  };

  return validatedResponse;
}

// Clean console logging for response structure
function logResponseStructure(data: StackResponse, responseTime: number): void {
  console.group(`📦 Response Structure Analysis`);
  console.log(`📝 Answer Length: ${data.answer.length} characters`);
  console.log(`🤖 Models Used: ${Object.keys(data.modelsUsed).length > 0 ? Object.keys(data.modelsUsed).join(', ') : 'None'}`);
  console.log(`📊 Sub-answers: ${data.answers?.length || 0}`);
  console.log(`⚠️  Fallbacks: ${Object.keys(data.fallbackReasons || {}).length}`);
  console.log(`⏱️  Total Processing: ${responseTime}ms`);

  if (data.answers && data.answers.length > 0) {
    console.group(`🔍 Model Breakdown`);
    data.answers.forEach((subAnswer, index) => {
      const roleInfo = subAnswer.role ? ` (${subAnswer.role})` : '';
      console.log(`${index + 1}. ${subAnswer.model}${roleInfo} - ${subAnswer.answer.length} chars`);
    });
    console.groupEnd();
  }

  if (Object.keys(data.fallbackReasons || {}).length > 0) {
    console.group(`⚠️  Fallback Reasons`);
    Object.entries(data.fallbackReasons || {}).forEach(([model, reason]) => {
      console.log(`${model}: ${reason}`);
    });
    console.groupEnd();
  }

  console.groupEnd();
}

/**
 * POST /api/query
 *
 * @param prompt  – user’s natural‑language question
 * @param useEnsemble – whether to use ensemble mode (default false)
 * @param timeout – ms to abort on the client‑side (default 30 s)
 */
export async function queryStack(
  prompt: string,
  useEnsemble = false,
  timeout = 30_000
): Promise<StackResponse> {
  // Check for cached request
  const cacheKey = `${prompt}-${MODELS.join(',')}-${useEnsemble}`;
  const cachedRequest = requestCache.get(cacheKey);

  if (cachedRequest) {
    try {
      return await cachedRequest;
    } catch {
      // If cached request failed, remove it and continue
      requestCache.delete(cacheKey);
    }
  }

  // Create new request
  const requestPromise = executeQuery(prompt, useEnsemble, timeout);

  // Cache the request promise
  requestCache.set(cacheKey, requestPromise);

  // Clean up cache after TTL
  setTimeout(() => {
    requestCache.delete(cacheKey);
  }, CACHE_TTL);

  return requestPromise;
}

async function executeQuery(prompt: string, useEnsemble: boolean, timeout: number): Promise<StackResponse> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  const startTime = Date.now();

  try {
    // Check network status
    if (!isOnline()) {
      throw createUserFriendlyError(new Error('Offline'), undefined);
    }

    const res = await fetch(`${BASE_URL}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": crypto.randomUUID(), // For request tracking
      },
      body: JSON.stringify({ prompt, models: MODELS, useEnsemble }),
      signal: ctrl.signal,
    });

    const responseTime = Date.now() - startTime;

    // Enhanced logging with clean formatting
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚀 API Request Completed`);
      console.log(`⏱️  Response Time: ${responseTime}ms`);
      console.log(`📊 Status: ${res.status}`);
      console.log(`🎯 Endpoint: ${res.url}`);
      console.log(`💬 Prompt: "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
      console.groupEnd();
    }

    if (!res.ok) {
      // Try to read structured error
      let errorDetail = '';
      try {
        const detail = await res.text();
        errorDetail = detail.slice(0, 120);
      } catch {
        // ignore
      }

      const error = createUserFriendlyError(
        new Error(`API Error: ${errorDetail}`),
        res.status
      );

      throw error;
    }

    let data: StackResponse;
    try {
      const responseText = await res.text();
      if (!responseText.trim()) {
        throw createUserFriendlyError(
          new Error('Empty response from server'),
          undefined
        );
      }
      data = JSON.parse(responseText) as StackResponse;
    } catch (parseError: any) {
      if (parseError.retryable !== undefined) {
        throw parseError; // Re-throw user-friendly errors
      }
      console.error('Failed to parse JSON response:', parseError);
      throw createUserFriendlyError(
        new Error('Invalid response format from server'),
        undefined
      );
    }

    // Enhanced response validation and sanitization
    const validatedData = validateAndSanitizeResponse(data);

    // Log clean response structure in development
    if (process.env.NODE_ENV === 'development') {
      logResponseStructure(validatedData, responseTime);
    }

    return validatedData;

  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.group(`❌ API Request Failed`);
      console.log(`⏱️  Failed after: ${responseTime}ms`);
      console.log(`🔍 Error Type: ${error.name || 'Unknown'}`);
      console.log(`💬 Error Message: ${error.message || 'No message'}`);
      console.log(`🔄 Retryable: ${error.retryable ? 'Yes' : 'No'}`);
      if (error.status) {
        console.log(`📊 HTTP Status: ${error.status}`);
      }
      console.groupEnd();
    }

    // Re-throw user-friendly errors as-is
    if (error.retryable !== undefined) {
      throw error;
    }

    // Convert other errors to user-friendly format
    throw createUserFriendlyError(error, undefined);

  } finally {
    clearTimeout(timer);
  }
}