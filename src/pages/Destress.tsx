import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Award, Clock, Info } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useReward } from "@/contexts/RewardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const facts = [
  "Taking deep breaths lowers stress hormone levels and blood pressure.",
  "Studies show that just 5 minutes of outdoor activity can improve your mood.",
  "Listening to music can reduce anxiety by up to 65%.",
  "The brain can't actually multitask efficiently - focusing on one task at a time is more effective.",
  "Regular breaks during study sessions improve information retention.",
  "A 20-minute power nap can boost alertness by 54%.",
  "Writing down your worries before an exam can improve performance.",
  "Stress isn't always bad - moderate stress levels can improve memory and motivation.",
  "Exercise increases endorphins that reduce stress and improve concentration.",
  "Laughter reduces stress hormones and improves immune function.",
  "Staying hydrated improves cognitive performance and mood.",
];

const breatheInstructions = [
  "Breathe in deeply...",
  "Hold your breath...",
  "Breathe out slowly...",
  "Hold before breathing in..."
];

interface MemoryCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

interface MindfulnessBreathingProps {
  onComplete: () => void;
}

const MindfulnessBreathing = ({ onComplete }: MindfulnessBreathingProps) => {
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const maxTime = 60; // 1 minute exercise
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        const newSeconds = prev + 1;
        setProgress((newSeconds / maxTime) * 100);
        
        if (newSeconds % 4 === 0) {
          setPhase(prevPhase => (prevPhase + 1) % 4);
        }
        
        if (newSeconds >= maxTime) {
          clearInterval(timer);
          onComplete();
        }
        
        return newSeconds;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onComplete]);
  
  const size = phase === 0
    ? 'scale-100' // Breathe in
    : phase === 1
    ? 'scale-100' // Hold
    : phase === 2
    ? 'scale-90' // Breathe out
    : 'scale-90'; // Hold before breathing in
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold mb-1">Mindful Breathing</h3>
        <p className="text-gray-500">Follow the circle and breathe accordingly</p>
      </div>
      
      <div className="relative mb-10">
        <motion.div
          className="w-40 h-40 border-4 border-garden-green rounded-full flex items-center justify-center"
          animate={{ scale: phase === 0 || phase === 1 ? 1.2 : 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <motion.div
            className="w-32 h-32 bg-garden-green bg-opacity-20 rounded-full flex items-center justify-center text-garden-green"
            animate={{ scale: phase === 0 || phase === 1 ? 1.2 : 1, opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          >
            <p className="font-medium text-center px-4">{breatheInstructions[phase]}</p>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="w-full max-w-md mb-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>0:00</span>
          <span>1:00</span>
        </div>
      </div>
      
      <p className="text-center text-sm text-gray-500 max-w-md">
        Focus on your breath and let go of any distracting thoughts
      </p>
    </div>
  );
};

interface MemoryGameProps {
  onComplete: () => void;
}

const MemoryGame = ({ onComplete }: MemoryGameProps) => {
  const emojis = ["🌈", "🌞", "🌵", "🌸", "🍉", "🦋", "🐬", "🦄"];
  const { toast } = useToast();
  
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  
  useEffect(() => {
    const shuffledDeck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false,
      }));
    
    setCards(shuffledDeck);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
  }, []);
  
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === first || card.id === second
              ? { ...card, matched: true }
              : card
          )
        );
        setMatchedPairs(prev => prev + 1);
        setFlippedCards([]);
      } else {
        const timer = setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === first || card.id === second
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [flippedCards, cards]);
  
  useEffect(() => {
    if (matchedPairs === emojis.length && matchedPairs > 0) {
      toast({
        title: "Memory Game Completed!",
        description: `You found all pairs in ${moves} moves.`,
      });
      onComplete();
    }
  }, [matchedPairs, moves, onComplete, toast]);
  
  const handleCardClick = (id: number) => {
    if (
      cards[id].matched ||
      flippedCards.length === 2 ||
      flippedCards.includes(id)
    ) {
      return;
    }
    
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === id ? { ...card, flipped: true } : card
      )
    );
    
    setFlippedCards(prev => [...prev, id]);
    
    if (flippedCards.length === 1) {
      setMoves(prev => prev + 1);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold mb-1">Memory Match</h3>
        <p className="text-gray-500">Find all matching pairs</p>
      </div>
      
      <div className="flex justify-between items-center w-full max-w-xs mb-6">
        <Badge variant="outline" className="px-3 py-1">
          Moves: {moves}
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Pairs: {matchedPairs}/{emojis.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
        {cards.map(card => (
          <motion.div
            key={card.id}
            className={`aspect-square rounded-md cursor-pointer flex items-center justify-center text-2xl ${
              card.flipped || card.matched
                ? "bg-garden-purple bg-opacity-20 border-2 border-garden-purple"
                : "bg-garden-light"
            }`}
            onClick={() => handleCardClick(card.id)}
            animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {(card.flipped || card.matched) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {card.emoji}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface ActivityCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  completed?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ActivityCard = ({ title, description, icon, completed, onClick, disabled }: ActivityCardProps) => (
  <div 
    className={`p-4 border rounded-lg cursor-pointer transition-all ${
      disabled ? "opacity-60" : completed ? "border-garden-green bg-garden-green bg-opacity-5" : "hover:border-garden-purple hover:shadow-sm"
    }`}
    onClick={disabled ? undefined : onClick}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${completed ? "bg-garden-green text-white" : "bg-garden-light"}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-medium flex items-center gap-2">
            {title} {completed && <Check size={16} className="text-garden-green" />}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  </div>
);

const Destress = () => {
  const { addPoints } = useReward();
  const { toast } = useToast();
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [fact, setFact] = useState("");
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  
  useEffect(() => {
    setFact(facts[Math.floor(Math.random() * facts.length)]);
  }, []);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      handleQuestComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft]);
  
  const startTimer = () => {
    setIsTimerActive(true);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const handleActivityComplete = (activity: string) => {
    setActiveActivity(null);
    if (!completedActivities.includes(activity)) {
      setCompletedActivities(prev => [...prev, activity]);
      addPoints(15);
      toast({
        title: "Activity Completed!",
        description: `You earned 15 points for completing ${activity}.`,
      });
    }
  };
  
  const handleQuestComplete = () => {
    if (completedActivities.length >= 2) {
      addPoints(25);
      toast({
        title: "Destress Quest Completed!",
        description: "You earned 25 bonus points for completing the quest!",
      });
    }
  };
  
  const resetQuest = () => {
    setTimeLeft(300);
    setIsTimerActive(false);
    setCompletedActivities([]);
    setFact(facts[Math.floor(Math.random() * facts.length)]);
  };
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="text-garden-purple" /> 5-Minute Destress Quest
          </h1>
          <p className="text-gray-500">
            Take a short break to clear your mind and reduce stress
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Break Timer</CardTitle>
                <Badge variant={isTimerActive ? "default" : "outline"} className="px-3">
                  {isTimerActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Complete at least 2 activities during your 5-minute break
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-garden-green"
                        strokeWidth="5"
                        strokeDasharray={283}
                        strokeDashoffset={283 - (timeLeft / 300) * 283}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{formatTime(timeLeft)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 flex-wrap justify-center">
                  {!isTimerActive ? (
                    <Button onClick={startTimer} className="flex items-center gap-2">
                      <Clock size={16} /> Start Your Break
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={resetQuest} className="flex items-center gap-2">
                      <RefreshCw size={16} /> Reset Quest
                    </Button>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {completedActivities.map((activity) => (
                    <Badge key={activity} variant="secondary" className="px-3 py-1">
                      {activity} ✓
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Activities</CardTitle>
              <CardDescription>
                Choose an activity to help clear your mind
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeActivity === "breathing" ? (
                <MindfulnessBreathing 
                  onComplete={() => handleActivityComplete("Mindful Breathing")} 
                />
              ) : activeActivity === "memory" ? (
                <MemoryGame 
                  onComplete={() => handleActivityComplete("Memory Game")} 
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <ActivityCard
                    title="Mindful Breathing"
                    description="A guided breathing exercise to help calm your mind"
                    icon={<Brain size={20} />}
                    completed={completedActivities.includes("Mindful Breathing")}
                    onClick={() => setActiveActivity("breathing")}
                    disabled={!isTimerActive}
                  />
                  
                  <ActivityCard
                    title="Memory Game"
                    description="A fun memory matching game to focus your attention"
                    icon={<Award size={20} />}
                    completed={completedActivities.includes("Memory Game")}
                    onClick={() => setActiveActivity("memory")}
                    disabled={!isTimerActive}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={18} /> Did You Know?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{fact}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFact(facts[Math.floor(Math.random() * facts.length)])}
              >
                <RefreshCw size={14} className="mr-2" /> New Fact
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Why Take Breaks?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Taking short breaks during study sessions isn't just pleasant—it's proven to be beneficial for your learning and mental health:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-garden-light rounded-lg">
                <h3 className="font-medium mb-2">Improved Focus</h3>
                <p className="text-sm text-gray-600">
                  Brief breaks restore mental energy and help maintain concentration over longer periods.
                </p>
              </div>
              
              <div className="p-4 bg-garden-light rounded-lg">
                <h3 className="font-medium mb-2">Better Retention</h3>
                <p className="text-sm text-gray-600">
                  Your brain continues processing information during breaks, strengthening memory consolidation.
                </p>
              </div>
              
              <div className="p-4 bg-garden-light rounded-lg">
                <h3 className="font-medium mb-2">Stress Reduction</h3>
                <p className="text-sm text-gray-600">
                  Regular breaks lower stress hormones and prevent mental fatigue and burnout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Destress;
