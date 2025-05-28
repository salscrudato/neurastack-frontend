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
  answers: SubAnswer[];                        // per‑model answers
  modelsUsed: Record<string, boolean>;         // e.g. { 'openai:gpt-4': true }
  fallbackReasons: Record<string, string>;     // key → reason
}

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ||
  "https://neurastack-server-1.onrender.com";

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
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);

  try {
    const res = await fetch(`${BASE_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, models: MODELS }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      // try to read structured error
      let msg = `API ${res.status}`;
      try {
        const detail = await res.text();
        msg += ` – ${detail.slice(0, 120)}`;
      } catch {
        /* ignore */
      }
      throw new Error(msg);
    }

    return (await res.json()) as StackResponse;
  } finally {
    clearTimeout(timer);
  }
}