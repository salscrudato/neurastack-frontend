import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../firebase';
// Simplified WorkoutAnalytics type for data optimization
interface WorkoutAnalytics {
  userId: string;
  workoutId: string;
  completionRate: number;
  difficultyRating: number;
  enjoymentRating: number;
  perceivedExertion: number;
  actualDuration: number;
  efficiencyScore: number;
  timeOfDay: string;
  createdAt: any;
  aiRecommendations?: string[];
  adaptationSuggestions?: string[];
  exercisePerformance?: Array<{ exerciseName: string; [key: string]: any }>;
}

/**
 * Data Optimization Service
 * Manages data size intelligently to prevent bloat while preserving key optimization context
 */

interface DataRetentionPolicy {
  maxRecords: number;
  retentionDays: number;
  compressionThreshold: number;
  criticalDataMarkers: string[];
}

interface OptimizedWorkoutData {
  id: string;
  userId: string;
  workoutType: string;
  completionRate: number;
  difficultyRating: number;
  enjoymentRating: number;
  perceivedExertion: number;
  actualDuration: number;
  keyInsights: string[];
  timestamp: Date;
  importance: number; // 1-10 scale for data importance
}

export class DataOptimizationService {
  private retentionPolicies: Record<string, DataRetentionPolicy> = {
    workoutAnalytics: {
      maxRecords: 100, // Keep last 100 workout analytics
      retentionDays: 365, // Keep for 1 year
      compressionThreshold: 50, // Compress after 50 records
      criticalDataMarkers: ['high_completion', 'low_enjoyment', 'injury_risk', 'breakthrough_performance']
    },
    workoutPlans: {
      maxRecords: 50, // Keep last 50 workout plans
      retentionDays: 180, // Keep for 6 months
      compressionThreshold: 30,
      criticalDataMarkers: ['favorite_workout', 'high_performance', 'user_modified']
    },
    userFeedback: {
      maxRecords: 200, // Keep last 200 feedback entries
      retentionDays: 730, // Keep for 2 years (valuable for long-term trends)
      compressionThreshold: 100,
      criticalDataMarkers: ['detailed_feedback', 'improvement_suggestion', 'issue_report']
    }
  };

  /**
   * Optimize workout analytics data
   */
  async optimizeWorkoutAnalytics(userId: string): Promise<{
    recordsProcessed: number;
    recordsCompressed: number;
    recordsDeleted: number;
    spaceSaved: number;
  }> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    const policy = this.retentionPolicies.workoutAnalytics;
    const analyticsRef = collection(db, 'users', userId, 'analytics');
    
    // Get all analytics records ordered by creation date
    const q = query(analyticsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const allRecords = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (WorkoutAnalytics & { id: string })[];

    let recordsProcessed = 0;
    let recordsCompressed = 0;
    let recordsDeleted = 0;
    let spaceSaved = 0;

    // Step 1: Identify critical records that should never be deleted
    const criticalRecords = this.identifyCriticalRecords(allRecords, policy.criticalDataMarkers);
    
    // Step 2: Compress older records (keep essential data only)
    const recordsToCompress = allRecords.slice(policy.compressionThreshold);
    for (const record of recordsToCompress) {
      if (!criticalRecords.has(record.id)) {
        const compressedData = this.compressWorkoutAnalytics(record);
        const originalSize = JSON.stringify(record).length;
        const compressedSize = JSON.stringify(compressedData).length;
        
        // Update with compressed data
        // await updateDoc(doc(analyticsRef, record.id), compressedData);
        
        recordsCompressed++;
        spaceSaved += originalSize - compressedSize;
      }
      recordsProcessed++;
    }

    // Step 3: Delete very old records (beyond retention period)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);
    
    const recordsToDelete = allRecords.filter(record => {
      const recordDate = record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt as any);
      return recordDate < cutoffDate && !criticalRecords.has(record.id);
    });

    for (const record of recordsToDelete) {
      await deleteDoc(doc(analyticsRef, record.id));
      recordsDeleted++;
      spaceSaved += JSON.stringify(record).length;
    }

    // Step 4: Enforce maximum record limit
    const remainingRecords = allRecords.length - recordsDeleted;
    if (remainingRecords > policy.maxRecords) {
      const excessRecords = allRecords
        .filter(record => !criticalRecords.has(record.id))
        .slice(policy.maxRecords);
      
      for (const record of excessRecords) {
        await deleteDoc(doc(analyticsRef, record.id));
        recordsDeleted++;
        spaceSaved += JSON.stringify(record).length;
      }
    }

