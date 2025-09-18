import { useState } from 'react';
import { useTemplates, useCreateTemplate, useDeleteTemplate, useUpdateTemplate } from '../hooks/useTemplates';
import { useSendCampaign } from '../hooks/useCampaigns';
import { TARGET_USER_GROUP } from '../types';
import type { Template } from '../types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import { TemplateForm } from '@/components/TemplateForm';
import { SendCampaignModal } from '@/components/SendCampaignModal';
import { SubmitHandler } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Trash2, Send, Mail } from 'lucide-react';

export const TemplatesPage = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Partial<Template> | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedTemplateForSend, setSelectedTemplateForSend] = useState<Template | null>(null);

  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();
  const sendCampaignMutation = useSendCampaign();

  const handleFormSubmit: SubmitHandler<any> = (data) => {
    const mutation = selectedTemplate && 'id' in selectedTemplate ? updateMutation : createMutation;
    const finalData = selectedTemplate && 'id' in selectedTemplate ? { ...selectedTemplate, ...data } : { ...data, workspaceId: 'ws_piehands', createdBy: 'admin' };
    
    mutation.mutate(finalData, {
      onSuccess: () => {
        setIsFormModalOpen(false);
      },
    });
  };

  const handleCreateClick = () => {
    setSelectedTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (template: Template) => {
    setSelectedTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleSendClick = (template: Template) => {
    setSelectedTemplateForSend(template);
    setIsSendModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSendCampaign = (templateId: string) => {
    sendCampaignMutation.mutate({
      workspaceId: 'ws_piehands',
      templateId,
      targetGroup: TARGET_USER_GROUP.ALL_USERS,
    }, {
      onSuccess: () => setIsSendModalOpen(false),
    });
  };
  
  const { data: templates, isLoading, error } = useTemplates('ws_piehands');
  
  if (isLoading) return <div className="p-8">Loading templates...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Templates</h1>
          <p className="text-lg text-muted-foreground/80">
            Create and manage reusable email and SMS templates for your campaigns.
          </p>
        </div>
        <Button size="lg" onClick={handleCreateClick} className="shrink-0">
          <PlusCircle className="w-5 h-5 mr-2" />
          Create Template
        </Button>
      </div>

      {templates && templates.length === 0 ? (
        <Card variant="gradient" className="text-center p-12">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-12 h-12 text-primary/60" />
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">No templates yet</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">
              Templates help you create consistent, professional communications. Start by creating your first template.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button size="lg" onClick={handleCreateClick} className="mt-4">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template: Template) => (
            <Card key={template.id} variant="elevated" interactive className="group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-1">
                    {template.name}
                  </CardTitle>
                  <Badge 
                    variant={template.type === 'EMAIL' ? 'default' : 'secondary'}
                    size="sm"
                  >
                    {template.type}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center space-x-1 text-xs">
                    <span>Updated</span>
                    <span>{new Date(template.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.content.subject && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                      <p className="text-sm text-foreground/80 line-clamp-1">
                        {template.content.subject}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Content Preview</p>
                    <p className="text-sm text-foreground/70 line-clamp-2">
                      {template.content.body_text || template.content.message || 'No preview available'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4 border-t border-border/20">
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditClick(template)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleSendClick(template)}>
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(template.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        title={selectedTemplate && 'id' in selectedTemplate ? 'Edit Template' : 'Create New Template'}
        onCancel={() => setIsFormModalOpen(false)}
        onSubmit={() => {
          // TemplateForm에서 제출 버튼을 트리거하는 방법을 찾아야 합니다
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
          }
        }}
      >
        <TemplateForm
          onOpenChange={setIsFormModalOpen}
          onSubmit={handleFormSubmit}
          defaultValues={selectedTemplate || {}}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {selectedTemplateForSend && (
        <SendCampaignModal
          open={isSendModalOpen}
          onOpenChange={setIsSendModalOpen}
          templateName={selectedTemplateForSend.name}
          onSend={() => handleSendCampaign(selectedTemplateForSend.id)}
          isSending={sendCampaignMutation.isPending}
        />
      )}
    </div>
  );
};
