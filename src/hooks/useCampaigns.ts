import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import type { Campaign, TargetUserGroup } from '../types'; // Assuming Campaign type is defined in types

export interface CampaignStatus {
  campaignId: string;
  status: string;
  totalUsers: number;
  processedUsers: number;
  progress: string;
}

// DTOs should also be in shared types
type CreateCampaignDto = {
  workspaceId: string;
  name: string;
  createdBy: string;
};

// Re-using from before, but should be in its own file
// MOVED to types/index.ts

interface SendCampaignPayload {
  workspaceId: string;
  templateId: string;
  targetGroup: TargetUserGroup;
}

// Fetch all campaigns for a workspace
const getCampaigns = async (workspaceId: string): Promise<Campaign[]> => {
  const response = await apiClient.get('/campaigns', { params: { workspaceId } });
  return response.data;
};

export const useCampaigns = (workspaceId: string) => {
  return useQuery<Campaign[], Error>({
    queryKey: ['campaigns', workspaceId],
    queryFn: () => getCampaigns(workspaceId),
    enabled: !!workspaceId,
  });
};

// Create a new campaign
const createCampaign = async (campaignData: CreateCampaignDto): Promise<Campaign> => {
  const response = await apiClient.post('/campaigns', campaignData);
  return response.data;
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<Campaign, Error, CreateCampaignDto>({
    mutationFn: createCampaign,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.workspaceId] });
    },
  });
};

// Fetch a single campaign
const getCampaign = async (id: string): Promise<Campaign> => {
  const response = await apiClient.get(`/campaigns/${id}`);
  return response.data;
};

export const useCampaign = (id: string) => {
  return useQuery<Campaign, Error>({
    queryKey: ['campaign', id],
    queryFn: () => getCampaign(id),
    enabled: !!id,
  });
};

// Update a campaign (including canvasDefinition)
type UpdateCampaignDto = Partial<Omit<Campaign, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>>;

const updateCampaign = async ({ id, ...campaignData }: { id: string } & UpdateCampaignDto): Promise<Campaign> => {
  const response = await apiClient.patch(`/campaigns/${id}`, campaignData);
  return response.data;
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<Campaign, Error, { id: string } & UpdateCampaignDto>({
    mutationFn: updateCampaign,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['campaign', data.id] });
    },
  });
};

// Fetch campaign status
const getCampaignStatus = async (id: string): Promise<CampaignStatus> => {
  const response = await apiClient.get(`/campaigns/${id}/status`);
  return response.data;
};

export const useCampaignStatus = (id: string) => {
  return useQuery<CampaignStatus, Error>({
    queryKey: ['campaignStatus', id],
    queryFn: () => getCampaignStatus(id),
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

const sendCampaign = async (payload: SendCampaignPayload): Promise<{ message: string }> => {
  const { workspaceId, ...body } = payload;
  const response = await apiClient.post(`/campaigns/send?workspaceId=${workspaceId}`, body);
  return response.data;
};

export const useSendCampaign = () => {
  return useMutation<{ message: string }, Error, SendCampaignPayload>({
    mutationFn: sendCampaign,
    onSuccess: () => {
      // Potentially show a success notification to the user
      console.log('Campaign sending started successfully!');
    },
    onError: (error: Error) => {
      // Potentially show an error notification to the user
      console.error('Failed to start campaign sending:', error);
    }
  });
};
