import { useEffect } from 'react';
import { useTodoStore } from '@/stores/todoStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui/status-badge';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  FolderOpen, 
  Plus,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { todos, categories, getStats, fetchTodos, fetchCategories } = useTodoStore();
  const stats = getStats();

  useEffect(() => {
    fetchCategories();
    fetchTodos();
  }, [fetchCategories, fetchTodos]);
  
  const recentTasks = todos
    .sort((a, b) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime())
    .slice(0, 5);

  const progressPercentage = stats.totalTodos > 0 
    ? Math.round((stats.completedTodos / stats.totalTodos) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your productivity overview.
          </p>
        </div>
        <Link to="/todos">
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card hover:shadow-card transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTodos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCategories} categories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-card transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-done" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-done">{stats.completedTodos}</div>
            <p className="text-xs text-muted-foreground">
              {progressPercentage}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-card transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-in-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-in-progress">{stats.inProgressTodos}</div>
            <p className="text-xs text-muted-foreground">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-card transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Total categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      {stats.totalTodos > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Progress Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-todo">{stats.totalTodos - stats.completedTodos - stats.inProgressTodos}</div>
                  <div className="text-xs text-muted-foreground">Todo</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-in-progress">{stats.inProgressTodos}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-done">{stats.completedTodos}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Tasks</span>
              </CardTitle>
              <CardDescription>Your latest task activity</CardDescription>
            </div>
            <Link to="/todos">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first task to get started with productivity tracking.
              </p>
              <Link to="/todos">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((todo) => {
                const category = categories.find(c => c.id === todo.category_id);
                return (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-foreground truncate">
                          {todo.title}
                        </h4>
                        <StatusBadge status={todo.status} />
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {category && (
                          <Badge variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        )}
                        {todo.subtasks && todo.subtasks.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length} subtasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;