import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
const db = getFirestore(app);

async function testConnection() {
  console.log("Testing Firestore Connection...");
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    console.log("Success! Found " + querySnapshot.size + " students.");
  } catch (error) {
    console.error("CONNECTION ERROR:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
  }
}

testConnection();
