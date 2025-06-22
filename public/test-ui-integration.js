/**
 * Browser Console Test for NeuraStack Workout UI Integration
 * 
 * Run this in the browser console to test the complete workout flow:
 * 1. Test NeuraStackClient initialization
 * 2. Test workout completion API call
 * 3. Test workout history API call
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter to run
 */

(async function testWorkoutUIIntegration() {
  console.log('🧪 NeuraStack UI Integration Test');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Check if NeuraStackClient is available
    console.log('\n1️⃣ Testing NeuraStackClient availability...');
    
    // Try to access the client from window or create a new one
    let client;
    if (window.neuraStackClient) {
      client = window.neuraStackClient;
      console.log('✅ Found existing NeuraStackClient instance');
    } else {
      console.log('⚠️ No existing client found, creating new instance...');
      // This would require the NeuraStackClient to be available globally
      console.log('❌ Cannot create client - not available in global scope');
      console.log('💡 This test should be run from within the React app context');
      return;
    }
    
    // Test 2: Test workout completion
    console.log('\n2️⃣ Testing workout completion API...');
    
    const testCompletionData = {
      workoutId: `ui-test-${Date.now()}`,
      completed: true,
      completionPercentage: 90,
      rating: 5,
      difficulty: 'just_right',
      actualDuration: 35,
      exercises: [
        {
          name: 'UI Test Push-ups',
          completed: true,
          actualSets: 3,
          actualReps: '15,12,10',
          notes: 'UI integration test'
        },
        {
          name: 'UI Test Squats',
          completed: true,
          actualSets: 3,
          actualReps: '20,18,15'
        }
      ],
      notes: 'UI integration test workout completion'
    };
    
    try {
      const completionResult = await client.completeWorkout(testCompletionData, {
        userId: 'ui-test-user-' + Date.now()
      });
      
      console.log('✅ Workout completion successful!');
      console.log('📊 Response:', completionResult);
    } catch (error) {
      console.error('❌ Workout completion failed:', error);
    }
    
    // Test 3: Test workout history retrieval
    console.log('\n3️⃣ Testing workout history API...');
    
    try {
      const historyResult = await client.getWorkoutHistory({
        limit: 5,
        page: 1,
        userId: 'ui-test-user-' + Date.now(),
        includeDetails: true,
        includeIncomplete: true
      });
      
      console.log('✅ Workout history retrieval successful!');
      console.log('📊 Response:', historyResult);
      console.log(`📈 Total workouts: ${historyResult.data?.totalCount || 0}`);
      console.log(`📋 Workouts in response: ${historyResult.data?.workouts?.length || 0}`);
    } catch (error) {
      console.error('❌ Workout history retrieval failed:', error);
    }
    
    console.log('\n🎉 UI Integration test completed!');
    console.log('Check the logs above for detailed results.');
    
  } catch (error) {
    console.error('💥 Test suite crashed:', error);
  }
})();

// Alternative test function that can be called manually
window.testWorkoutIntegration = async function() {
  console.log('🔧 Manual Workout Integration Test');
  
  // This function can be called from React components or browser console
  // when the NeuraStackClient is available in the component context
  
  const testData = {
    workoutId: `manual-test-${Date.now()}`,
    completed: true,
    completionPercentage: 95,
    rating: 4,
    difficulty: 'just_right',
    actualDuration: 40,
    exercises: [
      {
        name: 'Manual Test Exercise',
        completed: true,
        actualSets: 2,
        actualReps: '10,8'
      }
    ]
  };
  
  console.log('📤 Test data:', testData);
  console.log('💡 Use this data to test workout completion in your React components');
  
  return testData;
};

console.log('🚀 Workout UI Integration Test Script Loaded');
console.log('💡 Run window.testWorkoutIntegration() for manual testing');
