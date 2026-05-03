"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrdersByTenant } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";

/**
 * Fetches orders for the active tenant.
 * Backend endpoint: GET /api/v1/orders (X-Tenant-ID header)
 */
export function useOrders() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["orders", tenantId],
    queryFn: () => fetchOrdersByTenant(tenantId!),
    staleTime: 15_000,
    retry: 2,
    enabled: !!tenantId,
  });
}
