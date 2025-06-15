/**
 * Fitness Data Sync Hook
 * 
 * Manages automatic loading and syncing of fitness data with Firestore.
 * Provides real-time sync and offline support for NeuraFit data.
 */

import { useEffect, useRef } from 'react';
import { useFitnessStore } from '../store/useFitnessStore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Hook to automatically sync fitness data with Firestore
 */
export function useFitnessSync() {
  const { 
    loadProfileFromFirestore, 
    syncToFirestore, 
    subscribeToFirestore,
    isProfileLoaded 
  } = useFitnessStore();
  
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        // User is authenticated - load data from Firestore
        console.log('🔄 Loading fitness data from Firestore...');
        
        try {
          // Load initial data
          await loadProfileFromFirestore();
          
          // Set up real-time sync
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
          }
          unsubscribeRef.current = subscribeToFirestore();
          
          console.log('✅ Fitness data sync established');
        } catch (error) {
          console.warn('Failed to establish fitness data sync:', error);
        }
      } else {
        // User is not authenticated or is anonymous - use local storage only
        console.log('📱 Using local storage for fitness data');
        
        // Clean up real-time sync
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      }
    });

    // Cleanup function
    return () => {
      unsubscribeAuth();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [loadProfileFromFirestore, subscribeToFirestore]);

  // Sync local changes to Firestore when user becomes authenticated
  useEffect(() => {
    if (auth.currentUser && !auth.currentUser.isAnonymous && isProfileLoaded) {
      // Sync any local changes to Firestore
      syncToFirestore().catch(error => {
        console.warn('Failed to sync local changes to Firestore:', error);
      });
    }
  }, [auth.currentUser, isProfileLoaded, syncToFirestore]);

  return {
    isAuthenticated: auth.currentUser && !auth.currentUser.isAnonymous,
    isProfileLoaded,
    syncToFirestore
  };
}

/**
 * Hook for manual sync operations
 */
export function useFitnessManualSync() {
  const { syncToFirestore, loadProfileFromFirestore } = useFitnessStore();

  const forceSyncToFirestore = async () => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      throw new Error('User must be authenticated to sync to Firestore');
    }

    try {
      await syncToFirestore();
      console.log('✅ Manual sync to Firestore completed');
    } catch (error) {
      console.error('❌ Manual sync to Firestore failed:', error);
      throw error;
    }
  };

  const forceLoadFromFirestore = async () => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      throw new Error('User must be authenticated to load from Firestore');
    }

    try {
      await loadProfileFromFirestore();
      console.log('✅ Manual load from Firestore completed');
    } catch (error) {
      console.error('❌ Manual load from Firestore failed:', error);
      throw error;
    }
  };

  return {
    forceSyncToFirestore,
    forceLoadFromFirestore,
    isAuthenticated: auth.currentUser && !auth.currentUser.isAnonymous
  };
}
