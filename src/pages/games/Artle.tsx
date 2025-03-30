
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import ArtleGame from "@/components/games/artle/ArtleGame";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ArtlePage = () => {
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
        
        <ArtleGame />
      </div>
    </MainLayout>
  );
};

export default ArtlePage;
