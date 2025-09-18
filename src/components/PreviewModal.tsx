import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/ui/button';
import { useUsers } from '../hooks/useUsers';
import { usePreviewTemplate } from '../hooks/useTemplates';
import type { TemplateFormValues } from './TemplateForm';

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getFormValues: () => TemplateFormValues;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ open, onOpenChange, getFormValues }) => {
  const { data, isLoading: isLoadingUsers } = useUsers('ws_piehands');
  const [selectedUserId, setSelectedUserId] = useState('');
  const previewMutation = usePreviewTemplate();

  const handlePreview = () => {
    if (!selectedUserId) {
      alert('Please select a user to preview.');
      return;
    }
    const formValues = getFormValues();
    
    // Get the correct body content based on content type
    let bodyContent = '';
    if (formValues.contentType === 'HTML' && formValues.content.body_html) {
      bodyContent = formValues.content.body_html;
    } else if (formValues.contentType === 'MARKDOWN' && formValues.content.body_markdown) {
      bodyContent = formValues.content.body_markdown;
    } else if (formValues.contentType === 'PLAIN' && formValues.content.body_text) {
      bodyContent = formValues.content.body_text;
    } else if (formValues.content.message) {
      bodyContent = formValues.content.message; // For SMS
    }
    
    console.log('🎯 Preview Request:', {
      workspaceId: 'ws_piehands',
      userId: selectedUserId,
      contentType: formValues.contentType,
      content: {
        subject: formValues.content.subject || '',
        body: bodyContent,
      }
    });
    
    previewMutation.mutate({
      workspaceId: 'ws_piehands',
      userId: selectedUserId,
      contentType: formValues.contentType,
      content: {
        subject: formValues.content.subject || '',
        body: bodyContent,
      }
    });
  };

  const allUsers = data?.pages.flatMap(page => page.users) || [];

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Preview Template">
      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Preview as User
          </label>
          <div className="flex space-x-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full flex-grow h-10 border border-input rounded-md bg-background px-3"
              disabled={isLoadingUsers}
            >
              <option value="">Select a user...</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {(user.properties as any).name || user.distinctId} ({(user.properties as any).email})
                </option>
              ))}
            </select>
            <Button onClick={handlePreview} disabled={!selectedUserId || previewMutation.isPending}>
              {previewMutation.isPending ? 'Loading...' : 'Load Preview'}
            </Button>
          </div>
        </div>

        {previewMutation.error && (
            <div className="p-4 rounded-md bg-destructive/10 text-destructive">
                Error: {previewMutation.error.message}
            </div>
        )}

        {previewMutation.data && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">{previewMutation.data.renderedSubject}</h3>
            <div className="border border-border rounded-md p-4 bg-muted">
              <iframe
                srcDoc={previewMutation.data.renderedContent}
                className="w-full h-96 border-none"
                title="Email Preview"
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
