
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'school' | 'exam' | 'homework' | 'project' | 'reading' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  category: Category;
  completed: boolean;
  reminderTime?: Date;
  points: number;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => number; // Returns earned points
  getTasks: (filter?: { completed?: boolean; category?: Category }) => Task[];
  getUpcomingTasks: (days: number) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Sample initial tasks
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Math Homework',
    description: 'Complete exercises 1-10 for Chapter 5',
    dueDate: new Date(Date.now() + 86400000), // tomorrow
    priority: 'high',
    category: 'homework',
    completed: false,
    points: 20
  },
  {
    id: '2',
    title: 'Study for Chemistry Test',
    description: 'Review chapters 3-5 and practice problems',
    dueDate: new Date(Date.now() + 172800000), // day after tomorrow
    priority: 'high',
    category: 'exam',
    completed: false,
    points: 50
  },
  {
    id: '3',
    title: 'English Essay Draft',
    description: 'Write first draft of analysis essay',
    dueDate: new Date(Date.now() + 345600000), // 4 days from now
    priority: 'medium',
    category: 'project',
    completed: false,
    points: 30
  }
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { toast } = useToast();

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert string dates back to Date objects
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined
        }));
        setTasks(tasksWithDates);
      } catch (e) {
        console.error('Failed to parse tasks from localStorage', e);
        setTasks(initialTasks);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      completed: false
    };
    setTasks([...tasks, newTask]);
    toast({
      title: "Task added",
      description: `"${task.title}" has been added to your tasks.`,
    });
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete) {
      setTasks(tasks.filter((task) => task.id !== id));
      toast({
        title: "Task deleted",
        description: `"${taskToDelete.title}" has been removed from your tasks.`,
      });
    }
  };

  const completeTask = (id: string): number => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return 0;

    updateTask(id, { completed: true });
    toast({
      title: "Task completed",
      description: `Congratulations! You earned ${task.points} points.`,
    });
    return task.points;
  };

  const getTasks = (filter?: { completed?: boolean; category?: Category }) => {
    if (!filter) return tasks;

    return tasks.filter((task) => {
      if (filter.completed !== undefined && task.completed !== filter.completed) return false;
      if (filter.category && task.category !== filter.category) return false;
      return true;
    });
  };

  const getUpcomingTasks = (days: number) => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 86400000);
    
    return tasks.filter(
      (task) => !task.completed && task.dueDate >= now && task.dueDate <= future
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        getTasks,
        getUpcomingTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
