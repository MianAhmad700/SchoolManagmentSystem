import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  getDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const COLLECTION_NAME = 'attendance';

// Mark attendance for a whole class for a specific date
export const markClassAttendance = async (date, classId, attendanceData) => {
  try {
    // Create a unique ID for the document based on date and class
    // Format: YYYY-MM-DD_classId
    const docId = `${date}_${classId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);

    const data = {
      date,
      classId,
      records: attendanceData, // Map of studentId -> status (present, absent, leave, late)
      updatedAt: Timestamp.now(),
    };

    await setDoc(docRef, data, { merge: true });
    return docId;
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

// Get attendance for a specific class and date
export const getClassAttendance = async (date, classId) => {
  try {
    const docId = `${date}_${classId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    throw error;
  }
};

// Get monthly attendance summary for a student
export const getStudentMonthlyAttendance = async (studentId, monthStr) => {
    // monthStr format: YYYY-MM
    // This is a bit complex in Firestore without a subcollection for each student or specific indexing.
    // For this app, we might query by class and date range, then filter for the student.
    // Optimization: Store a separate 'stats' collection or update student document with monthly stats.
    
    // Simple approach for now: Query attendance docs where date starts with YYYY-MM
    // Note: Firestore doesn't support 'startswith' easily on strings without specific range queries.
    // We will query by range.
    
    const startDate = `${monthStr}-01`;
    const endDate = `${monthStr}-31`; // Simple approximation
    
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("date", ">=", startDate),
            where("date", "<=", endDate)
        );
        
        const querySnapshot = await getDocs(q);
        const records = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.records && data.records[studentId]) {
                records.push({
                    date: data.date,
                    status: data.records[studentId]
                });
            }
        });
        
        return records;
    } catch (error) {
        console.error("Error fetching student monthly attendance:", error);
        throw error;
    }
};

export const getAttendanceRange = async (startDate, endDate) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    
    const querySnapshot = await getDocs(q);
    const dailyStats = {}; // date -> { present: 0, absent: 0 }

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.date;
        
        if (!dailyStats[date]) {
            dailyStats[date] = { date, present: 0, absent: 0, leave: 0, late: 0 };
        }
        
        if (data.records) {
            Object.values(data.records).forEach(status => {
                if (status === 'present') dailyStats[date].present++;
                else if (status === 'absent') dailyStats[date].absent++;
                else if (status === 'leave') dailyStats[date].leave++;
                else if (status === 'late') dailyStats[date].late++; // Count late as present? Or separate? Usually present.
            });
        }
    });
    
    return Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching attendance range:", error);
    throw error;
  }
};
