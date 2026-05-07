import { useQuery } from "@tanstack/react-query";
import {
  getHealthStatus,
  getEnvironmentInfo,
  getRateLimits,
  getTelemetry,
  HealthStatus,
  EnvironmentInfo,
  RateLimitInfo,
  TelemetryData,
} from "@/lib/api";

export const opsKeys = {
  all: ["ops"] as const,
  health: () => [...opsKeys.all, "health"] as const,
  environment: () => [...opsKeys.all, "environment"] as const,
  rateLimits: () => [...opsKeys.all, "rateLimits"] as const,
  telemetry: () => [...opsKeys.all, "telemetry"] as const,
};

export function useHealthStatus() {
  return useQuery<HealthStatus, Error>({
    queryKey: opsKeys.health(),
    queryFn: getHealthStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
}

export function useEnvironmentInfo() {
  return useQuery<EnvironmentInfo, Error>({
    queryKey: opsKeys.environment(),
    queryFn: getEnvironmentInfo,
    staleTime: 60000, // Environment info doesn't change often
  });
}

export function useRateLimits() {
  return useQuery<RateLimitInfo[], Error>({
    queryKey: opsKeys.rateLimits(),
    queryFn: getRateLimits,
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 5000,
  });
}

export function useTelemetry() {
  return useQuery<TelemetryData, Error>({
    queryKey: opsKeys.telemetry(),
    queryFn: getTelemetry,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
