

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  updateDoc,
  addDoc,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Snapshot, User } from "../types";
import { initializeReview, calculateNextReview, Difficulty, ReviewInfo } from "./spacedRepetition";
// Helper to convert between Date and Timestamp

// Helper to convert between Date and Timestamp
const convertDatesToTimestamps = (obj: any) => {
  const result: any = { ...obj };
  for (const key in result) {
    if (result[key] instanceof Date) {
      result[key] = Timestamp.fromDate(result[key]);
    } else if (result[key] && typeof result[key] === 'object') {
      result[key] = convertDatesToTimestamps(result[key]);
    }
  }
  return result;
};

// Helper to convert between Timestamp and Date
const convertTimestampsToDate = (obj: any) => {
  const result: any = { ...obj };
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    } else if (result[key] && typeof result[key] === 'object') {
      result[key] = convertTimestampsToDate(result[key]);
    }
  }
  return result;
};

// Get the current user ID
const getCurrentUserId = (): string => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return user.uid;
};

// Create a new snapshot
export async function createSnapshot(snapshot: Omit<Snapshot, "id" | "createdAt" | "review" | "userId">): Promise<Snapshot> {
  try {
    const userId = getCurrentUserId();
    const snapshotRef = collection(db, "snapshots");
    
    const newSnapshot: Omit<Snapshot, "id"> = {
      ...snapshot,
      createdAt: new Date(),
      review: initializeReview(),
      userId
    };
    
    // Convert Date objects to Firestore Timestamps
    const firestoreData = convertDatesToTimestamps(newSnapshot);
    
    const docRef = await addDoc(snapshotRef, firestoreData);
    
    // Update user stats
    await incrementUserSnapshotCount(userId);
    
    return {
      ...newSnapshot,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error creating snapshot:", error);
    throw error;
  }
}

// Get all snapshots for the current user
export async function getUserSnapshots(): Promise<Snapshot[]> {
  try {
    const userId = getCurrentUserId();
    const snapshotsRef = collection(db, "snapshots");
    const q = query(
      snapshotsRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const snapshots: Snapshot[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const snapshot = {
        ...convertTimestampsToDate(data),
        id: doc.id
      } as Snapshot;
      
      snapshots.push(snapshot);
    });
    
    return snapshots;
  } catch (error) {
    console.error("Error getting user snapshots:", error);
    throw error;
  }
}

// Get snapshots that are due for review
export async function getDueSnapshots(): Promise<Snapshot[]> {
  try {
    const userId = getCurrentUserId();
    const snapshots = await getUserSnapshots();
    const now = new Date();
    
    return snapshots.filter(snapshot => 
      snapshot.review.nextReviewDate <= now
    ).sort((a, b) => 
      a.review.nextReviewDate.getTime() - b.review.nextReviewDate.getTime()
    );
  } catch (error) {
    console.error("Error getting due snapshots:", error);
    throw error;
  }
}

// Update a snapshot after review
export async function updateSnapshotAfterReview(
  snapshotId: string, 
  difficulty: Difficulty
): Promise<Snapshot> {
  try {
    const snapshotRef = doc(db, "snapshots", snapshotId);
    const snapshotDoc = await getDoc(snapshotRef);
    
    if (!snapshotDoc.exists()) {
      throw new Error("Snapshot not found");
    }
    
    const snapshotData = snapshotDoc.data();
    const currentReview = convertTimestampsToDate(snapshotData.review) as ReviewInfo;
    
    const newReview = calculateNextReview(currentReview, difficulty);
    
    // Update the document with the new review info
    await updateDoc(snapshotRef, {
      review: convertDatesToTimestamps(newReview)
    });
    
    // Also update the user's streak if appropriate
    await updateUserStreak();
    
    return {
      ...convertTimestampsToDate(snapshotData),
      id: snapshotId,
      review: newReview
    } as Snapshot;
  } catch (error) {
    console.error("Error updating snapshot after review:", error);
    throw error;
  }
}

// Delete a snapshot
export async function deleteSnapshot(snapshotId: string): Promise<void> {
  try {
    const snapshotRef = doc(db, "snapshots", snapshotId);
    await deleteDoc(snapshotRef);
  } catch (error) {
    console.error("Error deleting snapshot:", error);
    throw error;
  }
}

// Create or update the current user
export async function createOrUpdateUser(userData: Partial<User>): Promise<User> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    let newUserData: User;
    
    if (userDoc.exists()) {
      // Update existing user
      const existingData = userDoc.data() as User;
      newUserData = {
        ...convertTimestampsToDate(existingData),
        ...userData,
        id: user.uid
      };
    } else {
      // Create new user with safe defaults
      newUserData = {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || "",  // Provide empty string as fallback
        createdAt: new Date(),
        stats: {
          totalSnapshots: 0,
          streakDays: 0,
          lastActiveDate: new Date()
        },
        // Only include interest if defined
        ...(userData.interest ? { interest: userData.interest } : {})
      };
    }
    
    // Ensure no undefined values are sent to Firestore
    // This is a recursive function to clean objects at all levels
    const cleanObject = (obj: any): any => {
      const result: any = {};
      
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        // Skip undefined values
        if (value === undefined) return;
        
        // Process nested objects
        if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
          result[key] = cleanObject(value);
        } else {
          result[key] = value;
        }
      });
      
      return result;
    };
    
    // Clean the user data before saving
    const cleanedData = cleanObject(newUserData);
    
    // Convert any Date objects to Firestore Timestamps
    const firestoreData = convertDatesToTimestamps(cleanedData);
    
    // Save to Firestore using merge to prevent overwriting existing fields
    await setDoc(userRef, firestoreData, { merge: true });
    
    return cleanedData as User;
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  }
}

