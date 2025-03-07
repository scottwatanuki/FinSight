// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvpFcahzIWbu55GLAkx-Q1UHjq2EuX_FE",
  authDomain: "finsight-764b4.firebaseapp.com",
  projectId: "finsight-764b4",
  storageBucket: "finsight-764b4.appspot.com",
  messagingSenderId: "795905927068",
  appId: "1:795905927068:web:b3f3f0a0578be10d2bca59",
  measurementId: "G-S5E16SWHQ0",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize other Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
