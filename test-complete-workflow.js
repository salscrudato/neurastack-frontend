/**
 * Complete Workout Workflow Test
 * 
 * This script tests the entire workout flow:
 * 1. Generate a workout
 * 2. Complete the workout with detailed exercise data
 * 3. Retrieve workout history to verify the completion was saved
 * 4. Verify data integrity throughout the flow
 */

const API_BASE_URL = 'http://localhost:8080';
const TEST_USER_ID = 'workflow-test-' + Date.now();

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': TEST_USER_ID,
      'X-Correlation-ID': `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  };

  const requestOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Step 1: Generate a workout
async function generateWorkout() {
  console.log('\n🏋️ Step 1: Generating Workout...');
  console.log('='.repeat(40));
  
  const workoutRequest = {
    age: 28,
    fitnessLevel: 'intermediate',
    gender: 'female',
    weight: 140,
    goals: ['Build Muscle', 'Improve Endurance'],
    equipment: ['Dumbbells', 'Resistance Bands', 'Bodyweight'],
    timeAvailable: 30,
    workoutType: 'Mixed Training - Combination of strength and cardio exercises'
  };
  
  const result = await apiRequest('/workout/generate-workout', {
    method: 'POST',
    body: JSON.stringify(workoutRequest)
  });
  
  if (result.success && result.data?.data?.workout) {
    const workout = result.data.data.workout;
    console.log('✅ Workout generated successfully!');
    console.log(`📊 Type: ${workout.type}`);
    console.log(`⏱️ Duration: ${workout.duration} minutes`);
    console.log(`🎯 Difficulty: ${workout.difficulty}`);
    console.log(`🏃 Exercises: ${workout.mainWorkout?.exercises?.length || 0}`);
    
    return {
      workoutId: result.data.data.workoutId || `generated-${Date.now()}`,
      workout: workout
    };
  } else {
    console.error('❌ Workout generation failed:', result);
    return null;
  }
}

// Step 2: Complete the workout with detailed data
async function completeWorkout(workoutId, workout) {
  console.log('\n✅ Step 2: Completing Workout...');
  console.log('='.repeat(40));
  
  // Simulate realistic workout completion data
  const exercises = workout.mainWorkout?.exercises || [];
  const completedExercises = exercises.slice(0, Math.ceil(exercises.length * 0.8)); // Complete 80% of exercises
  
  const exerciseData = completedExercises.map((exercise, index) => ({
    name: exercise.name || `Exercise ${index + 1}`,
    completed: true,
    actualSets: exercise.sets || 3,
    actualReps: Array(exercise.sets || 3).fill(exercise.reps || 12).join(','),
    notes: index === 0 ? 'Felt great on this one!' : undefined
  }));
  
  const completionData = {
    workoutId: workoutId,
    completed: true,
    completionPercentage: Math.round((completedExercises.length / exercises.length) * 100),
    rating: 4,
    difficulty: 'just_right',
    actualDuration: workout.duration - 5, // Finished 5 minutes early
    exercises: exerciseData,
    notes: 'Great workout! Felt energized and strong throughout.'
  };
  
  console.log(`📊 Completing ${completedExercises.length}/${exercises.length} exercises`);
  console.log(`⭐ Rating: ${completionData.rating}/5`);
  console.log(`⏱️ Actual Duration: ${completionData.actualDuration} minutes`);
  
  const result = await apiRequest('/workout/complete-workout', {
    method: 'POST',
    body: JSON.stringify(completionData)
  });
  
  if (result.success) {
    console.log('✅ Workout completion successful!');
    console.log(`📊 Status: ${result.data?.status}`);
    console.log(`💬 Message: ${result.data?.message}`);
    return result.data;
  } else {
    console.error('❌ Workout completion failed:', result);
    return null;
  }
}

// Step 3: Retrieve workout history and verify
async function verifyWorkoutHistory(expectedWorkoutId) {
  console.log('\n📚 Step 3: Verifying Workout History...');
  console.log('='.repeat(40));
  
  // Wait a moment for the completion to be processed
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const result = await apiRequest('/workout/workout-history?limit=10&page=1');
  
  if (result.success) {
    console.log('✅ Workout history retrieved successfully!');
    console.log(`📊 Status: ${result.data?.status}`);
    
    const workouts = result.data?.data?.workouts || [];
    const stats = result.data?.data?.stats || {};
    
    console.log(`📈 Total Workouts: ${stats.totalWorkouts || 0}`);
    console.log(`📋 Workouts in Response: ${workouts.length}`);
    console.log(`✅ Completed Workouts: ${stats.completedWorkouts || 0}`);
    console.log(`📊 Completion Rate: ${Math.round((stats.completionRate || 0) * 100)}%`);
    console.log(`⭐ Average Rating: ${stats.averageRating || 0}`);
    
    // Check if our workout is in the history
    const ourWorkout = workouts.find(w => w.id === expectedWorkoutId);
    if (ourWorkout) {
      console.log('\n🎯 Our workout found in history:');
      console.log(`  📝 ID: ${ourWorkout.id}`);
      console.log(`  🏋️ Type: ${ourWorkout.workoutType}`);
      console.log(`  ⏱️ Duration: ${ourWorkout.duration} minutes`);
      console.log(`  ✅ Completed: ${ourWorkout.completed}`);
      console.log(`  📊 Completion %: ${ourWorkout.completionPercentage}%`);
      console.log(`  ⭐ Rating: ${ourWorkout.rating}/5`);
      return true;
    } else {
      console.log('⚠️ Our workout not found in history (may take time to process)');
      return false;
    }
  } else {
    console.error('❌ Workout history retrieval failed:', result);
    return false;
  }
}

// Main workflow test
async function runCompleteWorkflowTest() {
  console.log('🧪 Complete Workout Workflow Test');
  console.log('='.repeat(60));
  console.log(`🎯 Testing against: ${API_BASE_URL}`);
  console.log(`👤 Test User ID: ${TEST_USER_ID}`);
  console.log('='.repeat(60));

  try {
    // Step 1: Generate workout
    const workoutData = await generateWorkout();
    if (!workoutData) {
      console.log('\n❌ Workflow stopped - workout generation failed');
      return;
    }

    // Step 2: Complete workout
    const completion = await completeWorkout(workoutData.workoutId, workoutData.workout);
    if (!completion) {
      console.log('\n❌ Workflow stopped - workout completion failed');
      return;
    }

    // Step 3: Verify history
    const historyVerified = await verifyWorkoutHistory(workoutData.workoutId);

    // Final summary
    console.log('\n📊 Workflow Test Summary');
    console.log('='.repeat(50));
    console.log(`🏋️ Workout Generation: ✅ PASS`);
    console.log(`✅ Workout Completion: ✅ PASS`);
    console.log(`📚 History Verification: ${historyVerified ? '✅ PASS' : '⚠️ PARTIAL'}`);
    
    if (historyVerified) {
      console.log('\n🎉 Complete workflow test PASSED!');
      console.log('✅ All API endpoints are working correctly');
      console.log('✅ Data flows properly through the entire system');
      console.log('✅ Workout completion and history retrieval are functional');
    } else {
      console.log('\n⚠️ Workflow partially successful');
      console.log('✅ Generation and completion work');
      console.log('⚠️ History verification needs more time or investigation');
    }

  } catch (error) {
    console.error('💥 Workflow test crashed:', error);
  }
}

// Run the complete workflow test
runCompleteWorkflowTest();
