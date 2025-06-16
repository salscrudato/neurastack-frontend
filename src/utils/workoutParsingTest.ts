// Test cases for workout JSON parsing
export const testCases = {
  // Test case 1: Complete valid JSON
  completeJSON: `{
    "name": "Full-Body Strength and Cardio Blast",
    "duration": 30,
    "difficulty": "intermediate",
    "focusAreas": ["full body"],
    "workoutType": "mixed",
    "exercises": [
      {
        "name": "Dumbbell Squat",
        "sets": 3,
        "reps": 12,
        "duration": 0,
        "restTime": 60,
        "instructions": "Stand with feet shoulder-width apart, hold dumbbells at sides. Lower into a squat, keeping chest up.",
        "tips": "Keep knees behind toes.",
        "targetMuscles": ["legs", "glutes"],
        "equipment": ["DB"],
        "intensity": "moderate",
        "progressionNotes": "Increase weight as strength improves."
      }
    ],
    "warmUp": {"duration": 3, "exercises": ["Dynamic stretches"]},
    "coolDown": {"duration": 2, "exercises": ["Static stretches"]},
    "coachingNotes": "Focus on proper form"
  }`,

  // Test case 2: Truncated JSON (like in the error)
  truncatedJSON: `{
    "name": "Full-Body Strength and Cardio Blast",
    "duration": 30,
    "difficulty": "intermediate",
    "focusAreas": ["full body"],
    "workoutType": "mixed",
    "exercises": [
      {
        "name": "Dumbbell Squat",
        "sets": 3,
        "reps": 12,
        "restTime": 60,
        "instructions": "Stand with feet shoulder-width apart, hold dumbbells at sides. Lower into a squat, keeping chest up.",
        "tips": "Keep knees behind toes.",
        "targetMuscles": ["legs", "glutes"],
        "equipment": ["DB"],
        "intensity": "moderate",
        "progressionNotes": "Increase weight as strength improves."
      },
      {
        "name": "Goblet Squat",
        "sets": 3,
        "reps": 10`,

  // Test case 3: Multiple complete exercises with truncation
  multipleExercisesTruncated: `{
    "name": "30-Minute Intermediate Strength & Conditioning",
    "duration": 30,
    "difficulty": "intermediate",
    "focusAreas": ["full body"],
    "workoutType": "mixed",
    "exercises": [
      {
        "name": "Goblet Squats",
        "sets": 3,
        "reps": 10,
        "restTime": 60,
        "instructions": "Hold DB vertically at chest, squat",
        "tips": "Maintain upright torso",
        "targetMuscles": ["legs", "glutes"],
        "equipment": ["DB"],
        "intensity": "moderate",
        "progressionNotes": "Increase DB weight"
      },
      {
        "name": "Push-ups",
        "sets": 3,
        "reps": 12,
        "restTime": 60,
        "instructions": "Standard push-up form",
        "tips": "Keep core tight",
        "targetMuscles": ["chest", "triceps"],
        "equipment": ["bodyweight"],
        "intensity": "moderate",
        "progressionNotes": "Progress to decline"
      },
      {
        "name": "Dumbbell Rows",
        "sets": 3,
        "reps": 10,
        "restTime": 60,
        "instructions": "Bent over row with`,

  // Test case 4: No JSON, just text description
  textOnly: `Here is an intermediate 30-minute workout to help you lose weight and build muscle using dumbbells:

  Dumbbell Squats: 3 sets of 12 reps
  Push-ups: 3 sets of 10 reps  
  Dumbbell Rows: 3 sets of 12 reps
  Plank: 3 sets of 30 seconds
  Lunges: 3 sets of 10 reps each leg
  
  Focus on proper form and controlled movements.`,

  // Test case 5: Mixed format with partial JSON
  mixedFormat: `Here's your workout:
  
  {
    "name": "Full-Body Dumbbell Workout",
    "duration": 30,
    "difficulty": "intermediate",
    "exercises": [
      {
        "name": "Dumbbell Squats",
        "sets": 3,
        "reps": 12,
        "targetMuscles": ["legs", "glutes"]
      }
    ]
  }
  
  Additional exercises:
  - Push-ups: 3x10
  - Plank: 3x30sec`
};

// Helper function to test parsing
export const testWorkoutParsing = (testCase: string, testName: string) => {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log(`📝 Input length: ${testCase.length} characters`);
  
  // This would be called with the actual parsing functions
  // For now, just log the test case structure
  const hasJSON = testCase.includes('{') && testCase.includes('}');
  const hasExercises = testCase.includes('exercises') || /\d+\s*sets?/.test(testCase);
  
  console.log(`📊 Has JSON: ${hasJSON}`);
  console.log(`💪 Has exercises: ${hasExercises}`);
  
  return { hasJSON, hasExercises };
};
