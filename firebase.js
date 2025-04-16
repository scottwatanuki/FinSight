// firebase.js (CommonJS)
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
  increment,
} = require("firebase/firestore");
const { initializeAuth, getReactNativePersistence } = require("firebase/auth");
const { getStorage } = require("firebase/storage");
const AsyncStorage = require("@react-native-async-storage/async-storage");

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
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  // persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firestore functions along with initialized services
module.exports = {
  app,
  auth,
  db,
  storage,
  // Also export Firestore functions for convenience
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
  increment,
};
