import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

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
export const analytics = getAnalytics(app);

// Development emulators (apenas para desenvolvimento)
if (__DEV__) {
    // Conectar aos emuladores apenas uma vez
    try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        connectFunctionsEmulator(functions, 'localhost', 5001);
    } catch (error) {
        console.log('Emulators already connected');
    }
}

export default app;