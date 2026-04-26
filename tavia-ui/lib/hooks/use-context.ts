"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentContext } from "@/lib/api/client";

/**
 * Fetches the current environmental context.
 * Backend endpoint: GET /api/v1/context (no path parameters)
 */
export function useCurrentContext() {
  return useQuery({
    queryKey: ["context"],
    queryFn: () => fetchCurrentContext(),
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 2,
  });
}
