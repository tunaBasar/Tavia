"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";
import type { CreateOrderPayload } from "@/types";

/**
 * Simulates a single order.
 * Backend CreateOrderRequest is a flat structure (single product per order):
 *   { tenantId, customerId?, productName, quantity, price }
 */
export function useSimulateOrder() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: () => {
      if (!tenantId) {
        throw new Error("Not authenticated — no tenantId available");
      }

      const payload: CreateOrderPayload = {
        tenantId,
        customerId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        productName: "Latte",
        quantity: 2,
        price: 45.0,
      };

      return createOrder(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["context"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderCount"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
