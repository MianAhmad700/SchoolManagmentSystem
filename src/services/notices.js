import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../lib/firebase";

const COLLECTION_NAME = "notices";

export const getNotices = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
};

export const addNotice = async (noticeData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...noticeData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding notice:", error);
    throw error;
  }
};

export const deleteNotice = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting notice:", error);
    throw error;
  }
};
