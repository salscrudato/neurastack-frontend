/**
 * Workout Analytics Service
 * 
 * Provides advanced analytics and insights for workout data,
 * supporting AI-driven personalization and optimization.
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
import { handleSilentError } from '../utils/errorHandler';

// ============================================================================
// Types for Analytics
// ============================================================================

export interface WorkoutAnalytics {
  userId: string;
  workoutId: string;
  
  // Performance metrics
  completionRate: number; // 0-100
  actualDuration: number; // minutes
  plannedDuration: number; // minutes
  efficiencyScore: number; // actual vs planned duration
  
  // Exercise-level analytics
  exercisePerformance: ExercisePerformance[];
  
  // User feedback
  difficultyRating: number; // 1-5 scale
  enjoymentRating: number; // 1-5 scale
  energyLevel: 'low' | 'moderate' | 'high';
  perceivedExertion: number; // 1-10 RPE scale
  
  // Contextual data
  timeOfDay: string;
  dayOfWeek: string;
  environmentalFactors: string[];
  
  // AI insights
  aiRecommendations: string[];
  adaptationSuggestions: string[];
  
  createdAt: Date;
}

export interface ExercisePerformance {
  exerciseName: string;
  targetMuscles: string[];
  plannedSets: number;
  completedSets: number;
  plannedReps: number;
  actualReps: number[];
  formQuality: number; // 1-5 scale
  difficulty: number; // 1-5 scale
  modifications: string[];
}

export interface WorkoutInsights {
  userId: string;
  
  // Progress trends
  progressTrends: {
    completionRatesTrend: number[]; // Last 10 workouts
    durationTrend: number[];
    difficultyProgression: string[];
    strengthGains: Record<string, number>; // muscle group -> improvement %
  };
  
  // Preferences analysis
  preferences: {
    preferredWorkoutTypes: string[];
    preferredMuscleGroups: string[];
    optimalWorkoutTime: string;
    preferredDuration: number;
    equipmentUsage: Record<string, number>;
  };
  
  // Performance patterns
  patterns: {
    bestPerformanceDays: string[];
    bestPerformanceTimes: string[];
    consistencyScore: number; // 0-100
    adherenceRate: number; // 0-100
  };
  
  // AI recommendations
  recommendations: {
    nextWorkoutSuggestions: string[];
    progressionRecommendations: string[];
    recoveryRecommendations: string[];
    goalAdjustments: string[];
  };
  
  lastUpdated: Date;
}

// ============================================================================
// Analytics Functions
// ============================================================================

/**
 * Store workout analytics data
 */
export async function storeWorkoutAnalytics(analytics: Omit<WorkoutAnalytics, 'createdAt'>): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to store analytics');
  }

  try {
    const userId = auth.currentUser.uid;
    // Fix: Use correct Firestore path structure - collections need odd number of segments
    const analyticsRef = collection(db, 'users', userId, 'analytics');

    const analyticsData = {
      ...analytics,
      createdAt: serverTimestamp() as Timestamp,
    };

    await addDoc(analyticsRef, analyticsData);
    console.log('✅ Workout analytics stored successfully');
  } catch (error) {
    handleSilentError(error, {
      component: 'workoutAnalyticsService',
      action: 'storeWorkoutAnalytics',
      userId: auth.currentUser?.uid
    });
    throw error;
  }
}

/**
 * Generate workout insights from historical data
 */
export async function generateWorkoutInsights(): Promise<WorkoutInsights | null> {
  if (!auth.currentUser) {
    return null;
  }

  try {
    const userId = auth.currentUser.uid;
    // Fix: Use correct Firestore path structure - collections need odd number of segments
    const analyticsRef = collection(db, 'users', userId, 'analytics');
    
    // Get last 30 workout analytics
    const q = query(
      analyticsRef,
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    const querySnapshot = await getDocs(q);
    const analyticsData: WorkoutAnalytics[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      analyticsData.push({
        ...data,
        createdAt: data.createdAt.toDate(),
      } as WorkoutAnalytics);
    });

    if (analyticsData.length === 0) {
      return null;
    }

    // Generate insights from the data
    const insights = analyzeWorkoutData(analyticsData, userId);
    return insights;

  } catch (error) {
    handleSilentError(error, {
      component: 'workoutAnalyticsService',
      action: 'generateWorkoutInsights',
      userId: auth.currentUser?.uid
    });
    return null;
  }
}

