import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCO11ssf8X9kzXbb8uCajtJJ9e0vtcQXv0',
  authDomain: 'runnershi-95df6.firebaseapp.com',
  projectId: 'runnershi-95df6',
  storageBucket: 'runnershi-95df6.firebasestorage.app',
  messagingSenderId: '440807445683',
  appId: '1:440807445683:web:83a13ad1864e5be7578cc6',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db, app };
