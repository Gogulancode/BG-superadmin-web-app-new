// Auth hooks
export { useLogin, useLogout, useAuthState } from "./useAuth";

// Dashboard hooks
export { useDashboardSummary, dashboardKeys } from "./useDashboard";

// Tenant hooks
export {
  useTenants,
  useTenantList,
  useTenant,
  useTenantStats,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useActivateTenant,
  useDeactivateTenant,
  useUpdateTenantSubscription,
  tenantKeys,
} from "./useTenants";

// Template hooks
export {
  useTemplateList,
  useTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  templateKeys,
} from "./useTemplates";

// Support hooks
export {
  useSupportTicketList,
  useSupportTicket,
  useCreateSupportTicket,
  useUpdateSupportTicketStatus,
  supportKeys,
} from "./useSupport";

// Audit hooks
export { useAuditLogs, auditKeys } from "./useAudit";

// Report hooks
export { useTenantReportSummary, reportKeys } from "./useReports";

// Ops hooks
export {
  useHealthStatus,
  useEnvironmentInfo,
  useRateLimits,
  useTelemetry,
  opsKeys,
} from "./useOps";

// Analytics hooks
export {
  usePlatformStats,
  useTenantGrowth,
  useHealthDistribution,
  useTopPerformers,
  analyticsKeys,
} from "./useAnalytics";

// Users hooks
export {
  useUserList,
  useUserStats,
  usersKeys,
} from "./useUsers";

// Settings hooks
export {
  usePlatformSettings,
  useUpdatePlatformSettings,
  settingsKeys,
} from "./useSettings";

// Subscription hooks
export {
  useSubscriptionList,
  useSubscriptionStats,
  usePlanDistribution,
  useUpdateSubscription,
  subscriptionKeys,
} from "./useSubscriptions";
