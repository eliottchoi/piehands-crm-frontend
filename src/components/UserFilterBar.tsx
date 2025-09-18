import { useState } from 'react';
import { Plus, Filter, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterPanel } from './FilterPanel';

interface FilterQuery {
  id: string;
  type: 'event' | 'property' | 'cohort';
  display: string;
  query: any; // Detailed query object
}

interface UserFilterBarProps {
  userCount: number;
  totalCount: number;
  filters: FilterQuery[];
  onFiltersChange: (filters: FilterQuery[]) => void;
  onSaveCohort?: () => void;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  userCount,
  totalCount,
  filters,
  onFiltersChange,
  onSaveCohort
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const removeFilter = (filterId: string) => {
    onFiltersChange(filters.filter(f => f.id !== filterId));
  };

  const addFilter = (filterQuery: FilterQuery) => {
    onFiltersChange([...filters, filterQuery]);
    setIsFilterPanelOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* User Count Display */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {userCount.toLocaleString()}
          </span>
          {filters.length > 0 && (
            <>
              <span> of </span>
              <span className="font-semibold text-foreground">
                {totalCount.toLocaleString()}
              </span>
            </>
          )}
          <span> users</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {filters.length > 0 && onSaveCohort && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSaveCohort}
              className="text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              Save as Cohort
            </Button>
          )}
          
          <FilterPanel
            isOpen={isFilterPanelOpen}
            onOpenChange={setIsFilterPanelOpen}
            onAddFilter={addFilter}
            trigger={
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterPanelOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Filter
              </Button>
            }
          />
        </div>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/20 rounded-lg border">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          
          {filters.map((filter, index) => (
            <div key={filter.id} className="flex items-center space-x-2">
              {index > 0 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  AND
                </Badge>
              )}
              
              <div className="flex items-center space-x-1 bg-background border rounded-md px-3 py-2">
                <span className="text-sm font-medium">{filter.display}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <span className="sr-only">Remove filter</span>
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
