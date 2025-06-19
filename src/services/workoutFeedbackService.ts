/**
 * NeuraFit Workout Feedback Service
 * 
 * Optimizes feedback data for AI consumption in workout generation.
 * Implements innovative feedback structuring for maximum AI effectiveness.
 */

import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { WorkoutHistoryEntry, WorkoutPlan } from '../lib/types';
import type { WorkoutAnalytics } from './workoutAnalyticsService';

/**
 * Enhanced feedback structure optimized for AI consumption
 */
export interface AIOptimizedFeedback {
  // Core performance indicators (highest priority)
  coreMetrics: {
    difficulty: number; // 1-5 scale
    enjoyment: number; // 1-5 scale
    completion: number; // 0-100 percentage
    rpe: number; // 1-10 perceived exertion
    efficiency: number; // planned vs actual duration ratio
  };

  // Adaptation signals for AI decision making
  adaptationSignals: AdaptationSignal[];

  // Exercise-specific insights
  exerciseInsights: ExerciseInsight[];

  // Contextual factors
  context: {
    workoutType: string;
    duration: number;
    timeOfDay: string;
    equipment: string[];
  };

  // Compressed feedback string for API requests
  compressedFeedback: string;
}

export type AdaptationSignal = 
  | 'INCREASE_INTENSITY'
  | 'REDUCE_INTENSITY'
  | 'INCREASE_VOLUME'
  | 'REDUCE_VOLUME'
  | 'REPEAT_STYLE'
  | 'VARY_STYLE'
  | 'INCREASE_RECOVERY'
  | 'REDUCE_RECOVERY'
  | 'FOCUS_FORM'
  | 'ADD_PROGRESSION';

export interface ExerciseInsight {
  name: string;
  signal: 'EASY' | 'HARD' | 'SKIP' | 'FAVORITE';
  confidence: number; // 0-1 scale
}

/**
 * Retrieves and structures workout feedback for AI consumption
 */
export async function getAIOptimizedWorkoutHistory(
  userId: string,
  maxResults: number = 3
): Promise<WorkoutHistoryEntry[]> {
  try {
    // Get recent completed workouts
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    const workoutsQuery = query(
      workoutsRef,
      where('completedAt', '!=', null),
      orderBy('completedAt', 'desc'),
      limit(maxResults)
    );

    const workoutsSnapshot = await getDocs(workoutsQuery);
    const workouts: WorkoutPlan[] = [];
    
    workoutsSnapshot.forEach((doc) => {
      const data = doc.data();
      workouts.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate() || null,
      } as WorkoutPlan);
    });

    // Get analytics data for each workout
    const historyPromises = workouts.map(async (workout) => {
      const analytics = await getWorkoutAnalytics(userId, workout.id);
      
      return {
        date: new Date(workout.completedAt!).toISOString().split('T')[0],
        type: workout.workoutType || 'mixed',
        duration: workout.actualDuration || workout.duration,
        feedback: analytics ? {
          difficulty: analytics.difficultyRating,
          enjoyment: analytics.enjoymentRating,
          completion: analytics.completionRate,
          adaptationSignals: generateAdaptationSignals(analytics)
        } : undefined,
        exercises: workout.exercises.slice(0, 4).map(e => e.name)
      };
    });

    return Promise.all(historyPromises);
  } catch (error) {
    console.warn('Failed to get AI optimized workout history:', error);
    return [];
  }
}

/**
 * Retrieves workout analytics for feedback analysis
 * Uses a simpler query to avoid composite index requirements
 */
async function getWorkoutAnalytics(
  userId: string,
  workoutId: string
): Promise<WorkoutAnalytics | null> {
  try {
    const analyticsRef = collection(db, 'users', userId, 'analytics');

    // First try with just the workoutId filter to avoid composite index requirement
    const analyticsQuery = query(
      analyticsRef,
      where('workoutId', '==', workoutId),
      limit(10) // Get more results to filter manually
    );

    const analyticsSnapshot = await getDocs(analyticsQuery);

    if (analyticsSnapshot.empty) {
      return null;
    }

    // Manually sort by createdAt and get the most recent
    const docs = analyticsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (docs.length === 0) {
      return null;
    }

    // Safely convert to WorkoutAnalytics with proper type checking
    const analyticsData = docs[0];

    // Validate required fields exist
    if (!('workoutId' in analyticsData) || !('userId' in analyticsData)) {
      console.warn('Invalid analytics data structure - missing required fields:', analyticsData);
      return null;
    }

    // Return with proper type assertion
    return analyticsData as unknown as WorkoutAnalytics;
  } catch (error) {
    console.warn('Failed to get workout analytics:', error);

    // Fallback: Return null to continue without analytics
    // This prevents the entire workout generation from failing
    return null;
  }
}

