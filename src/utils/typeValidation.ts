import type { Exercise, FitnessProfile, WorkoutPlan } from '../lib/types';

// Strict workout type validation - updated to match new workout types specification
export const VALID_WORKOUT_TYPES = [
  // Primary workout types in order of preference
  'mixed', 'strength', 'hiit', 'cardio', 'flexibility',
  'push', 'pull', 'lower_body', 'core',
  // Additional variations that the API might return for backward compatibility
  'upper_body', 'full_body', 'yoga', 'pilates', 'functional',
  'push_day', 'pull_day', 'leg_day', 'upper', 'lower', 'legs',
  'chest', 'back', 'shoulders', 'arms', 'abs'
] as const;

export type ValidWorkoutType = typeof VALID_WORKOUT_TYPES[number];

export const VALID_FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type ValidFitnessLevel = typeof VALID_FITNESS_LEVELS[number];

export const VALID_GENDERS = ['male', 'female', 'rather_not_say'] as const;
export type ValidGender = typeof VALID_GENDERS[number];

export const VALID_AGE_CATEGORIES = [
  'TEEN', 'YOUNG_ADULT', 'ADULT', 'MIDDLE_ADULT', 
  'MATURE_ADULT', 'SENIOR_ADULT', 'SENIOR'
] as const;
export type ValidAgeCategory = typeof VALID_AGE_CATEGORIES[number];

export const VALID_WEIGHT_CATEGORIES = [
  'LIGHT', 'MODERATE_LIGHT', 'MODERATE', 'MODERATE_HEAVY', 'HEAVY', 'VERY_HEAVY'
] as const;
export type ValidWeightCategory = typeof VALID_WEIGHT_CATEGORIES[number];

export const VALID_EQUIPMENT_LABELS = [
  'Body Weight', 'Dumbbells', 'Barbell', 'Kettlebells', 'Resistance Bands', 'Treadmill', 'Exercise Bike', 'Yoga Mat'
] as const;
export type ValidEquipmentLabel = typeof VALID_EQUIPMENT_LABELS[number];

// Legacy equipment codes for backward compatibility
export const LEGACY_EQUIPMENT_CODES = [
  'BW', 'DB', 'BB', 'KB', 'RB', 'TM', 'BK', 'YM'
] as const;
export type LegacyEquipmentCode = typeof LEGACY_EQUIPMENT_CODES[number];

export const VALID_GOAL_CODES = ['LW', 'BM', 'IC', 'GF', 'AP'] as const;
export type ValidGoalCode = typeof VALID_GOAL_CODES[number];

/**
 * Type guards for runtime validation
 */
export const isValidWorkoutType = (type: string): type is ValidWorkoutType => {
  return VALID_WORKOUT_TYPES.includes(type as ValidWorkoutType);
};

export const isValidFitnessLevel = (level: string): level is ValidFitnessLevel => {
  return VALID_FITNESS_LEVELS.includes(level as ValidFitnessLevel);
};

export const isValidGender = (gender: string): gender is ValidGender => {
  return VALID_GENDERS.includes(gender as ValidGender);
};

export const isValidAgeCategory = (category: string): category is ValidAgeCategory => {
  return VALID_AGE_CATEGORIES.includes(category as ValidAgeCategory);
};

export const isValidWeightCategory = (category: string): category is ValidWeightCategory => {
  return VALID_WEIGHT_CATEGORIES.includes(category as ValidWeightCategory);
};

export const isValidEquipmentLabel = (label: string): label is ValidEquipmentLabel => {
  return VALID_EQUIPMENT_LABELS.includes(label as ValidEquipmentLabel);
};

export const isLegacyEquipmentCode = (code: string): code is LegacyEquipmentCode => {
  return LEGACY_EQUIPMENT_CODES.includes(code as LegacyEquipmentCode);
};

// Combined validation for both new labels and legacy codes
export const isValidEquipment = (equipment: string): boolean => {
  return isValidEquipmentLabel(equipment) || isLegacyEquipmentCode(equipment);
};

