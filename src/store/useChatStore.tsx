import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { queryStack } from '../lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  timestamp: number;
  isPinned?: boolean;
  metadata?: {
    models?: string[];
    responseTime?: number;
    retryCount?: number;
  };
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  retryCount: number;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  deleteMessage: (id: string) => void;
  retryMessage: (messageId: string) => Promise<void>;
  togglePin: (messageId: string) => void;
  getPinnedMessages: () => Message[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      retryCount: 0,

      sendMessage: async (text: string) => {
        const startTime = Date.now();

        // Add user message
        const userMsg: Message = {
          id: nanoid(),
          role: 'user',
          text,
          timestamp: Date.now()
        };

        set(state => ({
          messages: [...state.messages, userMsg],
          isLoading: true,
          retryCount: 0
        }));

        // Create placeholder for assistant response
        const assistantId = nanoid();
        set(state => ({
          messages: [...state.messages, {
            id: assistantId,
            role: 'assistant',
            text: '',
            timestamp: Date.now()
          }]
        }));

        let retryCount = 0;

        while (retryCount <= MAX_RETRIES) {
          try {
            // Call API
            const response = await queryStack(text);
            const responseTime = Date.now() - startTime;

            // Update with actual response
            set(state => ({
              messages: state.messages.map(m =>
                m.id === assistantId
                  ? {
                      ...m,
                      text: response.answer,
                      metadata: {
                        models: response.modelsUsed ? Object.keys(response.modelsUsed) : [],
                        responseTime,
                        retryCount
                      }
                    }
                  : m
              ),
              isLoading: false,
              retryCount: 0
            }));
            return; // Success, exit retry loop

          } catch (error) {
            retryCount++;
            set(() => ({ retryCount }));

            if (retryCount > MAX_RETRIES) {
              // Final failure - show error message
              set(state => ({
                messages: state.messages.filter(m => m.id !== assistantId).concat([{
                  id: nanoid(),
                  role: 'error',
                  text: `Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                  timestamp: Date.now(),
                  metadata: { retryCount: retryCount - 1 }
                }]),
                isLoading: false,
                retryCount: 0
              }));
            } else {
              // Wait before retry
              await sleep(RETRY_DELAY * retryCount);
            }
          }
        }
      },

      clearMessages: () => set({ messages: [] }),

      deleteMessage: (id: string) => set(state => ({
        messages: state.messages.filter(m => m.id !== id)
      })),

      retryMessage: async (messageId: string) => {
        const state = get();
        const messageIndex = state.messages.findIndex(m => m.id === messageId);

        if (messageIndex === -1) return;

        // Find the user message that preceded this error/assistant message
        let userMessage = null;
        for (let i = messageIndex - 1; i >= 0; i--) {
          if (state.messages[i].role === 'user') {
            userMessage = state.messages[i];
            break;
          }
        }

        if (!userMessage) return;

        // Remove the failed message and retry
        set(state => ({
          messages: state.messages.filter(m => m.id !== messageId)
        }));

        await get().sendMessage(userMessage.text);
      },

      togglePin: (messageId: string) => set(state => ({
        messages: state.messages.map(m =>
          m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
        )
      })),

      getPinnedMessages: () => {
        const state = get();
        return state.messages.filter(m => m.isPinned);
      }
    }),
    {
      name: 'neurastack-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages.slice(-50) // Keep only last 50 messages
      }),
    }
  )
);
