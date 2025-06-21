/**
 * Firebase Configuration and Setup
 *
 * This file sets up Firebase services for the NeuraStack application:
 * - Authentication: User login/logout and account management
 * - Firestore: Cloud database for storing user data, chat history, and fitness data
 * - Analytics: User behavior tracking and app performance metrics
 *
 * All configuration values come from environment variables for security.
 */

// Import Firebase services we need for the app
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Project Configuration
 *
 * These settings connect our app to the specific Firebase project.
 * All values are loaded from environment variables (VITE_*) for security.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,  // API key for Firebase services
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,  // Domain for authentication
  databaseURL: "https://neurastackai-frontend-default-rtdb.firebaseio.com",  // Realtime database URL
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,  // Unique project identifier
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,  // File storage bucket
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,  // Push notifications
  appId: import.meta.env.VITE_FIREBASE_APP_ID,  // App identifier
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID  // Analytics tracking ID
};

// Initialize the Firebase app with our configuration
const app = initializeApp(firebaseConfig);

/**
 * Authentication Service
 *
 * Handles user login, logout, and account management.
 * Used throughout the app to check if users are logged in.
 */
export const auth: Auth = getAuth(app);

/**
 * Firestore Database Service
 *
 * Cloud database for storing:
 * - User profiles and preferences
 * - Chat conversation history
 * - Fitness data and workout plans
 * - App analytics and usage data
 */
export const db = getFirestore(app);

/**
 * Analytics Service
 *
 * Tracks user behavior and app performance to help improve the user experience.
 * Collects anonymous usage statistics and performance metrics.
 */
export const analytics = getAnalytics(app);
