import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, DashboardSummary } from "@/lib/api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
};

export function useDashboardSummary() {
  return useQuery<DashboardSummary, Error>({
    queryKey: dashboardKeys.summary(),
    queryFn: getDashboardSummary,
    staleTime: 1000 * 60 * 2, // 2 minutes - dashboard data should be relatively fresh
    refetchOnWindowFocus: true,
  });
}
