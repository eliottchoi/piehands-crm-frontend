import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useWorkspace } from './useWorkspace';

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
  category: string;
  settings: Record<string, any>;
}

interface TestConnectionPayload {
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
  const response = await api.get('/settings', { params: { workspaceId } });
  return response.data;
};

export const useSettings = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useQuery<WorkspaceSettings, Error>({
    queryKey: ['settings', workspaceId],
    queryFn: () => getSettings(workspaceId!),
    enabled: !!workspaceId,
  });
};

// Settings 업데이트
const updateSettings = async (payload: UpdateSettingsPayload & { workspaceId: string }) => {
  const response = await api.post('/settings', payload);
  return response.data;
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useMutation<any, Error, UpdateSettingsPayload>({
    mutationFn: (variables) => updateSettings({ ...variables, workspaceId: workspaceId! }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', workspaceId] });
      toast.success(`${variables.category} settings updated successfully!`);
    },
    onError: (error) => {
      const message = (error as any).response?.data?.message || error.message;
      toast.error(`Settings update failed: ${message}`);
    },
  });
};

// 연동 테스트
const testConnection = async (payload: TestConnectionPayload & { workspaceId: string }): Promise<TestConnectionResult> => {
  const response = await api.post('/settings/test-connection', payload);
  return response.data;
};

export const useTestConnection = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useMutation<TestConnectionResult, Error, TestConnectionPayload>({
    mutationFn: (variables) => testConnection({ ...variables, workspaceId: workspaceId! }),
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
