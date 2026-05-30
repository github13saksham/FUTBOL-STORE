import { FirebaseAuthService } from "./firebase/auth.service";
import { FirebaseDatabaseService } from "./firebase/db.service";
import { IAuthService } from "./interfaces/auth.interface";
import { IDatabaseService } from "./interfaces/db.interface";

// Instantiate the services. If you change the backend from Firebase to something else,
// you only need to change the instantiation here.
const authService: IAuthService = new FirebaseAuthService();
const dbService: IDatabaseService = new FirebaseDatabaseService();

export { authService, dbService };
