/**
 * Circuit Breaker Pattern Implementation
 * Provides resilient API calls with automatic failure detection and recovery
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  expectedErrors?: (error: any) => boolean;
  onStateChange?: (state: CircuitState) => void;
  onFailure?: (error: any) => void;
  onSuccess?: () => void;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  uptime: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private totalRequests: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private nextAttempt: number = 0;
  private config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      expectedErrors: () => false,
      onStateChange: () => {},
      onFailure: () => {},
      onSuccess: () => {},
      ...config
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitBreakerError('Circuit breaker is OPEN', this.getStats());
      }
      // Transition to HALF_OPEN for testing
      this.setState(CircuitState.HALF_OPEN);
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.successes++;
    this.lastSuccessTime = Date.now();
    this.config.onSuccess();

    if (this.state === CircuitState.HALF_OPEN) {
      // Reset circuit breaker on successful recovery
      this.failures = 0;
      this.setState(CircuitState.CLOSED);
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: any): void {
    // Check if this is an expected error that shouldn't trigger circuit breaker
    if (this.config.expectedErrors(error)) {
      return;
    }

    this.failures++;
    this.lastFailureTime = Date.now();
    this.config.onFailure(error);

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during recovery attempt, go back to OPEN
      this.setState(CircuitState.OPEN);
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
    } else if (this.failures >= this.config.failureThreshold) {
      // Threshold exceeded, open the circuit
      this.setState(CircuitState.OPEN);
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
    }
  }

  /**
   * Change circuit breaker state
   */
  private setState(newState: CircuitState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.config.onStateChange(newState);
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      uptime: this.lastSuccessTime ? Date.now() - this.lastSuccessTime : 0
    };
  }

  /**
   * Reset circuit breaker to initial state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.totalRequests = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttempt = 0;
  }

  /**
   * Force circuit breaker to specific state (for testing)
   */
  forceState(state: CircuitState): void {
    this.setState(state);
    if (state === CircuitState.OPEN) {
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
    }
  }

  /**
   * Check if circuit breaker is healthy
   */
  isHealthy(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Get failure rate percentage
   */
  getFailureRate(): number {
    if (this.totalRequests === 0) return 0;
    return (this.failures / this.totalRequests) * 100;
  }
}

/**
 * Custom error class for circuit breaker failures
 */
export class CircuitBreakerError extends Error {
  public readonly stats: CircuitBreakerStats;

  constructor(message: string, stats: CircuitBreakerStats) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.stats = stats;
  }
}

/**
 * Factory function to create circuit breakers with common configurations
 */
export const createCircuitBreaker = {
  /**
   * Circuit breaker for API calls
   */
  forAPI: (config?: Partial<CircuitBreakerConfig>) => new CircuitBreaker({
    failureThreshold: 5,
    recoveryTimeout: 30000, // 30 seconds
    monitoringPeriod: 300000, // 5 minutes
    expectedErrors: (error) => {
      // Don't trigger circuit breaker for client errors (4xx)
      return error?.response?.status >= 400 && error?.response?.status < 500;
    },
    ...config
  }),

  /**
   * Circuit breaker for database operations
   */
  forDatabase: (config?: Partial<CircuitBreakerConfig>) => new CircuitBreaker({
    failureThreshold: 3,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 600000, // 10 minutes
    expectedErrors: (error) => {
      // Don't trigger for validation errors
      return error?.code === 'VALIDATION_ERROR';
    },
    ...config
  }),

  /**
   * Circuit breaker for external services
   */
  forExternalService: (config?: Partial<CircuitBreakerConfig>) => new CircuitBreaker({
    failureThreshold: 10,
    recoveryTimeout: 120000, // 2 minutes
    monitoringPeriod: 900000, // 15 minutes
    expectedErrors: (error) => {
      // Don't trigger for rate limiting
      return error?.response?.status === 429;
    },
    ...config
  })
};

/**
 * Decorator function to add circuit breaker protection to any async function
 */
export function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  circuitBreaker: CircuitBreaker
): T {
  return (async (...args: any[]) => {
    return circuitBreaker.execute(() => fn(...args));
  }) as T;
}

/**
 * Circuit breaker manager for handling multiple circuit breakers
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Register a circuit breaker with a name
   */
  register(name: string, breaker: CircuitBreaker): void {
    this.breakers.set(name, breaker);
  }

  /**
   * Get a circuit breaker by name
   */
  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  /**
   * Execute operation with named circuit breaker
   */
  async execute<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      throw new Error(`Circuit breaker '${name}' not found`);
    }
    return breaker.execute(operation);
  }

  /**
   * Get stats for all circuit breakers
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get health status of all circuit breakers
   */
  getHealthStatus(): Record<string, boolean> {
    const health: Record<string, boolean> = {};
    for (const [name, breaker] of this.breakers) {
      health[name] = breaker.isHealthy();
    }
    return health;
  }
}

// Global circuit breaker manager instance
export const circuitBreakerManager = new CircuitBreakerManager();
