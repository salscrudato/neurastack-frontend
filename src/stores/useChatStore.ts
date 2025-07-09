/**
 * Simplified Chat Store
 * 
 * Streamlined Zustand store with clear separation of concerns,
 * improved TypeScript support, and better performance.
 */

import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { APP_CONFIG } from '../config/app';
import { neuraStackClient } from '../lib/neurastack-client';
import type { SubAnswer } from '../lib/types';

// ============================================================================
// Types
// ============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  timestamp: number;
  metadata?: {
    models?: string[];
    responseTime?: number;
    retryCount?: number;
    sessionId?: string;
    individualResponses?: SubAnswer[];
    modelsUsed?: Record<string, boolean>;
    fallbackReasons?: Record<string, string>;
    ensembleData?: any;
    [key: string]: any;
  };
}

export interface ChatState {
  // Core State
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  
  // Performance State
  retryCount: number;
  rateLimitInfo: {
    requestCount: number;
    windowStart: number;
    isLimited: boolean;
  };
  
  // Actions
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  deleteMessage: (id: string) => void;
  retryMessage: (messageId: string) => Promise<void>;
  clearError: () => void;
  
  // Internal Actions
  _addMessage: (message: Message) => void;
  _updateMessage: (id: string, updates: Partial<Message>) => void;
  _checkRateLimit: () => boolean;
  _resetRateLimit: () => void;
}

// ============================================================================
// Utilities
// ============================================================================

const generateSessionId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

const sanitizeInput = (text: string): string => {
  return text.trim().slice(0, APP_CONFIG.PERFORMANCE.MAX_MESSAGE_LENGTH);
};

// const calculateMemoryUsage = (messages: Message[]): number => {
//   return messages.reduce((total, msg) => {
//     return total + JSON.stringify(msg).length * 2; // Rough estimate in bytes
//   }, 0);
// };

