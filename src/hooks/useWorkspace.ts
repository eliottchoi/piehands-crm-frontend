import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workspace } from '@/types/workspace';
import { useWorkspaces } from './useWorkspaces';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspace) {
      // If there is only one workspace, or no workspace is selected yet,
      // default to the first one.
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace]);

  if (error) {
    // Handle error state appropriately
    console.error("Failed to load workspaces:", error);
  }

  const value = {
    workspaces: workspaces || [],
    currentWorkspace,
    setCurrentWorkspace,
    isLoading,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
