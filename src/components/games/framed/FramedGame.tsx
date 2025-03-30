
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Award, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useReward } from "@/contexts/RewardContext";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

// Sample movie database
const movies = [
  {
    id: 1,
    title: "The Matrix",
    year: 1999,
    frames: [
      "A green code scrolling on a black screen",
      "A red pill and a blue pill in someone's hands",
      "Neo dodging bullets in slow motion",
      "Agent Smith in a suit and sunglasses",
      "Neo and Trinity in an elevator with guns",
      "Morpheus offering Neo a choice"
    ]
  },
  {
    id: 2,
    title: "Inception",
    year: 2010,
    frames: [
      "A spinning top on a table",
      "A city folding in on itself",
      "People sleeping connected to a machine",
      "Characters floating in a hotel corridor",
      "A train moving through a city street",
      "Characters in suits planning a heist"
    ]
  },
  {
    id: 3,
    title: "Jurassic Park",
    year: 1993,
    frames: [
      "Scientists looking at amber with a mosquito inside",
      "A cup of water with ripples as something approaches",
      "A kitchen with velociraptors searching for children",
      "A T-Rex in heavy rain next to an SUV",
      "A park banner falling as dinosaurs approach",
      "A scientist holding dinosaur eggs"
    ]
  },
  {
    id: 4,
    title: "The Shawshank Redemption",
    year: 1994,
    frames: [
      "A man standing in the rain with arms outstretched",
      "An old man feeding birds in a park",
      "Prison bars with a poster on the wall",
      "Two men talking in a prison yard",
      "A rock hammer hidden in a Bible",
      "A boat being fixed on a beach"
    ]
  }
];

const FramedGame = () => {
  const [currentMovie, setCurrentMovie] = useState<typeof movies[0] | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { toast } = useToast();
  const { addPoints } = useReward();
  
  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);
  
  // Reset game with a new random movie
  const resetGame = () => {
    const randomIndex = Math.floor(Math.random() * movies.length);
    setCurrentMovie(movies[randomIndex]);
    setCurrentFrameIndex(0);
    setGuesses([]);
    setInputValue("");
    setGameStatus("playing");
    setShowHint(false);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !currentMovie) return;
    
    const cleanGuess = inputValue.trim().toLowerCase();
    const cleanTitle = currentMovie.title.toLowerCase();
    
    // Add guess to history
    setGuesses([...guesses, inputValue]);
    setInputValue("");
    
    // Check if correct
    if (cleanGuess === cleanTitle) {
      setGameStatus("won");
      
      // Calculate points based on how many frames it took
      const basePoints = 100;
      const framePenalty = currentFrameIndex * 10;
      const pointsEarned = Math.max(basePoints - framePenalty, 30);
      
      addPoints(pointsEarned);
      
      toast({
        title: "You got it!",
        description: `Correct! You identified "${currentMovie.title}" (${currentMovie.year}) in ${currentFrameIndex + 1} frames.`,
      });
    } else {
      // Show next frame if available
      if (currentFrameIndex < currentMovie.frames.length - 1) {
        setCurrentFrameIndex(currentFrameIndex + 1);
      } else {
        // Game over - no more frames
        setGameStatus("lost");
        toast({
          title: "Game Over",
          description: `The movie was "${currentMovie.title}" (${currentMovie.year}).`,
          variant: "destructive"
        });
      }
    }
  };
  
  // Get hint (year of release)
  const getHint = () => {
    if (currentMovie) {
      setShowHint(true);
      toast({
        title: "Hint Used",
        description: `This movie was released in ${currentMovie.year}.`,
      });
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Framed</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={18} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Frame {currentFrameIndex + 1}/{currentMovie?.frames.length || 6}
          </Badge>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={resetGame}
            title="New Game"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>
      
      {currentMovie && (
        <div className="mb-6">
          <motion.div 
            key={currentFrameIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-200 aspect-video rounded-md flex items-center justify-center p-4 text-center"
          >
            <p className="font-medium text-gray-700">Frame {currentFrameIndex + 1}: {currentMovie.frames[currentFrameIndex]}</p>
          </motion.div>
          
          {showHint && (
            <div className="mt-2 text-sm text-center">
              <Badge variant="secondary">Release Year: {currentMovie.year}</Badge>
            </div>
          )}
          
          {gameStatus === "playing" && (
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex gap-2">
                <Input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter movie title..."
                  className="flex-1"
                />
                <Button type="submit">Guess</Button>
              </div>
            </form>
          )}
        </div>
      )}
      
      {/* Previous guesses */}
      {guesses.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Your Guesses:</h3>
          <div className="flex flex-wrap gap-2">
            {guesses.map((guess, index) => (
              <Badge key={index} variant="outline">
                {guess}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Hint button */}
      {gameStatus === "playing" && !showHint && (
        <div className="mb-4 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={getHint}
          >
            Need a Hint?
          </Button>
        </div>
      )}
      
      {/* Game completion message */}
      {gameStatus !== "playing" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg text-center mt-4 ${
            gameStatus === "won" ? "bg-green-100 border border-green-500" : 
            "bg-red-100 border border-red-500"
          }`}
        >
          <div className="flex justify-center mb-2">
            <Award size={24} className={gameStatus === "won" ? "text-green-500" : "text-red-500"} />
          </div>
          <h3 className="font-bold text-lg">
            {gameStatus === "won" ? "Correct!" : "Game Over"}
          </h3>
          <p className="mb-2">
            The movie was <span className="font-semibold">{currentMovie?.title}</span> ({currentMovie?.year})
          </p>
          {gameStatus === "won" && (
            <p className="mb-2 text-sm">
              You identified it in {currentFrameIndex + 1} {currentFrameIndex === 0 ? 'frame' : 'frames'}!
            </p>
          )}
          <Button onClick={resetGame}>Play Again</Button>
        </motion.div>
      )}
      
      {/* Help drawer */}
      <Drawer open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>How to Play Framed</DrawerTitle>
            <DrawerDescription>Guess the movie from scene descriptions</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-medium">Rules:</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                <li>You'll be shown descriptions of movie scenes, one at a time</li>
                <li>Try to guess the movie from as few scenes as possible</li>
                <li>You get 6 scenes total to guess correctly</li>
                <li>If you need help, you can reveal the release year</li>
              </ul>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-md">
              <h3 className="font-medium mb-1">Scoring:</h3>
              <p className="text-sm">The earlier you guess correctly, the more points you earn:</p>
              <ul className="list-disc pl-5 text-sm mt-1">
                <li>First frame: 100 points</li>
                <li>Each additional frame: -10 points</li>
                <li>Minimum score: 30 points</li>
              </ul>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Start Playing</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default FramedGame;
