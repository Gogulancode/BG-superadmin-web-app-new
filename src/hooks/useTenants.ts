import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  activateTenant,
  deactivateTenant,
  updateTenantSubscription,
  getTenantStats,
  Tenant,
  TenantStats,
  TenantListParams,
  CreateTenantPayload,
  UpdateTenantPayload,
  TenantSubscriptionUpdatePayload,
  PaginatedResponse,
} from "@/lib/api";

export const tenantKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantKeys.all, "list"] as const,
  list: (params: TenantListParams) => [...tenantKeys.lists(), params] as const,
  details: () => [...tenantKeys.all, "detail"] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
  stats: (id: string) => [...tenantKeys.all, "stats", id] as const,
};

// List tenants (alias for useTenantList with limit support)
export function useTenants(params: TenantListParams & { limit?: number } = {}) {
  const normalizedParams: TenantListParams = {
    ...params,
    pageSize: params.limit || params.pageSize,
  };
  return useQuery<PaginatedResponse<Tenant>, Error>({
    queryKey: tenantKeys.list(normalizedParams),
    queryFn: () => getTenants(normalizedParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// List tenants
export function useTenantList(params: TenantListParams = {}) {
  return useQuery<PaginatedResponse<Tenant>, Error>({
    queryKey: tenantKeys.list(params),
    queryFn: () => getTenants(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get single tenant
export function useTenant(id: string, enabled = true) {
  return useQuery<Tenant, Error>({
    queryKey: tenantKeys.detail(id),
    queryFn: () => getTenantById(id),
    enabled: enabled && !!id,
  });
}

// Get tenant stats
export function useTenantStats(id: string, enabled = true) {
  return useQuery<TenantStats, Error>({
    queryKey: tenantKeys.stats(id),
    queryFn: () => getTenantStats(id),
    enabled: enabled && !!id,
  });
}

// Create tenant
export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation<Tenant, Error, CreateTenantPayload>({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
    },
  });
}

// Activate tenant
export function useActivateTenant() {
  const queryClient = useQueryClient();

  return useMutation<Tenant, Error, string>({
    mutationFn: activateTenant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.setQueryData(tenantKeys.detail(data.id), data);
    },
  });
}

// Deactivate tenant
export function useDeactivateTenant() {
  const queryClient = useQueryClient();

  return useMutation<Tenant, Error, string>({
    mutationFn: deactivateTenant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.setQueryData(tenantKeys.detail(data.id), data);
    },
  });
}

// Update subscription
export function useUpdateTenantSubscription() {
  const queryClient = useQueryClient();

  return useMutation<
    Tenant,
    Error,
    { id: string; payload: TenantSubscriptionUpdatePayload }
  >({
    mutationFn: ({ id, payload }) => updateTenantSubscription(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.setQueryData(tenantKeys.detail(data.id), data);
    },
  });
}

// Update tenant
export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation<Tenant, Error, { id: string; data: UpdateTenantPayload }>({
    mutationFn: ({ id, data }) => updateTenant(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.setQueryData(tenantKeys.detail(data.id), data);
    },
  });
}

