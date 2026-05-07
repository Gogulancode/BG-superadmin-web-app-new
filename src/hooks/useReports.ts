import { useQuery } from "@tanstack/react-query";
import { getTenantReportSummary, TenantReportSummary, TenantReportParams } from "@/lib/api";

export const reportKeys = {
  all: ["reports"] as const,
  tenant: (tenantId: string) => [...reportKeys.all, "tenant", tenantId] as const,
  tenantSummary: (tenantId: string, params: TenantReportParams) =>
    [...reportKeys.tenant(tenantId), "summary", params] as const,
};

// Get tenant report summary
export function useTenantReportSummary(
  tenantId: string,
  params: TenantReportParams = {},
  enabled = true
) {
  return useQuery<TenantReportSummary, Error>({
    queryKey: reportKeys.tenantSummary(tenantId, params),
    queryFn: () => getTenantReportSummary(tenantId, params),
    enabled: enabled && !!tenantId,
    staleTime: 1000 * 60 * 10, // 10 minutes - reports can be cached longer
  });
}
