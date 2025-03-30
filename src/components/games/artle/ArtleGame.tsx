
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, HelpCircle } from "lucide-react";
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
  DrawerTrigger,
} from "@/components/ui/drawer";

// Sample artist database
const artists = [
  {
    id: 1,
    name: "Vincent van Gogh",
    works: [
      "Starry Night - A swirling night sky with stars, cypress tree, and village",
      "Sunflowers - A vase filled with bright yellow sunflowers",
      "Self Portrait with Bandaged Ear - Artist with green coat and bandaged ear",
      "Café Terrace at Night - Yellow cafe with blue sky and starry night",
      "The Bedroom - Simple bedroom with blue walls and red bed",
      "Irises - Purple and blue irises in a garden setting"
    ],
    hints: ["Dutch", "Post-Impressionist", "1853-1890", "Cut off part of his ear", "Painted 'Starry Night'"]
  },
  {
    id: 2,
    name: "Pablo Picasso",
    works: [
      "Guernica - Large gray, black, and white painting depicting war tragedy",
      "The Old Guitarist - Old man in blue playing guitar",
      "Les Demoiselles d'Avignon - Angular women with geometric faces",
      "The Weeping Woman - Distorted portrait of a crying woman with handkerchief",
      "Girl before a Mirror - Colorful, abstract woman looking at her reflection",
      "The Three Musicians - Colorful Cubist figures playing instruments"
    ],
    hints: ["Spanish", "Co-founded Cubism", "1881-1973", "Blue Period", "Created over 20,000 artworks"]
  },
  {
    id: 3,
    name: "Frida Kahlo",
    works: [
      "The Two Fridas - Two versions of the artist connected by hearts and blood vessels",
      "Self-Portrait with Thorn Necklace and Hummingbird - Artist with animals and thorns",
      "The Broken Column - Artist with split torso revealing a broken column",
      "The Dream - Artist sleeping on a canopy bed with skeleton above",
      "Self-Portrait with Cropped Hair - Artist in suit with scissors and cut hair",
      "My Grandparents, My Parents, and I - Family tree with floating figures"
    ],
    hints: ["Mexican", "Known for self-portraits", "1907-1954", "Married Diego Rivera", "Suffered from polio and a bus accident"]
  },
  {
    id: 4,
    name: "Claude Monet",
    works: [
      "Water Lilies - Series of floating flowers on pond surface",
      "Impression, Sunrise - Orange sun over blue harbor with boats",
      "Haystacks - Series showing haystacks at different times of day",
      "Rouen Cathedral - Series of the same cathedral facade in different light",
      "The Japanese Bridge - Green bridge over water lily pond with wisteria",
      "Poplars at Giverny - Row of tall poplar trees along river"
    ],
    hints: ["French", "Founder of Impressionism", "1840-1926", "Created garden at Giverny", "Painted series of the same subject"]
  }
];

const ArtleGame = () => {
  const [currentArtist, setCurrentArtist] = useState<typeof artists[0] | null>(null);
  const [currentWorkIndex, setCurrentWorkIndex] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [usedHints, setUsedHints] = useState<number[]>([]);
  const { toast } = useToast();
  const { addPoints } = useReward();
  
  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);
  
  // Reset game with a new random artist
  const resetGame = () => {
    const randomIndex = Math.floor(Math.random() * artists.length);
    setCurrentArtist(artists[randomIndex]);
    setCurrentWorkIndex(0);
    setGuesses([]);
    setInputValue("");
    setGameStatus("playing");
    setUsedHints([]);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !currentArtist) return;
    
    const cleanGuess = inputValue.trim().toLowerCase();
    const cleanName = currentArtist.name.toLowerCase();
    
    // Add guess to history
    setGuesses([...guesses, inputValue]);
    setInputValue("");
    
    // Check if correct
    if (cleanGuess === cleanName) {
      setGameStatus("won");
      
      // Calculate points based on how many works it took and hints used
      const basePoints = 100;
      const workPenalty = currentWorkIndex * 10;
      const hintPenalty = usedHints.length * 5;
      const pointsEarned = Math.max(basePoints - workPenalty - hintPenalty, 25);
      
      addPoints(pointsEarned);
      
      toast({
        title: "You got it!",
        description: `Correct! You identified "${currentArtist.name}" in ${currentWorkIndex + 1} works.`,
      });
    } else {
      // Show next work if available
      if (currentWorkIndex < currentArtist.works.length - 1) {
        setCurrentWorkIndex(currentWorkIndex + 1);
      } else {
        // Game over - no more works
        setGameStatus("lost");
        toast({
          title: "Game Over",
          description: `The artist was "${currentArtist.name}".`,
          variant: "destructive"
        });
      }
    }
  };
  
  // Use a hint
  const useHint = (hintIndex: number) => {
    if (currentArtist && !usedHints.includes(hintIndex)) {
      setUsedHints([...usedHints, hintIndex]);
      toast({
        title: "Hint Used",
        description: currentArtist.hints[hintIndex],
      });
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Artle</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={18} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Work {currentWorkIndex + 1}/{currentArtist?.works.length || 6}
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
      
      {currentArtist && (
        <div className="mb-6">
          <motion.div 
            key={currentWorkIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-200 aspect-square rounded-md flex items-center justify-center p-4 text-center"
          >
            <p className="font-medium text-gray-700">Work {currentWorkIndex + 1}: {currentArtist.works[currentWorkIndex]}</p>
          </motion.div>
          
          {gameStatus === "playing" && (
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex gap-2">
                <Input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter artist name..."
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
      
      {/* Hints */}
      {gameStatus === "playing" && currentArtist && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Need a hint?</h3>
          <div className="flex flex-wrap gap-2">
            {currentArtist.hints.map((hint, index) => (
              <Badge 
                key={index} 
                variant={usedHints.includes(index) ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => useHint(index)}
              >
                Hint {index + 1} {usedHints.includes(index) ? "✓" : ""}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            (Each hint reduces potential points by 5)
          </div>
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
          <h3 className="font-bold text-lg">
            {gameStatus === "won" ? "Correct!" : "Game Over"}
          </h3>
          <p className="mb-2">
            The artist was <span className="font-semibold">{currentArtist?.name}</span>
          </p>
          {gameStatus === "won" && (
            <p className="mb-2 text-sm">
              You identified the artist in {currentWorkIndex + 1} {currentWorkIndex === 0 ? 'work' : 'works'}!
            </p>
          )}
          <Button onClick={resetGame}>Play Again</Button>
        </motion.div>
      )}
      
      {/* Help drawer */}
      <Drawer open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>How to Play Artle</DrawerTitle>
            <DrawerDescription>Guess the artist from their works</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-medium">Rules:</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                <li>You'll be shown descriptions of famous artworks, one at a time</li>
                <li>Try to guess the artist from as few works as possible</li>
                <li>You get up to 6 works to guess correctly</li>
                <li>If you need help, you can use hints, but they reduce your score</li>
              </ul>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-md">
              <h3 className="font-medium mb-1">Scoring:</h3>
              <p className="text-sm">The earlier you guess correctly, the more points you earn:</p>
              <ul className="list-disc pl-5 text-sm mt-1">
                <li>First work: 100 points</li>
                <li>Each additional work: -10 points</li>
                <li>Each hint used: -5 points</li>
                <li>Minimum score: 25 points</li>
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

export default ArtleGame;
