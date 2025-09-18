import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUserProperties } from '../hooks/useUsers';

interface VariableAutocompleteProps {
  workspaceId: string;
  children: React.ReactElement<HTMLTextAreaElement>; // textarea element to wrap
}

interface SuggestionItem {
  label: string;
  value: string;
  description: string;
}

export const VariableAutocomplete: React.FC<VariableAutocompleteProps> = ({
  workspaceId,
  children
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [triggerStart, setTriggerStart] = useState(0);

  // Get user properties for suggestions  
  const { data: userProperties = [] } = useUserProperties(workspaceId);

  // Build suggestions list from actual user properties
  const suggestions: SuggestionItem[] = [
    // Always available system properties
    { label: 'user.distinctId', value: 'user.distinctId', description: 'Unique user identifier' },
    // Dynamic properties from database
    ...userProperties.map(prop => ({
      label: `user.${prop}`,
      value: `user.${prop}`,
      description: getPropertyDescription(prop)
    })),
  ];

  // Helper function to provide better descriptions for common properties
  function getPropertyDescription(propertyName: string): string {
    const descriptions: Record<string, string> = {
      'name': 'User display name',
      'email': 'User email address', 
      'phone': 'User phone number',
      'level': 'User membership level',
      'company': 'User company name',
      'role': 'User role/position',
    };
    return descriptions[propertyName] || `Custom property: ${propertyName}`;
  }

  // Filter suggestions based on search term
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset selected index when suggestions change
  useEffect(() => {
    if (selectedIndex >= filteredSuggestions.length) {
      setSelectedIndex(0);
    }
  }, [filteredSuggestions.length, selectedIndex]);

  const getTextarea = (): HTMLTextAreaElement | null => {
    return wrapperRef.current?.querySelector('textarea') || null;
  };

  const insertVariable = (variableName: string) => {
    const textarea = getTextarea();
    if (!textarea) return;

    const currentValue = textarea.value;
    const cursorPos = textarea.selectionStart;
    const beforeTrigger = currentValue.slice(0, triggerStart);
    const afterCursor = currentValue.slice(cursorPos);
    const newValue = `${beforeTrigger}{{${variableName}}}${afterCursor}`;
    
    // Directly update the textarea
    textarea.value = newValue;
    
    // Trigger React's input event
    const inputEvent = new Event('input', { bubbles: true });
    textarea.dispatchEvent(inputEvent);
    
    setShowSuggestions(false);
    
    // Set cursor position after the inserted variable
    setTimeout(() => {
      const newCursorPos = triggerStart + `{{${variableName}}}`.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  useEffect(() => {
    const textarea = getTextarea();
    if (!textarea) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      const currentValue = target.value;
      const cursorPos = target.selectionStart;

      // Check for {{ trigger
      const textBeforeCursor = currentValue.slice(0, cursorPos);
      const lastTriggerIndex = textBeforeCursor.lastIndexOf('{{');
      const lastClosingIndex = textBeforeCursor.lastIndexOf('}}');

      // Only show suggestions if {{ is more recent than }}
      if (lastTriggerIndex > lastClosingIndex && lastTriggerIndex !== -1) {
        const textAfterTrigger = textBeforeCursor.slice(lastTriggerIndex + 2);
        
        // Don't show suggestions if there's a newline after {{
        if (!textAfterTrigger.includes('\n')) {
          setSearchTerm(textAfterTrigger);
          setTriggerStart(lastTriggerIndex);
          setShowSuggestions(true);
          setSelectedIndex(0);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredSuggestions[selectedIndex]) {
            insertVariable(filteredSuggestions[selectedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
        case 'Tab':
          e.preventDefault();
          if (filteredSuggestions[selectedIndex]) {
            insertVariable(filteredSuggestions[selectedIndex].value);
          }
          break;
      }
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSuggestions, selectedIndex, filteredSuggestions, triggerStart]);

  // Clone the textarea element and add our classes
  const enhancedTextarea = React.cloneElement(children, {
    ...children.props,
    className: cn(
      children.props.className,
      "font-mono leading-relaxed"
    ),
  });

  return (
    <div ref={wrapperRef} className="relative">
      {enhancedTextarea}

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 glass-card border border-card-border/50 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground mb-3 px-2">
              <span>🎯</span>
              <span>Template Variables</span>
              {searchTerm && (
                <span className="ml-auto bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  Searching: {searchTerm}
                </span>
              )}
            </div>
            
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.value}-${index}`} // 🎯 Ensure unique keys
                className={cn(
                  "flex items-start justify-between p-3 rounded-md cursor-pointer transition-all duration-150 group",
                  index === selectedIndex 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => insertVariable(suggestion.value)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex-1">
                  <div className="font-mono text-sm font-medium">
                    <span className="text-muted-foreground">&#123;&#123; </span>
                    <span>{suggestion.label}</span>
                    <span className="text-muted-foreground"> &#125;&#125;</span>
                  </div>
                  <div className={cn(
                    "text-xs mt-1",
                    index === selectedIndex ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {suggestion.description}
                  </div>
                </div>
                {index === selectedIndex && (
                  <div className={cn(
                    "text-xs px-1.5 py-0.5 rounded ml-2 font-medium",
                    "bg-primary-foreground/20 text-primary-foreground"
                  )}>
                    ↵
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="px-3 py-2 border-t border-border/20 bg-muted/10">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>↑↓ Navigate</span>
              <span>↵ Tab Insert</span>
              <span>Esc Close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

VariableAutocomplete.displayName = 'VariableAutocomplete';