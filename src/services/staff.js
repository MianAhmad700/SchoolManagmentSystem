import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const COLLECTION_NAME = 'staff';

export const addStaff = async (staffData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...staffData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...staffData };
  } catch (error) {
    console.error("Error adding staff:", error);
    throw error;
  }
};

export const getAllStaff = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side sorting
    results.sort((a, b) => {
      const dateA = a.createdAt || '';
      const dateB = b.createdAt || '';
      return dateB.localeCompare(dateA);
    });

    return results;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
};

export const updateStaff = async (id, staffData) => {
  try {
    const staffRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(staffRef, {
      ...staffData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...staffData };
  } catch (error) {
    console.error("Error updating staff:", error);
    throw error;
  }
};

export const deleteStaff = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return id;
  } catch (error) {
    console.error("Error deleting staff:", error);
    throw error;
  }
};
