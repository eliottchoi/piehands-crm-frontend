import React, { useState } from 'react';
import { useSettings, useUpdateSettings, useTestConnection } from '../hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Send, Check, AlertCircle, Zap, MessageSquare, BarChart3 } from 'lucide-react';

export const SettingsPage = () => {
  const workspaceId = 'ws_piehands'; // TODO: 실제 워크스페이스 ID 가져오기
  
  const { data: settings, isLoading } = useSettings(workspaceId);
  const updateSettingsMutation = useUpdateSettings();
  const testConnectionMutation = useTestConnection();

  // SendGrid 설정 상태
  const [sendGridSettings, setSendGridSettings] = useState({
    api_key: '',
    from_email: '',
    from_name: '',
  });

  // Slack 설정 상태
  const [slackSettings, setSlackSettings] = useState({
    webhook_url: '',
  });

  // 설정 로드 시 상태 업데이트
  React.useEffect(() => {
    if (settings) {
      setSendGridSettings({
        api_key: settings.sendgrid.api_key || '',
        from_email: settings.sendgrid.from_email || '',
        from_name: settings.sendgrid.from_name || '',
      });
      setSlackSettings({
        webhook_url: settings.slack.webhook_url || '',
      });
    }
  }, [settings]);

  // SendGrid 설정 저장
  const handleSaveSendGrid = () => {
    updateSettingsMutation.mutate({
      workspaceId,
      category: 'sendgrid',
      settings: sendGridSettings,
    });
  };

  // SendGrid 연결 테스트
  const handleTestSendGrid = () => {
    testConnectionMutation.mutate({
      workspaceId,
      category: 'sendgrid',
      credentials: sendGridSettings,
    });
  };

  // Slack 설정 저장
  const handleSaveSlack = () => {
    updateSettingsMutation.mutate({
      workspaceId,
      category: 'slack',
      settings: slackSettings,
    });
  };

  // Slack 연결 테스트
  const handleTestSlack = () => {
    testConnectionMutation.mutate({
      workspaceId,
      category: 'slack',
      credentials: slackSettings,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-lg text-muted-foreground/80">
          Configure your workspace and manage integrations with external services.
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Workspace Information</CardTitle>
              <CardDescription>
                Manage your workspace name and basic settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Workspace Name"
                value="Piehands Marketing Team"
                disabled
                hint="Workspace name management coming soon"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* 🎯 SendGrid Integration */}
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>SendGrid</span>
                      {settings?.sendgrid?.api_key && (
                        <Badge variant="success" size="sm">Connected</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Email delivery service for campaigns and notifications
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="API Key"
                  value={sendGridSettings.api_key}
                  onChange={(e) => setSendGridSettings(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="SG.xxxxxxxxxxxxxxxx"
                  type="password"
                  hint="Your SendGrid API key (starts with SG.)"
                />
                <Input
                  label="From Email"
                  value={sendGridSettings.from_email}
                  onChange={(e) => setSendGridSettings(prev => ({ ...prev, from_email: e.target.value }))}
                  placeholder="noreply@yourdomain.com"
                  hint="Verified sender email address"
                />
              </div>
              <Input
                label="From Name"
                value={sendGridSettings.from_name}
                onChange={(e) => setSendGridSettings(prev => ({ ...prev, from_name: e.target.value }))}
                placeholder="Your Company Name"
                hint="Display name for outgoing emails"
              />
              <div className="flex space-x-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleTestSendGrid}
                  disabled={!sendGridSettings.api_key || testConnectionMutation.isPending}
                >
                  {testConnectionMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                <Button 
                  onClick={handleSaveSendGrid}
                  disabled={!sendGridSettings.api_key || updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 🎯 Slack Integration */}
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Slack</span>
                      {settings?.slack?.webhook_url && (
                        <Badge variant="success" size="sm">Connected</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Real-time notifications for campaign events
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Webhook URL"
                value={slackSettings.webhook_url}
                onChange={(e) => setSlackSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
                placeholder="https://hooks.slack.com/services/..."
                hint="Incoming webhook URL from your Slack app"
              />
              <div className="flex space-x-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleTestSlack}
                  disabled={!slackSettings.webhook_url || testConnectionMutation.isPending}
                >
                  {testConnectionMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                <Button 
                  onClick={handleSaveSlack}
                  disabled={!slackSettings.webhook_url || updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 🎯 Coming Soon Integrations */}
          <Card variant="outline" className="opacity-60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Mixpanel & Others</span>
                      <Badge variant="ghost" size="sm">Coming Soon</Badge>
                    </CardTitle>
                    <CardDescription>
                      Advanced analytics and more integrations
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
