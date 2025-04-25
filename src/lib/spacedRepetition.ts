// Simplified SM-2 algorithm for spaced repetition with demo-friendly intervals
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
    // First review - very short for demoing
    nextInterval = difficulty === Difficulty.Hard ? 0.0007 :  // ~1 minute
                   difficulty === Difficulty.Medium ? 0.002 : // ~3 minutes
                   0.005;                                     // ~7 minutes
  } else if (reviewCount === 1) {
    // Second review - space out a bit more
    nextInterval = difficulty === Difficulty.Hard ? 0.005 :   // ~7 minutes
                   difficulty === Difficulty.Medium ? 0.01 :  // ~15 minutes
                   0.02;                                      // ~30 minutes
  } else {
    // Apply the SM-2 formula: interval = previous_interval * ease_factor
    nextInterval = interval * easeFactor;

    // Adjust based on difficulty
    if (difficulty === Difficulty.Hard) {
      nextInterval = Math.max(nextInterval * 0.5, 0.001); // minimum ~1.5 mins
    } else if (difficulty === Difficulty.Medium) {
      nextInterval = nextInterval * 0.8;
    }

    // Optional: round to avoid sub-second precision
    nextInterval = Math.round(nextInterval * 10000) / 10000;
  }

  // Calculate the next review date using precise millisecond math
  const milliseconds = nextInterval * 24 * 60 * 60 * 1000; // days to ms
  const nextReviewDate = new Date(now.getTime() + milliseconds);

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
 * The first review is scheduled after a very short interval (e.g., 30 seconds)
 */
export function initializeReview(): ReviewInfo {
  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + 30 * 1000); // 30 seconds

  return {
    lastReviewDate: now,
    nextReviewDate,
    interval: 0.00035, // 30 seconds in days
    easeFactor: 2.5,   // Default ease factor in SM-2
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
