
import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Gift, Plus, Check, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import MainLayout from "@/components/layout/MainLayout";
import { useReward } from "@/contexts/RewardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }).max(50),
  description: z.string().max(200, {
    message: "Description must be less than 200 characters.",
  }).optional(),
  cost: z.number().int().min(10).max(500),
  category: z.enum(["academic", "fun", "self-care", "other"] as const),
});

const Rewards = () => {
  const { rewards, pointBalance, redeemReward, addReward, getPointHistory } = useReward();
  const [selectedTab, setSelectedTab] = useState("available");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pointHistory = getPointHistory();
  
  // Filter rewards based on selected tab
  const availableRewards = rewards.filter(reward => !reward.redeemed);
  const redeemedRewards = rewards.filter(reward => reward.redeemed);
  
  // Form for adding new rewards
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      cost: 50,
      category: "fun",
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    addReward({
      title: values.title,
      description: values.description || "",
      cost: values.cost,
      category: values.category,
    });
    
    form.reset();
    setIsDialogOpen(false);
  }
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rewards Garden</h1>
            <p className="text-gray-500">Earn points for completing tasks and redeem rewards</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-garden-green bg-opacity-10 rounded-full">
              <Award className="text-garden-green" size={20} />
              <span className="font-semibold">{pointBalance} points</span>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} /> Add Reward
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Reward</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter reward title..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter reward details..." 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost (Points)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={10}
                                max={500}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                                value={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="academic">Academic</SelectItem>
                                <SelectItem value="fun">Fun</SelectItem>
                                <SelectItem value="self-care">Self-care</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Reward</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="md:col-span-2"
          >
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="available">Available Rewards</TabsTrigger>
                <TabsTrigger value="redeemed">Redeemed Rewards</TabsTrigger>
              </TabsList>
              
              <TabsContent value="available">
                {availableRewards.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {availableRewards.map((reward) => (
                      <RewardCard 
                        key={reward.id} 
                        reward={reward} 
                        canAfford={pointBalance >= reward.cost}
                        onRedeem={() => redeemReward(reward.id)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <Gift size={40} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No available rewards yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Create your first reward
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="redeemed">
                {redeemedRewards.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {redeemedRewards.map((reward) => (
                      <RewardCard 
                        key={reward.id} 
                        reward={reward} 
                        redeemed 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <Gift size={40} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">You haven't redeemed any rewards yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSelectedTab("available")}
                    >
                      Browse available rewards
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={18} className="text-garden-orange" />
                  Points History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {pointHistory.map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">
                          {transaction.reason}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={cn(
                        "font-medium",
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                      </div>
                    </div>
                  ))}
                  
                  {pointHistory.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No points history yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

// Reward Card component
interface RewardCardProps {
  reward: {
    id: string;
    title: string;
    description: string;
    cost: number;
    category: string;
  };
  redeemed?: boolean;
  canAfford?: boolean;
  onRedeem?: () => void;
}

const RewardCard = ({ reward, redeemed, canAfford, onRedeem }: RewardCardProps) => {
  return (
    <Card className={cn(
      "transition-all border-2",
      redeemed 
        ? "border-gray-200 opacity-70" 
        : canAfford 
          ? "border-garden-green hover:shadow-md" 
          : "border-gray-200 opacity-80"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{reward.title}</CardTitle>
          <div className="flex items-center gap-1 bg-garden-light px-2 py-1 rounded-full">
            <Award size={14} className="text-garden-purple" />
            <span className="text-sm font-medium">{reward.cost}</span>
          </div>
        </div>
        <CardDescription>
          {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{reward.description}</p>
      </CardContent>
      <CardFooter>
        {redeemed ? (
          <Button variant="outline" className="w-full" disabled>
            <Check size={16} className="mr-2" /> Redeemed
          </Button>
        ) : (
          <Button 
            className="w-full"
            disabled={!canAfford}
            onClick={onRedeem}
            variant={canAfford ? "default" : "outline"}
          >
            {canAfford ? "Redeem Reward" : `Need ${reward.cost} points`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Rewards;
