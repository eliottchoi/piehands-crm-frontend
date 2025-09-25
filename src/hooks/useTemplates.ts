import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Template } from '../types';
import { useWorkspace } from './useWorkspace';

type CreateTemplateDto = Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>;
type UpdateTemplateDto = Partial<CreateTemplateDto>;

const getTemplates = async (workspaceId: string): Promise<Template[]> => {
  const { data } = await api.get('/templates', {
    params: { workspaceId },
  });
  return data;
};

export const useTemplates = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useQuery<Template[], Error>({
    queryKey: ['templates', workspaceId],
    queryFn: () => getTemplates(workspaceId!),
    enabled: !!workspaceId,
  });
};

const createTemplate = async (templateData: CreateTemplateDto): Promise<Template> => {
  const { data } = await api.post('/templates', templateData);
  return data;
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();

  return useMutation<Template, Error, CreateTemplateDto>({
    mutationFn: createTemplate,
    onSuccess: () => {
      if (currentWorkspace) {
        queryClient.invalidateQueries({ queryKey: ['templates', currentWorkspace.id] });
      }
    },
  });
};

const updateTemplate = async ({ id, ...templateData }: {id: string} & UpdateTemplateDto): Promise<Template> => {
    const { data } = await api.patch(`/templates/${id}`, templateData);
    return data;
};

export const useUpdateTemplate = () => {
    const queryClient = useQueryClient();
    const { currentWorkspace } = useWorkspace();

    return useMutation<Template, Error, { id: string } & UpdateTemplateDto>({
        mutationFn: updateTemplate,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates', currentWorkspace?.id] });
            queryClient.invalidateQueries({ queryKey: ['template', data.id] });
        },
    });
}

const deleteTemplate = async (id: string): Promise<void> => {
    await api.delete(`/templates/${id}`);
};

export const useDeleteTemplate = () => {
    const queryClient = useQueryClient();
    const { currentWorkspace } = useWorkspace();

    return useMutation<void, Error, string>({
        mutationFn: deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates', currentWorkspace?.id] });
        },
    });
}

// Preview a template
interface PreviewTemplatePayload {
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

const previewTemplate = async (payload: PreviewTemplatePayload & { workspaceId: string }): Promise<PreviewTemplateResponse> => {
    const { data } = await api.post('/templates/preview', payload);
    return data;
};

export const usePreviewTemplate = () => {
    const { currentWorkspace } = useWorkspace();
    const workspaceId = currentWorkspace?.id;

    return useMutation<PreviewTemplateResponse, Error, PreviewTemplatePayload>({
        mutationFn: (variables) => previewTemplate({ ...variables, workspaceId: workspaceId! }),
    });
};
