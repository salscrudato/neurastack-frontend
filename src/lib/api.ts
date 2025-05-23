// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/** Call the NeuraStack backend */
export async function queryStack(prompt: string) {
  const body = {
    prompt,
    models: [
      { model: 'xai',    version: 'grok-3-mini'       },
      { model: 'google', version: 'gemini-1.5-flash'  },
      { model: 'openai', version: 'gpt-4o-mini'       },
    ],
  };

  const res = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json(); // → { answer, stackIdUsed, answers: [...] }
}