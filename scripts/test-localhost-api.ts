#!/usr/bin/env tsx

/**
 * Test script for the updated NeuraStack Workout API on localhost:8080
 * Tests the new API endpoints and request/response structure
 */

const API_BASE_URL = 'http://localhost:8080';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  data?: any;
  error?: string;
}

/**
 * Test basic workout generation with new API structure
 */
async function testBasicWorkoutGeneration(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const request = {
      age: 25,
      fitnessLevel: 'intermediate',
      equipment: ['Dumbbells', 'Resistance Bands'],
      goals: ['Build Muscle', 'Improve Endurance'],
      gender: 'male',
      weight: 175,
      timeAvailable: 45,
      daysPerWeek: 4,
      workoutType: 'Strength Training - Upper Body Focus'
    };

    console.log('🚀 Testing Basic Workout Generation...');
    console.log('📤 Request:', JSON.stringify(request, null, 2));

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

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }

    // Validate new API response structure
    if (!data.data?.workout?.mainWorkout?.exercises || !Array.isArray(data.data.workout.mainWorkout.exercises)) {
      throw new Error('Invalid response structure - missing mainWorkout.exercises array');
    }

    if (!data.data.workout.warmup || !Array.isArray(data.data.workout.warmup)) {
      throw new Error('Invalid response structure - missing warmup array');
    }

    if (!data.data.workout.cooldown || !Array.isArray(data.data.workout.cooldown)) {
      throw new Error('Invalid response structure - missing cooldown array');
    }

    return {
      name: 'Basic Workout Generation',
      success: true,
      duration,
      data: {
        workoutType: data.data.workout.type,
        exerciseCount: data.data.workout.mainWorkout.exercises.length,
        duration: data.data.workout.duration,
        structure: data.data.workout.mainWorkout.structure,
        hasWarmup: data.data.workout.warmup.length > 0,
        hasCooldown: data.data.workout.cooldown.length > 0,
        qualityScore: data.data.metadata?.debug?.professionalStandards?.qualityScore,
        correlationId: data.correlationId
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
 * Test workout generation with additional information
 */
async function testWorkoutWithAdditionalInfo(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const request = {
      age: 30,
      fitnessLevel: 'beginner',
      equipment: ['Bodyweight'],
      goals: ['Weight Loss', 'General Fitness'],
      gender: 'female',
      weight: 140,
      injuries: ['lower_back'],
      timeAvailable: 30,
      daysPerWeek: 3,
      workoutType: 'HIIT - Beginner Friendly',
      otherInformation: 'I prefer low-impact exercises and need modifications for lower back issues. Focus on form over intensity.'
    };

    console.log('🚀 Testing Workout with Additional Info...');
    console.log('📤 Request:', JSON.stringify(request, null, 2));

    const response = await fetch(`${API_BASE_URL}/workout/generate-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'test-user-additional-info'
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }

    return {
      name: 'Workout with Additional Info',
      success: true,
      duration,
      data: {
        workoutType: data.data.workout.type,
        exerciseCount: data.data.workout.mainWorkout.exercises.length,
        coachingTips: data.data.workout.coachingTips?.length || 0,
        correlationId: data.correlationId
      }
    };
  } catch (error) {
    return {
      name: 'Workout with Additional Info',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test workout completion
 */
async function testWorkoutCompletion(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const request = {
      workoutId: 'test-workout-123',
      completed: true,
      completionPercentage: 85,
      actualDuration: 42,
      rating: 4,
      difficulty: 'just_right',
      enjoyment: 4,
      energy: 'medium',
      notes: 'Great workout! Felt challenging but manageable. Would like more core exercises next time.'
    };

    console.log('🚀 Testing Workout Completion...');
    console.log('📤 Request:', JSON.stringify(request, null, 2));

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

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));

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
 * Test API health check
 */
async function testHealthCheck(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Testing Health Check...');

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    console.log('📥 Health Status:', response.status);
    console.log('📥 Health Data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Health check failed'}`);
    }

    return {
      name: 'Health Check',
      success: true,
      duration,
      data: {
        status: data.status,
        message: data.message
      }
    };
  } catch (error) {
    return {
      name: 'Health Check',
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
  console.log('🚀 Starting Localhost API Tests (localhost:8080)\n');
  console.log('='.repeat(60));
  
  const tests = [
    testHealthCheck,
    testBasicWorkoutGeneration,
    testWorkoutWithAdditionalInfo,
    testWorkoutCompletion
  ];

  const results: TestResult[] = [];

  // Run tests sequentially
  for (const test of tests) {
    console.log(`\n🔄 Running ${test.name}...`);
    console.log('-'.repeat(40));
    
    const result = await test();
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.name} - ${result.duration}ms`);
      if (result.data) {
        console.log('📊 Data:', JSON.stringify(result.data, null, 2));
      }
    } else {
      console.log(`❌ ${result.name} - ${result.error}`);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`⏱️  Average Duration: ${Math.round(avgDuration)}ms`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! The API integration is working correctly on localhost:8080.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend server and try again.');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('  • Start the frontend: npm run dev');
  console.log('  • Test the NeuraFit workout generation in the browser');
  console.log('  • Check the browser console for detailed API logs');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };
