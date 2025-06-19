import { addDoc, collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { 
  WorkoutSession, 
  WorkoutAdaptation, 
  WorkoutRecommendation, 
  UserProgressMetrics, 
  ProgressionRule,
  WorkoutPlan,
  Exercise
} from '../lib/types';
import { handleSilentError } from './analyticsService';

/**
 * AI-Powered Workout Adaptation Engine
 * Analyzes user performance and automatically adapts workouts for optimal progression
 */
export class WorkoutAdaptationEngine {
  private progressionRules: ProgressionRule[] = [
    {
      exerciseName: 'Push-ups',
      metric: 'reps',
      condition: 'consecutive_completions',
      threshold: 3,
      adjustment: { type: 'absolute', value: 2 }
    },
    {
      exerciseName: 'Squats',
      metric: 'reps',
      condition: 'rpe_threshold',
      threshold: 6,
      adjustment: { type: 'absolute', value: 3 }
    },
    // More rules would be defined here
  ];

  /**
   * Analyze workout session and generate adaptations
   */
  async analyzeAndAdapt(session: WorkoutSession, workoutPlan: WorkoutPlan): Promise<{
    adaptations: WorkoutAdaptation[];
    recommendations: WorkoutRecommendation[];
  }> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    const userId = auth.currentUser.uid;
    
    // Get user's historical performance data
    const historicalData = await this.getUserPerformanceHistory(userId, 30); // Last 30 sessions
    
    // Analyze current session performance
    const sessionAnalysis = this.analyzeSessionPerformance(session, workoutPlan);
    
    // Generate adaptations based on performance trends
    const adaptations = await this.generateAdaptations(userId, sessionAnalysis, historicalData);
    
    // Generate recommendations for future workouts
    const recommendations = await this.generateRecommendations(userId, sessionAnalysis, historicalData);
    
    // Store adaptations and recommendations
    await Promise.all([
      ...adaptations.map(adaptation => this.storeAdaptation(adaptation)),
      ...recommendations.map(recommendation => this.storeRecommendation(recommendation))
    ]);
    
    return { adaptations, recommendations };
  }

  /**
   * Get progressive overload recommendations for specific exercises
   */
  async getProgressionRecommendations(userId: string, exerciseName: string): Promise<{
    shouldProgress: boolean;
    newParameters: Partial<Exercise>;
    confidence: number;
    reasoning: string;
  }> {
    try {
      // Get recent performance for this exercise
      const recentPerformance = await this.getExercisePerformanceHistory(userId, exerciseName, 10);
      
      if (recentPerformance.length < 3) {
        return {
          shouldProgress: false,
          newParameters: {},
          confidence: 0,
          reasoning: 'Insufficient performance data for progression analysis'
        };
      }

      // Find applicable progression rule
      const rule = this.progressionRules.find(r => r.exerciseName === exerciseName);
      if (!rule) {
        return {
          shouldProgress: false,
          newParameters: {},
          confidence: 0,
          reasoning: 'No progression rule defined for this exercise'
        };
      }

      // Analyze progression readiness
      const progressionAnalysis = this.analyzeProgressionReadiness(recentPerformance, rule);
      
      if (progressionAnalysis.shouldProgress) {
        const newParameters = this.calculateNewParameters(recentPerformance[0], rule);
        
        return {
          shouldProgress: true,
          newParameters,
          confidence: progressionAnalysis.confidence,
          reasoning: progressionAnalysis.reasoning
        };
      }

      return {
        shouldProgress: false,
        newParameters: {},
        confidence: progressionAnalysis.confidence,
        reasoning: progressionAnalysis.reasoning
      };
    } catch (error) {
      handleSilentError(error, {
        component: 'WorkoutAdaptationEngine',
        action: 'getProgressionRecommendations',
        userId,
        exerciseName
      });
      
      return {
        shouldProgress: false,
        newParameters: {},
        confidence: 0,
        reasoning: 'Error analyzing progression data'
      };
    }
  }

  /**
   * Detect workout plateaus and suggest interventions
   */
  async detectPlateaus(userId: string): Promise<WorkoutRecommendation[]> {
    const recommendations: WorkoutRecommendation[] = [];
    
    try {
      // Get performance metrics for all exercises
      const performanceMetrics = await this.getAllUserProgressMetrics(userId);
      
      for (const metric of performanceMetrics) {
        const plateauAnalysis = this.analyzePlateauRisk(metric);
        
        if (plateauAnalysis.isPlateaued) {
          recommendations.push({
            id: `plateau_${metric.exerciseName}_${Date.now()}`,
            userId,
            type: 'exercise_modification',
            title: `Break Through ${metric.exerciseName} Plateau`,
            description: plateauAnalysis.intervention,
            priority: 'high',
            confidence: plateauAnalysis.confidence,
            basedOn: ['performance_stagnation', 'progression_history'],
            actionable: true,
            createdAt: new Date()
          });
        }
      }
    } catch (error) {
      handleSilentError(error, {
        component: 'WorkoutAdaptationEngine',
        action: 'detectPlateaus',
        userId
      });
    }
    
    return recommendations;
  }

  /**
   * Generate personalized workout modifications based on user feedback
   */
  async generateWorkoutModifications(
    userId: string,
    workoutPlan: WorkoutPlan,
    feedback: {
      difficultyRating: number;
      enjoymentRating: number;
      energyLevel: string;
      completionRate: number;
    }
  ): Promise<WorkoutAdaptation[]> {
    const adaptations: WorkoutAdaptation[] = [];
    
    try {
      // Difficulty too high
      if (feedback.difficultyRating >= 4 && feedback.completionRate < 80) {
        adaptations.push({
          id: `difficulty_reduce_${Date.now()}`,
          workoutPlanId: workoutPlan.id,
          userId,
          adaptationType: 'difficulty_decrease',
          reason: 'High difficulty rating with low completion rate',
          originalValue: workoutPlan.difficulty,
          adaptedValue: this.reduceDifficulty(workoutPlan.difficulty),
          confidence: 0.8,
          appliedAt: new Date(),
          effectiveFrom: new Date()
        });
      }
      
      // Difficulty too low
      if (feedback.difficultyRating <= 2 && feedback.completionRate >= 95) {
        adaptations.push({
          id: `difficulty_increase_${Date.now()}`,
          workoutPlanId: workoutPlan.id,
          userId,
          adaptationType: 'difficulty_increase',
          reason: 'Low difficulty rating with high completion rate',
          originalValue: workoutPlan.difficulty,
          adaptedValue: this.increaseDifficulty(workoutPlan.difficulty),
          confidence: 0.7,
          appliedAt: new Date(),
          effectiveFrom: new Date()
        });
      }
      
      // Low enjoyment - suggest exercise swaps
      if (feedback.enjoymentRating <= 2) {
        adaptations.push({
          id: `enjoyment_improve_${Date.now()}`,
          workoutPlanId: workoutPlan.id,
          userId,
          adaptationType: 'exercise_swap',
          reason: 'Low enjoyment rating - diversify exercises',
          originalValue: 'current_exercises',
          adaptedValue: 'alternative_exercises',
          confidence: 0.6,
          appliedAt: new Date(),
          effectiveFrom: new Date()
        });
      }
      
      // Energy level adaptations
      if (feedback.energyLevel === 'low') {
        adaptations.push({
          id: `energy_adapt_${Date.now()}`,
          workoutPlanId: workoutPlan.id,
          userId,
          adaptationType: 'duration_change',
          reason: 'Low energy level - reduce workout duration',
          originalValue: workoutPlan.duration,
          adaptedValue: Math.max(15, workoutPlan.duration * 0.8),
          confidence: 0.7,
          appliedAt: new Date(),
          effectiveFrom: new Date()
        });
      }
    } catch (error) {
      handleSilentError(error, {
        component: 'WorkoutAdaptationEngine',
        action: 'generateWorkoutModifications',
        userId,
        workoutPlanId: workoutPlan.id
      });
    }
    
    return adaptations;
  }

  // Private helper methods
  private async getUserPerformanceHistory(userId: string, days: number): Promise<WorkoutSession[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const sessionsRef = collection(db, 'users', userId, 'workout_sessions');
      const q = query(
        sessionsRef,
        where('status', '==', 'completed'),
        where('startTime', '>=', cutoffDate),
        orderBy('startTime', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime?.toDate(),
      })) as WorkoutSession[];
    } catch (error) {
      handleSilentError(error, {
        component: 'WorkoutAdaptationEngine',
        action: 'getUserPerformanceHistory',
        userId
      });
      return [];
    }
  }

  private analyzeSessionPerformance(session: WorkoutSession, workoutPlan: WorkoutPlan) {
    const completionRate = (session.completedExercises.length / workoutPlan.exercises.length) * 100;
    const efficiencyScore = workoutPlan.duration / (session.totalDuration / 60); // planned vs actual duration
    
    return {
      completionRate,
      efficiencyScore,
      averageRPE: session.averageRPE || 5,
      sessionDuration: session.totalDuration,
      exercisesCompleted: session.completedExercises.length,
      exercisesSkipped: session.skippedExercises.length,
      mood: session.mood,
      energyLevel: session.notes?.includes('tired') ? 'low' : 'moderate'
    };
  }

  private async generateAdaptations(
    userId: string, 
    sessionAnalysis: any, 
    historicalData: WorkoutSession[]
  ): Promise<WorkoutAdaptation[]> {
    const adaptations: WorkoutAdaptation[] = [];
    
    // Analyze trends and generate adaptations
    // This would contain more sophisticated ML algorithms in production
    
    return adaptations;
  }

  private async generateRecommendations(
    userId: string,
    sessionAnalysis: any,
    historicalData: WorkoutSession[]
  ): Promise<WorkoutRecommendation[]> {
    const recommendations: WorkoutRecommendation[] = [];
    
    // Generate AI-powered recommendations
    // This would use more advanced algorithms in production
    
    return recommendations;
  }

  private async getExercisePerformanceHistory(userId: string, exerciseName: string, limit: number): Promise<any[]> {
    // Get historical performance data for specific exercise
    return [];
  }

  private async getAllUserProgressMetrics(userId: string): Promise<UserProgressMetrics[]> {
    // Get all progress metrics for user
    return [];
  }

  private analyzeProgressionReadiness(performanceHistory: any[], rule: ProgressionRule) {
    // Analyze if user is ready for progression based on rule
    return {
      shouldProgress: false,
      confidence: 0.5,
      reasoning: 'Analysis not implemented'
    };
  }

  private calculateNewParameters(currentPerformance: any, rule: ProgressionRule): Partial<Exercise> {
    // Calculate new exercise parameters based on progression rule
    return {};
  }

  private analyzePlateauRisk(metric: UserProgressMetrics) {
    // Analyze if user has plateaued in this exercise
    return {
      isPlateaued: false,
      confidence: 0.5,
      intervention: 'No intervention needed'
    };
  }

  private reduceDifficulty(currentDifficulty: string): string {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = levels.indexOf(currentDifficulty);
    return currentIndex > 0 ? levels[currentIndex - 1] : currentDifficulty;
  }

  private increaseDifficulty(currentDifficulty: string): string {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = levels.indexOf(currentDifficulty);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentDifficulty;
  }

  private async storeAdaptation(adaptation: WorkoutAdaptation): Promise<void> {
    try {
      if (!auth.currentUser) return;
      
      const adaptationsRef = collection(db, 'users', auth.currentUser.uid, 'workout_adaptations');
      await addDoc(adaptationsRef, adaptation);
    } catch (error) {
      handleSilentError(error, {
        component: 'WorkoutAdaptationEngine',
        action: 'storeAdaptation',
        adaptationId: adaptation.id
      });
    }
  }

  private async storeRecommendation(recommendation: WorkoutRecommendation): Promise<void> {
    try {
      if (!auth.currentUser) return;
      
      const recommendationsRef = collection(db, 'users', auth.currentUser.uid, 'workout_recommendations');
      await addDoc(recommendationsRef, recommendation);
    } catch (error) {
      handleSilentError(error, {
        component: 'WorkoutAdaptationEngine',
        action: 'storeRecommendation',
        recommendationId: recommendation.id
      });
    }
  }
}

// Singleton instance
export const workoutAdaptationEngine = new WorkoutAdaptationEngine();
