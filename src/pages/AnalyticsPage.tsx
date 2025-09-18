import React from 'react';
import { useEmailOverview, useRecentEmailActivities } from '../hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Mail, 
  CheckCircle, 
  Eye, 
  MousePointer, 
  XCircle, 
  Ban,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle
} from 'lucide-react';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}> = ({ title, value, subtitle, icon, trend, color = 'primary' }) => {
  return (
    <Card variant="elevated" className="hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              color === 'success' ? 'bg-success/10 text-success' :
              color === 'warning' ? 'bg-warning/10 text-warning' :
              color === 'destructive' ? 'bg-destructive/10 text-destructive' :
              'bg-primary/10 text-primary'
            }`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className={`p-1 rounded ${
              trend === 'up' ? 'text-success bg-success/10' :
              trend === 'down' ? 'text-destructive bg-destructive/10' :
              'text-muted-foreground bg-muted/20'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const AnalyticsPage = () => {
  const workspaceId = 'ws_piehands';
  const { data: overview, isLoading: overviewLoading } = useEmailOverview(workspaceId);
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentEmailActivities(workspaceId, 100);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'email_sent':
        return <Mail className="w-4 h-4" />;
      case 'email_delivered':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'email_opened':
        return <Eye className="w-4 h-4 text-primary" />;
      case 'email_clicked':
        return <MousePointer className="w-4 h-4 text-accent" />;
      case 'email_bounced':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'email_unsubscribed':
        return <Ban className="w-4 h-4 text-warning" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'email_sent':
        return 'default';
      case 'email_delivered':
        return 'success';
      case 'email_opened':
        return 'active';
      case 'email_clicked':
        return 'accent';
      case 'email_bounced':
        return 'error';
      case 'email_unsubscribed':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace('email_', '').toUpperCase();
  };

  if (overviewLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-lg text-muted-foreground/80">
          Monitor email campaign performance and track user engagement in real-time.
        </p>
      </div>

      {/* 📊 핵심 지표 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sent"
          value={overview?.summary.totalSent || 0}
          subtitle="All emails sent"
          icon={<Mail className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Delivery Rate"
          value={overview?.summary.deliveryRate || '0%'}
          subtitle={`${overview?.summary.totalDelivered || 0} delivered`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Open Rate"
          value={overview?.summary.openRate || '0%'}
          subtitle={`${overview?.summary.totalOpened || 0} opens`}
          icon={<Eye className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Bounce Rate"
          value={overview?.summary.bounceRate || '0%'}
          subtitle={`${overview?.summary.totalBounced || 0} bounced`}
          icon={<XCircle className="w-6 h-6" />}
          color="destructive"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 📈 상세 성과 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Engagement Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Click Rate</span>
                    <span className="font-semibold">{overview?.summary.clickRate || '0%'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Open Rate</span>
                    <span className="font-semibold">{overview?.summary.openRate || '0%'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Delivery Rate</span>
                    <span className="font-semibold">{overview?.summary.deliveryRate || '0%'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {overview?.recentActivity.last24Hours || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Email events in the last 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Live Email Activity Feed</span>
              </CardTitle>
              <CardDescription>
                Real-time feed of all email events (auto-refreshes every 5 seconds)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading activities...
                </div>
              ) : recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActivities.map((activity: any) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors">
                      <div className="shrink-0">
                        {getEventIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getEventBadgeVariant(activity.type)} size="sm">
                            {formatEventType(activity.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.user.email}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No email activity yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start sending campaigns to see real-time email tracking here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span>Email Delivery Issues</span>
              </CardTitle>
              <CardDescription>
                Users with bounced emails or unsubscribed status that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overview && overview.problemUsers.length > 0 ? (
                <div className="space-y-3">
                  {overview.problemUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.name[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={user.status === 'bounced' ? 'error' : 'warning'}
                          size="sm"
                        >
                          {user.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-success/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">All good!</h3>
                  <p className="text-muted-foreground">
                    No email delivery issues detected. Your audience is healthy.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
