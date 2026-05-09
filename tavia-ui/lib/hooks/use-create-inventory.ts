"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInventoryItem } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";
import type { InventoryItem } from "@/types";

export function useCreateInventory() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: async (payload: Omit<InventoryItem, "id" | "lastRestocked" | "tenantId">) => {
      if (!tenantId) throw new Error("No active tenant");
      return createInventoryItem(payload, tenantId);
    },
    onSuccess: () => {
      // Invalidate the inventory query to trigger a refetch
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: ["inventory", tenantId] });
      }
    },
  });
}
