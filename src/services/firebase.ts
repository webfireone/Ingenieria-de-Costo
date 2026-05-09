import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Credenciales inyectadas directamente para evitar problemas de entorno
const firebaseConfig = {
  apiKey: "AIzaSyCkHSHuMlywsDUgWptW8zR1K1Uj8zrPHIo",
  authDomain: "ingenieria-de-costo.firebaseapp.com",
  projectId: "ingenieria-de-costo",
  storageBucket: "ingenieria-de-costo.firebasestorage.app",
  messagingSenderId: "695189095395",
  appId: "1:695189095395:web:f88819ae63b1d0437a16d6",
  measurementId: "G-05D6YKJXG3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to improve connectivity
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
