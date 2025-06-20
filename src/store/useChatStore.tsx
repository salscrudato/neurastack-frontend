import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { auth } from '../firebase';
import { neuraStackClient } from '../lib/neurastack-client';

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
  // Memory management properties
  maxMessages: number;
  memoryUsage: number;
  lastCleanup: number;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  deleteMessage: (id: string) => void;
  retryMessage: (messageId: string) => Promise<void>;
  initializeSession: () => void;
  // Memory management methods
  pruneOldMessages: () => void;
  getMemoryStats: () => { messageCount: number; estimatedSize: number; oldestMessage: number };
  optimizeMemory: () => void;
}

const MAX_RETRIES = 2; // Reduced from 3
const MAX_MESSAGES = 100; // Maximum messages to keep in memory
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MESSAGE_SIZE_ESTIMATE = 1000; // Average bytes per message

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Estimate memory usage of messages
 */
const estimateMessageSize = (message: Message): number => {
  try {
    return JSON.stringify(message).length;
  } catch {
    return MESSAGE_SIZE_ESTIMATE;
  }
};

/**
 * Calculate total memory usage of messages array
 */
const calculateMemoryUsage = (messages: Message[]): number => {
  return messages.reduce((total, message) => total + estimateMessageSize(message), 0);
};

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isLoading: false,
  retryCount: 0,
  sessionId: crypto.randomUUID(),
  maxMessages: MAX_MESSAGES,
  memoryUsage: 0,
  lastCleanup: Date.now(),

      sendMessage: async (text: string) => {
        const startTime = Date.now();

        // Add user message
        const userMsg: Message = {
          id: nanoid(),
          role: 'user',
          text,
          timestamp: Date.now()
        };

        set(state => {
          const newMessages = [...state.messages, userMsg];
          const newMemoryUsage = calculateMemoryUsage(newMessages);

          return {
            messages: newMessages,
            isLoading: true,
            retryCount: 0,
            memoryUsage: newMemoryUsage
          };
        });

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

            // Track analytics for successful chat interaction
            try {
              import('../services/analyticsService').then(({ trackChatInteraction }) => {
                // Extract model names from modelsUsed object
                const modelNames = Object.keys(response.modelsUsed || {});

                trackChatInteraction({
                  messageLength: text.length,
                  responseTime,
                  modelsUsed: modelNames.length > 0 ? modelNames : ['unknown'],
                  sessionId,
                  messageType: 'text'
                });
              });
            } catch (analyticsError) {
              console.warn('Analytics tracking failed:', analyticsError);
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

            set(state => {
              const newMessages = [...state.messages, assistantMsg];
              const newMemoryUsage = calculateMemoryUsage(newMessages);

              // Check if we need to prune messages
              const shouldPrune = newMessages.length > state.maxMessages ||
                                 Date.now() - state.lastCleanup > CLEANUP_INTERVAL;

              if (shouldPrune) {
                const prunedMessages = newMessages.slice(-state.maxMessages);
                return {
                  messages: prunedMessages,
                  isLoading: false,
                  retryCount: 0,
                  memoryUsage: calculateMemoryUsage(prunedMessages),
                  lastCleanup: Date.now()
                };
              }

              return {
                messages: newMessages,
                isLoading: false,
                retryCount: 0,
                memoryUsage: newMemoryUsage
              };
            });

            // Assistant message saved - backend handles memory via sessionId

            return; // Success, exit retry loop

          } catch (error: any) {
            retryCount++;
            set(() => ({ retryCount }));

            // Enhanced error logging with correlation ID per API spec
            if (process.env.NODE_ENV === 'development') {
              console.warn(`❌ Chat request failed (attempt ${retryCount}/${MAX_RETRIES}):`, error instanceof Error ? error.message : 'Unknown error');
              if (error?.correlationId) {
                console.warn(`🔗 Correlation ID: ${error.correlationId}`);
              }
            }

            // Check if this is a retryable error (per API spec: 500+, 429, 408)
            const isRetryable = error?.retryable ||
                               error?.statusCode >= 500 ||
                               error?.statusCode === 429 ||
                               error?.statusCode === 408;

            if (retryCount > MAX_RETRIES || !isRetryable) {
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
                    errorType: error instanceof Error ? error.name : 'Unknown',
                    correlationId: error?.correlationId,
                    statusCode: error?.statusCode
                  }
                }],
                isLoading: false,
                retryCount: 0
              }));
            } else {
              // Exponential backoff for retryable errors
              const delay = Math.pow(2, retryCount - 1) * 1000;
              await sleep(delay);
            }
          }
        }
      },

      clearMessages: () => {
        set({
          messages: [],
          sessionId: crypto.randomUUID(),
          memoryUsage: 0,
          lastCleanup: Date.now()
        }); // New session when clearing
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
      },

      /**
       * Prune old messages to prevent memory bloat
       */
      pruneOldMessages: () => {
        const state = get();
        if (state.messages.length <= state.maxMessages) return;

        // Keep the most recent messages
        const messagesToKeep = state.messages.slice(-state.maxMessages);
        const newMemoryUsage = calculateMemoryUsage(messagesToKeep);

        set({
          messages: messagesToKeep,
          memoryUsage: newMemoryUsage,
          lastCleanup: Date.now()
        });

        if (import.meta.env.DEV) {
          console.log(`🧹 Chat messages pruned: ${state.messages.length} → ${messagesToKeep.length}`);
        }
      },

      /**
       * Get memory usage statistics
       */
      getMemoryStats: () => {
        const state = get();
        const oldestMessage = state.messages.length > 0
          ? Math.min(...state.messages.map(m => m.timestamp))
          : Date.now();

        return {
          messageCount: state.messages.length,
          estimatedSize: state.memoryUsage,
          oldestMessage
        };
      },

      /**
       * Optimize memory usage by removing large metadata and old messages
       */
      optimizeMemory: () => {
        const state = get();

        // Remove large metadata from older messages (keep last 20 messages intact)
        const optimizedMessages = state.messages.map((message, index) => {
          const isRecent = index >= state.messages.length - 20;
          if (isRecent) return message;

          // Strip large metadata from older messages
          const optimizedMessage = { ...message };
          if (optimizedMessage.metadata) {
            const { individualResponses, ...lightMetadata } = optimizedMessage.metadata;
            optimizedMessage.metadata = lightMetadata;
          }
          return optimizedMessage;
        });

        // Prune if still too many messages
        const finalMessages = optimizedMessages.length > state.maxMessages
          ? optimizedMessages.slice(-state.maxMessages)
          : optimizedMessages;

        const newMemoryUsage = calculateMemoryUsage(finalMessages);

        set({
          messages: finalMessages,
          memoryUsage: newMemoryUsage,
          lastCleanup: Date.now()
        });

        if (import.meta.env.DEV) {
          console.log(`🧠 Memory optimized: ${state.memoryUsage} → ${newMemoryUsage} bytes`);
        }
      }
    }));
