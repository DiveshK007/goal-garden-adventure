
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Check, X, Trophy, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Word list for the game
const WORDS = [
  "REACT", "STATE", "HOOKS", "PROPS", "REDUX",
  "STYLE", "LOGIC", "BUILD", "FOCUS", "TYPES",
  "LEARN", "CHART", "CLASS", "MODAL", "THEME"
];

// Game status types
type GameStatus = "playing" | "won" | "lost";

const WordleGame = () => {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { toast } = useToast();
  const { addPoints } = useReward();
  const maxGuesses = 6;
  
  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return;
      
      const key = e.key.toUpperCase();
      
      if (key === "ENTER" && currentGuess.length === 5) {
        submitGuess();
      } else if (key === "BACKSPACE") {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameStatus]);
  
  const resetGame = () => {
    // Choose a random word from the list
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
  };
  
  const submitGuess = () => {
    if (currentGuess.length !== 5) return;
    
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    
    // Check if win
    if (currentGuess === targetWord) {
      setGameStatus("won");
      const pointsEarned = Math.max(100 - (guesses.length * 10), 50);
      
      addPoints(pointsEarned);
      
      toast({
        title: "You won!",
        description: `You guessed the word in ${newGuesses.length} ${newGuesses.length === 1 ? 'try' : 'tries'}.`,
      });
    } 
    // Check if loss
    else if (newGuesses.length >= maxGuesses) {
      setGameStatus("lost");
      toast({
        title: "Game Over",
        description: `The word was ${targetWord}.`,
        variant: "destructive"
      });
    }
    
    setCurrentGuess("");
  };
  
  const getLetterStatus = (letter: string, index: number, guess: string) => {
    if (letter === targetWord[index]) {
      return "correct"; // Letter is in the correct position
    } else if (targetWord.includes(letter)) {
      return "present"; // Letter is in the word but wrong position
    } else {
      return "absent"; // Letter is not in the word
    }
  };
  
  // Virtual keyboard handling
  const handleVirtualKeyPress = (key: string) => {
    if (gameStatus !== "playing") return;
    
    if (key === "ENTER") {
      if (currentGuess.length === 5) submitGuess();
    } else if (key === "BACKSPACE") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };
  
  // Create keyboard rows
  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
  ];
  
  // Get key status for coloring
  const getKeyStatus = (key: string) => {
    // Don't apply styles to control keys
    if (key === "ENTER" || key === "BACKSPACE") return "default";
    
    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i];
      for (let j = 0; j < guess.length; j++) {
        if (guess[j] === key) {
          if (key === targetWord[j]) return "correct";
          if (targetWord.includes(key)) return "present";
        }
      }
    }
    
    // Check if this key exists in any guess
    const keyExists = guesses.some(guess => guess.includes(key));
    
    if (keyExists) return "absent";
    return "default";
  };
  
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Wordle</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={18} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Guesses: {guesses.length}/{maxGuesses}</Badge>
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
      
      {/* Game grid */}
      <div className="mb-6 grid grid-rows-6 gap-1">
        {Array.from({ length: maxGuesses }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-1">
            {Array.from({ length: 5 }).map((_, colIndex) => {
              const guessedLetter = guesses[rowIndex]?.[colIndex] || "";
              const isCurrentRow = rowIndex === guesses.length;
              const currentLetter = isCurrentRow ? currentGuess[colIndex] || "" : guessedLetter;
              
              let status = "empty";
              if (guessedLetter) {
                status = getLetterStatus(guessedLetter, colIndex, guesses[rowIndex]);
              }
              
              return (
                <div 
                  key={colIndex}
                  className={`flex items-center justify-center w-full aspect-square border-2 text-lg font-bold ${
                    isCurrentRow && currentLetter ? 'border-garden-green' : 'border-gray-300'
                  } ${
                    status === 'correct' ? 'bg-green-500 text-white border-green-500' :
                    status === 'present' ? 'bg-yellow-500 text-white border-yellow-500' :
                    status === 'absent' ? 'bg-gray-500 text-white border-gray-500' : ''
                  }`}
                >
                  {currentLetter}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Virtual keyboard */}
      <div className="mb-4">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-1 gap-1">
            {row.map((key) => {
              const keyStatus = getKeyStatus(key);
              const isControlKey = key === "ENTER" || key === "BACKSPACE";
              
              return (
                <button
                  key={key}
                  onClick={() => handleVirtualKeyPress(key)}
                  className={`rounded py-2 ${isControlKey ? 'px-3' : 'w-8'} text-sm font-medium ${
                    keyStatus === 'correct' ? 'bg-green-500 text-white' :
                    keyStatus === 'present' ? 'bg-yellow-500 text-white' :
                    keyStatus === 'absent' ? 'bg-gray-500 text-white' :
                    'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {key === "BACKSPACE" ? "⌫" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      
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
            {gameStatus === "won" ? (
              <Trophy size={24} className="text-green-500" />
            ) : (
              <AlertCircle size={24} className="text-red-500" />
            )}
          </div>
          <h3 className="font-bold text-lg">
            {gameStatus === "won" ? "Congratulations!" : "Game Over"}
          </h3>
          <p className="mb-2">
            {gameStatus === "won" 
              ? `You solved it in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!` 
              : `The word was ${targetWord}`
            }
          </p>
          <Button onClick={resetGame}>Play Again</Button>
        </motion.div>
      )}
      
      {/* Help drawer */}
      <Drawer open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>How to Play Wordle</DrawerTitle>
            <DrawerDescription>Guess the 5-letter word in 6 tries</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-medium">Rules:</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                <li>Each guess must be a valid 5-letter word</li>
                <li>The color of the tiles will change to show how close your guess was</li>
                <li>Green: The letter is correct and in the right spot</li>
                <li>Yellow: The letter is in the word but in the wrong spot</li>
                <li>Gray: The letter is not in the word</li>
              </ul>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-green-500 text-white font-bold">R</div>
              <span>R is in the word and in the correct position</span>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-yellow-500 text-white font-bold">E</div>
              <span>E is in the word but in the wrong position</span>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-500 text-white font-bold">W</div>
              <span>W is not in the word</span>
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

export default WordleGame;
