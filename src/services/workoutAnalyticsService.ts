/**
 * Workout Analytics Service
 * 
 * Provides advanced analytics and insights for workout data,
 * supporting AI-driven personalization and optimization.
 */

import {
    collection,
    getDocs,
    limit,
    orderBy,
    query
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleSilentError } from '../utils/errorHandler';

// ============================================================================
// Types for Analytics
// ============================================================================

export interface WorkoutAnalytics {
  userId: string;
  workoutId: string;

  // Basic performance metrics - backend calculates complex analytics
  completionRate: number; // 0-100
  actualDuration: number; // minutes
  plannedDuration: number; // minutes

  // User feedback
  difficultyRating: number; // 1-5 scale
  enjoymentRating: number; // 1-5 scale
  energyLevel: 'low' | 'moderate' | 'high';
  perceivedExertion: number; // 1-10 RPE scale

  // Basic contextual data
  timeOfDay: string;
  dayOfWeek: string;

  // Backend will calculate: efficiency scores, exercise performance analytics,
  // environmental factors, AI recommendations, and adaptation suggestions

  createdAt: Date;
}

// ExercisePerformance tracking moved to backend

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
 * @deprecated Backend now handles all analytics automatically via the completeWorkout API
 * This function is kept for backward compatibility but is no longer used
 */
export async function storeWorkoutAnalytics(_analytics: Omit<WorkoutAnalytics, 'createdAt'>): Promise<void> {
  console.warn('storeWorkoutAnalytics is deprecated - backend handles analytics automatically');
  // Backend handles all analytics through the completeWorkout API
  // No local storage needed
}

/**
 * Generate comprehensive workout insights from session data
 */
