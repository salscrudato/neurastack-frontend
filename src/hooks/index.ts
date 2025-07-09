/**
 * Hooks Index
 * 
 * Centralized exports for all custom hooks
 */

// Core Hooks
export { useOptimizedDevice } from './core/useOptimizedDevice';
export type { OptimizedDeviceResult } from './core/useOptimizedDevice';

// Legacy hooks have been removed - use useOptimizedDevice instead

// Other hooks
export { useAccessibility } from './useAccessibility';
export { useModelResponses } from './useModelResponses';
export { useNeuraStackAI } from './useNeuraStackAI';

