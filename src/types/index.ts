// This is a temporary type definition file.
// In the future, this should be shared from the backend, possibly in a monorepo structure.

export const TEMPLATE_TYPE = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
} as const;

export type TemplateType = typeof TEMPLATE_TYPE[keyof typeof TEMPLATE_TYPE];

export const TEMPLATE_CONTENT_TYPE = {
  PLAIN: 'PLAIN',
  MARKDOWN: 'MARKDOWN',
  HTML: 'HTML',
} as const;

export type TemplateContentType = typeof TEMPLATE_CONTENT_TYPE[keyof typeof TEMPLATE_CONTENT_TYPE];

export interface Template {
  id: string;
  workspaceId: string;
  name: string;
  type: TemplateType;
  contentType: TemplateContentType;
  content: {
    subject?: string;
    body_html?: string;
    body_markdown?: string;
    body_text?: string;
    message?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const EMAIL_STATUS = {
  ACTIVE: 'active',
  UNSUBSCRIBED: 'unsubscribed',
  BOUNCED: 'bounced',
} as const;

export type EmailStatus = typeof EMAIL_STATUS[keyof typeof EMAIL_STATUS];


export interface User {
  id: string;
  workspaceId: string;
  distinctId: string;
  properties: Record<string, any>;
  emailStatus: EmailStatus;
  createdAt: string;
  updatedAt: string;
  events?: Event[]; // 🎯 이벤트 관계 추가
}

export interface Event {
  id: string;
  userId: string;
  name: string;
  timestamp: string;
  properties: Record<string, any> | null;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'SENDING' | 'COMPLETED' | 'INACTIVE' | 'ARCHIVED';
  priority: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  canvasDefinition?: any;
}

export const TARGET_USER_GROUP = {
  ALL_USERS: 'ALL_USERS',
} as const;

export type TargetUserGroup = typeof TARGET_USER_GROUP[keyof typeof TARGET_USER_GROUP];
