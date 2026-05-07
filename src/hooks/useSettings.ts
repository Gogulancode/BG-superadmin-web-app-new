import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPlatformSettings,
  updatePlatformSettings,
  PlatformSettings,
  UpdatePlatformSettingsPayload,
} from "@/lib/api";

export const settingsKeys = {
  all: ["settings"] as const,
  platform: () => [...settingsKeys.all, "platform"] as const,
};

export function usePlatformSettings() {
  return useQuery<PlatformSettings, Error>({
    queryKey: settingsKeys.platform(),
    queryFn: getPlatformSettings,
    staleTime: 300000, // 5 minutes - settings don't change often
    retry: false, // Don't retry if endpoint doesn't exist yet
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();

  return useMutation<PlatformSettings, Error, UpdatePlatformSettingsPayload>({
    mutationFn: updatePlatformSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.platform(), data);
    },
  });
}
