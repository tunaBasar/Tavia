"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllProducts } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";

/**
 * Fetches ALL products (recipes) for the active tenant — including inactive ones.
 * The dashboard product management view needs to see both active and inactive products
 * so the tenant can manage their full catalog.
 *
 * Backend endpoint: GET /api/v1/catalog/recipes
 * Header: X-Tenant-ID (injected via tenantHeaders in the API client)
 */
export function useProducts() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["products", tenantId],
    queryFn: () => fetchAllProducts(tenantId!),
    staleTime: 30_000,
    retry: 2,
    enabled: !!tenantId,
  });
}
