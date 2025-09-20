import { useState, useEffect } from 'react';
import { useTodoStore } from '@/stores/todoStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import CategorySelector from '@/components/CategorySelector';
import TaskCard from '@/components/TaskCard';
import StatusBadge from '@/components/ui/status-badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, FileText, Filter, Search } from 'lucide-react';

const TodoList = () => {
  const { todos, categories, addTodo, fetchTodos, fetchCategories } = useTodoStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDescription, setShowDescription] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchTodos();
  }, [fetchCategories, fetchTodos]);

  const handleAddTask = async () => {
    if (newTaskTitle.trim() && selectedCategory) {
      await addTodo({
        title: newTaskTitle.trim(),
        category_id: selectedCategory,
        description: newTaskDescription.trim() || undefined,
        status: 'todo',
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedCategory('');
      setShowDescription(false);
      setIsDialogOpen(false);
    }
  };

  // Filter tasks
  const filteredTasks = todos.filter((todo) => {
    const matchesStatus = filterStatus === 'all' || todo.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || todo.category_id === filterCategory;
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Group tasks by status
  const groupedTasks = {
    todo: filteredTasks.filter(todo => todo.status === 'todo'),
    inprogress: filteredTasks.filter(todo => todo.status === 'inprogress'),
    done: filteredTasks.filter(todo => todo.status === 'done'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Todo List</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track your progress.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task to track your progress and organize your work.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <CategorySelector
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  placeholder="Select a category"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDescription(!showDescription)}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {showDescription ? 'Hide' : 'Add'} Description
                </Button>
              </div>
              
              {showDescription && (
                <Textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Task description (optional)"
                  className="min-h-[80px] resize-none"
                />
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || !selectedCategory}
              >
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => {
                setFilterStatus('all');
                setFilterCategory('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-todo-light border-todo/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Todo</span>
              <Badge variant="secondary">{groupedTasks.todo.length}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-in-progress-light border-in-progress/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>In Progress</span>
              <Badge variant="secondary">{groupedTasks.inprogress.length}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-done-light border-done/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Completed</span>
              <Badge variant="secondary">{groupedTasks.done.length}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
                  <p className="text-muted-foreground">
                    {todos.length === 0 
                      ? "Create your first task to get started"
                      : "Try adjusting your filters or search query"
                    }
                  </p>
                </div>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((todo) => (
            <TaskCard key={todo.id} todo={todo} />
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;