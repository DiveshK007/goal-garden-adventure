
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface RewardContextType {
  points: number;
  addPoints: (amount: number) => void;
  subtractPoints: (amount: number) => void;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<number>(0);
  const { toast } = useToast();

  // Load points from localStorage on mount
  useEffect(() => {
    const savedPoints = localStorage.getItem('userPoints');
    if (savedPoints) {
      try {
        setPoints(JSON.parse(savedPoints));
      } catch (e) {
        console.error('Failed to parse points from localStorage', e);
        setPoints(0);
      }
    } else {
      // Set initial points for demo
      setPoints(120);
    }
  }, []);

  // Save points to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPoints', JSON.stringify(points));
  }, [points]);

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
    toast({
      title: "Points Added",
      description: `You earned ${amount} points!`,
    });
  };

  const subtractPoints = (amount: number) => {
    setPoints(prev => {
      if (prev < amount) {
        toast({
          title: "Not Enough Points",
          description: `You need ${amount} points but only have ${prev}.`,
          variant: "destructive",
        });
        return prev;
      }
      
      toast({
        title: "Points Spent",
        description: `You spent ${amount} points.`,
      });
      
      return prev - amount;
    });
  };

  return (
    <RewardContext.Provider
      value={{
        points,
        addPoints,
        subtractPoints,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};

export const useReward = () => {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error('useReward must be used within a RewardProvider');
  }
  return context;
};
