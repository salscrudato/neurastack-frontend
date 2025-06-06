/**
 * API Configuration Test Utility
 * 
 * Simple utility to test the API configuration with the specified models
 */

import { neuraStackClient } from '../lib/neurastack-client';

export async function testApiConfiguration() {
  try {
    console.log('🧪 Testing Ensemble API with Memory Integration...');

    // First test health check
    console.log('🏥 Testing health check...');
    try {
      const healthResponse = await neuraStackClient.healthCheck();
      console.log('✅ Health check response:', healthResponse);
    } catch (healthError) {
      console.warn('⚠️ Health check failed (continuing with ensemble test):', healthError);
    }

    // Test memory health check
    console.log('🧠 Testing memory health check...');
    try {
      const memoryHealthResponse = await neuraStackClient.checkMemoryHealth();
      console.log('✅ Memory health response:', memoryHealthResponse);
    } catch (memoryHealthError) {
      console.warn('⚠️ Memory health check failed:', memoryHealthError);
    }

    // Test direct fetch to ensemble endpoint with headers
    console.log('🧪 Testing direct fetch with updated headers...');
    try {
      const directResponse = await fetch('https://neurastack-backend-638289111765.us-central1.run.app/ensemble-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'test-user-123',
          'X-Session-Id': 'test-session-456'
        },
        body: JSON.stringify({
          prompt: "Quick test: explain AI in 1-2 lines.",
          sessionId: "test-session-456"
        })
      });

      if (directResponse.ok) {
        const directData = await directResponse.json();
        console.log('✅ Direct fetch successful:', directData);
      } else {
        console.error('❌ Direct fetch failed:', directResponse.status, directResponse.statusText);
      }
    } catch (directError) {
      console.error('❌ Direct fetch error:', directError);
    }

    const testPrompt = "Should we migrate our monolithic application to microservices?";

    console.log('📤 Sending ensemble request with memory context...');

    const response = await neuraStackClient.queryAI(testPrompt);

    console.log('✅ Ensemble API Response received:');
    console.log('📊 Response details:', {
      answerLength: response.answer.length,
      ensembleMode: response.ensembleMode,
      modelsUsed: response.modelsUsed,
      executionTime: response.executionTime,
      tokenCount: response.tokenCount,
      individualResponsesCount: response.individualResponses?.length || 0,
      ensembleMetadata: response.ensembleMetadata
    });

    console.log('📝 Synthesis preview:', response.answer.substring(0, 300) + '...');

    if (response.individualResponses) {
      console.log('🎭 Individual AI Roles:');
      response.individualResponses.forEach((resp, index) => {
        console.log(`  ${index + 1}. ${resp.role}: ${resp.answer.substring(0, 100)}...`);
      });
    }

    // Test memory storage
    console.log('💾 Testing memory storage...');
    try {
      const storeResponse = await neuraStackClient.storeMemory({
        userId: 'test-user-123',
        sessionId: 'test-session-456',
        content: testPrompt,
        isUserPrompt: true,
        ensembleMode: true
      });
      console.log('✅ Memory stored:', storeResponse);
    } catch (memoryError) {
      console.warn('⚠️ Memory storage failed:', memoryError);
    }

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
