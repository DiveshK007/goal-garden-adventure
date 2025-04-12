
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, Trash2 } from "lucide-react";
import { useTask, SubTask } from "@/contexts/TaskContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SubTaskItemProps {
  taskId: string;
  subtask: SubTask;
}

export function SubTaskItem({ taskId, subtask }: SubTaskItemProps) {
  const { updateSubtask, deleteSubtask } = useTask();
  const [isHovered, setIsHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleComplete = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      updateSubtask(taskId, subtask.id, checked);
    }
  };

  const handleDelete = () => {
    deleteSubtask(taskId, subtask.id);
    setConfirmDelete(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "py-2 px-2 ml-6 bg-white dark:bg-gray-800 rounded-md border-l-2 border-gray-200 dark:border-gray-700 flex items-center gap-2",
          subtask.completed ? "opacity-70" : "",
          isHovered ? "bg-gray-50 dark:bg-gray-750" : ""
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Checkbox 
          checked={subtask.completed} 
          onCheckedChange={handleComplete}
          className={cn(
            subtask.completed ? "text-garden-green dark:text-garden-green" : ""
          )}
        />
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm",
            subtask.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
          )}>
            {subtask.title}
          </p>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-garden-purple font-medium">
          +{subtask.points} pts
        </div>
        
        {isHovered && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </motion.div>
      
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Subtask</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this subtask?</p>
          <div className="flex justify-end gap-2 mt-4">
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

interface SubTaskListProps {
  taskId: string;
  subtasks: SubTask[];
}

export function SubTaskList({ taskId, subtasks }: SubTaskListProps) {
  const { addSubtask } = useTask();
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskPoints, setNewSubtaskPoints] = useState(5);

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(taskId, {
        title: newSubtaskTitle.trim(),
        completed: false,
        points: newSubtaskPoints
      });
      setNewSubtaskTitle("");
      setNewSubtaskPoints(5);
      setIsAddingSubtask(false);
    }
  };

  return (
    <div className="mt-3 space-y-1">
      {subtasks.map(subtask => (
        <SubTaskItem 
          key={subtask.id} 
          taskId={taskId} 
          subtask={subtask} 
        />
      ))}
      
      {isAddingSubtask ? (
        <div className="ml-6 mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter subtask..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="text-sm"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={newSubtaskPoints}
                onChange={(e) => setNewSubtaskPoints(Number(e.target.value))}
                className="w-16 text-sm"
                min={1}
                max={20}
              />
              <span className="text-xs whitespace-nowrap">pts</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingSubtask(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-garden-green dark:text-garden-green ml-6 text-xs"
          onClick={() => setIsAddingSubtask(true)}
        >
          <Plus size={14} className="mr-1" /> Add subtask
        </Button>
      )}
    </div>
  );
}
