import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onDateRangeChange: (range: { start: Date | undefined; end: Date | undefined }) => void
  placeholder?: string
  className?: string
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  placeholder = "Pick date range",
  className
}) => {
  const [isSelectingEnd, setIsSelectingEnd] = React.useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onDateRangeChange({ start: undefined, end: undefined });
      setIsSelectingEnd(false);
      return;
    }

    if (!startDate || isSelectingEnd) {
      if (isSelectingEnd && startDate) {
        onDateRangeChange({ start: startDate, end: date });
        setIsSelectingEnd(false);
      } else {
        onDateRangeChange({ start: date, end: undefined });
        setIsSelectingEnd(true);
      }
    } else {
      if (date < startDate) {
        onDateRangeChange({ start: date, end: startDate });
      } else {
        onDateRangeChange({ start: startDate, end: date });
      }
      setIsSelectingEnd(false);
    }
  };

  const displayText = startDate && endDate 
    ? `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`
    : startDate 
    ? `${format(startDate, "MMM dd, yyyy")} - ...`
    : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !startDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={isSelectingEnd ? endDate : startDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="p-3 border-t text-xs text-muted-foreground">
          {isSelectingEnd ? "Select end date" : "Select start date"}
        </div>
      </PopoverContent>
    </Popover>
  )
}
