
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSnapshots } from "@/contexts/SnapshotContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import StatsCard from "@/components/StatsCard";
import SnapshotCard from "@/components/SnapshotCard";
import WelcomeCard from "@/components/WelcomeCard";
import EmptyState from "@/components/EmptyState";
import UserProfile from "@/components/UserProfile";
import MemoryChart from "@/components/MemoryChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user, guestMode, setGuestMode } = useAuth();
  const { snapshots, dueSnapshots, userData, loading, mockMode } = useSnapshots();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter snapshots by search term
  const filteredSnapshots = snapshots.filter(snapshot => {
    const searchLower = searchTerm.toLowerCase();
    return (
      snapshot.question.toLowerCase().includes(searchLower) ||
      snapshot.answer.toLowerCase().includes(searchLower) ||
      snapshot.summary.toLowerCase().includes(searchLower) ||
      snapshot.originalText.toLowerCase().includes(searchLower) ||
      snapshot.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });
  
  const handleEnableGuestMode = () => {
    setGuestMode(true);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-t-4 border-t-neuro-primary border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your memory snapshots...</p>
        </div>
      </Layout>
    );
  }
  
  // Show auth prompt if not logged in and not in guest mode
  if (!user && !guestMode && !mockMode) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-12">
          <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Welcome to NeuroSnap</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Sign in to access your memory snapshots or continue as a guest.
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
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                Guest mode stores data locally in your browser.
              </p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* User profile section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-2 border-b dark:border-gray-800">
          <UserProfile user={user} userData={userData} />
          <Link to="/create">
            <Button size="lg" className="bg-neuro-primary hover:bg-neuro-primary/90">
              Create New Snapshot
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Total Snapshots" 
            value={snapshots.length} 
            description="Memory items created"
          />
          <StatsCard 
            title="Due For Review" 
            value={dueSnapshots.length} 
            description={dueSnapshots.length > 0 ? "Items waiting for review" : "Everything is up to date"}
          />
          <StatsCard 
            title="Learning Streak" 
            value={userData?.stats.streakDays || 0} 
            description={userData?.stats.streakDays === 1 ? "First day! Keep it up!" : "Consecutive days of review"}
          />
        </div>
        
        {/* Memory chart */}
        {snapshots.length > 0 && (
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Memory Progress</h2>
            <CardContent className="p-0">
              <MemoryChart snapshots={snapshots} />
            </CardContent>
          </Card>
        )}
        
        {/* Main content section */}
        <div className="space-y-6">
          {snapshots.length === 0 ? (
            <WelcomeCard />
          ) : (
            <>
              {/* Search bar */}
              <div className="flex w-full max-w-lg mx-auto">
                <Input 
                  placeholder="Search your snapshots..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-r-none"
                />
                <Button 
                  variant="ghost" 
                  className="rounded-l-none border border-l-0 border-input"
                  onClick={() => setSearchTerm("")}
                  disabled={!searchTerm}
                >
                  Clear
                </Button>
              </div>
              
              {/* Snapshots tabs */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="all">All Snapshots</TabsTrigger>
                  <TabsTrigger value="due">
                    Due ({dueSnapshots.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                  {filteredSnapshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSnapshots.map(snapshot => (
                        <SnapshotCard 
                          key={snapshot.id} 
                          snapshot={snapshot}
                          compact
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No results found"
                      description={
                        searchTerm
                          ? "Try adjusting your search term to find your snapshots."
                          : "You haven't created any snapshots yet."
                      }
                      actionText="Create a Snapshot"
                      actionLink="/create"
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="due" className="mt-6">
                  {dueSnapshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dueSnapshots.map(snapshot => (
                        <SnapshotCard 
                          key={snapshot.id} 
                          snapshot={snapshot}
                          compact
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="All caught up!"
                      description="You don't have any snapshots due for review right now. Great job!"
                      actionText="Create Another Snapshot"
                      actionLink="/create"
                    />
                  )}
                  
                  {dueSnapshots.length > 0 && (
                    <div className="mt-6 flex justify-center">
                      <Link to="/review">
                        <Button size="lg">
                          Review All Due Items
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
