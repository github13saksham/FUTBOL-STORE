import { IDatabaseService, UserProfile, Address } from "../interfaces/db.interface";
import { Product, Club, ALL_PRODUCTS, CLUBS } from "../../data/mockData";
import { db, storage } from "./config";
import { collection, getDocs, doc, getDoc, query, setDoc, updateDoc, deleteDoc, writeBatch, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export class FirebaseDatabaseService implements IDatabaseService {
  /**
   * For now, this returns mock data if the database is empty or not yet seeded.
   * Ideally, this will pull from the `products` collection.
   */
  async getProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, "products"));
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push(doc.data() as Product);
      });

      return products;
    } catch (error) {
      console.error("Error fetching products from Firestore:", error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as Product;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching product by ID from Firestore:", error);
      return null;
    }
  }

  async getClubs(): Promise<Club[]> {
    try {
      const q = query(collection(db, "clubs"));
      const querySnapshot = await getDocs(q);
      
      const clubs: Club[] = [];
      querySnapshot.forEach((doc) => {
        clubs.push(doc.data() as Club);
      });

      return clubs;
    } catch (error) {
      console.error("Error fetching clubs from Firestore:", error);
      return [];
    }
  }

  // --- Admin Methods ---

  async addProduct(product: Product): Promise<void> {
    const docRef = doc(db, "products", product.id);
    await setDoc(docRef, product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, updates as any);
  }

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  }

  async clearDatabase(): Promise<void> {
    // Note: Deleting collections from Web Client is not recommended for large collections.
    // We batch delete products for the admin panel.
    const q = query(collection(db, "products"));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  async clearProductsBySection(section: 'national' | 'club'): Promise<void> {
    const q = query(collection(db, "products"));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Product;
      const isNational = data.club && data.club.toLowerCase() === 'national team';
      
      if (section === 'national' && isNational) {
        batch.delete(doc.ref);
      } else if (section === 'club' && !isNational) {
        batch.delete(doc.ref);
      }
    });
    await batch.commit();
  }

  async uploadProductImage(file: File): Promise<string> {
    const fileExtension = file.name.split('.').pop();
    const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    try {
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (firebaseError: any) {
      console.warn("Firebase Storage failed (likely permission denied). Falling back to local upload API...", firebaseError);
      
      // Fallback to local Next.js API route
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        throw new Error("Both Firebase Storage and Local Upload failed.");
      }
      
      const data = await res.json();
      return data.url; // Returns a local URL like /uploads/1234.png
    }
  }

  // --- Orders ---
  async createOrder(userId: string, orderData: any): Promise<void> {
    const docRef = doc(collection(db, "orders"));
    await setDoc(docRef, {
      ...orderData,
      id: docRef.id,
      userId,
      createdAt: new Date().toISOString()
    });
  }

  async getUserOrders(userId: string): Promise<any[]> {
    try {
      const q = query(collection(db, "orders"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const orders: any[] = [];
      querySnapshot.forEach((doc) => {
        orders.push(doc.data());
      });
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  // --- User Profiles ---
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, "users", userId);
      await setDoc(docRef, profile, { merge: true });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }
}
