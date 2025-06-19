/**
 * Common TypeScript interfaces and types for NeuraStack application
 * 
 * This file provides comprehensive type definitions to replace all 'any' types
 * throughout the codebase, ensuring type safety and better developer experience.
 */

// ============================================================================
// Core Application Types
// ============================================================================

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
}

export interface IErrorInfo {
  type: 'network' | 'firebase' | 'api' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage: string;
  shouldRetry: boolean;
  retryDelay?: number;
}

export interface IErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Event and Handler Types
// ============================================================================

export type IEventHandler<T = Event> = (event: T) => void;
export type IAsyncEventHandler<T = Event> = (event: T) => Promise<void>;
export type IGenericCallback<T = void> = () => T;
export type IAsyncCallback<T = void> = () => Promise<T>;

export interface IOptimizedHandlerOptions {
  debounce?: number;
  throttle?: number;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

// ============================================================================
// Analytics and Monitoring Types
// ============================================================================

export interface IAnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface IPerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface IUserLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface IUsageMetrics {
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  features: string[];
  timestamp: number;
}

// ============================================================================
// Component and UI Types
// ============================================================================

export interface IComponentProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export interface IModalProps extends IComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface IButtonProps extends IComponentProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: IEventHandler<React.MouseEvent>;
}

export interface IInputProps extends IComponentProps {
  value?: string;
  placeholder?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  onChange?: IEventHandler<React.ChangeEvent<HTMLInputElement>>;
  onBlur?: IEventHandler<React.FocusEvent<HTMLInputElement>>;
  onFocus?: IEventHandler<React.FocusEvent<HTMLInputElement>>;
}

// ============================================================================
// API and Network Types
// ============================================================================

export interface IApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface INetworkState {
  isOnline: boolean;
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
}

// ============================================================================
// Storage and Cache Types
// ============================================================================

export interface ICacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  version?: string;
}

export interface ICacheOptions {
  ttl?: number; // Time to live in milliseconds
  version?: string;
  compress?: boolean;
}

export interface IStorageManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: ICacheOptions): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

// ============================================================================
// Validation and Form Types
// ============================================================================

export interface IValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export interface IValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface IFormField {
  name: string;
  value: unknown;
  rules?: IValidationRule[];
  touched?: boolean;
  error?: string;
}

// ============================================================================
// Device and Platform Types
// ============================================================================

export interface IDeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
  screenSize: {
    width: number;
    height: number;
  };
}

export interface ITouchConfig {
  tapHighlight: boolean;
  scrollBehavior: 'auto' | 'smooth';
  overscrollBehavior: 'auto' | 'contain' | 'none';
}

// ============================================================================
// Utility Types
// ============================================================================

export type IDeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? IDeepPartial<T[P]> : T[P];
};

export type IOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type IRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type IStringKeys<T> = Extract<keyof T, string>;

export type IValueOf<T> = T[keyof T];

// ============================================================================
// Configuration Types
// ============================================================================

export interface IAppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: Record<string, boolean>;
  analytics: {
    enabled: boolean;
    trackingId?: string;
  };
  performance: {
    monitoring: boolean;
    thresholds: Record<string, number>;
  };
}

// ============================================================================
// Export all types for easy importing
// ============================================================================

export type {
  // Re-export for backward compatibility
  IApiResponse as ApiResponse,
  IErrorInfo as ErrorInfo,
  IErrorContext as ErrorContext,
  IEventHandler as EventHandler,
  IAsyncEventHandler as AsyncEventHandler,
  IGenericCallback as GenericCallback,
  IAsyncCallback as AsyncCallback,
  IAnalyticsEvent as AnalyticsEvent,
  IPerformanceMetric as PerformanceMetric,
  IUserLocation as UserLocation,
  IUsageMetrics as UsageMetrics,
  IComponentProps as ComponentProps,
  IModalProps as ModalProps,
  IButtonProps as ButtonProps,
  IInputProps as InputProps,
  IApiRequestConfig as ApiRequestConfig,
  INetworkState as NetworkState,
  ICacheEntry as CacheEntry,
  ICacheOptions as CacheOptions,
  IStorageManager as StorageManager,
  IValidationRule as ValidationRule,
  IValidationResult as ValidationResult,
  IFormField as FormField,
  IDeviceInfo as DeviceInfo,
  ITouchConfig as TouchConfig,
  IDeepPartial as DeepPartial,
  IOptional as Optional,
  IRequired as Required,
  IStringKeys as StringKeys,
  IValueOf as ValueOf,
  IAppConfig as AppConfig,
};
