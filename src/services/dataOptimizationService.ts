import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Simplified Data Optimization Service
 * Basic data cleanup - backend handles complex analytics processing
 */

export class DataOptimizationService {
  // Simplified retention policy - backend handles complex analytics
  private readonly MAX_RECORDS = 50; // Keep last 50 records per collection
  private readonly RETENTION_DAYS = 180; // Keep for 6 months

  /**
   * Simple data cleanup - removes old records beyond retention limits
   */
  async cleanupOldRecords(userId: string, collectionName: string): Promise<{
    recordsDeleted: number;
  }> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    const collectionRef = collection(db, 'users', userId, collectionName);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const allRecords = querySnapshot.docs;
    let recordsDeleted = 0;

    // Delete records beyond max limit (keep most recent)
    if (allRecords.length > this.MAX_RECORDS) {
      const recordsToDelete = allRecords.slice(this.MAX_RECORDS);

      for (const record of recordsToDelete) {
        await deleteDoc(doc(collectionRef, record.id));
        recordsDeleted++;
      }
    }

    // Delete records older than retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);

    const oldRecords = allRecords.filter(record => {
      const data = record.data();
      const recordDate = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
      return recordDate < cutoffDate;
    });

    for (const record of oldRecords) {
      await deleteDoc(doc(collectionRef, record.id));
      recordsDeleted++;
    }

    return { recordsDeleted };
  }

  /**
   * Simple optimization for all user data collections
   */
  async optimizeAllUserData(userId: string): Promise<{
    totalOptimized: number;
    summary: string[];
  }> {
    const collections = ['analytics', 'workouts', 'feedback'];
    let totalDeleted = 0;
    const summary: string[] = [];

    for (const collectionName of collections) {
      try {
        const result = await this.cleanupOldRecords(userId, collectionName);
        totalDeleted += result.recordsDeleted;

        if (result.recordsDeleted > 0) {
          summary.push(`Cleaned up ${result.recordsDeleted} old ${collectionName} records`);
        }
      } catch (error) {
        console.warn(`Failed to cleanup ${collectionName}:`, error);
        summary.push(`Warning: Could not cleanup ${collectionName} collection`);
      }
    }

    if (totalDeleted === 0) {
      summary.push('No cleanup needed - all data within retention limits');
    }

    return {
      totalOptimized: totalDeleted,
      summary
    };
  }
}

// Singleton instance
export const dataOptimizationService = new DataOptimizationService();
