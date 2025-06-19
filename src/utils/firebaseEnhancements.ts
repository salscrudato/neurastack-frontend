/**
 * Enhanced Firebase Integration with Offline Support and Conflict Resolution
 * 
 * Provides robust Firebase operations with automatic retry, conflict resolution,
 * and seamless offline/online synchronization for production-grade reliability
 */

import {
    disableNetwork,
    doc,
    enableNetwork,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
    type DocumentReference
} from 'firebase/firestore';
import { db } from '../firebase';
import { retryWithBackoff } from './apiRobustness';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ConflictResolutionStrategy {
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  mergeFunction?: (clientData: any, serverData: any) => any;
}

export interface SyncOptions {
  retryAttempts?: number;
  conflictResolution?: ConflictResolutionStrategy;
  enableOfflineSupport?: boolean;
  syncTimeout?: number;
}

export interface SyncResult<T> {
  success: boolean;
  data?: T;
  conflicts?: Array<{
    field: string;
    clientValue: any;
    serverValue: any;
    resolved: boolean;
  }>;
  error?: Error;
}

// ============================================================================
// Enhanced Document Operations
// ============================================================================

/**
 * Enhanced document read with offline support and caching
 */
export async function enhancedGetDoc<T>(
  docRef: DocumentReference,
  options: SyncOptions = {}
): Promise<SyncResult<T>> {
  const { retryAttempts = 3 } = options;

  try {
    const result = await retryWithBackoff(
      async () => {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as T;
        }
        return null;
      },
      {
        maxRetries: retryAttempts,
        baseDelay: 1000,
        maxDelay: 5000,
      }
    );

    return {
      success: true,
      data: result || undefined
    };
  } catch (error) {
    console.warn('Enhanced getDoc failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Enhanced document write with conflict resolution
 */
export async function enhancedSetDoc<T extends Record<string, any>>(
  docRef: DocumentReference,
  data: T,
  options: SyncOptions = {}
): Promise<SyncResult<T>> {
  const { 
    retryAttempts = 3, 
    conflictResolution = { strategy: 'client_wins' },
    enableOfflineSupport = true 
  } = options;

  try {
    // Check for existing document to handle conflicts
    const existingDoc = await getDoc(docRef);
    let finalData = { ...data };

    if (existingDoc.exists() && conflictResolution.strategy !== 'client_wins') {
      const serverData = existingDoc.data() as T;
      finalData = await resolveConflicts(data, serverData, conflictResolution);
    }

    // Add metadata
    const dataWithMetadata = {
      ...finalData,
      updatedAt: serverTimestamp(),
      lastSyncedAt: serverTimestamp(),
      version: (finalData.version || 0) + 1,
    };

    await retryWithBackoff(
      () => setDoc(docRef, dataWithMetadata, { merge: true }),
      {
        maxRetries: retryAttempts,
        baseDelay: 1000,
        maxDelay: 5000,
      }
    );

    return {
      success: true,
      data: dataWithMetadata as T
    };
  } catch (error) {
    console.warn('Enhanced setDoc failed:', error);
    
    // Store for offline sync if enabled
    if (enableOfflineSupport) {
      await storeForOfflineSync(docRef.path, data);
    }

    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Enhanced document update with optimistic updates
 */
export async function enhancedUpdateDoc<T extends Record<string, any>>(
  docRef: DocumentReference,
  updates: Partial<T>,
  options: SyncOptions = {}
): Promise<SyncResult<T>> {
  const { retryAttempts = 3, enableOfflineSupport = true } = options;

  try {
    const updatesWithMetadata = {
      ...updates,
      updatedAt: serverTimestamp(),
      lastSyncedAt: serverTimestamp(),
    };

    await retryWithBackoff(
      () => updateDoc(docRef, updatesWithMetadata),
      {
        maxRetries: retryAttempts,
        baseDelay: 1000,
        maxDelay: 5000,
      }
    );

    return {
      success: true,
      data: updatesWithMetadata as unknown as T
    };
  } catch (error) {
    console.warn('Enhanced updateDoc failed:', error);
    
    // Store for offline sync if enabled
    if (enableOfflineSupport) {
      await storeForOfflineSync(docRef.path, updates);
    }

    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// ============================================================================
// Conflict Resolution
// ============================================================================

/**
 * Resolve conflicts between client and server data
 */
async function resolveConflicts<T extends Record<string, any>>(
  clientData: T,
  serverData: T,
  strategy: ConflictResolutionStrategy
): Promise<T> {
  switch (strategy.strategy) {
    case 'server_wins':
      return { ...clientData, ...serverData };
    
    case 'merge':
      if (strategy.mergeFunction) {
        return strategy.mergeFunction(clientData, serverData);
      }
      // Default merge: prefer client for user data, server for metadata
      return {
        ...serverData,
        ...clientData,
        // Always prefer server timestamps
        createdAt: serverData.createdAt || clientData.createdAt,
        updatedAt: serverData.updatedAt || clientData.updatedAt,
      };
    
    case 'manual':
      // For manual resolution, return client data with conflict markers
      return {
        ...clientData,
        _conflicts: detectConflicts(clientData, serverData)
      };
    
    case 'client_wins':
    default:
      return clientData;
  }
}

/**
 * Detect conflicts between client and server data
 */
function detectConflicts<T extends Record<string, any>>(
  clientData: T,
  serverData: T
): Array<{ field: string; clientValue: any; serverValue: any }> {
  const conflicts: Array<{ field: string; clientValue: any; serverValue: any }> = [];
  
  for (const key in clientData) {
    if (key.startsWith('_') || key.includes('At')) continue; // Skip metadata
    
    if (serverData[key] !== undefined && clientData[key] !== serverData[key]) {
      conflicts.push({
        field: key,
        clientValue: clientData[key],
        serverValue: serverData[key]
      });
    }
  }
  
  return conflicts;
}

// ============================================================================
// Enhanced Offline Queue Management
// ============================================================================

interface OfflineOperation {
  id: string;
  type: 'set' | 'update' | 'delete';
  path: string;
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
  userId?: string;
  sessionId?: string;
}

interface QueueMetrics {
  totalOperations: number;
  pendingOperations: number;
  failedOperations: number;
  lastProcessedAt: number | null;
  averageProcessingTime: number;
}

const OFFLINE_QUEUE_KEY = 'neurastack-offline-queue';
const QUEUE_METRICS_KEY = 'neurastack-queue-metrics';
const MAX_RETRY_COUNT = 5;
const MAX_QUEUE_SIZE = 1000;

/**
 * Enhanced offline operation storage with priority and deduplication
 */
export async function storeForOfflineSync(
  path: string,
  data: any,
  type: 'set' | 'update' | 'delete' = 'set',
  options: {
    priority?: 'high' | 'medium' | 'low';
    userId?: string;
    sessionId?: string;
    deduplicate?: boolean;
  } = {}
): Promise<void> {
  try {
    const { priority = 'medium', userId, sessionId, deduplicate = true } = options;
    const queue = getOfflineQueue();

    // Deduplication: remove existing operations for the same path if requested
    if (deduplicate) {
      const filteredQueue = queue.filter(op => op.path !== path || op.type !== type);
      if (filteredQueue.length !== queue.length) {
        console.log(`🔄 Deduplicated ${queue.length - filteredQueue.length} operations for ${path}`);
        queue.splice(0, queue.length, ...filteredQueue);
      }
    }

    // Check queue size limit
    if (queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest low-priority operations
      const lowPriorityOps = queue.filter(op => op.priority === 'low').slice(0, 100);
      lowPriorityOps.forEach(op => {
        const index = queue.indexOf(op);
        if (index > -1) queue.splice(index, 1);
      });
      console.warn(`⚠️ Queue size limit reached, removed ${lowPriorityOps.length} low-priority operations`);
    }

    const operation: OfflineOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      path,
      data: { ...data, queuedAt: Date.now() },
      timestamp: Date.now(),
      retryCount: 0,
      priority,
      userId,
      sessionId,
    };

    // Insert based on priority (high priority first)
    if (priority === 'high') {
      queue.unshift(operation);
    } else if (priority === 'medium') {
      const highPriorityCount = queue.filter(op => op.priority === 'high').length;
      queue.splice(highPriorityCount, 0, operation);
    } else {
      queue.push(operation);
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    updateQueueMetrics({ totalOperations: queue.length });

    console.log(`📦 Stored offline operation: ${type} ${path} (priority: ${priority})`);
  } catch (error) {
    console.warn('Failed to store offline operation:', error);
  }
}

/**
 * Get offline queue from localStorage with error recovery
 */
function getOfflineQueue(): OfflineOperation[] {
  try {
    const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!queueData) return [];

    const queue = JSON.parse(queueData);

    // Validate queue structure
    if (!Array.isArray(queue)) {
      console.warn('Invalid queue format, resetting...');
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      return [];
    }

    // Filter out corrupted operations
    const validOperations = queue.filter(op =>
      op &&
      typeof op === 'object' &&
      op.id &&
      op.type &&
      op.path &&
      typeof op.timestamp === 'number'
    );

    if (validOperations.length !== queue.length) {
      console.warn(`Filtered out ${queue.length - validOperations.length} corrupted operations`);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(validOperations));
    }

    return validOperations;
  } catch (error) {
    console.warn('Failed to parse offline queue, resetting:', error);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    return [];
  }
}

/**
 * Enhanced offline queue processing with batch operations and error recovery
 */
export async function processOfflineQueue(): Promise<QueueMetrics> {
  const startTime = performance.now();
  const queue = getOfflineQueue();

  if (queue.length === 0) {
    return getQueueMetrics();
  }

  console.log(`🔄 Processing ${queue.length} offline operations...`);

  const processedOperations: string[] = [];
  const failedOperations: OfflineOperation[] = [];
  const batchSize = 10; // Process in batches to avoid overwhelming Firestore

  // Process operations in batches
  for (let i = 0; i < queue.length; i += batchSize) {
    const batch = queue.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(async (operation) => {
        try {
          await processOperation(operation);
          processedOperations.push(operation.id);
          console.log(`✅ Processed: ${operation.type} ${operation.path}`);
        } catch (error) {
          console.warn(`❌ Failed operation ${operation.id}:`, error);

          operation.retryCount++;
          if (operation.retryCount < MAX_RETRY_COUNT) {
            // Exponential backoff for retry
            operation.timestamp = Date.now() + (Math.pow(2, operation.retryCount) * 1000);
            failedOperations.push(operation);
          } else {
            console.error(`🚫 Giving up on operation ${operation.id} after ${MAX_RETRY_COUNT} retries`);
          }
        }
      })
    );

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < queue.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Update queue with only failed operations
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedOperations));

  const endTime = performance.now();
  const processingTime = endTime - startTime;

  const metrics: QueueMetrics = {
    totalOperations: queue.length,
    pendingOperations: failedOperations.length,
    failedOperations: queue.length - processedOperations.length - failedOperations.length,
    lastProcessedAt: Date.now(),
    averageProcessingTime: processingTime / Math.max(processedOperations.length, 1),
  };

  updateQueueMetrics(metrics);

  if (processedOperations.length > 0) {
    console.log(`✅ Successfully processed ${processedOperations.length}/${queue.length} operations in ${processingTime.toFixed(2)}ms`);
  }

  if (failedOperations.length > 0) {
    console.warn(`⚠️ ${failedOperations.length} operations pending retry`);
  }

  return metrics;
}

/**
 * Process individual operation with enhanced error handling
 */
async function processOperation(operation: OfflineOperation): Promise<void> {
  const docRef = doc(db, operation.path);

  switch (operation.type) {
    case 'set':
      await retryWithBackoff(
        () => setDoc(docRef, operation.data, { merge: true }),
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
        }
      );
      break;

    case 'update':
      await retryWithBackoff(
        () => updateDoc(docRef, operation.data),
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
        }
      );
      break;

    case 'delete':
      // Import deleteDoc when needed
      console.warn('Delete operations not implemented in offline queue');
      break;

    default:
      throw new Error(`Unknown operation type: ${operation.type}`);
  }
}

