import { clearAuthTokens, redirectToLogin } from "./auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ============================================================================
// Types & Interfaces
// ============================================================================

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SuperadminUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: SuperadminUser;
}

// MFA Types
export interface MfaRequiredResponse {
  requiresMfa: true;
  tempToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface MfaEnrollResponse {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
  label: string;
}

export interface MfaStatusResponse {
  isMfaEnabled: boolean;
  lastMfaVerifiedAt?: string;
}

export interface MfaLoginPayload {
  tempToken: string;
  code: string;
}

export interface MfaDisablePayload {
  code: string;
  password: string;
}

// Session Types
export interface Session {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  revokedAt?: string;
  isCurrent: boolean;
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
}

export type LoginResponse = AuthResponse | MfaRequiredResponse;

// Dashboard
export interface ActivityTrendPoint {
  date: string;
  activeTenants: number;
}

export interface TenantGrowthPoint {
  month: string;
  count: number;
}

export interface TopTenantActivity {
  tenantName: string;
  activityCount: number;
}

export interface DashboardSummary {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  createdLast7Days: number;
  totalUsers: number;
  totalMetrics: number;
  totalOutcomes: number;
  openSupportTickets: number;
  activityTrend: ActivityTrendPoint[];
  tenantGrowthSeries: TenantGrowthPoint[];
  topTenantsByActivity: TopTenantActivity[];
}

// Tenants
export type TenantStatus = "ACTIVE" | "INACTIVE";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED";
export type SubscriptionPlan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export interface Tenant {
  id: string;
  name: string;
  email: string;
  domain?: string;
  status: TenantStatus;
  plan: SubscriptionPlan;
  planCode?: string | null;
  subscriptionStatus: SubscriptionStatus;
  renewalDate?: string | null;
  trialEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  // Onboarding fields
  isOnboarded: boolean;
  onboardingStep?: number;
  onboardingCompletedAt?: string | null;
}

export interface TenantStats {
  tenantId: string;
  tenantName: string;
  status: TenantStatus;
  lastActiveAt?: string;
  metricsLogged: number;
  outcomesCompleted: number;
  activitiesLogged: number;
  salesLogged: number;
  momentumScore: number;
  streak: number;
  // Onboarding fields
  isOnboarded: boolean;
  onboardingStep?: number;
  onboardingCompletedAt?: string | null;
}

export interface CreateTenantPayload {
  name: string;
  email: string;
  domain?: string;
  plan?: SubscriptionPlan;
}

export interface UpdateTenantPayload {
  name?: string;
  email?: string;
  domain?: string;
  status?: TenantStatus;
  plan?: SubscriptionPlan;
}

export interface TenantSubscriptionUpdatePayload {
  plan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  billingCycle?: "MONTHLY" | "ANNUAL";
  expiresAt?: string;
  renewalDate?: string | null;
  trialEndsAt?: string | null;
}

export type OnboardingFilter = "ALL" | "COMPLETED" | "NOT_COMPLETED";

export interface TenantListParams {
  page?: number;
  pageSize?: number;
  status?: TenantStatus;
  plan?: SubscriptionPlan;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onboarding?: OnboardingFilter;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ApiTenant {
  id: string;
  name: string;
  email: string;
  status: TenantStatus;
  subscriptionStatus: SubscriptionStatus;
  planCode?: string | null;
  renewalDate?: string | null;
  trialEndsAt?: string | null;
  isOnboarded: boolean;
  onboardedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string | null;
}

interface ApiPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Templates
export type TemplateScope = "GLOBAL" | "DEFAULT";
export type TemplateStatus = "ACTIVE" | "INACTIVE";

export interface TemplateMetricSchema {
  name: string;
  type: "number" | "percentage" | "currency" | "boolean";
  unit?: string;
  description?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  type?: "metric" | "outcome" | "activity";
  scope: TemplateScope;
  status: TemplateStatus;
  category?: string | null;
  frequency?: string | null;
  targetValue?: number | null;
  metricSchema: TemplateMetricSchema[];
  usedByTenantsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  scope?: TemplateScope;
  category?: string;
  frequency?: string;
  targetValue?: number;
  metricSchema: TemplateMetricSchema[];
}

export interface UpdateTemplatePayload {
  name?: string;
  description?: string;
  scope?: TemplateScope;
  status?: TemplateStatus;
  category?: string;
  frequency?: string;
  targetValue?: number;
  metricSchema?: TemplateMetricSchema[];
}

export interface TemplateListParams {
  page?: number;
  pageSize?: number;
  scope?: TemplateScope;
  status?: TemplateStatus;
  search?: string;
}

// Support
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface SupportTicketDetail extends SupportTicket {
  description: string;
  comments: TicketComment[];
  metadata?: Record<string, unknown>;
}

export interface CreateSupportTicketPayload {
  tenantId: string;
  subject: string;
  description: string;
  priority?: TicketPriority;
}

export interface UpdateSupportTicketStatusPayload {
  status: TicketStatus;
  assignee?: string;
  note?: string;
}

export interface SupportTicketListParams {
  page?: number;
  pageSize?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  tenantId?: string;
  assignee?: string;
  search?: string;
}

// Audit
export type AuditEventType =
  | "TENANT_CREATED"
  | "TENANT_UPDATED"
  | "TENANT_ACTIVATED"
  | "TENANT_DEACTIVATED"
  | "TEMPLATE_CREATED"
  | "TEMPLATE_UPDATED"
  | "TEMPLATE_DELETED"
  | "SUPPORT_TICKET_CREATED"
  | "SUPPORT_TICKET_UPDATED"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "SETTINGS_CHANGED";

export interface AuditLogEntry {
  id: string;
  tenantId?: string;
  tenantName?: string;
  actor: string;
  eventType: AuditEventType | string;
  resource?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  tenantId?: string;
  userId?: string;
  eventType?: AuditEventType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

// Reports
export interface TenantReportSummary {
  tenantId: string;
  tenantName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalMetricsLogged: number;
    outcomesCompleted: number;
    outcomesTotal: number;
    completionRate: number;
    activitiesLogged: number;
    salesLogged: number;
    reviewsCompleted: number;
  };
  momentum: {
    currentScore: number;
    previousScore: number;
    trend: "up" | "down" | "stable";
    streak: number;
  };
  engagement: {
    activeDays: number;
    totalDays: number;
    engagementRate: number;
  };
}

export interface TenantReportParams {
  startDate?: string;
  endDate?: string;
  includeCharts?: boolean;
}

// ============================================================================
// Token Refresh Logic
// ============================================================================

let isRefreshing = false;
let refreshWaiters: Array<() => void> = [];

function notifyRefreshDone() {
  refreshWaiters.forEach((fn) => fn());
  refreshWaiters = [];
}

export async function refreshToken(): Promise<boolean> {
  const refresh = typeof window === "undefined" ? null : localStorage.getItem("superadmin_refresh_token");
  if (!refresh) {
    clearAuthTokens();
    return false;
  }

  if (isRefreshing) {
    await new Promise<void>((resolve) => refreshWaiters.push(resolve));
    return !!localStorage.getItem("superadmin_access_token");
  }

  try {
    isRefreshing = true;

    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) {
      clearAuthTokens();
      redirectToLogin();
      return false;
    }

    const data = await res.json();
    if (!data.accessToken || !data.refreshToken) {
      clearAuthTokens();
      redirectToLogin();
      return false;
    }

    localStorage.setItem("superadmin_access_token", data.accessToken);
    localStorage.setItem("superadmin_refresh_token", data.refreshToken);
    return true;
  } catch (error) {
    console.error("Token refresh failed", error);
    clearAuthTokens();
    redirectToLogin();
    return false;
  } finally {
    isRefreshing = false;
    notifyRefreshDone();
  }
}

// ============================================================================
// Base API Function
// ============================================================================

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  if (typeof window === "undefined") {
    throw new Error("api() must be called from the browser");
  }

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const accessToken = localStorage.getItem("superadmin_access_token");

