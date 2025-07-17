import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { auth } from '../firebase';
import { neuraStackClient } from '../lib/neurastack-client';

// Production-ready constants
const PERFORMANCE_CONFIG = {
  MAX_MESSAGES: 100,
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000,
  MEMORY_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MESSAGE_BATCH_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  MAX_MESSAGE_LENGTH: 10000,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 30,
} as const;

// Safe UUID generation helper
const generateSafeUUID = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
  }
};



/**
 * Represents a chat message with comprehensive metadata
 * @interface Message
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** Role of the message sender */
  role: 'user' | 'assistant' | 'error';
  /** The message content */
  text: string;
  /** Timestamp when the message was created */
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

/**
 * Production-ready chat state interface with comprehensive features
 * @interface ChatState
 */
interface ChatState {
  /** Array of chat messages */
  messages: Message[];
  /** Loading state for UI feedback */
  isLoading: boolean;
  /** Current retry count for failed requests */
  retryCount: number;
  /** Unique session identifier for backend correlation */
  sessionId: string;

  // Memory management properties
  /** Maximum number of messages to keep in memory */
  maxMessages: number;
  /** Current memory usage in bytes (estimated) */
  memoryUsage: number;
  /** Timestamp of last memory cleanup */
  lastCleanup: number;

  // Production-ready state
  /** Current error message, if any */
  error: string | null;
  /** Online/offline status */
  isOnline: boolean;
  rateLimitInfo: {
    requestCount: number;
    windowStart: number;
    isLimited: boolean;
  };
  guestRateLimit: {
    lastRequestTime: number;
    isLimited: boolean;
  };
  rateLimitModal: {
    isOpen: boolean;
    timeRemaining: number;
  };
  // Performance metrics
  performanceMetrics: {
    averageResponseTime: number;
    totalRequests: number;
    failureRate: number;
  };
  // Core Methods
  /** Send a message to the AI with production-ready validation and error handling */
  sendMessage: (text: string) => Promise<void>;
  /** Clear all messages and start a new session */
  clearMessages: () => void;
  /** Delete a specific message by ID */
  deleteMessage: (id: string) => void;
  /** Retry a failed message */
  retryMessage: (messageId: string) => Promise<void>;
  /** Initialize a new chat session */
  initializeSession: () => void;
  // Memory management methods
  pruneOldMessages: () => void;
  getMemoryStats: () => { messageCount: number; estimatedSize: number; oldestMessage: number };
  optimizeMemory: () => void;
  // Production methods
  clearError: () => void;
  updateOnlineStatus: (isOnline: boolean) => void;
  checkRateLimit: () => boolean;
  checkGuestRateLimit: () => { allowed: boolean; timeUntilNext: number };
  showRateLimitModal: (timeRemaining: number) => void;
  closeRateLimitModal: () => void;
  updatePerformanceMetrics: (responseTime: number, success: boolean) => void;
}

// Use centralized performance config
const MESSAGE_SIZE_ESTIMATE = 1000; // Average bytes per message

// Production-ready utility functions
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sanitize user input to prevent XSS and other security issues
 */
const sanitizeInput = (input: string): string => {
  // Debug logging to check input
  if (import.meta.env.DEV) {
    console.log('🔍 sanitizeInput called with:', { input, type: typeof input });
  }

  if (!input || typeof input !== 'string') {
    if (import.meta.env.DEV) {
      console.warn('⚠️ sanitizeInput: Invalid input type or empty input');
    }
    return '';
  }

  const result = input
    .trim()
    .slice(0, PERFORMANCE_CONFIG.MAX_MESSAGE_LENGTH)
    .replace(/[<>]/g, '') // Basic XSS prevention
    .replace(/javascript:/gi, '') // Prevent javascript: URLs
    .replace(/data:/gi, ''); // Prevent data: URLs

  if (import.meta.env.DEV) {
    console.log('🧹 sanitizeInput result:', { result, type: typeof result });
  }

  return result;
};

/**
 * Calculate exponential backoff delay
 */
