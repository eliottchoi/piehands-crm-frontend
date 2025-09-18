import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';

interface EmailOverview {
  summary: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalUnsubscribed: number;
    deliveryRate: string;
    openRate: string;
    clickRate: string;
    bounceRate: string;
  };
  recentActivity: {
    last24Hours: number;
    events: EmailEvent[];
  };
  problemUsers: ProblemUser[];
}

interface EmailEvent {
  id: string;
  type: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    distinctId: string;
  };
  properties: any;
}

interface ProblemUser {
  id: string;
  name: string;
  email: string;
  distinctId: string;
  status: 'bounced' | 'unsubscribed';
  lastUpdated: string;
}

interface CampaignAnalytics {
  campaignId: string;
  stats: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalUnsubscribed: number;
  };
  performance: {
    deliveryRate: string;
    openRate: string;
    clickRate: string;
    bounceRate: string;
  };
  totalEvents: number;
  logs: EmailEvent[];
}

interface UserEmailHistory {
  userId: string;
  stats: {
    totalReceived: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    engagementRate: number;
  };
  timeline: EmailEvent[];
}

// 🎯 전체 워크스페이스 이메일 분석
const getEmailOverview = async (workspaceId: string): Promise<EmailOverview> => {
  const response = await apiClient.get('/analytics/email-overview', {
    params: { workspaceId }
  });
  return response.data;
};

export const useEmailOverview = (workspaceId: string) => {
  return useQuery<EmailOverview, Error>({
    queryKey: ['email-overview', workspaceId],
    queryFn: () => getEmailOverview(workspaceId),
    enabled: !!workspaceId,
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });
};

// 🎯 특정 캠페인 분석
const getCampaignAnalytics = async (campaignId: string): Promise<CampaignAnalytics> => {
  const response = await apiClient.get(`/analytics/campaigns/${campaignId}`);
  return response.data;
};

export const useCampaignAnalytics = (campaignId: string) => {
  return useQuery<CampaignAnalytics, Error>({
    queryKey: ['campaign-analytics', campaignId],
    queryFn: () => getCampaignAnalytics(campaignId),
    enabled: !!campaignId,
    refetchInterval: 10000, // 10초마다 자동 새로고침
  });
};

// 🎯 특정 사용자 이메일 히스토리  
const getUserEmailHistory = async (userId: string): Promise<UserEmailHistory> => {
  const response = await apiClient.get(`/analytics/users/${userId}/email-history`);
  return response.data;
};

export const useUserEmailHistory = (userId: string) => {
  return useQuery<UserEmailHistory, Error>({
    queryKey: ['user-email-history', userId],
    queryFn: () => getUserEmailHistory(userId),
    enabled: !!userId,
  });
};

// 🎯 실시간 이메일 활동 피드
const getRecentActivities = async (workspaceId: string, limit: number = 50) => {
  const response = await apiClient.get('/analytics/recent-activities', {
    params: { workspaceId, limit }
  });
  return response.data;
};

export const useRecentEmailActivities = (workspaceId: string, limit: number = 50) => {
  return useQuery<EmailEvent[], Error>({
    queryKey: ['recent-email-activities', workspaceId, limit],
    queryFn: () => getRecentActivities(workspaceId, limit),
    enabled: !!workspaceId,
    refetchInterval: 5000, // 5초마다 자동 새로고침 (실시간 피드)
  });
};
