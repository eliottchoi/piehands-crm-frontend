import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Target } from 'lucide-react';

interface FilterQuery {
  id: string;
  type: 'event' | 'property' | 'cohort';
  display: string;
  query: any;
}

interface FilterPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFilter: (filter: FilterQuery) => void;
  trigger: React.ReactNode;
}

// Mock data - 실제로는 API에서 로드
const mockEventNames = [
  'Complete Order',
  'Login',
  'Page View', 
  'Product Viewed',
  'Add to Cart',
  'Sign Up'
];

const mockUserProperties = [
  { name: 'name', type: 'string' },
  { name: 'email', type: 'string' },
  { name: 'level', type: 'string' },
  { name: 'age', type: 'number' },
  { name: 'last_login', type: 'date' },
  { name: 'is_premium', type: 'boolean' }
];

const mockCohorts = [
  { id: '1', name: 'Active VIP Users', description: 'Users with VIP level who logged in last 7 days' },
  { id: '2', name: 'High Value Customers', description: 'Users with 3+ orders and total spend > $500' },
  { id: '3', name: 'Churn Risk', description: 'Users who haven\'t logged in for 30+ days' }
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onOpenChange,
  onAddFilter,
  trigger
}) => {
  const [activeTab, setActiveTab] = useState('events');

  const handleEventSelect = (eventName: string) => {
    console.log('🔧 FilterPanel: Event selected:', eventName);
    
    // 즉시 1차 초안 생성!
    const defaultEventFilter: FilterQuery = {
      id: `event_${Date.now()}`,
      type: 'event',
      display: `who did ${eventName} Total Events ≥ 1 Last 30 days`,
      query: {
        id: `event_${Date.now()}`,
        eventName,
        action: 'did' as const,
        aggregation: 'Total Events' as const,
        operator: '≥' as const,
        value: 1,
        dateRange: 'Last 30 days'
      }
    };
    
    console.log('🔧 FilterPanel: Calling onAddFilter with:', defaultEventFilter);
    onAddFilter(defaultEventFilter);
    console.log('🔧 FilterPanel: onAddFilter called successfully');
  };

  const handlePropertySelect = (property: typeof mockUserProperties[0]) => {
    // 타입별 기본값으로 1차 초안 생성!
    let defaultValue = '';
    let defaultOperator = 'is';
    
    switch (property.type) {
      case 'string':
        defaultValue = '';
        defaultOperator = 'contains';
        break;
      case 'number':
        defaultValue = '0';
        defaultOperator = '≥';
        break;
      case 'date':
        defaultValue = 'Last 7 days';
        defaultOperator = 'Last';
        break;
      case 'boolean':
        defaultValue = 'true';
        defaultOperator = 'is';
        break;
    }

    const defaultPropertyFilter: FilterQuery = {
      id: `property_${Date.now()}`,
      type: 'property',
      display: `where ${property.name} ${defaultOperator} ${defaultValue}`,
      query: {
        id: `property_${Date.now()}`,
        propertyName: property.name,
        propertyType: property.type,
        operator: defaultOperator,
        value: defaultValue
      }
    };
    
    onAddFilter(defaultPropertyFilter);
  };

  const handleCohortSelect = (cohort: typeof mockCohorts[0]) => {
    const cohortFilter: FilterQuery = {
      id: `cohort_${Date.now()}`,
      type: 'cohort',
      display: `User is in Cohort "${cohort.name}"`,
      query: {
        cohortId: cohort.id,
        cohortName: cohort.name
      }
    };
    
    onAddFilter(cohortFilter);
  };

  if (!isOpen) {
    return <>{trigger}</>;
  }

  return (
    <div className="relative">
      {trigger}
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 z-50 bg-background border rounded-lg shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-b-none">
              <TabsTrigger value="events" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                Events
              </TabsTrigger>
              <TabsTrigger value="properties" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                User Properties  
              </TabsTrigger>
              <TabsTrigger value="cohorts" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Cohorts
              </TabsTrigger>
            </TabsList>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              <TabsContent value="events" className="mt-0 space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-3">
                  Select an event to create filter (default: did event ≥ 1 times in last 30 days)
                </div>
                {mockEventNames.map((eventName) => (
                  <Button
                    key={eventName}
                    variant="ghost"
                    className="w-full justify-start h-8 text-sm"
                    onClick={() => handleEventSelect(eventName)}
                  >
                    {eventName}
                  </Button>
                ))}
              </TabsContent>
              
              <TabsContent value="properties" className="mt-0 space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-3">
                  Select a user property to filter by
                </div>
                {mockUserProperties.map((property) => (
                  <Button
                    key={property.name}
                    variant="ghost"
                    className="w-full justify-between h-8 text-sm"
                    onClick={() => handlePropertySelect(property)}
                  >
                    <span>{property.name}</span>
                    <span className="text-xs text-muted-foreground">{property.type}</span>
                  </Button>
                ))}
              </TabsContent>
              
              <TabsContent value="cohorts" className="mt-0 space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-3">
                  Select a saved cohort to filter users
                </div>
                {mockCohorts.map((cohort) => (
                  <Card key={cohort.id} className="p-0">
                    <CardContent className="p-3">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-0 text-left"
                        onClick={() => handleCohortSelect(cohort)}
                      >
                        <div>
                          <div className="font-medium text-sm">{cohort.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {cohort.description}
                          </div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </div>
            
            <div className="p-2 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onOpenChange(false)}
                className="w-full text-xs"
              >
                Cancel
              </Button>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
};
