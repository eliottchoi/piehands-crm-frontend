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
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { DateRangePicker } from './ui/date-picker';

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const presetRanges = [
  { value: 'Today', label: 'Today' },
  { value: 'Yesterday', label: 'Yesterday' },
  { value: 'Last 7 days', label: 'Last 7 days' },
  { value: 'Last 30 days', label: 'Last 30 days' },
  { value: 'Last 90 days', label: 'Last 90 days' },
  { value: 'This week', label: 'This week' },
  { value: 'Last week', label: 'Last week' },
  { value: 'This month', label: 'This month' },
  { value: 'Last month', label: 'Last month' },
  { value: 'Last 6 months', label: 'Last 6 months' },
  { value: 'Last year', label: 'Last year' },
  { value: 'All time', label: 'All time' }
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const [mode, setMode] = useState<'preset' | 'custom' | 'relative'>('preset');
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();
  const [relativeAmount, setRelativeAmount] = useState('7');
  const [relativeUnit, setRelativeUnit] = useState('days');

  const handlePresetChange = (presetValue: string) => {
    setMode('preset');
    onChange(presetValue);
  };

  const handleRelativeChange = () => {
    const newValue = `Last ${relativeAmount} ${relativeUnit}`;
    setMode('relative');
    onChange(newValue);
  };

  const handleCustomChange = () => {
    if (customStart && customEnd) {
      const newValue = `${customStart.toISOString().split('T')[0]} to ${customEnd.toISOString().split('T')[0]}`;
      setMode('custom');
      onChange(newValue);
    }
  };

  const isPreset = presetRanges.some(range => range.value === value);
  const isCustom = value.includes(' to ');
  const isRelative = value.startsWith('Last ') && !isPreset;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Mode selector */}
      <div className="flex space-x-1">
        <Button
          variant={mode === 'preset' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setMode('preset')}
          className="text-xs"
        >
          <Clock className="h-3 w-3 mr-1" />
          Preset
        </Button>
        <Button
          variant={mode === 'relative' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setMode('relative')}
          className="text-xs"
        >
          Relative
        </Button>
        <Button
          variant={mode === 'custom' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setMode('custom')}
          className="text-xs"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Custom
        </Button>
      </div>

      {/* Preset mode */}
      {mode === 'preset' && (
        <Select value={isPreset ? value : ''} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-full h-8 text-sm">
            <SelectValue placeholder="Select preset range..." />
          </SelectTrigger>
          <SelectContent>
            {presetRanges.map(range => (
              <SelectItem key={range.value} value={range.value} className="text-sm">
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Relative mode */}
      {mode === 'relative' && (
        <div className="flex items-center space-x-2">
          <span className="text-sm">Last</span>
          <Input
            type="number"
            value={relativeAmount}
            onChange={(e) => setRelativeAmount(e.target.value)}
            className="w-16 h-8 text-sm text-center"
            min="1"
          />
          <Select value={relativeUnit} onValueChange={setRelativeUnit}>
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">days</SelectItem>
              <SelectItem value="weeks">weeks</SelectItem>
              <SelectItem value="months">months</SelectItem>
              <SelectItem value="years">years</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleRelativeChange} className="h-8 text-xs">
            Apply
          </Button>
        </div>
      )}

      {/* Custom mode */}
      {mode === 'custom' && (
        <div className="space-y-2">
          <DateRangePicker
            startDate={customStart}
            endDate={customEnd}
            onDateRangeChange={({ start, end }) => {
              setCustomStart(start);
              setCustomEnd(end);
              if (start && end) {
                handleCustomChange();
              }
            }}
            placeholder="Select custom range..."
            className="w-full"
          />
        </div>
      )}

      {/* Current selection display */}
      <div className="text-xs text-muted-foreground">
        Current: <Badge variant="outline" className="text-xs">{value}</Badge>
      </div>
    </div>
  );
};
