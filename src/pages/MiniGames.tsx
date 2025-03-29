
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Gamepad } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useReward } from "@/contexts/RewardContext";
import { useToast } from "@/components/ui/use-toast";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  implemented: boolean;
  imageUrl?: string;
}

const MiniGames = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { addPoints } = useReward();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const games: Game[] = [
    {
      id: "hocus-focus",
      title: "Hocus Focus",
      description: "Find hidden differences in pictures",
      icon: <Search className="h-6 w-6" />,
      path: "/games/hocus-focus",
      implemented: true
    },
    {
      id: "memory-match",
      title: "Memory Match",
      description: "Test your memory with this card matching game",
      icon: <span className="text-xl">🃏</span>,
      path: "/games/memory-match",
      implemented: true
    },
    {
      id: "wordle",
      title: "Wordle",
      description: "The hit 5-letter guessing game",
      icon: <span className="text-xl font-bold">W</span>,
      path: "/games/wordle",
      implemented: false
    },
    {
      id: "crosswordle",
      title: "Crosswordle",
      description: "Fill in a word Wordle game",
      icon: <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-5 h-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-black"></div>
        ))}
      </div>,
      path: "/games/crosswordle",
      implemented: false
    },
    {
      id: "framed",
      title: "Framed",
      description: "Guess a movie from still shots",
      icon: <span className="text-xl">🎬</span>,
      path: "/games/framed",
      implemented: false
    },
    {
      id: "artle",
      title: "Artle",
      description: "Guess a artist by their work",
      icon: <span className="text-xl">🎨</span>,
      path: "/games/artle",
      implemented: false
    },
    {
      id: "geoguessr",
      title: "Geoguessr",
      description: "Explore the world",
      icon: <span className="text-xl">🌍</span>,
      path: "/games/geoguessr",
      implemented: false
    },
    {
      id: "google-feud",
      title: "Google Feud",
      description: "Guess the top auto-completes",
      icon: <span className="text-xl">G</span>,
      path: "/games/google-feud",
      implemented: false
    },
  ];

  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayGame = (game: Game) => {
    if (game.implemented) {
      // Navigate to the game
      navigate(game.path);
      
      // Award points for starting a game
      addPoints(5, `Started playing ${game.title}`);
    } else {
      // Show a toast message for unimplemented games
      toast({
        title: "Coming Soon",
        description: `${game.title} is not yet available. Check back later!`,
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gamepad className="text-garden-purple" /> Mini Games
          </h1>
          <p className="text-gray-500">
            Take a break and enjoy these brain games to refresh your mind
          </p>
        </motion.div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Editor's Picks</CardTitle>
            <CardDescription>
              Popular games to challenge your mind and have fun
            </CardDescription>
            <div className="mt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search games..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3 ${
                    game.implemented ? "" : "opacity-70"
                  }`}
                  onClick={() => handlePlayGame(game)}
                >
                  <div className="w-10 h-10 bg-garden-light rounded-md flex items-center justify-center">
                    {game.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{game.title}</h3>
                    <p className="text-sm text-gray-500">{game.description}</p>
                  </div>
                  {!game.implemented && (
                    <div className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                      Soon
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline">
              View All Games
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brain Benefits</CardTitle>
            <CardDescription>
              Playing these games provides cognitive benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-garden-light rounded-lg">
                <h3 className="font-medium mb-2">Improved Focus</h3>
                <p className="text-sm text-gray-600">
                  Games that require concentration help train your brain to maintain focus for longer periods.
                </p>
              </div>
              
              <div className="p-4 bg-garden-light rounded-lg">
                <h3 className="font-medium mb-2">Enhanced Memory</h3>
                <p className="text-sm text-gray-600">
                  Memory games strengthen neural connections and improve recall abilities.
                </p>
              </div>
              
              <div className="p-4 bg-garden-light rounded-lg">
                <h3 className="font-medium mb-2">Problem Solving</h3>
                <p className="text-sm text-gray-600">
                  Puzzles and strategy games develop critical thinking and problem-solving skills.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MiniGames;
