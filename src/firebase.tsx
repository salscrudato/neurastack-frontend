// src/firebase.ts
/**
 * Client-side Firebase bootstrap with full TypeScript support.
 * Reads credentials from Vite env vars (`VITE_*`) and exposes
 * an `auth` singleton.
 */
import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/** Firebase config for NeuraStack AI Frontend */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://neurastackai-frontend-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is incomplete. Please check your environment variables.');
}

/** Initialize Firebase once */
const app = initializeApp(firebaseConfig);

/** Auth singleton for client-side use */
export const auth: Auth = getAuth(app);

/** Firestore database singleton */
export const db = getFirestore(app);

/** Analytics singleton (lazy loaded for better performance) */
let analytics: any = null;

// Lazy load analytics only when needed
const initializeAnalytics = async () => {
  // Skip analytics in test environments or server-side rendering
  if (typeof window === 'undefined' || import.meta.env.VITEST || import.meta.env.NODE_ENV === 'test') {
    console.info('Analytics disabled in test/server environment');
    return null;
  }

  // Only load analytics if not already initialized
  if (analytics) return analytics;

  try {
    // Dynamically import analytics to reduce initial bundle size
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();

    if (supported) {
      analytics = getAnalytics(app);
      console.info('Firebase Analytics initialized successfully');
    } else {
      console.info('Firebase Analytics not supported in this environment');
    }
  } catch (error) {
    console.warn('Analytics initialization failed (this is normal in development/testing):', error);
  }

  return analytics;
};

// Export lazy analytics getter
export const getAnalytics = () => analytics;
export { initializeAnalytics };
