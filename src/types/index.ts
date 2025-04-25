
export interface ReviewInfo {
  lastReviewDate: Date;
  nextReviewDate: Date;
  reviewCount: number;  // Changed from repetitions to reviewCount
  easeFactor: number;
  interval: number;
}

export interface Snapshot {
  id: string;
  originalText: string;
  question: string;
  answer: string;
  summary: string;
  analogy: string;
  mnemonic: string; // Added new field
  createdAt: Date;
  tags: string[];
  hasAudio: boolean;
  review: ReviewInfo;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  interest?: string; // Added new field for user's interest
  stats: {
    totalSnapshots: number;
    streakDays: number;
    lastActiveDate: Date;
  };
}

export interface SnapshotFormData {
  text: string;
  tags: string[];
  generateAudio: boolean;
}
