import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

/**
 * Enhanced Error Handling and Resilience Service
 * Provides comprehensive error handling, retry logic, and graceful degradation
 */

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  workoutId?: string;
  exerciseId?: string;
  timestamp?: Date;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'authentication' | 'data' | 'ui' | 'performance' | 'unknown';
  resolved: boolean;
  retryCount: number;
  createdAt: Date;
}

export class ErrorHandlingService {
  private errorQueue: ErrorReport[] = [];
  private retryAttempts = new Map<string, number>();
  private circuitBreakers = new Map<string, { failures: number; lastFailure: Date; isOpen: boolean }>();
  
  // Circuit breaker configuration
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
  
  // Retry configuration
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

  /**
   * Handle and categorize errors with automatic retry and circuit breaker logic
   */
  async handleError(error: Error, context: ErrorContext): Promise<{
    shouldRetry: boolean;
    retryDelay?: number;
    fallbackAction?: string;
    userMessage?: string;
  }> {
    const errorReport = this.createErrorReport(error, context);
    
    // Check circuit breaker
    const circuitBreakerKey = `${context.component}_${context.action}`;
    if (this.isCircuitBreakerOpen(circuitBreakerKey)) {
      return {
        shouldRetry: false,
        fallbackAction: 'use_fallback',
        userMessage: 'Service temporarily unavailable. Using offline mode.'
      };
    }
    
    // Determine retry strategy
    const retryKey = `${context.component}_${context.action}_${context.userId}`;
    const currentRetries = this.retryAttempts.get(retryKey) || 0;
    
    if (currentRetries < this.MAX_RETRIES && this.isRetryableError(error)) {
      this.retryAttempts.set(retryKey, currentRetries + 1);
      
      return {
        shouldRetry: true,
        retryDelay: this.RETRY_DELAYS[currentRetries] || 4000,
        userMessage: currentRetries === 0 ? undefined : 'Retrying...'
      };
    }
    
    // Update circuit breaker
    this.updateCircuitBreaker(circuitBreakerKey, true);
    
    // Log error for monitoring
    await this.logError(errorReport);
    
    // Determine fallback strategy
    const fallbackStrategy = this.determineFallbackStrategy(error, context);
    
    return {
      shouldRetry: false,
      fallbackAction: fallbackStrategy.action,
      userMessage: fallbackStrategy.userMessage
    };
  }

  /**
   * Handle successful operations (reset circuit breakers and retry counts)
   */
  handleSuccess(context: ErrorContext): void {
    const circuitBreakerKey = `${context.component}_${context.action}`;
    const retryKey = `${context.component}_${context.action}_${context.userId}`;
    
    // Reset circuit breaker
    this.updateCircuitBreaker(circuitBreakerKey, false);
    
    // Reset retry count
    this.retryAttempts.delete(retryKey);
  }

