import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const COLLECTION_NAME = "diary";

export const addDiaryEntry = async ({ classId, subject, text, date }) => {
  try {
    const entryDate = date || new Date();
    const dateStr = typeof entryDate === "string"
      ? entryDate
      : entryDate.toISOString().slice(0, 10);

    const data = {
      classId,
      subject,
      text,
      date: dateStr,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error adding diary entry:", error);
    throw error;
  }
};

export const getDiaryEntriesByClassAndDate = async (classId, dateStr) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("classId", "==", classId),
      where("date", "==", dateStr)
    );
    const snap = await getDocs(q);
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    entries.sort((a, b) => a.subject.localeCompare(b.subject));
    return entries;
  } catch (error) {
    console.error("Error fetching diary entries (class+date):", error);
    // Fallback: fetch by class only, then filter by date locally (avoids composite index issues)
    try {
      const q2 = query(
        collection(db, COLLECTION_NAME),
        where("classId", "==", classId)
      );
      const snap2 = await getDocs(q2);
      const entries2 = snap2.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(e => e.date === dateStr);
      entries2.sort((a, b) => a.subject.localeCompare(b.subject));
      return entries2;
    } catch (fallbackError) {
      console.error("Fallback error fetching diary entries:", fallbackError);
      throw fallbackError;
    }
  }
};