  const headers = new Headers({ "Content-Type": "application/json" });
  if (options.headers) {
    const extra = new Headers(options.headers);
    extra.forEach((value, key) => headers.set(key, value));
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const initialResponse = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (initialResponse.status !== 401) {
    if (!initialResponse.ok) {
      const errorData = await initialResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${initialResponse.status}`);
    }
    const data = await initialResponse.json();
    return data as T;
  }

  // 401 - try refresh
  const refreshed = await refreshToken();
  if (!refreshed) {
    throw new Error("Unauthorized");
  }

  const newAccessToken = localStorage.getItem("superadmin_access_token");
  const retryHeaders = new Headers({ "Content-Type": "application/json" });
  if (options.headers) {
    const extra = new Headers(options.headers);
    extra.forEach((value, key) => retryHeaders.set(key, value));
  }

  if (newAccessToken) {
    retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);
  }

  const retryResponse = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: retryHeaders,
  });

  if (!retryResponse.ok) {
    // If still 401 after refresh, force logout
    if (retryResponse.status === 401) {
      clearAuthTokens();
      redirectToLogin();
      throw new Error("Session expired. Please login again.");
    }
    const errorData = await retryResponse.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${retryResponse.status}`);
  }

  const retriedData = await retryResponse.json();
  return retriedData as T;
}

// ============================================================================
// Helper to build query strings
// ============================================================================

function buildQueryString(params: object): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

function normalizePlan(value?: string | null): SubscriptionPlan {
  if (value === "STARTER" || value === "PRO" || value === "ENTERPRISE") {
    return value;
  }
  if (value === "PROFESSIONAL") {
    return "PRO";
  }
  return "FREE";
}

function normalizeTenant(raw: ApiTenant): Tenant {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    status: raw.status,
    plan: normalizePlan(raw.planCode),
    planCode: raw.planCode ?? null,
    subscriptionStatus: raw.subscriptionStatus,
    renewalDate: raw.renewalDate ?? null,
    trialEndsAt: raw.trialEndsAt ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    lastActiveAt: raw.lastActiveAt ?? undefined,
    isOnboarded: raw.isOnboarded,
    onboardingStep: raw.isOnboarded ? 8 : 1,
    onboardingCompletedAt: raw.onboardedAt ?? null,
  };
}