// Get the current user's data
export async function getCurrentUserData(): Promise<User | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create a default user document if it doesn't exist
      const defaultUser: User = {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || "",
        createdAt: new Date(),
        stats: {
          totalSnapshots: 0,
          streakDays: 0,
          lastActiveDate: new Date()
        }
      };
      
      await setDoc(userRef, convertDatesToTimestamps(defaultUser));
      return defaultUser;
    }
    
    return {
      ...convertTimestampsToDate(userDoc.data()),
      id: user.uid
    } as User;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}

// Increment the user's snapshot count
async function incrementUserSnapshotCount(userId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentCount = userData.stats?.totalSnapshots || 0;
      
      await updateDoc(userRef, {
        "stats.totalSnapshots": currentCount + 1,
        "stats.lastActiveDate": Timestamp.fromDate(new Date())
      });
    }
  } catch (error) {
    console.error("Error incrementing snapshot count:", error);
    throw error;
  }
}

// Update the user's streak
export async function updateUserStreak(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lastActiveDate = userData.stats?.lastActiveDate?.toDate() || new Date();
      const today = new Date();
      
      // Reset date times to midnight for comparison
      const lastActiveDay = new Date(lastActiveDate);
      lastActiveDay.setHours(0, 0, 0, 0);
      
      const todayDay = new Date(today);
      todayDay.setHours(0, 0, 0, 0);
      
      // Check if we need to update the streak
      const timeDiff = todayDay.getTime() - lastActiveDay.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      let newStreak = userData.stats?.streakDays || 0;
      
      if (dayDiff === 1) {
        // User was active yesterday, increment streak
        newStreak += 1;
      } else if (dayDiff > 1) {
        // User missed days, reset streak
        newStreak = 1;
      } else if (dayDiff === 0) {
        // Same day, no change to streak but ensure it's at least 1
        newStreak = Math.max(1, newStreak);
      }
      
      await updateDoc(userRef, {
        "stats.streakDays": newStreak,
        "stats.lastActiveDate": Timestamp.fromDate(today)
      });
    }
  } catch (error) {
    console.error("Error updating user streak:", error);
    throw error;
  }
}

