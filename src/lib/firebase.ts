import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAG1jxsuv0EPFdre7qfwu8OklgMOmb-kTQ",
  authDomain: "babe-jaka-b8177.firebaseapp.com",
  projectId: "babe-jaka-b8177",
  storageBucket: "babe-jaka-b8177.firebasestorage.app",
  messagingSenderId: "277825540257",
  appId: "1:277825540257:web:5cc12e7c95c0bd194be0e0",
  measurementId: "G-3TG5Q0JDDS"
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
