
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Snapshot } from "@/types";
import { useSnapshots } from "@/contexts/SnapshotContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { speakText, stopSpeaking } from "@/lib/textToSpeech";
import { isSnapshotDue } from "@/lib/spacedRepetition";

interface SnapshotCardProps {
  snapshot: Snapshot;
  compact?: boolean;
}

export default function SnapshotCard({ snapshot, compact }: SnapshotCardProps) {
  const { deleteSnapshot } = useSnapshots();
  const [showDetails, setShowDetails] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isDue = isSnapshotDue(snapshot.review);
  const nextReviewDate = snapshot.review.nextReviewDate;

  const formattedDate = nextReviewDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime = nextReviewDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format relative time
  const getRelativeTimeString = () => {
    const now = new Date();
    const diffMs = nextReviewDate.getTime() - now.getTime();

    // If due
    if (diffMs <= 0) {
      return "Due now";
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `Due in ${diffMins} minutes`;
    }

    const diffHours = Math.floor(diffMins / 60);

    if (diffHours < 24) {
      return `Due in ${diffHours} hours`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `Due in ${diffDays} days`;
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    try {
      // Play question
      await speakText(snapshot.question);
      // Pause
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Play answer
      await speakText(snapshot.answer);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleDelete = async () => {
    await deleteSnapshot(snapshot.id);
    setConfirmDelete(false);
  };

  if (compact) {
    return (
      <Card className="h-full hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800">
        <CardHeader className="p-4">
          <CardTitle className="text-base line-clamp-2">
            {snapshot.question}
          </CardTitle>
        </CardHeader>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Badge variant={isDue ? "destructive" : "outline"}>
            {isDue ? "Due now" : getRelativeTimeString()}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setShowDetails(true)}>
            Details
          </Button>
        </CardFooter>

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Memory Snapshot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Question</h4>
                <p className="text-foreground">{snapshot.question}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Answer</h4>
                <p className="text-foreground">{snapshot.answer}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Summary</h4>
                <p className="text-foreground">{snapshot.summary}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Analogy</h4>
                <p className="text-foreground">{snapshot.analogy}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Mnemonic</h4>
                <p className="text-foreground">{snapshot.mnemonic}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Original Text</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{snapshot.originalText}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Next Review</h4>
                <p className="text-foreground">{formattedDate} at {formattedTime}</p>
              </div>
              {snapshot.tags && snapshot.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Tags</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {snapshot.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayAudio}
              >
                {isPlaying ? "Stop Audio" : "Play Audio"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this snapshot?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{snapshot.question}</CardTitle>
          <div className="flex gap-2">
            {snapshot.hasAudio && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayAudio}
              >
                {isPlaying ? "Stop Audio" : "Play Audio"}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-300">Answer</h4>
          <p className="text-black dark:text-white">{snapshot.answer}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-300">Summary</h4>
            <p className="text-black dark:text-white">{snapshot.summary}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-300">Analogy</h4>
            <p className="text-black dark:text-white">{snapshot.analogy}</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-300">Mnemonic</h4>
          <p className="text-black dark:text-white">{snapshot.mnemonic}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-300">Original Text</h4>
          <p className="text-sm text-black dark:text-white">{snapshot.originalText}</p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          {snapshot.tags.map((tag, i) => (
            <Badge key={i} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <Badge variant={isDue ? "destructive" : "outline"}>
          {isDue ? "Due now" : `Next review: ${formattedDate}`}
        </Badge>
      </CardFooter>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this snapshot?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}