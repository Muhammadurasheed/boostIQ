
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


// Review information tracked for each snapshot
export interface ReviewInfo {
  lastReviewDate: Date;    // When the snapshot was last reviewed
  nextReviewDate: Date;    // When the snapshot should be reviewed next
  interval: number;        // Current interval in days between reviews
  easeFactor: number;      // Multiplier that affects how quickly intervals grow (1.3 - 2.5)
  reviewCount: number;     // Number of times the snapshot has been reviewed
}

/**
 * Calculates the next review date based on current review info and difficulty rating
 * 
 * The algorithm adjusts:
 * 1. The ease factor (how quickly intervals grow) based on difficulty
 * 2. The interval between reviews, which increases exponentially for well-remembered items
 * 
 * @param currentReview Current review information
 * @param difficulty User's difficulty rating (Easy, Medium, Hard)
 * @returns Updated review information with new schedule
 */
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
    // First review - short intervals to build initial memory
    nextInterval = difficulty === Difficulty.Hard ? 0.1 : // 2.4 hours
                 difficulty === Difficulty.Medium ? 0.5 : // 12 hours
                 1; // 1 day
  } else if (reviewCount === 1) {
    // Second review - begin spacing out more
    nextInterval = difficulty === Difficulty.Hard ? 1 : // 1 day
                 difficulty === Difficulty.Medium ? 3 : // 3 days
                 5; // 5 days
  } else {
    // Apply the SM-2 formula: interval = previous_interval * ease_factor
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

/**
 * Initialize a new review schedule for a newly created snapshot
 * The first review is scheduled after a short interval (10 minutes)
 * to establish initial memory
 */
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

/**
 * Check if a snapshot is due for review
 * A snapshot is considered "due" when its next review date is now or in the past
 */
export function isSnapshotDue(reviewInfo: ReviewInfo): boolean {
  const now = new Date();
  return reviewInfo.nextReviewDate <= now;
}
