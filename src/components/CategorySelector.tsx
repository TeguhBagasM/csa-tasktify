import { useState } from 'react';
import { useTodoStore } from '@/stores/todoStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface CategorySelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const CategorySelector = ({ value, onValueChange, placeholder = "Select category" }: CategorySelectorProps) => {
  const { getRecentCategories, addCategory } = useTodoStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const recentCategories = getRecentCategories();

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = addCategory(newCategoryName.trim());
      onValueChange?.(newCategory.id);
      setNewCategoryName('');
      setIsDialogOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    }
  };

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {recentCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center space-x-2">
                {category.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span>{category.name}</span>
              </div>
            </SelectItem>
          ))}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent">
                <Plus className="h-4 w-4 mr-2" />
                Add new category
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category to organize your tasks better.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="col-span-3"
                    placeholder="Enter category name"
                    autoFocus
                  />
                </div>
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
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;