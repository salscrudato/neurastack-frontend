import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { queryStack } from '../lib/api';
import { auth } from '../firebase';
import {
  saveMessageToFirebase,
  loadChatHistoryFromFirebase,
  clearChatHistoryFromFirebase,
  deleteMessageFromFirebase
} from '../services/chatHistoryService';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  timestamp: number;
  metadata?: {
    models?: string[];
    responseTime?: number;
    retryCount?: number;
    totalTime?: number;
    errorType?: string;
    [key: string]: any;
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
  loadChatHistory: () => Promise<void>;
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

        // Save user message to Firebase if user is authenticated
        if (auth.currentUser) {
          try {
            await saveMessageToFirebase(userMsg);
          } catch (error) {
            console.warn('Failed to save user message to Firebase:', error);
            // Don't throw error - continue with local storage only
          }
        }

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
            // Call API with ensemble mode enabled
            const response = await queryStack(text, true);
            const responseTime = Date.now() - startTime;

            // Validate response before processing
            if (!response || !response.answer) {
              throw new Error('Invalid response structure received');
            }

            // Reduced logging to improve performance
            if (process.env.NODE_ENV === 'development' && retryCount > 0) {
              console.log(`✅ Chat response received after ${retryCount} retries (${responseTime}ms)`);
            }

            // Update with actual response
            const assistantMsg = {
              id: assistantId,
              role: 'assistant' as const,
              text: response.answer,
              timestamp: Date.now(),
              metadata: {
                models: response.modelsUsed ? Object.keys(response.modelsUsed) : [],
                responseTime,
                retryCount,
                executionTime: response.executionTime,
                ensembleMode: response.ensembleMode,
                ensembleMetadata: response.ensembleMetadata,
                answers: response.answers // Store individual model answers
              }
            };

            set(state => ({
              messages: state.messages.map(m =>
                m.id === assistantId ? assistantMsg : m
              ),
              isLoading: false,
              retryCount: 0
            }));

            // Save assistant message to Firebase if user is authenticated
            if (auth.currentUser) {
              try {
                await saveMessageToFirebase(assistantMsg);
              } catch (error) {
                console.warn('Failed to save assistant message to Firebase:', error);
                // Don't throw error - continue with local storage only
              }
            }

            return; // Success, exit retry loop

          } catch (error) {
            retryCount++;
            set(() => ({ retryCount }));

            // Reduced error logging to improve performance
            if (process.env.NODE_ENV === 'development' && retryCount > MAX_RETRIES) {
              console.warn(`❌ Chat request failed after ${MAX_RETRIES} retries:`, error instanceof Error ? error.message : 'Unknown error');
            }

            if (retryCount > MAX_RETRIES) {
              // Final failure - show elegant error message
              const errorMessage = error instanceof Error
                ? error.message
                : 'An unexpected error occurred';

              set(state => ({
                messages: state.messages.filter(m => m.id !== assistantId).concat([{
                  id: nanoid(),
                  role: 'error',
                  text: `Unable to get response: ${errorMessage}. Please try again.`,
                  timestamp: Date.now(),
                  metadata: {
                    retryCount: retryCount - 1,
                    totalTime: Date.now() - startTime,
                    errorType: error instanceof Error ? error.name : 'Unknown'
                  }
                }]),
                isLoading: false,
                retryCount: 0
              }));
            } else {
              // Wait before retry with exponential backoff
              await sleep(RETRY_DELAY * retryCount);
            }
          }
        }
      },

      clearMessages: async () => {
        set({ messages: [] });

        // Clear from Firebase if user is authenticated
        if (auth.currentUser) {
          try {
            await clearChatHistoryFromFirebase();
          } catch (error) {
            console.warn('Failed to clear chat history from Firebase:', error);
          }
        }
      },

      deleteMessage: async (id: string) => {
        set(state => ({
          messages: state.messages.filter(m => m.id !== id)
        }));

        // Delete from Firebase if user is authenticated
        if (auth.currentUser) {
          try {
            await deleteMessageFromFirebase(id);
          } catch (error) {
            console.warn('Failed to delete message from Firebase:', error);
          }
        }
      },

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

      loadChatHistory: async () => {
        if (!auth.currentUser) {
          return;
        }

        try {
          const messages = await loadChatHistoryFromFirebase(50);
          set({ messages });
        } catch (error) {
          console.warn('Failed to load chat history from Firebase:', error);
        }
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
