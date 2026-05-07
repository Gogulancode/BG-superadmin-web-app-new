import { useQuery } from "@tanstack/react-query";
import { getTenants } from "@/lib/api";

export const usersKeys = {
  all: ["users"] as const,
  list: (params: UserListParams) => [...usersKeys.all, "list", params] as const,
  stats: () => [...usersKeys.all, "stats"] as const,
};

export interface UserListParams {
  page?: number;
  pageSize?: number;
  tenantId?: string;
  role?: string;
  status?: string;
  search?: string;
}

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

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newThisWeek: number;
}

// Since we don't have a direct users endpoint, we derive user info from tenant stats
// In a real implementation, the backend would have /superadmin/users endpoint
export function useUserList(params: UserListParams = {}) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: async () => {
      // For now, return mock data until backend endpoint is available
      // This would be replaced with: api<PaginatedResponse<CrossTenantUser>>(`/api/v1/superadmin/users${qs}`)
      const tenantsResponse = await getTenants({ pageSize: 100 });
      const tenants = tenantsResponse.data;

      // Generate mock users from tenants
      const users: CrossTenantUser[] = tenants.flatMap((tenant) => [
        {
          id: `user-${tenant.id}-admin`,
          email: tenant.email,
          name: tenant.name + " Admin",
          role: "ADMIN",
          tenantId: tenant.id,
          tenantName: tenant.name,
          status: tenant.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
          lastLoginAt: tenant.lastActiveAt,
          createdAt: tenant.createdAt,
        },
      ]);

      // Apply filters
      let filtered = users;
      if (params.tenantId) {
        filtered = filtered.filter((u) => u.tenantId === params.tenantId);
      }
      if (params.role) {
        filtered = filtered.filter((u) => u.role === params.role);
      }
      if (params.status) {
        filtered = filtered.filter((u) => u.status === params.status);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        );
      }

      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);

      return {
        data: paged,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },
    staleTime: 60000,
  });
}

export function useUserStats() {
  return useQuery<UserStats, Error>({
    queryKey: usersKeys.stats(),
    queryFn: async () => {
      const tenantsResponse = await getTenants({ pageSize: 1000 });
      const tenants = tenantsResponse.data;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Estimate users from tenants (1 admin per tenant for now)
      return {
        totalUsers: tenants.length,
        activeUsers: tenants.filter((t) => t.status === "ACTIVE").length,
        adminUsers: tenants.length, // Each tenant has at least 1 admin
        newThisWeek: tenants.filter((t) => new Date(t.createdAt) >= weekAgo).length,
      };
    },
    staleTime: 120000,
  });
}
