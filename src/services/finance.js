import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const FEES_COLLECTION = 'fees';
const EXPENSES_COLLECTION = 'expenses';

// --- Fees ---

export const addFeeRecord = async (feeData) => {
  try {
    // Generate a simple receipt number (timestamp based for now)
    const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
    
    const data = {
      ...feeData,
      receiptNo,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, FEES_COLLECTION), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error adding fee record:", error);
    throw error;
  }
};

export const getFees = async () => {
  try {
    const q = query(
      collection(db, FEES_COLLECTION), 
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching fees:", error);
    throw error;
  }
};

export const getAllFees = async () => {
  try {
    const q = query(
      collection(db, FEES_COLLECTION), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all fees:", error);
    throw error;
  }
};

// --- Expenses ---

export const addExpense = async (expenseData) => {
  try {
    const data = {
      ...expenseData,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

export const getExpenses = async () => {
  try {
    const q = query(
      collection(db, EXPENSES_COLLECTION), 
      orderBy('date', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

export const getAllExpenses = async () => {
  try {
    const q = query(
      collection(db, EXPENSES_COLLECTION), 
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all expenses:", error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
    try {
        await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
    } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
};
