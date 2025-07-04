
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Trophy, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useReward } from "@/contexts/RewardContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
}

export const DailyQuests = () => {
  const [quests, setQuests] = useState<Quest[]>([
    { 
      id: "steps", 
      title: "2715 Steps More", 
      description: "Walk 2715 more steps today", 
      points: 20, 
      completed: false 
    },
    { 
      id: "leetcode", 
      title: "LeetCode Daily Quest", 
      description: "Solve the daily LeetCode challenge", 
      points: 30, 
      completed: false 
    },
    { 
      id: "meditation", 
      title: "Meditation", 
      description: "Complete 10 minutes of meditation", 
      points: 15, 
      completed: false 
    }
  ]);
  
  const [timeLeft, setTimeLeft] = useState("");
  const { addPoints } = useReward();
  const { toast } = useToast();

  // Calculate time until midnight for quest reset
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  const completeQuest = (id: string) => {
    setQuests(prevQuests => prevQuests.map(quest => {
      if (quest.id === id && !quest.completed) {
        addPoints(quest.points);
        toast({
          title: "Quest Completed!",
          description: `You earned ${quest.points} points for completing ${quest.title}.`,
        });
        return { ...quest, completed: true };
      }
      return quest;
    }));
  };

  const completedCount = quests.filter(quest => quest.completed).length;
  const totalQuests = quests.length;
  const progress = (completedCount / totalQuests) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-garden-orange" /> Daily Quests
            </CardTitle>
            <CardDescription>
              Complete daily challenges to earn points
            </CardDescription>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-4 w-4" /> {timeLeft}
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quests.map(quest => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-3 rounded-lg border space-x-2"
              style={{
                backgroundColor: quest.completed ? "rgba(34, 197, 94, 0.05)" : "", 
                borderColor: quest.completed ? "var(--garden-green)" : "",
                borderWidth: "1px",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  quest.completed ? "bg-garden-green text-white" : "border-2 border-gray-300"
                }`}>
                  {quest.completed && <Check className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <h3 className="font-medium truncate cursor-help">{quest.title}</h3>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 p-3">
                      <div className="flex gap-2 items-start">
                        <Info className="h-4 w-4 text-garden-orange mt-0.5" />
                        <div>
                          <h4 className="font-semibold">{quest.title}</h4>
                          <p className="text-sm">{quest.description}</p>
                          <p className="text-xs text-garden-green font-medium mt-2">+{quest.points} points upon completion</p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <p className="text-xs text-gray-500 truncate cursor-help">{quest.description}</p>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 p-3">
                      <div className="flex gap-2 items-start">
                        <Info className="h-4 w-4 text-garden-orange mt-0.5" />
                        <div>
                          <h4 className="font-semibold">{quest.title}</h4>
                          <p className="text-sm">{quest.description}</p>
                          <p className="text-xs text-garden-green font-medium mt-2">+{quest.points} points upon completion</p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-medium whitespace-nowrap">+{quest.points}</span>
                {!quest.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 whitespace-nowrap"
                    onClick={() => completeQuest(quest.id)}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
