import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSnapshots } from "@/contexts/SnapshotContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import ReviewCard from "@/components/ReviewCard";
import EmptyState from "@/components/EmptyState";
import { Difficulty } from "@/lib/spacedRepetition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Review() {
  const { dueSnapshots, updateSnapshotAfterReview, refreshSnapshots } = useSnapshots();
  const { user, guestMode, setGuestMode } = useAuth();
  const { toast } = useToast();
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localDueSnapshots, setLocalDueSnapshots] = useState([]);
  
  // Force refresh when component mounts
  useEffect(() => {
    refreshSnapshots();
  }, []);
  
  // Initialize and update local copy of due snapshots whenever dueSnapshots changes
  useEffect(() => {
    console.log('Due snapshots received in Review component:', dueSnapshots.length);
    dueSnapshots.forEach(s => {
      console.log(`Snapshot ${s.id}: next review at ${s.review.nextReviewDate.toLocaleString()}`);
    });
    
    setLocalDueSnapshots([...dueSnapshots]);
    setCurrentSnapshotIndex(0);
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsReviewComplete(dueSnapshots.length === 0);
    }, 500); // Reduced from 1000ms for better UX
    
    return () => clearTimeout(timer);
  }, [dueSnapshots]);
  
  const handleReview = async (snapshotId: string, difficulty: Difficulty): Promise<void> => {
    try {
      console.log(`Processing review for snapshot ${snapshotId} with difficulty: ${difficulty}`);
      
      // Process the review in the backend
      await updateSnapshotAfterReview(snapshotId, difficulty);
      
      // After successful review, refresh snapshots from the backend
      await refreshSnapshots();
      
      // Remove the current snapshot from our local tracking array
      const updatedLocalSnapshots = localDueSnapshots.filter(
        (snapshot, index) => index !== currentSnapshotIndex
      );
      
      console.log(`After review: ${updatedLocalSnapshots.length} snapshots remaining`);
      setLocalDueSnapshots(updatedLocalSnapshots);
      
      // If we've removed all items, show completion screen
      if (updatedLocalSnapshots.length === 0) {
        setIsReviewComplete(true);
      }
      
      // Keep the index the same (which will now point to the next snapshot)
      // unless we're at the end of the list
      if (currentSnapshotIndex >= updatedLocalSnapshots.length) {
        setIsReviewComplete(true);
      }
    } catch (error) {
      console.error("Error during review:", error);
      toast({
        title: "Error",
        description: "Failed to save your review. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleNextCard = () => {
    if (currentSnapshotIndex < localDueSnapshots.length - 1) {
      setCurrentSnapshotIndex(currentSnapshotIndex + 1);
    } else {
      setIsReviewComplete(true);
    }
  };
  
  const handleEnableGuestMode = () => {
    setGuestMode(true);
  };
  
  const handleManualRefresh = async () => {
    setIsLoading(true);
    await refreshSnapshots();
    // Loading state will be updated by the useEffect that watches dueSnapshots
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-t-4 border-t-neuro-primary border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your review items...</p>
        </div>
      </Layout>
    );
  }
  
  // Show auth prompt if not logged in and not in guest mode
  if (!user && !guestMode) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-12">
          <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Welcome to BoostIQ</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Sign in to review your memory snapshots or continue as a guest.
            </p>
            <div className="space-y-3">
              <Link to="/signin" className="block w-full">
                <Button className="w-full" variant="default">Sign In</Button>
              </Link>
              <Link to="/signup" className="block w-full">
                <Button className="w-full" variant="outline">Create Account</Button>
              </Link>
              <Button 
                className="w-full" 
                variant="ghost"
                onClick={handleEnableGuestMode}
              >
                Continue as Guest
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                Guest mode stores data locally in your browser.
              </p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Show completion screen if all reviews are done
  if (isReviewComplete || localDueSnapshots.length === 0) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-8">
          <Card className="p-8 text-center bg-gradient-to-b from-neuro-light to-white dark:from-gray-800 dark:to-gray-900">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-green-600 dark:text-green-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              All caught up!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You've completed all your reviews for now. Great job on building your memory!
            </p>
            <div className="space-y-3">
              <Link to="/" className="block">
                <Button className="w-full">
                  Return to Dashboard
                </Button>
              </Link>
              <Link to="/create" className="block">
                <Button variant="outline" className="w-full">
                  Create New Snapshot
                </Button>
              </Link>
              <Button variant="ghost" className="w-full" onClick={handleManualRefresh}>
                Check for New Reviews
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Normal review flow with locally managed due snapshots
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Reviewing {currentSnapshotIndex + 1} of {localDueSnapshots.length}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
            >
              Refresh
            </Button>
            <Link to="/">
              <Button variant="ghost" size="sm">
                Finish Later
              </Button>
            </Link>
          </div>
        </div>
        
        {localDueSnapshots.length > 0 && currentSnapshotIndex < localDueSnapshots.length && (
          <ReviewCard 
            snapshot={localDueSnapshots[currentSnapshotIndex]}
            onReview={handleReview}
            onNextCard={handleNextCard}
          />
        )}
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
          <div 
            className="bg-neuro-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((currentSnapshotIndex + 1) / localDueSnapshots.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </Layout>
  );
}