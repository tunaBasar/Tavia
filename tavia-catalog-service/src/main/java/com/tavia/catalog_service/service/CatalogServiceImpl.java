package com.tavia.catalog_service.service;

import com.tavia.catalog_service.dto.RecipeDto;
import com.tavia.catalog_service.dto.RecipeIngredientDto;
import com.tavia.catalog_service.dto.ResolvedIngredientDto;
import com.tavia.catalog_service.entity.Recipe;
import com.tavia.catalog_service.entity.RecipeIngredient;
import com.tavia.catalog_service.exception.DuplicateRecipeException;
import com.tavia.catalog_service.exception.ResourceNotFoundException;
import com.tavia.catalog_service.mapper.RecipeMapper;
import com.tavia.catalog_service.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of the Catalog Service.
 * Per GEMINI.md §2.2: This service acts as the Recipe Bridge, holding the
 * Bill of Materials that translates final products into raw material deductions.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogServiceImpl implements CatalogService {

    private final RecipeRepository recipeRepository;
    private final RecipeMapper recipeMapper;

    // ── CRUD Operations ────────────────────────────────────────────────

    @Override
    @Transactional
    public RecipeDto createRecipe(UUID tenantId, RecipeDto recipeDto) {
        String normalizedName = recipeDto.getProductName().trim().toUpperCase();

        // Guard: duplicate check
        if (recipeRepository.existsByTenantIdAndProductName(tenantId, normalizedName)) {
            throw new DuplicateRecipeException(
                    "Recipe already exists for product '" + normalizedName + "' in tenant " + tenantId);
        }

        Recipe recipe = recipeMapper.toEntity(recipeDto);
        recipe.setTenantId(tenantId);
        recipe.setProductName(normalizedName);

        if (recipe.getActive() == null) {
            recipe.setActive(true);
        }

        // Wire ingredients to the recipe (bidirectional)
        for (RecipeIngredientDto ingredientDto : recipeDto.getIngredients()) {
            RecipeIngredient ingredient = recipeMapper.toIngredientEntity(ingredientDto);
            recipe.addIngredient(ingredient);
        }

        Recipe saved = recipeRepository.save(recipe);
        log.info("Created recipe '{}' for tenant {} with {} ingredient(s)",
                saved.getProductName(), tenantId, saved.getIngredients().size());

        return recipeMapper.toDto(saved);
    }

    @Override
    @Transactional
    public RecipeDto updateRecipe(UUID tenantId, UUID recipeId, RecipeDto recipeDto) {
        Recipe existing = findRecipeOrThrow(tenantId, recipeId);

        String normalizedName = recipeDto.getProductName().trim().toUpperCase();

        // Guard: if renaming, check for duplicates
        if (!existing.getProductName().equals(normalizedName)
                && recipeRepository.existsByTenantIdAndProductName(tenantId, normalizedName)) {
            throw new DuplicateRecipeException(
                    "Recipe already exists for product '" + normalizedName + "' in tenant " + tenantId);
        }

        existing.setProductName(normalizedName);
        existing.setDisplayName(recipeDto.getDisplayName());
        existing.setCategory(recipeDto.getCategory());
        existing.setDescription(recipeDto.getDescription());

        if (recipeDto.getActive() != null) {
            existing.setActive(recipeDto.getActive());
        }

        // Replace ingredients: clear and re-add
        existing.getIngredients().clear();
        for (RecipeIngredientDto ingredientDto : recipeDto.getIngredients()) {
            RecipeIngredient ingredient = recipeMapper.toIngredientEntity(ingredientDto);
            existing.addIngredient(ingredient);
        }

        Recipe saved = recipeRepository.save(existing);
        log.info("Updated recipe '{}' (ID: {}) for tenant {}", saved.getProductName(), recipeId, tenantId);

        return recipeMapper.toDto(saved);
    }

    @Override
    public List<RecipeDto> getAllRecipes(UUID tenantId) {
        List<Recipe> recipes = recipeRepository.findByTenantId(tenantId);
        return recipeMapper.toDtoList(recipes);
    }

    @Override
    public List<RecipeDto> getActiveRecipes(UUID tenantId) {
        List<Recipe> recipes = recipeRepository.findByTenantIdAndActiveTrue(tenantId);
        return recipeMapper.toDtoList(recipes);
    }

    @Override
    public RecipeDto getRecipeById(UUID tenantId, UUID recipeId) {
        Recipe recipe = findRecipeOrThrow(tenantId, recipeId);
        return recipeMapper.toDto(recipe);
    }

    @Override
    public RecipeDto getRecipeByProductName(UUID tenantId, String productName) {
        String normalizedName = productName.trim().toUpperCase();
        Recipe recipe = recipeRepository.findByTenantIdAndProductName(tenantId, normalizedName)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No recipe found for product '" + productName + "' in tenant " + tenantId));
        return recipeMapper.toDto(recipe);
    }

    @Override
    @Transactional
    public void deleteRecipe(UUID tenantId, UUID recipeId) {
        Recipe recipe = findRecipeOrThrow(tenantId, recipeId);
        recipeRepository.delete(recipe);
        log.info("Deleted recipe '{}' (ID: {}) for tenant {}", recipe.getProductName(), recipeId, tenantId);
    }

    // ── Recipe Resolution (Order-Service Integration) ──────────────────

    @Override
    public List<ResolvedIngredientDto> resolveRecipe(UUID tenantId, String productName, int quantity) {
        if (productName == null || productName.isBlank()) {
            log.warn("Attempted to resolve recipe for null/blank product name");
            return List.of();
        }

        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1, got: " + quantity);
        }

        String normalizedName = productName.trim().toUpperCase();
        Recipe recipe = recipeRepository.findByTenantIdAndProductName(tenantId, normalizedName)
                .orElse(null);

        if (recipe == null) {
            log.warn("No recipe found for product '{}' in tenant {}. Raw material deduction will be skipped.",
                    productName, tenantId);
            return List.of();
        }

        if (!Boolean.TRUE.equals(recipe.getActive())) {
            log.warn("Recipe for product '{}' in tenant {} is inactive. Skipping resolution.",
                    productName, tenantId);
            return List.of();
        }

        // Scale each ingredient by the ordered quantity
        List<ResolvedIngredientDto> resolved = recipe.getIngredients().stream()
                .map(ingredient -> ResolvedIngredientDto.builder()
                        .rawMaterialName(ingredient.getRawMaterialName())
                        .quantity(ingredient.getQuantity() * quantity)
                        .unit(ingredient.getUnit().name())
                        .build())
                .collect(Collectors.toList());

        log.info("Resolved recipe for '{}' x{} → {} raw material(s) in tenant {}",
                productName, quantity, resolved.size(), tenantId);
        return resolved;
    }

    @Override
    public boolean hasRecipe(UUID tenantId, String productName) {
        if (productName == null) {
            return false;
        }
        return recipeRepository.existsByTenantIdAndProductName(tenantId, productName.trim().toUpperCase());
    }

    // ── Private Helpers ────────────────────────────────────────────────

    private Recipe findRecipeOrThrow(UUID tenantId, UUID recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recipe not found with ID: " + recipeId));

        // Guard: tenant isolation — prevent cross-tenant access
        if (!recipe.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException(
                    "Recipe not found with ID: " + recipeId + " in tenant " + tenantId);
        }

        return recipe;
    }
}
