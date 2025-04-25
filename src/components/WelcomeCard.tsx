
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function WelcomeCard() {
  return (
    <Card className="bg-gradient-to-br from-neuro-light to-white border-neuro-accent shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to BoostIQ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-700">
          BoostIQ helps you create <strong>memory snapshots</strong> for effective learning using:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li><span className="font-medium">Spaced Repetition</span> - Review at optimal intervals</li>
          <li><span className="font-medium">Active Recall</span> - Test yourself to strengthen memory</li>
          <li><span className="font-medium">Dual Coding</span> - Text + audio for better retention</li>
          <li><span className="font-medium">AI-powered</span> - Generates helpful learning aids</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Link to="/create" className="w-full">
          <Button className="w-full" size="lg">
            Create Your First Snapshot
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
