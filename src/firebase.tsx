// src/firebase.ts
/**
 * Client-side Firebase bootstrap with full TypeScript support.
 * Reads credentials from Vite env vars (`VITE_*`) and exposes
 * an `auth` singleton.
 */
import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

/** Firebase config for NeuraStack AI Frontend */
const firebaseConfig = {
  apiKey: "AIzaSyCfyS_9czRJnYUsf3LESgSEQftmxSAUaGw",
  authDomain: "neurastackai-frontend.firebaseapp.com",
  databaseURL: "https://neurastackai-frontend-default-rtdb.firebaseio.com",
  projectId: "neurastackai-frontend",
  storageBucket: "neurastackai-frontend.firebasestorage.app",
  messagingSenderId: "1049090262427",
  appId: "1:1049090262427:web:63e1d05c8df0388a1d0d3e",
  measurementId: "G-YP4HY7MFT2"
};

/** Initialize Firebase once */
const app = initializeApp(firebaseConfig);

/** Auth singleton for client-side use */
export const auth: Auth = getAuth(app);

/** Firestore database singleton */
export const db = getFirestore(app);

/** Analytics singleton */
export const analytics = getAnalytics(app);
