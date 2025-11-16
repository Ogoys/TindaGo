// Firebase SDK v12+ for React Native Expo 2025
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration using environment variables
// In Expo, use EXPO_PUBLIC_ prefix for client-side environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Services with AsyncStorage persistence
// Use getAuth if already initialized, otherwise initialize with persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error: any) {
  if (error.code === 'auth/already-initialized') {
    // If auth is already initialized, just get the existing instance
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth };
export const database = getDatabase(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Optional: point to local emulators for dev testing
if (process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectDatabaseEmulator(database, '127.0.0.1', 9000);
  } catch {}
  try {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  } catch {}
}

export default app;
