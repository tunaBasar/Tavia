package com.tavia.inventory_service.dto;

import com.tavia.inventory_service.enums.UnitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single raw material deduction entry within a batch deduction request.
 * Example: { "rawMaterialName": "Milk", "quantity": 200.0, "unit": "MILLILITER" }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeductionItem {

    @NotBlank(message = "Raw material name is required")
    private String rawMaterialName;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Unit is required")
    private UnitType unit;
}
