/**
 * Workout Response Parsing Tests
 * 
 * Tests for handling truncated and malformed AI responses
 * in the workout generation system.
 */

import { describe, it, expect } from 'vitest';

// Mock the parsing function (would be imported from WorkoutGenerator)
function parseWorkoutResponse(response: string, profile: any) {
  try {
    // Try to extract JSON from the response, handling truncated responses
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      let jsonString = jsonMatch[0];
      
      // Try to fix common truncation issues
      if (!jsonString.endsWith('}')) {
        // Try to find the last complete exercise and close the JSON properly
        const exercisesMatch = jsonString.match(/"exercises":\s*\[([\s\S]*)/);
        if (exercisesMatch) {
          // Find the last complete exercise object
          const exercisesContent = exercisesMatch[1];
          const lastCompleteExercise = exercisesContent.lastIndexOf('},');

          if (lastCompleteExercise > -1) {
            // Reconstruct JSON with complete exercises only
            const completeExercises = exercisesContent.substring(0, lastCompleteExercise + 1);
            const beforeExercises = jsonString.substring(0, jsonString.indexOf('"exercises":'));
            jsonString = beforeExercises +
                        `"exercises": [${completeExercises}], "warmUp": {"duration": 3, "exercises": ["Dynamic stretches"]}, "coolDown": {"duration": 2, "exercises": ["Static stretches"]}, "coachingNotes": "Focus on proper form"}`;
          } else {
            // No complete exercises found, try to close what we have
            const beforeExercises = jsonString.substring(0, jsonString.indexOf('"exercises":'));
            jsonString = beforeExercises +
                        `"exercises": [], "warmUp": {"duration": 3, "exercises": ["Dynamic stretches"]}, "coolDown": {"duration": 2, "exercises": ["Static stretches"]}, "coachingNotes": "Focus on proper form"}`;
          }
        } else {
          // No exercises section found, add minimal structure
          if (jsonString.includes('"name"')) {
            jsonString = jsonString.replace(/,?\s*$/, '') +
                        `, "exercises": [], "warmUp": {"duration": 3, "exercises": ["Dynamic stretches"]}, "coolDown": {"duration": 2, "exercises": ["Static stretches"]}, "coachingNotes": "Focus on proper form"}`;
          }
        }
      }
      
      const workoutData = JSON.parse(jsonString);
      
      // Validate and clean the workout data
      const cleanedExercises = (workoutData.exercises || []).filter((ex: any) =>
        ex && ex.name && ex.sets && (ex.reps || ex.duration)
      ).map((ex: any) => ({
        name: ex.name,
        sets: ex.sets || 3,
        reps: ex.reps || 0,
        duration: ex.duration || 0,
        restTime: ex.restTime || 60,
        instructions: ex.instructions || 'Perform exercise with proper form',
        tips: ex.tips || 'Focus on controlled movements',
        targetMuscles: ex.targetMuscles || ['general'],
        equipment: ex.equipment || ['bodyweight'],
        intensity: ex.intensity || 'moderate',
        progressionNotes: ex.progressionNotes || 'Increase difficulty as you progress'
      }));

      return {
        id: Date.now().toString(),
        name: workoutData.name || 'AI Generated Workout',
        duration: workoutData.duration || profile.availableTime,
        difficulty: workoutData.difficulty || profile.fitnessLevel,
        exercises: cleanedExercises.length > 0 ? cleanedExercises : [],
        focusAreas: workoutData.focusAreas || ['general'],
        workoutType: workoutData.workoutType || 'mixed',
        warmUp: workoutData.warmUp || { duration: 3, exercises: ['Dynamic warm-up'] },
        coolDown: workoutData.coolDown || { duration: 2, exercises: ['Cool-down stretches'] },
        coachingNotes: workoutData.coachingNotes || 'Focus on proper form and listen to your body',
        createdAt: new Date(),
        completedAt: null,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing workout response:', error);
    return null;
  }
}

describe('Workout Response Parsing', () => {
  const mockProfile = {
    fitnessLevel: 'beginner',
    availableTime: 30
  };

  describe('Complete JSON Response', () => {
    it('should parse complete valid JSON response', () => {
      const completeResponse = `{
        "name": "Beginner Full-Body Workout",
        "duration": 30,
        "difficulty": "beginner",
        "focusAreas": ["upper body", "lower body"],
        "workoutType": "mixed",
        "exercises": [
          {
            "name": "Bodyweight Squats",
            "sets": 3,
            "reps": 12,
            "duration": 0,
            "restTime": 60,
            "instructions": "Stand with feet shoulder-width apart",
            "tips": "Keep knees behind toes",
            "targetMuscles": ["quadriceps", "glutes"],
            "equipment": ["bodyweight"],
            "intensity": "moderate",
            "progressionNotes": "Add weights as strength increases"
          }
        ],
        "warmUp": {"duration": 3, "exercises": ["Dynamic stretches"]},
        "coolDown": {"duration": 2, "exercises": ["Static stretches"]},
        "coachingNotes": "Focus on proper form"
      }`;

      const result = parseWorkoutResponse(completeResponse, mockProfile);
      
      expect(result).toBeTruthy();
      expect(result?.name).toBe('Beginner Full-Body Workout');
      expect(result?.exercises).toHaveLength(1);
      expect(result?.exercises[0].name).toBe('Bodyweight Squats');
      expect(result?.focusAreas).toContain('upper body');
      expect(result?.warmUp?.duration).toBe(3);
    });
  });

  describe('Truncated JSON Response', () => {
    it('should handle truncated response at exercise level', () => {
      const truncatedResponse = `{
        "name": "Beginner Full-Body Workout",
        "duration": 30,
        "difficulty": "beginner",
        "focusAreas": ["upper body", "lower body"],
        "workoutType": "mixed",
        "exercises": [
          {
            "name": "Bodyweight Squats",
            "sets": 3,
            "reps": 12,
            "duration": 0,
            "restTime": 60,
            "instructions": "Stand with feet shoulder-width apart",
            "tips": "Keep knees behind toes",
            "targetMuscles": ["quadriceps", "glutes"],
            "equipment": ["bodyweight"],
            "intensity": "moderate",
            "progressionNotes": "Add weights as strength increases"
          },
          {
            "name": "Push-ups",
            "sets": 3,
            "reps": 10`;

      const result = parseWorkoutResponse(truncatedResponse, mockProfile);
      
      expect(result).toBeTruthy();
      expect(result?.name).toBe('Beginner Full-Body Workout');
      expect(result?.exercises).toHaveLength(1); // Only complete exercise
      expect(result?.exercises[0].name).toBe('Bodyweight Squats');
      expect(result?.warmUp).toBeTruthy();
      expect(result?.coolDown).toBeTruthy();
    });

    it('should handle response truncated in middle of JSON', () => {
      const truncatedResponse = `{
        "name": "Beginner Full-Body Workout",
        "duration": 30,
        "difficulty": "beginner",
        "focusAreas": ["upper body"`;

      const result = parseWorkoutResponse(truncatedResponse, mockProfile);
      
      // Should return null for severely truncated responses
      expect(result).toBeNull();
    });
  });

  describe('Malformed JSON Response', () => {
    it('should handle response with extra text around JSON', () => {
      const responseWithText = `Here's your workout plan:
      
      {
        "name": "Beginner Workout",
        "duration": 30,
        "difficulty": "beginner",
        "exercises": [
          {
            "name": "Squats",
            "sets": 3,
            "reps": 12,
            "duration": 0,
            "restTime": 60,
            "instructions": "Squat down",
            "tips": "Keep back straight",
            "targetMuscles": ["legs"],
            "equipment": ["bodyweight"],
            "intensity": "moderate",
            "progressionNotes": "Add weight"
          }
        ],
        "warmUp": {"duration": 3, "exercises": ["stretches"]},
        "coolDown": {"duration": 2, "exercises": ["stretches"]},
        "coachingNotes": "Good form"
      }
      
      This workout is perfect for beginners!`;

      const result = parseWorkoutResponse(responseWithText, mockProfile);
      
      expect(result).toBeTruthy();
      expect(result?.name).toBe('Beginner Workout');
      expect(result?.exercises).toHaveLength(1);
    });

    it('should handle completely invalid JSON', () => {
      const invalidResponse = 'This is not JSON at all, just plain text response.';

      const result = parseWorkoutResponse(invalidResponse, mockProfile);
      
      expect(result).toBeNull();
    });
  });

  describe('Missing Fields Handling', () => {
    it('should fill in missing required fields with defaults', () => {
      const incompleteResponse = `{
        "name": "Basic Workout",
        "exercises": [
          {
            "name": "Squats",
            "sets": 3
          }
        ]
      }`;

      const result = parseWorkoutResponse(incompleteResponse, mockProfile);
      
      expect(result).toBeTruthy();
      expect(result?.duration).toBe(30); // From profile
      expect(result?.difficulty).toBe('beginner'); // From profile
      expect(result?.exercises[0].reps).toBe(0); // Default
      expect(result?.exercises[0].restTime).toBe(60); // Default
      expect(result?.exercises[0].instructions).toBe('Perform exercise with proper form'); // Default
      expect(result?.focusAreas).toEqual(['general']); // Default
      expect(result?.warmUp).toBeTruthy(); // Default
      expect(result?.coolDown).toBeTruthy(); // Default
    });
  });

  describe('Exercise Validation', () => {
    it('should filter out invalid exercises', () => {
      const responseWithInvalidExercises = `{
        "name": "Mixed Workout",
        "exercises": [
          {
            "name": "Valid Exercise",
            "sets": 3,
            "reps": 12,
            "instructions": "Do the exercise",
            "tips": "Good form",
            "targetMuscles": ["legs"]
          },
          {
            "name": "",
            "sets": 0
          },
          {
            "sets": 3,
            "reps": 10
          },
          {
            "name": "Another Valid Exercise",
            "sets": 2,
            "duration": 30,
            "instructions": "Hold position",
            "tips": "Stay steady",
            "targetMuscles": ["core"]
          }
        ]
      }`;

      const result = parseWorkoutResponse(responseWithInvalidExercises, mockProfile);
      
      expect(result).toBeTruthy();
      expect(result?.exercises).toHaveLength(2); // Only valid exercises
      expect(result?.exercises[0].name).toBe('Valid Exercise');
      expect(result?.exercises[1].name).toBe('Another Valid Exercise');
    });
  });
});