// Mock guest mode functions (for MVP without authentication)
export const mockData = {
  snapshots: [] as Snapshot[],
  user: {
    id: "guest",
    email: "guest@example.com",
    createdAt: new Date(),
    stats: {
      totalSnapshots: 0,
      streakDays: 0,
      lastActiveDate: new Date()
    }
  } as User
};

// Create a snapshot in mock mode
export async function createMockSnapshot(snapshot: Omit<Snapshot, "id" | "createdAt" | "review" | "userId">): Promise<Snapshot> {
  const newSnapshot: Snapshot = {
    ...snapshot,
    id: `mock-${Date.now()}`,
    createdAt: new Date(),
    review: initializeReview(),
    userId: "guest"
  };
  
  mockData.snapshots.push(newSnapshot);
  mockData.user.stats.totalSnapshots += 1;
  mockData.user.stats.lastActiveDate = new Date();
  
  return newSnapshot;
}

// Get all mock snapshots
export async function getMockSnapshots(): Promise<Snapshot[]> {
  return [...mockData.snapshots].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );
}

// Get mock snapshots due for review
export async function getMockDueSnapshots(): Promise<Snapshot[]> {
  const now = new Date();
  return mockData.snapshots
    .filter(snapshot => snapshot.review.nextReviewDate <= now)
    .sort((a, b) => a.review.nextReviewDate.getTime() - b.review.nextReviewDate.getTime());
}

// Update a mock snapshot after review
export async function updateMockSnapshotAfterReview(
  snapshotId: string,
  difficulty: Difficulty
): Promise<Snapshot> {
  const snapshotIndex = mockData.snapshots.findIndex(s => s.id === snapshotId);
  
  if (snapshotIndex === -1) {
    throw new Error("Mock snapshot not found");
  }
  
  const snapshot = mockData.snapshots[snapshotIndex];
  const newReview = calculateNextReview(snapshot.review, difficulty);
  
  const updatedSnapshot: Snapshot = {
    ...snapshot,
    review: newReview
  };
  
  mockData.snapshots[snapshotIndex] = updatedSnapshot;
  mockData.user.stats.lastActiveDate = new Date();
  
  return updatedSnapshot;
}

// Delete a mock snapshot
export async function deleteMockSnapshot(snapshotId: string): Promise<void> {
  const index = mockData.snapshots.findIndex(s => s.id === snapshotId);
  
  if (index !== -1) {
    mockData.snapshots.splice(index, 1);
  }
}

// Get mock user data
export async function getMockUserData(): Promise<User> {
  return { ...mockData.user };
}

// Update mock user streak
export async function updateMockUserStreak(): Promise<void> {
  const lastActiveDate = mockData.user.stats.lastActiveDate;
  const today = new Date();
  
  // Reset date times to midnight for comparison
  const lastActiveDay = new Date(lastActiveDate);
  lastActiveDay.setHours(0, 0, 0, 0);
  
  const todayDay = new Date(today);
  todayDay.setHours(0, 0, 0, 0);
  
  // Check if we need to update the streak
  const timeDiff = todayDay.getTime() - lastActiveDay.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  let newStreak = mockData.user.stats.streakDays;
  
  if (dayDiff === 1) {
    // User was active yesterday, increment streak
    newStreak += 1;
  } else if (dayDiff > 1) {
    // User missed days, reset streak
    newStreak = 1;
  } else if (dayDiff === 0) {
    // Same day, no change to streak but ensure it's at least 1
    newStreak = Math.max(1, newStreak);
  }
  
  mockData.user.stats.streakDays = newStreak;
  mockData.user.stats.lastActiveDate = today;
}

// Check if the app is in mock mode
export function isInMockMode(): boolean {
  return !auth.currentUser;
}