export const isValidGoalCode = (code: string): code is ValidGoalCode => {
  return VALID_GOAL_CODES.includes(code as ValidGoalCode);
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Comprehensive fitness profile validation
 */
export const validateFitnessProfile = (profile: Partial<FitnessProfile>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!profile.fitnessLevel) {
    errors.push('Fitness level is required');
  } else if (!isValidFitnessLevel(profile.fitnessLevel)) {
    errors.push(`Invalid fitness level: ${profile.fitnessLevel}`);
  }

  if (!profile.goals || profile.goals.length === 0) {
    errors.push('At least one fitness goal is required');
  } else {
    const invalidGoals = profile.goals.filter(goal => !isValidGoalCode(goal));
    if (invalidGoals.length > 0) {
      errors.push(`Invalid goal codes: ${invalidGoals.join(', ')}`);
    }
  }

  if (!profile.equipment || profile.equipment.length === 0) {
    errors.push('At least one equipment option is required');
  } else {
    const invalidEquipment = profile.equipment.filter(eq => !isValidEquipment(eq));
    if (invalidEquipment.length > 0) {
      errors.push(`Invalid equipment: ${invalidEquipment.join(', ')}`);
    }
  }

  if (!profile.availableTime || profile.availableTime <= 0) {
    errors.push('Available time must be greater than 0');
  } else if (profile.availableTime < 10) {
    warnings.push('Very short workout time may limit exercise options');
  } else if (profile.availableTime > 120) {
    warnings.push('Very long workout time - consider breaking into multiple sessions');
  }

  // Optional but validated fields
  if (profile.gender && !isValidGender(profile.gender)) {
    errors.push(`Invalid gender: ${profile.gender}`);
  }

  if (profile.ageCategory && !isValidAgeCategory(profile.ageCategory)) {
    errors.push(`Invalid age category: ${profile.ageCategory}`);
  }

  if (profile.weightCategory && !isValidWeightCategory(profile.weightCategory)) {
    errors.push(`Invalid weight category: ${profile.weightCategory}`);
  }

  // Logical validations
  if (profile.injuries && profile.injuries.length > 0 && profile.fitnessLevel === 'advanced') {
    warnings.push('Advanced fitness level with injuries - ensure proper modifications');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Workout plan validation
 */
export const validateWorkoutPlan = (workout: Partial<WorkoutPlan>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!workout.name || workout.name.trim().length === 0) {
    errors.push('Workout name is required');
  }

  if (!workout.duration || workout.duration <= 0) {
    errors.push('Workout duration must be greater than 0');
  }

  if (!workout.difficulty || !isValidFitnessLevel(workout.difficulty)) {
    errors.push('Valid difficulty level is required');
  }

  if (!workout.exercises || workout.exercises.length === 0) {
    errors.push('At least one exercise is required');
  } else {
    // Validate each exercise
    workout.exercises.forEach((exercise, index) => {
      const exerciseValidation = validateExercise(exercise);
      if (!exerciseValidation.isValid) {
        errors.push(`Exercise ${index + 1}: ${exerciseValidation.errors.join(', ')}`);
      }
      warnings.push(...exerciseValidation.warnings.map(w => `Exercise ${index + 1}: ${w}`));
    });
  }

  if (workout.workoutType && !isValidWorkoutType(workout.workoutType)) {
    errors.push(`Invalid workout type: ${workout.workoutType}`);
  }

  // Logical validations
  if (workout.duration && workout.exercises) {
    const totalExerciseTime = workout.exercises.reduce((total, ex) => {
      return total + (ex.sets * ex.duration) + (ex.sets * ex.restTime);
    }, 0);

    if (totalExerciseTime > (workout.duration * 60 * 1.2)) { // 20% buffer
      warnings.push('Total exercise time may exceed planned workout duration');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Exercise validation
 */
export const validateExercise = (exercise: Partial<Exercise>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!exercise.name || exercise.name.trim().length === 0) {
    errors.push('Exercise name is required');
  }

  if (exercise.sets === undefined || exercise.sets <= 0) {
    errors.push('Sets must be greater than 0');
  } else if (exercise.sets > 10) {
    warnings.push('Very high number of sets - ensure adequate recovery');
  }

  if (exercise.reps === undefined || exercise.reps <= 0) {
    errors.push('Reps must be greater than 0');
  } else if (exercise.reps > 50) {
    warnings.push('Very high number of reps - consider reducing for strength focus');
  }

  if (exercise.duration === undefined || exercise.duration < 0) {
    errors.push('Duration must be 0 or greater');
  }

  if (exercise.restTime === undefined || exercise.restTime < 0) {
    errors.push('Rest time must be 0 or greater');
  } else if (exercise.restTime > 300) { // 5 minutes
    warnings.push('Very long rest time - may extend workout duration significantly');
  }

  if (!exercise.instructions || exercise.instructions.trim().length === 0) {
    errors.push('Exercise instructions are required');
  }

  if (!exercise.targetMuscles || exercise.targetMuscles.length === 0) {
    warnings.push('Target muscles should be specified for better tracking');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Sanitize and validate user input
 */
export const sanitizeUserInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Validate and sanitize workout type selection
 */
export const validateWorkoutTypeSelection = (type: string): ValidWorkoutType | null => {
  const sanitized = sanitizeUserInput(type).toLowerCase();
  return isValidWorkoutType(sanitized) ? sanitized : null;
};