/**
 * Generates adaptation signals from workout analytics
 */
function generateAdaptationSignals(analytics: WorkoutAnalytics): AdaptationSignal[] {
  const signals: AdaptationSignal[] = [];

  // Difficulty-based adaptations
  if (analytics.difficultyRating <= 2) {
    signals.push('INCREASE_INTENSITY');
  } else if (analytics.difficultyRating >= 4) {
    signals.push('REDUCE_INTENSITY');
  }

  // Volume adaptations
  if (analytics.completionRate < 80) {
    signals.push('REDUCE_VOLUME');
  } else if (analytics.completionRate === 100 && analytics.difficultyRating <= 2) {
    signals.push('INCREASE_VOLUME');
  }

  // Style preferences
  if (analytics.enjoymentRating >= 4) {
    signals.push('REPEAT_STYLE');
  } else if (analytics.enjoymentRating <= 2) {
    signals.push('VARY_STYLE');
  }

  // Recovery adaptations
  if (analytics.energyLevel === 'low' && analytics.perceivedExertion >= 8) {
    signals.push('INCREASE_RECOVERY');
  } else if (analytics.energyLevel === 'high' && analytics.perceivedExertion <= 4) {
    signals.push('REDUCE_RECOVERY');
  }

  // Form and progression
  const avgFormQuality = analytics.exercisePerformance.reduce(
    (sum, ex) => sum + (ex.formQuality || 3), 0
  ) / analytics.exercisePerformance.length;

  if (avgFormQuality <= 2) {
    signals.push('FOCUS_FORM');
  } else if (avgFormQuality >= 4 && analytics.difficultyRating <= 2) {
    signals.push('ADD_PROGRESSION');
  }

  return signals;
}

/**
 * Creates a compressed feedback string optimized for API token efficiency
 */
export function createCompressedFeedback(
  workoutHistory: WorkoutHistoryEntry[]
): string {
  if (workoutHistory.length === 0) return '';

  const feedbackParts: string[] = [];

  workoutHistory.forEach((workout, index) => {
    if (!workout.feedback) return;

    const { difficulty, enjoyment, completion, adaptationSignals } = workout.feedback;
    
    // Create compact representation
    const workoutFeedback = [
      `W${index + 1}:${workout.type}`,
      `D${difficulty}E${enjoyment}C${completion}%`,
      adaptationSignals && adaptationSignals.length > 0 
        ? `[${adaptationSignals.map(s => s.split('_')[0]).join(',')}]`
        : null
    ].filter(Boolean).join('|');

    feedbackParts.push(workoutFeedback);
  });

  return feedbackParts.length > 0 
    ? `HISTORY{${feedbackParts.join(' ')}}` 
    : '';
}

/**
 * Builds an enhanced workout request with feedback context
 */
export function buildFeedbackEnhancedRequest(
  baseRequest: string,
  workoutHistory: WorkoutHistoryEntry[]
): string {
  const compressedFeedback = createCompressedFeedback(workoutHistory);
  
  if (!compressedFeedback) {
    return baseRequest;
  }

  // Extract adaptation insights
  const allSignals = workoutHistory
    .flatMap(w => w.feedback?.adaptationSignals || [])
    .filter((signal, index, arr) => arr.indexOf(signal) === index); // Remove duplicates

  const adaptationContext = allSignals.length > 0
    ? ` Adapt based on: ${allSignals.map(s => s.toLowerCase().replace('_', ' ')).join(', ')}.`
    : '';

  // Insert feedback context before requirements
  const [intro, requirements] = baseRequest.split('\nRequirements:');
  
  return `${intro}${adaptationContext} ${compressedFeedback}

Requirements:${requirements}`;
}

/**
 * Validates and optimizes feedback data for AI consumption
 */
export function validateFeedbackData(feedback: any): boolean {
  if (!feedback || typeof feedback !== 'object') return false;
  
  // Check required fields
  const requiredFields = ['difficulty', 'enjoyment', 'completion'];
  return requiredFields.every(field => 
    typeof feedback[field] === 'number' && 
    feedback[field] >= 0
  );
}
