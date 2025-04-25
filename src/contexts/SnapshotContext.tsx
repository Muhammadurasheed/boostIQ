
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Snapshot, User } from "../types";
import { 
  getUserSnapshots, 
  getDueSnapshots, 
  createSnapshot as createFirestoreSnapshot,
  updateSnapshotAfterReview as updateFirestoreSnapshotAfterReview,
  deleteSnapshot as deleteFirestoreSnapshot,
  getCurrentUserData,
  updateUserStreak,
  isInMockMode,
  getMockSnapshots,
  getMockDueSnapshots,
  createMockSnapshot,
  updateMockSnapshotAfterReview,
  deleteMockSnapshot,
  getMockUserData,
  updateMockUserStreak
} from "../lib/firestoreService";
import { Difficulty } from "../lib/spacedRepetition";
import { useToast } from "../components/ui/use-toast";
import { useAuth } from "./AuthContext";

interface SnapshotContextType {
  snapshots: Snapshot[];
  dueSnapshots: Snapshot[];
  loading: boolean;
  error: string | null;
  userData: User | null;
  createSnapshot: (snapshot: Omit<Snapshot, "id" | "createdAt" | "review" | "userId">) => Promise<void>;
  updateSnapshotAfterReview: (snapshotId: string, difficulty: Difficulty) => Promise<void>;
  deleteSnapshot: (snapshotId: string) => Promise<void>;
  refreshSnapshots: () => Promise<void>;
  mockMode: boolean;
}

const SnapshotContext = createContext<SnapshotContextType | undefined>(undefined);

