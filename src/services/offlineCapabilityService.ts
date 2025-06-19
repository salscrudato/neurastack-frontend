import { openDB, type IDBPDatabase } from 'idb';
import type { FitnessProfile, WorkoutPlan, WorkoutSession } from '../lib/types';

/**
 * Enhanced Offline Capability Service
 * Provides comprehensive offline functionality for the NeuraFit application
 */

// Interface for offline data structure (for future use)
// interface OfflineData {
//   workoutPlans: WorkoutPlan[];
//   workoutSessions: WorkoutSession[];
//   fitnessProfile: FitnessProfile;
//   exerciseLibrary: Exercise[];
//   pendingSync: {
//     workoutPlans: WorkoutPlan[];
//     workoutSessions: WorkoutSession[];
//     profileUpdates: Partial<FitnessProfile>[];
//   };
//   lastSync: Date;
// }

export class OfflineCapabilityService {
  private db: IDBPDatabase | null = null;
  private isOnline = navigator.onLine;
  // private syncQueue: Array<{ type: string; data: any; timestamp: Date }> = [];
  private fallbackWorkouts: WorkoutPlan[] = [];

  constructor() {
    this.initializeDB();
    this.setupNetworkListeners();
    this.initializeFallbackWorkouts();
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeDB(): Promise<void> {
    try {
      this.db = await openDB('NeuraFitOffline', 1, {
        upgrade(db) {
          // Workout plans store
          if (!db.objectStoreNames.contains('workoutPlans')) {
            const workoutStore = db.createObjectStore('workoutPlans', { keyPath: 'id' });
            workoutStore.createIndex('userId', 'userId');
            workoutStore.createIndex('createdAt', 'createdAt');
          }

          // Workout sessions store
          if (!db.objectStoreNames.contains('workoutSessions')) {
            const sessionStore = db.createObjectStore('workoutSessions', { keyPath: 'id' });
            sessionStore.createIndex('userId', 'userId');
            sessionStore.createIndex('workoutPlanId', 'workoutPlanId');
            sessionStore.createIndex('status', 'status');
          }

          // Fitness profiles store
          if (!db.objectStoreNames.contains('fitnessProfiles')) {
            db.createObjectStore('fitnessProfiles', { keyPath: 'userId' });
          }

          // Exercise library store
          if (!db.objectStoreNames.contains('exerciseLibrary')) {
            const exerciseStore = db.createObjectStore('exerciseLibrary', { keyPath: 'name' });
            exerciseStore.createIndex('category', 'category');
            exerciseStore.createIndex('targetMuscles', 'targetMuscles', { multiEntry: true });
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            syncStore.createIndex('type', 'type');
            syncStore.createIndex('timestamp', 'timestamp');
          }

          // App metadata store
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
    }
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Initialize fallback workouts for offline use
   */
  private initializeFallbackWorkouts(): void {
    this.fallbackWorkouts = [
      {
        id: 'fallback_bodyweight_1',
        name: 'Bodyweight Basics',
        duration: 20,
        difficulty: 'beginner',
        workoutType: 'strength',
        createdAt: new Date(),
        completedAt: null,
        exercises: [
          {
            name: 'Push-ups',
            sets: 3,
            reps: 10,
            duration: 0,
            restTime: 60,
            instructions: 'Keep your body straight and lower your chest to the ground.',
            tips: 'Start on your knees if regular push-ups are too difficult.',
            targetMuscles: ['chest', 'shoulders', 'triceps'],
            intensity: 'moderate'
          },
          {
            name: 'Squats',
            sets: 3,
            reps: 15,
            duration: 0,
            restTime: 60,
            instructions: 'Lower your body as if sitting back into a chair.',
            tips: 'Keep your knees behind your toes and chest up.',
            targetMuscles: ['quadriceps', 'glutes', 'hamstrings'],
            intensity: 'moderate'
          },
          {
            name: 'Plank',
            sets: 3,
            reps: 1,
            duration: 30,
            restTime: 60,
            instructions: 'Hold a straight line from head to heels.',
            tips: 'Engage your core and breathe normally.',
            targetMuscles: ['core', 'shoulders'],
            intensity: 'moderate'
          }
        ]
      },
      {
        id: 'fallback_cardio_1',
        name: 'Quick Cardio Blast',
        duration: 15,
        difficulty: 'intermediate',
        workoutType: 'cardio',
        createdAt: new Date(),
        completedAt: null,
        exercises: [
          {
            name: 'Jumping Jacks',
            sets: 4,
            reps: 20,
            duration: 0,
            restTime: 30,
            instructions: 'Jump while spreading legs and raising arms overhead.',
            tips: 'Land softly on the balls of your feet.',
            targetMuscles: ['full body'],
            intensity: 'high'
          },
          {
            name: 'High Knees',
            sets: 4,
            reps: 1,
            duration: 30,
            restTime: 30,
            instructions: 'Run in place bringing knees up to waist level.',
            tips: 'Pump your arms and maintain good posture.',
            targetMuscles: ['legs', 'core'],
            intensity: 'high'
          },
          {
            name: 'Burpees',
            sets: 3,
            reps: 8,
            duration: 0,
            restTime: 45,
            instructions: 'Squat, jump back to plank, do a push-up, jump forward, then jump up.',
            tips: 'Modify by stepping back instead of jumping.',
            targetMuscles: ['full body'],
            intensity: 'high'
          }
        ]
      }
    ];
  }

  /**
   * Check if the app is currently online
   */
  isAppOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Store workout plan offline
   */
  async storeWorkoutPlanOffline(workoutPlan: WorkoutPlan, userId: string): Promise<void> {
    if (!this.db) return;

    try {
      const workoutWithUserId = { ...workoutPlan, userId };
      await this.db.put('workoutPlans', workoutWithUserId);
      
      // Add to sync queue if online sync is needed
      if (!this.isOnline) {
        await this.addToSyncQueue('workoutPlan', workoutWithUserId);
      }
    } catch (error) {
      console.error('Failed to store workout plan offline:', error);
    }
  }

  /**
   * Store workout session offline
   */
  async storeWorkoutSessionOffline(session: WorkoutSession): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.put('workoutSessions', session);
      
      // Add to sync queue if online sync is needed
      if (!this.isOnline) {
        await this.addToSyncQueue('workoutSession', session);
      }
    } catch (error) {
      console.error('Failed to store workout session offline:', error);
    }
  }

  /**
   * Store fitness profile offline
   */
  async storeFitnessProfileOffline(profile: FitnessProfile, userId: string): Promise<void> {
    if (!this.db) return;

    try {
      const profileWithUserId = { ...profile, userId };
      await this.db.put('fitnessProfiles', profileWithUserId);
      
      // Add to sync queue if online sync is needed
      if (!this.isOnline) {
        await this.addToSyncQueue('fitnessProfile', profileWithUserId);
      }
    } catch (error) {
      console.error('Failed to store fitness profile offline:', error);
    }
  }

  /**
   * Get workout plans from offline storage
   */
  async getWorkoutPlansOffline(userId: string): Promise<WorkoutPlan[]> {
    if (!this.db) return this.fallbackWorkouts;

    try {
      const tx = this.db.transaction('workoutPlans', 'readonly');
      const index = tx.store.index('userId');
      const workoutPlans = await index.getAll(userId);
      
      // If no offline workouts, return fallback workouts
      return workoutPlans.length > 0 ? workoutPlans : this.fallbackWorkouts;
    } catch (error) {
      console.error('Failed to get workout plans offline:', error);
      return this.fallbackWorkouts;
    }
  }

  /**
   * Get workout sessions from offline storage
   */
  async getWorkoutSessionsOffline(userId: string): Promise<WorkoutSession[]> {
    if (!this.db) return [];

    try {
      const tx = this.db.transaction('workoutSessions', 'readonly');
      const index = tx.store.index('userId');
      return await index.getAll(userId);
    } catch (error) {
      console.error('Failed to get workout sessions offline:', error);
      return [];
    }
  }

  /**
   * Get fitness profile from offline storage
   */
  async getFitnessProfileOffline(userId: string): Promise<FitnessProfile | null> {
    if (!this.db) return null;

    try {
      return await this.db.get('fitnessProfiles', userId) || null;
    } catch (error) {
      console.error('Failed to get fitness profile offline:', error);
      return null;
    }
  }

  /**
   * Generate offline workout based on stored profile
   */
  async generateOfflineWorkout(userId: string): Promise<WorkoutPlan | null> {
    try {
      const profile = await this.getFitnessProfileOffline(userId);
      if (!profile) return this.fallbackWorkouts[0];

      // Simple offline workout generation based on profile
      const baseWorkout = this.fallbackWorkouts.find(w => 
        w.difficulty === profile.fitnessLevel
      ) || this.fallbackWorkouts[0];

      // Customize based on available time
      const customizedWorkout: WorkoutPlan = {
        ...baseWorkout,
        id: `offline_${Date.now()}`,
        name: `Offline ${baseWorkout.name}`,
        duration: profile.availableTime || baseWorkout.duration,
        createdAt: new Date()
      };

      // Adjust exercises based on available time
      if (profile.availableTime && profile.availableTime < baseWorkout.duration) {
        const exerciseCount = Math.max(2, Math.floor(customizedWorkout.exercises.length * 0.7));
        customizedWorkout.exercises = customizedWorkout.exercises.slice(0, exerciseCount);
      }

      return customizedWorkout;
    } catch (error) {
      console.error('Failed to generate offline workout:', error);
      return this.fallbackWorkouts[0];
    }
  }

  /**
   * Add item to sync queue
   */
  private async addToSyncQueue(type: string, data: any): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.add('syncQueue', {
        type,
        data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  /**
   * Sync pending data when online
   */
  async syncPendingData(): Promise<void> {
    if (!this.db || !this.isOnline) return;

    try {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const syncItems = await tx.store.getAll();

      for (const item of syncItems) {
        try {
          // Attempt to sync each item
          await this.syncItem(item);
          
          // Remove from queue if successful
          await tx.store.delete(item.id);
        } catch (error) {
          console.warn('Failed to sync item:', item, error);
          // Keep in queue for next sync attempt
        }
      }
    } catch (error) {
      console.error('Failed to sync pending data:', error);
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: any): Promise<void> {
    // This would integrate with the actual Firebase sync logic
    // For now, it's a placeholder that would call the appropriate service methods
    
    switch (item.type) {
      case 'workoutPlan':
        // Call actual workout plan sync service
        break;
      case 'workoutSession':
        // Call actual workout session sync service
        break;
      case 'fitnessProfile':
        // Call actual fitness profile sync service
        break;
      default:
        console.warn('Unknown sync item type:', item.type);
    }
  }

  /**
   * Clear offline data (for logout or reset)
   */
  async clearOfflineData(userId?: string): Promise<void> {
    if (!this.db) return;

    try {
      if (userId) {
        // Clear data for specific user
        const stores = ['workoutPlans', 'workoutSessions', 'fitnessProfiles'];
        
        for (const storeName of stores) {
          const tx = this.db.transaction(storeName, 'readwrite');
          if (storeName === 'fitnessProfiles') {
            await tx.store.delete(userId);
          } else {
            const index = tx.store.index('userId');
            const keys = await index.getAllKeys(userId);
            for (const key of keys) {
              await tx.store.delete(key);
            }
          }
        }
      } else {
        // Clear all data
        const storeNames = ['workoutPlans', 'workoutSessions', 'fitnessProfiles', 'syncQueue'];
        for (const storeName of storeNames) {
          await this.db.clear(storeName);
        }
      }
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  /**
   * Get offline storage statistics
   */
  async getOfflineStats(): Promise<{
    workoutPlans: number;
    workoutSessions: number;
    pendingSync: number;
    storageUsed: number;
  }> {
    if (!this.db) {
      return { workoutPlans: 0, workoutSessions: 0, pendingSync: 0, storageUsed: 0 };
    }

    try {
      const [workoutPlans, workoutSessions, syncQueue] = await Promise.all([
        this.db.count('workoutPlans'),
        this.db.count('workoutSessions'),
        this.db.count('syncQueue')
      ]);

      // Estimate storage usage (rough calculation)
      const storageUsed = await this.estimateStorageUsage();

      return {
        workoutPlans,
        workoutSessions,
        pendingSync: syncQueue,
        storageUsed
      };
    } catch (error) {
      console.error('Failed to get offline stats:', error);
      return { workoutPlans: 0, workoutSessions: 0, pendingSync: 0, storageUsed: 0 };
    }
  }

  /**
   * Estimate storage usage in bytes
   */
  private async estimateStorageUsage(): Promise<number> {
    if (!this.db) return 0;

    try {
      // This is a rough estimation
      // In a real implementation, you might use navigator.storage.estimate()
      const storeNames = ['workoutPlans', 'workoutSessions', 'fitnessProfiles', 'syncQueue'];
      let totalSize = 0;

      for (const storeName of storeNames) {
        const data = await this.db.getAll(storeName);
        const serialized = JSON.stringify(data);
        totalSize += new Blob([serialized]).size;
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to estimate storage usage:', error);
      return 0;
    }
  }
}

// Singleton instance
export const offlineCapabilityService = new OfflineCapabilityService();
