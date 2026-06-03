import { IAuthService, User as AppUser } from "../interfaces/auth.interface";
import { auth, storage } from "./config";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, OAuthProvider, User as FirebaseUser } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export class FirebaseAuthService implements IAuthService {
  onAuthStateChanged(callback: (user: AppUser | null) => void): () => void {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          phoneNumber: firebaseUser.phoneNumber,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }

  getCurrentUser(): AppUser | null {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      phoneNumber: firebaseUser.phoneNumber,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  async loginWithEmail(email: string, password: string): Promise<AppUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  async signupWithEmail(email: string, password: string, name?: string): Promise<AppUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    if (name) {
      await updateProfile(firebaseUser, { displayName: name });
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      phoneNumber: firebaseUser.phoneNumber,
      displayName: name || firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  async loginWithGoogle(): Promise<AppUser> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  async loginWithApple(): Promise<AppUser> {
    const provider = new OAuthProvider('apple.com');
    // Request additional scopes if needed
    // provider.addScope('email');
    // provider.addScope('name');
    
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  async updateUserProfile(name: string, photoURL?: string): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const updates: any = { displayName: name };
      if (photoURL !== undefined) {
        updates.photoURL = photoURL;
      }
      await updateProfile(firebaseUser, updates);
    } else {
      throw new Error("No user is currently logged in.");
    }
  }

  async uploadProfilePicture(file: File): Promise<string> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error("User not authenticated.");

    const storageRef = ref(storage, `users/${firebaseUser.uid}/profile_${Date.now()}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }
}
