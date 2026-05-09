package com.tavia.order_service.catalog;

import com.tavia.order_service.dto.RecipeIngredient;

import java.util.List;
import java.util.UUID;

/**
 * Recipe Resolution Service Interface.
 * Translates a final product name + quantity into the raw materials required to produce it.
 *
 * CURRENT STATE (2026-05-09):
 * - Implemented by CatalogRecipeResolutionService that makes REST calls to tavia-catalog-service.
 * - MockRecipeResolutionService is retained as a fallback but is not the primary bean.
 *
 * FUTURE STATE:
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
     * @param tenantId    the tenant whose catalog recipe to resolve
     * @param productName the name of the final product (e.g., "Latte")
     * @param quantity    the number of units ordered (e.g., 2)
     * @return list of raw material ingredients with quantities scaled by order quantity
     */
    List<RecipeIngredient> resolveRecipe(UUID tenantId, String productName, int quantity);

    /**
     * Checks if a recipe exists for the given product name.
     *
     * @param tenantId    the tenant whose catalog to check
     * @param productName the name of the final product
     * @return true if a recipe is registered for this product
     */
    boolean hasRecipe(UUID tenantId, String productName);
}
