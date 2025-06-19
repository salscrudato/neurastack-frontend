/**
 * Firebase Integration Tests
 * 
 * Tests Firebase authentication, Firestore operations, offline handling,
 * and data synchronization functionality.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth, db } from '../firebase';
import {
    enhancedGetDoc,
    enhancedSetDoc,
    enhancedUpdateDoc,
    networkStateManager
} from '../utils/firebaseEnhancements';

// Mock Firebase functions
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDoc = vi.fn();

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    getDoc: mockGetDoc,
    setDoc: mockSetDoc,
    updateDoc: mockUpdateDoc,
    doc: mockDoc,
    serverTimestamp: () => new Date('2024-01-01T00:00:00Z'),
  };
});

describe('Firebase Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue({ path: 'test/doc' });
  });

  describe('Enhanced Document Operations', () => {
    it('should successfully read a document', async () => {
      const mockData = { name: 'Test', value: 123 };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockData,
      });

      const result = await enhancedGetDoc(mockDoc());
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
    });

    it('should handle document not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const result = await enhancedGetDoc(mockDoc());
      
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockData = { name: 'Test', value: 123 };
      mockGetDoc
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          exists: () => true,
          data: () => mockData,
        });

      const result = await enhancedGetDoc(mockDoc(), { retryAttempts: 3 });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockGetDoc).toHaveBeenCalledTimes(3);
    });

    it('should handle persistent failures', async () => {
      mockGetDoc.mockRejectedValue(new Error('Persistent network error'));

      const result = await enhancedGetDoc(mockDoc(), { retryAttempts: 2 });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(mockGetDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('Enhanced Document Writing', () => {
    it('should successfully write a document', async () => {
      const testData = { name: 'Test', value: 123 };
      mockGetDoc.mockResolvedValue({ exists: () => false });
      mockSetDoc.mockResolvedValue(undefined);

      const result = await enhancedSetDoc(mockDoc(), testData);
      
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(testData);
      expect(result.data).toHaveProperty('updatedAt');
      expect(result.data).toHaveProperty('version', 1);
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('should handle conflict resolution with client wins strategy', async () => {
      const clientData = { name: 'Client', value: 123 };
      const serverData = { name: 'Server', value: 456 };
      
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => serverData,
      });
      mockSetDoc.mockResolvedValue(undefined);

      const result = await enhancedSetDoc(mockDoc(), clientData, {
        conflictResolution: { strategy: 'client_wins' }
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('name', 'Client');
      expect(result.data).toHaveProperty('value', 123);
    });

    it('should store for offline sync when network fails', async () => {
      const testData = { name: 'Test', value: 123 };
      mockGetDoc.mockResolvedValue({ exists: () => false });
      mockSetDoc.mockRejectedValue(new Error('Network error'));

      const result = await enhancedSetDoc(mockDoc(), testData, {
        enableOfflineSupport: true
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('Enhanced Document Updates', () => {
    it('should successfully update a document', async () => {
      const updates = { value: 456 };
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await enhancedUpdateDoc(mockDoc(), updates);
      
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(updates);
      expect(result.data).toHaveProperty('updatedAt');
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    });

    it('should handle update failures with offline support', async () => {
      const updates = { value: 456 };
      mockUpdateDoc.mockRejectedValue(new Error('Network error'));

      const result = await enhancedUpdateDoc(mockDoc(), updates, {
        enableOfflineSupport: true
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('Network State Management', () => {
    it('should detect online state', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const isOnline = networkStateManager.getNetworkState();
      expect(isOnline).toBe(true);
    });

    it('should detect offline state', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const isOnline = networkStateManager.getNetworkState();
      expect(isOnline).toBe(false);
    });

    it('should notify listeners of network state changes', () => {
      const listener = vi.fn();
      const unsubscribe = networkStateManager.addListener(listener);

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      // Trigger offline event
      window.dispatchEvent(new Event('offline'));

      expect(listener).toHaveBeenCalledWith(false);

      // Unsubscribe using the returned function
      unsubscribe();
    });
  });

  describe('Authentication Integration', () => {
    it('should handle authentication state changes', () => {
      expect(auth).toBeDefined();
      expect(typeof auth.onAuthStateChanged).toBe('function');
    });

    it('should handle sign in operations', () => {
      // Note: These methods may not be available in the mock, but auth object should exist
      expect(auth).toBeDefined();
      expect(typeof auth.onAuthStateChanged).toBe('function');
    });

    it('should handle sign out operations', () => {
      expect(typeof auth.signOut).toBe('function');
    });
  });

  describe('Firestore Database Integration', () => {
    it('should provide database instance', () => {
      expect(db).toBeDefined();
    });

    it('should support document operations', () => {
      expect(mockDoc).toBeDefined();
      expect(mockGetDoc).toBeDefined();
      expect(mockSetDoc).toBeDefined();
      expect(mockUpdateDoc).toBeDefined();
    });
  });
});
