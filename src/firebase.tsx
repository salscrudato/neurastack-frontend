// src/firebase.ts
/**
 * Client-side Firebase bootstrap with full TypeScript support.
 * Reads credentials from Vite env vars (`VITE_*`) and exposes
 * an `auth` singleton.
 */
import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/** Firebase config, provided via Vite environment variables */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID as string,
};

/** Initialize Firebase once */
const app = initializeApp(firebaseConfig);

/** Auth singleton for client-side use */
export const auth: Auth = getAuth(app);