package com.tavia.catalog_service.controller;

import com.tavia.catalog_service.dto.ApiResponse;
import com.tavia.catalog_service.dto.RecipeDto;
import com.tavia.catalog_service.dto.ResolvedIngredientDto;
import com.tavia.catalog_service.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for the Tavia Catalog Service (Recipe Management & Resolution).
 * Per GEMINI.md §3.2: All tenant-scoped endpoints use @RequestHeader("X-Tenant-ID").
 * Per GEMINI.md §2.2: This is the Recipe Bridge — the API that translates
 * final products into raw material requirements.
 */
@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
@Tag(name = "Catalog — Recipes", description = "Recipe (Bill of Materials) Management & Resolution APIs")
public class CatalogController {

    private final CatalogService catalogService;

    // ── Recipe CRUD ────────────────────────────────────────────────────

    @PostMapping("/recipes")
    @Operation(summary = "Create a new recipe (Bill of Materials)")
    public ResponseEntity<ApiResponse<RecipeDto>> createRecipe(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @Valid @RequestBody RecipeDto recipeDto) {
        RecipeDto created = catalogService.createRecipe(tenantId, recipeDto);
        return new ResponseEntity<>(
                ApiResponse.success(created, "Recipe created successfully"),
                HttpStatus.CREATED);
    }

    @PutMapping("/recipes/{recipeId}")
    @Operation(summary = "Update an existing recipe")
    public ResponseEntity<ApiResponse<RecipeDto>> updateRecipe(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID recipeId,
            @Valid @RequestBody RecipeDto recipeDto) {
        RecipeDto updated = catalogService.updateRecipe(tenantId, recipeId, recipeDto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Recipe updated successfully"));
    }

    @GetMapping("/recipes")
    @Operation(summary = "Get all recipes for the active tenant")
    public ResponseEntity<ApiResponse<List<RecipeDto>>> getAllRecipes(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        List<RecipeDto> recipes = catalogService.getAllRecipes(tenantId);
        return ResponseEntity.ok(ApiResponse.success(recipes));
    }

    @GetMapping("/recipes/active")
    @Operation(summary = "Get active (available) recipes for the active tenant")
    public ResponseEntity<ApiResponse<List<RecipeDto>>> getActiveRecipes(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        List<RecipeDto> recipes = catalogService.getActiveRecipes(tenantId);
        return ResponseEntity.ok(ApiResponse.success(recipes));
    }

    @GetMapping("/recipes/{recipeId}")
    @Operation(summary = "Get a recipe by its ID")
    public ResponseEntity<ApiResponse<RecipeDto>> getRecipeById(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID recipeId) {
        RecipeDto recipe = catalogService.getRecipeById(tenantId, recipeId);
        return ResponseEntity.ok(ApiResponse.success(recipe));
    }

    @GetMapping("/recipes/by-product/{productName}")
    @Operation(summary = "Get a recipe by product name")
    public ResponseEntity<ApiResponse<RecipeDto>> getRecipeByProductName(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable String productName) {
        RecipeDto recipe = catalogService.getRecipeByProductName(tenantId, productName);
        return ResponseEntity.ok(ApiResponse.success(recipe));
    }

    @DeleteMapping("/recipes/{recipeId}")
    @Operation(summary = "Delete a recipe")
    public ResponseEntity<ApiResponse<Void>> deleteRecipe(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID recipeId) {
        catalogService.deleteRecipe(tenantId, recipeId);
        return ResponseEntity.ok(ApiResponse.success(null, "Recipe deleted successfully"));
    }

    // ── Recipe Resolution (Order-Service Integration) ──────────────────

    /**
     * Resolves a product name into its raw material ingredients, scaled by quantity.
     * This endpoint is the primary integration point consumed by tavia-order-service.
     *
     * Response format is directly compatible with order-service's RecipeIngredient DTO
     * and can be transformed into inventory-service's DeductionRequest.
     */
    @GetMapping("/resolve/{productName}")
    @Operation(summary = "Resolve a product into raw material ingredients (for order processing)")
    public ResponseEntity<ApiResponse<List<ResolvedIngredientDto>>> resolveRecipe(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable String productName,
            @RequestParam(defaultValue = "1") int quantity) {
        List<ResolvedIngredientDto> ingredients = catalogService.resolveRecipe(tenantId, productName, quantity);
        return ResponseEntity.ok(ApiResponse.success(ingredients));
    }

    /**
     * Checks if a recipe exists for the given product name.
     * Lightweight endpoint for order-service pre-validation.
     */
    @GetMapping("/resolve/{productName}/exists")
    @Operation(summary = "Check if a recipe exists for a product")
    public ResponseEntity<ApiResponse<Boolean>> hasRecipe(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable String productName) {
        boolean exists = catalogService.hasRecipe(tenantId, productName);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }
}
