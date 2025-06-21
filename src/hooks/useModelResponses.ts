/**
 * Hook for managing individual AI model response modals
 * 
 * Provides state management and utilities for displaying individual
 * model responses in modals with smooth UX interactions.
 */

import { useCallback, useMemo, useState } from 'react';
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

  // Enhanced ensemble metadata for customer-centric insights
  confidence?: {
    score: number;           // 0-1 confidence score
    level: string;           // "low", "medium", "high"
    factors: string[];       // Specific confidence reasoning
  };

  // Performance metrics
  responseTime?: number;     // Processing time in milliseconds
  characterCount?: number;   // Response character count

  // Quality analysis
  quality?: {
    wordCount: number;
    sentenceCount: number;
    averageWordsPerSentence: number;
    hasStructure: boolean;
    hasReasoning: boolean;
    complexity: string;      // "low", "medium", "high"
  };

  // Model reliability and metadata
  metadata?: {
    confidenceLevel: string;
    modelReliability: number; // 0-1 reliability score
    processingTime: number;
    tokenCount: number;
    complexity: string;
  };
}

export interface EnsembleOverviewData {
  totalRoles: number;
  successfulRoles: number;
  failedRoles: number;
  synthesisStatus: string;
  processingTimeMs: number;
  synthesisStrategy?: string;

  // Confidence analysis
  confidenceAnalysis?: {
    overallConfidence: number;
    modelAgreement: number;
    responseConsistency: number;
    qualityDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  };

  // Cost and performance
  costEstimate?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
    estimatedCost: string;
    modelsUsed: number;
  };
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

  /** Ensemble overview data for summary display */
  ensembleOverview: EnsembleOverviewData | null;
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
  fallbackReasons?: Record<string, string>,
  ensembleMetadata?: any // Full ensemble metadata from API
): UseModelResponsesResult {
  const [selectedModel, setSelectedModel] = useState<ModelResponseData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform API data into display-ready format using new individual responses
  const availableModels = useMemo((): ModelResponseData[] => {
    const models: ModelResponseData[] = [];

    // Process individual responses format with enhanced metadata
    if (individualResponses && individualResponses.length > 0) {
      individualResponses.forEach(response => {
        models.push({
          model: response.model,
          answer: response.answer,
          role: response.role,
          provider: response.provider,
          status: response.status || 'success',
          wordCount: response.wordCount,

          // Extract enhanced metadata from API response
          confidence: typeof response.confidence === 'number'
            ? { score: response.confidence, level: 'unknown', factors: [] }
            : response.confidence,
          responseTime: response.responseTime,
          characterCount: response.characterCount,
          quality: response.quality,
          metadata: response.metadata
        });
      });
    }

    return models;
  }, [individualResponses, modelsUsed, fallbackReasons, ensembleMetadata]);

  // Extract ensemble overview data for summary display
  const ensembleOverview = useMemo((): EnsembleOverviewData | null => {
    if (!ensembleMetadata) return null;

    return {
      totalRoles: ensembleMetadata.totalRoles || 0,
      successfulRoles: ensembleMetadata.successfulRoles || 0,
      failedRoles: ensembleMetadata.failedRoles || 0,
      synthesisStatus: ensembleMetadata.synthesisStatus || 'unknown',
      processingTimeMs: ensembleMetadata.processingTimeMs || 0,
      synthesisStrategy: ensembleMetadata.synthesisStrategy,
      confidenceAnalysis: ensembleMetadata.confidenceAnalysis,
      costEstimate: ensembleMetadata.costEstimate
    };
  }, [ensembleMetadata]);

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
    canNavigate,
    ensembleOverview
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


