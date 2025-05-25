import { create } from "zustand";
import { queryStack } from "../lib/api";
import type { SubAnswer } from "../lib/api";

import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const persistMessage = async (msg: Message) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;                       // skip for guests
  const ref = collection(db, "users", uid, "chats", "current", "messages");
  await addDoc(ref, {
    sender: msg.role,
    text: msg.text,
    createdAt: serverTimestamp(),
    model: msg.sub?.[0]?.model ?? null,
    version: msg.sub?.[0]?.version ?? null,
  });
};

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
    await persistMessage(userMsg);
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

      await persistMessage(assistant);
      set((s) => ({
        messages: [...s.messages, assistant],
        isLoading: false,
      }));
    } catch (err: any) {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "error",
        text: `⚠️ ${err?.message ?? "Failed to fetch"}`,
      };
      await persistMessage(errMsg);
      set((s) => ({
        messages: [
          ...s.messages,
          errMsg,
        ],
        isLoading: false,
      }));
    }
  },
}));
