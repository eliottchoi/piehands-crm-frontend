import { useState } from 'react';
import { Plus, Filter, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterPanel } from './FilterPanel';
import { EventFilterBuilder } from './filters/EventFilterBuilder';
import { PropertyFilterBuilder } from './filters/PropertyFilterBuilder';
import { CohortFilterBuilder } from './filters/CohortFilterBuilder';
import { FilterLogicToggle } from './filters/FilterLogicToggle';

interface FilterQuery {
  id: string;
  type: 'event' | 'property' | 'cohort';
  display: string;
  query: any; // Detailed query object
  logic?: 'AND' | 'OR'; // Logic operator for this filter
}

interface UserFilterBarProps {
  userCount: number;
  totalCount: number;
  filters: FilterQuery[];
  onFiltersChange: (filters: FilterQuery[]) => void;
  onSaveCohort?: () => void;
}

// Add logic operators between filters
const addLogicOperator = (filters: FilterQuery[], index: number, logic: 'AND' | 'OR') => {
  return filters.map((filter, i) => 
    i === index + 1 ? { ...filter, logic } : filter
  );
};

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

      {/* Active Filters - Enhanced Builder UI */}
      {filters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Active Filters</span>
          </div>
          
          <div className="space-y-3">
            {filters.map((filter, index) => (
              <div key={filter.id} className="space-y-2">
                {index > 0 && (
                  <FilterLogicToggle
                    logic={filter.logic || 'AND'}
                    onToggle={() => {
                      const currentLogic = filter.logic || 'AND';
                      const newLogic = currentLogic === 'AND' ? 'OR' : 'AND';
                      const updatedFilters = addLogicOperator(filters, index - 1, newLogic);
                      onFiltersChange(updatedFilters);
                    }}
                    index={index}
                  />
                )}
                
                {/* Render appropriate filter builder based on type */}
                {filter.type === 'event' && (
                  <EventFilterBuilder
                    filter={filter.query}
                    onUpdate={(updatedQuery) => {
                      const updatedFilters = filters.map(f => 
                        f.id === filter.id 
                          ? { ...f, query: updatedQuery, display: generateEventDisplay(updatedQuery) }
                          : f
                      );
                      onFiltersChange(updatedFilters);
                    }}
                    onRemove={() => removeFilter(filter.id)}
                  />
                )}
                
                {filter.type === 'property' && (
                  <PropertyFilterBuilder
                    filter={filter.query}
                    onUpdate={(updatedQuery) => {
                      const updatedFilters = filters.map(f => 
                        f.id === filter.id 
                          ? { ...f, query: updatedQuery, display: generatePropertyDisplay(updatedQuery) }
                          : f
                      );
                      onFiltersChange(updatedFilters);
                    }}
                    onRemove={() => removeFilter(filter.id)}
                  />
                )}
                
                {filter.type === 'cohort' && (
                  <CohortFilterBuilder
                    filter={filter.query}
                    onRemove={() => removeFilter(filter.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions to generate display text
const generateEventDisplay = (query: any) => {
  return `who ${query.action} ${query.eventName} ${query.aggregation} ${query.operator} ${query.value} ${query.dateRange}`;
};

const generatePropertyDisplay = (query: any) => {
  return `where ${query.propertyName} ${query.operator} ${query.value}`;
};
