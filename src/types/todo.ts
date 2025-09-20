export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  status: 'todo' | 'in-progress' | 'done';
  subtasks: SubTask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalCategories: number;
}