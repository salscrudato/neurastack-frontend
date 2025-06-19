/**
 * Comprehensive Error Handling Utilities
 *
 * Provides centralized error handling, logging, and user-friendly error messages
 * for the NeuraStack application. Implements human-readable naming conventions
 * and type-safe error management.
 */

import type { IErrorContext, IErrorInfo } from '../types/common';

// Re-export types for backward compatibility
export type { IErrorContext as ErrorContext, IErrorInfo as ErrorInfo };

/**
 * Analyze an error and return structured error information
 * Uses human-readable function naming and comprehensive error categorization
 */
export function analyzeApplicationError(error: unknown, context?: IErrorContext): IErrorInfo {
  const currentTimestamp = Date.now();

  // Default error information with human-readable structure
  let errorInformation: IErrorInfo = {
    type: 'unknown',
    severity: 'medium',
    userMessage: 'Something went wrong. Please try again.',
    technicalMessage: 'Unknown error occurred',
    shouldRetry: true,
    retryDelay: 1000
  };

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Network connectivity errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      errorInformation = {
        type: 'network',
        severity: 'medium',
        userMessage: 'Network error. Please check your connection and try again.',
        technicalMessage: error.message,
        shouldRetry: true,
        retryDelay: 2000
      };
    }

    // Firebase authentication and database errors
    else if (errorMessage.includes('firebase') || errorMessage.includes('permission') || errorMessage.includes('insufficient')) {
      errorInformation = {
        type: 'firebase',
        severity: 'low',
        userMessage: 'Data sync temporarily unavailable. Your data is saved locally.',
        technicalMessage: error.message,
        shouldRetry: false
      };
    }
    
    // API service errors
    else if (errorMessage.includes('api') || errorMessage.includes('timeout') || errorMessage.includes('400') || errorMessage.includes('500')) {
      errorInformation = {
        type: 'api',
        severity: 'medium',
        userMessage: 'Service temporarily unavailable. Please try again in a moment.',
        technicalMessage: error.message,
        shouldRetry: true,
        retryDelay: 3000
      };
    }

    // Input validation errors
    else if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('required')) {
      errorInformation = {
        type: 'validation',
        severity: 'low',
        userMessage: 'Please check your input and try again.',
        technicalMessage: error.message,
        shouldRetry: false
      };
    }

    // Ensure technical message is always set
    errorInformation.technicalMessage = error.message;
  }

  // Development-only error logging with enhanced readability
  if (import.meta.env.DEV) {
    console.group(`🚨 Error Analysis [${errorInformation.type}]`);
    console.log('📍 Context:', context);
    console.log('⚠️ Severity:', errorInformation.severity);
    console.log('👤 User Message:', errorInformation.userMessage);
    console.log('🔧 Technical:', errorInformation.technicalMessage);
    console.log('🔄 Should Retry:', errorInformation.shouldRetry);
    console.log('⏱️ Timestamp:', new Date(currentTimestamp).toISOString());
    if (error instanceof Error && error.stack) {
      console.log('📚 Stack:', error.stack);
    }
    console.groupEnd();
  }

  return errorInformation;
}

/**
 * Handle errors gracefully with optional retry logic
 * Implements human-readable function naming and comprehensive error handling
 */
export async function handleAsynchronousOperationWithRetry<T>(
  asyncOperation: () => Promise<T>,
  errorContext?: IErrorContext,
  maximumRetryAttempts: number = 2
): Promise<{ success: boolean; data?: T; error?: IErrorInfo }> {
  let lastEncounteredError: unknown;

  for (let currentAttempt = 0; currentAttempt <= maximumRetryAttempts; currentAttempt++) {
    try {
      const operationResult = await asyncOperation();
      return { success: true, data: operationResult };
    } catch (caughtError) {
      lastEncounteredError = caughtError;
      const analyzedErrorInfo = analyzeApplicationError(caughtError, errorContext);

      // Skip retry if error type shouldn't be retried or max attempts reached
      if (!analyzedErrorInfo.shouldRetry || currentAttempt === maximumRetryAttempts) {
        return { success: false, error: analyzedErrorInfo };
      }

      // Wait before retry attempt
      if (analyzedErrorInfo.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, analyzedErrorInfo.retryDelay));
      }
    }
  }

  // Fallback error handling (should never be reached)
  const fallbackErrorInfo = analyzeApplicationError(lastEncounteredError, errorContext);
  return { success: false, error: fallbackErrorInfo };
}

/**
 * Create a user-friendly error message for toast notifications
 * Uses human-readable naming and comprehensive error categorization
 */
export function createUserFriendlyErrorToast(error: unknown, errorContext?: IErrorContext) {
  const analyzedErrorInfo = analyzeApplicationError(error, errorContext);

  return {
    title: generateErrorTitle(analyzedErrorInfo.type),
    description: analyzedErrorInfo.userMessage,
    status: determineErrorStatus(analyzedErrorInfo.severity),
    duration: calculateErrorDuration(analyzedErrorInfo.severity),
    isClosable: true
  };
}

function generateErrorTitle(errorType: IErrorInfo['type']): string {
  switch (errorType) {
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

function determineErrorStatus(errorSeverity: IErrorInfo['severity']): 'error' | 'warning' | 'info' {
  switch (errorSeverity) {
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

function calculateErrorDuration(errorSeverity: IErrorInfo['severity']): number {
  switch (errorSeverity) {
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
 * Implements comprehensive logging for development debugging
 */
export function handleSilentApplicationError(error: unknown, errorContext?: IErrorContext): void {
  const analyzedErrorInfo = analyzeApplicationError(error, errorContext);

  // Development-only logging for debugging purposes
  if (import.meta.env.DEV) {
    console.warn(`🔇 Silent error [${analyzedErrorInfo.type}]:`, analyzedErrorInfo.technicalMessage);
  }

  // Future enhancement: Send to error tracking service
  // trackErrorToAnalyticsService(analyzedErrorInfo, errorContext);
}
