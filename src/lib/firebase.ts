import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCVNIXZpQdUIk60mX6lJWjGVgPi9P-IK8Q",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "leave-manager-26dc4.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "leave-manager-26dc4",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "leave-manager-26dc4.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1048996166302",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1048996166302:web:33cabfa46667ec0fd7998f",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-FV6H4W38KQ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});
export const storage = getStorage(app);

export default app;
