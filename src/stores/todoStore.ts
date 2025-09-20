import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Todo, Category, Subtask, TodoStats } from '@/types/todo';

interface TodoStore {
  todos: Todo[];
  categories: Category[];
  loading: boolean;
  
  // Category methods
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Todo methods
  fetchTodos: () => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'subtasks'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  
  // Subtask methods
  addSubtask: (todoId: string, subtask: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubtask: (subtaskId: string, updates: Partial<Subtask>) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
  toggleSubtask: (subtaskId: string) => Promise<void>;
  
  // Stats
  getStats: () => TodoStats;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  categories: [],
  loading: false,

  fetchCategories: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      set({ categories: data || [] });
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchTodos: async () => {
    try {
      set({ loading: true });
      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select(`
          *,
          subtasks (*)
        `)
        .order('created_at', { ascending: false });
      
      if (todosError) throw todosError;
      
      const todos = todosData?.map(todo => ({
        ...todo,
        status: todo.status as 'todo' | 'inprogress' | 'done',
        subtasks: todo.subtasks || []
      })) || [];
      
      set({ todos });
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (name) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({ categories: [data, ...state.categories] }));
    } catch (error) {
      console.error('Error adding category:', error);
    }
  },

  updateCategory: async (id, name) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? { ...category, name } : category
        ),
      }));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        todos: state.todos.filter((todo) => todo.category_id !== id),
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  },

  addTodo: async (todo) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert(todo)
        .select()
        .single();
      
      if (error) throw error;
      
      const newTodo = { ...data, status: data.status as 'todo' | 'inprogress' | 'done', subtasks: [] };
      set((state) => ({ todos: [newTodo, ...state.todos] }));
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  },

  updateTodo: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, ...updates } : todo
        ),
      }));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  },

  deleteTodo: async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  },

  addSubtask: async (todoId, subtask) => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert({ ...subtask, todo_id: todoId })
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === todoId
            ? { ...todo, subtasks: [...(todo.subtasks || []), data] }
            : todo
        ),
      }));
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  },

  updateSubtask: async (subtaskId, updates) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', subtaskId);
      
      if (error) throw error;
      
      set((state) => ({
        todos: state.todos.map((todo) => ({
          ...todo,
          subtasks: todo.subtasks?.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
          ) || [],
        })),
      }));
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  },

  deleteSubtask: async (subtaskId) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);
      
      if (error) throw error;
      
      set((state) => ({
        todos: state.todos.map((todo) => ({
          ...todo,
          subtasks: todo.subtasks?.filter((subtask) => subtask.id !== subtaskId) || [],
        })),
      }));
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  },

  toggleSubtask: async (subtaskId) => {
    const { todos } = get();
    const todo = todos.find(t => t.subtasks?.some(s => s.id === subtaskId));
    const subtask = todo?.subtasks?.find(s => s.id === subtaskId);
    
    if (subtask) {
      await get().updateSubtask(subtaskId, { completed: !subtask.completed });
    }
  },

  getStats: () => {
    const { todos, categories } = get();
    
    return {
      totalTodos: todos.length,
      completedTodos: todos.filter((todo) => todo.status === 'done').length,
      inProgressTodos: todos.filter((todo) => todo.status === 'inprogress').length,
      totalCategories: categories.length,
    };
  },
}));