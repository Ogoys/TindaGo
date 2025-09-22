// Firebase Debug Helper for Expo Go
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Debug function to check Firebase configuration
export const debugFirebaseConfig = () => {
  console.log('🔥 Firebase Debug Information:');
  console.log('API Key:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'SET ✅' : 'MISSING ❌');
  console.log('Auth Domain:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET ✅' : 'MISSING ❌');
  console.log('Database URL:', process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ? 'SET ✅' : 'MISSING ❌');
  console.log('Project ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? 'SET ✅' : 'MISSING ❌');
  console.log('Storage Bucket:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET ✅' : 'MISSING ❌');
  console.log('Messaging Sender ID:', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'SET ✅' : 'MISSING ❌');
  console.log('App ID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? 'SET ✅' : 'MISSING ❌');

  // Show actual values (only first few characters for security)
  console.log('🔍 Partial Values (for debugging):');
  console.log('API Key starts with:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...');
  console.log('Project ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Database URL:', process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL);
};

// Test Firebase connectivity
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase Connection...');

    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
    };

    // Check if any config values are undefined
    const missingConfigs = Object.entries(firebaseConfig)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingConfigs.length > 0) {
      console.error('❌ Missing Firebase configuration:', missingConfigs);
      return false;
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getDatabase(app);

    console.log('✅ Firebase initialized successfully!');
    console.log('Auth instance:', auth ? 'Created ✅' : 'Failed ❌');
    console.log('Database instance:', database ? 'Created ✅' : 'Failed ❌');

    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};