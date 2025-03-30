
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import WordleGame from "@/components/games/wordle/WordleGame";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const WordlePage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link to="/minigames">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Games
            </Button>
          </Link>
        </div>
        
        <WordleGame />
      </div>
    </MainLayout>
  );
};

export default WordlePage;
