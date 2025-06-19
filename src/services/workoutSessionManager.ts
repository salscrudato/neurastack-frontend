import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { WorkoutPlan, WorkoutSession } from '../lib/types';
import { handleSilentError } from './analyticsService';

/**
 * Enhanced Workout Session Manager
 * Handles complete workout lifecycle from start to completion with comprehensive tracking
 */
export class WorkoutSessionManager {
  private currentSession: WorkoutSession | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;
  private heartRateMonitor: NodeJS.Timeout | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupAutoSave();
  }

  /**
   * Start a new workout session
   */
  async startSession(workoutPlan: WorkoutPlan, context?: {
    location?: string;
    equipment?: string[];
    mood?: string;
    sleepQuality?: number;
    stressLevel?: number;
  }): Promise<WorkoutSession> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to start workout session');
    }

    // End any existing session
    if (this.currentSession && this.currentSession.status === 'in_progress') {
      await this.pauseSession();
    }

    const session: WorkoutSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workoutPlanId: workoutPlan.id,
      userId: auth.currentUser.uid,
      startTime: new Date(),
      status: 'in_progress',
      currentExerciseIndex: 0,
      completedExercises: [],
      skippedExercises: [],
      totalDuration: 0,
      activeTime: 0,
      restTime: 0,
      pauseTime: 0,
      location: context?.location as any,
      equipment: context?.equipment,
      mood: context?.mood as any,
      sleepQuality: context?.sleepQuality,
      stressLevel: context?.stressLevel,
      heartRateData: [],
    };

    this.currentSession = session;
    this.startSessionTimer();
    this.startHeartRateMonitoring();
    
    // Save to Firestore
    await this.saveSessionToFirestore(session);
    
    return session;
  }

  /**
   * Complete an exercise within the session
   */
  async completeExercise(exerciseIndex: number, performance: {
    actualSets?: number;
    actualReps?: number[];
    actualDuration?: number;
    weight?: number[];
    rpe?: number[];
    formRating?: number;
    notes?: string;
  }): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.completedExercises.push(exerciseIndex);
    
    // Update exercise performance data
    // This would be stored separately in exercise performance collection
    await this.recordExercisePerformance(exerciseIndex, performance);
    
    // Check if workout is complete
    if (this.currentSession.completedExercises.length >= this.getWorkoutExerciseCount()) {
      await this.completeSession();
    } else {
      // Move to next exercise
      this.currentSession.currentExerciseIndex = this.getNextExerciseIndex();
      await this.saveSessionToFirestore(this.currentSession);
    }
  }

  /**
   * Skip an exercise
   */
  async skipExercise(exerciseIndex: number, reason?: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.skippedExercises.push(exerciseIndex);
    this.currentSession.currentExerciseIndex = this.getNextExerciseIndex();
    
    // Log skip reason for future adaptations
    if (reason) {
      await this.logWorkoutEvent('exercise_skipped', {
        exerciseIndex,
        reason,
        timestamp: new Date()
      });
    }
    
    await this.saveSessionToFirestore(this.currentSession);
  }

  /**
   * Pause the current session
   */
  async pauseSession(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'in_progress') {
      return;
    }

    this.currentSession.status = 'paused';
    this.currentSession.pausedAt = new Date();
    
    this.stopSessionTimer();
    this.stopHeartRateMonitoring();
    
    await this.saveSessionToFirestore(this.currentSession);
  }

  /**
   * Resume a paused session
   */
  async resumeSession(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'paused') {
      return;
    }

    const pauseDuration = this.currentSession.pausedAt 
      ? Date.now() - this.currentSession.pausedAt.getTime()
      : 0;
    
    this.currentSession.pauseTime += Math.floor(pauseDuration / 1000);
    this.currentSession.status = 'in_progress';
    this.currentSession.resumedAt = new Date();
    
    this.startSessionTimer();
    this.startHeartRateMonitoring();
    
    await this.saveSessionToFirestore(this.currentSession);
  }

  /**
   * Complete the entire workout session
   */
  async completeSession(feedback?: {
    enjoymentRating?: number;
    difficultyRating?: number;
    energyLevel?: 'low' | 'moderate' | 'high';
    notes?: string;
  }): Promise<WorkoutSession> {
    if (!this.currentSession) {
      throw new Error('No active session to complete');
    }

    this.currentSession.status = 'completed';
    this.currentSession.endTime = new Date();
    
    // Calculate final metrics
    const totalDuration = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
    this.currentSession.totalDuration = Math.floor(totalDuration / 1000);
    
    // Add feedback if provided
    if (feedback) {
      Object.assign(this.currentSession, feedback);
    }
    
    this.stopSessionTimer();
    this.stopHeartRateMonitoring();
    
    // Save final session data
    await this.saveSessionToFirestore(this.currentSession);
    
    // Generate adaptations and recommendations
    await this.generatePostWorkoutAdaptations(this.currentSession);
    
    const completedSession = this.currentSession;
    this.currentSession = null;
    
    return completedSession;
  }

  /**
   * Abandon the current session
   */
  async abandonSession(reason?: string): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    this.currentSession.status = 'abandoned';
    this.currentSession.endTime = new Date();
    this.currentSession.notes = reason ? `Abandoned: ${reason}` : 'Session abandoned';
    
    this.stopSessionTimer();
    this.stopHeartRateMonitoring();
    
    await this.saveSessionToFirestore(this.currentSession);
    this.currentSession = null;
  }

  /**
   * Get current session status
   */
  getCurrentSession(): WorkoutSession | null {
    return this.currentSession;
  }

  /**
   * Load a previous session (for resuming)
   */
  async loadSession(sessionId: string): Promise<WorkoutSession | null> {
    try {
      if (!auth.currentUser) return null;
      
      const sessionDoc = await getDoc(doc(db, 'users', auth.currentUser.uid, 'workout_sessions', sessionId));
      
      if (!sessionDoc.exists()) {
        return null;
      }
      
      const sessionData = sessionDoc.data();
      return {
        ...sessionData,
        startTime: sessionData.startTime.toDate(),
        endTime: sessionData.endTime?.toDate(),
        pausedAt: sessionData.pausedAt?.toDate(),
        resumedAt: sessionData.resumedAt?.toDate(),
      } as WorkoutSession;
    } catch (error) {
      handleSilentError(error, {
        component: 'WorkoutSessionManager',
        action: 'loadSession',
        sessionId
      });
      return null;
    }
  }

  // Private helper methods
  private setupAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      if (this.currentSession && this.currentSession.status === 'in_progress') {
        this.saveSessionToFirestore(this.currentSession).catch(error => {
          console.warn('Auto-save failed:', error);
        });
      }
    }, 30000); // Auto-save every 30 seconds
  }

  private startSessionTimer(): void {
    this.sessionTimer = setInterval(() => {
      if (this.currentSession && this.currentSession.status === 'in_progress') {
        this.currentSession.activeTime += 1;
      }
    }, 1000);
  }

  private stopSessionTimer(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private startHeartRateMonitoring(): void {
    // Placeholder for heart rate monitoring
    // In a real app, this would integrate with fitness devices
    this.heartRateMonitor = setInterval(() => {
      if (this.currentSession && 'navigator' in globalThis && 'bluetooth' in navigator) {
        // Heart rate monitoring logic would go here
      }
    }, 5000);
  }

  private stopHeartRateMonitoring(): void {
    if (this.heartRateMonitor) {
      clearInterval(this.heartRateMonitor);
      this.heartRateMonitor = null;
    }
  }

  private async saveSessionToFirestore(session: WorkoutSession): Promise<void> {
    try {
      if (!auth.currentUser) return;
      
      const sessionRef = doc(db, 'users', auth.currentUser.uid, 'workout_sessions', session.id);
      const sessionData = {
        ...session,
        startTime: serverTimestamp(),
        endTime: session.endTime ? serverTimestamp() : null,
        pausedAt: session.pausedAt ? serverTimestamp() : null,
        resumedAt: session.resumedAt ? serverTimestamp() : null,
      };
      
      await updateDoc(sessionRef, sessionData);
    } catch (error) {
      // Try to create if update fails
      try {
        const sessionsRef = collection(db, 'users', auth.currentUser!.uid, 'workout_sessions');
        await addDoc(sessionsRef, {
          ...session,
          startTime: serverTimestamp(),
          endTime: session.endTime ? serverTimestamp() : null,
        });
      } catch (createError) {
        handleSilentError(createError, {
          component: 'WorkoutSessionManager',
          action: 'saveSessionToFirestore',
          sessionId: session.id
        });
      }
    }
  }

  private getWorkoutExerciseCount(): number {
    // This would get the actual exercise count from the workout plan
    return 8; // Placeholder
  }

  private getNextExerciseIndex(): number {
    if (!this.currentSession) return 0;
    
    const totalExercises = this.getWorkoutExerciseCount();
    const completedAndSkipped = new Set([
      ...this.currentSession.completedExercises,
      ...this.currentSession.skippedExercises
    ]);
    
    for (let i = 0; i < totalExercises; i++) {
      if (!completedAndSkipped.has(i)) {
        return i;
      }
    }
    
    return totalExercises; // All exercises done
  }

  private async recordExercisePerformance(exerciseIndex: number, performance: any): Promise<void> {
    // Record detailed exercise performance for progression tracking
    // This would be implemented based on specific requirements
  }

  private async logWorkoutEvent(eventType: string, data: any): Promise<void> {
    // Log workout events for analytics and adaptation
    // This would integrate with the analytics service
  }

  private async generatePostWorkoutAdaptations(session: WorkoutSession): Promise<void> {
    // Generate workout adaptations based on session performance
    // This would use AI/ML algorithms to suggest improvements
  }

  // Cleanup method
  destroy(): void {
    this.stopSessionTimer();
    this.stopHeartRateMonitoring();
    
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
}

// Singleton instance
export const workoutSessionManager = new WorkoutSessionManager();
