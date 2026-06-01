export interface User {
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface IAuthService {
  /**
   * Listen to authentication state changes.
   * @param callback Function called with the User object or null when state changes.
   * @returns Unsubscribe function to stop listening.
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;

  /**
   * Get the currently logged-in user.
   */
  getCurrentUser(): User | null;

  /**
   * Login with email and password.
   */
  loginWithEmail(email: string, password: string): Promise<User>;

  /**
   * Sign up with email and password.
   */
  signupWithEmail(email: string, password: string, name?: string): Promise<User>;

  /**
   * Login with Google.
   */
  loginWithGoogle(): Promise<User>;

  /**
   * Login with Apple.
   */
  loginWithApple(): Promise<User>;



  /**
   * Update User Profile (e.g. Display Name, Photo URL)
   */
  updateUserProfile(name: string, photoURL?: string): Promise<void>;

  /**
   * Upload Profile Picture
   * @param file The image file to upload
   * @returns The download URL of the uploaded image
   */
  uploadProfilePicture(file: File): Promise<string>;

  /**
   * Sign out the current user.
   */
  signOut(): Promise<void>;
}
