
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useReward } from "@/contexts/RewardContext";
import { useToast } from "@/components/ui/use-toast";

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
    <Card>
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
              className={`flex items-center justify-between p-3 rounded-lg border ${
                quest.completed ? "bg-garden-green bg-opacity-5 border-garden-green" : "bg-garden-light"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  quest.completed ? "bg-garden-green text-white" : "border-2 border-gray-300"
                }`}>
                  {quest.completed && <Check className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-medium">{quest.title}</h3>
                  <p className="text-xs text-gray-500">{quest.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">+{quest.points}</span>
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