// ============================================================================
// Store Implementation
// ============================================================================

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    messages: [],
    isLoading: false,
    error: null,
    sessionId: generateSessionId(),
    retryCount: 0,
    rateLimitInfo: {
      requestCount: 0,
      windowStart: Date.now(),
      isLimited: false,
    },

    // ========================================================================
    // Public Actions
    // ========================================================================

    sendMessage: async (text: string) => {
      const startTime = Date.now();
      const state = get();
      
      // Input validation
      const sanitizedText = sanitizeInput(text);
      if (!sanitizedText) {
        set({ error: 'Please enter a valid message' });
        return;
      }

      // Rate limiting check
      if (!state._checkRateLimit()) {
        set({ error: 'Too many requests. Please wait a moment.' });
        return;
      }

      // Clear previous errors and set loading
      set({ error: null, isLoading: true, retryCount: 0 });

      // Add user message
      const userMessage: Message = {
        id: nanoid(),
        role: 'user',
        text: sanitizedText,
        timestamp: Date.now(),
        metadata: {
          sessionId: state.sessionId,
        },
      };

      state._addMessage(userMessage);

      // Send to API with retry logic
      let retryCount = 0;
      const maxRetries = APP_CONFIG.PERFORMANCE.MAX_RETRIES;

      while (retryCount <= maxRetries) {
        try {
          const response = await neuraStackClient.queryAI(sanitizedText, {
            useEnsemble: true,
            sessionId: state.sessionId,
          });

          // Create assistant message
          const assistantMessage: Message = {
            id: nanoid(),
            role: 'assistant',
            text: response.answer || 'No response received',
            timestamp: Date.now(),
            metadata: {
              ...response.metadata,
              responseTime: Date.now() - startTime,
              retryCount,
              sessionId: state.sessionId,
              individualResponses: response.individualResponses,
              modelsUsed: response.modelsUsed,
              fallbackReasons: response.fallbackReasons,
              ensembleData: response.metadata,
            },
          };

          state._addMessage(assistantMessage);
          set({ isLoading: false, retryCount: 0 });
          return;

        } catch (error) {
          retryCount++;
          
          if (retryCount > maxRetries) {
            // Final failure - add error message
            const errorMessage: Message = {
              id: nanoid(),
              role: 'error',
              text: 'Sorry, I encountered an error processing your request. Please try again.',
              timestamp: Date.now(),
              metadata: {
                sessionId: state.sessionId,
                errorType: error instanceof Error ? error.name : 'Unknown',
                retryCount,
              },
            };

            state._addMessage(errorMessage);
            set({ 
              isLoading: false, 
              error: 'Failed to get response after multiple attempts',
              retryCount 
            });
            return;
          }

          // Wait before retry
          await new Promise(resolve => 
            setTimeout(resolve, APP_CONFIG.PERFORMANCE.RETRY_DELAY_BASE * Math.pow(2, retryCount - 1))
          );
          
          set({ retryCount });
        }
      }
    },

    clearMessages: () => {
      set({
        messages: [],
        error: null,
        sessionId: generateSessionId(),
        retryCount: 0,
      });
    },

    deleteMessage: (id: string) => {
      set(state => ({
        messages: state.messages.filter(msg => msg.id !== id),
      }));
    },

    retryMessage: async (messageId: string) => {
      const state = get();
      const message = state.messages.find(msg => msg.id === messageId);
      
      if (!message || message.role !== 'user') return;
      
      // Remove all messages after the selected message
      const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
      const messagesToKeep = state.messages.slice(0, messageIndex + 1);
      
      set({ messages: messagesToKeep });
      
      // Resend the message
      await state.sendMessage(message.text);
    },

    clearError: () => {
      set({ error: null });
    },

    // ========================================================================
    // Internal Actions
    // ========================================================================

    _addMessage: (message: Message) => {
      set(state => {
        const newMessages = [...state.messages, message];
        
        // Auto-prune if too many messages
        if (newMessages.length > APP_CONFIG.PERFORMANCE.MAX_MESSAGES) {
          return {
            messages: newMessages.slice(-APP_CONFIG.PERFORMANCE.MAX_MESSAGES),
          };
        }
        
        return { messages: newMessages };
      });
    },

    _updateMessage: (id: string, updates: Partial<Message>) => {
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      }));
    },

    _checkRateLimit: () => {
      const state = get();
      const now = Date.now();
      const { requestCount, windowStart } = state.rateLimitInfo;
      
      // Reset window if expired
      if (now - windowStart > APP_CONFIG.PERFORMANCE.RATE_LIMIT_WINDOW) {
        set({
          rateLimitInfo: {
            requestCount: 1,
            windowStart: now,
            isLimited: false,
          },
        });
        return true;
      }
      
      // Check if limit exceeded
      if (requestCount >= APP_CONFIG.PERFORMANCE.RATE_LIMIT_MAX_REQUESTS) {
        set(state => ({
          rateLimitInfo: {
            ...state.rateLimitInfo,
            isLimited: true,
          },
        }));
        return false;
      }
      
      // Increment counter
      set(state => ({
        rateLimitInfo: {
          ...state.rateLimitInfo,
          requestCount: requestCount + 1,
        },
      }));
      
      return true;
    },

    _resetRateLimit: () => {
      set({
        rateLimitInfo: {
          requestCount: 0,
          windowStart: Date.now(),
          isLimited: false,
        },
      });
    },
  }))
);

// ============================================================================
// Selectors (for performance optimization)
// ============================================================================

export const useChatMessages = () => useChatStore(state => state.messages);
export const useChatLoading = () => useChatStore(state => state.isLoading);
export const useChatError = () => useChatStore(state => state.error);

// Individual action selectors to prevent object recreation
export const useChatSendMessage = () => useChatStore(state => state.sendMessage);
export const useChatClearMessages = () => useChatStore(state => state.clearMessages);
export const useChatDeleteMessage = () => useChatStore(state => state.deleteMessage);
export const useChatRetryMessage = () => useChatStore(state => state.retryMessage);
export const useChatClearError = () => useChatStore(state => state.clearError);

// Combined actions selector with proper memoization
export const useChatActions = () => useChatStore(
  state => ({
    sendMessage: state.sendMessage,
    clearMessages: state.clearMessages,
    deleteMessage: state.deleteMessage,
    retryMessage: state.retryMessage,
    clearError: state.clearError,
  })
);
