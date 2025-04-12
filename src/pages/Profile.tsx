
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Award, BarChart, Settings, Edit, CircleUser } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTask } from "@/contexts/TaskContext";
import { useReward } from "@/contexts/RewardContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const Profile = () => {
  const { tasks } = useTask();
  const { points } = useReward();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("Alex Johnson");
  const [bio, setBio] = useState("Student at Stanford University");
  
  // Calculate task stats
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate level based on points
  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };
  
  const level = calculateLevel(points);
  const nextLevelPoints = level * 100;
  const levelProgress = (points % 100);
  
  // Mock achievements
  const achievements = [
    { id: 1, name: "Early Bird", description: "Complete 5 tasks before 9 AM", unlocked: true, icon: "🌅" },
    { id: 2, name: "Streak Master", description: "Complete tasks for 7 days in a row", unlocked: true, icon: "🔥" },
    { id: 3, name: "Focus Guru", description: "Use the Destress section 10 times", unlocked: true, icon: "🧘" },
    { id: 4, name: "Game Champion", description: "Score 1000 points in mini games", unlocked: false, icon: "🎮" },
    { id: 5, name: "Task Warrior", description: "Complete 50 high-priority tasks", unlocked: false, icon: "⚔️" },
    { id: 6, name: "Productivity Ninja", description: "Complete 100 tasks total", unlocked: false, icon: "🥷" },
  ];
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
            <User className="text-garden-purple" /> My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage your personal information and progress
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-3">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-garden-green to-garden-purple flex items-center justify-center text-white mb-3 relative">
                    <CircleUser size={80} />
                    {!isEditing && (
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="absolute bottom-0 right-0"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <Badge className="mb-2 px-3 py-1 bg-garden-purple">Level {level}</Badge>
                    <div className="w-full max-w-[150px]">
                      <Progress value={levelProgress} className="h-2" />
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{points} pts</span>
                        <span>{nextLevelPoints} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">Display Name</Label>
                        <Input 
                          id="username" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Input 
                          id="bio" 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold mb-1 dark:text-white">{username}</h2>
                      <p className="text-gray-500 dark:text-gray-400 mb-3">{bio}</p>
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-3 bg-garden-light rounded-md dark:bg-gray-800">
                          <h3 className="text-2xl font-bold text-garden-purple">{completedTasks}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Completed Tasks</p>
                        </div>
                        <div className="text-center p-3 bg-garden-light rounded-md dark:bg-gray-800">
                          <h3 className="text-2xl font-bold text-garden-green">{pendingTasks}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</p>
                        </div>
                        <div className="text-center p-3 bg-garden-light rounded-md dark:bg-gray-800">
                          <h3 className="text-2xl font-bold text-garden-orange">{completionRate}%</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="achievements" className="mb-6">
          <TabsList className="mb-6 dark:bg-gray-800">
            <TabsTrigger value="achievements" className="flex gap-2 dark:data-[state=active]:bg-gray-700">
              <Award size={16} />
              <span>Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex gap-2 dark:data-[state=active]:bg-gray-700">
              <BarChart size={16} />
              <span>Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-2 dark:data-[state=active]:bg-gray-700">
              <Settings size={16} />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Achievements</CardTitle>
                <CardDescription>
                  Track your progress and unlock new achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-4 border rounded-lg flex items-start gap-3 ${
                        achievement.unlocked 
                          ? "border-garden-green bg-garden-green/5 dark:bg-garden-green/10" 
                          : "border-gray-200 opacity-60 dark:border-gray-700"
                      }`}
                    >
                      <div className="w-10 h-10 bg-garden-light rounded-md flex items-center justify-center text-xl dark:bg-gray-700">
                        {achievement.icon}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium dark:text-white">{achievement.name}</h3>
                          {achievement.unlocked && (
                            <Badge variant="outline" className="ml-2 bg-garden-green/10 text-garden-green border-garden-green">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Statistics</CardTitle>
                <CardDescription>
                  View detailed statistics about your productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2 dark:text-gray-300">Task Completion Rate</h3>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                      <div 
                        className="h-full bg-garden-green"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>0%</span>
                      <span>{completionRate}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                      <h3 className="text-sm font-medium mb-1 dark:text-gray-300">By Priority</h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">High</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {tasks.filter(t => t.priority === 'high' && t.completed).length}/
                              {tasks.filter(t => t.priority === 'high').length}
                            </span>
                          </div>
                          <Progress 
                            value={
                              tasks.filter(t => t.priority === 'high').length > 0
                                ? (tasks.filter(t => t.priority === 'high' && t.completed).length / 
                                  tasks.filter(t => t.priority === 'high').length) * 100
                                : 0
                            } 
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Medium</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {tasks.filter(t => t.priority === 'medium' && t.completed).length}/
                              {tasks.filter(t => t.priority === 'medium').length}
                            </span>
                          </div>
                          <Progress 
                            value={
                              tasks.filter(t => t.priority === 'medium').length > 0
                                ? (tasks.filter(t => t.priority === 'medium' && t.completed).length / 
                                  tasks.filter(t => t.priority === 'medium').length) * 100
                                : 0
                            } 
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Low</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {tasks.filter(t => t.priority === 'low' && t.completed).length}/
                              {tasks.filter(t => t.priority === 'low').length}
                            </span>
                          </div>
                          <Progress 
                            value={
                              tasks.filter(t => t.priority === 'low').length > 0
                                ? (tasks.filter(t => t.priority === 'low' && t.completed).length / 
                                  tasks.filter(t => t.priority === 'low').length) * 100
                                : 0
                            } 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                      <h3 className="text-sm font-medium mb-1 dark:text-gray-300">By Category</h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">School</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {tasks.filter(t => t.category === 'school' && t.completed).length}/
                              {tasks.filter(t => t.category === 'school').length}
                            </span>
                          </div>
                          <Progress 
                            value={
                              tasks.filter(t => t.category === 'school').length > 0
                                ? (tasks.filter(t => t.category === 'school' && t.completed).length / 
                                  tasks.filter(t => t.category === 'school').length) * 100
                                : 0
                            } 
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Homework</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {tasks.filter(t => t.category === 'homework' && t.completed).length}/
                              {tasks.filter(t => t.category === 'homework').length}
                            </span>
                          </div>
                          <Progress 
                            value={
                              tasks.filter(t => t.category === 'homework').length > 0
                                ? (tasks.filter(t => t.category === 'homework' && t.completed).length / 
                                  tasks.filter(t => t.category === 'homework').length) * 100
                                : 0
                            } 
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Project</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {tasks.filter(t => t.category === 'project' && t.completed).length}/
                              {tasks.filter(t => t.category === 'project').length}
                            </span>
                          </div>
                          <Progress 
                            value={
                              tasks.filter(t => t.category === 'project').length > 0
                                ? (tasks.filter(t => t.category === 'project' && t.completed).length / 
                                  tasks.filter(t => t.category === 'project').length) * 100
                                : 0
                            } 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                      <h3 className="text-sm font-medium mb-1 dark:text-gray-300">Points Earned</h3>
                      <div className="mt-3">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold mr-2 text-garden-purple dark:text-garden-purple">
                            {points}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">total points</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                          Earn more points by completing tasks and using the app's features
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Configure your account and app settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-base font-medium mb-4 dark:text-white">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Switch between light and dark theme
                        </p>
                      </div>
                      <Switch 
                        id="dark-mode" 
                        checked={theme === 'dark'} 
                        onCheckedChange={toggleTheme} 
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium mb-4 dark:text-white">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="task-reminders">Task Reminders</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications for upcoming tasks
                        </p>
                      </div>
                      <Switch id="task-reminders" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications when you unlock achievements
                        </p>
                      </div>
                      <Switch id="achievement-alerts" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
