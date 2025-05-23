/* ≡ request / response payloads =========================================== */
export interface ModelSpec { model: string; version: string }

export interface ChatRequest  {
  prompt:  string;
  models:  ModelSpec[];
}

export interface SubAnswer extends ModelSpec {
  answer: string;
}

export interface ChatResponse {
  answer:  string;           // synthesised
  answers: SubAnswer[];      // per-model
}