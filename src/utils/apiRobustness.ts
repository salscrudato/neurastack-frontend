/**
 * Enhanced API Robustness and Error Handling System
 * 
 * Provides comprehensive error handling, circuit breaker patterns, 
 * retry logic, and fallback mechanisms for production-grade reliability
 */


// ============================================================================
// Circuit Breaker Pattern Implementation
// ============================================================================

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  successCount: number;
}

class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'CLOSED',
    successCount: 0,
  };

  private failureThreshold: number;
  private recoveryTimeout: number;
  private successThreshold: number;

  constructor(
    failureThreshold: number = 5,
    recoveryTimeout: number = 60000, // 1 minute
    successThreshold: number = 3
  ) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
    this.successThreshold = successThreshold;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() - this.state.lastFailureTime > this.recoveryTimeout) {
        this.state.state = 'HALF_OPEN';
        this.state.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state.state === 'HALF_OPEN') {
      this.state.successCount++;
      if (this.state.successCount >= this.successThreshold) {
        this.state.state = 'CLOSED';
        this.state.failures = 0;
      }
    } else {
      this.state.failures = 0;
    }
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failures >= this.failureThreshold) {
      this.state.state = 'OPEN';
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED',
      successCount: 0,
    };
  }
}

// ============================================================================
// Enhanced Retry Logic with Exponential Backoff
// ============================================================================

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: (error: any) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: (error) => {
    if (error?.statusCode) {
      return error.statusCode >= 500 || error.statusCode === 429 || error.statusCode === 408;
    }
    const message = error?.message?.toLowerCase() || '';
    return message.includes('timeout') || 
           message.includes('network') || 
           message.includes('temporarily unavailable');
  }
};

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt or error is not retryable
      if (attempt === finalConfig.maxRetries || !finalConfig.retryableErrors(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
        finalConfig.maxDelay
      );

      // Add jitter to prevent thundering herd
      if (finalConfig.jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      console.log(`Retrying operation (attempt ${attempt + 1}/${finalConfig.maxRetries}) after ${delay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ============================================================================
// Service Health Monitoring
// ============================================================================

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: number;
  responseTime: number;
  errorRate: number;
  consecutiveFailures: number;
}

class ServiceHealthMonitor {
  private health: Map<string, ServiceHealth> = new Map();
  private checkInterval: number = 120000; // 2 minutes
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  startMonitoring(serviceName: string, healthCheckFn: () => Promise<boolean>): void {
    // Initialize health state
    this.health.set(serviceName, {
      status: 'healthy',
      lastCheck: Date.now(),
      responseTime: 0,
      errorRate: 0,
      consecutiveFailures: 0,
    });

    // Start periodic health checks
    const interval = setInterval(async () => {
      await this.checkHealth(serviceName, healthCheckFn);
    }, this.checkInterval);

    this.intervals.set(serviceName, interval);
  }

  stopMonitoring(serviceName: string): void {
    const interval = this.intervals.get(serviceName);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(serviceName);
    }
    this.health.delete(serviceName);
  }

  private async checkHealth(serviceName: string, healthCheckFn: () => Promise<boolean>): Promise<void> {
    const startTime = Date.now();
    const currentHealth = this.health.get(serviceName);
    
    if (!currentHealth) return;

    try {
      const isHealthy = await healthCheckFn();
      const responseTime = Date.now() - startTime;

      if (isHealthy) {
        this.health.set(serviceName, {
          ...currentHealth,
          status: 'healthy',
          lastCheck: Date.now(),
          responseTime,
          consecutiveFailures: 0,
        });
      } else {
        this.updateUnhealthyState(serviceName, currentHealth, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateUnhealthyState(serviceName, currentHealth, responseTime);
    }
  }

  private updateUnhealthyState(serviceName: string, currentHealth: ServiceHealth, responseTime: number): void {
    const consecutiveFailures = currentHealth.consecutiveFailures + 1;
    const status = consecutiveFailures >= 3 ? 'unhealthy' : 'degraded';

    this.health.set(serviceName, {
      ...currentHealth,
      status,
      lastCheck: Date.now(),
      responseTime,
      consecutiveFailures,
    });
  }

  getHealth(serviceName: string): ServiceHealth | null {
    return this.health.get(serviceName) || null;
  }

  isHealthy(serviceName: string): boolean {
    const health = this.health.get(serviceName);
    return health?.status === 'healthy' || false;
  }

  isDegraded(serviceName: string): boolean {
    const health = this.health.get(serviceName);
    return health?.status === 'degraded' || false;
  }

  isUnhealthy(serviceName: string): boolean {
    const health = this.health.get(serviceName);
    return health?.status === 'unhealthy' || false;
  }
}

// ============================================================================
// Global Instances and Exports
// ============================================================================

// Global circuit breaker for workout API
export const workoutApiCircuitBreaker = new CircuitBreaker(5, 60000, 3);

// Global service health monitor
export const serviceHealthMonitor = new ServiceHealthMonitor();

// Enhanced API call wrapper with all robustness features
export async function robustApiCall<T>(
  operation: () => Promise<T>,
  options: {
    retryConfig?: Partial<RetryConfig>;
    useCircuitBreaker?: boolean;
  } = {}
): Promise<T> {
  const {
    retryConfig = {},
    useCircuitBreaker = true,
  } = options;

  const wrappedOperation = async () => {
    return retryWithBackoff(operation, retryConfig);
  };

  if (useCircuitBreaker) {
    return workoutApiCircuitBreaker.execute(wrappedOperation);
  } else {
    return wrappedOperation();
  }
}

export {
    CircuitBreaker, DEFAULT_RETRY_CONFIG, ServiceHealthMonitor,
    type RetryConfig,
    type ServiceHealth
};

