
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTask } from "@/contexts/TaskContext";

const Analytics = () => {
  const { tasks, getTasks } = useTask();
  const completedTasks = getTasks({ completed: true });
  const pendingTasks = getTasks({ completed: false });
  
  // Calculate statistics
  const totalTasks = tasks.length;
  const completionRate = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  // Category distribution data
  const categories = ['school', 'exam', 'homework', 'project', 'reading', 'other'];
  const categoryData = categories.map(category => {
    const tasksInCategory = tasks.filter(task => task.category === category);
    const completedInCategory = tasksInCategory.filter(task => task.completed);
    
    return {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      total: tasksInCategory.length,
      completed: completedInCategory.length,
    };
  }).filter(item => item.total > 0);
  
  // Priority distribution data
  const priorityData = [
    { name: 'High', value: tasks.filter(task => task.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(task => task.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(task => task.priority === 'low').length },
  ].filter(item => item.value > 0);
  
  const PRIORITY_COLORS = ['#ef4444', '#f59e0b', '#3b82f6'];
  
  // Calculate time management
  const onTimeTasks = completedTasks.filter(task => {
    const completedTime = new Date(); // In a real app, we'd store completion time
    return completedTime <= task.dueDate;
  }).length;
  
  const lateTasks = completedTasks.length - onTimeTasks;
  
  const timeManagementData = [
    { name: 'On Time', value: onTimeTasks },
    { name: 'Late', value: lateTasks },
  ];
  
  const TIME_COLORS = ['#22c55e', '#ef4444'];
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold">Academic Analytics</h1>
          <p className="text-gray-500">Track your academic progress and performance</p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Tasks" 
            value={totalTasks.toString()} 
            description="Tasks created"
            color="bg-blue-500" 
          />
          <StatCard 
            title="Completion Rate" 
            value={`${completionRate}%`} 
            description="Tasks completed"
            color="bg-green-500" 
          />
          <StatCard 
            title="On Time" 
            value={onTimeTasks.toString()} 
            description="Tasks completed on time"
            color="bg-purple-500" 
          />
          <StatCard 
            title="Pending" 
            value={pendingTasks.length.toString()} 
            description="Tasks to be completed"
            color="bg-amber-500" 
          />
        </div>
        
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="categories">Subject Performance</TabsTrigger>
            <TabsTrigger value="priorities">Priority Distribution</TabsTrigger>
            <TabsTrigger value="time">Time Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" name="Total Tasks" fill="#9C89B8" />
                      <Bar dataKey="completed" name="Completed" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="priorities">
            <Card>
              <CardHeader>
                <CardTitle>Task Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="time">
            <Card>
              <CardHeader>
                <CardTitle>Time Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeManagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {timeManagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={TIME_COLORS[index % TIME_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    {onTimeTasks > lateTasks ? (
                      "Great job with your time management! Most of your tasks are completed on time."
                    ) : (
                      "Try to improve your time management. Many tasks are completed late."
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InsightItem 
                title="Time Management" 
                rating={calculateRating(onTimeTasks, completedTasks.length, 0.7)}
                suggestion="Try setting earlier personal deadlines to improve on-time completion."
              />
              <InsightItem 
                title="Task Completion" 
                rating={calculateRating(completedTasks.length, totalTasks, 0.6)}
                suggestion="Focus on breaking down larger tasks into smaller, manageable chunks."
              />
              <InsightItem 
                title="Priority Focus" 
                rating={calculateRating(
                  completedTasks.filter(t => t.priority === 'high').length,
                  tasks.filter(t => t.priority === 'high').length,
                  0.8
                )}
                suggestion="Make sure to tackle high-priority tasks first before moving to lower priorities."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

// Helper function to calculate ratings based on completion ratios
function calculateRating(completed: number, total: number, threshold: number): number {
  if (total === 0) return 3;
  const ratio = completed / total;
  if (ratio >= threshold) return 5;
  if (ratio >= threshold - 0.2) return 4;
  if (ratio >= threshold - 0.4) return 3;
  if (ratio >= threshold - 0.6) return 2;
  return 1;
}

// Stat Card Component
const StatCard = ({ title, value, description, color }: { 
  title: string; 
  value: string; 
  description: string; 
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="garden-card overflow-hidden"
  >
    <div className={`h-2 ${color} w-full -mt-5 mb-3`}></div>
    <h3 className="text-lg font-medium text-gray-700">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </motion.div>
);

// Insight Item Component
const InsightItem = ({ title, rating, suggestion }: {
  title: string;
  rating: number;
  suggestion: string;
}) => {
  const stars = Array(5).fill(0).map((_, i) => i < rating);
  
  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{title}</h4>
        <div className="flex">
          {stars.map((filled, i) => (
            <svg 
              key={i}
              className={`w-5 h-5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-1">{suggestion}</p>
    </div>
  );
};

export default Analytics;
