/**
 * Centralized Application Configuration
 * 
 * This file contains all application-wide configuration settings,
 * eliminating scattered configurations throughout the codebase.
 */

// ============================================================================
// Performance Configuration
// ============================================================================

export const PERFORMANCE_CONFIG = {
  // Chat & Memory Management
  MAX_MESSAGES: 100,
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000,
  MEMORY_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MESSAGE_BATCH_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  MAX_MESSAGE_LENGTH: 10000,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 30,
  
  // Bundle & Loading
  CHUNK_SIZE_WARNING_LIMIT: 400,
  ASSET_INLINE_LIMIT: 1024, // 1KB
  
  // Performance Thresholds
  MIN_FPS: 30,
  MAX_MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
  NETWORK_TIMEOUT: 15000, // 15 seconds
} as const;

// ============================================================================
// UI/UX Configuration
// ============================================================================

export const UI_CONFIG = {
  // Animation & Motion
  ANIMATION_DURATION: {
    FAST: 0.15,
    NORMAL: 0.25,
    SLOW: 0.35,
  },
  
  ANIMATION_EASING: [0.25, 0.46, 0.45, 0.94] as const,
  
  // Responsive Breakpoints (matches Chakra UI)
  BREAKPOINTS: {
    BASE: '0px',
    SM: '480px',
    MD: '768px',
    LG: '992px',
    XL: '1280px',
    '2XL': '1536px',
  },
  
  // Touch Targets (WCAG compliant)
  TOUCH_TARGETS: {
    SMALL: '44px',
    MEDIUM: '52px',
    LARGE: '64px',
    XLARGE: '72px',
  },
  
  // Z-Index Scale
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
} as const;

// ============================================================================
// Mobile Optimization Configuration
// ============================================================================

export const MOBILE_CONFIG = {
  // Device Detection Thresholds
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  TOUCH_DEVICE_DETECTION: 'ontouchstart' in window,
  
  // Viewport Management
  VIEWPORT_META: {
    INITIAL_SCALE: 1,
    MAXIMUM_SCALE: 1,
    USER_SCALABLE: 'no',
    VIEWPORT_FIT: 'cover',
  },
  
  // Performance Optimizations
  SCROLL_THROTTLE: 16, // 60fps
  RESIZE_DEBOUNCE: 250,
  KEYBOARD_DETECTION_THRESHOLD: 150, // pixels
  
  // Haptic Feedback Patterns
  HAPTIC_PATTERNS: {
    LIGHT: [10],
    MEDIUM: [25],
    HEAVY: [50],
    SUCCESS: [25, 25, 25, 25, 100],
    ERROR: [100, 50, 100, 50, 100, 50, 100],
    TAP: [5],
    SELECT: [15],
  },
} as const;

// ============================================================================
// Chat Configuration
// ============================================================================

export const CHAT_CONFIG = {
  // Layout & Spacing
  CONTAINER: {
    MAX_WIDTH: {
      BASE: '100%',
      MD: '900px',
      LG: '1000px',
      XL: '1100px',
    },
    PADDING: {
      BASE: 'clamp(0.5rem, 2vw, 1rem)',
      SM: 'clamp(0.75rem, 2.5vw, 1.25rem)',
      MD: 'clamp(1.5rem, 4vw, 2rem)',
      LG: 'clamp(2rem, 5vw, 2.5rem)',
      XL: 'clamp(2.5rem, 6vw, 3rem)',
    },
    GAP: {
      BASE: 'clamp(1rem, 3vw, 1.5rem)',
      MD: 'clamp(1.25rem, 3.5vw, 1.75rem)',
      LG: 'clamp(1.5rem, 4vw, 2rem)',
      XL: 'clamp(1.75rem, 4.5vw, 2.25rem)',
    },
  },
  
  // Message Bubbles
  MESSAGE_BUBBLE: {
    MAX_WIDTH: {
      BASE: '95%',
      SM: '92%',
      MD: '88%',
      LG: '85%',
      XL: '80%',
    },
    BORDER_RADIUS: '1.25rem',
    PADDING: {
      BASE: '1rem',
      MD: '1.25rem',
    },
  },
  
  // Input Configuration
  INPUT: {
    MIN_HEIGHT: '52px',
    MAX_HEIGHT: '200px',
    BORDER_RADIUS: '1.5rem',
    PADDING: '1rem 1.25rem',
    MAX_CHARS: 10000,
  },
} as const;

