import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// init Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyC7RkpXITBZFim3xyvf75e_6J3I7qdKMLk',
  authDomain: 'toodaloo-a1d58.firebaseapp.com',
//   databaseURL: 'toodaloo-a1d58',
  projectId: 'toodaloo-a1d58',
  storageBucket: 'toodaloo-a1d58.firebasestorage.app',
  messagingSenderId: '451278848160',
  appId: '1:451278848160:web:3574235e09b8c3fc5009c5',
  measurementId: 'G-1BWQD005TF',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };