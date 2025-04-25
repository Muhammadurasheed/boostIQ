
import { ReactNode } from "react";
import Navbar from "./Navbar";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neuro-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-gray-500">
      BoostIQ © {new Date().getFullYear()} - Turn Knowledge Into Long-Term Memory
      </footer>
      <Toaster />
    </div>
  );
}
