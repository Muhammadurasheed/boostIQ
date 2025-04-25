
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAtoZRWHqoEpEglZBWmyWk0LwvxytWelA0",
  authDomain: "boostiq-6f46b.firebaseapp.com",
  projectId: "boostiq-6f46b",
  storageBucket: "boostiq-6f46b.firebasestorage.app",
  messagingSenderId: "416486684042",
  appId: "1:416486684042:web:10f9d6f56780891602c473"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
