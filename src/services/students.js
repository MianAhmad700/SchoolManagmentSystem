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
  orderBy,
  limit,
  Timestamp
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

export const getNextRollNo = async (classId) => {
  const q = query(collection(db, COLLECTION_NAME), where("classId", "==", classId));
  const snap = await getDocs(q);
  return snap.size + 1;
};

export const getNextAdmissionNo = async (admissionYear) => {
  const year = String(admissionYear);
  const start = `ADM-${year}-0000`;
  const end = `ADM-${year}-9999`;
  let seq = 0;
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("admissionNo", ">=", start),
      where("admissionNo", "<=", end),
      orderBy("admissionNo", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const last = snap.docs[0].data().admissionNo || start;
      const parts = last.split("-");
      seq = Number(parts[2]) || 0;
    }
  } catch {
    const allSnap = await getDocs(collection(db, COLLECTION_NAME));
    allSnap.forEach(d => {
      const v = d.data().admissionNo || "";
      if (v.startsWith(`ADM-${year}-`)) {
        const parts = v.split("-");
        const n = Number(parts[2]) || 0;
        if (n > seq) seq = n;
      }
    });
  }
  const nextSeq = String(seq + 1).padStart(4, "0");
  return `ADM-${year}-${nextSeq}`;
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
    const required = ["fullName","dob","fatherName","fatherCnic","fatherPhone","classId","monthlyFee"];
    const missing = required.filter(k => !studentData[k] && studentData[k] !== 0);
    if (missing.length) throw new Error("Missing required fields: " + missing.join(", "));
    const admissionDateStr = studentData.admissionDate || new Date().toISOString().slice(0,10);
    const year = Number((studentData.session && String(studentData.session).slice(0,4)) || admissionDateStr.slice(0,4));
    const admissionNo = studentData.admissionNo || await getNextAdmissionNo(year);
    const rollNo = studentData.rollNo || await getNextRollNo(studentData.classId);
    const n = (v) => v !== undefined && v !== null && v !== "" ? Number(v) : 0;
    const monthlyFee = n(studentData.monthlyFee);
    const admissionFee = n(studentData.admissionFee);
    const discount = n(studentData.discount);
    const transportFee = n(studentData.transportFee);
    const hostelFee = n(studentData.hostelFee);
    const otherCharges = n(studentData.otherCharges);
    const totalFee = monthlyFee + admissionFee + transportFee + hostelFee + otherCharges - discount;
    const payload = {
      admissionNo,
      rollNo,
      session: studentData.session || `${year}-${year+1}`,
      classId: studentData.classId,
      section: studentData.section || "",
      fullName: studentData.fullName,
      gender: studentData.gender,
      dob: studentData.dob,
      bFormCnic: studentData.bFormCnic,
      photoBase64: studentData.photoBase64 || "",
      address: studentData.address || "",
      bloodGroup: studentData.bloodGroup || "",
      religion: studentData.religion || "",
      medicalNotes: studentData.medicalNotes || "",
      fatherName: studentData.fatherName,
      fatherCnic: studentData.fatherCnic || "",
      fatherPhone: studentData.fatherPhone,
      motherName: studentData.motherName || "",
      motherPhone: studentData.motherPhone || "",
      email: studentData.email || "",
      occupation: studentData.occupation || "",
      guardianName: studentData.guardianName || studentData.fatherName,
      guardianPhone: studentData.guardianPhone || studentData.fatherPhone,
      relation: studentData.relation || "Father",
      monthlyFee,
      admissionFee,
      discount,
      transportFee,
      hostelFee,
      otherCharges,
      totalFee,
      prevSchool: studentData.prevSchool || "",
      lastClass: studentData.lastClass || "",
      leavingReason: studentData.leavingReason || "",
      prevGrade: studentData.prevGrade || "",
      status: studentData.status || "active",
      admissionDate: admissionDateStr,
      createdAt: Timestamp.now(),
      // Backward-compatibility aliases
      name: studentData.fullName,
      bForm: studentData.bFormCnic,
      phone: studentData.fatherPhone,
      photoUrl: studentData.photoBase64 || ""
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
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
