import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import toast from 'react-hot-toast';

interface WorkspaceSettings {
  sendgrid: {
    api_key?: string;
    from_email?: string;
    from_name?: string;
  };
  slack: {
    webhook_url?: string;
  };
  mixpanel: {
    project_token?: string;
  };
}

interface UpdateSettingsPayload {
  workspaceId: string;
  category: string;
  settings: Record<string, any>;
}

interface TestConnectionPayload {
  workspaceId: string;
  category: string;
  credentials: Record<string, string>;
}

interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

// Settings 조회
const getSettings = async (workspaceId: string): Promise<WorkspaceSettings> => {
  const response = await apiClient.get('/settings', { params: { workspaceId } });
  return response.data;
};

export const useSettings = (workspaceId: string) => {
  return useQuery<WorkspaceSettings, Error>({
    queryKey: ['settings', workspaceId],
    queryFn: () => getSettings(workspaceId),
    enabled: !!workspaceId,
  });
};

// Settings 업데이트
const updateSettings = async (payload: UpdateSettingsPayload) => {
  const response = await apiClient.post('/settings', payload);
  return response.data;
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, UpdateSettingsPayload>({
    mutationFn: updateSettings,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', variables.workspaceId] });
      toast.success(`${variables.category} settings updated successfully!`);
    },
    onError: (error) => {
      const message = (error as any).response?.data?.message || error.message;
      toast.error(`Settings update failed: ${message}`);
    },
  });
};

// 연동 테스트
const testConnection = async (payload: TestConnectionPayload): Promise<TestConnectionResult> => {
  const response = await apiClient.post('/settings/test-connection', payload);
  return response.data;
};

export const useTestConnection = () => {
  return useMutation<TestConnectionResult, Error, TestConnectionPayload>({
    mutationFn: testConnection,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      const message = (error as any).response?.data?.message || error.message;
      toast.error(`Connection test failed: ${message}`);
    },
  });
};
