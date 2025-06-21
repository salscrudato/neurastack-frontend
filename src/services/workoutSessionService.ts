/**
 * Enhanced Workout Session Service
 *
 * @deprecated Backend now handles all session management automatically via the completeWorkout API
 * This service is kept for backward compatibility but most functions are no longer used
 *
 * Comprehensive service for managing workout sessions with detailed tracking,
 * analytics, and data persistence for professional-grade workout applications.
 */

import {
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    type Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type {
    CompletedExercise,
    CompletedSet,
    Exercise,
    WorkoutPlan,
    WorkoutSession,
    WorkoutSessionSummary
} from '../lib/types';
import { handleSilentError } from '../utils/errorHandler';

// ============================================================================
// Firestore Storage Types
// ============================================================================

interface StoredWorkoutSession extends Omit<WorkoutSession, 'startTime' | 'endTime' | 'completedExercises'> {
  startTime: Timestamp;
  endTime?: Timestamp;
  completedExercises: StoredCompletedExercise[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface StoredCompletedExercise extends Omit<CompletedExercise, 'completedAt' | 'completedSets'> {
  completedAt: Timestamp;
  completedSets: StoredCompletedSet[];
}

interface StoredCompletedSet extends Omit<CompletedSet, 'completedAt'> {
  completedAt: Timestamp;
}

// ============================================================================
// Session Management Functions
// ============================================================================

/**
 * Create a new workout session
 */
export async function createWorkoutSession(
  workoutPlan: WorkoutPlan,
  userId?: string
): Promise<WorkoutSession> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const currentUserId = userId || auth.currentUser?.uid || 'anonymous';

  const session: WorkoutSession = {
    id: sessionId,
    workoutPlanId: workoutPlan.id,
    userId: currentUserId,
    startTime: new Date(),
    status: 'not_started',
    currentExerciseIndex: 0,
    completedExercises: [],
    skippedExercises: [],
    totalDuration: 0,
    activeTime: 0,
    restTime: 0,
    pauseTime: 0,
    plannedDuration: workoutPlan.duration * 60, // convert minutes to seconds
    sessionAnalytics: {
      totalSetsCompleted: 0,
      totalRepsCompleted: 0,
      totalWeightLifted: 0,
      averageRestTime: 0,
      exerciseCompletionRate: 0,
    }
  };

  return session;
}

/**
 * Complete an exercise with comprehensive tracking
 */
export function completeExercise(
  session: WorkoutSession,
  exerciseIndex: number,
  exercise: Exercise,
  completedSets: CompletedSet[],
  exerciseNotes?: string,
  averageRPE?: number,
  averageFormRating?: number
): WorkoutSession {
  const completedExercise: CompletedExercise = {
    exerciseIndex,
    exerciseId: exercise.name, // Using name as ID for now
    exerciseName: exercise.name,
    plannedSets: exercise.sets,
    completedSets,
    skipped: false,
    completedAt: new Date(),
    totalTimeSpent: 0, // This should be calculated from actual timing
    averageRPE,
    averageFormRating,
    exerciseNotes,
    personalRecordAchieved: checkPersonalRecord(exercise, completedSets),
    progressionFromLastTime: calculateProgression(exercise, completedSets)
  };

  const updatedSession: WorkoutSession = {
    ...session,
    completedExercises: [...session.completedExercises, completedExercise],
    sessionAnalytics: updateSessionAnalytics(session, completedExercise)
  };

  return updatedSession;
}

/**
 * Complete workout session with comprehensive data
 */
export async function completeWorkoutSession(
  session: WorkoutSession,
  overallRating?: number,
  workoutNotes?: string,
  mood?: 'energetic' | 'tired' | 'motivated' | 'stressed' | 'neutral'
): Promise<WorkoutSession> {
  const completedSession: WorkoutSession = {
    ...session,
    status: 'completed',
    endTime: new Date(),
    totalDuration: Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000),
    overallRating,
    workoutNotes,
    mood,
    sessionAnalytics: {
      ...session.sessionAnalytics!,
      exerciseCompletionRate: (session.completedExercises.length / getTotalExerciseCount(session)) * 100
    }
  };

  // Save to Firestore if user is authenticated
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    try {
      await saveWorkoutSession(completedSession);
    } catch (error) {
      console.warn('Failed to save workout session:', error);
    }
  }

  return completedSession;
}

/**
 * Complete workout early with reason
 */
export async function completeWorkoutEarly(
  session: WorkoutSession,
  reason: string,
  overallRating?: number,
  workoutNotes?: string
): Promise<WorkoutSession> {
  const completedSession: WorkoutSession = {
    ...session,
    status: 'completed',
    endTime: new Date(),
    totalDuration: Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000),
    completedEarly: true,
    earlyCompletionReason: reason,
    overallRating,
    workoutNotes,
    sessionAnalytics: {
      ...session.sessionAnalytics!,
      exerciseCompletionRate: (session.completedExercises.length / getTotalExerciseCount(session)) * 100
    }
  };

  // Save to Firestore if user is authenticated
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    try {
      await saveWorkoutSession(completedSession);
    } catch (error) {
      console.warn('Failed to save workout session:', error);
    }
  }

  return completedSession;
}

// ============================================================================
// Data Persistence Functions
// ============================================================================

/**
 * Save workout session to Firestore
 */
