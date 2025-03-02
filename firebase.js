import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// import firestore from "@react-native-firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvpFcahzIWbu55GLAkx-Q1UHjq2EuX_FE",
    authDomain: "finsight-764b4.firebaseapp.com",
    projectId: "finsight-764b4",
    storageBucket: "finsight-764b4.firebasestorage.app",
    messagingSenderId: "795905927068",
    appId: "1:795905927068:web:b3f3f0a0578be10d2bca59",
    measurementId: "G-S5E16SWHQ0",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
