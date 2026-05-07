// Common Components Barrel Export
// Shared UI components for consistent admin-grade experience

// Layout Components
export { PageHeader } from "./PageHeader";

// State Components
export { LoadingState } from "./LoadingState";
export { EmptyState } from "./EmptyState";
export {
  TableSkeleton,
  CardGridSkeleton,
  FormSkeleton,
  ChartSkeleton,
  StatsSkeleton,
} from "./Skeletons";

// Data Display Components
export { KpiCard, StatCard } from "./KpiCard";
export {
  StatusBadge,
  StatusBadge as TenantStatusBadge,
  TicketStatusBadge,
  TemplateStatusBadge,
  PriorityBadge,
  OnboardingBadge,
  PlanBadge,
} from "./StatusBadge";

// Filter Components
export { FilterBar, useFilters } from "./FilterBar";
export type { FilterConfig, FilterOption } from "./FilterBar";
