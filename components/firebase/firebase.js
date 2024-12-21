import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'firebase-api-key',
  authDomain: 'auth-domain',
  projectId: 'project-id',
  storageBucket: 'storage-bucket',
  messagingSenderId: 'messaging-sender-id',
  appId: 'firebase-app-id',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db, app };
