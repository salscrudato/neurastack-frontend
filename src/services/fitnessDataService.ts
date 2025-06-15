/**
 * Fitness Data Service - Firestore Integration
 * 
 * Manages fitness profile and workout data storage in Firestore.
 * Provides real-time sync and offline support for NeuraFit data.
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  type Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleSilentError } from '../utils/errorHandler';
import type { FitnessProfile, WorkoutPlan } from '../lib/types';

// ============================================================================
// Types for Firestore Storage
// ============================================================================

interface StoredFitnessProfile extends Omit<FitnessProfile, 'completedOnboarding'> {
  completedOnboarding: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

interface StoredWorkoutPlan extends Omit<WorkoutPlan, 'createdAt' | 'completedAt'> {
  createdAt: Timestamp;
  completedAt: Timestamp | null;
  userId: string;
}

// ============================================================================
// Fitness Profile Management
// ============================================================================

/**
 * Save fitness profile to Firestore
 */
export async function saveFitnessProfile(profile: FitnessProfile): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to save fitness profile');
  }

  try {
    const userId = auth.currentUser.uid;
    const profileRef = doc(db, 'users', userId, 'fitness', 'profile');

    const profileData: Omit<StoredFitnessProfile, 'createdAt'> = {
      ...profile,
      updatedAt: serverTimestamp() as Timestamp,
      userId
    };

    // Check if profile exists
    const existingProfile = await getDoc(profileRef);
    
    if (existingProfile.exists()) {
      // Update existing profile
      await updateDoc(profileRef, profileData);
    } else {
      // Create new profile
      await setDoc(profileRef, {
        ...profileData,
        createdAt: serverTimestamp() as Timestamp,
      });
    }

    console.log('✅ Fitness profile saved to Firestore');
  } catch (error) {
    handleSilentError(error, {
      component: 'fitnessDataService',
      action: 'saveFitnessProfile',
      userId: auth.currentUser?.uid
    });
    throw error;
  }
}

/**
 * Load fitness profile from Firestore
 */
export async function loadFitnessProfile(): Promise<FitnessProfile | null> {
  if (!auth.currentUser) {
    return null;
  }

  try {
    const userId = auth.currentUser.uid;
    const profileRef = doc(db, 'users', userId, 'fitness', 'profile');
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const data = profileSnap.data() as StoredFitnessProfile;
      
      // Convert Firestore data back to FitnessProfile
      const profile: FitnessProfile = {
        fitnessLevel: data.fitnessLevel,
        fitnessLevelCode: data.fitnessLevelCode,
        goals: data.goals,
        equipment: data.equipment,
        availableTime: data.availableTime,
        workoutDays: data.workoutDays,
        timeAvailability: data.timeAvailability,
        completedOnboarding: data.completedOnboarding
      };

      console.log('✅ Fitness profile loaded from Firestore');
      return profile;
    }

    return null;
  } catch (error) {
    console.warn('Failed to load fitness profile from Firestore:', error);
    return null;
  }
}

/**
 * Update specific fitness level with token-efficient code
 */
export async function updateFitnessLevel(
  level: 'beginner' | 'intermediate' | 'advanced', 
  code: 'B' | 'I' | 'A'
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to update fitness level');
  }

  try {
    const userId = auth.currentUser.uid;
    const profileRef = doc(db, 'users', userId, 'fitness', 'profile');

    await updateDoc(profileRef, {
      fitnessLevel: level,
      fitnessLevelCode: code,
      updatedAt: serverTimestamp()
    });

    console.log(`✅ Fitness level updated to ${level} (${code}) in Firestore`);
  } catch (error) {
    handleSilentError(error, {
      component: 'fitnessDataService',
      action: 'updateFitnessLevel',
      userId: auth.currentUser?.uid
    });
    throw error;
  }
}

// ============================================================================
// Workout Plan Management
// ============================================================================

/**
 * Save workout plan to Firestore
 */
export async function saveWorkoutPlan(workoutPlan: WorkoutPlan): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to save workout plan');
  }

  try {
    const userId = auth.currentUser.uid;
    const workoutsRef = collection(db, 'users', userId, 'fitness', 'workouts');

    const workoutData: Omit<StoredWorkoutPlan, 'id'> = {
      name: workoutPlan.name,
      duration: workoutPlan.duration,
      exercises: workoutPlan.exercises,
      difficulty: workoutPlan.difficulty,
      createdAt: serverTimestamp() as Timestamp,
      completedAt: workoutPlan.completedAt ? serverTimestamp() as Timestamp : null,
      userId
    };

    await addDoc(workoutsRef, workoutData);
    console.log('✅ Workout plan saved to Firestore');
  } catch (error) {
    handleSilentError(error, {
      component: 'fitnessDataService',
      action: 'saveWorkoutPlan',
      userId: auth.currentUser?.uid
    });
    throw error;
  }
}

