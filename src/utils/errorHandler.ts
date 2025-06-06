/**
 * Comprehensive Error Handling Utilities
 * 
 * Provides centralized error handling, logging, and user-friendly error messages
 * for the NeuraStack application.
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface ErrorInfo {
  type: 'network' | 'firebase' | 'api' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage: string;
  shouldRetry: boolean;
  retryDelay?: number;
}

/**
 * Analyze an error and return structured error information
 */
export function analyzeError(error: unknown, context?: ErrorContext): ErrorInfo {
  const timestamp = Date.now();
  
  // Default error info
  let errorInfo: ErrorInfo = {
    type: 'unknown',
    severity: 'medium',
    userMessage: 'Something went wrong. Please try again.',
    technicalMessage: 'Unknown error occurred',
    shouldRetry: true,
    retryDelay: 1000
  };

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      errorInfo = {
        type: 'network',
        severity: 'medium',
        userMessage: 'Network error. Please check your connection and try again.',
        technicalMessage: error.message,
        shouldRetry: true,
        retryDelay: 2000
      };
    }
    
    // Firebase errors
    else if (message.includes('firebase') || message.includes('permission') || message.includes('insufficient')) {
      errorInfo = {
        type: 'firebase',
        severity: 'low',
        userMessage: 'Data sync temporarily unavailable. Your data is saved locally.',
        technicalMessage: error.message,
        shouldRetry: false
      };
    }
    
    // API errors
    else if (message.includes('api') || message.includes('timeout') || message.includes('400') || message.includes('500')) {
      errorInfo = {
        type: 'api',
        severity: 'medium',
        userMessage: 'Service temporarily unavailable. Please try again in a moment.',
        technicalMessage: error.message,
        shouldRetry: true,
        retryDelay: 3000
      };
    }
    
    // Validation errors
    else if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      errorInfo = {
        type: 'validation',
        severity: 'low',
        userMessage: 'Please check your input and try again.',
        technicalMessage: error.message,
        shouldRetry: false
      };
    }
    
    // Update technical message
    errorInfo.technicalMessage = error.message;
  }

  // Log error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.group(`🚨 Error Analysis [${errorInfo.type}]`);
    console.log('📍 Context:', context);
    console.log('⚠️ Severity:', errorInfo.severity);
    console.log('👤 User Message:', errorInfo.userMessage);
    console.log('🔧 Technical:', errorInfo.technicalMessage);
    console.log('🔄 Should Retry:', errorInfo.shouldRetry);
    console.log('⏱️ Timestamp:', new Date(timestamp).toISOString());
    if (error instanceof Error && error.stack) {
      console.log('📚 Stack:', error.stack);
    }
    console.groupEnd();
  }

  return errorInfo;
}

/**
 * Handle errors gracefully with optional retry logic
 */
export async function handleErrorGracefully<T>(
  operation: () => Promise<T>,
  context?: ErrorContext,
  maxRetries: number = 2
): Promise<{ success: boolean; data?: T; error?: ErrorInfo }> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      lastError = error;
      const errorInfo = analyzeError(error, context);
      
      // Don't retry if error type shouldn't be retried
      if (!errorInfo.shouldRetry || attempt === maxRetries) {
        return { success: false, error: errorInfo };
      }
      
      // Wait before retry
      if (errorInfo.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, errorInfo.retryDelay));
      }
    }
  }
  
  // This should never be reached, but just in case
  const errorInfo = analyzeError(lastError, context);
  return { success: false, error: errorInfo };
}

/**
 * Create a user-friendly error message for toasts
 */
export function createErrorToast(error: unknown, context?: ErrorContext) {
  const errorInfo = analyzeError(error, context);
  
  return {
    title: getErrorTitle(errorInfo.type),
    description: errorInfo.userMessage,
    status: getErrorStatus(errorInfo.severity),
    duration: getErrorDuration(errorInfo.severity),
    isClosable: true
  };
}

function getErrorTitle(type: ErrorInfo['type']): string {
  switch (type) {
    case 'network':
      return 'Connection Issue';
    case 'firebase':
      return 'Sync Notice';
    case 'api':
      return 'Service Issue';
    case 'validation':
      return 'Input Error';
    default:
      return 'Error';
  }
}

function getErrorStatus(severity: ErrorInfo['severity']): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'error';
  }
}

function getErrorDuration(severity: ErrorInfo['severity']): number {
  switch (severity) {
    case 'critical':
      return 8000;
    case 'high':
      return 6000;
    case 'medium':
      return 4000;
    case 'low':
      return 3000;
    default:
      return 4000;
  }
}

/**
 * Silently handle errors that shouldn't be shown to users
 */
export function handleSilentError(error: unknown, context?: ErrorContext): void {
  const errorInfo = analyzeError(error, context);
  
  // Only log in development
  if (import.meta.env.DEV) {
    console.warn(`🔇 Silent error [${errorInfo.type}]:`, errorInfo.technicalMessage);
  }
  
  // Could send to error tracking service here
  // trackError(errorInfo, context);
}
