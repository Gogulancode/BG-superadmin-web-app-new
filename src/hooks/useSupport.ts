import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSupportTickets,
  getSupportTicket,
  createSupportTicket,
  updateSupportTicketStatus,
  SupportTicket,
  SupportTicketDetail,
  SupportTicketListParams,
  CreateSupportTicketPayload,
  UpdateSupportTicketStatusPayload,
  PaginatedResponse,
} from "@/lib/api";

export const supportKeys = {
  all: ["support"] as const,
  lists: () => [...supportKeys.all, "list"] as const,
  list: (params: SupportTicketListParams) => [...supportKeys.lists(), params] as const,
  details: () => [...supportKeys.all, "detail"] as const,
  detail: (id: string) => [...supportKeys.details(), id] as const,
};

// List support tickets
export function useSupportTicketList(params: SupportTicketListParams = {}) {
  return useQuery<PaginatedResponse<SupportTicket> | SupportTicket[], Error>({
    queryKey: supportKeys.list(params),
    queryFn: () => getSupportTickets(params),
    staleTime: 1000 * 60 * 2, // 2 minutes - support tickets need to be fresh
    refetchOnWindowFocus: true,
  });
}

// Get single support ticket with details
export function useSupportTicket(id: string, enabled = true) {
  return useQuery<SupportTicketDetail, Error>({
    queryKey: supportKeys.detail(id),
    queryFn: () => getSupportTicket(id),
    enabled: enabled && !!id,
  });
}

// Create support ticket
export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation<SupportTicket, Error, CreateSupportTicketPayload>({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.lists() });
    },
  });
}

// Update support ticket status
export function useUpdateSupportTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    SupportTicket,
    Error,
    { id: string; payload: UpdateSupportTicketStatusPayload }
  >({
    mutationFn: ({ id, payload }) => updateSupportTicketStatus(id, payload),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: supportKeys.lists() });
      // Update the detail cache if it exists
      queryClient.setQueryData<SupportTicketDetail | undefined>(
        supportKeys.detail(id),
        (old) => (old ? { ...old, ...data } : undefined)
      );
    },
  });
}
