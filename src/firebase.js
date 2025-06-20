// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBneT2Wv11Y088CWcpB_BPIWz9FcBHFVjg",
  authDomain: "dotbot-34790.firebaseapp.com",
  projectId: "dotbot-34790",
  storageBucket: "dotbot-34790.appspot.com", // fixed typo here
  messagingSenderId: "461701677145",
  appId: "1:461701677145:web:31e3bb3ccdaf758a16f148",
  measurementId: "G-KTXRRD428Y"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
export { auth };
