import { db } from "../backend/firebase/config";
import { ALL_PRODUCTS, CLUBS } from "../data/mockData";
import { doc, setDoc } from "firebase/firestore";

/**
 * Utility script to seed Firestore with the current mock data.
 * This can be run once to populate the database when you set up your real Firebase project.
 * 
 * Usage (in a component or a one-off admin page):
 * import { uploadMockData } from '@/utils/uploadMockData';
 * 
 * <button onClick={uploadMockData}>Upload Data</button>
 */
export const uploadMockData = async () => {
  try {
    console.log("Starting data upload...");

    // Upload Products
    for (const product of ALL_PRODUCTS) {
      await setDoc(doc(db, "products", product.id), product);
      console.log(`Uploaded product: ${product.name}`);
    }

    // Upload Clubs
    for (const club of CLUBS) {
      await setDoc(doc(db, "clubs", club.id), club);
      console.log(`Uploaded club: ${club.name}`);
    }

    console.log("Data upload complete!");
  } catch (error) {
    console.error("Error uploading data: ", error);
    throw error; // Rethrow so the UI can show it
  }
};
