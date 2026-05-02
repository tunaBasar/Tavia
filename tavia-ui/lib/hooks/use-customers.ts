"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";

export function useCustomers() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["customers", tenantId],
    queryFn: () => fetchCustomers(tenantId!),
    staleTime: 30_000,
    retry: 2,
    enabled: !!tenantId,
  });
}
