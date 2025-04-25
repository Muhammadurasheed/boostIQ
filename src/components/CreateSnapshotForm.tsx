import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useSnapshots } from "@/contexts/SnapshotContext";
import { useApiKey } from "@/contexts/ApiKeyContext";
import { generateSnapshot } from "@/lib/gemini";
import { speakText, stopSpeaking } from "@/lib/textToSpeech";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2 } from "lucide-react";

export default function CreateSnapshotForm() {
  const { createSnapshot } = useSnapshots();
  const { geminiApiKey, apiKeyStatus } = useApiKey();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [generateAudio, setGenerateAudio] = useState(true);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    question: string;
    answer: string;
    summary: string;
    analogy: string;
    mnemonic: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const generatePreview = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some text to generate a snapshot.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setPreview(null);
    
    try {
      const userInterest = localStorage.getItem("userInterest");
      const result = await generateSnapshot(inputText, userInterest || undefined);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setPreview(result);
    } catch (error) {
      console.error("Error generating snapshot:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate snapshot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSnapshot = async () => {
    if (!preview) return;
    
    try {
      await createSnapshot({
        originalText: inputText,
        question: preview.question,
        answer: preview.answer,
        summary: preview.summary,
        analogy: preview.analogy,
        mnemonic: preview.mnemonic,
        tags: tags,
        hasAudio: generateAudio
      });
      
      setInputText("");
      setTags([]);
      setPreview(null);
      
      toast({
        title: "Success",
        description: "Your memory snapshot has been created!",
      });
    } catch (error) {
      console.error("Error saving snapshot:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save the snapshot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlayAudio = async () => {
    if (!preview) return;
    
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }
    
    setIsPlaying(true);
    
    try {
      await speakText(preview.question);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await speakText(preview.answer);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  const simulateHighlight = () => {
    const examples = [
      "The mitochondria is the powerhouse of the cell, converting nutrients into energy that the cell can use.",
      "The Pythagorean theorem states that in a right triangle, the square of the length of the hypotenuse equals the sum of the squares of the other two sides.",
      "A blockchain is a distributed database that maintains a continuously growing list of records, called blocks, secured from tampering and revision.",
      "Cognitive biases are systematic patterns of deviation from norm or rationality in judgment, which occur due to perceptual distortions, inaccurate judgments, or illogical interpretations.",
      "Photosynthesis is the process used by plants and other organisms to convert light energy into chemical energy that can later be released to fuel the organism's activities."
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setInputText(randomExample);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Create Memory Snapshot</h2>
          <p className="text-gray-600">
            Enter text you want to remember or use the highlight simulation
          </p>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="input-text">Text to memorize</Label>
            <div className="mt-1">
              <Textarea
                id="input-text"
                placeholder="Enter or paste text here..."
                className="min-h-[120px]"
                value={inputText}
                onChange={handleInputChange}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={simulateHighlight}
                type="button"
              >
                Simulate Highlight
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex mt-1">
              <Input
                id="tags"
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                onClick={addTag}
                type="button"
                className="ml-2"
                variant="outline"
              >
                Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex gap-1 items-center">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 rounded-full hover:bg-gray-200 p-1"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="generate-audio"
              checked={generateAudio}
              onCheckedChange={setGenerateAudio}
            />
            <Label htmlFor="generate-audio">Generate audio version</Label>
          </div>
          
          <div className="pt-2">
            <Button
              onClick={generatePreview}
              disabled={loading || !inputText.trim() || apiKeyStatus !== "valid"}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Snapshot"
              )}
            </Button>
          </div>
        </div>
      </Card>
      
      {preview && (
        <Card className="mt-6 p-6">
          <h3 className="text-xl font-bold mb-4">Preview</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-500">Question</h4>
              <p className="p-2 bg-gray-50 rounded">{preview.question}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-gray-500">Answer</h4>
              <p className="p-2 bg-gray-50 rounded">{preview.answer}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Summary</h4>
                <p className="p-2 bg-gray-50 rounded">{preview.summary}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Analogy</h4>
                <p className="p-2 bg-gray-50 rounded">{preview.analogy}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-gray-500">SnapGiggle™ Mnemonic</h4>
              <p className="p-2 bg-yellow-50 rounded border border-yellow-100">{preview.mnemonic}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handlePlayAudio}
                className="flex-1"
                disabled={!generateAudio}
              >
                {isPlaying ? "Stop Audio" : "Preview Audio"}
              </Button>
              <Button
                onClick={saveSnapshot}
                className="flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                Save Snapshot
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
