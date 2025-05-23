import { create } from 'zustand';

import { queryStack } from '../lib/api';
import type { SubAnswer } from '../lib/types';

export type Message =
  | { id: string; role: 'user' | 'assistant'; text: string }
  | { id: string; role: 'meta';      text: string };          // “gpt-4, gemini…” fold-out

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (prompt: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, _get) => ({  // _get is unused
  messages: [],
  isLoading: false,

  async sendMessage(prompt) {
    if (!prompt.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: prompt.trim(),
    };

    set(s => ({ messages: [...s.messages, userMsg], isLoading: true }));

    try {
      const data = await queryStack(prompt);

      const assistant: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.answer,
      };

      // expand / collapse raw answers later
      const meta: Message = {
        id: crypto.randomUUID(),
        role: 'meta',
        text: data.answers.map((a: SubAnswer) => `**${a.model}-${a.version}** → ${a.answer}`).join('\n\n'),
      };

      set(s => ({
        messages: [...s.messages, assistant, meta],
        isLoading: false,
      }));
    } catch (e: any) {
      set(s => ({
        messages: [...s.messages, { id: crypto.randomUUID(), role: 'assistant', text: `⚠️ ${e.message}` }],
        isLoading: false,
      }));
    }
  },
}));
