import { useQuery } from "@tanstack/react-query";
import {
  getCrossTenantUsers,
  getCrossTenantUserStats,
  CrossTenantUser,
  UserListParams,
  UserStats,
} from "@/lib/api";

export const usersKeys = {
  all: ["users"] as const,
  list: (params: UserListParams) => [...usersKeys.all, "list", params] as const,
  stats: () => [...usersKeys.all, "stats"] as const,
};

export function useUserList(params: UserListParams = {}) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => getCrossTenantUsers(params),
    staleTime: 60000,
  });
}

export function useUserStats() {
  return useQuery<UserStats, Error>({
    queryKey: usersKeys.stats(),
    queryFn: getCrossTenantUserStats,
    staleTime: 120000,
  });
}

export type { CrossTenantUser, UserListParams, UserStats };
