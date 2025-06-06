/**
 * Hook for managing individual AI model response modals
 * 
 * Provides state management and utilities for displaying individual
 * model responses in modals with smooth UX interactions.
 */

import { useState, useCallback, useMemo } from 'react';
import type { SubAnswer } from '../lib/types';

// ============================================================================
// Types
// ============================================================================

export interface ModelResponseData {
  model: string;
  answer: string;
  role?: string;
  provider?: string;
  tokenCount?: number;
  executionTime?: number;
  status: 'success' | 'failed' | 'timeout';
  errorReason?: string;
  wordCount?: number;
}

export interface UseModelResponsesResult {
  /** Currently selected model for modal display */
  selectedModel: ModelResponseData | null;
  
  /** Whether modal is open */
  isModalOpen: boolean;
  
  /** Open modal with specific model response */
  openModelModal: (model: ModelResponseData) => void;
  
  /** Close modal */
  closeModal: () => void;
  
  /** Get all available model responses */
  getAvailableModels: () => ModelResponseData[];
  
  /** Navigate to next model in modal */
  nextModel: () => void;
  
  /** Navigate to previous model in modal */
  previousModel: () => void;
  
  /** Check if navigation is available */
  canNavigate: { next: boolean; previous: boolean };
}

// ============================================================================
// Model Display Names and Icons
// ============================================================================

export const MODEL_DISPLAY_INFO = {
  'openai:gpt-4': {
    name: 'GPT-4',
    provider: 'OpenAI',
    color: 'green'
  },
  'openai:gpt-3.5-turbo': {
    name: 'GPT-3.5',
    provider: 'OpenAI',
    color: 'green'
  },
  'google:gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    color: 'blue'
  },
  'xai:grok-3-mini': {
    name: 'Grok 3 Mini',
    provider: 'xAI',
    color: 'purple'
  }
} as const;



// ============================================================================
// Hook Implementation
// ============================================================================

export function useModelResponses(
  individualResponses?: SubAnswer[],
  modelsUsed?: Record<string, boolean>,
  fallbackReasons?: Record<string, string>
): UseModelResponsesResult {
  const [selectedModel, setSelectedModel] = useState<ModelResponseData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform API data into display-ready format using new individual responses
  const availableModels = useMemo((): ModelResponseData[] => {
    const models: ModelResponseData[] = [];

    // Process individual responses format
    if (individualResponses && individualResponses.length > 0) {
      individualResponses.forEach(response => {
        models.push({
          model: response.model,
          answer: response.answer,
          role: response.role,
          provider: response.provider,
          status: response.status || 'success',
          wordCount: response.wordCount
        });
      });
    }

    return models;
  }, [individualResponses, modelsUsed, fallbackReasons]);

  const openModelModal = useCallback((model: ModelResponseData) => {
    setSelectedModel(model);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay clearing selected model for smooth animation
    setTimeout(() => setSelectedModel(null), 200);
  }, []);

  const getAvailableModels = useCallback(() => availableModels, [availableModels]);

  // Navigation between models in modal
  const currentIndex = useMemo(() => {
    if (!selectedModel) return -1;
    return availableModels.findIndex(m => m.model === selectedModel.model);
  }, [selectedModel, availableModels]);

  const nextModel = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < availableModels.length - 1) {
      setSelectedModel(availableModels[currentIndex + 1]);
    }
  }, [currentIndex, availableModels]);

  const previousModel = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedModel(availableModels[currentIndex - 1]);
    }
  }, [currentIndex, availableModels]);

  const canNavigate = useMemo(() => ({
    next: currentIndex >= 0 && currentIndex < availableModels.length - 1,
    previous: currentIndex > 0
  }), [currentIndex, availableModels.length]);

  return {
    selectedModel,
    isModalOpen,
    openModelModal,
    closeModal,
    getAvailableModels,
    nextModel,
    previousModel,
    canNavigate
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Transform camelCase to proper display format
 * e.g., "creativeAdvisor" -> "Creative Advisor"
 */
export function transformCamelCaseToDisplay(text: string): string {
  return text
    // Insert space before uppercase letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Capitalize first letter
    .replace(/^./, str => str.toUpperCase());
}

/**
 * Get display information for a model
 */
export function getModelDisplayInfo(modelKey: string) {
  // Handle regular models
  return MODEL_DISPLAY_INFO[modelKey as keyof typeof MODEL_DISPLAY_INFO] || {
    name: modelKey.split(':')[1] || modelKey,
    provider: modelKey.split(':')[0] || 'Unknown',
    color: 'gray'
  };
}

/**
 * Format model name for display using provider-model format
 */
export function formatModelName(modelKey: string, _role?: string, provider?: string): string {
  // Always use PROVIDER - MODEL format when provider info is available
  if (provider && modelKey) {
    const providerName = provider.toUpperCase();
    const modelName = modelKey.toUpperCase();
    return `${providerName} - ${modelName}`;
  }

  // Fallback for cases without provider info
  const info = getModelDisplayInfo(modelKey);
  return `${info.provider?.toUpperCase() || 'UNKNOWN'} - ${modelKey.toUpperCase()}`;
}


