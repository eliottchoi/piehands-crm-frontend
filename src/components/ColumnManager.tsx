import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Search, GripVertical, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './ui/sortable-item';

interface ColumnConfig {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  visible: boolean;
  width?: number;
}

interface ColumnManagerProps {
  availableColumns: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({
  availableColumns,
  visibleColumns,
  onColumnsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localVisible, setLocalVisible] = useState(visibleColumns);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setLocalVisible(visibleColumns);
  }, [visibleColumns]);

  const filteredAvailable = availableColumns.filter(col => 
    !localVisible.find(v => v.id === col.id) &&
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addColumn = (column: ColumnConfig) => {
    setLocalVisible([...localVisible, { ...column, visible: true }]);
  };

  const removeColumn = (columnId: string) => {
    setLocalVisible(localVisible.filter(col => col.id !== columnId));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setLocalVisible((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onColumnsChange(localVisible);
    setIsOpen(false);
    
    // Save to localStorage
    localStorage.setItem('userTableColumns', JSON.stringify(localVisible));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-1" />
          Edit Columns
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Customize Table Columns</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 h-96">
          {/* Available Columns */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Available Properties</h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="border rounded-lg p-2 h-64 overflow-y-auto space-y-1">
              {filteredAvailable.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => addColumn(column)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{column.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {column.type}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    +
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Selected Columns */}
          <div className="space-y-4">
            <h3 className="font-semibold">Selected Columns ({localVisible.length})</h3>
            
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="border rounded-lg p-2 h-64 overflow-y-auto">
                <SortableContext items={localVisible.map(col => col.id)} strategy={verticalListSortingStrategy}>
                  {localVisible.map((column) => (
                    <SortableItem key={column.id} id={column.id}>
                      <div className="flex items-center justify-between p-2 bg-background border rounded mb-1">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <span className="font-medium">{column.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {column.type}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColumn(column.id)}
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </SortableItem>
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
