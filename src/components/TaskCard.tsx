import { useState } from 'react';
import { useTodoStore } from '@/stores/todoStore';
import { Task } from '@/types/todo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui/status-badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const {
    categories,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
  } = useTodoStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(!!task.description);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
  const [showSubtaskDescription, setShowSubtaskDescription] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
  
  const category = categories.find(c => c.id === task.categoryId);
  
  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(
        task.id,
        newSubtaskTitle.trim(),
        newSubtaskDescription.trim() || undefined
      );
      setNewSubtaskTitle('');
      setNewSubtaskDescription('');
      setShowSubtaskDescription(false);
      setIsSubtaskDialogOpen(false);
    }
  };

  const toggleSubtaskExpanded = (subtaskId: string) => {
    const newExpanded = new Set(expandedSubtasks);
    if (newExpanded.has(subtaskId)) {
      newExpanded.delete(subtaskId);
    } else {
      newExpanded.add(subtaskId);
    }
    setExpandedSubtasks(newExpanded);
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  return (
    <Card className="bg-gradient-card hover:shadow-card transition-all duration-200 animate-fade-in">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center space-x-3 flex-1 text-left">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {task.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <StatusBadge status={task.status} />
                  {category && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: category.color ? `${category.color}20` : undefined,
                        color: category.color || undefined,
                        borderColor: category.color ? `${category.color}40` : undefined,
                      }}
                    >
                      {category.name}
                    </Badge>
                  )}
                  {task.subtasks.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {completedSubtasks}/{task.subtasks.length} subtasks
                    </span>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem
                  onClick={() => setShowDescription(!showDescription)}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {showDescription ? 'Hide' : 'Show'} Description
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteTask(task.id)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 animate-slide-down">
            {/* Description */}
            {showDescription && (
              <div>
                <Textarea
                  value={task.description || ''}
                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                  placeholder="Add task description..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            )}

            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Subtasks</h4>
                <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Subtask
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Subtask</DialogTitle>
                      <DialogDescription>
                        Create a subtask to break down your main task.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        placeholder="Subtask title"
                        autoFocus
                      />
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSubtaskDescription(!showSubtaskDescription)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {showSubtaskDescription ? 'Hide' : 'Add'} Description
                        </Button>
                      </div>
                      
                      {showSubtaskDescription && (
                        <Textarea
                          value={newSubtaskDescription}
                          onChange={(e) => setNewSubtaskDescription(e.target.value)}
                          placeholder="Subtask description (optional)"
                          className="min-h-[60px] resize-none"
                        />
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSubtaskDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddSubtask}
                        disabled={!newSubtaskTitle.trim()}
                      >
                        Add Subtask
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {task.subtasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No subtasks yet. Add one to break down this task.
                </p>
              ) : (
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                        className="mt-0.5"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              subtask.completed
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {subtask.title}
                          </span>
                          
                          <div className="flex items-center space-x-1">
                            {subtask.description && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleSubtaskExpanded(subtask.id)}
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => deleteSubtask(task.id, subtask.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {subtask.description && expandedSubtasks.has(subtask.id) && (
                          <div className="mt-2">
                            <Textarea
                              value={subtask.description}
                              onChange={(e) =>
                                updateSubtask(task.id, subtask.id, {
                                  description: e.target.value,
                                })
                              }
                              className="text-xs min-h-[60px] resize-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TaskCard;