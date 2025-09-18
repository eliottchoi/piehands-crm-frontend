import type { User } from '../types';

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

interface EventPropertyFilterQuery {
  id: string;
  propertyName: string;
  propertyType: 'string' | 'number' | 'date' | 'boolean';
  operator: string;
  value: string;
}

interface PropertyFilterQuery {
  id: string;
  propertyName: string;
  propertyType: 'string' | 'number' | 'date' | 'boolean';
  operator: string;
  value: string;
}

interface CohortFilterQuery {
  id: string;
  cohortId: string;
  cohortName: string;
}

interface FilterQuery {
  id: string;
  type: 'event' | 'property' | 'cohort';
  display: string;
  query: EventFilterQuery | PropertyFilterQuery | CohortFilterQuery;
  logic?: 'AND' | 'OR';
}

// Date range calculation utilities
export const parseDateRange = (dateRange: string): { start: Date; end: Date } => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start = new Date(end);

  if (dateRange.startsWith('Last ')) {
    const match = dateRange.match(/Last (\d+) (day|week|month|year)s?/);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 'day':
          start.setDate(end.getDate() - amount);
          break;
        case 'week':
          start.setDate(end.getDate() - (amount * 7));
          break;
        case 'month':
          start.setMonth(end.getMonth() - amount);
          break;
        case 'year':
          start.setFullYear(end.getFullYear() - amount);
          break;
      }
    }
  } else {
    // Handle specific date ranges
    switch (dateRange) {
      case 'Today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'Yesterday':
        start.setDate(end.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        break;
      case 'This week':
        const dayOfWeek = now.getDay();
        start.setDate(end.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        break;
      case 'Last 7 days':
        start.setDate(end.getDate() - 7);
        break;
      case 'Last 30 days':
        start.setDate(end.getDate() - 30);
        break;
      case 'Last 90 days':
        start.setDate(end.getDate() - 90);
        break;
      case 'All time':
        start = new Date('2020-01-01'); // Far back date
        break;
      default:
        start.setDate(end.getDate() - 30); // Default to 30 days
    }
  }
  
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

// Event filter logic
const applyEventFilter = (users: User[], eventFilter: EventFilterQuery): User[] => {
  const { start, end } = parseDateRange(eventFilter.dateRange);
  
  return users.filter(user => {
    if (!user.events || user.events.length === 0) {
      return eventFilter.action === 'did not do';
    }
    
    // Filter events by name and date range
    const relevantEvents = user.events.filter(event => {
      const eventDate = new Date(event.timestamp);
      const isInDateRange = eventDate >= start && eventDate <= end;
      const isEventMatch = event.name === eventFilter.eventName;
      
      // Apply event property filters if any
      let propertyMatch = true;
      if (eventFilter.eventProperties && eventFilter.eventProperties.length > 0) {
        propertyMatch = eventFilter.eventProperties.every(propFilter => {
          return applyEventPropertyFilter(event, propFilter);
        });
      }
      
      return isInDateRange && isEventMatch && propertyMatch;
    });
    
    // Calculate aggregation
    let aggregatedValue: number;
    if (eventFilter.aggregation === 'Total Events') {
      aggregatedValue = relevantEvents.length;
    } else if (eventFilter.aggregation === 'Unique Days') {
      const uniqueDays = new Set(
        relevantEvents.map(event => 
          new Date(event.timestamp).toDateString()
        )
      );
      aggregatedValue = uniqueDays.size;
    } else {
      aggregatedValue = 0;
    }
    
    // Apply operator
    let conditionMet = false;
    switch (eventFilter.operator) {
      case '=':
        conditionMet = aggregatedValue === eventFilter.value;
        break;
      case '≠':
        conditionMet = aggregatedValue !== eventFilter.value;
        break;
      case '>':
        conditionMet = aggregatedValue > eventFilter.value;
        break;
      case '≥':
        conditionMet = aggregatedValue >= eventFilter.value;
        break;
      case '<':
        conditionMet = aggregatedValue < eventFilter.value;
        break;
      case '≤':
        conditionMet = aggregatedValue <= eventFilter.value;
        break;
      default:
        conditionMet = false;
    }
    
    // Return based on action
    return eventFilter.action === 'did' ? conditionMet : !conditionMet;
  });
};

// Event property filter logic
const applyEventPropertyFilter = (event: any, propertyFilter: EventPropertyFilterQuery): boolean => {
  const properties = event.properties || {};
  const propertyValue = properties[propertyFilter.propertyName];
  
  if (propertyValue === undefined || propertyValue === null) {
    return ['is not set', 'is not'].includes(propertyFilter.operator);
  }
  
  switch (propertyFilter.operator) {
    case 'is':
      return String(propertyValue) === propertyFilter.value;
    case 'is not':
      return String(propertyValue) !== propertyFilter.value;
    case 'contains':
      return String(propertyValue).toLowerCase().includes(propertyFilter.value.toLowerCase());
    case 'does not contain':
      return !String(propertyValue).toLowerCase().includes(propertyFilter.value.toLowerCase());
    case '=':
      return Number(propertyValue) === Number(propertyFilter.value);
    case '>':
      return Number(propertyValue) > Number(propertyFilter.value);
    case '≥':
      return Number(propertyValue) >= Number(propertyFilter.value);
    case '<':
      return Number(propertyValue) < Number(propertyFilter.value);
    case '≤':
      return Number(propertyValue) <= Number(propertyFilter.value);
    case 'is true':
      return Boolean(propertyValue) === true;
    case 'is false':
      return Boolean(propertyValue) === false;
    case 'is set':
      return propertyValue !== undefined && propertyValue !== null;
    case 'is not set':
      return propertyValue === undefined || propertyValue === null;
    default:
      return true;
  }
};

// User property filter logic
const applyPropertyFilter = (users: User[], propertyFilter: PropertyFilterQuery): User[] => {
  return users.filter(user => {
    const properties = user.properties as Record<string, any> || {};
    const propertyValue = properties[propertyFilter.propertyName];
    
    if (propertyValue === undefined || propertyValue === null) {
      return ['is not set', 'is not'].includes(propertyFilter.operator);
    }
    
    switch (propertyFilter.operator) {
      case 'contains':
        return String(propertyValue).toLowerCase().includes(propertyFilter.value.toLowerCase());
      case 'does not contain':
        return !String(propertyValue).toLowerCase().includes(propertyFilter.value.toLowerCase());
      case 'is':
        return String(propertyValue) === propertyFilter.value;
      case 'is not':
        return String(propertyValue) !== propertyFilter.value;
      case '=':
        return Number(propertyValue) === Number(propertyFilter.value);
      case '>':
        return Number(propertyValue) > Number(propertyFilter.value);
      case '≥':
        return Number(propertyValue) >= Number(propertyFilter.value);
      case '<':
        return Number(propertyValue) < Number(propertyFilter.value);
      case '≤':
        return Number(propertyValue) <= Number(propertyFilter.value);
      case 'is true':
        return Boolean(propertyValue) === true;
      case 'is false':
        return Boolean(propertyValue) === false;
      case 'is set':
        return propertyValue !== undefined && propertyValue !== null;
      case 'is not set':
        return propertyValue === undefined || propertyValue === null;
      case 'Last':
        // Handle "Last X days" for date properties
        if (propertyFilter.value.includes('days')) {
          const days = parseInt(propertyFilter.value.split(' ')[0]);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          const propDate = new Date(propertyValue);
          return propDate >= cutoffDate;
        }
        return true;
      default:
        return true;
    }
  });
};

// Cohort filter logic (mock for now)
const applyCohortFilter = (users: User[], cohortFilter: CohortFilterQuery): User[] => {
  // TODO: Implement actual cohort logic when backend is ready
  console.log(`Applying cohort filter: ${cohortFilter.cohortName}`);
  return users; // Return all users for now
};

// Main filter application function
export const applyAllFilters = (users: User[], filters: FilterQuery[]): User[] => {
  if (filters.length === 0) return users;
  
  // Start with all users
  let result = users;
  
  // Apply filters with AND/OR logic
  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i];
    const logic = filter.logic || (i === 0 ? 'AND' : 'AND'); // First filter is always AND
    
    let filteredByThisFilter: User[];
    
    switch (filter.type) {
      case 'event':
        filteredByThisFilter = applyEventFilter(users, filter.query as EventFilterQuery);
        break;
      case 'property':
        filteredByThisFilter = applyPropertyFilter(users, filter.query as PropertyFilterQuery);
        break;
      case 'cohort':
        filteredByThisFilter = applyCohortFilter(users, filter.query as CohortFilterQuery);
        break;
      default:
        filteredByThisFilter = users;
    }
    
    if (i === 0) {
      // First filter
      result = filteredByThisFilter;
    } else if (logic === 'AND') {
      // Intersection
      result = result.filter(user => 
        filteredByThisFilter.some(filteredUser => filteredUser.id === user.id)
      );
    } else if (logic === 'OR') {
      // Union (remove duplicates)
      const resultIds = new Set(result.map(user => user.id));
      const newUsers = filteredByThisFilter.filter(user => !resultIds.has(user.id));
      result = [...result, ...newUsers];
    }
  }
  
  return result;
};
