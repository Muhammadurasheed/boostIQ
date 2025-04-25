
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useApiKey } from "@/contexts/ApiKeyContext";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyDialog({ open, onOpenChange }: ApiKeyDialogProps) {
  const { geminiApiKey, setGeminiApiKey, apiKeyStatus, testApiKey } = useApiKey();
  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    if (inputKey) {
      setGeminiApiKey(inputKey);
      setIsTesting(true);
      
      try {
        await testApiKey();
      } finally {
        setIsTesting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Google Gemini API Key</DialogTitle>
          <DialogDescription>
            Enter your Gemini API key to enable AI features. Your key will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Gemini API key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
            </div>
          </div>
          
          <div className="text-sm">
            <p>Get your API key from:</p>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neuro-primary hover:underline"
            >
              https://aistudio.google.com/app/apikey
            </a>
          </div>
          
          {apiKeyStatus === "valid" && (
            <div className="text-sm text-green-600">
              API key is valid and ready to use
            </div>
          )}
          
          {apiKeyStatus === "invalid" && (
            <div className="text-sm text-red-600">
              Invalid API key. Please check and try again.
            </div>
          )}
          
          {apiKeyStatus === "testing" && (
            <div className="text-sm text-amber-600">
              Testing API connection...
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!inputKey || isTesting}
          >
            {isTesting ? "Testing..." : "Save & Test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
