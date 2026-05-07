import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTenants,
  updateTenantSubscription,
  Tenant,
  TenantSubscriptionUpdatePayload,
  SubscriptionPlan,
} from "@/lib/api";
import { tenantKeys } from "./useTenants";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  list: () => [...subscriptionKeys.all, "list"] as const,
  stats: () => [...subscriptionKeys.all, "stats"] as const,
  planDistribution: () => [...subscriptionKeys.all, "planDistribution"] as const,
};

export interface SubscriptionStats {
  totalMRR: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  churnRate: number;
}

export interface PlanDistribution {
  plan: SubscriptionPlan;
  count: number;
  percentage: number;
}

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  FREE: 0,
  STARTER: 29,
  PRO: 99,
  ENTERPRISE: 299,
};

export function useSubscriptionList() {
  return useQuery({
    queryKey: subscriptionKeys.list(),
    queryFn: async () => {
      const tenantsResponse = await getTenants({ pageSize: 1000 });
      const tenants = tenantsResponse.data;

      return tenants.map((tenant) => ({
        id: tenant.id,
        tenantId: tenant.id,
        tenantName: tenant.name,
        plan: tenant.plan,
        status: tenant.status,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        mrr: PLAN_PRICES[tenant.plan] || 0,
      }));
    },
    staleTime: 60000,
  });
}

export function useSubscriptionStats() {
  return useQuery<SubscriptionStats, Error>({
    queryKey: subscriptionKeys.stats(),
    queryFn: async () => {
      const tenantsResponse = await getTenants({ pageSize: 1000 });
      const tenants = tenantsResponse.data;

      const activeTenants = tenants.filter((t) => t.status === "ACTIVE");
      const totalMRR = activeTenants.reduce(
        (sum, t) => sum + (PLAN_PRICES[t.plan] || 0),
        0
      );

      return {
        totalMRR,
        totalSubscriptions: tenants.length,
        activeSubscriptions: activeTenants.length,
        churnRate: tenants.length > 0 ? ((tenants.length - activeTenants.length) / tenants.length) * 100 : 0,
      };
    },
    staleTime: 120000,
  });
}

export function usePlanDistribution() {
  return useQuery<PlanDistribution[], Error>({
    queryKey: subscriptionKeys.planDistribution(),
    queryFn: async () => {
      const tenantsResponse = await getTenants({ pageSize: 1000 });
      const tenants = tenantsResponse.data;

      const counts: Record<SubscriptionPlan, number> = {
        FREE: 0,
        STARTER: 0,
        PRO: 0,
        ENTERPRISE: 0,
      };

      tenants.forEach((t) => {
        counts[t.plan] = (counts[t.plan] || 0) + 1;
      });

      const total = tenants.length || 1;

      return (Object.entries(counts) as [SubscriptionPlan, number][]).map(([plan, count]) => ({
        plan,
        count,
        percentage: (count / total) * 100,
      }));
    },
    staleTime: 120000,
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation<
    Tenant,
    Error,
    { tenantId: string; payload: TenantSubscriptionUpdatePayload }
  >({
    mutationFn: ({ tenantId, payload }) =>
      updateTenantSubscription(tenantId, payload),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
