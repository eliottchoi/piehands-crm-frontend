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

interface PropertyFilterQuery {
  id: string;
  propertyName: string;
  propertyType: 'string' | 'number' | 'date' | 'boolean';
  operator: string;
  value: string;
}

interface PropertyFilterBuilderProps {
  filter: PropertyFilterQuery;
  onUpdate: (filter: PropertyFilterQuery) => void;
  onRemove: () => void;
}

const getOperatorsByType = (type: string) => {
  switch (type) {
    case 'string':
      return [
        { value: 'contains', label: 'contains' },
        { value: 'does not contain', label: 'does not contain' },
        { value: 'is', label: 'is' },
        { value: 'is not', label: 'is not' },
        { value: 'is set', label: 'is set' },
        { value: 'is not set', label: 'is not set' }
      ];
    case 'number':
      return [
        { value: '=', label: 'equals' },
        { value: '≠', label: 'does not equal' },
        { value: '>', label: 'greater than' },
        { value: '≥', label: 'greater than or equal to' },
        { value: '<', label: 'less than' },
        { value: '≤', label: 'less than or equal to' },
        { value: 'is set', label: 'is set' },
        { value: 'is not set', label: 'is not set' }
      ];
    case 'date':
      return [
        { value: 'Last', label: 'Last' },
        { value: 'before', label: 'before' },
        { value: 'after', label: 'after' },
        { value: 'between', label: 'between' },
        { value: 'is set', label: 'is set' },
        { value: 'is not set', label: 'is not set' }
      ];
    case 'boolean':
      return [
        { value: 'is true', label: 'is true' },
        { value: 'is false', label: 'is false' },
        { value: 'is set', label: 'is set' },
        { value: 'is not set', label: 'is not set' }
      ];
    default:
      return [];
  }
};

const renderValueInput = (filter: PropertyFilterQuery, updateField: (field: keyof PropertyFilterQuery, value: any) => void) => {
  if (filter.operator === 'is set' || filter.operator === 'is not set') {
    return null; // No value input needed
  }

  switch (filter.propertyType) {
    case 'string':
      return (
        <Input
          value={filter.value}
          onChange={(e) => updateField('value', e.target.value)}
          placeholder="Enter text..."
          className="w-32 h-8 text-sm"
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={filter.value}
          onChange={(e) => updateField('value', e.target.value)}
          className="w-20 h-8 text-sm text-center"
        />
      );
    case 'date':
      if (filter.operator === 'Last') {
        return (
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              value={filter.value.split(' ')[0] || ''}
              onChange={(e) => updateField('value', `${e.target.value} days`)}
              className="w-16 h-8 text-sm text-center"
              min="1"
            />
            <span className="text-sm text-gray-600">days</span>
          </div>
        );
      }
      return (
        <Input
          type="date"
          value={filter.value}
          onChange={(e) => updateField('value', e.target.value)}
          className="w-32 h-8 text-sm"
        />
      );
    case 'boolean':
      return null; // Value is embedded in operator
    default:
      return (
        <Input
          value={filter.value}
          onChange={(e) => updateField('value', e.target.value)}
          className="w-32 h-8 text-sm"
        />
      );
  }
};

export const PropertyFilterBuilder: React.FC<PropertyFilterBuilderProps> = ({
  filter,
  onUpdate,
  onRemove
}) => {
  const updateField = <K extends keyof PropertyFilterQuery>(
    field: K,
    value: PropertyFilterQuery[K]
  ) => {
    onUpdate({ ...filter, [field]: value });
  };

  const operators = getOperatorsByType(filter.propertyType);

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-green-50/50 border border-green-200 rounded-lg">
      {/* "where" label */}
      <span className="text-sm font-medium text-gray-700">where</span>
      
      {/* Property Name */}
      <span className="text-sm font-semibold bg-background border px-2 py-1 rounded">
        {filter.propertyName}
      </span>
      
      <span className="text-xs text-muted-foreground">
        ({filter.propertyType})
      </span>
      
      {/* Operator */}
      <Select
        value={filter.operator}
        onValueChange={(value) => updateField('operator', value)}
      >
        <SelectTrigger className="w-auto min-w-[140px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Value Input */}
      {renderValueInput(filter, updateField)}
      
      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground ml-2"
      >
        ×
      </Button>
    </div>
  );
};
