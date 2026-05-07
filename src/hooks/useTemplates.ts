import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTemplates,
  createTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  Template,
  TemplateListParams,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  PaginatedResponse,
} from "@/lib/api";

export const templateKeys = {
  all: ["templates"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  list: (params: TemplateListParams) => [...templateKeys.lists(), params] as const,
  details: () => [...templateKeys.all, "detail"] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

// List templates
export function useTemplateList(params: TemplateListParams = {}) {
  return useQuery<PaginatedResponse<Template> | Template[], Error>({
    queryKey: templateKeys.list(params),
    queryFn: () => getTemplates(params),
    staleTime: 1000 * 60 * 10, // 10 minutes - templates change infrequently
  });
}

// Get single template
export function useTemplate(id: string, enabled = true) {
  return useQuery<Template, Error>({
    queryKey: templateKeys.detail(id),
    queryFn: () => getTemplateById(id),
    enabled: enabled && !!id,
  });
}

// Create template
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation<Template, Error, CreateTemplatePayload>({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Update template
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation<Template, Error, { id: string; payload: UpdateTemplatePayload }>({
    mutationFn: ({ id, payload }) => updateTemplate(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.setQueryData(templateKeys.detail(data.id), data);
    },
  });
}

// Delete template
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation<Template, Error, string>({
    mutationFn: deleteTemplate,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.removeQueries({ queryKey: templateKeys.detail(deletedId) });
    },
  });
}

// Duplicate template (creates a copy)
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation<Template, Error, Template>({
    mutationFn: (template) => {
      const duplicatePayload: CreateTemplatePayload = {
        name: `${template.name} (Copy)`,
        description: template.description,
        scope: template.scope,
        metricSchema: template.metricSchema,
      };
      return createTemplate(duplicatePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}
