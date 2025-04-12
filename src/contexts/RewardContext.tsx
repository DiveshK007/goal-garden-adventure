
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Define the structure for a reward
interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: string;
  redeemed?: boolean;
}

// Define the structure for a point transaction
interface PointTransaction {
  amount: number;
  date: string;
  reason: string;
}

interface RewardContextType {
  points: number;
  rewards: Reward[];
  pointBalance: number;
  addPoints: (amount: number, reason?: string) => void;
  subtractPoints: (amount: number, reason?: string) => void;
  redeemReward: (rewardId: string) => void;
  addReward: (reward: Omit<Reward, 'id' | 'redeemed'>) => void;
  getPointHistory: () => PointTransaction[];
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    // Load points
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

    // Load rewards
    const savedRewards = localStorage.getItem('userRewards');
    if (savedRewards) {
      try {
        setRewards(JSON.parse(savedRewards));
      } catch (e) {
        console.error('Failed to parse rewards from localStorage', e);
        setRewards([]);
      }
    } else {
      // Set some demo rewards
      setRewards([
        {
          id: '1',
          title: 'Coffee Break',
          description: 'Take a 15-minute coffee break',
          cost: 50,
          category: 'self-care',
          redeemed: false
        },
        {
          id: '2',
          title: 'Movie Night',
          description: 'Enjoy a movie night with snacks',
          cost: 100,
          category: 'fun',
          redeemed: false
        }
      ]);
    }

    // Load point history
    const savedHistory = localStorage.getItem('pointHistory');
    if (savedHistory) {
      try {
        setPointHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse point history from localStorage', e);
        setPointHistory([]);
      }
    }
  }, []);

  // Save points to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPoints', JSON.stringify(points));
  }, [points]);

  // Save rewards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userRewards', JSON.stringify(rewards));
  }, [rewards]);

  // Save point history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pointHistory', JSON.stringify(pointHistory));
  }, [pointHistory]);

  const addPoints = (amount: number, reason = 'Points earned') => {
    setPoints(prev => prev + amount);
    
    // Add to point history
    const transaction: PointTransaction = {
      amount,
      date: new Date().toISOString(),
      reason
    };
    setPointHistory(prev => [transaction, ...prev]);
    
    toast({
      title: "Points Added",
      description: `You earned ${amount} points!`,
    });
  };

  const subtractPoints = (amount: number, reason = 'Points spent') => {
    setPoints(prev => {
      if (prev < amount) {
        toast({
          title: "Not Enough Points",
          description: `You need ${amount} points but only have ${prev}.`,
          variant: "destructive",
        });
        return prev;
      }
      
      // Add to point history
      const transaction: PointTransaction = {
        amount: -amount,
        date: new Date().toISOString(),
        reason
      };
      setPointHistory(prev => [transaction, ...prev]);
      
      toast({
        title: "Points Spent",
        description: `You spent ${amount} points.`,
      });
      
      return prev - amount;
    });
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward) {
      toast({
        title: "Error",
        description: "Reward not found",
        variant: "destructive",
      });
      return;
    }

    if (points < reward.cost) {
      toast({
        title: "Not Enough Points",
        description: `You need ${reward.cost} points but only have ${points}.`,
        variant: "destructive",
      });
      return;
    }

    // Update the reward to redeemed
    setRewards(prev => 
      prev.map(r => 
        r.id === rewardId ? { ...r, redeemed: true } : r
      )
    );

    // Subtract the points
    subtractPoints(reward.cost);

    // Add specific entry to point history
    const transaction: PointTransaction = {
      amount: -reward.cost,
      date: new Date().toISOString(),
      reason: `Redeemed: ${reward.title}`
    };
    setPointHistory(prev => [transaction, ...prev]);

    toast({
      title: "Reward Redeemed",
      description: `You've redeemed: ${reward.title}`,
    });
  };

  const addReward = (rewardData: Omit<Reward, 'id' | 'redeemed'>) => {
    const newReward: Reward = {
      ...rewardData,
      id: Date.now().toString(),
      redeemed: false
    };
    
    setRewards(prev => [...prev, newReward]);
    
    toast({
      title: "New Reward Added",
      description: `You've created a new reward: ${rewardData.title}`,
    });
  };

  const getPointHistory = () => {
    return pointHistory;
  };

  return (
    <RewardContext.Provider
      value={{
        points,
        rewards,
        pointBalance: points, // Alias for points
        addPoints,
        subtractPoints,
        redeemReward,
        addReward,
        getPointHistory,
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
