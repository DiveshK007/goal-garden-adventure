
import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus, Calendar, Clock } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { TaskList } from "@/components/tasks/TaskList";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTask } from "@/contexts/TaskContext";

const TasksPage = () => {
  const { tasks, getTasks, getUpcomingTasks } = useTask();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  
  const pendingTasks = getTasks({ completed: false });
  const completedTasks = getTasks({ completed: true });
  const todayTasks = getUpcomingTasks(1);
  const weekTasks = getUpcomingTasks(7);
  
  const today = new Date();
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-gray-500">
              Today is {format(today, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          
          <Sheet open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <SheetTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Add Task
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Task</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <AddTaskForm onClose={() => setIsAddTaskOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming" className="flex gap-2">
                <Clock size={16} />
                <span>Upcoming</span>
              </TabsTrigger>
              <TabsTrigger value="all" className="flex gap-2">
                <Calendar size={16} />
                <span>All Tasks</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-6">
              <div className="space-y-6">
                <TaskList 
                  title="Today" 
                  tasks={todayTasks} 
                  emptyMessage="No tasks due today" 
                />
                
                <TaskList 
                  title="This Week" 
                  tasks={weekTasks.filter(task => 
                    !todayTasks.find(t => t.id === task.id)
                  )} 
                  emptyMessage="No tasks due this week" 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="space-y-6">
              <div className="space-y-6">
                <TaskList 
                  title="Pending Tasks" 
                  tasks={pendingTasks} 
                  emptyMessage="No pending tasks" 
                />
                
                <TaskList 
                  title="Completed Tasks" 
                  tasks={completedTasks.slice(0, 5)} 
                  emptyMessage="No completed tasks" 
                />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default TasksPage;
