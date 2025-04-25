
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ApiKeyProvider } from "./contexts/ApiKeyContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SnapshotProvider } from "./contexts/SnapshotContext";
import Dashboard from "./pages/Dashboard";
import CreateSnapshot from "./pages/CreateSnapshot";
import Review from "./pages/Review";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import InterestDialog from "./components/InterestDialog";

const queryClient = new QueryClient();

const App = () => {
  const [showInterestDialog, setShowInterestDialog] = useState(false);

  useEffect(() => {
    const hasSelectedInterest = localStorage.getItem("userInterest");
    if (!hasSelectedInterest) {
      setShowInterestDialog(true);
    }
  }, []);

  const handleInterestSelect = (interest: string) => {
    setShowInterestDialog(false);
  };

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <ApiKeyProvider>
              <AuthProvider>
                <SnapshotProvider>
                  <InterestDialog 
                    open={showInterestDialog} 
                    onSelect={handleInterestSelect}
                  />
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/create" element={<CreateSnapshot />} />
                    <Route path="/review" element={<Review />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SnapshotProvider>
              </AuthProvider>
            </ApiKeyProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
