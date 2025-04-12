
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TaskProvider } from "./contexts/TaskContext";
import { RewardProvider } from "./contexts/RewardContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Import Pages
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import Rewards from "./pages/Rewards";
import Destress from "./pages/Destress";
import Chat from "./pages/Chat";
import MiniGames from "./pages/MiniGames";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Import Game Pages
import MemoryMatch from "./pages/games/MemoryMatch";
import HocusFocus from "./pages/games/HocusFocus";
import Wordle from "./pages/games/Wordle";
import Crosswordle from "./pages/games/Crosswordle";
import Framed from "./pages/games/Framed";
import Artle from "./pages/games/Artle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <RewardProvider>
          <TaskProvider>
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
                <Route path="/profile" element={<Profile />} />
                
                {/* Game Routes */}
                <Route path="/games/memory-match" element={<MemoryMatch />} />
                <Route path="/games/hocus-focus" element={<HocusFocus />} />
                <Route path="/games/wordle" element={<Wordle />} />
                <Route path="/games/crosswordle" element={<Crosswordle />} />
                <Route path="/games/framed" element={<Framed />} />
                <Route path="/games/artle" element={<Artle />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TaskProvider>
        </RewardProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
