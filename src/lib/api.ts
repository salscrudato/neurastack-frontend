/**
 * src/lib/api.ts
 * ---------------------------------------------------------------------------
 * Tiny, typed wrapper around the Neurastack backend.
 *  – Reads the base‑url from Vite env and falls back to prod Cloud‑Run URL.
 *  – Aborts after 30 s by default (browser‑side timeout).
 *  – Surfaces JSON errors as real `Error` objects (so callers can catch).
 * ---------------------------------------------------------------------------
 */

export interface SubAnswer {
  model: string;            // "openai"
  version: string;          // "gpt-4"
  answer: string;
}

export interface StackResponse {
  answer: string;                              // synthesised answer
  answers?: SubAnswer[];                       // per‑model answers (optional for backward compatibility)
  modelsUsed: Record<string, boolean>;         // e.g. { 'openai:gpt-4': true }
  fallbackReasons?: Record<string, string>;    // key → reason (optional for backward compatibility)
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

/**
 * POST /api/query
 *
 * @param prompt  – user’s natural‑language question
 * @param timeout – ms to abort on the client‑side (default 30 s)
 */
export async function queryStack(
  prompt: string,
  timeout = 30_000
): Promise<StackResponse> {
  // Check for cached request
  const cacheKey = `${prompt}-${MODELS.join(',')}`;
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
  const requestPromise = executeQuery(prompt, timeout);

  // Cache the request promise
  requestCache.set(cacheKey, requestPromise);

  // Clean up cache after TTL
  setTimeout(() => {
    requestCache.delete(cacheKey);
  }, CACHE_TTL);

  return requestPromise;
}

async function executeQuery(prompt: string, timeout: number): Promise<StackResponse> {
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
      body: JSON.stringify({ prompt, models: MODELS }),
      signal: ctrl.signal,
    });

    const responseTime = Date.now() - startTime;

    // Log performance metrics
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request completed in ${responseTime}ms`, {
        status: res.status,
        url: res.url,
        prompt: prompt.slice(0, 50) + '...',
      });
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

    // Validate response structure
    if (!data.answer || typeof data.answer !== 'string') {
      throw createUserFriendlyError(
        new Error('Invalid response structure from server'),
        undefined
      );
    }

    // Ensure backward compatibility by adding missing fields if needed
    if (!data.answers) {
      data.answers = [];
    }
    if (!data.fallbackReasons) {
      data.fallbackReasons = {};
    }

    return data;

  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Request failed after ${responseTime}ms:`, error);
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