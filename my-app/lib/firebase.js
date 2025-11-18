// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For production, prefer environment variables (e.g., NEXT_PUBLIC_FIREBASE_API_KEY, etc.)
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBt8sMcOh-z2U7wOcodHjeHOmFJIXZJ1sE",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "lost-pet-6de39.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lost-pet-6de39",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "lost-pet-6de39.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "173172390932",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:173172390932:web:fb30a62d228c7b507efb01",
};

// Initialize Firebase (guard against re-initialization in dev/HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);
export const storage = getStorage(app);

export { app };
