"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInventory } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";

/**
 * Fetches inventory items for the active tenant.
 * Backend endpoint: GET /api/v1/inventory/tenant/{tenantId}
 */
export function useInventory() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["inventory", tenantId],
    queryFn: () => fetchInventory(tenantId!),
    staleTime: 30_000,
    retry: 2,
    enabled: !!tenantId,
  });
}