export async function generateWorkoutInsights(): Promise<WorkoutInsights | null> {
  if (!auth.currentUser) {
    return null;
  }

  try {
    const userId = auth.currentUser.uid;

    // Get workout sessions for analysis
    const sessionsRef = collection(db, 'users', userId, 'workoutSessions');
    const q = query(
      sessionsRef,
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const sessionData: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sessionData.push({
        ...data,
        createdAt: data.createdAt.toDate(),
        startTime: data.startTime.toDate(),
        endTime: data.endTime?.toDate(),
      });
    });

    if (sessionData.length === 0) {
      return null;
    }

    // Generate comprehensive insights
    const insights = analyzeWorkoutSessionData(sessionData, userId);
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
 * @deprecated - Use analyzeWorkoutSessionData instead
 */
/*
function analyzeWorkoutData(
  _analyticsData: WorkoutAnalytics[],
  _userId: string
): WorkoutInsights {
  const recentData = _analyticsData.slice(0, 10); // Last 10 workouts
  
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
*/

// Helper functions (commented out as they were only used by deprecated function)
/*
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
*/

/**
 * Analyze workout session data for enhanced insights
 */
function analyzeWorkoutSessionData(sessionData: any[], userId: string): WorkoutInsights {
  const totalWorkouts = sessionData.length;
  const completedWorkouts = sessionData.filter(s => s.status === 'completed');

  if (completedWorkouts.length === 0) {
    return {
      userId,
      progressTrends: {
        completionRatesTrend: [],
        durationTrend: [],
        difficultyProgression: [],
        strengthGains: {}
      },
      preferences: {
        preferredWorkoutTypes: [],
        preferredMuscleGroups: [],
        optimalWorkoutTime: 'morning',
        preferredDuration: 30,
        equipmentUsage: {}
      },
      patterns: {
        bestPerformanceDays: [],
        bestPerformanceTimes: [],
        consistencyScore: 0,
        adherenceRate: 0
      },
      recommendations: {
        nextWorkoutSuggestions: ['Start with your first workout!'],
        progressionRecommendations: [],
        recoveryRecommendations: [],
        goalAdjustments: []
      },
      lastUpdated: new Date()
    };
  }

  // Calculate averages and trends
  const averageDuration = completedWorkouts.reduce((sum, w) => sum + (w.totalDuration / 60), 0) / completedWorkouts.length;
  const averageCompletionRate = completedWorkouts.reduce((sum, w) => sum + (w.sessionAnalytics?.exerciseCompletionRate || 0), 0) / completedWorkouts.length;

  // Calculate progression trends
  const recentWorkouts = completedWorkouts.slice(0, 10);
  const olderWorkouts = completedWorkouts.slice(10, 20);

  const recentAvgWeight = recentWorkouts.reduce((sum, w) => sum + (w.sessionAnalytics?.totalWeightLifted || 0), 0) / recentWorkouts.length;
  const olderAvgWeight = olderWorkouts.reduce((sum, w) => sum + (w.sessionAnalytics?.totalWeightLifted || 0), 0) / olderWorkouts.length;

  const strengthProgression = olderAvgWeight > 0 ? (recentAvgWeight - olderAvgWeight) / olderAvgWeight : 0;

  // Calculate consistency
  const workoutDates = completedWorkouts.map(w => new Date(w.startTime).toDateString());
  const uniqueDates = new Set(workoutDates);
  const consistencyScore = (uniqueDates.size / Math.min(30, totalWorkouts)) * 100;

  // Find patterns
  const workoutsByDay = completedWorkouts.reduce((acc, w) => {
    const day = new Date(w.startTime).toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bestWorkoutDay = Object.entries(workoutsByDay)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'Monday';

  return {
    userId,
    progressTrends: {
      completionRatesTrend: recentWorkouts.map(w => w.sessionAnalytics?.exerciseCompletionRate || 0),
      durationTrend: recentWorkouts.map(w => w.totalDuration / 60),
      difficultyProgression: recentWorkouts.map(() => 'moderate'), // Simplified
      strengthGains: { overall: strengthProgression * 100 }
    },
    preferences: {
      preferredWorkoutTypes: [bestWorkoutDay],
      preferredMuscleGroups: ['mixed'],
      optimalWorkoutTime: 'morning',
      preferredDuration: Math.round(averageDuration),
      equipmentUsage: {}
    },
    patterns: {
      bestPerformanceDays: [bestWorkoutDay],
      bestPerformanceTimes: ['morning'],
      consistencyScore,
      adherenceRate: averageCompletionRate
    },
    recommendations: generateSessionRecommendations(sessionData, strengthProgression, consistencyScore, averageCompletionRate),
    lastUpdated: new Date()
  };
}

/**
 * Generate personalized recommendations based on session data
 */
function generateSessionRecommendations(
  sessionData: any[],
  strengthProgression: number,
  consistencyScore: number,
  averageCompletionRate: number
): WorkoutInsights['recommendations'] {
  const recommendations: WorkoutInsights['recommendations'] = {
    nextWorkoutSuggestions: [],
    progressionRecommendations: [],
    recoveryRecommendations: [],
    goalAdjustments: []
  };

  // Next workout suggestions
  if (averageCompletionRate > 90) {
    recommendations.nextWorkoutSuggestions.push('You\'re crushing it! Try a more challenging workout');
  } else if (averageCompletionRate < 70) {
    recommendations.nextWorkoutSuggestions.push('Focus on completing exercises with good form');
  } else {
    recommendations.nextWorkoutSuggestions.push('Keep up the great work with your current routine');
  }

  // Progression recommendations
  if (strengthProgression > 0.1) {
    recommendations.progressionRecommendations.push('Excellent strength gains! Consider increasing weights by 5-10%');
  } else if (strengthProgression < 0.05) {
    recommendations.progressionRecommendations.push('Try progressive overload - gradually increase weight or reps');
  }

  // Recovery recommendations
  const recentWorkouts = sessionData.slice(0, 5);
  const earlyCompletions = recentWorkouts.filter(w => w.completedEarly).length;
  if (earlyCompletions >= 3) {
    recommendations.recoveryRecommendations.push('Consider taking a rest day or reducing workout intensity');
  }

  // Goal adjustments
  if (consistencyScore < 60) {
    recommendations.goalAdjustments.push('Try setting smaller, more achievable workout goals');
  } else if (consistencyScore > 80) {
    recommendations.goalAdjustments.push('Great consistency! Consider setting more ambitious goals');
  }

  return recommendations;
}
