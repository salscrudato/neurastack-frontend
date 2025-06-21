/**
 * Workout API Validation Utilities
 * 
 * Validation functions that match the latest NeuraStack Workout API specification
 */

import { API_FITNESS_GOALS, API_EQUIPMENT_TYPES, API_INJURY_TYPES } from '../lib/types';

export interface WorkoutApiValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a workout generation request according to the latest API specification
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
  const warnings: string[] = [];

  // Required field validation per API specification
  if (!request.fitnessLevel || !['beginner', 'intermediate', 'advanced'].includes(request.fitnessLevel)) {
    errors.push('Invalid fitness level: must be beginner, intermediate, or advanced');
  }

  if (!request.fitnessGoals || !Array.isArray(request.fitnessGoals) || request.fitnessGoals.length === 0) {
    errors.push('At least one fitness goal is required');
  } else {
    // Validate fitness goals against API specification
    const invalidGoals = request.fitnessGoals.filter(goal => !API_FITNESS_GOALS.includes(goal as any));
    if (invalidGoals.length > 0) {
      warnings.push(`Unknown fitness goals: ${invalidGoals.join(', ')}. Valid goals: ${API_FITNESS_GOALS.join(', ')}`);
    }
  }

  if (!request.equipment || !Array.isArray(request.equipment)) {
    errors.push('Equipment must be an array (can be empty for bodyweight)');
  } else {
    // Validate equipment against API specification
    const invalidEquipment = request.equipment.filter(eq => !API_EQUIPMENT_TYPES.includes(eq as any));
    if (invalidEquipment.length > 0) {
      warnings.push(`Unknown equipment types: ${invalidEquipment.join(', ')}. Valid equipment: ${API_EQUIPMENT_TYPES.join(', ')}`);
    }
  }

  if (!request.age || request.age < 13 || request.age > 100) {
    errors.push('Age must be between 13 and 100');
  }

  if (!request.gender || !['male', 'female'].includes(request.gender)) {
    errors.push('Gender must be male or female');
  }

  if (!request.weight || request.weight < 30 || request.weight > 500) {
    errors.push('Weight must be between 30 and 500');
  }

  if (!request.injuries || !Array.isArray(request.injuries)) {
    errors.push('Injuries must be an array (can be empty)');
  } else {
    // Validate injuries against API specification
    const invalidInjuries = request.injuries.filter(injury => !API_INJURY_TYPES.includes(injury as any));
    if (invalidInjuries.length > 0) {
      warnings.push(`Unknown injury types: ${invalidInjuries.join(', ')}. Valid injuries: ${API_INJURY_TYPES.join(', ')}`);
    }
  }

  if (!request.daysPerWeek || request.daysPerWeek < 1 || request.daysPerWeek > 7) {
    errors.push('Days per week must be between 1 and 7');
  }

  if (!request.minutesPerSession || request.minutesPerSession < 10 || request.minutesPerSession > 180) {
    errors.push('Minutes per session must be between 10 and 180');
  }

  if (!request.workoutType || request.workoutType.trim().length === 0) {
    errors.push('Workout type is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates a workout completion request according to the latest API specification
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
  const warnings: string[] = [];

  if (!request.workoutId || request.workoutId.trim().length === 0) {
    errors.push('Workout ID is required');
  }

  if (typeof request.completed !== 'boolean') {
    errors.push('Completed must be a boolean value');
  }

  if (request.rating !== undefined) {
    if (typeof request.rating !== 'number' || request.rating < 1 || request.rating > 5) {
      errors.push('Rating must be a number between 1 and 5');
    }
  }

  if (request.difficulty !== undefined) {
    if (!['too_easy', 'just_right', 'too_hard'].includes(request.difficulty)) {
      errors.push('Difficulty must be too_easy, just_right, or too_hard');
    }
  }

  if (request.actualDuration !== undefined) {
    if (typeof request.actualDuration !== 'number' || request.actualDuration < 0) {
      errors.push('Actual duration must be a positive number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Helper function to convert UI values to API-compatible format
 */
export const apiConverters = {
  gender: (gender?: string): 'male' | 'female' => {
    if (gender === 'Male') return 'male';
    if (gender === 'Female') return 'female';
    return 'male'; // Default fallback
  },

  goals: (goals: string[]): string[] => {
    const goalMapping: Record<string, string> = {
      'weight_loss': 'weight_loss',
      'muscle_gain': 'muscle_gain', 
      'strength': 'strength',
      'endurance': 'endurance',
      'flexibility': 'flexibility',
      'toning': 'toning',
      'general_fitness': 'general_fitness',
      'athletic_performance': 'athletic_performance',
      'rehabilitation': 'rehabilitation',
      'stress_relief': 'stress_relief'
    };

    return goals.map(goal => goalMapping[goal] || goal.toLowerCase().replace(' ', '_'));
  },

  equipment: (equipment: string[]): string[] => {
    const equipmentMapping: Record<string, string> = {
      'bodyweight': 'bodyweight',
      'dumbbells': 'dumbbells',
      'barbell': 'barbell', 
      'resistance_bands': 'resistance_bands',
      'kettlebells': 'kettlebells',
      'pull_up_bar': 'pull_up_bar',
      'yoga_mat': 'yoga_mat',
      'bench': 'bench',
      'cardio_machine': 'cardio_machine',
      'cable_machine': 'cable_machine',
      'medicine_ball': 'medicine_ball',
      'foam_roller': 'foam_roller'
    };

    return equipment.map(eq => equipmentMapping[eq] || eq.toLowerCase().replace(' ', '_'));
  },

  injuries: (injuries: string[]): string[] => {
    const injuryMapping: Record<string, string> = {
      'lower_back': 'lower_back',
      'knee': 'knee',
      'shoulder': 'shoulder',
      'neck': 'neck',
      'ankle': 'ankle',
      'wrist': 'wrist',
      'hip': 'hip',
      'elbow': 'elbow',
      'chronic_pain': 'chronic_pain',
      'recent_surgery': 'recent_surgery'
    };

    return injuries.map(injury => injuryMapping[injury] || injury.toLowerCase().replace(' ', '_'));
  }
};
