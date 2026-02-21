import { collection, addDoc, deleteDoc, getDocs, doc, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase.js";

const COLLECTION_NAME = "classes";

export const DEFAULT_CLASSES = [
  { value: "PG", label: "Play Group" },
  { value: "Nursery", label: "Nursery" },
  { value: "Prep", label: "Prep" },
  { value: "1", label: "Class 1" },
  { value: "2", label: "Class 2" },
  { value: "3", label: "Class 3" },
  { value: "4", label: "Class 4" },
  { value: "5", label: "Class 5" },
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" }
];

export const getCustomClasses = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching custom classes:", error);
    return [];
  }
};

export const getAllClasses = async () => {
  const customClasses = await getCustomClasses();
  
  const defaults = DEFAULT_CLASSES.map(c => ({ 
    id: c.value, 
    name: c.value, 
    label: c.label, 
    isDefault: true 
  }));
  
  const customs = customClasses.map(c => ({ 
    ...c, 
    label: c.name, // Custom classes use name as label
    isDefault: false 
  }));
  
  return [...defaults, ...customs];
};

export const addClass = async (className) => {
  try {
    // Check if it already exists in defaults
    if (DEFAULT_CLASSES.some(c => c.value === className)) {
      throw new Error("This class already exists as a default class.");
    }
    
    await addDoc(collection(db, COLLECTION_NAME), {
      name: className,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

export const deleteClass = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};
