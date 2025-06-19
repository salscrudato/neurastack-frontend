import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { auth } from '../firebase';
import { neuraStackClient } from '../lib/neurastack-client';
import type { SubAnswer } from '../lib/types';

// Enhanced message interface with comprehensive typing and human-readable structure
export interface IChatMessage {
  messageId: string;
  messageRole: 'user' | 'assistant' | 'error';
  messageText: string;
  messageTimestamp: number;
  messageMetadata?: {
    aiModelsUsed?: string[];
    responseTimeMilliseconds?: number;
    retryAttemptCount?: number;
    totalProcessingTimeMilliseconds?: number;
    errorType?: string;
    // Memory and context-related metadata
    memoryContextInformation?: string;
    tokenCount?: number;
    memoryTokensSaved?: number;
    isEnsembleModeEnabled?: boolean;
    chatSessionId?: string;
    // Individual model responses for detailed view modal
    individualModelResponses?: SubAnswer[];
    modelsUsedInResponse?: Record<string, boolean>;
    modelFallbackReasons?: Record<string, string>;
    executionTimeFormatted?: string;
    [additionalMetadataProperty: string]: unknown;
  };
}

// Backward compatibility - export as Message for existing code
export type Message = IChatMessage;

// Chat store state interface with human-readable naming
interface IChatStoreState {
  chatMessages: IChatMessage[];
  isProcessingMessage: boolean;
  currentRetryAttemptCount: number;
  currentChatSessionId: string;
  sendUserMessage: (messageText: string) => Promise<void>;
  clearAllChatMessages: () => void;
  deleteSpecificMessage: (messageId: string) => void;
  retryFailedMessage: (messageId: string) => Promise<void>;
  initializeNewChatSession: () => void;
}

// Configuration constants with descriptive names
const MAXIMUM_RETRY_ATTEMPTS = 2; // Reduced from 3 for better UX
const RETRY_DELAY_MILLISECONDS = 1500; // Increased to 1.5 seconds for stability

// Utility function for async delays with clear naming
const waitForMilliseconds = (milliseconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

export const useChatStore = create<IChatStoreState>()((set, get) => ({
  chatMessages: [],
  isProcessingMessage: false,
  currentRetryAttemptCount: 0,
  currentChatSessionId: crypto.randomUUID(),

  sendUserMessage: async (messageText: string) => {
    const messageProcessingStartTime = Date.now();

    // Create user message with enhanced typing and descriptive properties
    const userChatMessage: IChatMessage = {
      messageId: nanoid(),
      messageRole: 'user',
      messageText,
      messageTimestamp: Date.now()
    };

    // Update store state with new user message and loading state
    set(currentState => ({
      chatMessages: [...currentState.chatMessages, userChatMessage],
      isProcessingMessage: true,
      currentRetryAttemptCount: 0
    }));

    // Backend handles memory management via session ID - no frontend memory needed

    // Generate unique ID for assistant response
    const assistantMessageId = nanoid();
    let currentRetryAttempt = 0;

    // Retry loop with enhanced error handling and human-readable logic
    while (currentRetryAttempt <= MAXIMUM_RETRY_ATTEMPTS) {
      try {
        const { currentChatSessionId } = get();

        // Configure AI client with comprehensive session information
        neuraStackClient.configure({
          sessionId: currentChatSessionId,
          userId: auth.currentUser?.uid || '',
          useEnsemble: true
        });

        // Execute AI query with enhanced configuration
        const aiResponse = await neuraStackClient.queryAI(messageText, {
          useEnsemble: true,
          temperature: 0.7,
          sessionId: currentChatSessionId // Ensure session context is maintained
        });

        const totalResponseTimeMilliseconds = Date.now() - messageProcessingStartTime;

        // Validate AI response with comprehensive error checking
        if (!aiResponse?.answer) {
          throw new Error('Invalid response received from AI service');
        }

        // Process and clean response text with minimal formatting
        const processedResponseText = String(aiResponse.answer || '').trim();
        if (!processedResponseText) {
          throw new Error('Empty response received from AI service');
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