/**
 * Load workout plans from Firestore
 */
export async function loadWorkoutPlans(): Promise<WorkoutPlan[]> {
  if (!auth.currentUser) {
    return [];
  }

  try {
    const userId = auth.currentUser.uid;
    const workoutsRef = collection(db, 'users', userId, 'fitness', 'workouts');
    const q = query(
      workoutsRef,
      orderBy('createdAt', 'desc'),
      limit(50) // Limit to last 50 workouts
    );

    const querySnapshot = await getDocs(q);
    const workouts: WorkoutPlan[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as StoredWorkoutPlan;
      workouts.push({
        id: doc.id,
        name: data.name,
        duration: data.duration,
        exercises: data.exercises,
        difficulty: data.difficulty,
        createdAt: data.createdAt.toDate(),
        completedAt: data.completedAt ? data.completedAt.toDate() : null
      });
    });

    console.log(`✅ Loaded ${workouts.length} workout plans from Firestore`);
    return workouts;
  } catch (error) {
    console.warn('Failed to load workout plans from Firestore:', error);
    return [];
  }
}

// ============================================================================
// Real-time Sync
// ============================================================================

/**
 * Subscribe to real-time fitness profile updates
 */
export function subscribeFitnessProfile(
  callback: (profile: FitnessProfile | null) => void
): () => void {
  if (!auth.currentUser) {
    callback(null);
    return () => {};
  }

  const userId = auth.currentUser.uid;
  const profileRef = doc(db, 'users', userId, 'fitness', 'profile');

  return onSnapshot(profileRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as StoredFitnessProfile;
      const profile: FitnessProfile = {
        fitnessLevel: data.fitnessLevel,
        fitnessLevelCode: data.fitnessLevelCode,
        goals: data.goals,
        equipment: data.equipment,
        availableTime: data.availableTime,
        workoutDays: data.workoutDays,
        timeAvailability: data.timeAvailability,
        completedOnboarding: data.completedOnboarding
      };
      callback(profile);
    } else {
      callback(null);
    }
  }, (error) => {
    console.warn('Error in fitness profile subscription:', error);
    callback(null);
  });
}

// ============================================================================
// Analytics Integration
// ============================================================================

/**
 * Track fitness level selection with analytics
 */
export function trackFitnessLevelSelection(
  level: string,
  code: string,
  completionTime?: number
): void {
  try {
    // Log to console for development
    console.log('Analytics: fitness_level_selected', {
      level,
      code,
      completionTime,
      timestamp: Date.now(),
      userId: auth.currentUser?.uid
    });

    // Performance tracking
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('fitness_level_selected');
    }

    // TODO: Add Firebase Analytics tracking when needed
    // logEvent(analytics, 'fitness_level_selected', {
    //   fitness_level: level,
    //   level_code: code,
    //   completion_time_ms: completionTime,
    //   user_id: auth.currentUser?.uid
    // });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track goal selection/deselection with analytics
 */
export function trackGoalSelection(
  goalCode: string,
  isSelected: boolean,
  completionTime?: number
): void {
  try {
    // Log to console for development
    console.log('Analytics: goal_selection', {
      goalCode,
      isSelected,
      completionTime,
      timestamp: Date.now(),
      userId: auth.currentUser?.uid
    });

    // Performance tracking
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`goal_${isSelected ? 'selected' : 'deselected'}`);
    }

    // TODO: Add Firebase Analytics tracking when needed
    // logEvent(analytics, 'goal_selection', {
    //   goal_code: goalCode,
    //   is_selected: isSelected,
    //   completion_time_ms: completionTime,
    //   user_id: auth.currentUser?.uid
    // });
  } catch (error) {
    console.warn('Goal selection analytics tracking failed:', error);
  }
}

/**
 * Track goal step completion with analytics
 */
export function trackGoalStepCompletion(
  selectedGoals: string[],
  completionTime?: number
): void {
  try {
    // Log to console for development
    console.log('Analytics: goal_step_completed', {
      selectedGoals,
      goalCount: selectedGoals.length,
      completionTime,
      timestamp: Date.now(),
      userId: auth.currentUser?.uid
    });

    // Performance tracking
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('goal_step_completed');
    }

    // TODO: Add Firebase Analytics tracking when needed
    // logEvent(analytics, 'goal_step_completed', {
    //   selected_goals: selectedGoals,
    //   goal_count: selectedGoals.length,
    //   completion_time_ms: completionTime,
    //   user_id: auth.currentUser?.uid
    // });
  } catch (error) {
    console.warn('Goal step completion analytics tracking failed:', error);
  }
}
