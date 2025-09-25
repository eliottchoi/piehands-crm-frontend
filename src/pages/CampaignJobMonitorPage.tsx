import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RefreshCw, Monitor, Clock, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useWorkspace } from '../hooks/useWorkspace';

interface CampaignJobStatus {
  id: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalUsers: number;
  processedUsers: number;
  successCount: number;
  failureCount: number;
  currentBatch: number;
  startedAt?: string;
  lastProcessedAt?: string;
  estimatedCompletion?: string;
  warmupDay?: number;
  dailyLimitReached?: boolean;
  progressPercentage?: number;
  emailsPerHour?: number;
  successRate?: number;
  remainingUsers?: number;
}

interface WarmupStatus {
  currentDay: number;
  isComplete: boolean;
  todaysSentCount: number;
  todaysLimit: number;
  remainingToday: number;
  canSendMore: boolean;
  schedule: Array<{ day: number; maxEmails: number }>;
}

export const CampaignJobMonitorPage: React.FC = () => {
  const [jobs, setJobs] = useState<CampaignJobStatus[]>([]);
  const [warmupStatus, setWarmupStatus] = useState<WarmupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const refreshData = useCallback(async () => {
    if (!currentWorkspace) return;

    try {
      setRefreshing(true);
      const workspaceId = currentWorkspace.id;

      // 캠페인 작업 목록 조회
      const jobsResponse = await api.get(`/campaign-jobs?workspaceId=${workspaceId}`);
      const jobsData = jobsResponse.data;

      if (jobsData.success) {
        // 각 작업의 상세 진행 상황 조회
        const detailedJobs = await Promise.all(
          jobsData.data.map(async (job: any) => {
            try {
              const progressResponse = await api.get(`/campaign-jobs/${job.id}/progress`);
              const progressData = progressResponse.data;
              return progressData.success ? progressData.data : job;
            } catch (error) {
              return job;
            }
          })
        );
        setJobs(detailedJobs);
      }

      // Warm-up 상태 조회
      const warmupResponse = await api.get(`/campaign-jobs/warmup/${workspaceId}/status`);
      const warmupData = warmupResponse.data;
      if (warmupData.success) {
        setWarmupStatus(warmupData.data);
      }

    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentWorkspace]);

  // 🎯 실시간 새로고침 (5초마다)
  useEffect(() => {
    if (currentWorkspace) {
      const interval = setInterval(() => {
        refreshData();
      }, 5000);

      refreshData(); // 초기 로드

      return () => clearInterval(interval);
    }
  }, [currentWorkspace, refreshData]);

  const handleJobControl = async (jobId: string, action: 'pause' | 'resume') => {
    try {
      const response = await api.put(`/campaign-jobs/${jobId}/control`, { action });
      const data = response.data;

      if (data.success) {
        // Success - refresh data
        refreshData();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Error controlling job:', error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500 bg-green-100';
      case 'paused': return 'text-yellow-500 bg-yellow-100';
      case 'completed': return 'text-blue-500 bg-blue-100';
      case 'failed': return 'text-red-500 bg-red-100';
      case 'cancelled': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime?: string) => {
    if (!startTime) return '-';
    const elapsed = Date.now() - new Date(startTime).getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Monitor className="w-8 h-8" />
            Campaign Monitor
          </h1>
          <p className="text-gray-600 mt-1">실시간 이메일 발송 모니터링</p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          새로고침
        </button>
      </div>

      {/* IP Warm-up 상태 */}
      {warmupStatus && (
        <div className="glass-card p-6 rounded-xl border border-white/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔥 IP Warm-up Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {warmupStatus.currentDay}/10
              </div>
              <div className="text-sm text-gray-600">Current Day</div>
              <div className="text-xs text-gray-500">
                {warmupStatus.isComplete ? 'Warm-up Complete' : 'In Progress'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {warmupStatus.todaysSentCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Today's Sent</div>
              <div className="text-xs text-gray-500">
                of {warmupStatus.todaysLimit.toLocaleString()} limit
              </div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                warmupStatus.canSendMore ? "text-green-600" : "text-red-600"
              )}>
                {warmupStatus.remainingToday.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Remaining Today</div>
              <div className="text-xs text-gray-500">
                {warmupStatus.canSendMore ? 'Can send more' : 'Daily limit reached'}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (warmupStatus.todaysSentCount / warmupStatus.todaysLimit) * 100)}%`
              }}
            ></div>
          </div>
        </div>
      )}

      {/* 실행 중인 작업들 */}
      {jobs.filter(job => job.status === 'running' || job.status === 'paused').length > 0 && (
        <div className="glass-card p-6 rounded-xl border border-white/20">
          <h2 className="text-xl font-semibold mb-4">🚀 Active Jobs</h2>
          <div className="space-y-4">
            {jobs.filter(job => job.status === 'running' || job.status === 'paused').map(job => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(job.status))}>
                      {job.status.toUpperCase()}
                    </span>
                    <span className="font-semibold">Job {job.id.slice(-8)}</span>
                    {job.dailyLimitReached && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs">
                        Daily Limit Reached
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {job.status === 'running' && (
                      <button
                        onClick={() => handleJobControl(job.id, 'pause')}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                      >
                        <Pause className="w-3 h-3" />
                        Pause
                      </button>
                    )}
                    {job.status === 'paused' && (
                      <button
                        onClick={() => handleJobControl(job.id, 'resume')}
                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        <Play className="w-3 h-3" />
                        Resume
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{job.progressPercentage || 0}%</div>
                    <div className="text-xs text-gray-500">Progress</div>
                    <div className="text-xs text-gray-400">
                      {job.processedUsers.toLocaleString()} / {job.totalUsers.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{job.successRate || 0}%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                    <div className="text-xs text-gray-400">
                      {job.successCount.toLocaleString()} sent
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{job.failureCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Failures</div>
                    <div className="text-xs text-gray-400">errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{job.emailsPerHour || 0}</div>
                    <div className="text-xs text-gray-500">Speed</div>
                    <div className="text-xs text-gray-400">emails/hour</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${job.progressPercentage || 0}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-600">
                  <span>Started: {formatDateTime(job.startedAt)}</span>
                  <span>Duration: {formatDuration(job.startedAt)}</span>
                  <span>ETA: {formatDateTime(job.estimatedCompletion)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 작업 히스토리 */}
      <div className="glass-card p-6 rounded-xl border border-white/20">
        <h2 className="text-xl font-semibold mb-4">📋 Recent Jobs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Job ID</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Progress</th>
                <th className="text-left py-2">Success Rate</th>
                <th className="text-left py-2">Started At</th>
                <th className="text-left py-2">Duration</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.slice(0, 10).map(job => (
                <tr key={job.id} className="border-b border-gray-100">
                  <td className="py-2 font-mono">{job.id.slice(-8)}</td>
                  <td className="py-2">
                    <span className={cn("px-2 py-1 rounded-full text-xs", getStatusColor(job.status))}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-2">
                    <div>{job.progressPercentage || 0}%</div>
                    <div className="text-xs text-gray-500">
                      {job.processedUsers}/{job.totalUsers}
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="text-green-600">{job.successRate || 0}%</div>
                    <div className="text-xs text-gray-500">
                      {job.failureCount} fails
                    </div>
                  </td>
                  <td className="py-2">{formatDateTime(job.startedAt)}</td>
                  <td className="py-2">{formatDuration(job.startedAt)}</td>
                  <td className="py-2">
                    {job.status === 'paused' && (
                      <button
                        onClick={() => handleJobControl(job.id, 'resume')}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        Resume
                      </button>
                    )}
                    {job.status === 'running' && (
                      <button
                        onClick={() => handleJobControl(job.id, 'pause')}
                        className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                      >
                        Pause
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 정보 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Real-time Monitoring Active</h3>
            <div className="mt-1 text-sm text-blue-700">
              데이터는 5초마다 자동으로 새로고침됩니다.
              SendGrid API 상태 및 상세 분석 기능이 곧 추가될 예정입니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};