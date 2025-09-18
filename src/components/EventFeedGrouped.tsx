import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { EventPropertyTable } from './EventPropertyTable';
import type { Event } from '../types';

interface EventFeedGroupedProps {
  events: Event[];
}

interface GroupedEvents {
  [date: string]: Event[];
}

export const EventFeedGrouped: React.FC<EventFeedGroupedProps> = ({ events }) => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Group events by date
  const groupedEvents = events.reduce<GroupedEvents>((groups, event) => {
    const eventDate = new Date(event.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey: string;
    
    if (eventDate.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (eventDate.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = eventDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {});

  // Sort groups by date (most recent first)
  const sortedDateKeys = Object.keys(groupedEvents).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-lg mb-2">No events yet</div>
        <div className="text-sm">Events will appear here as the user interacts with your application</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDateKeys.map((dateKey) => {
        const dayEvents = groupedEvents[dateKey];
        // Sort events within each day by time (most recent first)
        const sortedDayEvents = dayEvents.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return (
          <div key={dateKey} className="border-l-2 border-muted-foreground/20 pl-4">
            <div className="sticky top-0 bg-background py-2 mb-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                {dateKey} 
                {dateKey !== 'Today' && dateKey !== 'Yesterday' && (
                  <span className="text-sm font-normal ml-2">
                    {sortedDayEvents.length} event{sortedDayEvents.length !== 1 ? 's' : ''}
                  </span>
                )}
              </h3>
            </div>
            
            <div className="space-y-2">
              {sortedDayEvents.map((event) => (
                <div key={event.id} className="group">
                  <div 
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleEventExpansion(event.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {expandedEvents.has(event.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(event.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Object.keys(event.properties || {}).length} properties
                    </div>
                  </div>
                  
                  {expandedEvents.has(event.id) && (
                    <div className="ml-7 mt-2 mb-4">
                      <EventPropertyTable properties={event.properties || {}} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
