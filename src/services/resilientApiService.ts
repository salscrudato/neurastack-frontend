import { 
  CircuitBreaker, 
  CircuitBreakerError, 
  CircuitState, 
  createCircuitBreaker,
  circuitBreakerManager 
} from '../utils/circuitBreaker';

/**
 * Enhanced API service with circuit breaker protection, retry logic, and fallback mechanisms
 */

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCircuitBreaker: boolean;
  enableFallback: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  fromCache?: boolean;
  fromFallback?: boolean;
}

export interface RetryConfig {
  attempts: number;
  delay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

export class ResilientApiService {
  private config: ApiConfig;
  private circuitBreaker: CircuitBreaker;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private fallbackData: Map<string, any> = new Map();

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: process.env.VITE_API_URL || 'http://localhost:8080',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCircuitBreaker: true,
      enableFallback: true,
      ...config
    };

    // Initialize circuit breaker
    this.circuitBreaker = createCircuitBreaker.forAPI({
      onStateChange: (state) => {
        console.log(`API Circuit Breaker state changed to: ${state}`);
        this.handleCircuitBreakerStateChange(state);
      },
      onFailure: (error) => {
        console.warn('API Circuit Breaker failure:', error.message);
      }
    });

    // Register with global manager
    circuitBreakerManager.register('api', this.circuitBreaker);
  }

  /**
   * Make a resilient API request with circuit breaker protection
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options);

    // Try to get from cache first
    const cachedResponse = this.getFromCache<T>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const requestOptions: RequestInit = {
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      let response: ApiResponse<T>;

      if (this.config.enableCircuitBreaker) {
        // Execute with circuit breaker protection
        response = await this.circuitBreaker.execute(() => 
          this.executeRequest<T>(url, requestOptions, retryConfig)
        );
      } else {
        // Execute without circuit breaker
        response = await this.executeRequest<T>(url, requestOptions, retryConfig);
      }

      // Cache successful responses
      this.cacheResponse(cacheKey, response, 300000); // 5 minutes TTL
      
      return response;

    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);

      // Try fallback if circuit breaker is open or request failed
      if (this.config.enableFallback) {
        const fallbackResponse = this.getFallbackResponse<T>(cacheKey, endpoint);
        if (fallbackResponse) {
          return fallbackResponse;
        }
      }

      throw error;
    }
  }

  /**
   * Execute the actual HTTP request with retry logic
   */
  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    const retry: RetryConfig = {
      attempts: this.config.retryAttempts,
      delay: this.config.retryDelay,
      backoffMultiplier: 2,
      maxDelay: 10000,
      ...retryConfig
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= retry.attempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: this.parseHeaders(response.headers)
        };

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) or if it's the last attempt
        if (this.isClientError(error) || attempt === retry.attempts) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retry.delay * Math.pow(retry.backoffMultiplier, attempt - 1),
          retry.maxDelay
        );

        console.warn(`API request attempt ${attempt} failed, retrying in ${delay}ms:`, error);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Handle circuit breaker state changes
   */
  private handleCircuitBreakerStateChange(state: CircuitState): void {
    switch (state) {
      case CircuitState.OPEN:
        console.warn('API Circuit Breaker OPEN - API calls will be blocked');
        // Could trigger UI notification here
        break;
      case CircuitState.HALF_OPEN:
        console.info('API Circuit Breaker HALF_OPEN - Testing API recovery');
        break;
      case CircuitState.CLOSED:
        console.info('API Circuit Breaker CLOSED - API calls restored');
        break;
    }
  }

  /**
   * Get response from cache
   */
  private getFromCache<T>(cacheKey: string): ApiResponse<T> | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return {
        ...cached.data,
        fromCache: true
      };
    }
    
    // Remove expired cache entry
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Cache API response
   */
  private cacheResponse<T>(cacheKey: string, response: ApiResponse<T>, ttl: number): void {
    this.cache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get fallback response when API is unavailable
   */
  private getFallbackResponse<T>(cacheKey: string, endpoint: string): ApiResponse<T> | null {
    // Try to get from fallback data
    const fallbackData = this.fallbackData.get(endpoint);
    if (fallbackData) {
      return {
        data: fallbackData,
        status: 200,
        statusText: 'OK',
        headers: {},
        fromFallback: true
      };
    }

    // Try to get expired cache data as last resort
    const expiredCache = this.cache.get(cacheKey);
    if (expiredCache) {
      console.warn('Using expired cache data as fallback');
      return {
        ...expiredCache.data,
        fromCache: true,
        fromFallback: true
      };
    }

    return null;
  }

  /**
   * Set fallback data for specific endpoints
   */
  setFallbackData(endpoint: string, data: any): void {
    this.fallbackData.set(endpoint, data);
  }

  /**
   * Generate cache key from URL and options
   */
  private getCacheKey(url: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Parse response headers into object
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Check if error is a client error (4xx)
   */
  private isClientError(error: any): boolean {
    return error?.message?.includes('HTTP 4') || 
           (error?.response?.status >= 400 && error?.response?.status < 500);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker statistics
   */
  getCircuitBreakerStats() {
    return this.circuitBreaker.getStats();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  /**
   * Check if API is healthy
   */
  isHealthy(): boolean {
    return this.circuitBreaker.isHealthy();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Create singleton instance
export const resilientApiService = new ResilientApiService();

// Convenience methods for common HTTP operations
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => 
    resilientApiService.request<T>(endpoint, { method: 'GET', ...options }),
    
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    resilientApiService.request<T>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data),
      ...options 
    }),
    
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    resilientApiService.request<T>(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data),
      ...options 
    }),
    
  delete: <T = any>(endpoint: string, options?: RequestInit) => 
    resilientApiService.request<T>(endpoint, { method: 'DELETE', ...options }),
    
  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    resilientApiService.request<T>(endpoint, { 
      method: 'PATCH', 
      body: JSON.stringify(data),
      ...options 
    })
};

export default resilientApiService;
