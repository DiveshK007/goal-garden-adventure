
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lightbulb, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useReward } from "@/contexts/RewardContext";

interface Difference {
  id: number;
  x: number;
  y: number;
  radius: number;
  found: boolean;
}

const HocusFocusGame = () => {
  const { toast } = useToast();
  const { addPoints } = useReward();
  
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [foundCount, setFoundCount] = useState(0);
  const [totalDifferences, setTotalDifferences] = useState(5);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Generate random differences when component mounts
  useEffect(() => {
    generateDifferences();
  }, []);
  
  // Start timer when game starts
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (gameStarted && !gameCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameCompleted]);
  
  // Check for game completion
  useEffect(() => {
    if (foundCount === totalDifferences && foundCount > 0) {
      handleGameComplete();
    }
  }, [foundCount, totalDifferences]);
  
  const generateDifferences = () => {
    const newDifferences: Difference[] = [];
    
    // Generate 5 random differences
    for (let i = 0; i < 5; i++) {
      newDifferences.push({
        id: i,
        x: Math.floor(Math.random() * 80) + 10, // 10-90%
        y: Math.floor(Math.random() * 80) + 10, // 10-90%
        radius: 5, // Size of the clickable area
        found: false
      });
    }
    
    setDifferences(newDifferences);
    setFoundCount(0);
    setTotalDifferences(5);
    setGameCompleted(false);
    setTimeElapsed(0);
    setHintsUsed(0);
    setShowHint(false);
  };
  
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    if (gameCompleted) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Check if click is close to any difference
    differences.forEach((diff, index) => {
      if (!diff.found) {
        const distance = Math.sqrt(Math.pow(diff.x - x, 2) + Math.pow(diff.y - y, 2));
        
        if (distance <= diff.radius * 2) { // Make clickable area a bit larger for better UX
          handleDifferenceFound(index);
        }
      }
    });
  };
  
  const handleDifferenceFound = (index: number) => {
    setDifferences(prev => 
      prev.map((diff, i) => 
        i === index ? { ...diff, found: true } : diff
      )
    );
    
    setFoundCount(prev => prev + 1);
    
    toast({
      title: "Difference Found!",
      description: `You found ${foundCount + 1} out of ${totalDifferences} differences.`,
    });
  };
  
  const handleGameComplete = () => {
    setGameCompleted(true);
    
    // Calculate points based on time and hints used
    const basePoints = 100;
    const timeDeduction = Math.min(50, Math.floor(timeElapsed / 10) * 5); // Deduct points for time, max 50
    const hintDeduction = hintsUsed * 10; // Deduct 10 points per hint
    
    const pointsEarned = Math.max(basePoints - timeDeduction - hintDeduction, 25);
    
    addPoints(pointsEarned, "Completed Hocus Focus game");
    
    toast({
      title: "Game Complete!",
      description: `You found all the differences in ${formatTime(timeElapsed)}!`,
    });
    
    toast({
      title: "Points Earned!",
      description: `You earned ${pointsEarned} points.`,
    });
  };
  
  const useHint = () => {
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
    
    // Hide hint after 2 seconds
    setTimeout(() => {
      setShowHint(false);
    }, 2000);
  };
  
  const resetGame = () => {
    generateDifferences();
    setGameStarted(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Hocus Focus</h1>
        <p className="text-gray-500">Find the hidden differences in the image</p>
      </div>
      
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Found:</span>
          <Progress value={(foundCount / totalDifferences) * 100} className="w-32 h-2" />
          <span>{foundCount}/{totalDifferences}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Time: {formatTime(timeElapsed)}</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={useHint}
            disabled={hintsUsed >= 3 || gameCompleted}
            className="flex items-center gap-1"
          >
            <Lightbulb size={14} />
            Hint ({3 - hintsUsed} left)
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetGame}
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} /> Reset
          </Button>
        </div>
      </div>
      
      <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden aspect-video bg-gray-100">
        <div 
          className="absolute inset-0 cursor-pointer bg-[url('https://placehold.co/1200x700/e5deff/6E59A5?text=Find+the+Differences')] bg-cover"
          onClick={handleClick}
        >
          {/* Clickable spots */}
          {differences.map((diff, index) => (
            <div 
              key={index}
              className={`absolute rounded-full transition-all duration-300 ${
                diff.found ? "border-4 border-garden-green" : showHint ? "border-4 border-garden-orange animate-pulse" : ""
              }`}
              style={{
                left: `${diff.x}%`,
                top: `${diff.y}%`,
                width: `${diff.radius * 2}px`,
                height: `${diff.radius * 2}px`,
                transform: "translate(-50%, -50%)",
                opacity: diff.found || showHint ? 1 : 0,
              }}
            />
          ))}
        </div>
        
        {!gameStarted && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Button onClick={() => setGameStarted(true)} size="lg">
              Start Game
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Click on the image to find the hidden differences
      </div>
      
      {gameCompleted && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 p-4 border-2 border-garden-green rounded-lg bg-garden-green bg-opacity-10 text-center"
        >
          <Trophy className="w-10 h-10 text-garden-green mx-auto mb-2" />
          <h2 className="text-xl font-bold">Congratulations!</h2>
          <p>You found all differences in {formatTime(timeElapsed)}.</p>
          <Button 
            className="mt-4" 
            onClick={resetGame}
          >
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default HocusFocusGame;