  /**
   * Create a comprehensive error report
   */
  private createErrorReport(error: Error, context: ErrorContext): ErrorReport {
    const severity = this.determineSeverity(error, context);
    const category = this.categorizeError(error);
    
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      },
      context: {
        ...context,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      severity,
      category,
      resolved: false,
      retryCount: this.retryAttempts.get(`${context.component}_${context.action}_${context.userId}`) || 0,
      createdAt: new Date()
    };
  }

  /**
   * Determine error severity based on error type and context
   */
  private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Critical errors that break core functionality
    if (context.action === 'authentication' || 
        context.action === 'saveWorkoutPlan' ||
        error.message.includes('PERMISSION_DENIED')) {
      return 'critical';
    }
    
    // High severity for workout-related errors
    if (context.component.includes('Workout') || 
        context.action.includes('workout') ||
        error.message.includes('500')) {
      return 'high';
    }
    
    // Medium severity for UI and data errors
    if (context.category === 'ui' || 
        context.category === 'data' ||
        error.message.includes('timeout')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Categorize errors for better handling
   */
  private categorizeError(error: Error): 'network' | 'authentication' | 'data' | 'ui' | 'performance' | 'unknown' {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || 
        message.includes('fetch') || 
        message.includes('timeout') ||
        message.includes('connection')) {
      return 'network';
    }
    
    if (message.includes('auth') || 
        message.includes('permission') || 
        message.includes('unauthorized')) {
      return 'authentication';
    }
    
    if (message.includes('firestore') || 
        message.includes('database') || 
        message.includes('storage')) {
      return 'data';
    }
    
    if (message.includes('render') || 
        message.includes('component') || 
        message.includes('hook')) {
      return 'ui';
    }
    
    if (message.includes('memory') || 
        message.includes('performance') || 
        message.includes('slow')) {
      return 'performance';
    }
    
    return 'unknown';
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      'network error',
      'timeout',
      'service unavailable',
      '503',
      '502',
      '500',
      'temporarily unavailable',
      'rate limit',
      'quota exceeded'
    ];
    
    const message = error.message.toLowerCase();
    return retryablePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Circuit breaker logic
   */
  private isCircuitBreakerOpen(key: string): boolean {
    const breaker = this.circuitBreakers.get(key);
    if (!breaker) return false;
    
    if (breaker.isOpen) {
      const timeSinceLastFailure = Date.now() - breaker.lastFailure.getTime();
      if (timeSinceLastFailure > this.CIRCUIT_BREAKER_TIMEOUT) {
        // Reset circuit breaker
        breaker.isOpen = false;
        breaker.failures = 0;
        return false;
      }
      return true;
    }
    
    return false;
  }

  /**
   * Update circuit breaker state
   */
  private updateCircuitBreaker(key: string, isFailure: boolean): void {
    let breaker = this.circuitBreakers.get(key);
    
    if (!breaker) {
      breaker = { failures: 0, lastFailure: new Date(), isOpen: false };
      this.circuitBreakers.set(key, breaker);
    }
    
    if (isFailure) {
      breaker.failures++;
      breaker.lastFailure = new Date();
      
      if (breaker.failures >= this.CIRCUIT_BREAKER_THRESHOLD) {
        breaker.isOpen = true;
      }
    } else {
      // Success - reset failures
      breaker.failures = 0;
      breaker.isOpen = false;
    }
  }

  /**
   * Determine fallback strategy based on error and context
   */
  private determineFallbackStrategy(error: Error, context: ErrorContext): {
    action: string;
    userMessage: string;
  } {
    // Workout generation fallbacks
    if (context.action === 'generateWorkout') {
      return {
        action: 'use_fallback_workout',
        userMessage: 'AI service unavailable. Generated a basic workout based on your profile.'
      };
    }
    
    // Data persistence fallbacks
    if (context.action.includes('save') || context.action.includes('store')) {
      return {
        action: 'cache_locally',
        userMessage: 'Data saved locally. Will sync when connection is restored.'
      };
    }
    
    // Authentication fallbacks
    if (context.category === 'authentication') {
      return {
        action: 'offline_mode',
        userMessage: 'Authentication unavailable. Some features will be limited.'
      };
    }
    
    // Network fallbacks
    if (context.category === 'network') {
      return {
        action: 'offline_mode',
        userMessage: 'Connection lost. Working in offline mode.'
      };
    }
    
    // Default fallback
    return {
      action: 'graceful_degradation',
      userMessage: 'Some features may be temporarily unavailable.'
    };
  }

  /**
   * Log error to monitoring system
   */
  private async logError(errorReport: ErrorReport): Promise<void> {
    try {
      // Add to local queue first
      this.errorQueue.push(errorReport);
      
      // Try to send to Firestore if user is authenticated
      if (auth.currentUser && errorReport.severity !== 'low') {
        const errorsRef = collection(db, 'error_reports');
        await addDoc(errorsRef, {
          ...errorReport,
          createdAt: serverTimestamp()
        });
      }
      
      // Send to external monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        // Integration with services like Sentry, LogRocket, etc.
        this.sendToMonitoringService(errorReport);
      }
    } catch (loggingError) {
      // Silent fail for logging errors to prevent infinite loops
      console.warn('Failed to log error:', loggingError);
    }
  }

  /**
   * Send error to external monitoring service
   */
  private sendToMonitoringService(errorReport: ErrorReport): void {
    // Placeholder for external monitoring integration
    // In production, this would integrate with services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom monitoring endpoints
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // Send to Google Analytics as an exception
      (window as any).gtag('event', 'exception', {
        description: errorReport.error.message,
        fatal: errorReport.severity === 'critical'
      });
    }
  }

  /**
   * Get error statistics for monitoring dashboard
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    circuitBreakerStatus: Record<string, boolean>;
  } {
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    
    this.errorQueue.forEach(error => {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });
    
    const circuitBreakerStatus: Record<string, boolean> = {};
    this.circuitBreakers.forEach((breaker, key) => {
      circuitBreakerStatus[key] = breaker.isOpen;
    });
    
    return {
      totalErrors: this.errorQueue.length,
      errorsByCategory,
      errorsBySeverity,
      circuitBreakerStatus
    };
  }

  /**
   * Clear error queue (for testing or maintenance)
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
    this.retryAttempts.clear();
  }
}

// Singleton instance
export const errorHandlingService = new ErrorHandlingService();

// Convenience function for handling errors with automatic retry
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      errorHandlingService.handleSuccess(context);
      return result;
    } catch (error) {
      lastError = error as Error;
      
      const errorResponse = await errorHandlingService.handleError(lastError, {
        ...context,
        additionalData: { attempt }
      });
      
      if (!errorResponse.shouldRetry || attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retry
      if (errorResponse.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, errorResponse.retryDelay));
      }
    }
  }
  
  throw lastError!;
}
