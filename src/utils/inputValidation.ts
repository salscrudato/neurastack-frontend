/**
 * Comprehensive Input Validation and Data Sanitization
 * 
 * Provides robust validation, sanitization, and security measures
 * for all user inputs in the NeuraFit application
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export interface ValidationRule<T = any> {
  name: string;
  validator: (value: T) => boolean | string;
  sanitizer?: (value: T) => T;
  required?: boolean;
}

// ============================================================================
// Core Validation Functions
// ============================================================================

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length to prevent DoS
}

/**
 * Sanitize number input with bounds checking
 */
export function sanitizeNumber(input: any, min?: number, max?: number): number | null {
  const num = Number(input);
  
  if (isNaN(num) || !isFinite(num)) return null;
  
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  
  return num;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate age input
 */
export function validateAge(age: any): ValidationResult {
  const errors: string[] = [];
  const numAge = sanitizeNumber(age, 13, 120);
  
  if (numAge === null) {
    errors.push('Age must be a valid number');
  } else if (numAge < 13) {
    errors.push('Age must be at least 13 years');
  } else if (numAge > 120) {
    errors.push('Age must be less than 120 years');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: numAge
  };
}

/**
 * Validate weight input
 */
export function validateWeight(weight: any): ValidationResult {
  const errors: string[] = [];
  const numWeight = sanitizeNumber(weight, 50, 1000);
  
  if (numWeight === null) {
    errors.push('Weight must be a valid number');
  } else if (numWeight < 50) {
    errors.push('Weight must be at least 50 lbs');
  } else if (numWeight > 1000) {
    errors.push('Weight must be less than 1000 lbs');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: numWeight
  };
}

/**
 * Validate gender selection
 */
export function validateGender(gender: any): ValidationResult {
  const validGenders = ['male', 'female', 'rather_not_say'];
  const errors: string[] = [];
  
  if (!validGenders.includes(gender)) {
    errors.push('Please select a valid gender option');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: validGenders.includes(gender) ? gender : undefined
  };
}

/**
 * Validate fitness level selection
 */
export function validateFitnessLevel(level: any): ValidationResult {
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  const errors: string[] = [];
  
  if (!validLevels.includes(level)) {
    errors.push('Please select a valid fitness level');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: validLevels.includes(level) ? level : undefined
  };
}

/**
 * Validate goals array
 */
export function validateGoals(goals: any): ValidationResult {
  const validGoals = [
    'weight_loss', 'muscle_gain', 'endurance', 'strength', 
    'flexibility', 'general_fitness', 'sport_specific'
  ];
  const errors: string[] = [];
  
  if (!Array.isArray(goals)) {
    errors.push('Goals must be an array');
    return { isValid: false, errors };
  }
  
  if (goals.length === 0) {
    errors.push('Please select at least one fitness goal');
  }
  
  if (goals.length > 5) {
    errors.push('Please select no more than 5 fitness goals');
  }
  
  const sanitizedGoals = goals.filter(goal => 
    typeof goal === 'string' && validGoals.includes(goal)
  );
  
  if (sanitizedGoals.length !== goals.length) {
    errors.push('Some selected goals are invalid');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedGoals
  };
}

/**
 * Validate equipment array
 */
export function validateEquipment(equipment: any): ValidationResult {
  const validEquipment = [
    'bodyweight', 'dumbbells', 'barbell', 'resistance_bands', 
    'kettlebells', 'pull_up_bar', 'yoga_mat', 'cardio_machine'
  ];
  const errors: string[] = [];
  
  if (!Array.isArray(equipment)) {
    errors.push('Equipment must be an array');
    return { isValid: false, errors };
  }
  
  if (equipment.length === 0) {
    errors.push('Please select at least one equipment option');
  }
  
  const sanitizedEquipment = equipment.filter(item => 
    typeof item === 'string' && validEquipment.includes(item)
  );
  
  if (sanitizedEquipment.length !== equipment.length) {
    errors.push('Some selected equipment is invalid');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedEquipment
  };
}

/**
 * Validate time availability
 */
export function validateTimeAvailability(timeData: any): ValidationResult {
  const errors: string[] = [];
  
  if (!timeData || typeof timeData !== 'object') {
    errors.push('Time availability data is required');
    return { isValid: false, errors };
  }
  
  const daysPerWeek = sanitizeNumber(timeData.daysPerWeek, 1, 7);
  const minutesPerSession = sanitizeNumber(timeData.minutesPerSession, 10, 180);
  
  if (daysPerWeek === null) {
    errors.push('Days per week must be between 1 and 7');
  }
  
  if (minutesPerSession === null) {
    errors.push('Minutes per session must be between 10 and 180');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: {
      daysPerWeek,
      minutesPerSession
    }
  };
}

/**
 * Validate injuries array
 */
export function validateInjuries(injuries: any): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(injuries)) {
    return {
      isValid: true,
      errors: [],
      sanitizedValue: []
    };
  }
  
  const sanitizedInjuries = injuries
    .filter(injury => typeof injury === 'string')
    .map(injury => sanitizeString(injury))
    .filter(injury => injury.length > 0 && injury.length <= 100)
    .slice(0, 10); // Limit to 10 injuries
  
  return {
    isValid: true,
    errors,
    sanitizedValue: sanitizedInjuries
  };
}

// ============================================================================
// Comprehensive Profile Validation
// ============================================================================

/**
 * Validate complete fitness profile
 */
export function validateFitnessProfile(profile: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedProfile: any = {};
  
  // Validate each field
  const ageResult = validateAge(profile.age);
  const weightResult = validateWeight(profile.weight);
  const genderResult = validateGender(profile.gender);
  const fitnessLevelResult = validateFitnessLevel(profile.fitnessLevel);
  const goalsResult = validateGoals(profile.goals);
  const equipmentResult = validateEquipment(profile.equipment);
  const timeResult = validateTimeAvailability(profile.timeAvailability);
  const injuriesResult = validateInjuries(profile.injuries);
  
  // Collect all errors
  errors.push(...ageResult.errors);
  errors.push(...weightResult.errors);
  errors.push(...genderResult.errors);
  errors.push(...fitnessLevelResult.errors);
  errors.push(...goalsResult.errors);
  errors.push(...equipmentResult.errors);
  errors.push(...timeResult.errors);
  errors.push(...injuriesResult.errors);
  
  // Build sanitized profile
  if (ageResult.isValid) sanitizedProfile.age = ageResult.sanitizedValue;
  if (weightResult.isValid) sanitizedProfile.weight = weightResult.sanitizedValue;
  if (genderResult.isValid) sanitizedProfile.gender = genderResult.sanitizedValue;
  if (fitnessLevelResult.isValid) sanitizedProfile.fitnessLevel = fitnessLevelResult.sanitizedValue;
  if (goalsResult.isValid) sanitizedProfile.goals = goalsResult.sanitizedValue;
  if (equipmentResult.isValid) sanitizedProfile.equipment = equipmentResult.sanitizedValue;
  if (timeResult.isValid) sanitizedProfile.timeAvailability = timeResult.sanitizedValue;
  if (injuriesResult.isValid) sanitizedProfile.injuries = injuriesResult.sanitizedValue;
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedProfile
  };
}

// ============================================================================
// Security Utilities
// ============================================================================

/**
 * Rate limiting for form submissions
 */
const submissionTimes = new Map<string, number[]>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const attempts = submissionTimes.get(identifier) || [];
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(time => now - time < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false; // Rate limited
  }
  
  // Add current attempt
  recentAttempts.push(now);
  submissionTimes.set(identifier, recentAttempts);
  
  return true; // Not rate limited
}

// All functions are already exported above
