// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAvpFcahzIWbu55GLAkx-Q1UHjq2EuX_FE",
    authDomain: "finsight-764b4.firebaseapp.com",
    projectId: "finsight-764b4",
    storageBucket: "finsight-764b4.firebasestorage.app",
    messagingSenderId: "795905927068",
    appId: "1:795905927068:web:b3f3f0a0578be10d2bca59",
    measurementId: "G-S5E16SWHQ0",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