function normalizeTenantPage(response: ApiPaginatedResponse<ApiTenant>): PaginatedResponse<Tenant> {
  return {
    data: response.data.map(normalizeTenant),
    total: response.meta.total,
    page: response.meta.page,
    pageSize: response.meta.pageSize,
    totalPages: response.meta.totalPages,
  };
}

function toTenantQueryParams(params: TenantListParams) {
  return {
    page: params.page,
    pageSize: params.pageSize,
    status: params.status,
    planCode: params.plan,
    search: params.search,
    isOnboarded:
      params.onboarding === "COMPLETED"
        ? true
        : params.onboarding === "NOT_COMPLETED"
          ? false
          : undefined,
  };
}

function toSubscriptionPayload(payload: TenantSubscriptionUpdatePayload) {
  return {
    subscriptionStatus:
      payload.subscriptionStatus ?? (payload.plan && payload.plan !== "FREE" ? "ACTIVE" : undefined),
    planCode: payload.plan,
    renewalDate: payload.renewalDate ?? payload.expiresAt,
    trialEndsAt: payload.trialEndsAt,
  };
}

// ============================================================================
// Auth API
// ============================================================================

export async function loginSuperadmin(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Login failed");
  }

  const data: LoginResponse = await res.json();

  // Only store tokens if MFA is not required
  if (!isMfaRequired(data)) {
    localStorage.setItem("superadmin_access_token", data.accessToken);
    localStorage.setItem("superadmin_refresh_token", data.refreshToken);
    localStorage.setItem("superadmin_user", JSON.stringify(data.user));
  }

  return data;
}

// Helper to check if login response requires MFA (moved up for use in loginSuperadmin)
export function isMfaRequired(response: LoginResponse): response is MfaRequiredResponse {
  return "requiresMfa" in response && response.requiresMfa === true;
}

export function getSuperadminUser(): SuperadminUser | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("superadmin_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as SuperadminUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("superadmin_access_token");
}

// ============================================================================
// Dashboard API
// ============================================================================

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return api<DashboardSummary>("/api/v1/superadmin/dashboard/summary");
}

// ============================================================================
// Tenants API
// ============================================================================

export async function getTenants(params: TenantListParams = {}): Promise<PaginatedResponse<Tenant>> {
  const qs = buildQueryString(toTenantQueryParams(params));
  const response = await api<ApiPaginatedResponse<ApiTenant>>(`/api/v1/superadmin/tenants${qs}`);
  return normalizeTenantPage(response);
}

export async function createTenant(payload: CreateTenantPayload): Promise<Tenant> {
  const created = await api<ApiTenant>("/api/v1/superadmin/tenants", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
    }),
  });
  const tenant = normalizeTenant(created);
  if (payload.plan && payload.plan !== tenant.plan) {
    return updateTenantSubscription(tenant.id, { plan: payload.plan });
  }
  return tenant;
}

export async function getTenantById(id: string): Promise<Tenant> {
  const tenant = await api<ApiTenant>(`/api/v1/superadmin/tenants/${id}`);
  return normalizeTenant(tenant);
}

