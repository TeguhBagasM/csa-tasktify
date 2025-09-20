export interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subtask {
  id: string;
  todo_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Todo {
  id: string;
  category_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'done';
  subtasks?: Subtask[];
  created_at?: string;
  updated_at?: string;
}

export interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  inProgressTodos: number;
  totalCategories: number;
}