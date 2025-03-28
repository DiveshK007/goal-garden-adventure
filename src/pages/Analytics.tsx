
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, PieChart, Calendar, Trophy, Code, GraduationCap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import MainLayout from "@/components/layout/MainLayout";
import { useTask } from "@/contexts/TaskContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Sample data for charts
const completionByDay = [
  { name: "Mon", completed: 4, total: 7 },
  { name: "Tue", completed: 3, total: 5 },
  { name: "Wed", completed: 5, total: 6 },
  { name: "Thu", completed: 2, total: 8 },
  { name: "Fri", completed: 6, total: 9 },
  { name: "Sat", completed: 3, total: 4 },
  { name: "Sun", completed: 1, total: 2 },
];

const categoryCompletion = [
  { name: "Homework", completed: 12, total: 15 },
  { name: "Exam", completed: 5, total: 7 },
  { name: "Reading", completed: 8, total: 10 },
  { name: "Project", completed: 3, total: 6 },
  { name: "Other", completed: 4, total: 5 },
];

const studyTimeData = [
  { date: "Week 1", hours: 15 },
  { date: "Week 2", hours: 20 },
  { date: "Week 3", hours: 18 },
  { date: "Week 4", hours: 25 },
  { date: "Week 5", hours: 22 },
  { date: "Week 6", hours: 30 },
];

const gradeData = [
  { subject: "Math", grade: 92 },
  { subject: "Science", grade: 88 },
  { subject: "History", grade: 95 },
  { subject: "English", grade: 90 },
  { subject: "CS", grade: 97 },
];

const leetcodeProgressData = [
  { month: "Jan", easy: 10, medium: 5, hard: 2 },
  { month: "Feb", easy: 15, medium: 8, hard: 3 },
  { month: "Mar", easy: 20, medium: 12, hard: 5 },
  { month: "Apr", easy: 25, medium: 15, hard: 8 },
  { month: "May", easy: 30, medium: 20, hard: 10 },
];

// Simulate CGPA calculation
const calculateCGPA = (grades: number[]) => {
  const sum = grades.reduce((acc, curr) => acc + curr, 0);
  return (sum / grades.length / 10).toFixed(1);
};

const Analytics = () => {
  const { tasks } = useTask();
  const [activeTab, setActiveTab] = useState("productivity");
  
  // Calculate total tasks and completion rate
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionRate = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  
  // Calculate CGPA
  const cgpa = calculateCGPA(gradeData.map(item => item.grade));
  
  // Count leetcode problems
  const leetcodeSolved = leetcodeProgressData.reduce(
    (acc, curr) => acc + curr.easy + curr.medium + curr.hard, 
    0
  );

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="text-garden-purple" /> Analytics Dashboard
          </h1>
          <p className="text-gray-500">
            Track your progress, productivity, and academic performance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-garden-green" />
                Task Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {completedTasks}/{totalTasks}
              </div>
              <Progress
                value={completionRate}
                className="h-2 mt-2 mb-1"
              />
              <p className="text-sm text-gray-500">
                {completionRate.toFixed(0)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-garden-purple" />
                CGPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{cgpa}</div>
              <Progress
                value={Number(cgpa) * 10}
                className="h-2 mt-2 mb-1"
              />
              <p className="text-sm text-gray-500">
                Current academic standing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5 text-garden-orange" />
                LeetCode Solved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{leetcodeSolved}</div>
              <div className="flex gap-2 mt-2">
                <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  Easy: {leetcodeProgressData.reduce((acc, curr) => acc + curr.easy, 0)}
                </div>
                <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  Medium: {leetcodeProgressData.reduce((acc, curr) => acc + curr.medium, 0)}
                </div>
                <div className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                  Hard: {leetcodeProgressData.reduce((acc, curr) => acc + curr.hard, 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={activeTab} className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="productivity" className="flex gap-2">
              <Trophy size={16} />
              <span>Productivity</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex gap-2">
              <GraduationCap size={16} />
              <span>Academic</span>
            </TabsTrigger>
            <TabsTrigger value="coding" className="flex gap-2">
              <Code size={16} />
              <span>Coding</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="productivity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Task Completion</CardTitle>
                <CardDescription>
                  Number of tasks completed vs. total tasks by day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completionByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="completed"
                        name="Completed"
                        fill="#4ade80"
                      />
                      <Bar dataKey="total" name="Total" fill="#93c5fd" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Task completion by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryCompletion}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="completed"
                        name="Completed"
                        fill="#4ade80"
                      />
                      <Bar dataKey="total" name="Total" fill="#93c5fd" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Study Time</CardTitle>
                <CardDescription>
                  Hours spent studying per week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studyTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="hours"
                        name="Study Hours"
                        stroke="#9f7aea"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Grades</CardTitle>
                <CardDescription>
                  Current grades by subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="grade"
                        name="Grade"
                        fill="#f59e0b"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>LeetCode Progress</CardTitle>
                <CardDescription>
                  Problems solved by difficulty level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leetcodeProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="easy"
                        name="Easy"
                        stackId="a"
                        fill="#93c5fd"
                      />
                      <Bar
                        dataKey="medium"
                        name="Medium"
                        stackId="a"
                        fill="#fbbf24"
                      />
                      <Bar
                        dataKey="hard"
                        name="Hard"
                        stackId="a"
                        fill="#f87171"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View Detailed Progress</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;
