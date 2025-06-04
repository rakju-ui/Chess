
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzSfQn-7MSpE4kpPxliV2aBmgU-poe8rA",
  authDomain: "nextchess-8ptau.firebaseapp.com",
  projectId: "nextchess-8ptau",
  storageBucket: "nextchess-8ptau.firebasestorage.app",
  messagingSenderId: "515641376103",
  appId: "1:515641376103:web:YOUR_ACTUAL_WEB_APP_UNIQUE_HASH"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
auth = getAuth(app);

export { app, db, auth };

// Basic interface for a game document in Firestore
export interface OnlineGame {
  id: string;
  boardState: string; // Store as JSON string
  currentPlayer: 'PlayerWhite' | 'PlayerBlack';
  playerWhiteId: string | null;
  playerBlackId: string | null;
  status: string;
  isGameOver: boolean;
  createdAt: any; // Firebase ServerTimestamp
  updatedAt: any; // Firebase ServerTimestamp
}
