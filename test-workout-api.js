/**
 * Test script to verify NeuraStack Workout API endpoints
 * 
 * This script tests the complete workout flow:
 * 1. Generate a workout
 * 2. Complete the workout with detailed data
 * 3. Retrieve workout history
 */

// Test configuration
const API_BASE_URL = 'http://localhost:8080';
const TEST_USER_ID = 'test-user-' + Date.now();

// Test data
const testWorkoutRequest = {
  age: 30,
  fitnessLevel: 'intermediate',
  gender: 'male',
  weight: 175,
  goals: ['Build Muscle', 'Increase Strength'],
  equipment: ['Dumbbells', 'Resistance Bands'],
  timeAvailable: 45,
  workoutType: 'Strength Training - Focus on building muscle mass and increasing overall strength'
};

const testCompletionData = {
  workoutId: '', // Will be set after workout generation
  completed: true,
  completionPercentage: 85,
  rating: 4,
  difficulty: 'just_right',
  actualDuration: 42,
  exercises: [
    {
      name: 'Push-ups',
      completed: true,
      actualSets: 3,
      actualReps: '12,10,8',
      notes: 'Felt strong today'
    },
    {
      name: 'Squats',
      completed: true,
      actualSets: 3,
      actualReps: '15,12,10'
    }
  ],
  notes: 'Great workout! Felt energized throughout.'
};

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': TEST_USER_ID,
      'X-Correlation-ID': `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  };

  const requestOptions = { ...defaultOptions, ...options };
  
  console.log(`🚀 Making request to: ${url}`);
  console.log(`📋 Method: ${requestOptions.method}`);
  console.log(`🔧 Headers:`, requestOptions.headers);
  if (requestOptions.body) {
    console.log(`📦 Body:`, JSON.parse(requestOptions.body));
  }

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    
    console.log(`✅ Response Status: ${response.status}`);
    console.log(`📥 Response Data:`, data);
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`❌ Request failed:`, error);
    return { success: false, error: error.message };
  }
}

// Test functions
async function testWorkoutGeneration() {
  console.log('\n🏋️ Testing Workout Generation...');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/workout/generate-workout', {
    method: 'POST',
    body: JSON.stringify(testWorkoutRequest)
  });
  
  if (result.success && result.data?.data?.workout) {
    console.log('✅ Workout generation successful!');
    console.log(`📊 Workout Type: ${result.data.data.workout.type}`);
    console.log(`⏱️ Duration: ${result.data.data.workout.duration} minutes`);
    console.log(`🎯 Difficulty: ${result.data.data.workout.difficulty}`);
    console.log(`🏃 Exercises: ${result.data.data.workout.mainWorkout?.exercises?.length || 0}`);
    
    // Set workout ID for completion test
    testCompletionData.workoutId = result.data.data.workout.id || `generated-${Date.now()}`;
    return result.data.data.workout;
  } else {
    console.error('❌ Workout generation failed:', result);
    return null;
  }
}

async function testWorkoutCompletion() {
  console.log('\n✅ Testing Workout Completion...');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/workout/complete-workout', {
    method: 'POST',
    body: JSON.stringify(testCompletionData)
  });
  
  if (result.success) {
    console.log('✅ Workout completion successful!');
    console.log(`📊 Status: ${result.data?.status}`);
    console.log(`💬 Message: ${result.data?.message}`);
    console.log(`🔗 Correlation ID: ${result.data?.correlationId}`);
    return result.data;
  } else {
    console.error('❌ Workout completion failed:', result);
    return null;
  }
}

async function testWorkoutHistory() {
  console.log('\n📚 Testing Workout History...');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/workout/workout-history?limit=10&page=1');
  
  if (result.success) {
    console.log('✅ Workout history retrieval successful!');
    console.log(`📊 Status: ${result.data?.status}`);
    console.log(`📈 Total Workouts: ${result.data?.data?.totalCount || 0}`);
    console.log(`📄 Current Page: ${result.data?.data?.page || 1}`);
    console.log(`📋 Workouts in Response: ${result.data?.data?.workouts?.length || 0}`);
    
    if (result.data?.data?.workouts?.length > 0) {
      console.log('\n📋 Recent Workouts:');
      result.data.data.workouts.slice(0, 3).forEach((workout, index) => {
        console.log(`  ${index + 1}. ${workout.workoutType} - ${workout.duration}min (${workout.completedAt})`);
      });
    }
    
    return result.data;
  } else {
    console.error('❌ Workout history retrieval failed:', result);
    return null;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 NeuraStack Workout API Test Suite');
  console.log('='.repeat(60));
  console.log(`🎯 Testing against: ${API_BASE_URL}`);
  console.log(`👤 Test User ID: ${TEST_USER_ID}`);
  console.log('='.repeat(60));

  try {
    // Test 1: Generate a workout
    const workout = await testWorkoutGeneration();
    if (!workout) {
      console.log('\n❌ Test suite stopped - workout generation failed');
      return;
    }

    // Wait a moment before completion
    console.log('\n⏳ Waiting 2 seconds before completion test...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Complete the workout
    const completion = await testWorkoutCompletion();
    if (!completion) {
      console.log('\n⚠️ Workout completion failed, but continuing with history test...');
    }

    // Wait a moment before history retrieval
    console.log('\n⏳ Waiting 2 seconds before history test...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Retrieve workout history
    const history = await testWorkoutHistory();

    // Summary
    console.log('\n📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`🏋️ Workout Generation: ${workout ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✅ Workout Completion: ${completion ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📚 Workout History: ${history ? '✅ PASS' : '❌ FAIL'}`);
    
    const passCount = [workout, completion, history].filter(Boolean).length;
    console.log(`\n🎯 Overall Result: ${passCount}/3 tests passed`);
    
    if (passCount === 3) {
      console.log('🎉 All tests passed! API integration is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the logs above for details.');
    }

  } catch (error) {
    console.error('💥 Test suite crashed:', error);
  }
}

// Run the tests
runTests();
