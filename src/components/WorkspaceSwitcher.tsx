'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Zap } from 'lucide-react';

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, isLoading } = useWorkspace();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-muted rounded-xl animate-pulse"></div>
        <div>
          <div className="h-5 w-24 bg-muted rounded-md animate-pulse"></div>
          <div className="h-3 w-32 bg-muted rounded-md animate-pulse mt-1"></div>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return <div>No workspace found.</div>;
  }

  const handleValueChange = (workspaceId: string) => {
    const selected = workspaces.find((ws) => ws.id === workspaceId);
    if (selected) {
      setCurrentWorkspace(selected);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
        <Zap className="w-5 h-5 text-white" />
      </div>
      <div>
        <Select value={currentWorkspace.id} onValueChange={handleValueChange}>
          <SelectTrigger className="w-[180px] border-none text-xl font-bold text-foreground focus:ring-0">
            <SelectValue placeholder="Select a workspace" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((workspace) => (
              <SelectItem key={workspace.id} value={workspace.id}>
                {workspace.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground font-medium">CRM Platform</p>
      </div>
    </div>
  );
}
