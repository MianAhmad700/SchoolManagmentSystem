import { addSubject, deleteSubject, getSubjectsByClass } from "../src/services/subjects.js";
import { auth } from "../src/lib/firebase.js";
import { signInAnonymously } from "firebase/auth";

async function run() {
  console.log("Starting Subjects Uniqueness Tests...");
  // Authenticate to satisfy Firestore rules
  try {
    await signInAnonymously(auth);
    console.log("Authenticated anonymously.");
  } catch (e) {
    console.error("Authentication failed. Enable Anonymous Auth or use email/password in tests.");
    if (globalThis.process) globalThis.process.exit(1);
    return;
  }

  // Use known default class identifiers
  const classAId = "1";
  const classBId = "2";

  console.log("Using classes:", classAId, classBId);

  const subjectName = "UniqTestSubject_" + Date.now();
  let createdA;
  let createdB;

  try {
    // Add subject to Class A
    createdA = await addSubject({ subjectName, classId: classAId });
    console.log("PASS: Added subject to Class A");

    // Attempt duplicate in Class A (should fail)
    let dupError = null;
    try {
      await addSubject({ subjectName, classId: classAId });
    } catch (e) {
      dupError = e;
    }
    if (!dupError) {
      throw new Error("FAIL: Duplicate subject allowed within the same class");
    }
    console.log("PASS: Duplicate prevented within Class A");

    // Add same subject to Class B (should succeed)
    createdB = await addSubject({ subjectName, classId: classBId });
    console.log("PASS: Same subject name allowed in a different class");

    // Verify isolation by reading each class
    const listA = await getSubjectsByClass(classAId);
    const listB = await getSubjectsByClass(classBId);
    const inA = listA.find(s => s.subjectName === subjectName);
    const inB = listB.find(s => s.subjectName === subjectName);
    if (!inA || !inB) {
      throw new Error("FAIL: Subject not found in both classes as expected");
    }
    console.log("PASS: Subject exists separately in both classes");
  } catch (error) {
    console.error("TEST ERROR:", error.message || error);
    if (globalThis.process) globalThis.process.exit(1);
    return;
  } finally {
    // Cleanup
    try { if (createdA?.id) await deleteSubject(createdA.id); } catch { (void 0); }
    try { if (createdB?.id) await deleteSubject(createdB.id); } catch { (void 0); }
  }

  console.log("All tests passed.");
  if (globalThis.process) globalThis.process.exit(0);
}

run();
