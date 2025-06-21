/**
 * Fitness Data Service - Firestore Integration
 * 
 * Manages fitness profile and workout data storage in Firestore.
 * Provides real-time sync and offline support for NeuraFit data.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    type Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { FitnessProfile, WorkoutPlan } from '../lib/types';
import { handleSilentError } from '../utils/errorHandler';

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
// Utility Functions
// ============================================================================

/**
 * Remove undefined values from an object to make it Firestore-compatible
 */
function removeUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively clean nested objects
        const cleanedNested = removeUndefinedValues(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key as keyof T] = cleanedNested as T[keyof T];
        }
      } else {
        cleaned[key as keyof T] = value;
      }
    }
  }

  return cleaned;
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

    // Clean the profile data to remove undefined values
    const cleanedProfile = removeUndefinedValues(profile);

    const profileData = {
      ...cleanedProfile,
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

      // Convert Firestore data back to FitnessProfile with enhanced fields
      const profile: FitnessProfile = {
        fitnessLevel: data.fitnessLevel,
        fitnessLevelCode: data.fitnessLevelCode,
        goals: data.goals,
        equipment: data.equipment,
        availableTime: data.availableTime,
        workoutDays: data.workoutDays,
        timeAvailability: data.timeAvailability,
        completedOnboarding: data.completedOnboarding,
        // Enhanced fields for workout API integration (may be undefined for older profiles)
        age: data.age, // Legacy field for backward compatibility
        ageCategory: data.ageCategory, // New category-based age field
        gender: data.gender,
        weight: data.weight, // Legacy field for backward compatibility
        weightCategory: data.weightCategory, // New category-based weight field
        injuries: data.injuries || [],
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

    // Check if profile exists first
    const existingProfile = await getDoc(profileRef);

    const updateData = {
      fitnessLevel: level,
      fitnessLevelCode: code,
      updatedAt: serverTimestamp()
    };

    if (existingProfile.exists()) {
      // Update existing profile
      await updateDoc(profileRef, updateData);
    } else {
      // Create new profile with minimal required fields
      await setDoc(profileRef, {
        ...updateData,
        createdAt: serverTimestamp(),
        userId,
        // Set default values for required fields
        goals: [],
        equipment: [],
        availableTime: 30,
        workoutDays: 3,
        timeAvailability: 'morning',
        completedOnboarding: false
      });
    }

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
 * @deprecated Backend now handles all workout storage automatically via the completeWorkout API
 * This function is kept for backward compatibility but is no longer used
 */
export async function saveWorkoutPlan(_workoutPlan: WorkoutPlan): Promise<void> {
  console.warn('saveWorkoutPlan is deprecated - backend handles workout storage automatically');
  // Backend handles all workout storage through the completeWorkout API
  // No local storage needed
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
    // Fix: Use correct Firestore path structure - collections need odd number of segments
    const workoutsRef = collection(db, 'users', userId, 'workouts');
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
        completedOnboarding: data.completedOnboarding,
        // Enhanced fields for workout API integration (may be undefined for older profiles)
        age: data.age, // Legacy field for backward compatibility
        ageCategory: data.ageCategory, // New category-based age field
        gender: data.gender,
        weight: data.weight, // Legacy field for backward compatibility
        weightCategory: data.weightCategory, // New category-based weight field
        injuries: data.injuries || [],
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

    // Import analytics service dynamically to avoid circular dependencies
    import('../services/analyticsService').then(({ trackEvent }) => {
      trackEvent('fitness_level_selected', {
        fitness_level: level,
        level_code: code,
        completion_time_ms: completionTime,
        user_id: auth.currentUser?.uid
      });
    }).catch(error => {
      console.warn('Analytics service import failed:', error);
    });
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

    // Import analytics service dynamically to avoid circular dependencies
    import('../services/analyticsService').then(({ trackEvent }) => {
      trackEvent('goal_selection', {
        goal_code: goalCode,
        is_selected: isSelected,
        completion_time_ms: completionTime,
        user_id: auth.currentUser?.uid
      });
    }).catch(error => {
      console.warn('Analytics service import failed:', error);
    });
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

    // Import analytics service dynamically to avoid circular dependencies
    import('../services/analyticsService').then(({ trackEvent }) => {
      trackEvent('goal_step_completed', {
        selected_goals: selectedGoals,
        goal_count: selectedGoals.length,
        completion_time_ms: completionTime,
        user_id: auth.currentUser?.uid
      });
    }).catch(error => {
      console.warn('Analytics service import failed:', error);
    });
  } catch (error) {
    console.warn('Goal step completion analytics tracking failed:', error);
  }
}
