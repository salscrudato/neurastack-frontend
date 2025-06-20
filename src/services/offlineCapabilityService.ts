import { openDB, type IDBPDatabase } from 'idb';
import type { FitnessProfile, WorkoutPlan, WorkoutSession } from '../lib/types';

/**
 * Enhanced Offline Capability Service with Memory Management
 * Provides comprehensive offline functionality with data retention policies and cleanup mechanisms
 */

// Data retention policies
interface DataRetentionPolicy {
  maxRecords: number;
  retentionDays: number;
  cleanupThreshold: number; // Trigger cleanup when this many records exist
  compressionThreshold: number; // Compress data after this many records
}

interface MemoryPressureConfig {
  warningThreshold: number; // MB
  criticalThreshold: number; // MB
  autoCleanupEnabled: boolean;
  cleanupInterval: number; // milliseconds
}

interface StorageMetrics {
  totalSize: number;
  recordCounts: Record<string, number>;
  oldestRecords: Record<string, Date>;
  compressionRatio: number;
  lastCleanup: Date;
}

export class OfflineCapabilityService {
  private db: IDBPDatabase | null = null;
  private isOnline = navigator.onLine;
  private fallbackWorkouts: WorkoutPlan[] = [];
  private cleanupInterval: NodeJS.Timeout | null = null;
  private lastMemoryCheck = 0;

  // Data retention policies for different data types
  private retentionPolicies: Record<string, DataRetentionPolicy> = {
    workoutPlans: {
      maxRecords: 100,
      retentionDays: 365, // 1 year
      cleanupThreshold: 120,
      compressionThreshold: 80
    },
    workoutSessions: {
      maxRecords: 200,
      retentionDays: 180, // 6 months
      cleanupThreshold: 250,
      compressionThreshold: 150
    },
    syncQueue: {
      maxRecords: 50,
      retentionDays: 7, // 1 week
      cleanupThreshold: 75,
      compressionThreshold: 60
    },
    exerciseLibrary: {
      maxRecords: 500,
      retentionDays: 730, // 2 years
      cleanupThreshold: 600,
      compressionThreshold: 550
    }
  };

  // Memory pressure configuration
  private memoryConfig: MemoryPressureConfig = {
    warningThreshold: 50, // 50MB
    criticalThreshold: 100, // 100MB
    autoCleanupEnabled: true,
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
  };

  constructor() {
    this.initializeDB();
    this.setupNetworkListeners();
    this.initializeFallbackWorkouts();
    this.startMemoryMonitoring();
  }

