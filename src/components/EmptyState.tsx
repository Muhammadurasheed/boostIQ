
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
}

export default function EmptyState({ title, description, actionText, actionLink }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-neuro-light flex items-center justify-center mb-4">
        <div className="w-8 h-8 rounded-full bg-neuro-accent animate-pulse-subtle" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mb-6">{description}</p>
      <Link to={actionLink}>
        <Button>{actionText}</Button>
      </Link>
    </div>
  );
}
