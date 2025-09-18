import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import type { User } from '../types';
import toast from 'react-hot-toast';

// Fetch paginated users for a workspace
const getUsers = async ({ workspaceId, pageParam }: { workspaceId: string, pageParam?: string }) => {
  const response = await apiClient.get('/users', {
    params: { 
      workspaceId,
      cursor: pageParam,
      limit: 20, // Match the default limit in backend
    },
  });
  return response.data;
};

export const useUsers = (workspaceId: string, search?: string) => {
  return useInfiniteQuery<{ users: User[]; nextCursor: string | null }, Error>({
    queryKey: ['users', workspaceId, search],
    queryFn: ({ pageParam }) => {
      let url = `/users?workspaceId=${workspaceId}&limit=20`;
      if (pageParam) url += `&cursor=${pageParam}`;
      if (search?.trim()) url += `&search=${encodeURIComponent(search)}`;
      
      return apiClient.get(url).then(res => res.data);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!workspaceId,
  });
};

// Fetch a single user by internal ID
const getUser = async (workspaceId: string, id: string): Promise<User> => {
  const response = await apiClient.get(`/users/${id}`, {
    params: { workspaceId },
  });
  return response.data;
};

export const useUser = (workspaceId: string, id: string) => {
  return useQuery<User, Error>({
    queryKey: ['user', workspaceId, id],
    queryFn: () => getUser(workspaceId, id),
    enabled: !!workspaceId && !!id,
  });
};

// Update user properties
const updateUser = async ({ userId, properties }: { userId: string, properties: Record<string, any> }): Promise<User> => {
  const response = await apiClient.patch(`/users/${userId}`, { properties });
  return response.data;
};

export const useUpdateUser = (workspaceId: string, distinctId: string) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { userId: string, properties: Record<string, any> }>({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', workspaceId, distinctId] });
    },
  });
};

// Add a new property to a user
const addUserProperty = async ({ userId, key, value }: { userId: string, key: string, value: any }): Promise<User> => {
  const response = await apiClient.post(`/users/${userId}/properties`, { key, value });
  return response.data;
};

export const useAddUserProperty = (workspaceId: string, distinctId: string) => {
  const queryClient = useQueryClient();
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
  const response = await apiClient.post(`/users/bulk?workspaceId=${workspaceId}`, fileContent, {
    headers: {
      'Content-Type': 'text/csv',
    },
  });
  return response.data;
};

export const useUploadUsersCsv = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { workspaceId: string, file: File }>({
    mutationFn: uploadUsersCsv,
    onSuccess: (data, variables) => {
      toast.success(data.message || 'User import job has been queued.');
      // Give backend a moment to process before refetching
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['users', variables.workspaceId] });
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
  const response = await apiClient.get(`/users/properties`, {
    params: { workspaceId },
  });
  return response.data.properties || [];
};

export const useUserProperties = (workspaceId: string) => {
  return useQuery<string[], Error>({
    queryKey: ['user-properties', workspaceId],
    queryFn: () => getUserProperties(workspaceId),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지 (속성은 자주 바뀌지 않음)
  });
};
