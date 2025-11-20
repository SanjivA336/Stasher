import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB_unc5xD5CnN17yesGp_iu5qDlejqUjhc",
    authDomain: "pantry-75333.firebaseapp.com",
    projectId: "pantry-75333",
    storageBucket: "pantry-75333.firebasestorage.app",
    messagingSenderId: "960155639537",
    appId: "1:960155639537:web:deedec36761011ec8c9350",
    measurementId: "G-1SGVCCZ1B5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);