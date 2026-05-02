package com.tavia.order_service.catalog;

import com.tavia.order_service.dto.RecipeIngredient;

import java.util.List;

/**
 * Recipe Resolution Service Interface.
 * Translates a final product name + quantity into the raw materials required to produce it.
 *
 * CURRENT STATE (2026-05-02):
 * - Implemented by MockRecipeResolutionService with hardcoded recipes.
 *
 * FUTURE STATE:
 * - When tavia-catalog-service is built, this interface will be implemented by
 *   a CatalogRecipeResolutionService that makes REST calls to the catalog service.
 * - When tavia-iot-service is built, machines may report actual consumption,
 *   potentially overriding or augmenting recipe-based deductions.
 *
 * Per GEMINI.md §2.2: The architecture relies on Interfaces so implementations
 * can be swapped without changing the order service's core logic.
 */
public interface RecipeResolutionService {

    /**
     * Resolves a product name into the list of raw material ingredients
     * required to produce the given quantity of that product.
     *
     * @param productName the name of the final product (e.g., "Latte")
     * @param quantity    the number of units ordered (e.g., 2)
     * @return list of raw material ingredients with quantities scaled by order quantity
     */
    List<RecipeIngredient> resolveRecipe(String productName, int quantity);

    /**
     * Checks if a recipe exists for the given product name.
     *
     * @param productName the name of the final product
     * @return true if a recipe is registered for this product
     */
    boolean hasRecipe(String productName);
}
