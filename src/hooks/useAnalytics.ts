import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getTenants,
} from "@/lib/api";

export const analyticsKeys = {
  all: ["analytics"] as const,
  platformStats: () => [...analyticsKeys.all, "platformStats"] as const,
  tenantGrowth: () => [...analyticsKeys.all, "tenantGrowth"] as const,
  healthDistribution: () => [...analyticsKeys.all, "healthDistribution"] as const,
  topPerformers: () => [...analyticsKeys.all, "topPerformers"] as const,
};

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalUsers: number;
  totalMetrics: number;
  totalOutcomes: number;
  openSupportTickets: number;
}

export interface HealthDistribution {
  healthy: number;
  atRisk: number;
  critical: number;
}

export interface TopPerformer {
  tenantId: string;
  tenantName: string;
  activityScore: number;
}

export function usePlatformStats() {
  return useQuery<PlatformStats, Error>({
    queryKey: analyticsKeys.platformStats(),
    queryFn: async () => {
      const summary = await getDashboardSummary();
      return {
        totalTenants: summary.totalTenants,
        activeTenants: summary.activeTenants,
        inactiveTenants: summary.inactiveTenants,
        totalUsers: summary.totalUsers,
        totalMetrics: summary.totalMetrics,
        totalOutcomes: summary.totalOutcomes,
        openSupportTickets: summary.openSupportTickets,
      };
    },
    staleTime: 60000, // 1 minute
  });
}

export function useTenantGrowth() {
  return useQuery({
    queryKey: analyticsKeys.tenantGrowth(),
    queryFn: async () => {
      const summary = await getDashboardSummary();
      return summary.tenantGrowthSeries || [];
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useHealthDistribution() {
  return useQuery<HealthDistribution, Error>({
    queryKey: analyticsKeys.healthDistribution(),
    queryFn: async () => {
      const tenantsResponse = await getTenants({ pageSize: 1000 });
      const tenants = tenantsResponse.data;

      // Count by status
      const healthy = tenants.filter((t) => t.status === "ACTIVE" && t.onboardingCompletedAt).length;
      const atRisk = tenants.filter((t) => t.status === "ACTIVE" && !t.onboardingCompletedAt).length;
      const critical = tenants.filter((t) => t.status !== "ACTIVE").length;

      return { healthy, atRisk, critical };
    },
    staleTime: 120000, // 2 minutes
  });
}

export function useTopPerformers() {
  return useQuery<TopPerformer[], Error>({
    queryKey: analyticsKeys.topPerformers(),
    queryFn: async () => {
      const summary = await getDashboardSummary();
      return (summary.topTenantsByActivity || []).map((item) => ({
        tenantId: item.tenantId,
        tenantName: item.tenantName,
        activityScore: item.activityScore,
      }));
    },
    staleTime: 120000,
  });
}