export async function updateTenant(id: string, payload: UpdateTenantPayload): Promise<Tenant> {
  const updated = await api<ApiTenant>(`/api/v1/superadmin/tenants/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
    }),
  });
  const tenant = normalizeTenant(updated);
  if (payload.plan && payload.plan !== tenant.plan) {
    return updateTenantSubscription(tenant.id, { plan: payload.plan });
  }
  return tenant;
}

export async function activateTenant(id: string): Promise<Tenant> {
  const tenant = await api<ApiTenant>(`/api/v1/superadmin/tenants/${id}/activate`, {
    method: "PATCH",
  });
  return normalizeTenant(tenant);
}

export async function deactivateTenant(id: string): Promise<Tenant> {
  const tenant = await api<ApiTenant>(`/api/v1/superadmin/tenants/${id}/deactivate`, {
    method: "PATCH",
  });
  return normalizeTenant(tenant);
}

export async function updateTenantSubscription(
  id: string,
  payload: TenantSubscriptionUpdatePayload
): Promise<Tenant> {
  const tenant = await api<ApiTenant>(`/api/v1/superadmin/tenants/${id}/subscription`, {
    method: "PATCH",
    body: JSON.stringify(toSubscriptionPayload(payload)),
  });
  return normalizeTenant(tenant);
}

export async function getTenantStats(id: string): Promise<TenantStats> {
  return api<TenantStats>(`/api/v1/superadmin/tenants/${id}/stats`);
}

// ============================================================================
// Templates API
// ============================================================================

export async function getTemplates(params: TemplateListParams = {}): Promise<PaginatedResponse<Template> | Template[]> {
  const qs = buildQueryString(params);
  return api<PaginatedResponse<Template> | Template[]>(`/api/v1/superadmin/templates${qs}`);
}

export async function createTemplate(payload: CreateTemplatePayload): Promise<Template> {
  return api<Template>("/api/v1/superadmin/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTemplateById(id: string): Promise<Template> {
  return api<Template>(`/api/v1/superadmin/templates/${id}`);
}

export async function updateTemplate(id: string, payload: UpdateTemplatePayload): Promise<Template> {
  return api<Template>(`/api/v1/superadmin/templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTemplate(id: string): Promise<Template> {
  return api<Template>(`/api/v1/superadmin/templates/${id}`, {
    method: "DELETE",
  });
}

// ============================================================================
// Support API
// ============================================================================

export async function getSupportTickets(
  params: SupportTicketListParams = {}
): Promise<PaginatedResponse<SupportTicket> | SupportTicket[]> {
  const qs = buildQueryString(params);
  return api<PaginatedResponse<SupportTicket> | SupportTicket[]>(`/api/v1/superadmin/support/tickets${qs}`);
}

export async function getSupportTicket(id: string): Promise<SupportTicketDetail> {
  return api<SupportTicketDetail>(`/api/v1/superadmin/support/tickets/${id}`);
}

export async function createSupportTicket(payload: CreateSupportTicketPayload): Promise<SupportTicket> {
  return api<SupportTicket>("/api/v1/superadmin/support/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSupportTicketStatus(
  id: string,
  payload: UpdateSupportTicketStatusPayload
): Promise<SupportTicket> {
  return api<SupportTicket>(`/api/v1/superadmin/support/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ============================================================================
// Audit API
// ============================================================================

export async function getAuditLogs(params: AuditLogQuery = {}): Promise<AuditLogResponse> {
  const qs = buildQueryString(params);
  return api<AuditLogResponse>(`/api/v1/superadmin/audit/logs${qs}`);
}

// ============================================================================
// Reports API
// ============================================================================

export async function getTenantReportSummary(
  tenantId: string,
  params: TenantReportParams = {}
): Promise<TenantReportSummary> {
  const qs = buildQueryString(params);
  return api<TenantReportSummary>(`/api/v1/superadmin/reports/tenant/${tenantId}/summary${qs}`);
}

// ============================================================================
// MFA API
// ============================================================================

export async function getMfaStatus(): Promise<MfaStatusResponse> {
  return api<MfaStatusResponse>("/api/v1/auth/mfa/status");
}

export async function enrollMfa(): Promise<MfaEnrollResponse> {
  return api<MfaEnrollResponse>("/api/v1/auth/mfa/enroll", {
    method: "POST",
  });
}

export async function verifyMfa(code: string): Promise<{ message: string }> {
  return api<{ message: string }>("/api/v1/auth/mfa/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function disableMfa(payload: MfaDisablePayload): Promise<{ message: string }> {
  return api<{ message: string }>("/api/v1/auth/mfa/disable", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function mfaLogin(payload: MfaLoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/mfa/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "MFA verification failed");
  }

  const data: AuthResponse = await res.json();

  // Store tokens
  localStorage.setItem("superadmin_access_token", data.accessToken);
  localStorage.setItem("superadmin_refresh_token", data.refreshToken);
  localStorage.setItem("superadmin_user", JSON.stringify(data.user));

  return data;
}

// ============================================================================
// Sessions API
// ============================================================================

export async function getSessions(): Promise<SessionListResponse> {
  return api<SessionListResponse>("/api/v1/auth/sessions");
}

export async function revokeSession(sessionId: string): Promise<{ message: string }> {
  return api<{ message: string }>(`/api/v1/auth/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function revokeAllSessions(keepCurrent = true): Promise<{ message: string; count: number }> {
  return api<{ message: string; count: number }>("/api/v1/auth/sessions", {
    method: "DELETE",
    body: JSON.stringify({ keepCurrent }),
  });
}

// ============================================================================
// Logout API
// ============================================================================

export async function logoutSuperadmin(): Promise<void> {
  try {
    await api<{ message: string }>("/api/v1/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    // Even if logout API fails, clear local tokens
    console.warn("Logout API failed, clearing tokens anyway", error);
  } finally {
    clearAuthTokens();
  }
}

// ============================================================================
// Ops API
// ============================================================================

export interface HealthStatus {
  overall: "healthy" | "degraded" | "unhealthy";
  database: "healthy" | "degraded" | "unhealthy";
  redis: "healthy" | "degraded" | "unhealthy";
  api: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
}

export interface EnvironmentInfo {
  nodeVersion: string;
  platform: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  version: string;
  environment: string;
}

export interface RateLimitInfo {
  endpoint: string;
  limit: number;
  remaining: number;
  resetAt: string;
}

export interface TelemetryData {
  requests: {
    total: number;
    success: number;
    failed: number;
  };
  responseTime: {
    avg: number;
    p95: number;
    p99: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
}

export async function getHealthStatus(): Promise<HealthStatus> {
  return api<HealthStatus>("/api/v1/ops/health");
}

export async function getEnvironmentInfo(): Promise<EnvironmentInfo> {
  return api<EnvironmentInfo>("/api/v1/ops/environment");
}

export async function getRateLimits(): Promise<RateLimitInfo[]> {
  return api<RateLimitInfo[]>("/api/v1/ops/rate-limits");
}

export async function getTelemetry(): Promise<TelemetryData> {
  return api<TelemetryData>("/api/v1/ops/telemetry");
}

// ============================================================================
// Analytics API
// ============================================================================

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalMetrics: number;
  totalOutcomes: number;
  averageMomentum: number;
  platformHealth: number;
}

export interface TenantGrowth {
  month: string;
  count: number;
  growth: number;
}

export interface HealthDistribution {
  healthy: number;
  atRisk: number;
  critical: number;
}

export interface TopPerformer {
  tenantId: string;
  tenantName: string;
  momentum: number;
  streak: number;
  completionRate: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return api<PlatformStats>("/api/v1/superadmin/dashboard/summary");
}

export async function getTenantGrowthData(): Promise<TenantGrowth[]> {
  const summary = await getDashboardSummary();
  return (summary.tenantGrowthSeries || []).map((item, idx, arr) => ({
    month: item.month,
    count: item.count,
    growth: idx > 0 ? ((item.count - arr[idx - 1].count) / arr[idx - 1].count) * 100 : 0,
  }));
}

// ============================================================================
// Users API (Cross-tenant)
// ============================================================================

export interface CrossTenantUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantName: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  tenantId?: string;
  role?: string;
  status?: string;
  search?: string;
}

export async function getCrossTenantUsers(params: UserListParams = {}): Promise<PaginatedResponse<CrossTenantUser>> {
  const qs = buildQueryString(params);
  return api<PaginatedResponse<CrossTenantUser>>(`/api/v1/superadmin/users${qs}`);
}

// ============================================================================
// Settings API
// ============================================================================

export interface PlatformSettings {
  id: string;
  maintenanceMode: boolean;
  defaultPlan: SubscriptionPlan;
  maxTenantsPerPlan: {
    FREE: number;
    STARTER: number;
    PRO: number;
    ENTERPRISE: number;
  };
  features: {
    mfaEnabled: boolean;
    auditLogging: boolean;
    emailNotifications: boolean;
  };
  updatedAt: string;
}

export interface UpdatePlatformSettingsPayload {
  maintenanceMode?: boolean;
  defaultPlan?: SubscriptionPlan;
  maxTenantsPerPlan?: Partial<PlatformSettings["maxTenantsPerPlan"]>;
  features?: Partial<PlatformSettings["features"]>;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  return api<PlatformSettings>("/api/v1/superadmin/settings");
}

export async function updatePlatformSettings(payload: UpdatePlatformSettingsPayload): Promise<PlatformSettings> {
  return api<PlatformSettings>("/api/v1/superadmin/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
