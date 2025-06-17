// src/auth/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBneT2Wv11Y088CWcpB_BPIWz9FcBHFVjg",
  authDomain: "dotbot-34790.firebaseapp.com",
  projectId: "dotbot-34790",
  storageBucket: "dotbot-34790.firebasestorage.app",
  messagingSenderId: "461701677145",
  appId: "1:461701677145:web:31e3bb3ccdaf758a16f148",
  measurementId: "G-KTXRRD428Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const facebookProvider = new FacebookAuthProvider();
const db = getFirestore(app);

// ✅ Export auth properly
export const auth = getAuth(app);
export const facebookAuthProvider = facebookProvider;
export { db };