export async function saveWorkoutSession(session: WorkoutSession): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to save workout session');
  }

  try {
    const userId = auth.currentUser.uid;
    const sessionsRef = collection(db, 'users', userId, 'workoutSessions');

    const sessionData: Omit<StoredWorkoutSession, 'id'> = {
      workoutPlanId: session.workoutPlanId,
      userId: session.userId,
      startTime: serverTimestamp() as Timestamp,
      endTime: session.endTime ? serverTimestamp() as Timestamp : undefined,
      status: session.status,
      currentExerciseIndex: session.currentExerciseIndex,
      completedExercises: session.completedExercises.map(exercise => ({
        ...exercise,
        completedAt: serverTimestamp() as Timestamp,
        completedSets: exercise.completedSets.map(set => ({
          ...set,
          completedAt: serverTimestamp() as Timestamp
        }))
      })),
      skippedExercises: session.skippedExercises,
      totalDuration: session.totalDuration,
      activeTime: session.activeTime,
      restTime: session.restTime,
      pauseTime: session.pauseTime,
      caloriesBurned: session.caloriesBurned,
      averageRPE: session.averageRPE,
      overallRating: session.overallRating,
      workoutNotes: session.workoutNotes,
      location: session.location,
      equipment: session.equipment,
      sessionAnalytics: session.sessionAnalytics,
      completedEarly: session.completedEarly,
      earlyCompletionReason: session.earlyCompletionReason,
      plannedDuration: session.plannedDuration,
      notes: session.notes,
      mood: session.mood,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    await addDoc(sessionsRef, sessionData);
    console.log('✅ Workout session saved successfully');
  } catch (error) {
    handleSilentError(error, {
      component: 'workoutSessionService',
      action: 'saveWorkoutSession',
      userId: auth.currentUser?.uid
    });
    throw error;
  }
}

/**
 * Load workout session history
 */
export async function loadWorkoutSessionHistory(limitCount: number = 50): Promise<WorkoutSessionSummary[]> {
  if (!auth.currentUser) {
    return [];
  }

  try {
    const userId = auth.currentUser.uid;
    const sessionsRef = collection(db, 'users', userId, 'workoutSessions');

    // Use a simpler query to avoid index requirements
    // We'll filter completed/abandoned sessions in memory
    const q = query(
      sessionsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount * 2) // Get more to account for filtering
    );

    const querySnapshot = await getDocs(q);
    const sessions: WorkoutSessionSummary[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as StoredWorkoutSession;

      // Filter for completed or abandoned sessions
      if (!['completed', 'abandoned'].includes(data.status)) {
        return;
      }

      const summary: WorkoutSessionSummary = {
        id: doc.id,
        workoutName: `Workout ${data.completedExercises.length} exercises`, // This should come from workout plan
        date: data.startTime.toDate(),
        duration: Math.round(data.totalDuration / 60), // convert to minutes
        exercisesCompleted: data.completedExercises.length,
        totalExercises: data.completedExercises.length + data.skippedExercises.length,
        completionRate: data.sessionAnalytics?.exerciseCompletionRate || 0,
        totalWeightLifted: data.sessionAnalytics?.totalWeightLifted,
        averageRPE: data.averageRPE,
        overallRating: data.overallRating,
        workoutType: 'mixed', // This should come from workout plan
        status: data.completedEarly ? 'completed_early' : data.status as any,
        personalRecordsAchieved: data.completedExercises.filter(ex => ex.personalRecordAchieved).length
      };
      sessions.push(summary);
    });

    // Sort by date and limit results
    return sessions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limitCount);

  } catch (error) {
    handleSilentError(error, {
      component: 'workoutSessionService',
      action: 'loadWorkoutSessionHistory',
      userId: auth.currentUser?.uid
    });
    return [];
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function checkPersonalRecord(exercise: Exercise, completedSets: CompletedSet[]): boolean {
  // Simple check - in a real app, this would compare against historical data
  const maxWeight = Math.max(...completedSets.map(set => set.weight || 0));
  return maxWeight > 0 && (exercise.personalBest?.maxWeight || 0) < maxWeight;
}

function calculateProgression(
  _exercise: Exercise,
  _completedSets: CompletedSet[]
) {
  // Placeholder - would calculate based on historical data
  return {
    weightIncrease: 0,
    repsIncrease: 0,
    setsIncrease: 0
  };
}

function updateSessionAnalytics(session: WorkoutSession, completedExercise: CompletedExercise) {
  const currentAnalytics = session.sessionAnalytics!;
  const totalSetsCompleted = currentAnalytics.totalSetsCompleted + completedExercise.completedSets.length;
  const totalRepsCompleted = currentAnalytics.totalRepsCompleted + 
    completedExercise.completedSets.reduce((sum, set) => sum + set.actualReps, 0);
  const totalWeightLifted = currentAnalytics.totalWeightLifted + 
    completedExercise.completedSets.reduce((sum, set) => sum + ((set.weight || 0) * set.actualReps), 0);

  return {
    ...currentAnalytics,
    totalSetsCompleted,
    totalRepsCompleted,
    totalWeightLifted,
    exerciseCompletionRate: ((session.completedExercises.length + 1) / getTotalExerciseCount(session)) * 100
  };
}

function getTotalExerciseCount(session: WorkoutSession): number {
  // This should come from the workout plan - placeholder for now
  return session.completedExercises.length + session.skippedExercises.length + 1;
}
