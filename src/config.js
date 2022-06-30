import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD-4wqA1EP2kAjGAurXj3O1NYHjYf5UC6k",
    authDomain: "security-checklist-test.firebaseapp.com",
    databaseURL: "https://security-checklist-test-default-rtdb.firebaseio.com",
    projectId: "security-checklist-test",
    storageBucket: "security-checklist-test.appspot.com",
    messagingSenderId: "419412108124",
    appId: "1:419412108124:web:691f39daa19a2bd0145799"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase()
export const dbF = getFirestore(app)
export default app;