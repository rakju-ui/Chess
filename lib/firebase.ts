
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBzSfQn-7MSpE4kpPxliV2aBmgU-poe8rA",
  authDomain: "nextchess-8ptau.firebaseapp.com",
  projectId: "nextchess-8ptau",
  storageBucket: "nextchess-8ptau.firebasestorage.app",
  messagingSenderId: "515641376103",
  appId: "1:515641376103:android:b5bbfdb42d96f9173a43c2"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
