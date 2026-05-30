import { Product, Club } from "../../data/mockData";

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface UserProfile {
  phone?: string;
  addresses?: Address[];
}

export interface IDatabaseService {
  /**
   * Fetch all products.
   */
  getProducts(): Promise<Product[]>;

  /**
   * Fetch a specific product by ID.
   */
  getProductById(id: string): Promise<Product | null>;

  /**
   * Fetch all clubs.
   */
  getClubs(): Promise<Club[]>;
  /**
   * Admin: Add a new product.
   */
  addProduct(product: Product): Promise<void>;

  /**
   * Admin: Update an existing product.
   */
  updateProduct(id: string, updates: Partial<Product>): Promise<void>;

  /**
   * Admin: Delete a product by ID.
   */
  deleteProduct(id: string): Promise<void>;

  /**
   * Admin: Clear all products from the database.
   */
  clearDatabase(): Promise<void>;

  /**
   * Admin: Upload a product image to storage and return the URL.
   */
  uploadProductImage(file: File): Promise<string>;

  /**
   * Create a new order after successful checkout.
   */
  createOrder(userId: string, orderData: any): Promise<void>;

  /**
   * Fetch order history for a specific user.
   */
  getUserOrders(userId: string): Promise<any[]>;

  /**
   * User Profile methods for storing extra user metadata like phone and addresses.
   */
  getUserProfile(userId: string): Promise<UserProfile | null>;
  updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void>;
}
