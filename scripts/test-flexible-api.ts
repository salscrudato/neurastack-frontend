/**
 * Comprehensive Test Script for New Flexible Workout API
 * 
 * This script tests the new flexible workout API integration including:
 * - Basic workout generation with minimal data
 * - Advanced workout generation with full data
 * - Natural language inputs
 * - Error handling and edge cases
 * - Workout completion flow
 */

import { WorkoutGenerateRequest, WorkoutCompleteRequest } from '../src/lib/types';

const API_BASE_URL = 'https://neurastack-backend-638289111765.us-central1.run.app';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

/**
 * Test basic workout generation with minimal required data
 */
async function testBasicWorkoutGeneration(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const request: WorkoutGenerateRequest = {
      age: 30,
      fitnessLevel: 'intermediate'
    };

    const response = await fetch(`${API_BASE_URL}/workout/generate-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'test-user-basic'
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }

    // Validate response structure
    if (!data.data?.workout?.exercises || !Array.isArray(data.data.workout.exercises)) {
      throw new Error('Invalid response structure - missing exercises array');
    }

    if (data.data.workout.exercises.length === 0) {
      throw new Error('No exercises returned in workout');
    }

    return {
      name: 'Basic Workout Generation',
      success: true,
      duration,
      data: {
        workoutId: data.data.workoutId,
        exerciseCount: data.data.workout.exercises.length,
        duration: data.data.workout.duration,
        type: data.data.workout.type
      }
    };
  } catch (error) {
    return {
      name: 'Basic Workout Generation',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test advanced workout generation with full data
 */
async function testAdvancedWorkoutGeneration(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const request: WorkoutGenerateRequest = {
      age: 28,
      fitnessLevel: 'advanced',
      gender: 'male',
      weight: 180,
      goals: ['Build Muscle', 'Increase Strength'],
      equipment: ['dumbbells', 'barbell', 'bench'],
      injuries: ['previous shoulder injury - avoid overhead pressing'],
      timeAvailable: 60,
      daysPerWeek: 5,
      workoutType: 'Push Day - Chest, Shoulders, Triceps',
      otherInformation: 'I compete in powerlifting and need to focus on progressive overload. I prefer compound movements and can handle high intensity.'
    };

    const response = await fetch(`${API_BASE_URL}/workout/generate-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'test-user-advanced'
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }

    // Validate advanced response structure
    if (!data.data?.workout?.exercises || !Array.isArray(data.data.workout.exercises)) {
      throw new Error('Invalid response structure - missing exercises array');
    }

    if (!data.data.workout.coachingTips || !Array.isArray(data.data.workout.coachingTips)) {
      throw new Error('Invalid response structure - missing coaching tips');
    }

    return {
      name: 'Advanced Workout Generation',
      success: true,
      duration,
      data: {
        workoutId: data.data.workoutId,
        exerciseCount: data.data.workout.exercises.length,
        duration: data.data.workout.duration,
        type: data.data.workout.type,
        coachingTips: data.data.workout.coachingTips.length,
        approach: data.data.metadata.approach
      }
    };
  } catch (error) {
    return {
      name: 'Advanced Workout Generation',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test natural language inputs
 */
async function testNaturalLanguageInputs(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const request: WorkoutGenerateRequest = {
      age: 35,
      fitnessLevel: 'beginner',
      goals: 'I want to lose weight and get stronger for everyday activities',
      equipment: 'I have access to a basic home gym with some dumbbells and resistance bands',
      injuries: 'I have some lower back issues so please avoid heavy deadlifts',
      timeAvailable: 45,
      workoutType: 'Full body workout that is beginner friendly',
      otherInformation: 'I am new to working out and want something that will help me build confidence while being safe and effective'
    };

    const response = await fetch(`${API_BASE_URL}/workout/generate-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'test-user-natural'
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }

    return {
      name: 'Natural Language Inputs',
      success: true,
      duration,
      data: {
        workoutId: data.data.workoutId,
        exerciseCount: data.data.workout.exercises.length,
        safetyNotes: data.data.workout.safetyNotes ? 'Present' : 'Missing'
      }
    };
  } catch (error) {
    return {
      name: 'Natural Language Inputs',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test workout completion
 */
async function testWorkoutCompletion(workoutId: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const request = {
      workoutId,
      completed: true,
      rating: 4,
      difficulty: 'just_right',
      notes: 'Great workout! Felt challenging but manageable.'
    };

    const response = await fetch(`${API_BASE_URL}/workout/complete-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'test-user-completion'
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }

    return {
      name: 'Workout Completion',
      success: true,
      duration,
      data: {
        processed: data.data?.processed,
        correlationId: data.correlationId
      }
    };
  } catch (error) {
    return {
      name: 'Workout Completion',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test error handling with invalid data
 */
async function testErrorHandling(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const request = {
      age: 5, // Invalid age
      fitnessLevel: 'invalid_level'
    };

    const response = await fetch(`${API_BASE_URL}/workout/generate-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    // We expect this to fail
    if (response.ok) {
      throw new Error('Expected error response but got success');
    }

    return {
      name: 'Error Handling',
      success: true, // Success means we properly handled the error
      duration,
      data: {
        status: response.status,
        message: data.message
      }
    };
  } catch (error) {
    return {
      name: 'Error Handling',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 Starting Comprehensive Flexible API Tests\n');
  console.log('='.repeat(50));
  
  const tests = [
    testBasicWorkoutGeneration,
    testAdvancedWorkoutGeneration,
    testNaturalLanguageInputs,
    testErrorHandling
  ];

  const results: TestResult[] = [];
  let workoutIdForCompletion: string | null = null;

  // Run main tests
  for (const test of tests) {
    console.log(`\n🔄 Running ${test.name}...`);
    const result = await test();
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.name} - ${result.duration}ms`);
      if (result.data?.workoutId && !workoutIdForCompletion) {
        workoutIdForCompletion = result.data.workoutId;
      }
    } else {
      console.log(`❌ ${result.name} - ${result.error}`);
    }
  }

  // Test completion if we have a workout ID
  if (workoutIdForCompletion) {
    console.log(`\n🔄 Running Workout Completion...`);
    const completionResult = await testWorkoutCompletion(workoutIdForCompletion);
    results.push(completionResult);
    
    if (completionResult.success) {
      console.log(`✅ ${completionResult.name} - ${completionResult.duration}ms`);
    } else {
      console.log(`❌ ${completionResult.name} - ${completionResult.error}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`⏱️  Average Duration: ${Math.round(avgDuration)}ms`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! The flexible API integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  results.forEach(result => {
    console.log(`\n${result.success ? '✅' : '❌'} ${result.name}`);
    console.log(`   Duration: ${result.duration}ms`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.data) {
      console.log(`   Data: ${JSON.stringify(result.data, null, 2)}`);
    }
  });
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };
