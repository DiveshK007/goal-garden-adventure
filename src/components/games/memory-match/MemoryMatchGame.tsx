
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useReward } from "@/contexts/RewardContext";

interface MemoryCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryMatchGame = () => {
  const emojis = ["🌈", "🌞", "🌵", "🌸", "🍉", "🦋", "🐬", "🦄"];
  const { toast } = useToast();
  const { addPoints } = useReward();
  
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  
  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);
  
  // Handle flipped cards
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      
      if (cards[first].emoji === cards[second].emoji) {
        // Match found
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
        // No match, flip back after delay
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
  
  // Check for game completion
  useEffect(() => {
    if (matchedPairs === emojis.length && matchedPairs > 0 && !gameCompleted) {
      setGameCompleted(true);
      const pointsEarned = Math.max(100 - (moves * 5), 25); // More moves = fewer points, minimum 25
      
      toast({
        title: "Memory Game Completed!",
        description: `You found all pairs in ${moves} moves.`,
      });
      
      // Fix here: Only pass one argument to addPoints
      addPoints(pointsEarned);
      
      toast({
        title: "Points Earned!",
        description: `You earned ${pointsEarned} points.`,
      });
    }
  }, [matchedPairs, moves, emojis.length, gameCompleted, toast, addPoints]);
  
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
  
  const resetGame = () => {
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
    setGameCompleted(false);
  };
  
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Memory Match</h1>
        <p className="text-gray-500">Match all pairs of cards to win!</p>
      </div>
      
      <div className="flex justify-between items-center w-full mb-6">
        <Badge variant="outline" className="px-3 py-1">
          Moves: {moves}
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Pairs: {matchedPairs}/{emojis.length}
        </Badge>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetGame}
          className="flex items-center gap-1"
        >
          <RefreshCw size={14} /> Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-3 w-full">
        {cards.map(card => (
          <motion.div
            key={card.id}
            className={`aspect-square rounded-lg cursor-pointer flex items-center justify-center text-3xl ${
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
      
      {gameCompleted && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 p-4 border-2 border-garden-green rounded-lg bg-garden-green bg-opacity-10 text-center"
        >
          <Trophy className="w-10 h-10 text-garden-green mx-auto mb-2" />
          <h2 className="text-xl font-bold">Congratulations!</h2>
          <p>You completed the game in {moves} moves.</p>
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

export default MemoryMatchGame;
