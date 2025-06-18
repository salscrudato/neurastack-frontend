// src/firebase.ts
/**
 * Client-side Firebase bootstrap with full TypeScript support.
 * Reads credentials from Vite env vars (`VITE_*`) and exposes
 * an `auth` singleton.
 */
import { getAnalytics } from "firebase/analytics";
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

/** Initialize Firebase once */
const app = initializeApp(firebaseConfig);

/** Auth singleton for client-side use */
export const auth: Auth = getAuth(app);

/** Firestore database singleton */
export const db = getFirestore(app);

/** Analytics singleton */
export const analytics = getAnalytics(app);
