/**
 * Simplified Workout API Utilities
 *
 * Basic validation and conversion utilities - backend handles complex validation
 */

export interface WorkoutApiValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Basic client-side validation for workout generation request
 * Backend handles comprehensive validation and data normalization
 */
export function validateWorkoutRequest(request: {
  fitnessLevel: string;
  fitnessGoals: string[];
  equipment: string[];
  age: number;
  gender: string;
  weight: number;
  injuries: string[];
  daysPerWeek: number;
  minutesPerSession: number;
  workoutType: string;
}): WorkoutApiValidationResult {
  const errors: string[] = [];

  // Basic required field validation only - backend handles detailed validation
  if (!request.fitnessLevel) {
    errors.push('Fitness level is required');
  }

  if (!request.fitnessGoals || !Array.isArray(request.fitnessGoals) || request.fitnessGoals.length === 0) {
    errors.push('At least one fitness goal is required');
  }

  if (!request.equipment || !Array.isArray(request.equipment)) {
    errors.push('Equipment must be an array');
  }

  if (!request.age || request.age <= 0) {
    errors.push('Valid age is required');
  }

  if (!request.gender) {
    errors.push('Gender is required');
  }

  if (!request.weight || request.weight <= 0) {
    errors.push('Valid weight is required');
  }

  if (!request.injuries || !Array.isArray(request.injuries)) {
    errors.push('Injuries must be an array');
  }

  if (!request.daysPerWeek || request.daysPerWeek <= 0) {
    errors.push('Days per week must be specified');
  }

  if (!request.minutesPerSession || request.minutesPerSession <= 0) {
    errors.push('Minutes per session must be specified');
  }

  if (!request.workoutType || request.workoutType.trim().length === 0) {
    errors.push('Workout type is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [] // Backend handles warnings
  };
}

/**
 * Basic client-side validation for workout completion request
 * Backend handles comprehensive validation
 */
export function validateWorkoutCompleteRequest(request: {
  workoutId: string;
  completed: boolean;
  rating?: number;
  difficulty?: string;
  notes?: string;
  actualDuration?: number;
}): WorkoutApiValidationResult {
  const errors: string[] = [];

  if (!request.workoutId || request.workoutId.trim().length === 0) {
    errors.push('Workout ID is required');
  }

  if (typeof request.completed !== 'boolean') {
    errors.push('Completed must be a boolean value');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [] // Backend handles detailed validation and warnings
  };
}

/**
 * Simplified data converters - backend handles complex transformations
 */
export const apiConverters = {
  gender: (gender?: string): 'male' | 'female' => {
    // Simple conversion - backend handles edge cases and validation
    if (gender === 'Female' || gender === 'female') return 'female';
    return 'male'; // Default fallback
  }
};
