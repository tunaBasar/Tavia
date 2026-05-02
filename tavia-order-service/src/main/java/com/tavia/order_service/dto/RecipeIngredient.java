package com.tavia.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single raw material ingredient required by a recipe.
 * This is the output of recipe resolution — translating a final product
 * into the raw materials needed to produce it.
 *
 * Example: "Latte" resolves to [
 *   { rawMaterialName: "Milk", quantity: 200.0, unit: "MILLILITER" },
 *   { rawMaterialName: "Coffee Beans", quantity: 18.0, unit: "GRAM" }
 * ]
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredient {
    private String rawMaterialName;
    private Double quantity;
    private String unit;
}