const calculateBackoffDelay = (attempt: number): number => {
  return Math.min(
    PERFORMANCE_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt),
    10000 // Max 10 seconds
  );
};

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
  sessionId: generateSafeUUID(),
  maxMessages: PERFORMANCE_CONFIG.MAX_MESSAGES,
  memoryUsage: 0,
  lastCleanup: Date.now(),
  // Production-ready state
  error: null,
  isOnline: navigator.onLine,
  rateLimitInfo: {
    requestCount: 0,
    windowStart: Date.now(),
    isLimited: false,
  },
  guestRateLimit: {
    lastRequestTime: 0,
    isLimited: false,
  },
  rateLimitModal: {
    isOpen: false,
    timeRemaining: 0,
  },
  performanceMetrics: {
    averageResponseTime: 0,
    totalRequests: 0,
    failureRate: 0,
  },

      sendMessage: async (text: string) => {
        const startTime = Date.now();

        // Debug logging to check what's being passed
        if (import.meta.env.DEV) {
          console.log('🔍 sendMessage called with:', { text, type: typeof text });
        }

        // Production-ready input validation and sanitization
        const sanitizedText = sanitizeInput(text);
        if (!sanitizedText) {
          set({ error: 'Please enter a valid message' });
          return;
        }

        // Debug logging after sanitization
        if (import.meta.env.DEV) {
          console.log('🧹 After sanitization:', { sanitizedText, type: typeof sanitizedText });
        }

        // Rate limiting check
        if (!get().checkRateLimit()) {
          set({ error: 'Too many requests. Please wait a moment before sending another message.' });
          return;
        }



        // Guest user rate limiting check (1 request per minute)
        const guestRateCheck = get().checkGuestRateLimit();
        if (!guestRateCheck.allowed) {
          get().showRateLimitModal(guestRateCheck.timeUntilNext);
          return;
        }

        // Clear any previous errors
        set({ error: null });

        // Add user message with enhanced metadata
        const userMsg: Message = {
          id: nanoid(),
          role: 'user',
          text: sanitizedText,
          timestamp: Date.now(),
          metadata: {
            sessionId: get().sessionId,
            sanitized: text !== sanitizedText,
          }
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

        while (retryCount <= PERFORMANCE_CONFIG.MAX_RETRIES) {
          try {
            const { sessionId } = get();

            // Configure the enhanced API client with session info
            neuraStackClient.configure({
              sessionId,
              userId: auth.currentUser?.uid || '',
              useEnsemble: true
            });

            // Use the enhanced default-ensemble API with production features
            const response = await neuraStackClient.queryAI(sanitizedText, {
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

            // Update performance metrics
            get().updatePerformanceMetrics(responseTime, true);

            // Simplified logging for MVP
            if (import.meta.env.DEV) {
              console.log(`Chat response time: ${responseTime}ms`);
            }

            // Production logging (minimal in production)
            if (import.meta.env.DEV) {
              console.log('Chat interaction completed:', {
                messageLength: sanitizedText.length,
                responseTime: `${responseTime}ms`,
                modelsUsed: Object.keys(response.modelsUsed || {}).length,
                retryCount
              });
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
                individualResponses: response.individualResponses,
                // Full ensemble metadata for confidence display (includes synthesis, voting, roles)
                metadata: response.metadata,
                // Ensemble data for EnsembleInfoModal (raw API response)
                ensembleData: response.rawApiResponse
              }
            };

            set(state => {
              const newMessages = [...state.messages, assistantMsg];
              const newMemoryUsage = calculateMemoryUsage(newMessages);

              // Check if we need to prune messages
              const shouldPrune = newMessages.length > state.maxMessages ||
                                 Date.now() - state.lastCleanup > PERFORMANCE_CONFIG.MEMORY_CLEANUP_INTERVAL;

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

            // Update performance metrics for failure
            get().updatePerformanceMetrics(Date.now() - startTime, false);

            // Simplified error logging for MVP
            if (import.meta.env.DEV) {
              console.error('Chat request failed:', error);
            }

            // Enhanced error logging with correlation ID per API spec
            if (import.meta.env.DEV) {
              console.warn(`❌ Chat request failed (attempt ${retryCount}/${PERFORMANCE_CONFIG.MAX_RETRIES}):`, error instanceof Error ? error.message : 'Unknown error');
              if (error?.correlationId) {
                console.warn(`🔗 Correlation ID: ${error.correlationId}`);
              }
            }

            // Check if this is a retryable error (per API spec: 500+, 429, 408)
            const isRetryable = error?.retryable ||
                               error?.statusCode >= 500 ||
                               error?.statusCode === 429 ||
                               error?.statusCode === 408;

            if (retryCount > PERFORMANCE_CONFIG.MAX_RETRIES || !isRetryable) {
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
              // Enhanced exponential backoff with jitter
              const delay = calculateBackoffDelay(retryCount - 1);
              const jitter = Math.random() * 0.1 * delay; // Add up to 10% jitter
              await sleep(delay + jitter);
            }
          }
        }
      },

      clearMessages: () => {
        set({
          messages: [],
          sessionId: generateSafeUUID(),
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
        set({ sessionId: generateSafeUUID() });
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
            const { individualResponses: _individualResponses, ...lightMetadata } = optimizedMessage.metadata;
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
      },

      // Production-ready methods
      clearError: () => set({ error: null }),

      updateOnlineStatus: (isOnline: boolean) => set({ isOnline }),

      checkRateLimit: () => {
        const state = get();
        const now = Date.now();

        // Reset window if expired
        if (now - state.rateLimitInfo.windowStart > PERFORMANCE_CONFIG.RATE_LIMIT_WINDOW) {
          set({
            rateLimitInfo: {
              requestCount: 1,
              windowStart: now,
              isLimited: false,
            }
          });
          return true;
        }

        // Check if limit exceeded
        if (state.rateLimitInfo.requestCount >= PERFORMANCE_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
          set({
            rateLimitInfo: {
              ...state.rateLimitInfo,
              isLimited: true,
            }
          });
          return false;
        }

        // Increment counter
        set({
          rateLimitInfo: {
            ...state.rateLimitInfo,
            requestCount: state.rateLimitInfo.requestCount + 1,
          }
        });
        return true;
      },

      checkGuestRateLimit: () => {
        const state = get();
        const now = Date.now();
        const GUEST_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

        // Check if user is a guest (anonymous)
        const user = auth.currentUser;
        if (!user || !user.isAnonymous) {
          // Not a guest user, no additional restrictions
          return { allowed: true, timeUntilNext: 0 };
        }

        // Check if enough time has passed since last request
        const timeSinceLastRequest = now - state.guestRateLimit.lastRequestTime;

        if (timeSinceLastRequest < GUEST_RATE_LIMIT_WINDOW) {
          // Still within rate limit window
          const timeUntilNext = GUEST_RATE_LIMIT_WINDOW - timeSinceLastRequest;
          set({
            guestRateLimit: {
              ...state.guestRateLimit,
              isLimited: true,
            }
          });
          return { allowed: false, timeUntilNext };
        }

        // Rate limit window has passed, allow request
        set({
          guestRateLimit: {
            lastRequestTime: now,
            isLimited: false,
          }
        });
        return { allowed: true, timeUntilNext: 0 };
      },

      showRateLimitModal: (timeRemaining: number) => {
        set({
          rateLimitModal: {
            isOpen: true,
            timeRemaining,
          }
        });
      },

      closeRateLimitModal: () => {
        set({
          rateLimitModal: {
            isOpen: false,
            timeRemaining: 0,
          }
        });
      },

      updatePerformanceMetrics: (responseTime: number, success: boolean) => {
        const state = get();
        const totalRequests = state.performanceMetrics.totalRequests + 1;
        const failures = success ? 0 : 1;
        const totalFailures = (state.performanceMetrics.failureRate * state.performanceMetrics.totalRequests) + failures;

        set({
          performanceMetrics: {
            averageResponseTime: success
              ? (state.performanceMetrics.averageResponseTime * state.performanceMetrics.totalRequests + responseTime) / totalRequests
              : state.performanceMetrics.averageResponseTime,
            totalRequests,
            failureRate: totalFailures / totalRequests,
          }
        });
      }
    }));

// Production-ready event listeners for online/offline status
if (typeof window !== 'undefined') {
  const updateOnlineStatus = () => {
    useChatStore.getState().updateOnlineStatus(navigator.onLine);
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Cleanup function for SSR compatibility
  if (typeof window.addEventListener === 'function') {
    const cleanup = () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };

    // Store cleanup function for potential use
    (window as any).__chatStoreCleanup = cleanup;
  }
}
