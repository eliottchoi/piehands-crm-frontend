import { useQuery } from '@tanstack/react-query';
import { Workspace } from '@/types/workspace';
import api from '@/lib/api';

const fetchWorkspaces = async (): Promise<Workspace[]> => {
  const { data } = await api.get('/workspaces');
  return data;
};

export const useWorkspaces = () => {
  return useQuery<Workspace[], Error>({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
  });
};
