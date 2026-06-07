import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App securely
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// TEST Firebase Connection on Boot
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const docRef = doc(db, "test_connection", "ping");
    await getDocFromServer(docRef);
    console.log("ResiTrend: Real Firebase Firestore Database is actively connected!");
    return true;
  } catch (error) {
    console.warn("ResiTrend: Running in simulated local mode (or offline check triggered).");
    return false;
  }
}
