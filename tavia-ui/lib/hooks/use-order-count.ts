"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrderCount } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";

/**
 * Fetches the total order count for the active tenant.
 * Backend endpoint: GET /api/v1/orders/count (X-Tenant-ID header)
 * Returns: ApiResponse<number> → unwrapped to just the count number.
 */
export function useOrderCount() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["orderCount", tenantId],
    queryFn: async () => {
      const response = await fetchOrderCount(tenantId!);
      return response.data;
    },
    staleTime: 15_000,
    retry: 2,
    enabled: !!tenantId,
  });
}
