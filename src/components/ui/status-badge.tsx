import { cn } from '@/lib/utils';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'todo' | 'inprogress' | 'done';
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const variants = {
    'todo': {
      bg: 'bg-todo-light',
      text: 'text-todo',
      border: 'border-todo/20',
      icon: AlertCircle,
      label: 'Todo'
    },
    'inprogress': {
      bg: 'bg-in-progress-light',
      text: 'text-in-progress',
      border: 'border-in-progress/20',
      icon: Clock,
      label: 'In Progress'
    },
    'done': {
      bg: 'bg-done-light',
      text: 'text-done',
      border: 'border-done/20',
      icon: CheckCircle,
      label: 'Done'
    }
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        variant.bg,
        variant.text,
        variant.border,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{variant.label}</span>
    </div>
  );
};

export default StatusBadge;