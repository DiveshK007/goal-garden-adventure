import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, Clock, AlertTriangle, Trash2, Edit } from "lucide-react";
import { useTask, Task, Priority } from "@/contexts/TaskContext";
import { useReward } from "@/contexts/RewardContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const categoryIcons: Record<string, string> = {
  school: "🏫",
  exam: "📝",
  homework: "📚",
  project: "🔬",
  reading: "📖",
  other: "📌",
};

export function TaskItem({ task }: { task: Task }) {
  const { completeTask, deleteTask } = useTask();
  const { addPoints } = useReward();
  const [isHovered, setIsHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleComplete = () => {
    if (!task.completed) {
      const points = completeTask(task.id);
      addPoints(points, `Completed: ${task.title}`);
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setConfirmDelete(false);
  };

  const isOverdue = !task.completed && new Date() > task.dueDate;
  const isDueSoon = !task.completed && !isOverdue && 
    new Date() < task.dueDate && 
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000) > task.dueDate;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "p-4 bg-white rounded-lg border shadow-sm transition-all",
          task.completed ? "opacity-70" : "",
          isOverdue ? "border-red-300" : "",
          isDueSoon ? "border-yellow-300" : "",
          isHovered ? "shadow-md" : ""
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-3">
          <div>
            <Checkbox 
              checked={task.completed} 
              onCheckedChange={handleComplete}
              className={cn(
                "mt-0.5",
                task.completed ? "text-garden-green" : ""
              )}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-medium text-md truncate",
                  task.completed ? "line-through text-gray-500" : "text-gray-900"
                )}>
                  {categoryIcons[task.category]} {task.title}
                </h3>
                
                {task.description && (
                  <p className={cn(
                    "text-sm text-gray-500 line-clamp-2",
                    task.completed ? "line-through" : ""
                  )}>
                    {task.description}
                  </p>
                )}
              </div>
              
              <Badge 
                variant="outline" 
                className={priorityColors[task.priority]}
              >
                {task.priority}
              </Badge>
            </div>
            
            <div className="flex items-center mt-2 text-sm justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} className={cn(
                    isOverdue ? "text-red-500" : 
                    isDueSoon ? "text-yellow-500" : 
                    "text-gray-400"
                  )} />
                  <span className={cn(
                    isOverdue ? "text-red-500 font-medium" : 
                    isDueSoon ? "text-yellow-500 font-medium" :
                    "text-gray-500"
                  )}>
                    {format(task.dueDate, "MMM d")}
                  </span>
                </div>
                
                {!task.completed && (
                  <div className="flex items-center gap-1">
                    <span className="text-garden-purple font-medium">+{task.points} pts</span>
                  </div>
                )}
              </div>
              
              {isHovered && !task.completed && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this task?</p>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TaskList({ 
  title, 
  tasks, 
  emptyMessage = "No tasks found"
}: { 
  title?: string; 
  tasks: Task[]; 
  emptyMessage?: string 
}) {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