/**
 * Analyze workout data to generate insights
 */
function analyzeWorkoutData(analyticsData: WorkoutAnalytics[], userId: string): WorkoutInsights {
  const recentData = analyticsData.slice(0, 10); // Last 10 workouts
  
  // Calculate progress trends
  const completionRatesTrend = recentData.map(a => a.completionRate);
  const durationTrend = recentData.map(a => a.actualDuration);
  const difficultyProgression = recentData.map(a => 
    a.difficultyRating > 3 ? 'challenging' : a.difficultyRating > 2 ? 'moderate' : 'easy'
  );

  // Analyze preferences
  const workoutTypeFreq: Record<string, number> = {};
  const muscleGroupFreq: Record<string, number> = {};
  const timeOfDayFreq: Record<string, number> = {};
  const equipmentFreq: Record<string, number> = {};

  analyticsData.forEach(analytics => {
    // Time preferences
    timeOfDayFreq[analytics.timeOfDay] = (timeOfDayFreq[analytics.timeOfDay] || 0) + 1;
    
    // Exercise preferences
    analytics.exercisePerformance.forEach(exercise => {
      exercise.targetMuscles.forEach(muscle => {
        muscleGroupFreq[muscle] = (muscleGroupFreq[muscle] || 0) + 1;
      });
    });
  });

  // Calculate performance patterns
  const dayPerformance: Record<string, number[]> = {};
  const timePerformance: Record<string, number[]> = {};

  analyticsData.forEach(analytics => {
    if (!dayPerformance[analytics.dayOfWeek]) {
      dayPerformance[analytics.dayOfWeek] = [];
    }
    dayPerformance[analytics.dayOfWeek].push(analytics.completionRate);

    if (!timePerformance[analytics.timeOfDay]) {
      timePerformance[analytics.timeOfDay] = [];
    }
    timePerformance[analytics.timeOfDay].push(analytics.completionRate);
  });

  // Find best performance patterns
  const bestPerformanceDays = Object.entries(dayPerformance)
    .map(([day, rates]) => ({
      day,
      avgRate: rates.reduce((sum, rate) => sum + rate, 0) / rates.length
    }))
    .sort((a, b) => b.avgRate - a.avgRate)
    .slice(0, 3)
    .map(item => item.day);

  const bestPerformanceTimes = Object.entries(timePerformance)
    .map(([time, rates]) => ({
      time,
      avgRate: rates.reduce((sum, rate) => sum + rate, 0) / rates.length
    }))
    .sort((a, b) => b.avgRate - a.avgRate)
    .slice(0, 2)
    .map(item => item.time);

  // Calculate consistency and adherence
  const consistencyScore = calculateConsistencyScore(analyticsData);
  const adherenceRate = calculateAdherenceRate(analyticsData);

  // Generate AI recommendations
  const recommendations = generateAIRecommendations(analyticsData, {
    bestPerformanceDays,
    bestPerformanceTimes,
    consistencyScore,
    adherenceRate
  });

  return {
    userId,
    progressTrends: {
      completionRatesTrend,
      durationTrend,
      difficultyProgression,
      strengthGains: calculateStrengthGains(analyticsData)
    },
    preferences: {
      preferredWorkoutTypes: getTopPreferences(workoutTypeFreq, 3),
      preferredMuscleGroups: getTopPreferences(muscleGroupFreq, 5),
      optimalWorkoutTime: getTopPreferences(timeOfDayFreq, 1)[0] || 'morning',
      preferredDuration: Math.round(durationTrend.reduce((sum, d) => sum + d, 0) / durationTrend.length),
      equipmentUsage: equipmentFreq
    },
    patterns: {
      bestPerformanceDays,
      bestPerformanceTimes,
      consistencyScore,
      adherenceRate
    },
    recommendations,
    lastUpdated: new Date()
  };
}