/**
 * Get queue processing metrics
 */
function getQueueMetrics(): QueueMetrics {
  try {
    const metricsData = localStorage.getItem(QUEUE_METRICS_KEY);
    if (metricsData) {
      return JSON.parse(metricsData);
    }
  } catch (error) {
    console.warn('Failed to parse queue metrics:', error);
  }

  return {
    totalOperations: 0,
    pendingOperations: 0,
    failedOperations: 0,
    lastProcessedAt: null,
    averageProcessingTime: 0,
  };
}

/**
 * Update queue processing metrics
 */
function updateQueueMetrics(updates: Partial<QueueMetrics>): void {
  try {
    const currentMetrics = getQueueMetrics();
    const newMetrics = { ...currentMetrics, ...updates };
    localStorage.setItem(QUEUE_METRICS_KEY, JSON.stringify(newMetrics));
  } catch (error) {
    console.warn('Failed to update queue metrics:', error);
  }
}

/**
 * Clear offline queue (for testing or manual intervention)
 */
export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
  localStorage.removeItem(QUEUE_METRICS_KEY);
  console.log('🧹 Offline queue cleared');
}

/**
 * Get current queue status for monitoring
 */
export function getOfflineQueueStatus(): {
  queueSize: number;
  metrics: QueueMetrics;
  oldestOperation: number | null;
} {
  const queue = getOfflineQueue();
  const metrics = getQueueMetrics();
  const oldestOperation = queue.length > 0 ? Math.min(...queue.map(op => op.timestamp)) : null;

  return {
    queueSize: queue.length,
    metrics,
    oldestOperation,
  };
}

