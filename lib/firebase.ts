
// You'll need to replace these with your actual Firebase project credentials
// Go to Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id",
}

import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
