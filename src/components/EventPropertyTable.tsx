import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EventPropertyTableProps {
  properties: Record<string, any>;
}

export const EventPropertyTable: React.FC<EventPropertyTableProps> = ({ properties }) => {
  const entries = Object.entries(properties || {});
  
  if (entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic p-4">
        No properties for this event
      </div>
    );
  }

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-1/3 font-semibold">Property</TableHead>
            <TableHead className="w-1/6 font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map(([key, value]) => (
            <TableRow key={key} className="hover:bg-muted/20">
              <TableCell className="font-medium font-mono text-sm">
                {key}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                {getValueType(value)}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {typeof value === 'object' && value !== null ? (
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {formatValue(value)}
                  </pre>
                ) : (
                  <span className={cn(
                    typeof value === 'string' && 'text-blue-600',
                    typeof value === 'number' && 'text-purple-600', 
                    typeof value === 'boolean' && 'text-orange-600',
                    value === null && 'text-gray-400 italic'
                  )}>
                    {formatValue(value)}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
