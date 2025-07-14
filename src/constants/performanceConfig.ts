/**
 * Performance Configuration
 * 
 * Centralized configuration for performance-related settings
 * across the NeuraStack application.
 */

export const PERFORMANCE_CONFIG = {
  // Message handling
  MAX_MESSAGE_LENGTH: 10000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // Base delay in milliseconds
  
  // Memory management
  MEMORY_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 30,
  
  // Performance monitoring
  PERFORMANCE_SAMPLE_RATE: 0.1, // 10% sampling
  ERROR_SAMPLE_RATE: 1.0, // 100% error tracking
  
  // Cache settings
  CACHE_TTL: 10 * 60 * 1000, // 10 minutes
  MAX_CACHE_SIZE: 100, // Maximum number of cached items
  
  // Animation and UI
  ANIMATION_DURATION: 200, // Default animation duration in ms
  DEBOUNCE_DELAY: 300, // Input debounce delay in ms
  
  // Network timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 10000, // 10 seconds
} as const;

export type PerformanceConfig = typeof PERFORMANCE_CONFIG;
