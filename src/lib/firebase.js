import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCJdxpbHYenGLs3JSNdmdohkn9WKQP7S00",
  authDomain: "smsp-e904c.firebaseapp.com",
  projectId: "smsp-e904c",
  storageBucket: "smsp-e904c.firebasestorage.app",
  messagingSenderId: "518378599228",
  appId: "1:518378599228:web:d6dfd2b5c4ee19a5796439",
  measurementId: "G-E194HR0T39"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