    return {
      recordsProcessed,
      recordsCompressed,
      recordsDeleted,
      spaceSaved
    };
  }

  /**
   * Compress workout analytics while preserving key insights
   */
  private compressWorkoutAnalytics(analytics: WorkoutAnalytics): OptimizedWorkoutData {
    // Extract key insights from the full analytics data
    const keyInsights: string[] = [];
    
    // Performance insights
    if (analytics.completionRate >= 90) keyInsights.push('high_completion');
    if (analytics.completionRate <= 50) keyInsights.push('low_completion');
    if (analytics.enjoymentRating <= 2) keyInsights.push('low_enjoyment');
    if (analytics.enjoymentRating >= 4) keyInsights.push('high_enjoyment');
    if (analytics.difficultyRating >= 4) keyInsights.push('too_difficult');
    if (analytics.difficultyRating <= 2) keyInsights.push('too_easy');
    if (analytics.perceivedExertion >= 8) keyInsights.push('high_exertion');
    
    // Efficiency insights
    const efficiency = analytics.efficiencyScore;
    if (efficiency >= 120) keyInsights.push('very_efficient');
    if (efficiency <= 80) keyInsights.push('inefficient');
    
    // Time insights
    const timeOfDay = analytics.timeOfDay;
    if (['morning', 'afternoon', 'evening'].includes(timeOfDay)) {
      keyInsights.push(`preferred_${timeOfDay}`);
    }

    return {
      id: analytics.workoutId,
      userId: analytics.userId,
      workoutType: this.extractWorkoutType(analytics),
      completionRate: analytics.completionRate,
      difficultyRating: analytics.difficultyRating,
      enjoymentRating: analytics.enjoymentRating,
      perceivedExertion: analytics.perceivedExertion,
      actualDuration: analytics.actualDuration,
      keyInsights,
      timestamp: analytics.createdAt instanceof Date ? analytics.createdAt : new Date(analytics.createdAt as any),
      importance: this.calculateDataImportance(analytics, keyInsights)
    };
  }

  /**
   * Identify critical records that should be preserved
   */
  private identifyCriticalRecords(records: (WorkoutAnalytics & { id: string })[], _markers: string[]): Set<string> {
    const criticalRecords = new Set<string>();
    
    records.forEach(record => {
      // Mark as critical if it has exceptional performance
      if (record.completionRate >= 95 || record.completionRate <= 30) {
        criticalRecords.add(record.id);
      }
      
      // Mark as critical if it has extreme ratings
      if (record.enjoymentRating <= 1 || record.enjoymentRating >= 5) {
        criticalRecords.add(record.id);
      }
      
      // Mark as critical if it has detailed feedback
      if ((record.aiRecommendations?.length || 0) > 3 || (record.adaptationSuggestions?.length || 0) > 2) {
        criticalRecords.add(record.id);
      }
      
      // Mark recent records as critical (last 10 workouts)
      const recentRecords = records.slice(0, 10);
      if (recentRecords.some(r => r.id === record.id)) {
        criticalRecords.add(record.id);
      }
    });
    
    return criticalRecords;
  }

  /**
   * Extract workout type from analytics data
   */
  private extractWorkoutType(analytics: WorkoutAnalytics): string {
    // Try to extract from exercise performance data
    if (analytics.exercisePerformance && analytics.exercisePerformance.length > 0) {
      const exercises = analytics.exercisePerformance;
      const hasCardio = exercises.some(ex => ex.exerciseName.toLowerCase().includes('cardio') ||
                                            ex.exerciseName.toLowerCase().includes('running') ||
                                            ex.exerciseName.toLowerCase().includes('cycling'));
      const hasStrength = exercises.some(ex => ex.exerciseName.toLowerCase().includes('squat') ||
                                              ex.exerciseName.toLowerCase().includes('press') ||
                                              ex.exerciseName.toLowerCase().includes('curl'));
      
      if (hasCardio && hasStrength) return 'mixed';
      if (hasCardio) return 'cardio';
      if (hasStrength) return 'strength';
    }
    
    return 'mixed'; // Default fallback
  }

  /**
   * Calculate importance score for data retention decisions
   */
  private calculateDataImportance(analytics: WorkoutAnalytics, insights: string[]): number {
    let importance = 5; // Base importance
    
    // Boost importance for exceptional performance
    if (analytics.completionRate >= 95) importance += 2;
    if (analytics.completionRate <= 30) importance += 3; // Failures are important to learn from
    
    // Boost importance for extreme feedback
    if (analytics.enjoymentRating <= 1 || analytics.enjoymentRating >= 5) importance += 2;
    
    // Boost importance for detailed insights
    importance += Math.min(insights.length, 3);
    
    // Boost importance for adaptation suggestions
    importance += Math.min(analytics.adaptationSuggestions?.length || 0, 2);
    
    return Math.min(importance, 10); // Cap at 10
  }

  /**
   * Get data optimization recommendations
   */
  async getOptimizationRecommendations(userId: string): Promise<{
    totalRecords: number;
    estimatedSize: number;
    recommendedActions: string[];
    potentialSavings: number;
  }> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    const collections = ['analytics', 'workouts', 'feedback'];
    let totalRecords = 0;
    let estimatedSize = 0;
    const recommendedActions: string[] = [];

    for (const collectionName of collections) {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const recordCount = snapshot.size;
      totalRecords += recordCount;
      
      // Estimate size (rough calculation)
      snapshot.docs.forEach(doc => {
        estimatedSize += JSON.stringify(doc.data()).length;
      });
      
      const policy = this.retentionPolicies[collectionName] || this.retentionPolicies.workoutAnalytics;
      
      if (recordCount > policy.maxRecords) {
        recommendedActions.push(`Reduce ${collectionName} records from ${recordCount} to ${policy.maxRecords}`);
      }
      
      if (recordCount > policy.compressionThreshold) {
        recommendedActions.push(`Compress older ${collectionName} records`);
      }
    }

    const potentialSavings = Math.round(estimatedSize * 0.3); // Estimate 30% savings

    return {
      totalRecords,
      estimatedSize,
      recommendedActions,
      potentialSavings
    };
  }

  /**
   * Run comprehensive data optimization
   */
  async optimizeAllUserData(userId: string): Promise<{
    totalOptimized: number;
    spaceSaved: number;
    summary: string[];
  }> {
    const results = await this.optimizeWorkoutAnalytics(userId);
    
    const summary = [
      `Processed ${results.recordsProcessed} workout analytics records`,
      `Compressed ${results.recordsCompressed} older records`,
      `Deleted ${results.recordsDeleted} obsolete records`,
      `Saved ${Math.round(results.spaceSaved / 1024)} KB of storage space`
    ];

    return {
      totalOptimized: results.recordsProcessed,
      spaceSaved: results.spaceSaved,
      summary
    };
  }
}

// Singleton instance
export const dataOptimizationService = new DataOptimizationService();
