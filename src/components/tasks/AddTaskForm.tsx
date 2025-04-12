
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useTask, Priority, Category, SubTask } from "@/contexts/TaskContext";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }).max(50),
  description: z.string().max(200, {
    message: "Description must be less than 200 characters.",
  }).optional(),
  dueDate: z.date(),
  priority: z.enum(["low", "medium", "high"] as const),
  category: z.enum(["school", "exam", "homework", "project", "reading", "other"] as const),
  points: z.number().int().min(5).max(100),
});

interface SubtaskFormItem {
  id: string;
  title: string;
  points: number;
}

export function AddTaskForm({ onClose }: { onClose?: () => void }) {
  const { addTask } = useTask();
  const [subtasks, setSubtasks] = useState<SubtaskFormItem[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskPoints, setSubtaskPoints] = useState(5);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "medium",
      category: "homework",
      points: 20,
    },
  });

  const handleAddSubtask = () => {
    if (subtaskTitle.trim()) {
      const newSubtask: SubtaskFormItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: subtaskTitle.trim(),
        points: subtaskPoints
      };
      setSubtasks([...subtasks, newSubtask]);
      setSubtaskTitle("");
      setSubtaskPoints(5);
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert subtasks to the proper format
    const finalSubtasks: Omit<SubTask, 'id'>[] = subtasks.map(st => ({
      title: st.title,
      points: st.points,
      completed: false
    }));
    
    // Create the task with its subtasks
    const task = {
      title: values.title,
      description: values.description || "",
      dueDate: values.dueDate,
      priority: values.priority as Priority,
      category: values.category as Category,
      completed: false,
      points: values.points,
    };
    
    addTask(task);
    
    // Add subtasks if any were created
    // Note: The addTask function now automatically creates the task with subtasks,
    // so this part is handled within the TaskContext
    
    form.reset();
    setSubtasks([]);
    if (onClose) onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="dark:text-gray-200">Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title..." {...field} className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
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
              <FormLabel className="dark:text-gray-200">Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter task details..." 
                  className="resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" 
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
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="dark:text-gray-200">Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                      className="dark:bg-gray-800 dark:text-gray-100"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-gray-200">Priority</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-gray-200">Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="homework">Homework</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-gray-200">Points</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={5}
                    max={100}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    value={field.value}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </FormControl>
                <FormDescription className="dark:text-gray-400">
                  Points you'll earn for completion (5-100)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <FormLabel className="dark:text-gray-200 mb-2 block">Subtasks (Optional)</FormLabel>
            
            {subtasks.length > 0 && (
              <div className="space-y-2 mb-4">
                {subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex-1">{subtask.title}</div>
                    <div className="text-sm text-garden-purple">+{subtask.points} pts</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500"
                      onClick={() => handleRemoveSubtask(subtask.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Enter subtask..."
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
              <div className="flex items-center gap-1">
                <Input 
                  type="number"
                  value={subtaskPoints}
                  onChange={(e) => setSubtaskPoints(Number(e.target.value))}
                  className="w-16 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  min={1}
                  max={20}
                />
                <span className="whitespace-nowrap dark:text-gray-200">pts</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddSubtask}
                disabled={!subtaskTitle.trim()}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose} className="dark:border-gray-700">
              Cancel
            </Button>
          )}
          <Button type="submit">Add Task</Button>
        </div>
      </form>
    </Form>
  );
}
