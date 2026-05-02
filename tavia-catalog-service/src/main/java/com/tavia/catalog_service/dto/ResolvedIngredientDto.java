package com.tavia.catalog_service.dto;

import com.tavia.catalog_service.enums.UnitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight ingredient projection returned by the recipe resolution endpoint.
 * Designed to be directly consumable by tavia-order-service's RecipeIngredient DTO
 * and convertible to tavia-inventory-service's DeductionItem.
 *
 * This DTO intentionally uses String for the unit field to match the
 * order-service's existing RecipeIngredient contract.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolvedIngredientDto {

    private String rawMaterialName;
    private Double quantity;
    private String unit;
}
