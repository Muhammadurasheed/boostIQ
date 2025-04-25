
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { createOrUpdateUser } from "../lib/firestoreService";
import { useToast } from "../components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  guestMode: boolean;
  setGuestMode: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(() => {
    // Check if guest mode is stored in local storage
    return localStorage.getItem("guestMode") === "true";
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update localStorage when guestMode changes
  useEffect(() => {
    localStorage.setItem("guestMode", guestMode ? "true" : "false");
  }, [guestMode]);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore with safe defaults for all fields
      // Remove any undefined values to prevent Firestore errors
      const userData = {
        email: userCredential.user.email || "",
        name: userCredential.user.displayName || "",  // Provide empty string as fallback
      };
      
      // Filter out any properties with undefined values
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== undefined)
      );
      
      await createOrUpdateUser(cleanUserData);
      
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      
      // Redirect to dashboard after successful account creation
      navigate("/");
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error signing up:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      // Redirect to dashboard after successful sign in
      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    guestMode,
    setGuestMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