// ============================================================================
// Theme Configuration
// ============================================================================

export const THEME_CONFIG = {
  // Modern Monochromatic Color System
  COLORS: {
    // Single strategic accent
    ACCENT: '#2563eb',
    ACCENT_LIGHT: '#3b82f6',
    ACCENT_DARK: '#1d4ed8',

    // Semantic colors (minimal)
    SUCCESS: '#16a34a',
    WARNING: '#d97706',
    ERROR: '#dc2626',

    // Backgrounds - Clean and minimal
    BG_PRIMARY: '#ffffff',
    BG_SECONDARY: '#fafafa',
    BG_TERTIARY: '#f5f5f5',
    BG_GLASS: 'rgba(255, 255, 255, 0.85)',

    // Text - Monochromatic hierarchy
    TEXT_PRIMARY: '#171717',
    TEXT_SECONDARY: '#525252',
    TEXT_TERTIARY: '#737373',
    TEXT_MUTED: '#a3a3a3',
    TEXT_INVERSE: '#ffffff',
    TEXT_ACCENT: '#2563eb',

    // Borders - Clean and minimal
    BORDER_LIGHT: '#f5f5f5',
    BORDER_MEDIUM: '#e5e5e5',
    BORDER_STRONG: '#d4d4d4',
    BORDER_ACCENT: '#2563eb',
  },
  
  // Modern Glass Morphism
  GLASS: {
    BACKDROP_FILTER: 'blur(20px)',
    WEBKIT_BACKDROP_FILTER: 'blur(20px)',
    BORDER: '1px solid rgba(255, 255, 255, 0.3)',
    SHADOW: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
  
  // Typography
  TYPOGRAPHY: {
    FONT_FAMILY: {
      BODY: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      HEADING: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      MONO: 'JetBrains Mono, Consolas, "Liberation Mono", Menlo, Courier, monospace',
    },
    FONT_SIZES: {
      XS: '0.75rem',
      SM: '0.875rem',
      MD: '1rem',
      LG: '1.125rem',
      XL: '1.25rem',
      '2XL': '1.5rem',
      '3XL': '1.875rem',
      '4XL': '2.25rem',
    },
  },
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  // Endpoints
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 'https://neurastack-backend-638289111765.us-central1.run.app',
  
  // Timeouts
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 120000, // 2 minutes
  
  // Retry Configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RETRY_MULTIPLIER: 2,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// ============================================================================
// Environment Configuration
// ============================================================================

export const ENV_CONFIG = {
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '3.0.0',
  
  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
    ENABLE_PWA: true,
    ENABLE_OFFLINE_MODE: true,
  },
} as const;

// ============================================================================
// Export All Configurations
// ============================================================================

export const APP_CONFIG = {
  PERFORMANCE: PERFORMANCE_CONFIG,
  UI: UI_CONFIG,
  MOBILE: MOBILE_CONFIG,
  CHAT: CHAT_CONFIG,
  THEME: THEME_CONFIG,
  API: API_CONFIG,
  ENV: ENV_CONFIG,
} as const;

// Type exports for TypeScript support
export type AppConfig = typeof APP_CONFIG;
export type PerformanceConfig = typeof PERFORMANCE_CONFIG;
export type UIConfig = typeof UI_CONFIG;
export type MobileConfig = typeof MOBILE_CONFIG;
export type ChatConfig = typeof CHAT_CONFIG;
export type ThemeConfig = typeof THEME_CONFIG;
export type APIConfig = typeof API_CONFIG;
export type EnvConfig = typeof ENV_CONFIG;
