import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Snapshot } from "@/types";
import { Difficulty } from "@/lib/spacedRepetition";
import { speakText, stopSpeaking } from "@/lib/textToSpeech";
import { Progress } from "@/components/ui/progress";
import { Laugh } from "lucide-react";

interface ReviewCardProps {
  snapshot: Snapshot;
  onReview: (snapshotId: string, difficulty: Difficulty) => Promise<void>;
  onNextCard: () => void;
}

export default function ReviewCard({ snapshot, onReview, onNextCard }: ReviewCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(0);

  useEffect(() => {
    setShowAnswer(false);
    setIsReviewing(false);
    stopSpeaking();
    setIsPlaying(false);
    setProgress(0);
    
    const totalLength = snapshot.question.length + snapshot.answer.length;
    const baseTime = 5;
    const charTime = 0.05;
    const calculatedTime = baseTime + totalLength * charTime;
    setAnimationDuration(calculatedTime);
    
    const timer = setTimeout(() => {
      setProgress(100);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [snapshot]);

  const handleReview = async (difficulty: Difficulty) => {
    setIsReviewing(true);
    try {
      await onReview(snapshot.id, difficulty);
      onNextCard();
    } finally {
      setIsReviewing(false);
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }
    
    setIsPlaying(true);
    
    try {
      await speakText(snapshot.question);
      
      if (showAnswer) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await speakText(snapshot.answer);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Review</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePlayAudio}
            disabled={isReviewing}
          >
            {isPlaying ? "Stop" : "Play Audio"}
          </Button>
        </div>
        <Progress 
          value={progress} 
          className="h-1"
          style={{
            transition: `progress ${animationDuration}s linear`
          }}
        />
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Question</h3>
          <div className="text-xl bg-gray-50 dark:bg-gray-900 p-4 rounded-md border dark:border-gray-700">
            {snapshot.question}
          </div>
        </div>
        
        {!showAnswer ? (
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowAnswer(true)} 
              variant="outline"
              size="lg"
              className="w-full max-w-xs"
              disabled={isReviewing}
            >
              Show Answer
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Answer</h3>
              <div className="text-xl bg-gray-50 dark:bg-gray-900 p-4 rounded-md border dark:border-gray-700">
                {snapshot.answer}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Summary</h3>
                <div className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md border dark:border-gray-700">
                  {snapshot.summary}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Analogy</h3>
                <div className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md border dark:border-gray-700">
                  {snapshot.analogy}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Laugh className="h-5 w-5 text-yellow-500" />
                SnapGiggle™ Mnemonic
              </h3>
              <div className="text-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
                {snapshot.mnemonic}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      {showAnswer && (
        <CardFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2">
          <div className="text-sm text-gray-500 mb-2 sm:mb-0 sm:mr-auto">
            How well did you remember this?
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              disabled={isReviewing}
              variant="outline"
              className="flex-1 sm:flex-none border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
              onClick={() => handleReview(Difficulty.Hard)}
            >
              Hard
            </Button>
            <Button
              disabled={isReviewing}
              variant="outline"
              className="flex-1 sm:flex-none border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
              onClick={() => handleReview(Difficulty.Medium)}
            >
              Medium
            </Button>
            <Button
              disabled={isReviewing}
              variant="outline"
              className="flex-1 sm:flex-none border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
              onClick={() => handleReview(Difficulty.Easy)}
            >
              Easy
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
