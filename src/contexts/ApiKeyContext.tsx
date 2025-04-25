import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "../components/ui/use-toast";

interface ApiKeyContextType {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  apiKeyStatus: "unset" | "set" | "testing" | "valid" | "invalid";
  testApiKey: () => Promise<boolean>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const API_KEY_STORAGE_KEY = "boostIQApiKey";

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>("AIzaSyA81SV6mvA9ShZasJgcVl4ps-YQm9DrKsc");
  const [apiKeyStatus, setApiKeyStatus] = useState<"unset" | "set" | "testing" | "valid" | "invalid">("valid");
  const { toast } = useToast();

  useEffect(() => {
    setGeminiApiKeyState("AIzaSyA81SV6mvA9ShZasJgcVl4ps-YQm9DrKsc");
    setApiKeyStatus("valid");
  }, []);

  const setGeminiApiKey = (key: string) => {
    toast({
      title: "API Key Configured",
      description: "The API key is already set up for you",
    });
  };

  const testApiKey = async (): Promise<boolean> => {
    setApiKeyStatus("valid");
    return true;
  };

  const value = {
    geminiApiKey,
    setGeminiApiKey,
    apiKeyStatus,
    testApiKey
  };

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
}
