
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Laugh } from "lucide-react";

const interests = [
  "cooking",
  "anime",
  "sports",
  "business",
  "spirituality",
  "fashion",
  "memes",
  "travel",
  "tech",
  "music",
  "gaming",
  "art"
];

interface InterestDialogProps {
  open: boolean;
  onSelect: (interest: string) => void;
}

export default function InterestDialog({ open, onSelect }: InterestDialogProps) {
  const [selectedInterest, setSelectedInterest] = useState<string>("");

  const handleSelect = () => {
    if (selectedInterest) {
      onSelect(selectedInterest);
      localStorage.setItem("userInterest", selectedInterest);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Laugh className="h-6 w-6 text-yellow-500" />
            Welcome to BoostIQ!
          </DialogTitle>
          <DialogDescription>
            Tell us what you're passionate about so we can make your learning experience more fun and memorable.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <Select onValueChange={setSelectedInterest}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your passion..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {interests.map((interest) => (
                  <SelectItem key={interest} value={interest}>
                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleSelect} 
            className="w-full"
            disabled={!selectedInterest}
          >
            Let's Get Started!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
