import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface CohortFilterQuery {
  id: string;
  cohortId: string;
  cohortName: string;
}

interface CohortFilterBuilderProps {
  filter: CohortFilterQuery;
  onRemove: () => void;
}

export const CohortFilterBuilder: React.FC<CohortFilterBuilderProps> = ({
  filter,
  onRemove
}) => {
  return (
    <div className="flex items-center gap-2 p-4 bg-purple-50/50 border border-purple-200 rounded-lg">
      {/* Users icon */}
      <Users className="h-4 w-4 text-purple-600" />
      
      {/* "User is in Cohort" text */}
      <span className="text-sm font-medium text-gray-700">User is in Cohort</span>
      
      {/* Cohort name badge */}
      <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
        {filter.cohortName}
      </Badge>
      
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
