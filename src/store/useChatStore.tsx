import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { neuraStackClient } from '../lib/neurastack-client';
import { auth } from '../firebase';

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
  initializeSession: () => void;
}

const MAX_RETRIES = 2; // Reduced from 3
const RETRY_DELAY = 1500; // Increased to 1.5 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useChatStore = create<ChatState>()((set, get) => ({
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

        // User message saved - backend handles memory via sessionId

        // Set loading state - no placeholder message needed
        const assistantId = nanoid();

        let retryCount = 0;

        while (retryCount <= MAX_RETRIES) {
          try {
            const { sessionId } = get();

            // Configure the enhanced API client with session info
            neuraStackClient.configure({
              sessionId,
              userId: auth.currentUser?.uid || '',
              useEnsemble: true
            });

            // Use the enhanced default-ensemble API with production features
            const response = await neuraStackClient.queryAI(text, {
              useEnsemble: true,
              temperature: 0.7,
              sessionId // Ensure session context is passed
            });

            const responseTime = Date.now() - startTime;

            // Validate response
            if (!response?.answer) {
              throw new Error('Invalid response received');
            }

            // Clean response text - basic formatting only
            const cleanedAnswer = String(response.answer || '').trim();
            if (!cleanedAnswer) {
              throw new Error('Empty response received');
            }

            // Log the processed response for debugging
            console.group('🎯 Chat Store Processing');
            console.log('📝 Original Answer Length:', response.answer?.length || 0);
            console.log('✂️ Cleaned Answer Length:', cleanedAnswer.length);
            console.log('🔍 Answer Preview:', cleanedAnswer.substring(0, 200) + (cleanedAnswer.length > 200 ? '...' : ''));
            console.log('📊 Metadata:', {
              ensembleMode: response.ensembleMode,
              modelsUsed: response.modelsUsed,
              executionTime: response.executionTime,
              tokenCount: response.tokenCount
            });
            console.groupEnd();

            const assistantMsg = {
              id: assistantId,
              role: 'assistant' as const,
              text: cleanedAnswer,
              timestamp: Date.now(),
              metadata: {
                models: response.modelsUsed ? Object.keys(response.modelsUsed) : [],
                responseTime,
                retryCount,
                executionTime: response.executionTime,
                ensembleMode: response.ensembleMode,
                // Memory-related metadata
                memoryContext: response.memoryContext,
                tokenCount: response.tokenCount,
                memoryTokensSaved: response.memoryTokensSaved,
                sessionId,
                // Raw API response data only
                modelsUsed: response.modelsUsed,
                fallbackReasons: response.fallbackReasons,
                // Individual model responses for modal display
                individualResponses: response.individualResponses
              }
            };

            set(state => ({
              messages: [...state.messages, assistantMsg],
              isLoading: false,
              retryCount: 0
            }));

            // Assistant message saved - backend handles memory via sessionId

            return; // Success, exit retry loop

          } catch (error) {
            retryCount++;
            set(() => ({ retryCount }));

            // Simple error logging
            if (process.env.NODE_ENV === 'development') {
              console.warn(`❌ Chat request failed (attempt ${retryCount}/${MAX_RETRIES}):`, error instanceof Error ? error.message : 'Unknown error');
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
              // Simple retry delay
              await sleep(RETRY_DELAY);
            }
          }
        }
      },

      clearMessages: () => {
        set({ messages: [], sessionId: crypto.randomUUID() }); // New session when clearing
      },

      deleteMessage: (id: string) => {
        set(state => ({
          messages: state.messages.filter(m => m.id !== id)
        }));
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

      initializeSession: () => {
        set({ sessionId: crypto.randomUUID() });
      }
    }));
