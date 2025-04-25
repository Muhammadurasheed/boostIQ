
import { useEffect } from "react";
import { useApiKey } from "@/contexts/ApiKeyContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import CreateSnapshotForm from "@/components/CreateSnapshotForm";
import { preloadVoices } from "@/lib/textToSpeech";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CreateSnapshot() {
  const { apiKeyStatus, geminiApiKey } = useApiKey();
  const { user, guestMode, setGuestMode } = useAuth();
  
  // Preload voices for speech synthesis
  useEffect(() => {
    preloadVoices();
  }, []);
  
  const handleEnableGuestMode = () => {
    setGuestMode(true);
  };
  
  // Show auth prompt if not logged in and not in guest mode
  if (!user && !guestMode) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-12">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome to BoostIQ</h1>
            <p className="mb-6 text-gray-600">
              Sign in to create memory snapshots or continue as a guest.
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

  // API Key warning if not set
  if (apiKeyStatus === "unset" || apiKeyStatus === "invalid" || !geminiApiKey) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-12">
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <h1 className="text-xl font-bold mb-4">API Key Required</h1>
            <p className="mb-6 text-gray-700">
              
            </p>
            <p className="text-sm text-gray-600 mb-4">
              You can get a free API key from 
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neuro-primary hover:underline ml-1"
              >
                Google AI Studio
              </a>.
            </p>
            <Link to="/" className="block w-full">
              <Button variant="outline" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <CreateSnapshotForm />
      </div>
    </Layout>
  );
}
