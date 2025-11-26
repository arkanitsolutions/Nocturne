import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import type { User } from "firebase/auth";

// Check if Firebase credentials are configured
const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    console.log("🔥 Initializing Firebase with config:", {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    auth = null;
    googleProvider = null;
  }
} else {
  console.warn("⚠️ Firebase is not configured. Authentication features will be disabled.");
}

export { auth };

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    console.warn("Firebase authentication is not configured");
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signOut = async () => {
  if (!isFirebaseConfigured || !auth) {
    console.warn("Firebase authentication is not configured");
    return;
  }

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!isFirebaseConfigured || !auth) {
    // Call callback with null user if Firebase is not configured
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }

  return onAuthStateChanged(auth, callback);
};

// Email/Password Sign Up
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase authentication is not configured");
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Update profile with display name
    if (result.user) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error: any) {
    console.error("Error signing up with email:", error);
    // Return user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("This email is already registered. Please sign in instead.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Password should be at least 6 characters.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Please enter a valid email address.");
    }
    throw error;
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string) => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase authentication is not configured");
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with email:", error);
    // Return user-friendly error messages
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error("Invalid email or password.");
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Too many failed attempts. Please try again later.");
    }
    throw error;
  }
};

// Password Reset
export const resetPassword = async (email: string) => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase authentication is not configured");
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    if (error.code === 'auth/user-not-found') {
      throw new Error("No account found with this email.");
    }
    throw error;
  }
};
