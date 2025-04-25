import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

import { BrainCircuit, Repeat2, PlayCircle, Sparkle } from "lucide-react";

const learningFeatures = [
  {
    icon: <Repeat2 className="w-6 h-6 text-indigo-500" />,
    title: "Spaced Repetition",
    description: "Review at scientifically proven intervals to lock information in long-term memory.",
  },
  {
    icon: <BrainCircuit className="w-6 h-6 text-pink-500" />,
    title: "Active Recall",
    description: "Strengthen your memory through consistent self-testing and active engagement.",
  },
  {
    icon: <PlayCircle className="w-6 h-6 text-teal-500" />,
    title: "Dual Coding",
    description: "Blend visual and auditory formats for maximum retention and understanding.",
  },
  {
    icon: <Sparkle className="w-6 h-6 text-yellow-500" />,
    title: "AI-Generated Aids",
    description: "Get summaries, analogies, mnemonics & more tailored to your learning style.",
  },
];


export default function WelcomeCard() {
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-col items-center text-center space-y-2 pt-6">
        <Sparkles className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-pulse" />
        <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome to <span className="text-indigo-600 dark:text-indigo-400">BoostIQ</span>
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">
          Your AI-powered memory companion. Let’s make knowledge unforgettable — literally.
        </p>
      </CardHeader>

      <CardContent className="grid gap-6 px-6 py-4">
        {learningFeatures.map((feature, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">{feature.icon}</div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>


      <CardFooter className="p-6 pt-0">
        <Link to="/create" className="w-full">
          <Button
            className="w-full text-lg font-semibold py-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200"
            size="lg"
          >
            🚀 Create Your First Snapshot
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
