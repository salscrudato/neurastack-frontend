/**
 * Simplified Workout Service
 * 
 * Minimal workout tracking since backend handles all memory management
 * and analytics through the new optimized API system.
 */

import { auth } from '../firebase';
import { handleSilentError } from '../utils/errorHandler';

// ============================================================================
// Simplified Types
// ============================================================================

export interface SimpleWorkoutCompletion {
  workoutId: string;
  userId: string;
  completed: boolean;
  rating?: number; // 1-5 stars
  difficulty?: 'too_easy' | 'just_right' | 'too_hard';
  notes?: string;
  actualDuration: number; // minutes
  completedAt: Date;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'abandoned';
  exercisesCompleted: number;
  totalExercises: number;
}

// ============================================================================
// Session Management (Local Only)
// ============================================================================

let currentSession: WorkoutSession | null = null;

/**
 * Start a new workout session (local tracking only)
 */
export function startWorkoutSession(workoutId: string): WorkoutSession | null {
  if (!auth.currentUser) {
    return null;
  }

  const session: WorkoutSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    workoutId,
    userId: auth.currentUser.uid,
    startTime: new Date(),
    status: 'active',
    exercisesCompleted: 0,
    totalExercises: 0
  };

  currentSession = session;
  
  // Store in sessionStorage for recovery
  try {
    sessionStorage.setItem('neurafit-current-session', JSON.stringify(session));
  } catch (error) {
    console.warn('Failed to store session in sessionStorage:', error);
  }

  return session;
}

/**
 * Update current session progress
 */
export function updateSessionProgress(exercisesCompleted: number, totalExercises: number): void {
  if (!currentSession) return;

  currentSession.exercisesCompleted = exercisesCompleted;
  currentSession.totalExercises = totalExercises;

  // Update sessionStorage
  try {
    sessionStorage.setItem('neurafit-current-session', JSON.stringify(currentSession));
  } catch (error) {
    console.warn('Failed to update session in sessionStorage:', error);
  }
}

/**
 * Complete current workout session
 */
export function completeWorkoutSession(): WorkoutSession | null {
  if (!currentSession) return null;

  currentSession.endTime = new Date();
  currentSession.status = 'completed';

  const completedSession = { ...currentSession };
  
  // Clear current session
  currentSession = null;
  
  // Clear sessionStorage
  try {
    sessionStorage.removeItem('neurafit-current-session');
  } catch (error) {
    console.warn('Failed to clear session from sessionStorage:', error);
  }

  return completedSession;
}

/**
 * Abandon current workout session
 */
export function abandonWorkoutSession(): void {
  if (!currentSession) return;

  currentSession.endTime = new Date();
  currentSession.status = 'abandoned';

  // Clear current session
  currentSession = null;
  
  // Clear sessionStorage
  try {
    sessionStorage.removeItem('neurafit-current-session');
  } catch (error) {
    console.warn('Failed to clear session from sessionStorage:', error);
  }
}

/**
 * Get current active session
 */
export function getCurrentSession(): WorkoutSession | null {
  return currentSession;
}

/**
 * Restore session from sessionStorage (on app reload)
 */
export function restoreSession(): WorkoutSession | null {
  try {
    const stored = sessionStorage.getItem('neurafit-current-session');
    if (stored) {
      const session = JSON.parse(stored);
      // Convert date strings back to Date objects
      session.startTime = new Date(session.startTime);
      if (session.endTime) {
        session.endTime = new Date(session.endTime);
      }
      currentSession = session;
      return session;
    }
  } catch (error) {
    console.warn('Failed to restore session from sessionStorage:', error);
    // Clear corrupted data
    try {
      sessionStorage.removeItem('neurafit-current-session');
    } catch (clearError) {
      // Ignore clear errors
    }
  }
  return null;
}

// ============================================================================
// Minimal Analytics (Local Only)
// ============================================================================

/**
 * Get basic workout statistics from current session
 */
export function getSessionStats(): {
  duration: number; // minutes
  completionRate: number; // percentage
  exercisesCompleted: number;
  totalExercises: number;
} | null {
  if (!currentSession) return null;

  const now = new Date();
  const duration = Math.floor((now.getTime() - currentSession.startTime.getTime()) / (1000 * 60));
  const completionRate = currentSession.totalExercises > 0 
    ? (currentSession.exercisesCompleted / currentSession.totalExercises) * 100 
    : 0;

  return {
    duration,
    completionRate,
    exercisesCompleted: currentSession.exercisesCompleted,
    totalExercises: currentSession.totalExercises
  };
}

/**
 * Simple completion tracking (no complex analytics)
 */
export function trackWorkoutCompletion(completion: Omit<SimpleWorkoutCompletion, 'userId' | 'completedAt'>): void {
  if (!auth.currentUser) {
    console.warn('Cannot track completion - user not authenticated');
    return;
  }

  try {
    const completionData: SimpleWorkoutCompletion = {
      ...completion,
      userId: auth.currentUser.uid,
      completedAt: new Date()
    };

    // Log completion for debugging
    if (import.meta.env.DEV) {
      console.log('🏁 Workout completion tracked:', completionData);
    }

    // Note: Backend handles all persistence and analytics through the new API
    // This is just for local debugging and immediate UI feedback

  } catch (error) {
    handleSilentError(error, {
      component: 'simplifiedWorkoutService',
      action: 'trackWorkoutCompletion',
      userId: auth.currentUser?.uid
    });
  }
}

/**
 * Clear all local workout data (for logout/reset)
 */
export function clearAllWorkoutData(): void {
  currentSession = null;
  
  try {
    sessionStorage.removeItem('neurafit-current-session');
  } catch (error) {
    console.warn('Failed to clear workout data from sessionStorage:', error);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
