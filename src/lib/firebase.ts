import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAG1jxsuv0EPFdre7qfwu8OklgMOmb-kTQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "babe-jaka-b8177.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "babe-jaka-b8177",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "babe-jaka-b8177.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "277825540257",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:277825540257:web:5cc12e7c95c0bd194be0e0",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3TG5Q0JDDS"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics is client-side only and needs a check for SSR
let analytics;
if (typeof window !== "undefined") {
  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { db, storage, analytics };
