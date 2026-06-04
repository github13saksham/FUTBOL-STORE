import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } from "firebase/firestore";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetOrders() {
  console.log("Starting order reset for production...");
  
  try {
    // 1. Delete all existing orders
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    const batch = writeBatch(db);
    
    let count = 0;
    ordersSnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
      count++;
    });
    
    if (count > 0) {
      await batch.commit();
      console.log(`Deleted ${count} test orders from the database.`);
    } else {
      console.log("No existing orders found to delete.");
    }

    // 2. Delete the counters/orders document so it restarts from 0
    const counterRef = doc(db, "counters", "orders");
    await deleteDoc(counterRef);
    console.log("Deleted order counter document. Next order will be TFS-0000.");
    
    console.log("Database successfully prepared for production!");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting orders:", error);
    process.exit(1);
  }
}

resetOrders();
