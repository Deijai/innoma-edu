// config/firebase.ts - Configuração SIMPLES

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBUD4XhnQ7O1X6-U-JzefyfWCRXopR8mec",
    authDomain: "innoma-edu.firebaseapp.com",
    projectId: "innoma-edu",
    storageBucket: "innoma-edu.firebasestorage.app",
    messagingSenderId: "59435569903",
    appId: "1:59435569903:web:b8e4e479b837750bcd811a",
    measurementId: "G-7L0BY9GZDV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;