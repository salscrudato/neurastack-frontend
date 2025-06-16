/**
 * Test file for the Workout API integration
 * This file tests the new workout generation endpoint to ensure it works correctly
 */

import { neuraStackClient } from '../lib/neurastack-client';
import type { WorkoutAPIRequest, WorkoutUserMetadata, WorkoutHistoryEntry } from '../lib/types';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://neurastack-backend-638289111765.us-central1.run.app',
  timeout: 30000, // 30 seconds
  userId: 'test-user-workout-api'
};

/**
 * Test the workout API endpoint with sample data
 */
export async function testWorkoutAPI(): Promise<void> {
  console.log('🏋️ Starting Workout API Test...');
  
  try {
    // Configure the client
    neuraStackClient.configure({
      baseUrl: TEST_CONFIG.baseUrl,
      userId: TEST_CONFIG.userId,
      timeout: TEST_CONFIG.timeout
    });

    // Create sample user metadata
    const userMetadata: WorkoutUserMetadata = {
      age: 28,
      fitnessLevel: 'intermediate',
      gender: 'female',
      weight: 65,
      goals: ['strength', 'toning'],
      equipment: ['dumbbells', 'resistance_bands'],
      timeAvailable: 45,
      injuries: []
    };

    // Create sample workout history
    const workoutHistory: WorkoutHistoryEntry[] = [
      {
        date: '2025-01-10',
        type: 'strength',
        duration: 40,
        exercises: ['squats', 'push_ups', 'lunges'],
        difficulty: 'intermediate',
        rating: 4
      },
      {
        date: '2025-01-08',
        type: 'cardio',
        duration: 30,
        exercises: ['jumping_jacks', 'burpees', 'mountain_climbers'],
        difficulty: 'intermediate',
        rating: 5
      }
    ];

    // Create workout request
    const workoutRequest = 'I want a full-body strength workout focusing on upper body and core. I have 45 minutes and want to use dumbbells and resistance bands.';

    // Prepare the API request
    const apiRequest: WorkoutAPIRequest = {
      userMetadata,
      workoutHistory,
      workoutRequest
    };

    console.log('📤 Sending workout API request:', JSON.stringify(apiRequest, null, 2));

    // Call the workout API
    const startTime = performance.now();
    const response = await neuraStackClient.generateWorkout(apiRequest, {
      userId: TEST_CONFIG.userId
    });
    const endTime = performance.now();

    console.log(`⏱️ API call completed in ${endTime - startTime}ms`);
    console.log('📥 Workout API response:', JSON.stringify(response, null, 2));

    // Validate the response
    if (response.status === 'success' && response.data) {
      const workout = response.data.workout;
      
      console.log('✅ Workout API Test Results:');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Workout Type: ${workout.type}`);
      console.log(`   - Duration: ${workout.duration}`);
      console.log(`   - Difficulty: ${workout.difficulty}`);
      console.log(`   - Exercise Count: ${workout.exercises.length}`);
      console.log(`   - Equipment: ${workout.equipment.join(', ')}`);
      console.log(`   - Warmup Exercises: ${workout.warmup.length}`);
      console.log(`   - Cooldown Exercises: ${workout.cooldown.length}`);
      console.log(`   - Calorie Estimate: ${workout.calorieEstimate}`);
      console.log(`   - Tags: ${workout.tags.join(', ')}`);

      // Validate required fields
      const validationErrors: string[] = [];
      
      if (!workout.type) validationErrors.push('Missing workout type');
      if (!workout.duration) validationErrors.push('Missing duration');
      if (!workout.difficulty) validationErrors.push('Missing difficulty');
      if (!workout.exercises || workout.exercises.length === 0) validationErrors.push('Missing exercises');
      if (!workout.warmup || workout.warmup.length === 0) validationErrors.push('Missing warmup');
      if (!workout.cooldown || workout.cooldown.length === 0) validationErrors.push('Missing cooldown');

      // Validate exercise structure
      workout.exercises.forEach((exercise, index) => {
        if (!exercise.name) validationErrors.push(`Exercise ${index + 1}: Missing name`);
        if (typeof exercise.sets !== 'number') validationErrors.push(`Exercise ${index + 1}: Invalid sets`);
        if (typeof exercise.reps !== 'number') validationErrors.push(`Exercise ${index + 1}: Invalid reps`);
        if (!exercise.instructions) validationErrors.push(`Exercise ${index + 1}: Missing instructions`);
        if (!exercise.targetMuscles || exercise.targetMuscles.length === 0) validationErrors.push(`Exercise ${index + 1}: Missing target muscles`);
      });

      if (validationErrors.length > 0) {
        console.error('❌ Validation Errors:');
        validationErrors.forEach(error => console.error(`   - ${error}`));
        throw new Error(`Workout validation failed: ${validationErrors.join(', ')}`);
      }

      console.log('🎉 Workout API test completed successfully!');
      console.log('📋 Sample Exercise:');
      const sampleExercise = workout.exercises[0];
      console.log(`   - Name: ${sampleExercise.name}`);
      console.log(`   - Sets: ${sampleExercise.sets}`);
      console.log(`   - Reps: ${sampleExercise.reps}`);
      console.log(`   - Duration: ${sampleExercise.duration}s`);
      console.log(`   - Rest: ${sampleExercise.restTime}s`);
      console.log(`   - Instructions: ${sampleExercise.instructions.substring(0, 100)}...`);
      console.log(`   - Target Muscles: ${sampleExercise.targetMuscles.join(', ')}`);
      console.log(`   - Equipment: ${sampleExercise.equipment.join(', ')}`);
      console.log(`   - Intensity: ${sampleExercise.intensity}`);

    } else {
      throw new Error(`API returned error: ${response.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('❌ Workout API Test Failed:', error);
    throw error;
  }
}

/**
 * Test with minimal user data to ensure API handles edge cases
 */
export async function testWorkoutAPIMinimal(): Promise<void> {
  console.log('🏋️ Starting Minimal Workout API Test...');
  
  try {
    // Configure the client
    neuraStackClient.configure({
      baseUrl: TEST_CONFIG.baseUrl,
      userId: TEST_CONFIG.userId + '-minimal',
      timeout: TEST_CONFIG.timeout
    });

    // Create minimal user metadata
    const userMetadata: WorkoutUserMetadata = {
      fitnessLevel: 'beginner',
      timeAvailable: 20
    };

    // No workout history
    const workoutHistory: WorkoutHistoryEntry[] = [];

    // Simple workout request
    const workoutRequest = 'I want a quick bodyweight workout for beginners.';

    // Prepare the API request
    const apiRequest: WorkoutAPIRequest = {
      userMetadata,
      workoutHistory,
      workoutRequest
    };

    console.log('📤 Sending minimal workout API request:', JSON.stringify(apiRequest, null, 2));

    // Call the workout API
    const response = await neuraStackClient.generateWorkout(apiRequest, {
      userId: TEST_CONFIG.userId + '-minimal'
    });

    console.log('📥 Minimal workout API response status:', response.status);

    if (response.status === 'success' && response.data) {
      console.log('✅ Minimal Workout API Test passed!');
      console.log(`   - Generated ${response.data.workout.exercises.length} exercises`);
      console.log(`   - Duration: ${response.data.workout.duration}`);
      console.log(`   - Type: ${response.data.workout.type}`);
    } else {
      throw new Error(`Minimal API test failed: ${response.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('❌ Minimal Workout API Test Failed:', error);
    throw error;
  }
}

/**
 * Run all workout API tests
 */
export async function runAllWorkoutAPITests(): Promise<void> {
  console.log('🚀 Running All Workout API Tests...\n');
  
  try {
    await testWorkoutAPI();
    console.log('\n');
    await testWorkoutAPIMinimal();
    console.log('\n✅ All Workout API Tests Passed! 🎉');
  } catch (error) {
    console.error('\n❌ Workout API Tests Failed:', error);
    throw error;
  }
}

// Export for use in browser console or other test runners
if (typeof window !== 'undefined') {
  (window as any).testWorkoutAPI = testWorkoutAPI;
  (window as any).testWorkoutAPIMinimal = testWorkoutAPIMinimal;
  (window as any).runAllWorkoutAPITests = runAllWorkoutAPITests;

  // Auto-run a simple test when loaded
  console.log('🏋️ Workout API Test functions loaded. Run testWorkoutAPI() to test the API.');
}
