
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TaskProvider } from "./contexts/TaskContext";
import { RewardProvider } from "./contexts/RewardContext";

// Import Pages
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import Rewards from "./pages/Rewards";
import Destress from "./pages/Destress";
import Chat from "./pages/Chat";
import MiniGames from "./pages/MiniGames";
import NotFound from "./pages/NotFound";

// Import Game Pages
import MemoryMatch from "./pages/games/MemoryMatch";
import HocusFocus from "./pages/games/HocusFocus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TaskProvider>
        <RewardProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/destress" element={<Destress />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/minigames" element={<MiniGames />} />
              
              {/* Game Routes */}
              <Route path="/games/memory-match" element={<MemoryMatch />} />
              <Route path="/games/hocus-focus" element={<HocusFocus />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RewardProvider>
      </TaskProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
