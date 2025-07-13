/**
 * Lazy Firebase Service
 * 
 * Provides lazy loading of Firebase services to reduce initial bundle size
 * and improve Time to Interactive (TTI) performance.
 */

// Lazy loaded Firebase services
let firestoreService: any = null;
// Removed authService cache - using direct imports for better performance
let analyticsService: any = null;

/**
 * Lazy load Firestore service
 */
export const getFirestoreService = async () => {
  if (firestoreService) return firestoreService;

  try {
    const { 
      collection, 
      doc, 
      addDoc, 
      updateDoc, 
      deleteDoc, 
      getDocs, 
      getDoc,
      query, 
      orderBy, 
      limit, 
      where,
      serverTimestamp,
      onSnapshot
    } = await import('firebase/firestore');

    firestoreService = {
      collection,
      doc,
      addDoc,
      updateDoc,
      deleteDoc,
      getDocs,
      getDoc,
      query,
      orderBy,
      limit,
      where,
      serverTimestamp,
      onSnapshot
    };

    return firestoreService;
  } catch (error) {
    console.error('Failed to load Firestore service:', error);
    throw error;
  }
};

/**
 * Lazy load Auth service - DEPRECATED
 * Auth is now statically imported for better performance
 * This function is kept for backward compatibility
 */
export const getAuthService = async () => {
  // Return static imports for better performance
  const { signInWithPopup, signInAnonymously, signOut, onAuthStateChanged, GoogleAuthProvider } = await import('firebase/auth');

  return {
    signInWithPopup,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider
  };
};

/**
 * Lazy load Analytics service
 */
export const getAnalyticsService = async () => {
  if (analyticsService) return analyticsService;

  // Skip analytics in test environments
  if (typeof window === 'undefined' || import.meta.env.VITEST || import.meta.env.NODE_ENV === 'test') {
    return null;
  }

  try {
    const { getAnalytics, logEvent, isSupported } = await import('firebase/analytics');
    
    const supported = await isSupported();
    if (!supported) {
      console.info('Firebase Analytics not supported in this environment');
      return null;
    }

    analyticsService = {
      getAnalytics,
      logEvent,
      isSupported
    };

    return analyticsService;
  } catch (error) {
    console.warn('Failed to load Analytics service:', error);
    return null;
  }
};

/**
 * Preload critical Firebase services
 * Call this during app initialization for services that will be needed soon
 */
export const preloadCriticalServices = async () => {
  try {
    // Preload auth service as it's needed for most user interactions
    await getAuthService();
    console.log('✅ Critical Firebase services preloaded');
  } catch (error) {
    console.warn('Failed to preload critical Firebase services:', error);
  }
};

/**
 * Preload all Firebase services
 * Call this during idle time to prepare for future use
 */
export const preloadAllServices = async () => {
  try {
    await Promise.all([
      getFirestoreService(),
      getAuthService(),
      getAnalyticsService()
    ]);
    console.log('✅ All Firebase services preloaded');
  } catch (error) {
    console.warn('Failed to preload all Firebase services:', error);
  }
};
