
// Simplified SM-2 algorithm for spaced repetition
// https://en.wikipedia.org/wiki/SuperMemo#Algorithm

export enum Difficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard"
}

export interface ReviewInfo {
  lastReviewDate: Date;
  nextReviewDate: Date;
  interval: number; // in days
  easeFactor: number;
  reviewCount: number;
}

export function calculateNextReview(
  currentReview: ReviewInfo,
  difficulty: Difficulty
): ReviewInfo {
  const now = new Date();
  let { interval, easeFactor, reviewCount } = currentReview;
  
  // Adjust ease factor based on difficulty rating
  switch (difficulty) {
    case Difficulty.Easy:
      easeFactor = Math.min(easeFactor + 0.15, 2.5);
      break;
    case Difficulty.Medium:
      easeFactor = Math.max(easeFactor - 0.05, 1.3);
      break;
    case Difficulty.Hard:
      easeFactor = Math.max(easeFactor - 0.2, 1.3);
      break;
  }

  // Calculate the next interval
  let nextInterval: number;
  
  if (reviewCount === 0) {
    // First review
    nextInterval = difficulty === Difficulty.Hard ? 0.1 : // 2.4 hours
                 difficulty === Difficulty.Medium ? 0.5 : // 12 hours
                 1; // 1 day
  } else if (reviewCount === 1) {
    nextInterval = difficulty === Difficulty.Hard ? 1 : // 1 day
                 difficulty === Difficulty.Medium ? 3 : // 3 days
                 5; // 5 days
  } else {
    // Apply the SM-2 formula
    nextInterval = Math.round(interval * easeFactor);
    
    // Adjust based on difficulty
    if (difficulty === Difficulty.Hard) {
      nextInterval = Math.max(Math.floor(nextInterval * 0.5), 1);
    } else if (difficulty === Difficulty.Medium) {
      nextInterval = Math.floor(nextInterval * 0.8);
    }
  }
  
  // Calculate the next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(now.getDate() + nextInterval);
  
  // For first reviews, handle hours instead of days for short intervals
  if (nextInterval < 1) {
    nextReviewDate.setHours(now.getHours() + Math.round(nextInterval * 24));
  }
  
  return {
    lastReviewDate: now,
    nextReviewDate,
    interval: nextInterval,
    easeFactor,
    reviewCount: reviewCount + 1
  };
}

// Initialize a new review schedule
export function initializeReview(): ReviewInfo {
  const now = new Date();
  const nextReviewDate = new Date(now);
  nextReviewDate.setMinutes(now.getMinutes() + 10); // First review in 10 minutes
  
  return {
    lastReviewDate: now,
    nextReviewDate,
    interval: 0.007, // 10 minutes in days
    easeFactor: 2.5, // Default ease factor in SM-2
    reviewCount: 0
  };
}

// Check if a snapshot is due for review
export function isSnapshotDue(reviewInfo: ReviewInfo): boolean {
  const now = new Date();
  return reviewInfo.nextReviewDate <= now;
}
