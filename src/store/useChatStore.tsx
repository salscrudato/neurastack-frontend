import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { neuraStackClient } from '../lib/neurastack-client';
import { auth } from '../firebase';
import {
  saveMessageToFirebase,
  loadChatHistoryFromFirebase,
  clearChatHistoryFromFirebase,
  deleteMessageFromFirebase
} from '../services/chatHistoryService';
import { handleSilentError } from '../utils/errorHandler';
import { enhanceResponseWithMockData } from '../utils/mockIndividualResponses';

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
    // New memory-related metadata
    memoryContext?: string;
    tokenCount?: number;
    memoryTokensSaved?: number;
    ensembleMode?: boolean;
    sessionId?: string;
    // Individual model responses for modal display
    individualResponses?: import('../lib/types').SubAnswer[];
    ensembleMetadata?: import('../lib/types').EnsembleMetadata;
    modelsUsed?: Record<string, boolean>;
    fallbackReasons?: Record<string, string>;
    executionTime?: string;
    [key: string]: any;
  };
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  retryCount: number;
  sessionId: string;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  deleteMessage: (id: string) => void;
  retryMessage: (messageId: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  initializeSession: () => void;
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
      sessionId: crypto.randomUUID(),

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

        // Save user message to Firebase if user is authenticated (non-anonymous)
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          try {
            await saveMessageToFirebase(userMsg);
          } catch (error) {
            handleSilentError(error, {
              component: 'useChatStore',
              action: 'saveUserMessage',
              userId: auth.currentUser?.uid
            });
          }
        }

        // Set loading state - no placeholder message needed
        const assistantId = nanoid();

        let retryCount = 0;

        while (retryCount <= MAX_RETRIES) {
          try {
            const { sessionId } = get();

            // Configure the new API client with session info
            neuraStackClient.configure({
              sessionId,
              userId: auth.currentUser?.uid || '',
              useEnsemble: true
            });

            // Use the new memory-aware API with specific models
            const response = await neuraStackClient.queryAI(text, {
              useEnsemble: true,
              models: ['google:gemini-1.5-flash', 'google:gemini-1.5-flash', 'xai:grok-3-mini', 'xai:grok-3-mini'],
              maxTokens: 2000,
              temperature: 0.7
            });

            const responseTime = Date.now() - startTime;

            // Debug logging for API response
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 API Response:', response);
              console.log('🔍 Token count:', response.tokenCount);
              console.log('🔍 Ensemble mode:', response.ensembleMode);
            }

            // Validate response before processing
            if (!response || !response.answer) {
              throw new Error('Invalid response structure received');
            }

            // Enhance response with mock individual responses for testing
            const enhancedResponse = enhanceResponseWithMockData(response);

            // Clean and validate the response text
            const cleanedAnswer = typeof enhancedResponse.answer === 'string'
              ? enhancedResponse.answer.trim()
              : String(enhancedResponse.answer || '').trim();

            if (!cleanedAnswer) {
              throw new Error('Empty response received from API');
            }

            // Reduced logging to improve performance
            if (process.env.NODE_ENV === 'development' && retryCount > 0) {
              console.log(`✅ Chat response received after ${retryCount} retries (${responseTime}ms)`);
            }

            const assistantMsg = {
              id: assistantId,
              role: 'assistant' as const,
              text: cleanedAnswer,
              timestamp: Date.now(),
              metadata: {
                models: enhancedResponse.modelsUsed ? Object.keys(enhancedResponse.modelsUsed) : [],
                responseTime,
                retryCount,
                executionTime: enhancedResponse.executionTime,
                ensembleMode: enhancedResponse.ensembleMode,
                ensembleMetadata: enhancedResponse.ensembleMetadata,
                // Memory-related metadata
                memoryContext: enhancedResponse.memoryContext,
                tokenCount: enhancedResponse.tokenCount,
                memoryTokensSaved: enhancedResponse.memoryTokensSaved,
                sessionId,
                // Individual model responses for modal display
                individualResponses: enhancedResponse.individualResponses,
                modelsUsed: enhancedResponse.modelsUsed,
                fallbackReasons: enhancedResponse.fallbackReasons
              }
            };

            set(state => ({
              messages: [...state.messages, assistantMsg],
              isLoading: false,
              retryCount: 0
            }));

            // Save assistant message to Firebase if user is authenticated (non-anonymous)
            if (auth.currentUser && !auth.currentUser.isAnonymous) {
              try {
                await saveMessageToFirebase(assistantMsg);
              } catch (error) {
                handleSilentError(error, {
                  component: 'useChatStore',
                  action: 'saveAssistantMessage',
                  userId: auth.currentUser?.uid
                });
              }
            }

            return; // Success, exit retry loop

          } catch (error) {
            retryCount++;
            set(() => ({ retryCount }));

            // Enhanced error logging for debugging
            if (process.env.NODE_ENV === 'development') {
              console.warn(`❌ Chat request failed (attempt ${retryCount}/${MAX_RETRIES}):`, error instanceof Error ? error.message : 'Unknown error');
              console.warn('🔍 Error details:', error);
            }

            if (retryCount > MAX_RETRIES) {
              // Final failure - show elegant error message
              const errorMessage = error instanceof Error
                ? error.message
                : 'An unexpected error occurred';

              set(state => ({
                messages: [...state.messages, {
                  id: nanoid(),
                  role: 'error',
                  text: `Unable to get response: ${errorMessage}. Please try again.`,
                  timestamp: Date.now(),
                  metadata: {
                    retryCount: retryCount - 1,
                    totalTime: Date.now() - startTime,
                    errorType: error instanceof Error ? error.name : 'Unknown'
                  }
                }],
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
        if (!auth.currentUser || auth.currentUser.isAnonymous) {
          console.log('User not authenticated or anonymous, skipping Firebase chat history load');
          return;
        }

        try {
          const messages = await loadChatHistoryFromFirebase(50);
          set({ messages });
          console.log('✅ Chat history loaded from Firebase successfully');
        } catch (error) {
          console.warn('Failed to load chat history from Firebase:', error);
          // Don't throw error - continue with local storage only
        }
      },

      initializeSession: () => {
        set({ sessionId: crypto.randomUUID() });
      }
    }),
    {
      name: 'neurastack-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep only last 50 messages
        sessionId: state.sessionId
      }),
    }
  )
);
