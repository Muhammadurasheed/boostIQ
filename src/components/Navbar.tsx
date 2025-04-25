import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSnapshots } from "@/contexts/SnapshotContext";
import ThemeToggle from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, signOut, guestMode } = useAuth();
  const { dueSnapshots } = useSnapshots();
  const location = useLocation();

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neuro-primary to-neuro-secondary">
                BoostIQ
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button
                variant={location.pathname === "/" ? "secondary" : "ghost"}
                className="rounded-full"
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/create">
              <Button
                variant={location.pathname === "/create" ? "secondary" : "ghost"}
                className="rounded-full"
              >
                Create
              </Button>
            </Link>
            <Link to="/review">
              <Button
                variant={location.pathname === "/review" ? "secondary" : "ghost"}
                className="rounded-full relative"
              >
                Review
                {dueSnapshots.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {dueSnapshots.length}
                  </span>
                )}
              </Button>
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Theme toggle button */}
            <ThemeToggle />
            
            {/* User menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  {user ? user.email?.split('@')[0] : guestMode ? "Guest" : "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(user || guestMode) ? (
                  <>
                    <DropdownMenuItem disabled>
                      {user ? user.email : "Guest Mode"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <Link to="/signin">
                      <DropdownMenuItem>Sign In</DropdownMenuItem>
                    </Link>
                    <Link to="/signup">
                      <DropdownMenuItem>Sign Up</DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="md:hidden border-t">
        <div className="grid grid-cols-3 divide-x">
          <Link to="/" className="py-2 text-center">
            <div className={`text-sm font-medium ${location.pathname === "/" ? "text-neuro-primary" : ""}`}>
              Dashboard
            </div>
          </Link>
          <Link to="/create" className="py-2 text-center">
            <div className={`text-sm font-medium ${location.pathname === "/create" ? "text-neuro-primary" : ""}`}>
              Create
            </div>
          </Link>
          <Link to="/review" className="py-2 text-center">
            <div className={`text-sm font-medium relative ${location.pathname === "/review" ? "text-neuro-primary" : ""}`}>
              Review
              {dueSnapshots.length > 0 && (
                <span className="absolute -top-1 right-1/4 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {dueSnapshots.length}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
