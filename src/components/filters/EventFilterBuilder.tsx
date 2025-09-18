import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useEventNames } from '../../hooks/useEvents';
import { Badge } from '@/components/ui/badge';
import { EventPropertyFilter } from './EventPropertyFilter';
// Removed complex DateRangeSelector

interface EventPropertyFilterQuery {
  id: string;
  propertyName: string;
  propertyType: 'string' | 'number' | 'date' | 'boolean';
  operator: string;
  value: string;
}

interface EventFilterQuery {
  id: string;
  eventName: string;
  action: 'did' | 'did not do';
  aggregation: 'Total Events' | 'Unique Days';
  operator: '=' | '≠' | '>' | '≥' | '<' | '≤';
  value: number;
  dateRange: string;
  eventProperties?: EventPropertyFilterQuery[];
}

interface EventFilterBuilderProps {
  filter: EventFilterQuery;
  onUpdate: (filter: EventFilterQuery) => void;
  onRemove: () => void;
}

const actionOptions = [
  { value: 'did', label: 'did' },
  { value: 'did not do', label: 'did not do' }
];

const aggregationOptions = [
  { value: 'Total Events', label: 'Total Events' },
  { value: 'Unique Days', label: 'Unique Days' }
];

const operatorOptions = [
  { value: '=', label: 'equals' },
  { value: '≠', label: 'does not equal' },
  { value: '>', label: 'greater than' },
  { value: '≥', label: 'greater than or equal to' },
  { value: '<', label: 'less than' },
  { value: '≤', label: 'less than or equal to' }
];

const dateRangeOptions = [
  { value: 'Last 7 days', label: 'Last 7 days' },
  { value: 'Last 30 days', label: 'Last 30 days' },
  { value: 'Last 90 days', label: 'Last 90 days' },
  { value: 'Last 6 months', label: 'Last 6 months' },
  { value: 'Last year', label: 'Last year' },
  { value: 'All time', label: 'All time' }
];

// Mock event names - 실제로는 API에서 로드
const eventNameOptions = [
  'Complete Order',
  'Login', 
  'Page View',
  'Product Viewed',
  'Add to Cart',
  'Sign Up',
  'Download',
  'Subscribe'
];

export const EventFilterBuilder: React.FC<EventFilterBuilderProps> = ({
  filter,
  onUpdate,
  onRemove
}) => {
  // Load real event names for the dropdown
  const { data: eventNames = [] } = useEventNames('ws_piehands');
  
  const [eventProperties, setEventProperties] = useState<EventPropertyFilterQuery[]>(
    filter.eventProperties || []
  );

  const updateField = <K extends keyof EventFilterQuery>(
    field: K,
    value: EventFilterQuery[K]
  ) => {
    const updatedFilter = { ...filter, [field]: value };
    if (field === 'eventName') {
      // Reset event properties when event changes
      updatedFilter.eventProperties = [];
      setEventProperties([]);
    }
    onUpdate(updatedFilter);
  };

  const handleEventPropertiesChange = (newProperties: EventPropertyFilterQuery[]) => {
    setEventProperties(newProperties);
    onUpdate({ ...filter, eventProperties: newProperties });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
      {/* "who" label */}
      <span className="text-sm font-medium text-gray-700">who</span>
      
      {/* Action: did / did not do */}
      <Select
        value={filter.action}
        onValueChange={(value) => updateField('action', value as EventFilterQuery['action'])}
      >
        <SelectTrigger className="w-auto min-w-[120px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {actionOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Event Name */}
        <Select
          value={filter.eventName}
          onValueChange={(value) => updateField('eventName', value)}
        >
          <SelectTrigger className="w-auto min-w-[140px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventNames.map((eventName: string) => (
              <SelectItem key={eventName} value={eventName}>
                {eventName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      
      {/* Aggregation */}
      <Select
        value={filter.aggregation}
        onValueChange={(value) => updateField('aggregation', value as EventFilterQuery['aggregation'])}
      >
        <SelectTrigger className="w-auto min-w-[120px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {aggregationOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Operator */}
      <Select
        value={filter.operator}
        onValueChange={(value) => updateField('operator', value as EventFilterQuery['operator'])}
      >
        <SelectTrigger className="w-auto min-w-[80px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operatorOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Value */}
      <Input
        type="number"
        value={filter.value}
        onChange={(e) => updateField('value', parseInt(e.target.value) || 0)}
        className="w-16 h-8 text-sm text-center"
        min="0"
      />
      
      {/* Simple Date Range Select */}
      <Select
        value={filter.dateRange}
        onValueChange={(value: string) => updateField('dateRange', value)}
      >
        <SelectTrigger className="w-auto min-w-[120px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground ml-2"
      >
        ×
      </Button>
      
      {/* Event Properties Section */}
      <EventPropertyFilter
        eventName={filter.eventName}
        properties={eventProperties}
        onAddProperty={(property: EventPropertyFilterQuery) => handleEventPropertiesChange([...eventProperties, property])}
        onUpdateProperty={(propertyId: string, updatedProperty: EventPropertyFilterQuery) => {
          const updated = eventProperties.map(p => 
            p.id === propertyId ? updatedProperty : p
          );
          handleEventPropertiesChange(updated);
        }}
        onRemoveProperty={(propertyId: string) => {
          const updated = eventProperties.filter(p => p.id !== propertyId);
          handleEventPropertiesChange(updated);
        }}
      />
    </div>
  );
};
