package com.tavia.catalog_service.service;

import com.tavia.catalog_service.dto.RecipeDto;
import com.tavia.catalog_service.dto.ResolvedIngredientDto;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for Catalog/Recipe domain operations.
 * Provides the core business logic for recipe management and resolution.
 */
public interface CatalogService {

    /**
     * Creates a new recipe for the given tenant.
     *
     * @param tenantId  the tenant owning this recipe
     * @param request   the recipe creation request without IDs
     * @return the persisted recipe
     * @throws com.tavia.catalog_service.exception.DuplicateRecipeException if a recipe
     *         with the same product name already exists for this tenant
     */
    RecipeDto createRecipe(UUID tenantId, com.tavia.catalog_service.dto.CreateRecipeRequest request);

    /**
     * Updates an existing recipe identified by its ID.
     *
     * @param tenantId  the tenant scope
     * @param recipeId  the recipe to update
     * @param recipeDto the updated recipe definition
     * @return the updated recipe
     */
    RecipeDto updateRecipe(UUID tenantId, UUID recipeId, RecipeDto recipeDto);

    /**
     * Retrieves all recipes for the given tenant.
     */
    List<RecipeDto> getAllRecipes(UUID tenantId);

    /**
     * Retrieves only active recipes for the given tenant.
     * Used by the customer-facing menu API.
     */
    List<RecipeDto> getActiveRecipes(UUID tenantId);

    /**
     * Retrieves a single recipe by its ID within the tenant scope.
     */
    RecipeDto getRecipeById(UUID tenantId, UUID recipeId);

    /**
     * Retrieves a recipe by product name within the tenant scope.
     */
    RecipeDto getRecipeByProductName(UUID tenantId, String productName);

    /**
     * Deletes a recipe by its ID within the tenant scope.
     */
    void deleteRecipe(UUID tenantId, UUID recipeId);

    // ── Recipe Resolution API (consumed by order-service) ──────────────

    /**
     * Resolves a product name into its raw material ingredients, scaled by quantity.
     * This is the primary integration point called by tavia-order-service.
     *
     * @param tenantId    the tenant context
     * @param productName the final product name (e.g., "Latte")
     * @param quantity    the number of units ordered
     * @return list of resolved ingredients with quantities scaled by order quantity
     */
    List<ResolvedIngredientDto> resolveRecipe(UUID tenantId, String productName, int quantity);

    /**
     * Checks if a recipe exists for the given product name within the tenant scope.
     *
     * @param tenantId    the tenant context
     * @param productName the final product name
     * @return true if a recipe is registered
     */
    boolean hasRecipe(UUID tenantId, String productName);
}
