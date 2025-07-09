/**
 * Stores Index
 * 
 * Centralized exports for all Zustand stores
 */

// New simplified stores
export {
  useChatStore,
  useChatMessages,
  useChatLoading,
  useChatError,
  useChatActions,
} from './useChatStore';
export type { Message, ChatState } from './useChatStore';

// Legacy stores (still in use)
export { useAuthStore } from '../store/useAuthStore';
export { useHistoryStore } from '../store/useHistoryStore';
export { useFitnessStore } from '../store/useFitnessStore';