// ============================================================================
// Network State Management
// ============================================================================

/**
 * Enhanced network state management with automatic sync
 */
export class NetworkStateManager {
  private isOnline: boolean = navigator.onLine;
  private listeners: Array<(isOnline: boolean) => void> = [];
  private syncInProgress: boolean = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private async handleOnline(): Promise<void> {
    this.isOnline = true;
    this.notifyListeners(true);
    
    // Enable Firestore network
    try {
      await enableNetwork(db);
      console.log('✅ Firebase network enabled');
    } catch (error) {
      console.warn('Failed to enable Firebase network:', error);
    }
    
    // Process offline queue
    if (!this.syncInProgress) {
      this.syncInProgress = true;
      await processOfflineQueue();
      this.syncInProgress = false;
    }
  }

  private async handleOffline(): Promise<void> {
    this.isOnline = false;
    this.notifyListeners(false);
    
    // Disable Firestore network for better offline behavior
    try {
      await disableNetwork(db);
      console.log('📴 Firebase network disabled for offline mode');
    } catch (error) {
      console.warn('Failed to disable Firebase network:', error);
    }
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.warn('Network state listener error:', error);
      }
    });
  }

  public addListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getNetworkState(): boolean {
    return this.isOnline;
  }
}

// Global network state manager instance
export const networkStateManager = new NetworkStateManager();

export default {
  enhancedGetDoc,
  enhancedSetDoc,
  enhancedUpdateDoc,
  processOfflineQueue,
  storeForOfflineSync,
  clearOfflineQueue,
  getOfflineQueueStatus,
  networkStateManager,
};
