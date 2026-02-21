import { collection, addDoc, deleteDoc, getDocs, doc, query, where, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase.js";

const COLLECTION_NAME = "subjects";

export const addSubject = async ({ subjectName, classId }) => {
  if (!subjectName || !classId) throw new Error("subjectName and classId are required");
  const subjectNameLower = subjectName.trim().toLowerCase();

  // Unique check within the same class (case-insensitive)
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("classId", "==", classId),
      where("subjectNameLower", "==", subjectNameLower)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error("Subject name already exists in this class");
    }
  } catch {
    // Fallback without composite index: query by class and filter locally
    const q2 = query(collection(db, COLLECTION_NAME), where("classId", "==", classId));
    const snap2 = await getDocs(q2);
    const exists = snap2.docs
      .map(d => d.data())
      .some(d => (d.subjectNameLower || "").trim() === subjectNameLower);
    if (exists) {
      throw new Error("Subject name already exists in this class");
    }
  }

  const data = {
    subjectName,
    subjectNameLower,
    classId,
    createdAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
  return { id: docRef.id, ...data };
};

export const getAllSubjects = async () => {
  const snap = await getDocs(collection(db, COLLECTION_NAME));
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  results.sort((a, b) => {
    const aName = a.subjectName || "";
    const bName = b.subjectName || "";
    return aName.localeCompare(bName);
  });
  return results;
};

export const getSubjectsByClass = async (classId) => {
  const q = query(collection(db, COLLECTION_NAME), where("classId", "==", classId));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  results.sort((a, b) => {
    const aName = a.subjectName || "";
    const bName = b.subjectName || "";
    return aName.localeCompare(bName);
  });
  return results;
};

export const deleteSubject = async (id) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
  return id;
};

export const updateSubject = async (id, { subjectName, classId }) => {
  if (!id) throw new Error("id is required");
  if (!subjectName || !classId) throw new Error("subjectName and classId are required");
  const subjectNameLower = subjectName.trim().toLowerCase();

  // Check duplicates within class excluding current id
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("classId", "==", classId),
      where("subjectNameLower", "==", subjectNameLower)
    );
    const snap = await getDocs(q);
    const duplicate = snap.docs.find(d => d.id !== id);
    if (duplicate) {
      throw new Error("Subject name already exists in this class");
    }
  } catch {
    const q2 = query(collection(db, COLLECTION_NAME), where("classId", "==", classId));
    const snap2 = await getDocs(q2);
    const duplicate = snap2.docs
      .filter(d => d.id !== id)
      .map(d => d.data())
      .some(d => (d.subjectNameLower || "").trim() === subjectNameLower);
    if (duplicate) {
      throw new Error("Subject name already exists in this class");
    }
  }

  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, {
    subjectName,
    subjectNameLower,
    classId
  });
  return { id, subjectName, subjectNameLower, classId };
}
