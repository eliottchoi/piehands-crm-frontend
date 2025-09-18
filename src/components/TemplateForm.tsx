import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Modal } from './Modal';
import { VariableAutocomplete } from './VariableAutocomplete';
import { TEMPLATE_TYPE, TEMPLATE_CONTENT_TYPE } from '../types';
import type { TemplateContentType } from '../types';
import { PreviewModal } from './PreviewModal';
import { useState } from 'react';

const templateSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  type: z.nativeEnum(TEMPLATE_TYPE),
  contentType: z.nativeEnum(TEMPLATE_CONTENT_TYPE),
  content: z.object({
    subject: z.string().optional(),
    body_html: z.string().optional(),
    body_markdown: z.string().optional(),
    body_text: z.string().optional(),
    message: z.string().optional(),
  }),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  onOpenChange: (open: boolean) => void;
  onSubmit: SubmitHandler<TemplateFormValues>;
  defaultValues?: Partial<TemplateFormValues>;
  isSubmitting: boolean;
}

const defaultHtmlBody = `<html>
  <head></head>
  <body>
    
  </body>
</html>`;

export const TemplateForm: React.FC<TemplateFormProps> = ({ onOpenChange, onSubmit, defaultValues, isSubmitting }) => {
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      ...defaultValues,
      contentType: defaultValues?.contentType || TEMPLATE_CONTENT_TYPE.HTML,
    }
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const templateType = watch('type');
  const contentType = watch('contentType');

  const handleContentTypeChange = (newContentType: TemplateContentType) => {
    if (watch('content.body_html') || watch('content.body_markdown') || watch('content.body_text')) {
      if (window.confirm('Changing the content type will clear the current body. Are you sure?')) {
        setValue('content', {
          ...watch('content'),
          body_html: newContentType === TEMPLATE_CONTENT_TYPE.HTML ? defaultHtmlBody : '',
          body_markdown: '',
          body_text: '',
        });
        setValue('contentType', newContentType);
      }
    } else {
        if (newContentType === TEMPLATE_CONTENT_TYPE.HTML) {
            setValue('content.body_html', defaultHtmlBody);
        }
        setValue('contentType', newContentType);
    }
  };

  return (
    <Modal open={true} onOpenChange={onOpenChange} title={defaultValues?.name ? 'Edit Template' : 'Create New Template'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="templateName">Template Name</Label>
          <Input id="templateName" {...register('name')} placeholder="My First Template" />
          {errors.name?.message && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Template Type</label>
          <select
            {...register('type')}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value={TEMPLATE_TYPE.EMAIL}>Email</option>
            <option value={TEMPLATE_TYPE.SMS}>SMS</option>
          </select>
        </div>

        {templateType === TEMPLATE_TYPE.EMAIL && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Content Type</label>
              <div className="flex space-x-4">
                {(Object.keys(TEMPLATE_CONTENT_TYPE) as Array<keyof typeof TEMPLATE_CONTENT_TYPE>).map((key) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="radio"
                      {...register('contentType')}
                      value={TEMPLATE_CONTENT_TYPE[key]}
                      onChange={() => handleContentTypeChange(TEMPLATE_CONTENT_TYPE[key])}
                      className="form-radio"
                    />
                    <span className="ml-2">{TEMPLATE_CONTENT_TYPE[key]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="emailSubject">Email Subject</Label>
              <VariableAutocomplete workspaceId="ws_piehands">
                <textarea
                  id="emailSubject"
                  placeholder="Subject line (try typing {{)"
                  className="modern-input h-11 resize-none"
                  {...register('content.subject')}
                />
              </VariableAutocomplete>
              {errors.content?.subject?.message && (
                <p className="text-xs text-destructive mt-1">{errors.content.subject.message}</p>
              )}
            </div>
            
            {contentType === TEMPLATE_CONTENT_TYPE.HTML && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  HTML Body
                  <span className="text-xs text-muted-foreground ml-2">💡 Type &#123;&#123; to insert variables</span>
                </label>
                <VariableAutocomplete workspaceId="ws_piehands">
                  <textarea
                    placeholder="<html><body>Hello {{user.name}}!</body></html>"
                    className="modern-input font-mono"
                    style={{ minHeight: '200px' }}
                    {...register('content.body_html')}
                  />
                </VariableAutocomplete>
              </div>
            )}
            {contentType === TEMPLATE_CONTENT_TYPE.MARKDOWN && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Markdown Body
                  <span className="text-xs text-muted-foreground ml-2">💡 Type &#123;&#123; to insert variables</span>
                </label>
                <VariableAutocomplete workspaceId="ws_piehands">
                  <textarea
                    placeholder="# Hello {{user.name}}!&#10;&#10;Welcome to our platform..."
                    className="modern-input"
                    style={{ minHeight: '200px' }}
                    {...register('content.body_markdown')}
                  />
                </VariableAutocomplete>
              </div>
            )}
            {contentType === TEMPLATE_CONTENT_TYPE.PLAIN && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Plain Text Body
                  <span className="text-xs text-muted-foreground ml-2">💡 Type &#123;&#123; to insert variables</span>
                </label>
                <VariableAutocomplete workspaceId="ws_piehands">
                  <textarea
                    placeholder="Hello {{user.name}}! Welcome to our platform..."
                    className="modern-input"
                    style={{ minHeight: '200px' }}
                    {...register('content.body_text')}
                  />
                </VariableAutocomplete>
              </div>
            )}
          </>
        )}

        {templateType === TEMPLATE_TYPE.SMS && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              SMS Message
              <span className="text-xs text-muted-foreground ml-2">💡 Type {'{{'} to insert variables</span>
            </label>
            <VariableAutocomplete workspaceId="ws_piehands">
              <textarea
                placeholder="Hi {{user.name}}! Your order is ready for pickup."
                className="modern-input"
                style={{ minHeight: '120px' }}
                {...register('content.message')}
              />
            </VariableAutocomplete>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsPreviewOpen(true)}>
            Preview
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </form>
      <PreviewModal 
        open={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen}
        getFormValues={getValues}
      />
    </Modal>
  );
};
