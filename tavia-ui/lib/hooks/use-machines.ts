"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMachines, registerMachine } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { MachineRegistrationRequest } from "@/types";

export function useMachines() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["machines", tenantId],
    queryFn: () => fetchMachines(tenantId!),
    staleTime: 30_000,
    retry: 2,
    enabled: !!tenantId,
  });
}

export function useRegisterMachine() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (payload: MachineRegistrationRequest) => {
      if (!tenantId) throw new Error("No active tenant");
      return registerMachine(payload, tenantId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["machines", tenantId] });
    },
  });
}
