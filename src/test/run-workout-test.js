/**
 * Simple Node.js script to test the workout API endpoint
 * Run with: node src/test/run-workout-test.js
 */

const API_BASE_URL = 'https://neurastack-backend-638289111765.us-central1.run.app';

async function testWorkoutAPI() {
  console.log('🏋️ Testing Workout API...\n');

  const testRequest = {
    userMetadata: {
      age: 29, // Required by API
      fitnessLevel: 'beginner',
      // gender: undefined, // Test with "Rather Not Say" option (converted to undefined)
      weight: 154,
      goals: ['lose weight', 'improve cardio'], // These would be converted from LW, IC codes
      equipment: ['body weight'], // This would be converted from BW code
      timeAvailable: 30,
      injuries: []
    },
    workoutHistory: [
      {
        date: '2025-01-10',
        type: 'strength',
        duration: 40,
        exercises: ['squats', 'push_ups', 'lunges'],
        difficulty: 'intermediate',
        rating: 4
      }
    ],
    workoutRequest: 'I want a beginner level workout for 30 minutes focusing on lose weight and improve cardio. I have access to body weight. Please create a personalized workout plan with proper warm-up and cool-down.'
  };

  try {
    console.log('📤 Sending request to:', `${API_BASE_URL}/workout`);
    console.log('📋 Request payload:', JSON.stringify(testRequest, null, 2));

    const response = await fetch(`${API_BASE_URL}/workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'test-user-node',
        'X-Correlation-ID': `test-${Date.now()}`
      },
      body: JSON.stringify(testRequest)
    });

    console.log(`\n📥 Response status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.status === 'success') {
      console.log('\n✅ Workout API Test Results:');
      console.log(`   - Status: ${data.status}`);
      console.log(`   - Workout Type: ${data.data.workout.type}`);
      console.log(`   - Duration: ${data.data.workout.duration}`);
      console.log(`   - Difficulty: ${data.data.workout.difficulty}`);
      console.log(`   - Exercise Count: ${data.data.workout.exercises.length}`);
      console.log(`   - Equipment: ${data.data.workout.equipment.join(', ')}`);
      console.log(`   - Warmup Exercises: ${data.data.workout.warmup.length}`);
      console.log(`   - Cooldown Exercises: ${data.data.workout.cooldown.length}`);
      console.log(`   - Calorie Estimate: ${data.data.workout.calorieEstimate}`);
      console.log(`   - Tags: ${data.data.workout.tags.join(', ')}`);

      console.log('\n📋 Sample Exercise:');
      const sampleExercise = data.data.workout.exercises[0];
      console.log(`   - Name: ${sampleExercise.name}`);
      console.log(`   - Sets: ${sampleExercise.sets}`);
      console.log(`   - Reps: ${sampleExercise.reps}`);
      console.log(`   - Duration: ${sampleExercise.duration}s`);
      console.log(`   - Rest: ${sampleExercise.restTime}s`);
      console.log(`   - Instructions: ${sampleExercise.instructions.substring(0, 100)}...`);
      console.log(`   - Target Muscles: ${sampleExercise.targetMuscles.join(', ')}`);
      console.log(`   - Equipment: ${sampleExercise.equipment.join(', ')}`);
      console.log(`   - Intensity: ${sampleExercise.intensity}`);

      console.log('\n🎉 Workout API test completed successfully!');
    } else {
      console.error('\n❌ Workout API test failed:');
      console.error(`   - Status: ${data.status}`);
      console.error(`   - Message: ${data.message}`);
    }

  } catch (error) {
    console.error('\n❌ Workout API test failed with error:', error.message);
    console.error('   - Check if the API endpoint is accessible');
    console.error('   - Verify network connectivity');
  }
}

// Run the test
testWorkoutAPI().catch(console.error);
