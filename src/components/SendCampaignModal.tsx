import React from 'react';
import { useSendCampaign } from '../hooks/useCampaigns';
import { TARGET_USER_GROUP } from '../types';
import { Button } from '@/components/ui/button';
import { Modal } from '../components/Modal';

interface SendCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: () => void;
  isSending: boolean;
  templateName: string;
}

export const SendCampaignModal: React.FC<SendCampaignModalProps> = ({ open, onOpenChange, onSend, isSending, templateName }) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Send Campaign: ${templateName}`}>
      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Target Audience
          </label>
          <select
            defaultValue={TARGET_USER_GROUP.ALL_USERS}
            disabled
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value={TARGET_USER_GROUP.ALL_USERS}>All Users in Workspace</option>
          </select>
           <p className="text-xs text-muted-foreground mt-1">
            Currently, only sending to all users is supported. More targeting options will be available soon.
          </p>
        </div>

        <div className="flex justify-end pt-4 space-x-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Campaign'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
