import { IDatabaseService, UserProfile, Address } from "../interfaces/db.interface";
import { Product, Club, ALL_PRODUCTS, CLUBS } from "../../data/mockData";
import { db, storage } from "./config";
import { collection, getDocs, doc, getDoc, query, setDoc, updateDoc, deleteDoc, writeBatch, where, onSnapshot, runTransaction } from "firebase/firestore";
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

  // --- Helper to Trigger Revalidation ---
  private async triggerRevalidation() {
    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }
    } catch (e) {
      console.error("Error triggering cache revalidation:", e);
    }
  }

  // --- Admin Methods ---

  async addProduct(product: Product): Promise<void> {
    const docRef = doc(db, "products", product.id);
    await setDoc(docRef, product);
    await this.triggerRevalidation();
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, updates as any);
    await this.triggerRevalidation();
  }

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
    await this.triggerRevalidation();
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
    await this.triggerRevalidation();
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
    await this.triggerRevalidation();
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
  private async getNextOrderId(): Promise<string> {
    const counterRef = doc(db, "counters", "orders");
    try {
      const newCount = await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(counterRef);
        if (!sfDoc.exists()) {
          transaction.set(counterRef, { count: 1 });
          return 1;
        }
        const newCount = sfDoc.data().count + 1;
        transaction.update(counterRef, { count: newCount });
        return newCount;
      });
      return `TFS-${newCount.toString().padStart(4, "0")}`;
    } catch (e) {
      console.error("Transaction failed: ", e);
      // Fallback to random if transaction fails
      return `TFS-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
    }
  }

  async createOrder(userId: string, orderData: any): Promise<void> {
    const orderId = await this.getNextOrderId();
    const docRef = doc(db, "orders", orderId);
    
    await setDoc(docRef, {
      ...orderData,
      id: orderId,
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

  // --- Admin Orders ---
  async getAllOrders(): Promise<any[]> {
    try {
      // Limit to 50 for cost optimization as requested
      const { limit, orderBy } = await import('firebase/firestore');
      const q = query(collection(db, "orders"), limit(50));
      const querySnapshot = await getDocs(q);
      const orders: any[] = [];
      querySnapshot.forEach((doc) => {
        orders.push(doc.data());
      });
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return [];
    }
  }

  listenToAllOrders(callback: (orders: any[]) => void): () => void {
    const q = query(collection(db, "orders"));
    return onSnapshot(q, (querySnapshot) => {
      const orders: any[] = [];
      querySnapshot.forEach((doc) => {
        orders.push(doc.data());
      });
      callback(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => {
      console.error("Error listening to orders:", error);
    });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const docRef = doc(db, "orders", orderId);
      await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
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
