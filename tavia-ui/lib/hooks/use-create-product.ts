"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";
import type { CreateProductRequest } from "@/types";

/**
 * Mutation hook for creating a new product (recipe) via
 * POST /api/v1/catalog/recipes with X-Tenant-ID header.
 *
 * Automatically invalidates the ["products", tenantId] query on success
 * so the product list refreshes.
 */
export function useCreateProduct() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductRequest) => {
      if (!tenantId) throw new Error("No tenant selected");
      return createProduct(payload, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", tenantId] });
    },
  });
}