// Helper functions
function calculateConsistencyScore(data: WorkoutAnalytics[]): number {
  if (data.length < 2) return 0;
  
  const completionRates = data.map(d => d.completionRate);
  const mean = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
  const variance = completionRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / completionRates.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  return Math.max(0, 100 - (standardDeviation * 2));
}

function calculateAdherenceRate(data: WorkoutAnalytics[]): number {
  const completedWorkouts = data.filter(d => d.completionRate >= 80).length;
  return (completedWorkouts / data.length) * 100;
}

function calculateStrengthGains(data: WorkoutAnalytics[]): Record<string, number> {
  // Simplified strength gain calculation based on difficulty progression
  const muscleGroupProgress: Record<string, number[]> = {};
  
  data.forEach(analytics => {
    analytics.exercisePerformance.forEach(exercise => {
      exercise.targetMuscles.forEach(muscle => {
        if (!muscleGroupProgress[muscle]) {
          muscleGroupProgress[muscle] = [];
        }
        muscleGroupProgress[muscle].push(exercise.difficulty);
      });
    });
  });

  const strengthGains: Record<string, number> = {};
  Object.entries(muscleGroupProgress).forEach(([muscle, difficulties]) => {
    if (difficulties.length >= 3) {
      const recent = difficulties.slice(-3);
      const earlier = difficulties.slice(0, 3);
      const recentAvg = recent.reduce((sum, d) => sum + d, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, d) => sum + d, 0) / earlier.length;
      strengthGains[muscle] = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    }
  });

  return strengthGains;
}

function getTopPreferences(freq: Record<string, number>, count: number): string[] {
  return Object.entries(freq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, count)
    .map(([item]) => item);
}

function generateAIRecommendations(
  data: WorkoutAnalytics[], 
  patterns: { bestPerformanceDays: string[]; bestPerformanceTimes: string[]; consistencyScore: number; adherenceRate: number; }
): WorkoutInsights['recommendations'] {
  const recommendations: WorkoutInsights['recommendations'] = {
    nextWorkoutSuggestions: [],
    progressionRecommendations: [],
    recoveryRecommendations: [],
    goalAdjustments: []
  };

  // Analyze recent performance for recommendations
  const recentData = data.slice(0, 5);
  const avgCompletionRate = recentData.reduce((sum, d) => sum + d.completionRate, 0) / recentData.length;
  const avgDifficulty = recentData.reduce((sum, d) => sum + d.difficultyRating, 0) / recentData.length;

  // Next workout suggestions
  if (avgCompletionRate > 90) {
    recommendations.nextWorkoutSuggestions.push('Consider increasing workout intensity or duration');
  } else if (avgCompletionRate < 70) {
    recommendations.nextWorkoutSuggestions.push('Focus on shorter, more manageable workouts');
  }

  // Progression recommendations
  if (avgDifficulty < 2.5) {
    recommendations.progressionRecommendations.push('Ready to progress to more challenging exercises');
  } else if (avgDifficulty > 4) {
    recommendations.progressionRecommendations.push('Consider scaling back difficulty to maintain form');
  }

  // Recovery recommendations
  const recentEnergyLevels = recentData.map(d => d.energyLevel);
  const lowEnergyCount = recentEnergyLevels.filter(level => level === 'low').length;
  if (lowEnergyCount >= 3) {
    recommendations.recoveryRecommendations.push('Consider adding more rest days or reducing workout intensity');
  }

  // Goal adjustments
  if (patterns.adherenceRate < 60) {
    recommendations.goalAdjustments.push('Consider adjusting workout frequency or duration goals');
  }

  return recommendations;
}
