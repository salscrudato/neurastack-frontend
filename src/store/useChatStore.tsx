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
          const analyticsModule = await import('../services/analyticsService');
          const modelNames = Object.keys(aiResponse.modelsUsed || {});

          analyticsModule.trackChatInteraction({
            messageLength: messageText.length,
            responseTime: totalResponseTimeMilliseconds,
            modelsUsed: modelNames.length > 0 ? modelNames : ['unknown'],
            sessionId: currentChatSessionId,
            messageType: 'text'
          });
        } catch (analyticsError) {
          console.warn('Analytics tracking failed:', analyticsError);
        }

        // Development logging with enhanced readability
        if (import.meta.env.DEV) {
          console.group('🎯 Chat Store Processing');
          console.log('📝 Original Answer Length:', aiResponse.answer?.length || 0);
          console.log('✂️ Processed Answer Length:', processedResponseText.length);
          console.log('🔍 Answer Preview:', processedResponseText.substring(0, 200) + (processedResponseText.length > 200 ? '...' : ''));
          console.log('📊 Metadata:', {
            ensembleMode: aiResponse.ensembleMode,
            modelsUsed: aiResponse.modelsUsed,
            executionTime: aiResponse.executionTime,
            tokenCount: aiResponse.tokenCount
          });
          console.groupEnd();
        }

        // Create assistant message with enhanced metadata structure
        const assistantChatMessage: IChatMessage = {
          messageId: assistantMessageId,
          messageRole: 'assistant',
          messageText: processedResponseText,
          messageTimestamp: Date.now(),
          messageMetadata: {
            aiModelsUsed: aiResponse.modelsUsed ? Object.keys(aiResponse.modelsUsed) : [],
            responseTimeMilliseconds: totalResponseTimeMilliseconds,
            retryAttemptCount: currentRetryAttempt,
            executionTimeFormatted: aiResponse.executionTime,
            isEnsembleModeEnabled: aiResponse.ensembleMode,
            // Memory and context information
            memoryContextInformation: aiResponse.memoryContext,
            tokenCount: aiResponse.tokenCount,
            memoryTokensSaved: aiResponse.memoryTokensSaved,
            chatSessionId: currentChatSessionId,
            // Raw API response data for detailed view
            modelsUsedInResponse: aiResponse.modelsUsed,
            modelFallbackReasons: aiResponse.fallbackReasons,
            // Individual model responses for modal display
            individualModelResponses: aiResponse.individualResponses
          }
        };

        // Update store with successful response
        set(currentState => ({
          chatMessages: [...currentState.chatMessages, assistantChatMessage],
          isProcessingMessage: false,
          currentRetryAttemptCount: 0
        }));

        return; // Success - exit retry loop

      } catch (caughtError) {
        currentRetryAttempt++;
        set(() => ({ currentRetryAttemptCount: currentRetryAttempt }));

        // Development-only error logging with enhanced readability
        if (import.meta.env.DEV) {
          console.warn(`❌ Chat request failed (attempt ${currentRetryAttempt}/${MAXIMUM_RETRY_ATTEMPTS}):`,
            caughtError instanceof Error ? caughtError.message : 'Unknown error');
        }

        if (currentRetryAttempt > MAXIMUM_RETRY_ATTEMPTS) {
          // Final failure - create user-friendly error message
          const userFriendlyErrorMessage = caughtError instanceof Error
            ? caughtError.message
            : 'An unexpected error occurred';

          const errorChatMessage: IChatMessage = {
            messageId: nanoid(),
            messageRole: 'error',
            messageText: `Unable to get response: ${userFriendlyErrorMessage}. Please try again.`,
            messageTimestamp: Date.now(),
            messageMetadata: {
              retryAttemptCount: currentRetryAttempt - 1,
              totalProcessingTimeMilliseconds: Date.now() - messageProcessingStartTime,
              errorType: caughtError instanceof Error ? caughtError.name : 'Unknown'
            }
          };

          set(currentState => ({
            chatMessages: [...currentState.chatMessages, errorChatMessage],
            isProcessingMessage: false,
            currentRetryAttemptCount: 0
          }));
        } else {
          // Wait before retry attempt
          await waitForMilliseconds(RETRY_DELAY_MILLISECONDS);
        }
      }
    }
  },
      },

  clearAllChatMessages: () => {
    set({
      chatMessages: [],
      currentChatSessionId: crypto.randomUUID() // Create new session when clearing
    });
  },

  deleteSpecificMessage: (messageId: string) => {
    set(currentState => ({
      chatMessages: currentState.chatMessages.filter(message => message.messageId !== messageId)
    }));
  },

  retryFailedMessage: async (messageId: string) => {
    const currentState = get();
    const messageIndex = currentState.chatMessages.findIndex(message => message.messageId === messageId);

    if (messageIndex === -1) return;

    // Find the user message that preceded this error/assistant message
    let precedingUserMessage: IChatMessage | null = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (currentState.chatMessages[i].messageRole === 'user') {
        precedingUserMessage = currentState.chatMessages[i];
        break;
      }
    }

    if (!precedingUserMessage) return;

    // Remove the failed message and retry with original user input
    set(currentState => ({
      chatMessages: currentState.chatMessages.filter(message => message.messageId !== messageId)
    }));

    await get().sendUserMessage(precedingUserMessage.messageText);
  },

  initializeNewChatSession: () => {
    set({ currentChatSessionId: crypto.randomUUID() });
  }
}));