export function SnapshotProvider({ children }: { children: ReactNode }) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [dueSnapshots, setDueSnapshots] = useState<Snapshot[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const { toast } = useToast();
  const { user, guestMode } = useAuth();

  // Check if we're in mock mode (no auth)
  useEffect(() => {
    const checkMockMode = async () => {
      const mock = await isInMockMode();
      setMockMode(mock || guestMode);
    };
    
    checkMockMode();
  }, [user, guestMode]); // Now depends on user and guestMode state

  // Load snapshots and user data
  useEffect(() => {
    async function loadData() {
      try {
        if (loadAttempted && !user && !guestMode) {
          // If we've already tried to load data, and there's still no user or guest mode,
          // don't attempt to load again to avoid error messages
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        setLoadAttempted(true);

        // Only attempt to load data if user is logged in or in mock mode
        if (user || mockMode || guestMode) {
          // Get snapshots
          let snapshotData: Snapshot[] = [];
          let dueSnapshotData: Snapshot[] = [];
          let userData: User | null = null;

          if (mockMode || guestMode) {
            try {
              snapshotData = await getMockSnapshots();
              dueSnapshotData = await getMockDueSnapshots();
              userData = await getMockUserData();
            } catch (err) {
              console.log("Using empty local storage data for guest mode");
              snapshotData = [];
              dueSnapshotData = [];
              userData = {
                id: "guest",
                email: "guest@example.com",
                createdAt: new Date(),
                stats: {
                  totalSnapshots: 0,
                  streakDays: 0,
                  lastActiveDate: new Date()
                }
              };
            }
          } else {
            try {
              snapshotData = await getUserSnapshots();
              dueSnapshotData = await getDueSnapshots();
              userData = await getCurrentUserData();
            } catch (err) {
              console.error("Error loading authenticated data:", err);
              // For new users, we might not have data yet, so don't show error
              if (err instanceof Error && err.message === "User not authenticated") {
                // Handle silently - just show empty state
                snapshotData = [];
                dueSnapshotData = [];
              } else {
                throw err; // Re-throw other errors
              }
            }
          }

          setSnapshots(snapshotData);
          setDueSnapshots(dueSnapshotData);
          setUserData(userData);
        } else {
          // Clear data when not logged in
          setSnapshots([]);
          setDueSnapshots([]);
          setUserData(null);
        }
      } catch (err) {
        console.error("Error loading snapshot data:", err);
        setError("Failed to load data. Please try again.");
        // Only show toast for real errors, not initial load states
        if (user && !guestMode && !mockMode) {
          toast({
            title: "Error",
            description: "Failed to load your data. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [mockMode, user, toast, guestMode, loadAttempted]);

  const refreshSnapshots = async () => {
    try {
      setLoading(true);
      
      // Only refresh if user is logged in or in mock mode
      if (!user && !mockMode && !guestMode) {
        setSnapshots([]);
        setDueSnapshots([]);
        return;
      }
      
      let snapshotData: Snapshot[];
      let dueSnapshotData: Snapshot[];
      
      if (mockMode || guestMode) {
        snapshotData = await getMockSnapshots();
        dueSnapshotData = await getMockDueSnapshots();
      } else {
        snapshotData = await getUserSnapshots();
        dueSnapshotData = await getDueSnapshots();
      }
      
      setSnapshots(snapshotData);
      setDueSnapshots(dueSnapshotData);
    } catch (err) {
      console.error("Error refreshing snapshots:", err);
      // Don't show error if we're just in an empty state
      if (user && !guestMode && !mockMode) {
        toast({
          title: "Error",
          description: "Failed to refresh your snapshots.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createSnapshot = async (snapshot: Omit<Snapshot, "id" | "createdAt" | "review" | "userId">) => {
    try {
      const newSnapshot = mockMode || guestMode
        ? await createMockSnapshot(snapshot)
        : await createFirestoreSnapshot(snapshot);
      
      // Update local state immediately
      setSnapshots(prev => [newSnapshot, ...prev]);
      
      // Check if the snapshot is due immediately
      const now = new Date();
      if (newSnapshot.review.nextReviewDate <= now) {
        setDueSnapshots(prev => [newSnapshot, ...prev]);
      }
      
      toast({
        title: "Success!",
        description: "Your memory snapshot has been created.",
      });
      
    } catch (err) {
      console.error("Error creating snapshot:", err);
      toast({
        title: "Error",
        description: "Failed to create your snapshot. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateSnapshotAfterReview = async (snapshotId: string, difficulty: Difficulty) => {
    try {
      const updatedSnapshot = mockMode || guestMode
        ? await updateMockSnapshotAfterReview(snapshotId, difficulty)
        : await updateFirestoreSnapshotAfterReview(snapshotId, difficulty);
      
      // Update snapshots state
      setSnapshots(prev => 
        prev.map(s => s.id === snapshotId ? updatedSnapshot : s)
      );
      
      // Update due snapshots state (remove it if it's no longer due)
      const now = new Date();
      if (updatedSnapshot.review.nextReviewDate > now) {
        setDueSnapshots(prev => prev.filter(s => s.id !== snapshotId));
      } else {
        setDueSnapshots(prev => 
          prev.map(s => s.id === snapshotId ? updatedSnapshot : s)
        );
      }
      
      // Update user streak
      if (mockMode || guestMode) {
        await updateMockUserStreak();
        const updatedUser = await getMockUserData();
        setUserData(updatedUser);
      } else {
        await updateUserStreak();
        const updatedUser = await getCurrentUserData();
        setUserData(updatedUser);
      }
      
      toast({
        title: "Review recorded",
        description: `Next review scheduled for ${updatedSnapshot.review.nextReviewDate.toLocaleString()}`,
      });
      
      return;
    } catch (err) {
      console.error("Error updating snapshot after review:", err);
      toast({
        title: "Error",
        description: "Failed to record your review. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteSnapshot = async (snapshotId: string) => {
    try {
      if (mockMode || guestMode) {
        await deleteMockSnapshot(snapshotId);
      } else {
        await deleteFirestoreSnapshot(snapshotId);
      }
      
      setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
      setDueSnapshots(prev => prev.filter(s => s.id !== snapshotId));
      
      toast({
        title: "Snapshot deleted",
        description: "The memory snapshot has been removed.",
      });
    } catch (err) {
      console.error("Error deleting snapshot:", err);
      toast({
        title: "Error",
        description: "Failed to delete the snapshot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    snapshots,
    dueSnapshots,
    loading,
    error,
    userData,
    createSnapshot,
    updateSnapshotAfterReview,
    deleteSnapshot,
    refreshSnapshots,
    mockMode
  };

  return <SnapshotContext.Provider value={value}>{children}</SnapshotContext.Provider>;
}

export function useSnapshots() {
  const context = useContext(SnapshotContext);
  if (context === undefined) {
    throw new Error("useSnapshots must be used within a SnapshotProvider");
  }
  return context;
}
