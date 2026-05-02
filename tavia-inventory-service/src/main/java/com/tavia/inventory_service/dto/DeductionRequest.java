package com.tavia.inventory_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Batch deduction request for multiple raw materials.
 * Used when an order is placed — the recipe is resolved into raw material deductions
 * and this request is sent to the inventory service.
 * TenantId comes from the X-Tenant-ID header (per GEMINI.md §3.2).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeductionRequest {

    @NotEmpty(message = "At least one deduction item is required")
    @Valid
    private List<DeductionItem> items;
}