  /**
   * Initialize IndexedDB for offline storage with enhanced memory management
   */
  private async initializeDB(): Promise<void> {
    try {
      this.db = await openDB('NeuraFitOffline', 2, {
        upgrade(db, _oldVersion) {
          // Workout plans store with enhanced indexing
          if (!db.objectStoreNames.contains('workoutPlans')) {
            const workoutStore = db.createObjectStore('workoutPlans', { keyPath: 'id' });
            workoutStore.createIndex('userId', 'userId');
            workoutStore.createIndex('createdAt', 'createdAt');
            workoutStore.createIndex('lastAccessed', 'lastAccessed');
            workoutStore.createIndex('size', 'estimatedSize');
            workoutStore.createIndex('compressed', 'isCompressed');
          }

          // Workout sessions store with retention tracking
          if (!db.objectStoreNames.contains('workoutSessions')) {
            const sessionStore = db.createObjectStore('workoutSessions', { keyPath: 'id' });
            sessionStore.createIndex('userId', 'userId');
            sessionStore.createIndex('workoutPlanId', 'workoutPlanId');
            sessionStore.createIndex('status', 'status');
            sessionStore.createIndex('completedAt', 'completedAt');
            sessionStore.createIndex('lastAccessed', 'lastAccessed');
            sessionStore.createIndex('size', 'estimatedSize');
          }

          // Fitness profiles store (no changes needed)
          if (!db.objectStoreNames.contains('fitnessProfiles')) {
            db.createObjectStore('fitnessProfiles', { keyPath: 'userId' });
          }

          // Exercise library store with better indexing
          if (!db.objectStoreNames.contains('exerciseLibrary')) {
            const exerciseStore = db.createObjectStore('exerciseLibrary', { keyPath: 'name' });
            exerciseStore.createIndex('category', 'category');
            exerciseStore.createIndex('targetMuscles', 'targetMuscles', { multiEntry: true });
            exerciseStore.createIndex('lastAccessed', 'lastAccessed');
            exerciseStore.createIndex('accessCount', 'accessCount');
          }

          // Enhanced sync queue with priority and retry tracking
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            syncStore.createIndex('type', 'type');
            syncStore.createIndex('timestamp', 'timestamp');
            syncStore.createIndex('priority', 'priority');
            syncStore.createIndex('retryCount', 'retryCount');
            syncStore.createIndex('size', 'estimatedSize');
          }

          // Enhanced metadata store for memory management
          if (!db.objectStoreNames.contains('metadata')) {
            const metadataStore = db.createObjectStore('metadata', { keyPath: 'key' });
            metadataStore.createIndex('category', 'category');
            metadataStore.createIndex('lastUpdated', 'lastUpdated');
          }

          // New: Memory metrics store for tracking usage patterns
          if (!db.objectStoreNames.contains('memoryMetrics')) {
            const metricsStore = db.createObjectStore('memoryMetrics', { keyPath: 'timestamp' });
            metricsStore.createIndex('type', 'type');
            metricsStore.createIndex('date', 'date');
          }
        },
      });

      // Initialize metadata after DB creation
      await this.initializeMetadata();
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
    }
  }

  /**
   * Initialize metadata for memory management
   */
  private async initializeMetadata(): Promise<void> {
    if (!this.db) return;

    try {
      const existingMetadata = await this.db.get('metadata', 'initialization');
      if (!existingMetadata) {
        await this.db.put('metadata', {
          key: 'initialization',
          category: 'system',
          value: {
            firstRun: new Date(),
            version: '2.0',
            lastCleanup: new Date(),
            totalCleanups: 0
          },
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to initialize metadata:', error);
    }
  }

  /**
   * Start memory monitoring and automatic cleanup
   */
  private startMemoryMonitoring(): void {
    if (!this.memoryConfig.autoCleanupEnabled) return;

    this.cleanupInterval = setInterval(async () => {
      await this.performMemoryCheck();
    }, this.memoryConfig.cleanupInterval);

    // Initial memory check
    setTimeout(() => this.performMemoryCheck(), 5000);
  }

  /**
   * Perform comprehensive memory check and cleanup if needed
   */
  private async performMemoryCheck(): Promise<void> {
    const now = Date.now();
    if (now - this.lastMemoryCheck < 30000) return; // Throttle checks to every 30 seconds

    this.lastMemoryCheck = now;

    try {
      const metrics = await this.getStorageMetrics();
      const sizeMB = metrics.totalSize / (1024 * 1024);

      // Log memory metrics in development
      if (import.meta.env.DEV) {
        console.log('📊 IndexedDB Memory Check:', {
          totalSize: `${sizeMB.toFixed(2)} MB`,
          recordCounts: metrics.recordCounts,
          compressionRatio: `${(metrics.compressionRatio * 100).toFixed(1)}%`
        });
      }

      // Trigger cleanup based on thresholds
      if (sizeMB > this.memoryConfig.criticalThreshold) {
        console.warn('🚨 Critical IndexedDB memory usage, performing aggressive cleanup');
        await this.performAggressiveCleanup();
      } else if (sizeMB > this.memoryConfig.warningThreshold) {
        console.log('⚠️ High IndexedDB memory usage, performing standard cleanup');
        await this.performStandardCleanup();
      }

      // Record metrics for analysis
      await this.recordMemoryMetrics(metrics);
    } catch (error) {
      console.error('Failed to perform memory check:', error);
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
   * Perform standard cleanup based on retention policies
   */
  private async performStandardCleanup(): Promise<void> {
    if (!this.db) return;

    let totalCleaned = 0;
    const storeNames = Object.keys(this.retentionPolicies);

    for (const storeName of storeNames) {
      try {
        const cleaned = await this.cleanupStore(storeName, false);
        totalCleaned += cleaned;
      } catch (error) {
        console.error(`Failed to cleanup store ${storeName}:`, error);
      }
    }

    if (totalCleaned > 0) {
      await this.updateCleanupMetadata(totalCleaned, 'standard');
      if (import.meta.env.DEV) {
        console.log(`🧹 Standard cleanup completed: ${totalCleaned} records removed`);
      }
    }
  }

  /**
   * Perform aggressive cleanup for critical memory situations
   */
  private async performAggressiveCleanup(): Promise<void> {
    if (!this.db) return;

    let totalCleaned = 0;
    const storeNames = Object.keys(this.retentionPolicies);

    for (const storeName of storeNames) {
      try {
        const cleaned = await this.cleanupStore(storeName, true);
        totalCleaned += cleaned;
      } catch (error) {
        console.error(`Failed to aggressively cleanup store ${storeName}:`, error);
      }
    }

    // Also compress remaining data
    await this.compressLargeRecords();

    if (totalCleaned > 0) {
      await this.updateCleanupMetadata(totalCleaned, 'aggressive');
      if (import.meta.env.DEV) {
        console.warn(`🧹 Aggressive cleanup completed: ${totalCleaned} records removed`);
      }
    }
  }

  /**
   * Cleanup a specific store based on retention policy
   */
  private async cleanupStore(storeName: string, aggressive: boolean): Promise<number> {
    if (!this.db || !this.retentionPolicies[storeName]) return 0;

    const policy = this.retentionPolicies[storeName];
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.store;

    let cleaned = 0;
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (policy.retentionDays * 24 * 60 * 60 * 1000));

    try {
      // Get all records to analyze
      const allRecords = await store.getAll();

      // Sort by creation date (oldest first)
      const sortedRecords = allRecords.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.timestamp || 0);
        const dateB = new Date(b.createdAt || b.timestamp || 0);
        return dateA.getTime() - dateB.getTime();
      });

      // Determine how many to remove
      const maxRecords = aggressive ? Math.floor(policy.maxRecords * 0.7) : policy.maxRecords;
      const recordsToRemove = Math.max(0, sortedRecords.length - maxRecords);

      // Remove old records first
      for (let i = 0; i < recordsToRemove && i < sortedRecords.length; i++) {
        const record = sortedRecords[i];
        const recordDate = new Date(record.createdAt || record.timestamp || 0);

        // Remove if too old or if we need to free space
        if (recordDate < cutoffDate || i < recordsToRemove) {
          await store.delete(record.id || record.key);
          cleaned++;
        }
      }

      // In aggressive mode, also remove records that haven't been accessed recently
      if (aggressive) {
        const recentAccessCutoff = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days

        for (const record of sortedRecords.slice(recordsToRemove)) {
          const lastAccessed = new Date(record.lastAccessed || record.createdAt || 0);
          if (lastAccessed < recentAccessCutoff && cleaned < recordsToRemove * 1.5) {
            await store.delete(record.id || record.key);
            cleaned++;
          }
        }
      }

    } catch (error) {
      console.error(`Error cleaning up store ${storeName}:`, error);
    }

    return cleaned;
  }

  /**
   * Store workout plan offline with enhanced metadata
   */
  async storeWorkoutPlanOffline(workoutPlan: WorkoutPlan, userId: string): Promise<void> {
    if (!this.db) return;

    try {
      const enhancedWorkout = {
        ...workoutPlan,
        userId,
        lastAccessed: new Date(),
        estimatedSize: this.estimateRecordSize(workoutPlan),
        isCompressed: false
      };

      await this.db.put('workoutPlans', enhancedWorkout);

      // Check if cleanup is needed
      await this.checkStoreSize('workoutPlans');

      // Add to sync queue if online sync is needed
      if (!this.isOnline) {
        await this.addToSyncQueue('workoutPlan', enhancedWorkout, 'normal');
      }
    } catch (error) {
      console.error('Failed to store workout plan offline:', error);
    }
  }

  /**
   * Store workout session offline with enhanced metadata
   */
  async storeWorkoutSessionOffline(session: WorkoutSession): Promise<void> {
    if (!this.db) return;

    try {
      const enhancedSession = {
        ...session,
        lastAccessed: new Date(),
        estimatedSize: this.estimateRecordSize(session)
      };

      await this.db.put('workoutSessions', enhancedSession);

      // Check if cleanup is needed
      await this.checkStoreSize('workoutSessions');

      // Add to sync queue if online sync is needed
      if (!this.isOnline) {
        await this.addToSyncQueue('workoutSession', enhancedSession, 'high');
      }
    } catch (error) {
      console.error('Failed to store workout session offline:', error);
    }
  }

  /**
   * Check if a store needs cleanup based on size thresholds
   */
  private async checkStoreSize(storeName: string): Promise<void> {
    if (!this.db || !this.retentionPolicies[storeName]) return;

    try {
      const count = await this.db.count(storeName);
      const policy = this.retentionPolicies[storeName];

      if (count >= policy.cleanupThreshold) {
        await this.cleanupStore(storeName, false);
      }
    } catch (error) {
      console.error(`Failed to check store size for ${storeName}:`, error);
    }
  }

  /**
   * Estimate the size of a record in bytes
   */
  private estimateRecordSize(record: any): number {
    try {
      return JSON.stringify(record).length;
    } catch {
      return 1000; // Fallback estimate
    }
  }

  /**
   * Compress large records to save space
   */
  private async compressLargeRecords(): Promise<void> {
    if (!this.db) return;

    const storeNames = ['workoutPlans', 'workoutSessions'];

    for (const storeName of storeNames) {
      try {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.store;
        const records = await store.getAll();

        for (const record of records) {
          if (record.estimatedSize > 5000 && !record.isCompressed) {
            // Simple compression: remove verbose fields for old records
            const compressedRecord = this.compressRecord(record);
            if (compressedRecord.estimatedSize < record.estimatedSize * 0.8) {
              await store.put(compressedRecord);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to compress records in ${storeName}:`, error);
      }
    }
  }

  /**
   * Compress a record by removing non-essential data
   */
  private compressRecord(record: any): any {
    const compressed = { ...record };

    // Remove verbose fields from old records
    if (compressed.exercises) {
      compressed.exercises = compressed.exercises.map((exercise: any) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        restTime: exercise.restTime,
        // Remove detailed instructions and tips for space
        targetMuscles: exercise.targetMuscles
      }));
    }

    // Mark as compressed and update size
    compressed.isCompressed = true;
    compressed.estimatedSize = this.estimateRecordSize(compressed);
    compressed.compressedAt = new Date();

    return compressed;
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
   * Add item to sync queue with priority and size tracking
   */
  private async addToSyncQueue(type: string, data: any, priority: 'low' | 'normal' | 'high' = 'normal'): Promise<void> {
    if (!this.db) return;

    try {
      const queueItem = {
        type,
        data,
        timestamp: new Date(),
        priority,
        retryCount: 0,
        estimatedSize: this.estimateRecordSize(data)
      };

      await this.db.add('syncQueue', queueItem);

      // Check if sync queue needs cleanup
      await this.checkStoreSize('syncQueue');
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  /**
   * Update cleanup metadata
   */
  private async updateCleanupMetadata(recordsCleaned: number, cleanupType: string): Promise<void> {
    if (!this.db) return;

    try {
      const metadata = await this.db.get('metadata', 'initialization') || {
        key: 'initialization',
        category: 'system',
        value: { totalCleanups: 0 },
        lastUpdated: new Date()
      };

      metadata.value.lastCleanup = new Date();
      metadata.value.totalCleanups = (metadata.value.totalCleanups || 0) + 1;
      metadata.value.lastCleanupType = cleanupType;
      metadata.value.lastCleanupRecords = recordsCleaned;
      metadata.lastUpdated = new Date();

      await this.db.put('metadata', metadata);
    } catch (error) {
      console.error('Failed to update cleanup metadata:', error);
    }
  }

  /**
   * Record memory metrics for analysis
   */
  private async recordMemoryMetrics(metrics: StorageMetrics): Promise<void> {
    if (!this.db) return;

    try {
      const now = new Date();
      const metricsRecord = {
        timestamp: now.getTime(),
        date: now.toISOString().split('T')[0], // YYYY-MM-DD
        type: 'memory_check',
        totalSize: metrics.totalSize,
        recordCounts: metrics.recordCounts,
        compressionRatio: metrics.compressionRatio
      };

      await this.db.put('memoryMetrics', metricsRecord);

      // Keep only last 30 days of metrics
      const cutoffTime = now.getTime() - (30 * 24 * 60 * 60 * 1000);
      const tx = this.db.transaction('memoryMetrics', 'readwrite');
      const index = tx.store.index('timestamp');
      const oldRecords = await index.getAll(IDBKeyRange.upperBound(cutoffTime));

      for (const record of oldRecords) {
        await tx.store.delete(record.timestamp);
      }
    } catch (error) {
      console.error('Failed to record memory metrics:', error);
    }
  }

  /**
   * Get comprehensive storage metrics
   */
  private async getStorageMetrics(): Promise<StorageMetrics> {
    if (!this.db) {
      return {
        totalSize: 0,
        recordCounts: {},
        oldestRecords: {},
        compressionRatio: 0,
        lastCleanup: new Date()
      };
    }

    try {
      const storeNames = ['workoutPlans', 'workoutSessions', 'syncQueue', 'exerciseLibrary'];
      const metrics: StorageMetrics = {
        totalSize: 0,
        recordCounts: {},
        oldestRecords: {},
        compressionRatio: 0,
        lastCleanup: new Date()
      };

      let totalRecords = 0;
      let compressedRecords = 0;

      for (const storeName of storeNames) {
        try {
          const records = await this.db.getAll(storeName);
          metrics.recordCounts[storeName] = records.length;
          totalRecords += records.length;

          // Calculate size and find oldest record
          let storeSize = 0;
          let oldestDate = new Date();

          for (const record of records) {
            const size = record.estimatedSize || this.estimateRecordSize(record);
            storeSize += size;

            if (record.isCompressed) compressedRecords++;

            const recordDate = new Date(record.createdAt || record.timestamp || Date.now());
            if (recordDate < oldestDate) {
              oldestDate = recordDate;
            }
          }

          metrics.totalSize += storeSize;
          metrics.oldestRecords[storeName] = oldestDate;
        } catch (error) {
          console.error(`Failed to get metrics for store ${storeName}:`, error);
          metrics.recordCounts[storeName] = 0;
          metrics.oldestRecords[storeName] = new Date();
        }
      }

      metrics.compressionRatio = totalRecords > 0 ? compressedRecords / totalRecords : 0;

      // Get last cleanup time
      try {
        const metadata = await this.db.get('metadata', 'initialization');
        if (metadata?.value?.lastCleanup) {
          metrics.lastCleanup = new Date(metadata.value.lastCleanup);
        }
      } catch (error) {
        // Use default
      }

      return metrics;
    } catch (error) {
      console.error('Failed to get storage metrics:', error);
      return {
        totalSize: 0,
        recordCounts: {},
        oldestRecords: {},
        compressionRatio: 0,
        lastCleanup: new Date()
      };
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
   * Get comprehensive offline storage statistics
   */
  async getOfflineStats(): Promise<{
    workoutPlans: number;
    workoutSessions: number;
    pendingSync: number;
    storageUsed: number;
    compressionRatio: number;
    lastCleanup: Date;
    memoryPressure: 'low' | 'medium' | 'high' | 'critical';
    retentionPolicies: Record<string, DataRetentionPolicy>;
  }> {
    if (!this.db) {
      return {
        workoutPlans: 0,
        workoutSessions: 0,
        pendingSync: 0,
        storageUsed: 0,
        compressionRatio: 0,
        lastCleanup: new Date(),
        memoryPressure: 'low',
        retentionPolicies: this.retentionPolicies
      };
    }

    try {
      const metrics = await this.getStorageMetrics();
      const sizeMB = metrics.totalSize / (1024 * 1024);

      let memoryPressure: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (sizeMB > this.memoryConfig.criticalThreshold) {
        memoryPressure = 'critical';
      } else if (sizeMB > this.memoryConfig.warningThreshold) {
        memoryPressure = 'high';
      } else if (sizeMB > this.memoryConfig.warningThreshold * 0.7) {
        memoryPressure = 'medium';
      }

      return {
        workoutPlans: metrics.recordCounts.workoutPlans || 0,
        workoutSessions: metrics.recordCounts.workoutSessions || 0,
        pendingSync: metrics.recordCounts.syncQueue || 0,
        storageUsed: metrics.totalSize,
        compressionRatio: metrics.compressionRatio,
        lastCleanup: metrics.lastCleanup,
        memoryPressure,
        retentionPolicies: this.retentionPolicies
      };
    } catch (error) {
      console.error('Failed to get offline stats:', error);
      return {
        workoutPlans: 0,
        workoutSessions: 0,
        pendingSync: 0,
        storageUsed: 0,
        compressionRatio: 0,
        lastCleanup: new Date(),
        memoryPressure: 'low',
        retentionPolicies: this.retentionPolicies
      };
    }
  }

  /**
   * Manual cleanup trigger for administrative purposes
   */
  async performManualCleanup(aggressive: boolean = false): Promise<{
    recordsRemoved: number;
    spaceSaved: number;
    compressionApplied: boolean;
  }> {
    const beforeMetrics = await this.getStorageMetrics();

    if (aggressive) {
      await this.performAggressiveCleanup();
    } else {
      await this.performStandardCleanup();
    }

    const afterMetrics = await this.getStorageMetrics();

    return {
      recordsRemoved: Object.values(beforeMetrics.recordCounts).reduce((a, b) => a + b, 0) -
                     Object.values(afterMetrics.recordCounts).reduce((a, b) => a + b, 0),
      spaceSaved: beforeMetrics.totalSize - afterMetrics.totalSize,
      compressionApplied: aggressive
    };
  }

  /**
   * Update retention policies
   */
  updateRetentionPolicy(storeName: string, policy: Partial<DataRetentionPolicy>): void {
    if (this.retentionPolicies[storeName]) {
      this.retentionPolicies[storeName] = {
        ...this.retentionPolicies[storeName],
        ...policy
      };
    }
  }

  /**
   * Destroy the service and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    if (import.meta.env.DEV) {
      console.log('🗑️ OfflineCapabilityService destroyed');
    }
  }

  /**
   * Get memory usage information for debugging
   */
  async getMemoryInfo(): Promise<{
    totalSizeMB: number;
    recordCounts: Record<string, number>;
    compressionRatio: number;
    oldestRecords: Record<string, string>;
    memoryPressure: string;
    retentionStatus: Record<string, { current: number; max: number; needsCleanup: boolean }>;
  }> {
    const metrics = await this.getStorageMetrics();
    const sizeMB = metrics.totalSize / (1024 * 1024);

    let memoryPressure = 'low';
    if (sizeMB > this.memoryConfig.criticalThreshold) {
      memoryPressure = 'critical';
    } else if (sizeMB > this.memoryConfig.warningThreshold) {
      memoryPressure = 'high';
    } else if (sizeMB > this.memoryConfig.warningThreshold * 0.7) {
      memoryPressure = 'medium';
    }

    const retentionStatus: Record<string, { current: number; max: number; needsCleanup: boolean }> = {};
    for (const [storeName, policy] of Object.entries(this.retentionPolicies)) {
      const current = metrics.recordCounts[storeName] || 0;
      retentionStatus[storeName] = {
        current,
        max: policy.maxRecords,
        needsCleanup: current >= policy.cleanupThreshold
      };
    }

    return {
      totalSizeMB: sizeMB,
      recordCounts: metrics.recordCounts,
      compressionRatio: metrics.compressionRatio,
      oldestRecords: Object.fromEntries(
        Object.entries(metrics.oldestRecords).map(([store, date]) => [
          store,
          date.toISOString().split('T')[0]
        ])
      ),
      memoryPressure,
      retentionStatus
    };
  }
}

// Singleton instance
export const offlineCapabilityService = new OfflineCapabilityService();

// Global debugging utilities (development only)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).neuraFitOfflineDebug = {
    getStats: () => offlineCapabilityService.getOfflineStats(),
    getMemoryInfo: () => offlineCapabilityService.getMemoryInfo(),
    performCleanup: (aggressive = false) => offlineCapabilityService.performManualCleanup(aggressive),
    clearAllData: () => offlineCapabilityService.clearOfflineData(),
    updateRetentionPolicy: (store: string, policy: any) =>
      offlineCapabilityService.updateRetentionPolicy(store, policy)
  };

  console.log('🔧 NeuraFit Offline Debug utilities available at window.neuraFitOfflineDebug');
}
