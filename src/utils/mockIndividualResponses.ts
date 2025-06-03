/**
 * Mock Individual Responses Utility
 * 
 * Generates mock individual model responses for testing the UI
 * until the backend API is updated to return actual individual responses.
 */

import type { SubAnswer, EnsembleMetadata } from '../lib/types';

/**
 * Generate mock individual responses based on the main response
 */
export function generateMockIndividualResponses(
  mainResponse: string,
  modelsUsed?: Record<string, boolean>,
  ensembleMetadata?: EnsembleMetadata
): SubAnswer[] {
  const responses: SubAnswer[] = [];

  // If we have ensemble metadata, create responses for each role
  if (ensembleMetadata) {
    if (ensembleMetadata.evidenceAnalyst) {
      responses.push({
        model: 'ensemble:evidenceAnalyst',
        answer: ensembleMetadata.evidenceAnalyst,
        role: 'Evidence Analyst'
      });
    }

    if (ensembleMetadata.innovator) {
      responses.push({
        model: 'ensemble:innovator',
        answer: ensembleMetadata.innovator,
        role: 'Innovator'
      });
    }

    if (ensembleMetadata.riskReviewer) {
      responses.push({
        model: 'ensemble:riskReviewer',
        answer: ensembleMetadata.riskReviewer,
        role: 'Risk Reviewer'
      });
    }
  }

  // Generate mock responses for successful models
  if (modelsUsed) {
    const successfulModels = Object.entries(modelsUsed)
      .filter(([_, success]) => success)
      .map(([model]) => model);

    successfulModels.forEach((model, index) => {
      // Skip if we already have an ensemble response for this
      if (responses.some(r => r.model === model)) return;

      // Generate a variation of the main response for each model
      const variation = generateModelVariation(mainResponse, model, index);
      responses.push({
        model,
        answer: variation,
        role: getModelRole(model)
      });
    });
  }

  return responses;
}

/**
 * Generate a variation of the main response for a specific model
 */
function generateModelVariation(mainResponse: string, model: string, index: number): string {
  const sentences = mainResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 1) {
    return mainResponse; // Return original if too short to vary
  }

  // Create variations based on model characteristics
  switch (model) {
    case 'google:gemini-1.5-flash':
      return createGeminiVariation(sentences, index);
    case 'xai:grok-3-mini':
      return createGrokVariation(sentences, index);
    case 'openai:gpt-4':
      return createGPTVariation(sentences, index);
    default:
      return createGenericVariation(sentences, index);
  }
}

/**
 * Create a Gemini-style variation (more structured, analytical)
 */
function createGeminiVariation(sentences: string[], index: number): string {
  const selectedSentences = sentences.slice(0, Math.max(2, sentences.length - index));
  const variation = selectedSentences.join('. ') + '.';
  
  return `**Gemini Analysis:**\n\n${variation}\n\n*Key insights:*\n- Structured approach to the problem\n- Data-driven recommendations\n- Comprehensive analysis`;
}

/**
 * Create a Grok-style variation (more creative, conversational)
 */
function createGrokVariation(sentences: string[], index: number): string {
  const selectedSentences = sentences.slice(index, sentences.length);
  const variation = selectedSentences.join('. ') + '.';
  
  return `**Grok's Take:**\n\n${variation}\n\n*Creative perspective:*\n- Innovative solutions\n- Out-of-the-box thinking\n- Fresh approach to the challenge`;
}

/**
 * Create a GPT-style variation (balanced, comprehensive)
 */
function createGPTVariation(sentences: string[], _index: number): string {
  const midPoint = Math.floor(sentences.length / 2);
  const selectedSentences = sentences.slice(midPoint - 1, midPoint + 2);
  const variation = selectedSentences.join('. ') + '.';

  return `**GPT-4 Response:**\n\n${variation}\n\n*Comprehensive overview:*\n- Balanced perspective\n- Detailed explanations\n- Practical recommendations`;
}

/**
 * Create a generic variation
 */
function createGenericVariation(sentences: string[], index: number): string {
  const start = index % sentences.length;
  const end = Math.min(start + 2, sentences.length);
  const selectedSentences = sentences.slice(start, end);
  
  return selectedSentences.join('. ') + '.';
}

/**
 * Get the role for a specific model (in camelCase format)
 */
function getModelRole(model: string): string {
  switch (model) {
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

/**
 * Check if mock responses should be generated
 * (only in development or when explicitly enabled)
 */
export function shouldGenerateMockResponses(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    localStorage.getItem('neurastack-enable-mock-responses') === 'true'
  );
}

/**
 * Enable or disable mock responses
 */
export function setMockResponsesEnabled(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem('neurastack-enable-mock-responses', 'true');
  } else {
    localStorage.removeItem('neurastack-enable-mock-responses');
  }
}

/**
 * Generate mock failed model responses
 */
export function generateMockFailedResponses(
  fallbackReasons?: Record<string, string>
): SubAnswer[] {
  if (!fallbackReasons) return [];

  return Object.entries(fallbackReasons).map(([model, _reason]) => ({
    model,
    answer: '',
    role: getModelRole(model)
  }));
}

/**
 * Enhance response with mock individual responses if needed
 */
export function enhanceResponseWithMockData(response: any): any {
  if (!shouldGenerateMockResponses()) {
    return response;
  }

  // Only add mock data if individual responses are not already present
  if (!response.individualResponses && response.answer) {
    const mockResponses = generateMockIndividualResponses(
      response.answer,
      response.modelsUsed,
      response.ensembleMetadata
    );

    return {
      ...response,
      individualResponses: mockResponses
    };
  }

  return response;
}
