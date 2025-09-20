-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create todos table
CREATE TABLE public.todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'inprogress', 'done')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subtasks table
CREATE TABLE public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id UUID NOT NULL REFERENCES public.todos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented yet)
CREATE POLICY "Categories are publicly accessible" ON public.categories FOR ALL USING (true);
CREATE POLICY "Todos are publicly accessible" ON public.todos FOR ALL USING (true);
CREATE POLICY "Subtasks are publicly accessible" ON public.subtasks FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at
  BEFORE UPDATE ON public.subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name) VALUES 
  ('Belajar Otodidak'),
  ('Masak Hari Ini'),
  ('Kerjaan'),
  ('Personal'),
  ('Kesehatan');

-- Create function to auto-update todo status based on subtasks
CREATE OR REPLACE FUNCTION public.update_todo_status()
RETURNS TRIGGER AS $$
DECLARE
  total_subtasks INTEGER;
  completed_subtasks INTEGER;
BEGIN
  -- Get counts for the affected todo
  SELECT COUNT(*), COUNT(*) FILTER (WHERE completed = true)
  INTO total_subtasks, completed_subtasks
  FROM public.subtasks
  WHERE todo_id = COALESCE(NEW.todo_id, OLD.todo_id);
  
  -- Update todo status based on subtask completion
  UPDATE public.todos
  SET status = CASE
    WHEN total_subtasks = 0 THEN 'todo'
    WHEN completed_subtasks = 0 THEN 'todo'
    WHEN completed_subtasks = total_subtasks THEN 'done'
    ELSE 'inprogress'
  END
  WHERE id = COALESCE(NEW.todo_id, OLD.todo_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-update todo status
CREATE TRIGGER update_todo_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_todo_status();