/**
 * API Configuration Test Utility
 * 
 * Simple utility to test the API configuration with the specified models
 */

import { neuraStackClient } from '../lib/neurastack-client';

export async function testApiConfiguration() {
  try {
    console.log('🧪 Testing API configuration...');
    
    const testPrompt = "plan a trip to paris";
    
    console.log('📤 Sending request with parameters:');
    console.log({
      prompt: testPrompt,
      useEnsemble: true,
      models: ['google:gemini-1.5-flash', 'google:gemini-1.5-flash', 'xai:grok-3-mini', 'xai:grok-3-mini']
    });
    
    const response = await neuraStackClient.queryAI(testPrompt, {
      useEnsemble: true,
      models: ['google:gemini-1.5-flash', 'google:gemini-1.5-flash', 'xai:grok-3-mini', 'xai:grok-3-mini'],
      maxTokens: 1000,
      temperature: 0.7
    });
    
    console.log('✅ API Response received:');
    console.log('📊 Response details:', {
      answerLength: response.answer.length,
      ensembleMode: response.ensembleMode,
      modelsUsed: response.modelsUsed,
      executionTime: response.executionTime,
      tokenCount: response.tokenCount
    });
    
    console.log('📝 Answer preview:', response.answer.substring(0, 200) + '...');
    
    return {
      success: true,
      response
    };
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export for use in development console
if (typeof window !== 'undefined') {
  (window as any).testApiConfiguration = testApiConfiguration;
}
