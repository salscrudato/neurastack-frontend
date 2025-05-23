// src/lib/firebase.ts  (moved into lib for cleaner imports)
import { initializeApp }      from 'firebase/app';
import { getAuth }            from 'firebase/auth';
import { getFirestore }       from 'firebase/firestore';

// The Vite‑exposed env vars (set in .env)
const firebaseConfig = {
  apiKey:             import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:          import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:              import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialise once
const app = initializeApp(firebaseConfig);

// Export modular SDK handles
export const auth = getAuth(app);
export const db   = getFirestore(app);