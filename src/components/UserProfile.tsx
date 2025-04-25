
import { User as FirebaseUser } from "firebase/auth";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface UserProfileProps {
  user: FirebaseUser | null;
  userData: User | null;
}

export default function UserProfile({ user, userData }: UserProfileProps) {
  // Get the user display name from Firebase or Firestore data
  const displayName = 
    user?.displayName || 
    userData?.name || 
    (user?.email ? user.email.split('@')[0] : 'User');
  
  // Get user's interest if available
  const userInterest = userData?.interest || localStorage.getItem("userInterest") || '';

  // Generate avatar background color based on user ID or email for consistency
  const userId = user?.uid || user?.email || Math.random().toString();
  const colorIndex = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
  
  const bgColors = [
    "bg-purple-500",   // Purple
    "bg-blue-500",     // Blue 
    "bg-green-500",    // Green
    "bg-amber-500",    // Amber
    "bg-rose-500",     // Rose
  ];
  
  const avatarBg = bgColors[colorIndex];

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-14 w-14 border-2 border-white dark:border-gray-800 shadow-md">
        {user?.photoURL ? (
          <AvatarImage src={user.photoURL} alt={displayName} />
        ) : (
          <AvatarFallback className={`text-lg font-medium text-white ${avatarBg}`}>
            {getInitials(displayName)}
          </AvatarFallback>
        )}
      </Avatar>
      <div>
        <h2 className="text-xl font-bold">{displayName}</h2>
        {userInterest && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Interested in {userInterest}
          </p>
        )}
      </div>
    </div>
  );
}
