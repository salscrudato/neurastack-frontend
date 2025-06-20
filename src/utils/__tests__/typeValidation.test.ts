import {
  isValidWorkoutType,
  isValidFitnessLevel,
  isValidGender,
  isValidAgeCategory,
  isValidWeightCategory,
  isValidEquipmentCode,
  isValidGoalCode,
  validateFitnessProfile,
  validateWorkoutPlan,
  validateExercise,
  sanitizeUserInput,
  validateWorkoutTypeSelection
} from '../typeValidation';

describe('Type Validation Utilities', () => {
  describe('Type Guards', () => {
    test('isValidWorkoutType should validate workout types correctly', () => {
      expect(isValidWorkoutType('strength')).toBe(true);
      expect(isValidWorkoutType('cardio')).toBe(true);
      expect(isValidWorkoutType('yoga')).toBe(true);
      expect(isValidWorkoutType('pilates')).toBe(true);
      expect(isValidWorkoutType('functional')).toBe(true);
      expect(isValidWorkoutType('invalid')).toBe(false);
      expect(isValidWorkoutType('')).toBe(false);
    });

    test('isValidFitnessLevel should validate fitness levels correctly', () => {
      expect(isValidFitnessLevel('beginner')).toBe(true);
      expect(isValidFitnessLevel('intermediate')).toBe(true);
      expect(isValidFitnessLevel('advanced')).toBe(true);
      expect(isValidFitnessLevel('expert')).toBe(false);
      expect(isValidFitnessLevel('')).toBe(false);
    });

    test('isValidGender should validate gender options correctly', () => {
      expect(isValidGender('male')).toBe(true);
      expect(isValidGender('female')).toBe(true);
      expect(isValidGender('rather_not_say')).toBe(true);
      expect(isValidGender('other')).toBe(false);
      expect(isValidGender('')).toBe(false);
    });

    test('isValidAgeCategory should validate age categories correctly', () => {
      expect(isValidAgeCategory('TEEN')).toBe(true);
      expect(isValidAgeCategory('YOUNG_ADULT')).toBe(true);
      expect(isValidAgeCategory('SENIOR')).toBe(true);
      expect(isValidAgeCategory('INVALID')).toBe(false);
    });

    test('isValidEquipmentCode should validate equipment codes correctly', () => {
      expect(isValidEquipmentCode('BW')).toBe(true);
      expect(isValidEquipmentCode('DB')).toBe(true);
      expect(isValidEquipmentCode('BB')).toBe(true);
      expect(isValidEquipmentCode('INVALID')).toBe(false);
    });

    test('isValidGoalCode should validate goal codes correctly', () => {
      expect(isValidGoalCode('LW')).toBe(true);
      expect(isValidGoalCode('BM')).toBe(true);
      expect(isValidGoalCode('IC')).toBe(true);
      expect(isValidGoalCode('INVALID')).toBe(false);
    });
  });

  describe('Fitness Profile Validation', () => {
    test('should validate complete fitness profile', () => {
      const validProfile = {
        fitnessLevel: 'intermediate' as const,
        goals: ['LW', 'BM'] as const,
        equipment: ['BW', 'DB'] as const,
        availableTime: 30,
        gender: 'male' as const,
        ageCategory: 'ADULT' as const,
        weightCategory: 'MEDIUM' as const
      };

      const result = validateFitnessProfile(validProfile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const incompleteProfile = {
        fitnessLevel: 'intermediate' as const
        // Missing goals, equipment, availableTime
      };

      const result = validateFitnessProfile(incompleteProfile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one fitness goal is required');
      expect(result.errors).toContain('At least one equipment option is required');
      expect(result.errors).toContain('Available time must be greater than 0');
    });

    test('should detect invalid field values', () => {
      const invalidProfile = {
        fitnessLevel: 'expert' as any,
        goals: ['INVALID'] as any,
        equipment: ['INVALID'] as any,
        availableTime: 30,
        gender: 'other' as any,
        ageCategory: 'INVALID' as any
      };

      const result = validateFitnessProfile(invalidProfile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid fitness level: expert');
      expect(result.errors).toContain('Invalid goal codes: INVALID');
      expect(result.errors).toContain('Invalid equipment codes: INVALID');
      expect(result.errors).toContain('Invalid gender: other');
      expect(result.errors).toContain('Invalid age category: INVALID');
    });

    test('should generate warnings for edge cases', () => {
      const edgeCaseProfile = {
        fitnessLevel: 'advanced' as const,
        goals: ['LW'] as const,
        equipment: ['BW'] as const,
        availableTime: 5, // Very short
        injuries: ['knee pain'] // Has injuries
      };

      const result = validateFitnessProfile(edgeCaseProfile);
      expect(result.warnings).toContain('Very short workout time may limit exercise options');
      expect(result.warnings).toContain('Advanced fitness level with injuries - ensure proper modifications');
    });
  });

  describe('Workout Plan Validation', () => {
    test('should validate complete workout plan', () => {
      const validWorkout = {
        name: 'Test Workout',
        duration: 30,
        difficulty: 'intermediate' as const,
        workoutType: 'strength' as const,
        exercises: [
          {
            name: 'Push-ups',
            sets: 3,
            reps: 10,
            duration: 60,
            restTime: 30,
            instructions: 'Keep your body straight',
            targetMuscles: ['chest', 'triceps']
          }
        ]
      };

      const result = validateWorkoutPlan(validWorkout);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const incompleteWorkout = {
        // Missing name, duration, difficulty, exercises
      };

      const result = validateWorkoutPlan(incompleteWorkout);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Workout name is required');
      expect(result.errors).toContain('Workout duration must be greater than 0');
      expect(result.errors).toContain('Valid difficulty level is required');
      expect(result.errors).toContain('At least one exercise is required');
    });

    test('should validate exercises within workout', () => {
      const workoutWithInvalidExercise = {
        name: 'Test Workout',
        duration: 30,
        difficulty: 'intermediate' as const,
        exercises: [
          {
            name: '', // Invalid: empty name
            sets: 0, // Invalid: zero sets
            reps: 0, // Invalid: zero reps
            duration: -1, // Invalid: negative duration
            restTime: -1, // Invalid: negative rest time
            instructions: '', // Invalid: empty instructions
            targetMuscles: [] // Warning: no target muscles
          }
        ]
      };

      const result = validateWorkoutPlan(workoutWithInvalidExercise);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Exercise 1: Exercise name is required');
      expect(result.errors).toContain('Exercise 1: Sets must be greater than 0');
      expect(result.errors).toContain('Exercise 1: Reps must be greater than 0');
    });
  });

  describe('Exercise Validation', () => {
    test('should validate complete exercise', () => {
      const validExercise = {
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        duration: 60,
        restTime: 30,
        instructions: 'Keep your body straight',
        targetMuscles: ['chest', 'triceps']
      };

      const result = validateExercise(validExercise);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should generate warnings for extreme values', () => {
      const extremeExercise = {
        name: 'Extreme Exercise',
        sets: 15, // Very high
        reps: 100, // Very high
        duration: 60,
        restTime: 400, // Very long
        instructions: 'Do the exercise',
        targetMuscles: ['chest']
      };

      const result = validateExercise(extremeExercise);
      expect(result.warnings).toContain('Very high number of sets - ensure adequate recovery');
      expect(result.warnings).toContain('Very high number of reps - consider reducing for strength focus');
      expect(result.warnings).toContain('Very long rest time - may extend workout duration significantly');
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize user input', () => {
      expect(sanitizeUserInput('  normal text  ')).toBe('normal text');
      expect(sanitizeUserInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeUserInput('text with > and < symbols')).toBe('text with  and  symbols');
      
      // Test length limiting
      const longText = 'a'.repeat(2000);
      const sanitized = sanitizeUserInput(longText);
      expect(sanitized.length).toBe(1000);
    });

    test('should validate and sanitize workout type selection', () => {
      expect(validateWorkoutTypeSelection('strength')).toBe('strength');
      expect(validateWorkoutTypeSelection('STRENGTH')).toBe('strength');
      expect(validateWorkoutTypeSelection('  cardio  ')).toBe('cardio');
      expect(validateWorkoutTypeSelection('invalid')).toBe(null);
      expect(validateWorkoutTypeSelection('<script>strength</script>')).toBe(null);
    });
  });
});
