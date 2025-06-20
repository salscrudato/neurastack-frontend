import type { FitnessProfile, WorkoutPlan } from '../lib/types';

export interface ProgressionMetrics {
  completionRate: number;
  averageDuration: number;
  consistencyScore: number;
  difficultyTrend: 'increasing' | 'stable' | 'decreasing';
  recommendedAdjustment: number; // Multiplier: 1.0 = no change, 1.1 = 10% increase, 0.9 = 10% decrease
  progressionNotes: string[];
}

/**
 * Calculate progressive overload recommendations based on workout history
 */
export const calculateProgressionMetrics = (
  workoutHistory: WorkoutPlan[],
  profile: FitnessProfile
): ProgressionMetrics => {
  const completedWorkouts = workoutHistory.filter(w => w.completedAt);
  
  if (completedWorkouts.length === 0) {
    return {
      completionRate: 0,
      averageDuration: profile.availableTime,
      consistencyScore: 0,
      difficultyTrend: 'stable',
      recommendedAdjustment: 1.0,
      progressionNotes: ['Starting fresh - focus on form and consistency']
    };
  }

  // Calculate completion rate
  const completionRate = completedWorkouts.reduce((acc, workout) => {
    return acc + (workout.completionRate || 0);
  }, 0) / completedWorkouts.length;

  // Calculate average duration
  const averageDuration = completedWorkouts.reduce((acc, workout) => {
    return acc + (workout.actualDuration || workout.duration);
  }, 0) / completedWorkouts.length;

  // Calculate consistency score (workouts per week over last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const recentWorkouts = completedWorkouts.filter(w => 
    w.completedAt && new Date(w.completedAt) >= fourWeeksAgo
  );
  
  const consistencyScore = Math.min(recentWorkouts.length / 12, 1.0); // 3 workouts/week * 4 weeks = 12

  // Analyze difficulty trend
  const recentDifficulties = completedWorkouts.slice(-5).map(w => {
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
    return difficultyMap[w.difficulty];
  });

  let difficultyTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (recentDifficulties.length >= 3) {
    const firstHalf = recentDifficulties.slice(0, Math.floor(recentDifficulties.length / 2));
    const secondHalf = recentDifficulties.slice(Math.floor(recentDifficulties.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 0.2) difficultyTrend = 'increasing';
    else if (secondAvg < firstAvg - 0.2) difficultyTrend = 'decreasing';
  }

  // Calculate recommended adjustment
  let recommendedAdjustment = 1.0;
  const progressionNotes: string[] = [];

  // High completion rate suggests readiness for progression
  if (completionRate >= 0.9 && consistencyScore >= 0.8) {
    recommendedAdjustment = 1.15; // 15% increase
    progressionNotes.push('Excellent performance - ready for increased challenge');
  } else if (completionRate >= 0.8 && consistencyScore >= 0.6) {
    recommendedAdjustment = 1.1; // 10% increase
    progressionNotes.push('Good progress - moderate increase in difficulty');
  } else if (completionRate >= 0.7) {
    recommendedAdjustment = 1.05; // 5% increase
    progressionNotes.push('Steady progress - small increase to maintain growth');
  } else if (completionRate < 0.6) {
    recommendedAdjustment = 0.9; // 10% decrease
    progressionNotes.push('Focus on consistency - reducing difficulty to build confidence');
  } else {
    progressionNotes.push('Maintaining current level - focus on form and consistency');
  }

  // Adjust for consistency
  if (consistencyScore < 0.5) {
    recommendedAdjustment = Math.min(recommendedAdjustment, 1.0);
    progressionNotes.push('Prioritize consistency over intensity');
  }

  // Age-based adjustments
  const userAge = profile.ageCategory ? getAgeFromCategory(profile.ageCategory) : 30;
  if (userAge >= 50) {
    recommendedAdjustment = Math.min(recommendedAdjustment, 1.08); // Cap at 8% increase
    progressionNotes.push('Age-appropriate progression - emphasizing joint health');
  }

  return {
    completionRate,
    averageDuration,
    consistencyScore,
    difficultyTrend,
    recommendedAdjustment,
    progressionNotes
  };
};

/**
 * Apply progressive overload to workout parameters
 */
export const applyProgressiveOverload = (
  baseWorkout: {
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    sets?: number;
    reps?: number;
  },
  progressionMetrics: ProgressionMetrics
): {
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sets?: number;
  reps?: number;
  progressionNotes: string[];
} => {
  const { recommendedAdjustment } = progressionMetrics;
  
  // Adjust duration
  const adjustedDuration = Math.round(baseWorkout.duration * recommendedAdjustment);
  
  // Adjust difficulty level
  let adjustedDifficulty = baseWorkout.difficulty;
  if (recommendedAdjustment >= 1.15) {
    if (baseWorkout.difficulty === 'beginner') adjustedDifficulty = 'intermediate';
    else if (baseWorkout.difficulty === 'intermediate') adjustedDifficulty = 'advanced';
  } else if (recommendedAdjustment <= 0.9) {
    if (baseWorkout.difficulty === 'advanced') adjustedDifficulty = 'intermediate';
    else if (baseWorkout.difficulty === 'intermediate') adjustedDifficulty = 'beginner';
  }
  
  // Adjust sets and reps if provided
  const adjustedSets = baseWorkout.sets ? Math.max(1, Math.round(baseWorkout.sets * recommendedAdjustment)) : undefined;
  const adjustedReps = baseWorkout.reps ? Math.max(1, Math.round(baseWorkout.reps * recommendedAdjustment)) : undefined;

  return {
    duration: adjustedDuration,
    difficulty: adjustedDifficulty,
    sets: adjustedSets,
    reps: adjustedReps,
    progressionNotes: progressionMetrics.progressionNotes
  };
};

/**
 * Get representative age from age category
 */
const getAgeFromCategory = (ageCategory: string): number => {
  const ageMap: Record<string, number> = {
    'TEEN': 16,
    'YOUNG_ADULT': 22,
    'ADULT': 30,
    'MIDDLE_ADULT': 40,
    'MATURE_ADULT': 50,
    'SENIOR_ADULT': 60,
    'SENIOR': 70
  };
  
  return ageMap[ageCategory] || 30;
};

/**
 * Generate progression-aware workout notes
 */
export const generateProgressionNotes = (
  progressionMetrics: ProgressionMetrics,
  _workoutType: string
): string => {
  const notes: string[] = [];
  
  // Add completion rate feedback
  if (progressionMetrics.completionRate >= 0.9) {
    notes.push('🎯 Excellent completion rate - you\'re crushing your workouts!');
  } else if (progressionMetrics.completionRate >= 0.7) {
    notes.push('👍 Good progress - keep up the consistency!');
  } else if (progressionMetrics.completionRate < 0.6) {
    notes.push('💪 Focus on completing exercises - quality over quantity!');
  }
  
  // Add consistency feedback
  if (progressionMetrics.consistencyScore >= 0.8) {
    notes.push('🔥 Amazing consistency - your dedication is paying off!');
  } else if (progressionMetrics.consistencyScore < 0.5) {
    notes.push('📅 Try to maintain regular workout schedule for best results');
  }
  
  // Add progression-specific notes
  notes.push(...progressionMetrics.progressionNotes);
  
  return notes.join(' ');
};
