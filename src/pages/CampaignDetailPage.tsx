import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCampaign, useUpdateCampaign, useCampaignStatus } from '../hooks/useCampaigns';
import { useCampaignAnalytics } from '../hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImmediateTriggerNode } from '../components/canvas/nodes/ImmediateTriggerNode';
import { EmailSendNode } from '../components/canvas/nodes/EmailSendNode';
import { Sidebar } from '../components/canvas/Sidebar';
import { SettingsPanel } from '../components/canvas/SettingsPanel';
import { Save, Play, Loader2, BarChart3, Mail, Eye, MousePointer, XCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const nodeTypes = {
  IMMEDIATE: ImmediateTriggerNode,
  EMAIL_SEND: EmailSendNode,
};

export const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { data: campaign, isLoading, error } = useCampaign(id!);
  const { data: campaignStatus, isLoading: isStatusLoading } = useCampaignStatus(id!);
  const { data: analytics, isLoading: analyticsLoading } = useCampaignAnalytics(id!);
  const updateCampaignMutation = useUpdateCampaign();
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (campaign?.canvasDefinition) {
      const { nodes: initialNodes, edges: initialEdges } = campaign.canvasDefinition;
      setNodes(initialNodes || []);
      setEdges(initialEdges || []);
    }
  }, [campaign, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodeDataChange = (nodeId: string, newData: any) => {
    setNodes((nds: Node[]) =>
      nds.map((node: Node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
    );
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };
      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const handleSaveChanges = () => {
    updateCampaignMutation.mutate({ 
      id: id!, 
      canvasDefinition: { nodes, edges }
    });
  };

  const handleActivateCampaign = () => {
    if (window.confirm('Are you sure you want to activate this campaign?')) {
      updateCampaignMutation.mutate(
        { id: id!, status: 'ACTIVE' },
        { onSuccess: () => navigate('/campaigns') }
      );
    }
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="p-8 text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* 🎯 헤더 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight">{campaign?.name}</h1>
          <Badge variant={campaign?.status === 'ACTIVE' ? 'active' : 'inactive'}>
            {campaign?.status}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSaveChanges} disabled={updateCampaignMutation.isPending}>
            {updateCampaignMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
          <Button onClick={handleActivateCampaign} disabled={campaign?.status !== 'DRAFT' || updateCampaignMutation.isPending}>
            <Play className="w-4 h-4 mr-2" />
            Activate
          </Button>
        </div>
      </div>

      {/* 🎯 발송 진행 상황 */}
      {campaign?.status === 'SENDING' && campaignStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Progress</CardTitle>
            <CardDescription>Real-time sending status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {campaignStatus.processedUsers} / {campaignStatus.totalUsers} users
              </span>
              <span className="text-lg font-bold">{campaignStatus.progress}%</span>
            </div>
            <Progress value={parseFloat(campaignStatus.progress)} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* 🎯 탭 구조 */}
      <Tabs defaultValue="canvas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="canvas">Canvas Editor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="canvas" className="space-y-6">
          <div className="h-[calc(100vh-300px)]" ref={reactFlowWrapper}>
            <div className="flex h-full">
              <Sidebar />
              <div className="flex-grow relative rounded-md border bg-card">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  onPaneClick={onPaneClick}
                  nodeTypes={nodeTypes}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  fitView
                  // 🎯 Figma 스타일 터치패드 제스처 설정
                  panOnScroll={true}                    // 스크롤로 팬 가능
                  panOnScrollSpeed={0.8}                // 팬 속도 (0.5 = 느림, 2 = 빠름)
                  zoomOnScroll={true}                   // 줌 기능 유지
                  zoomOnPinch={true}                    // 핀치 줌 지원
                  panOnDrag={[1, 2]}                    // 마우스 좌클릭 또는 우클릭으로 드래그 가능
                  selectionOnDrag={false}               // 드래그로 선택 영역 생성 방지 (팬과 충돌)
                  preventScrolling={false}              // 브라우저 스크롤과 상호작용 허용
                  zoomOnDoubleClick={true}              // 더블클릭으로 줌 인/아웃
                  minZoom={0.1}                         // 최소 줌 레벨
                  maxZoom={4}                           // 최대 줌 레벨
                  attributionPosition="bottom-left"     // 작은 로고 위치
                >
                  <Controls 
                    position="top-left" 
                    showZoom={true}
                    showFitView={true}
                    showInteractive={true}
                    className="glass-card shadow-lg"
                  />
                  <MiniMap 
                    position="bottom-right"
                    className="glass-card shadow-lg rounded-lg border border-card-border/30"
                    nodeColor="#4A90E2"
                    nodeStrokeColor="#2563EB"
                    nodeStrokeWidth={2}
                    maskColor="rgba(0, 0, 0, 0.05)"
                  />
                  <Background 
                    gap={20} 
                    size={1.5} 
                    color="#E0E0E6"
                    className="opacity-30"
                  />
                </ReactFlow>
                
                {/* 🎯 Figma 스타일 키보드 단축키 힌트 */}
                <div className="absolute bottom-4 left-4 glass-card px-3 py-2 rounded-lg text-xs text-muted-foreground space-y-1 max-w-sm">
                  <div className="font-medium text-foreground mb-2">Navigation Tips</div>
                  <div className="flex items-center justify-between">
                    <span>Pan canvas:</span>
                    <span className="font-mono bg-muted/30 px-1.5 py-0.5 rounded">Two-finger scroll</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Zoom:</span>
                    <span className="font-mono bg-muted/30 px-1.5 py-0.5 rounded">⌘ + scroll</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fit view:</span>
                    <span className="font-mono bg-muted/30 px-1.5 py-0.5 rounded">Double-click</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Drag canvas:</span>
                    <span className="font-mono bg-muted/30 px-1.5 py-0.5 rounded">Right-click drag</span>
                  </div>
                </div>

                <SettingsPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} onNodeDataChange={onNodeDataChange} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* 🎯 캠페인 분석 대시보드 */}
          {analyticsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse-soft" />
                <p className="text-muted-foreground">Loading campaign analytics...</p>
              </div>
            </div>
          ) : analytics && analytics.totalEvents > 0 ? (
            <>
              {/* 📊 성과 지표 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="elevated">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.stats.totalSent}</p>
                        <p className="text-xs text-muted-foreground">Emails Sent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="elevated">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-success" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.performance.deliveryRate}</p>
                        <p className="text-xs text-muted-foreground">Delivery Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="elevated">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.performance.openRate}</p>
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="elevated">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <MousePointer className="w-8 h-8 text-accent" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.performance.clickRate}</p>
                        <p className="text-xs text-muted-foreground">Click Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 📋 상세 로그 테이블 */}
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Campaign Email Logs</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed log of all email events for this campaign
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analytics.logs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="shrink-0">
                            {log.type === 'email_sent' && <Mail className="w-4 h-4 text-primary" />}
                            {log.type === 'email_delivered' && <CheckCircle className="w-4 h-4 text-success" />}
                            {log.type === 'email_opened' && <Eye className="w-4 h-4 text-primary" />}
                            {log.type === 'email_clicked' && <MousePointer className="w-4 h-4 text-accent" />}
                            {log.type === 'email_bounced' && <XCircle className="w-4 h-4 text-destructive" />}
                          </div>
                          <div>
                            <p className="font-medium">{log.user.name || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">{log.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={log.type === 'email_bounced' ? 'error' : 'success'} size="sm">
                            {log.type.replace('email_', '').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-muted-foreground/40 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3">No analytics data yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Activate this campaign and start sending emails to see detailed analytics and logs here.
              </p>
              {campaign?.status === 'DRAFT' && (
                <Button onClick={handleActivateCampaign}>
                  <Play className="w-4 h-4 mr-2" />
                  Activate Campaign
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
