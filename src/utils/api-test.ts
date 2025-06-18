/**
 * Manual API Testing Utility
 * 
 * Use this to manually test API calls and verify they match the backend documentation
 */

import { neuraStackClient } from '../lib/neurastack-client';
import type { WorkoutAPIRequest } from '../lib/types';

/**
 * Test the default ensemble API
 */
export async function testChatAPI(userId: string = 'test-user') {
  console.group('🧪 Testing Chat API (/default-ensemble)');
  
  try {
    // Configure client
    neuraStackClient.configure({
      userId,
      sessionId: `test-session-${Date.now()}`
    });

    console.log('📤 Sending test prompt...');
    const response = await neuraStackClient.queryAI('Hello, this is a test message. Please respond briefly.');

    console.log('✅ Chat API Response:');
    console.log('- Answer:', response.answer.substring(0, 100) + '...');
    console.log('- Ensemble Mode:', response.ensembleMode);
    console.log('- Models Used:', Object.keys(response.modelsUsed).filter(k => response.modelsUsed[k]));
    console.log('- Execution Time:', response.executionTime);
    console.log('- Token Count:', response.tokenCount);
    console.log('- Individual Responses:', response.individualResponses?.length || 0);

    return { success: true, response };
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}

/**
 * Test the workout generation API
 */
export async function testWorkoutAPI(userId: string = 'test-user') {
  console.group('🏋️ Testing Workout API (/workout)');
  
  try {
    const workoutRequest: WorkoutAPIRequest = {
      userMetadata: {
        age: 30,
        fitnessLevel: 'beginner',
        goals: ['strength', 'weight_loss'],
        equipment: ['dumbbells', 'resistance_bands']
      },
      workoutHistory: [
        {
          date: '2025-06-15',
          type: 'upper_body',
          duration: 30
        }
      ],
      workoutRequest: 'Create a 30-minute beginner strength workout focusing on upper body with dumbbells'
    };

    console.log('📤 Sending workout request...');
    console.log('Request:', JSON.stringify(workoutRequest, null, 2));

    const response = await neuraStackClient.generateWorkout(workoutRequest, {
      userId,
      timeout: 60000 // 60 seconds for workout generation
    });

    console.log('✅ Workout API Response:');
    console.log('- Status:', response.status);
    console.log('- Workout Type:', response.data?.workout.type);
    console.log('- Duration:', response.data?.workout.duration);
    console.log('- Difficulty:', response.data?.workout.difficulty);
    console.log('- Equipment:', response.data?.workout.equipment);
    console.log('- Exercise Count:', response.data?.workout.exercises.length);
    console.log('- Warmup Exercises:', response.data?.workout.warmup.length);
    console.log('- Cooldown Exercises:', response.data?.workout.cooldown.length);
    console.log('- Calorie Estimate:', response.data?.workout.calorieEstimate);
    console.log('- AI Model Used:', response.data?.metadata.model);
    console.log('- Correlation ID:', response.correlationId);

    // Log first exercise as example
    if (response.data?.workout.exercises.length > 0) {
      const firstExercise = response.data.workout.exercises[0];
      console.log('- First Exercise Example:');
      console.log('  - Name:', firstExercise.name);
      console.log('  - Category:', firstExercise.category);
      console.log('  - Sets:', firstExercise.sets);
      console.log('  - Reps:', firstExercise.reps);
      console.log('  - Rest:', firstExercise.rest);
      console.log('  - Target Muscles:', firstExercise.targetMuscles);
    }

    return { success: true, response };
  } catch (error) {
    console.error('❌ Workout API Error:', error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}

/**
 * Test health check endpoint
 */
export async function testHealthAPI() {
  console.group('🏥 Testing Health API (/health)');
  
  try {
    console.log('📤 Checking API health...');
    const response = await neuraStackClient.healthCheck();

    console.log('✅ Health API Response:');
    console.log('- Status:', response.status);
    console.log('- Message:', response.message);

    return { success: true, response };
  } catch (error) {
    console.error('❌ Health API Error:', error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}

/**
 * Run all API tests
 */
export async function runAllAPITests(userId: string = 'test-user') {
  console.log('🚀 Starting comprehensive API tests...');
  console.log('Backend URL:', neuraStackClient['config'].baseUrl);
  console.log('User ID:', userId);
  console.log('---');

  const results = {
    health: await testHealthAPI(),
    chat: await testChatAPI(userId),
    workout: await testWorkoutAPI(userId)
  };

  console.log('📊 Test Results Summary:');
  console.log('- Health API:', results.health.success ? '✅ PASS' : '❌ FAIL');
  console.log('- Chat API:', results.chat.success ? '✅ PASS' : '❌ FAIL');
  console.log('- Workout API:', results.workout.success ? '✅ PASS' : '❌ FAIL');

  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`Overall: ${successCount}/${totalCount} tests passed`);

  return results;
}

/**
 * Test rate limiting behavior
 */
export async function testRateLimiting(userId: string = 'test-user') {
  console.group('⏱️ Testing Rate Limiting');
  
  try {
    console.log('📤 Sending multiple rapid requests...');
    
    const promises = Array.from({ length: 5 }, (_, i) => 
      neuraStackClient.queryAI(`Test message ${i + 1}`)
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Rate Limiting Test Results:`);
    console.log(`- Successful requests: ${successful}`);
    console.log(`- Failed requests: ${failed}`);
    
    // Log any rate limit errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.log(`- Request ${index + 1} failed:`, result.reason.message);
      }
    });

    return { success: true, successful, failed };
  } catch (error) {
    console.error('❌ Rate Limiting Test Error:', error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).apiTest = {
    testChatAPI,
    testWorkoutAPI,
    testHealthAPI,
    runAllAPITests,
    testRateLimiting
  };
  
  console.log('🔧 API Test utilities loaded. Use window.apiTest to run tests.');
  console.log('Examples:');
  console.log('- window.apiTest.runAllAPITests("your-user-id")');
  console.log('- window.apiTest.testChatAPI("your-user-id")');
  console.log('- window.apiTest.testWorkoutAPI("your-user-id")');
}
