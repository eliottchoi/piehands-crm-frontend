import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import type { Template } from '../types';

type CreateTemplateDto = Omit<Template, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTemplateDto = Partial<CreateTemplateDto>;

const getTemplates = async (workspaceId: string): Promise<Template[]> => {
  const { data } = await apiClient.get('/templates', {
    params: { workspaceId },
  });
  return data;
};

export const useTemplates = (workspaceId: string) => {
  return useQuery<Template[], Error>({
    queryKey: ['templates', workspaceId],
    queryFn: () => getTemplates(workspaceId),
    enabled: !!workspaceId,
  });
};

const createTemplate = async (templateData: CreateTemplateDto): Promise<Template> => {
  const { data } = await apiClient.post('/templates', templateData);
  return data;
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<Template, Error, CreateTemplateDto>({
    mutationFn: createTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates', data.workspaceId] });
    },
  });
};

const updateTemplate = async ({ id, ...templateData }: {id: string} & UpdateTemplateDto): Promise<Template> => {
    const { data } = await apiClient.patch(`/templates/${id}`, templateData);
    return data;
};

export const useUpdateTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation<Template, Error, { id: string } & UpdateTemplateDto>({
        mutationFn: updateTemplate,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates', data.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['template', data.id] });
        },
    });
}

const deleteTemplate = async (id: string): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
};

export const useDeleteTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteTemplate,
        onSuccess: () => {
            // We need a way to get workspaceId here to be more specific
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
}

// Preview a template
interface PreviewTemplatePayload {
    workspaceId: string;
    userId: string;
    contentType: string;
    content: {
        subject: string;
        body: string;
    };
}

interface PreviewTemplateResponse {
    renderedSubject: string;
    renderedContent: string;
}

const previewTemplate = async (payload: PreviewTemplatePayload): Promise<PreviewTemplateResponse> => {
    const { data } = await apiClient.post('/templates/preview', payload);
    return data;
};

export const usePreviewTemplate = () => {
    return useMutation<PreviewTemplateResponse, Error, PreviewTemplatePayload>({
        mutationFn: previewTemplate,
    });
};
