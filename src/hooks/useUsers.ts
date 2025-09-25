import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { User } from '../types';
import toast from 'react-hot-toast';
import { useWorkspace } from './useWorkspace';

// Fetch paginated users for a workspace
const getUsers = async ({ workspaceId, pageParam, search }: { workspaceId: string, pageParam?: string, search?: string }) => {
  const params = new URLSearchParams({
    workspaceId,
    limit: '20',
  });
  if (pageParam) params.set('cursor', pageParam);
  if (search?.trim()) params.set('search', search);

  const response = await api.get(`/users?${params.toString()}`);
  return response.data;
};

export const useUsers = (search?: string) => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useInfiniteQuery<{ users: User[]; nextCursor: string | null }, Error>({
    queryKey: ['users', workspaceId, search],
    queryFn: ({ pageParam }) => getUsers({ workspaceId: workspaceId!, pageParam, search }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!workspaceId,
  });
};

// Fetch a single user by internal ID
const getUser = async (workspaceId: string, id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`, {
    params: { workspaceId },
  });
  return response.data;
};

export const useUser = (id: string) => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useQuery<User, Error>({
    queryKey: ['user', workspaceId, id],
    queryFn: () => getUser(workspaceId!, id),
    enabled: !!workspaceId && !!id,
  });
};

// Update user properties
const updateUser = async ({ userId, properties }: { userId: string, properties: Record<string, any> }): Promise<User> => {
  const response = await api.patch(`/users/${userId}`, { properties });
  return response.data;
};

export const useUpdateUser = (distinctId: string) => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useMutation<User, Error, { userId: string, properties: Record<string, any> }>({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', workspaceId, distinctId] });
      queryClient.invalidateQueries({ queryKey: ['users', workspaceId] });
    },
  });
};

// Add a new property to a user
const addUserProperty = async ({ userId, key, value }: { userId: string, key: string, value: any }): Promise<User> => {
  const response = await api.post(`/users/${userId}/properties`, { key, value });
  return response.data;
};

export const useAddUserProperty = (distinctId: string) => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useMutation<User, Error, { userId: string, key: string, value: any }>({
    mutationFn: addUserProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', workspaceId, distinctId] });
    },
  });
};

// Upload csv file
const uploadUsersCsv = async ({ workspaceId, file }: { workspaceId: string, file: File }): Promise<{ message: string }> => {
  const fileContent = await file.text();
  const response = await api.post(`/users/bulk?workspaceId=${workspaceId}`, fileContent, {
    headers: {
      'Content-Type': 'text/csv',
    },
  });
  return response.data;
};

export const useUploadUsersCsv = () => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useMutation<{ message: string }, Error, { file: File }>({
    mutationFn: (variables) => uploadUsersCsv({ ...variables, workspaceId: workspaceId! }),
    onSuccess: () => {
      toast.success('User import job has been queued.');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['users', workspaceId] });
      }, 2000);
    },
    onError: (error) => {
      const message = (error as any).response?.data?.message || error.message;
      toast.error(`Import failed: ${message}`);
    },
  });
};

// Get unique user properties for variable suggestions
const getUserProperties = async (workspaceId: string): Promise<string[]> => {
  const response = await api.get(`/users/properties`, {
    params: { workspaceId },
  });
  return response.data.properties || [];
};

export const useUserProperties = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useQuery<string[], Error>({
    queryKey: ['user-properties', workspaceId],
    queryFn: () => getUserProperties(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
};
