
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSnapshots } from "@/contexts/SnapshotContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ReviewCard from "@/components/ReviewCard";
import EmptyState from "@/components/EmptyState";
import { Difficulty } from "@/lib/spacedRepetition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Review() {
  const { dueSnapshots, updateSnapshotAfterReview, refreshSnapshots } = useSnapshots();
  const { user, guestMode, setGuestMode } = useAuth();
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  
  useEffect(() => {
    // Refresh snapshots when the component mounts
    refreshSnapshots();
  }, [refreshSnapshots]);
  
  useEffect(() => {
    // Reset state when due snapshots change
    setCurrentSnapshotIndex(0);
    setIsReviewComplete(dueSnapshots.length === 0);
  }, [dueSnapshots.length]);
  
  const handleReview = async (snapshotId: string, difficulty: Difficulty) => {
    await updateSnapshotAfterReview(snapshotId, difficulty);
  };
  
  const handleNextCard = () => {
    if (currentSnapshotIndex < dueSnapshots.length - 1) {
      setCurrentSnapshotIndex(currentSnapshotIndex + 1);
    } else {
      setIsReviewComplete(true);
    }
  };
  
  const handleEnableGuestMode = () => {
    setGuestMode(true);
  };
  
  // Show auth prompt if not logged in and not in guest mode
  if (!user && !guestMode) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-12">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome to NeuroSnap</h1>
            <p className="mb-6 text-gray-600">
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
              <p className="text-xs text-gray-500 text-center pt-2">
                Guest mode stores data locally in your browser.
              </p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Show completion screen if all reviews are done
  if (isReviewComplete || dueSnapshots.length === 0) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-8">
          <Card className="p-8 text-center bg-gradient-to-b from-neuro-light to-white">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-green-600" 
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
            <p className="text-gray-600 mb-6">
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
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Normal review flow
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Reviewing {currentSnapshotIndex + 1} of {dueSnapshots.length}
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm">
              Finish Later
            </Button>
          </Link>
        </div>
        
        <ReviewCard 
          snapshot={dueSnapshots[currentSnapshotIndex]}
          onReview={handleReview}
          onNextCard={handleNextCard}
        />
        
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-neuro-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((currentSnapshotIndex + 1) / dueSnapshots.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </Layout>
  );
}
