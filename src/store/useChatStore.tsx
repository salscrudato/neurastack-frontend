import { create } from "zustand";
import { queryStack } from "../lib/api";
import type { SubAnswer } from "../lib/api";

export type Message = {
  id: string;
  role: "user" | "assistant" | "error";
  text: string;
  sub?: SubAnswer[];       // individual model answers (assistant only)
};

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (prompt: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,

  async sendMessage(prompt: string) {
    if (!prompt.trim()) return;

    // ─── 1. push user bubble ──────────────────────────────────────────────────
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: prompt.trim(),
    };
    set((s) => ({ messages: [...s.messages, userMsg], isLoading: true }));

    // ─── 2. call backend ─────────────────────────────────────────────────────
    try {
      const data = await queryStack(prompt);

      // build assistant bubble
      const assistant: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.answer ?? "No answer",
        sub: Array.isArray(data.answers) ? (data.answers as SubAnswer[]) : undefined,
      };

      set((s) => ({
        messages: [...s.messages, assistant],
        isLoading: false,
      }));
    } catch (err: any) {
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: crypto.randomUUID(),
            role: "error",
            text: `⚠️ ${err?.message ?? "Failed to fetch"}`,
          },
        ],
        isLoading: false,
      }));
    }
  },
}));
