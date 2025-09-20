import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Task, SubTask, TodoStats } from '@/types/todo';

interface TodoStore {
  categories: Category[];
  tasks: Task[];
  
  // Category methods
  addCategory: (name: string) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getRecentCategories: () => Category[];
  
  // Task methods
  addTask: (title: string, categoryId: string, description?: string) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Subtask methods
  addSubtask: (taskId: string, title: string, description?: string) => SubTask;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  // Stats
  getStats: () => TodoStats;
}

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Belajar Otodidak',
    color: '#3B82F6',
    createdAt: new Date(),
    lastUsed: new Date(),
  },
  {
    id: '2',
    name: 'Masak Hari Ini',
    color: '#EF4444',
    createdAt: new Date(),
    lastUsed: new Date(),
  },
  {
    id: '3',
    name: 'Kerjaan',
    color: '#10B981',
    createdAt: new Date(),
    lastUsed: new Date(),
  },
];

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,
      tasks: [],
      
      addCategory: (name: string) => {
        const newCategory: Category = {
          id: Date.now().toString(),
          name,
          createdAt: new Date(),
          lastUsed: new Date(),
        };
        
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
        
        return newCategory;
      },
      
      updateCategory: (id: string, updates: Partial<Category>) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        }));
      },
      
      deleteCategory: (id: string) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          tasks: state.tasks.filter((task) => task.categoryId !== id),
        }));
      },
      
      getRecentCategories: () => {
        const { categories } = get();
        return categories
          .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
          .slice(0, 10);
      },
      
      addTask: (title: string, categoryId: string, description?: string) => {
        const newTask: Task = {
          id: Date.now().toString(),
          title,
          description,
          categoryId,
          status: 'todo',
          subtasks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Update category last used
        set((state) => ({
          tasks: [...state.tasks, newTask],
          categories: state.categories.map((cat) =>
            cat.id === categoryId ? { ...cat, lastUsed: new Date() } : cat
          ),
        }));
        
        return newTask;
      },
      
      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id 
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },
      
      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      addSubtask: (taskId: string, title: string, description?: string) => {
        const newSubtask: SubTask = {
          id: Date.now().toString(),
          title,
          description,
          completed: false,
          createdAt: new Date(),
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...task.subtasks, newSubtask],
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
        
        return newSubtask;
      },
      
      updateSubtask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                  ),
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
      },
      
      deleteSubtask: (taskId: string, subtaskId: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
      },
      
      toggleSubtask: (taskId: string, subtaskId: string) => {
        const { tasks, updateTask } = get();
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;
        
        // Toggle subtask
        const updatedSubtasks = task.subtasks.map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );
        
        // Calculate new status
        const completedCount = updatedSubtasks.filter((s) => s.completed).length;
        const totalCount = updatedSubtasks.length;
        
        let newStatus: Task['status'] = 'todo';
        if (totalCount === 0) {
          newStatus = 'todo';
        } else if (completedCount === totalCount) {
          newStatus = 'done';
        } else if (completedCount > 0) {
          newStatus = 'in-progress';
        }
        
        updateTask(taskId, {
          subtasks: updatedSubtasks,
          status: newStatus,
        });
      },
      
      getStats: () => {
        const { tasks, categories } = get();
        
        return {
          totalTasks: tasks.length,
          completedTasks: tasks.filter((task) => task.status === 'done').length,
          inProgressTasks: tasks.filter((task) => task.status === 'in-progress').length,
          totalCategories: categories.length,
        };
      },
    }),
    {
      name: 'todo-storage',
    }
  )
);