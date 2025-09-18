import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FilterLogicToggleProps {
  logic: 'AND' | 'OR';
  onToggle: () => void;
  index: number;
}

export const FilterLogicToggle: React.FC<FilterLogicToggleProps> = ({
  logic,
  onToggle,
  index
}) => {
  return (
    <div className="flex justify-center py-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={`text-xs px-4 py-2 transition-all ${
          logic === 'AND' 
            ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200' 
            : 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200'
        }`}
      >
        {logic}
      </Button>
    </div>
  );
};
