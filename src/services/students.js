import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";
import { db } from "../lib/firebase";

const COLLECTION_NAME = "students";

export const getAllStudents = async ({ filterClass = null, filterYear = null, searchTerm = '' } = {}) => {
  try {
    let constraints = [collection(db, COLLECTION_NAME)];

    if (searchTerm) {
      // Search by admissionNo (ID) instead of name
      constraints.push(where("admissionNo", "==", searchTerm));
    } else {
      if (filterClass) {
        constraints.push(where("classId", "==", filterClass));
      }
      
      if (filterYear) {
         // Filter by admission year (assuming admissionDate format YYYY-MM-DD)
         const startDate = `${filterYear}-01-01`;
         const endDate = `${filterYear}-12-31`;
         constraints.push(where("admissionDate", ">=", startDate));
         constraints.push(where("admissionDate", "<=", endDate));
      }
    }

    const q = query(...constraints);
    const querySnapshot = await getDocs(q);
    
    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side sorting
    if (!searchTerm) {
      results.sort((a, b) => {
        const dateA = a.createdAt || '';
        const dateB = b.createdAt || '';
        return dateB.localeCompare(dateA);
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};



export const getStudentsByClass = async (className) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("classId", "==", className)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching students by class:", error);
    throw error;
  }
};

export const getStudentById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Student not found");
    }
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

export const addStudent = async (studentData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...studentData,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding student:", error);
    throw error;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, studentData);
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};

export const bulkAddStudents = async (students) => {
  try {
    const promises = students.map(student => addStudent(student));
    await Promise.all(promises);
  } catch (error) {
    console.error("Error in bulk add:", error);
    throw error;
  }
};

export const deleteStudents = async (ids) => {
  try {
    const promises = ids.map(id => deleteDoc(doc(db, COLLECTION_NAME, id)));
    await Promise.all(promises);
  } catch (error) {
    console.error("Error deleting students:", error);
    throw error;
  }
};

const CLASS_ORDER = ["PG", "Nursery", "Prep", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export const promoteStudents = async (ids) => {
  try {
    const promises = ids.map(async (id) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const student = docSnap.data();
        const currentClass = student.classId;
        const currentIndex = CLASS_ORDER.indexOf(currentClass);
        
        let nextClass = currentClass;
        let status = student.status || 'active';
        
        if (currentIndex !== -1 && currentIndex < CLASS_ORDER.length - 1) {
          nextClass = CLASS_ORDER[currentIndex + 1];
        } else if (currentClass === "10") {
          status = "graduated";
          // Optionally keep class as 10 or set to something else
        }
        
        if (nextClass !== currentClass || status !== student.status) {
             await updateDoc(docRef, { 
                classId: nextClass,
                status: status,
                lastPromotedAt: new Date().toISOString()
             });
        }
      }
    });
    
    await Promise.all(promises);
  } catch (error) {
    console.error("Error promoting students:", error);
    throw error;
  }
};
