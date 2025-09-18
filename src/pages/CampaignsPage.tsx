import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns, useCreateCampaign } from '../hooks/useCampaigns';
import type { Campaign } from '../types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Loader2, Megaphone } from 'lucide-react';

export const CampaignsPage = () => {
  const navigate = useNavigate();
  const { data: campaigns, isLoading, error } = useCampaigns('ws_piehands');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const createCampaignMutation = useCreateCampaign();

  const handleCreateCampaign = () => {
    createCampaignMutation.mutate(
      { workspaceId: 'ws_piehands', name: newCampaignName, createdBy: 'admin' },
      {
        onSuccess: (data) => {
          setIsCreateModalOpen(false);
          setNewCampaignName('');
          navigate(`/campaigns/${data.id}`);
        },
      }
    );
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="p-8 text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-lg text-muted-foreground/80">
            Create, manage, and track your marketing campaigns with powerful automation.
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shrink-0">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Create New Campaign
              </DialogTitle>
              <DialogDescription>
                Give your new campaign a name to get started. You can change this later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Q4 Holiday Promotion"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCampaign();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <div className="flex justify-between items-center w-full">
                <div className="flex text-xs text-muted-foreground/60 gap-4">
                  <span>💡 <kbd className="px-1.5 py-0.5 bg-muted/30 rounded text-xs">Enter</kbd> to create</span>
                  <span><kbd className="px-1.5 py-0.5 bg-muted/30 rounded text-xs">Esc</kbd> to close</span>
                </div>
                <Button 
                  onClick={handleCreateCampaign} 
                  disabled={createCampaignMutation.isPending || !newCampaignName.trim()}
                  className="ml-auto"
                >
                  {createCampaignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Campaign
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card variant="default" className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns?.map((campaign: Campaign) => (
              <TableRow 
                key={campaign.id} 
                className="cursor-pointer group"
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              >
                <TableCell>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {campaign.name}
                  </div>
                  {campaign.description && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {campaign.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {campaign.status === 'ACTIVE' && (
                    <Badge variant="active" dot>ACTIVE</Badge>
                  )}
                  {campaign.status === 'COMPLETED' && (
                    <Badge variant="success">COMPLETED</Badge>
                  )}
                  {campaign.status === 'SENDING' && (
                    <Badge variant="pending" dot>SENDING</Badge>
                  )}
                  {campaign.status === 'DRAFT' && (
                    <Badge variant="inactive">DRAFT</Badge>
                  )}
                  {campaign.status === 'INACTIVE' && (
                    <Badge variant="outline">INACTIVE</Badge>
                  )}
                  {campaign.status === 'ARCHIVED' && (
                    <Badge variant="ghost">ARCHIVED</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="text-sm">
                    {new Date(campaign.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(campaign.updatedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {campaigns && campaigns.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-4">
              <Megaphone className="w-12 h-12 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Get started by creating your first marketing campaign to reach your audience.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
