"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWeeklySales } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";

/**
 * Fetches weekly analytics for the active tenant.
 * Backend endpoint: GET /api/v1/ai/weekly/{tenantId}
 */
export function useWeeklySales() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["weekly-sales", tenantId],
    queryFn: () => fetchWeeklySales(tenantId!),
    staleTime: 15_000,
    retry: 2,
    enabled: !!tenantId,
  });
}
