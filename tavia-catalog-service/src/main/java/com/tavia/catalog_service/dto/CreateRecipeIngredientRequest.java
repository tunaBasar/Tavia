package com.tavia.catalog_service.dto;

import com.tavia.catalog_service.enums.UnitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating an ingredient within a recipe.
 * Omits 'id' field.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRecipeIngredientRequest {

    @NotBlank(message = "Raw material name is required")
    private String rawMaterialName;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Unit is required")
    private UnitType unit;
}
