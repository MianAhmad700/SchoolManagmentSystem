import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const COLLECTION_NAME = 'results';

// Structure:
// Collection 'results' -> Document ID: `${examName}_${classId}_${subject}`
// Fields: examName, classId, subject, maxMarks, records: { studentId: marks }

const EXAM_COLLECTION_NAME = 'school_exams';

export const createExam = async (examData) => {
  if (!db) throw new Error("Firestore database instance is missing");
  try {
    const docRef = await addDoc(collection(db, EXAM_COLLECTION_NAME), examData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating exam:", error);
    throw error;
  }
};

export const getExams = async () => {
  if (!db) throw new Error("Firestore database instance is missing");
  try {
    const querySnapshot = await getDocs(collection(db, EXAM_COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching exams:", error);
    throw error;
  }
};

export const deleteExam = async (id) => {
  if (!db) throw new Error("Firestore database instance is missing");
  try {
    await deleteDoc(doc(db, EXAM_COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting exam:", error);
    throw error;
  }
};

export const saveSubjectResults = async (examName, classId, subject, maxMarks, marksData) => {
  try {
    const docId = `${examName}_${classId}_${subject}`.replace(/\s+/g, '_');
    const docRef = doc(db, COLLECTION_NAME, docId);
    
    const data = {
      examName,
      classId,
      subject,
      maxMarks,
      records: marksData, // Map of studentId -> marks
      updatedAt: Timestamp.now(),
    };
    
    await setDoc(docRef, data, { merge: true });
    return docId;
  } catch (error) {
    console.error("Error saving results:", error);
    throw error;
  }
};

export const getSubjectResults = async (examName, classId, subject) => {
  try {
    const docId = `${examName}_${classId}_${subject}`.replace(/\s+/g, '_');
    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching subject results:", error);
    throw error;
  }
};

export const getClassExamResults = async (examName, classId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("examName", "==", examName),
      where("classId", "==", classId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching class exam results:", error);
    throw error;
  }
};

// Get all results for a specific student
// This is inefficient with the above structure if we want ALL subjects for a student.
// We might need to query by examName and classId, then filter locally.
export const getStudentReportCard = async (studentId, classId, examName) => {
    try {
        // Query all subject results for this exam and class
        const q = query(
            collection(db, COLLECTION_NAME),
            where("examName", "==", examName),
            where("classId", "==", classId)
        );
        
        const querySnapshot = await getDocs(q);
        const report = [];
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.records && data.records[studentId] !== undefined) {
                report.push({
                    subject: data.subject,
                    obtained: data.records[studentId],
                    max: data.maxMarks
                });
            }
        });
        
        return report;
    } catch (error) {
        console.error("Error fetching report card:", error);
        throw error;
    }
}
