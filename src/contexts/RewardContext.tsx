
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'academic' | 'fun' | 'self-care' | 'other';
  redeemed: boolean;
}

interface RewardContextType {
  rewards: Reward[];
  pointBalance: number;
  addReward: (reward: Omit<Reward, 'id' | 'redeemed'>) => void;
  redeemReward: (id: string) => boolean;
  addPoints: (points: number) => void;
  getPointHistory: () => { date: Date; amount: number; reason: string }[];
}

type PointTransaction = {
  date: Date;
  amount: number;
  reason: string;
};

const RewardContext = createContext<RewardContextType | undefined>(undefined);

// Sample initial rewards
const initialRewards: Reward[] = [
  {
    id: '1',
    title: '30 minutes of extra screen time',
    description: 'Redeem for 30 minutes of screen time beyond your usual limit',
    cost: 50,
    category: 'fun',
    redeemed: false
  },
  {
    id: '2',
    title: 'Special snack',
    description: 'Redeem for a special snack of your choice',
    cost: 75,
    category: 'self-care',
    redeemed: false
  },
  {
    id: '3',
    title: 'Study break',
    description: 'Take a 15-minute break during study time without affecting your schedule',
    cost: 30,
    category: 'academic',
    redeemed: false
  }
];

export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [pointBalance, setPointBalance] = useState<number>(120);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([
    { date: new Date(Date.now() - 86400000 * 2), amount: 30, reason: 'Completed Math Homework' },
    { date: new Date(Date.now() - 86400000), amount: 50, reason: 'Completed Science Project' },
    { date: new Date(), amount: 40, reason: 'Finished Reading Assignment' }
  ]);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedRewards = localStorage.getItem('rewards');
    const savedPoints = localStorage.getItem('pointBalance');
    const savedHistory = localStorage.getItem('pointHistory');

    if (savedRewards) {
      try {
        setRewards(JSON.parse(savedRewards));
      } catch (e) {
        console.error('Failed to parse rewards', e);
      }
    }

    if (savedPoints) {
      try {
        setPointBalance(JSON.parse(savedPoints));
      } catch (e) {
        console.error('Failed to parse point balance', e);
      }
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string dates back to Date objects
        const historyWithDates = parsedHistory.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
        setPointHistory(historyWithDates);
      } catch (e) {
        console.error('Failed to parse point history', e);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('pointBalance', JSON.stringify(pointBalance));
  }, [pointBalance]);

  useEffect(() => {
    localStorage.setItem('pointHistory', JSON.stringify(pointHistory));
  }, [pointHistory]);

  const addReward = (reward: Omit<Reward, 'id' | 'redeemed'>) => {
    const newReward = {
      ...reward,
      id: Math.random().toString(36).substr(2, 9),
      redeemed: false
    };
    setRewards([...rewards, newReward]);
    toast({
      title: "Reward Added",
      description: `"${reward.title}" has been added to your rewards.`,
    });
  };

  const redeemReward = (id: string): boolean => {
    const reward = rewards.find(r => r.id === id);
    
    if (!reward || reward.redeemed) return false;
    if (pointBalance < reward.cost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.cost - pointBalance} more points to redeem this reward.`,
        variant: "destructive"
      });
      return false;
    }

    setPointBalance(prev => prev - reward.cost);
    setRewards(rewards.map(r => r.id === id ? { ...r, redeemed: true } : r));
    
    setPointHistory([
      ...pointHistory,
      {
        date: new Date(),
        amount: -reward.cost,
        reason: `Redeemed: ${reward.title}`
      }
    ]);

    toast({
      title: "Reward Redeemed",
      description: `You have successfully redeemed "${reward.title}"!`,
    });
    
    return true;
  };

  const addPoints = (points: number, reason: string = "Completed task") => {
    setPointBalance(prev => prev + points);
    
    setPointHistory([
      ...pointHistory,
      {
        date: new Date(),
        amount: points,
        reason
      }
    ]);
  };

  const getPointHistory = () => {
    return pointHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  return (
    <RewardContext.Provider
      value={{
        rewards,
        pointBalance,
        addReward,
        redeemReward,
        addPoints,
        getPointHistory
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
