
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useReward } from "@/contexts/RewardContext";

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'school' | 'exam' | 'homework' | 'project' | 'reading' | 'other';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  points: number;
}

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
  subtasks: SubTask[];
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'subtasks'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => number; // Returns earned points
  getTasks: (filter?: { completed?: boolean; category?: Category }) => Task[];
  getUpcomingTasks: (days: number) => Task[];
  addSubtask: (taskId: string, subtask: Omit<SubTask, 'id'>) => void;
  updateSubtask: (taskId: string, subtaskId: string, completed: boolean) => number; // Returns earned points
  deleteSubtask: (taskId: string, subtaskId: string) => void;
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
    points: 20,
    subtasks: []
  },
  {
    id: '2',
    title: 'Study for Chemistry Test',
    description: 'Review chapters 3-5 and practice problems',
    dueDate: new Date(Date.now() + 172800000), // day after tomorrow
    priority: 'high',
    category: 'exam',
    completed: false,
    points: 50,
    subtasks: []
  },
  {
    id: '3',
    title: 'English Essay Draft',
    description: 'Write first draft of analysis essay',
    dueDate: new Date(Date.now() + 345600000), // 4 days from now
    priority: 'medium',
    category: 'project',
    completed: false,
    points: 30,
    subtasks: []
  }
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { toast } = useToast();
  const { addPoints } = useReward();

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
          reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
          subtasks: task.subtasks || []
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

  const addTask = (task: Omit<Task, 'id' | 'subtasks'>) => {
    const newTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
      subtasks: []
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

    // Calculate points from completed subtasks
    const completedSubtasksPoints = task.subtasks
      .filter(st => st.completed)
      .reduce((total, st) => total + st.points, 0);
    
    // Only award the task's points if all subtasks are completed,
    // or if there are no subtasks
    const earnedPoints = task.subtasks.length > 0 ? 
      (task.subtasks.every(st => st.completed) ? task.points : completedSubtasksPoints) : 
      task.points;

    updateTask(id, { completed: true });
    toast({
      title: "Task completed",
      description: `Congratulations! You earned ${earnedPoints} points.`,
    });
    
    return earnedPoints;
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

  // Subtask methods
  const addSubtask = (taskId: string, subtask: Omit<SubTask, 'id'>) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtask = {
          ...subtask,
          id: Math.random().toString(36).substr(2, 9),
          completed: false,
        };
        return {
          ...task,
          subtasks: [...task.subtasks, newSubtask]
        };
      }
      return task;
    }));

    toast({
      title: "Subtask added",
      description: `"${subtask.title}" has been added.`,
    });
  };

  const updateSubtask = (taskId: string, subtaskId: string, completed: boolean): number => {
    let earnedPoints = 0;

    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(subtask => {
          if (subtask.id === subtaskId) {
            // Calculate points only if completing (not uncompleting)
            if (completed && !subtask.completed) {
              earnedPoints = subtask.points;
            }
            return { ...subtask, completed };
          }
          return subtask;
        });

        // Check if all subtasks are now completed
        const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);

        // Auto-complete the main task if all subtasks are completed
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksCompleted ? true : task.completed
        };
      }
      return task;
    }));

    if (earnedPoints > 0) {
      addPoints(earnedPoints);
      toast({
        title: "Subtask completed",
        description: `You earned ${earnedPoints} points!`,
      });
    }

    return earnedPoints;
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const subtaskToDelete = task.subtasks.find(st => st.id === subtaskId);
        if (subtaskToDelete) {
          return {
            ...task,
            subtasks: task.subtasks.filter(st => st.id !== subtaskId)
          };
        }
      }
      return task;
    }));

    toast({
      title: "Subtask removed",
      description: "The subtask has been removed.",
    });
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
        getUpcomingTasks,
        addSubtask,
        updateSubtask,
        deleteSubtask
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
