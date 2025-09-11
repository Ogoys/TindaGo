// Firebase SDK v12+ for React Native Expo 2025
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDeGdo1GmlBTolD7bYhtDyQAqobYSBVnE",
  authDomain: "tindagoproject.firebaseapp.com",
  databaseURL: "https://tindagoproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tindagoproject",
  storageBucket: "tindagoproject.firebasestorage.app",
  messagingSenderId: "65525054922",
  appId: "1:65525054922:web:4004a23c5aeb0c6b6ce333"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;
