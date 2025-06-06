/**
 * Hook for managing individual AI model response modals
 * 
 * Provides state management and utilities for displaying individual
 * model responses in modals with smooth UX interactions.
 */

import { useState, useCallback, useMemo } from 'react';
import type { SubAnswer, LegacyEnsembleMetadata } from '../lib/types';

// ============================================================================
// Types
// ============================================================================

export interface ModelResponseData {
  model: string;
  answer: string;
  role?: string;
  tokenCount?: number;
  executionTime?: number;
  status: 'success' | 'failed' | 'timeout';
  errorReason?: string;
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

export const ENSEMBLE_ROLE_INFO = {
  evidenceAnalyst: {
    name: 'Evidence Analyst',
    description: 'Provides fact-based analysis and verification',
    color: 'blue'
  },
  innovator: {
    name: 'Innovator',
    description: 'Offers creative solutions and fresh perspectives',
    color: 'purple'
  },
  riskReviewer: {
    name: 'Risk Reviewer',
    description: 'Identifies potential risks and considerations',
    color: 'orange'
  },
  // Additional roles that might come from the API
  creativeAdvisor: {
    name: 'Creative Advisor',
    description: 'Provides creative and innovative solutions',
    color: 'purple'
  },
  devilsAdvocate: {
    name: 'Devils Advocate',
    description: 'Challenges ideas and identifies potential issues',
    color: 'red'
  },
  scientificAnalyst: {
    name: 'Scientific Analyst',
    description: 'Provides scientific and analytical perspectives',
    color: 'blue'
  }
} as const;

// ============================================================================
// Hook Implementation
// ============================================================================

export function useModelResponses(
  individualResponses?: SubAnswer[],
  ensembleMetadata?: LegacyEnsembleMetadata,
  modelsUsed?: Record<string, boolean>,
  fallbackReasons?: Record<string, string>
): UseModelResponsesResult {
  const [selectedModel, setSelectedModel] = useState<ModelResponseData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform API data into display-ready format - only show ensemble/role-based responses
  const availableModels = useMemo((): ModelResponseData[] => {
    const models: ModelResponseData[] = [];

    // Only add ensemble metadata as "virtual" model responses (the 3 AI assistants)
    if (ensembleMetadata) {
      Object.entries(ensembleMetadata).forEach(([role, content]) => {
        if (role !== 'executionTime' && typeof content === 'string') {
          models.push({
            model: `ensemble:${role}`,
            answer: content,
            role: role,
            status: 'success',
            executionTime: (ensembleMetadata as any).executionTime || 0
          });
        }
      });
    }

    // Only show ensemble responses since we removed mock individual responses
    // Individual responses from the API (if any) would be processed here
    if (individualResponses && individualResponses.length > 0) {
      individualResponses.forEach(response => {
        // Only include responses that have a meaningful role (not just model names)
        if (response.role && !response.model.includes(':')) {
          models.push({
            model: response.model,
            answer: response.answer,
            role: response.role,
            status: 'success'
          });
        }
      });
    }

    return models;
  }, [individualResponses, ensembleMetadata, modelsUsed, fallbackReasons]);

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
  // Handle ensemble roles
  if (modelKey.startsWith('ensemble:')) {
    const role = modelKey.replace('ensemble:', '') as keyof typeof ENSEMBLE_ROLE_INFO;
    return ENSEMBLE_ROLE_INFO[role] || {
      name: transformCamelCaseToDisplay(role),
      description: 'AI ensemble analysis',
      color: 'gray'
    };
  }

  // Handle regular models
  return MODEL_DISPLAY_INFO[modelKey as keyof typeof MODEL_DISPLAY_INFO] || {
    name: modelKey.split(':')[1] || modelKey,
    provider: modelKey.split(':')[0] || 'Unknown',
    color: 'gray'
  };
}

/**
 * Format model name for display
 */
export function formatModelName(modelKey: string, role?: string): string {
  const info = getModelDisplayInfo(modelKey);

  if (modelKey.startsWith('ensemble:')) {
    return info.name;
  }

  // Format: "Model Name - Role" (e.g., "Grok 3 Mini - Creative Advisor")
  const modelName = info.name;
  const rawRole = role || getDefaultRoleForModel(modelKey);
  const displayRole = transformCamelCaseToDisplay(rawRole);

  return `${modelName} - ${displayRole}`;
}

/**
 * Get default role for a model (in camelCase format)
 */
function getDefaultRoleForModel(modelKey: string): string {
  switch (modelKey) {
    case 'google:gemini-1.5-flash':
      return 'analyticalProcessor';
    case 'xai:grok-3-mini':
      return 'creativeAdvisor';
    case 'openai:gpt-4':
      return 'comprehensiveAdvisor';
    case 'openai:gpt-3.5-turbo':
      return 'quickResponder';
    default:
      return 'aiAssistant';
  }
}
