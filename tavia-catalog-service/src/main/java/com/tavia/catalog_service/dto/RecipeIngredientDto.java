package com.tavia.catalog_service.dto;

import com.tavia.catalog_service.enums.UnitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for a single ingredient within a recipe.
 * Mirrors the contract expected by tavia-order-service's RecipeIngredient DTO
 * and tavia-inventory-service's DeductionItem DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredientDto {

    private UUID id;

    @NotBlank(message = "Raw material name is required")
    private String rawMaterialName;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Unit is required")
    private UnitType unit;
}
