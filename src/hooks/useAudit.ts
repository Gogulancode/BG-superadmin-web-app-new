import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAuditLogs, AuditLogQuery, AuditLogResponse } from "@/lib/api";

export const auditKeys = {
  all: ["audit"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (params: AuditLogQuery) => [...auditKeys.lists(), params] as const,
};

// List audit logs with pagination
export function useAuditLogs(params: AuditLogQuery = {}) {
  return useQuery<AuditLogResponse, Error>({
    queryKey: auditKeys.list(params),
    queryFn: () => getAuditLogs(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
  });
}
