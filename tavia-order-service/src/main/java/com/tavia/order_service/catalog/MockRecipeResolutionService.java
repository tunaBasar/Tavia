package com.tavia.order_service.catalog;

import com.tavia.order_service.dto.RecipeIngredient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * TEMPORARY mock implementation of RecipeResolutionService.
 * Hardcodes recipes for common cafe products.
 *
 * This will be replaced by a real CatalogRecipeResolutionService
 * once tavia-catalog-service is operational.
 *
 * Recipes define the Bill of Materials (BOM) for ONE unit of a final product.
 */
@Slf4j
@Service
public class MockRecipeResolutionService implements RecipeResolutionService {

    private static final Map<String, List<RecipeIngredient>> RECIPE_REGISTRY = new HashMap<>();

    static {
        // ─── Espresso-based drinks ───────────────────────────────
        RECIPE_REGISTRY.put("LATTE", List.of(
                RecipeIngredient.builder().rawMaterialName("Milk").quantity(200.0).unit("MILLILITER").build(),
                RecipeIngredient.builder().rawMaterialName("Coffee Beans").quantity(18.0).unit("GRAM").build()
        ));

        RECIPE_REGISTRY.put("ESPRESSO", List.of(
                RecipeIngredient.builder().rawMaterialName("Coffee Beans").quantity(18.0).unit("GRAM").build(),
                RecipeIngredient.builder().rawMaterialName("Water").quantity(30.0).unit("MILLILITER").build()
        ));

        RECIPE_REGISTRY.put("AMERICANO", List.of(
                RecipeIngredient.builder().rawMaterialName("Coffee Beans").quantity(18.0).unit("GRAM").build(),
                RecipeIngredient.builder().rawMaterialName("Water").quantity(200.0).unit("MILLILITER").build()
        ));

        RECIPE_REGISTRY.put("CAPPUCCINO", List.of(
                RecipeIngredient.builder().rawMaterialName("Milk").quantity(150.0).unit("MILLILITER").build(),
                RecipeIngredient.builder().rawMaterialName("Coffee Beans").quantity(18.0).unit("GRAM").build()
        ));

        RECIPE_REGISTRY.put("MOCHA", List.of(
                RecipeIngredient.builder().rawMaterialName("Milk").quantity(180.0).unit("MILLILITER").build(),
                RecipeIngredient.builder().rawMaterialName("Coffee Beans").quantity(18.0).unit("GRAM").build(),
                RecipeIngredient.builder().rawMaterialName("Chocolate Syrup").quantity(30.0).unit("MILLILITER").build()
        ));

        // ─── Tea ─────────────────────────────────────────────────
        RECIPE_REGISTRY.put("TEA", List.of(
                RecipeIngredient.builder().rawMaterialName("Tea Leaves").quantity(3.0).unit("GRAM").build(),
                RecipeIngredient.builder().rawMaterialName("Water").quantity(250.0).unit("MILLILITER").build()
        ));

        // ─── Food items ──────────────────────────────────────────
        RECIPE_REGISTRY.put("COOKIE", List.of(
                RecipeIngredient.builder().rawMaterialName("Cookie").quantity(1.0).unit("PIECE").build()
        ));

        RECIPE_REGISTRY.put("SANDWICH", List.of(
                RecipeIngredient.builder().rawMaterialName("Bread").quantity(2.0).unit("PIECE").build(),
                RecipeIngredient.builder().rawMaterialName("Cheese").quantity(30.0).unit("GRAM").build()
        ));
    }

    @Override
    public List<RecipeIngredient> resolveRecipe(UUID tenantId, String productName, int quantity) {
        if (productName == null || productName.isBlank()) {
            log.warn("Attempted to resolve recipe for null/blank product name");
            return Collections.emptyList();
        }

        String normalizedName = productName.trim().toUpperCase();
        List<RecipeIngredient> baseRecipe = RECIPE_REGISTRY.get(normalizedName);

        if (baseRecipe == null) {
            log.warn("No recipe found for product '{}'. Raw material deduction will be skipped.", productName);
            return Collections.emptyList();
        }

        // Scale each ingredient by the ordered quantity
        List<RecipeIngredient> scaledRecipe = baseRecipe.stream()
                .map(ingredient -> RecipeIngredient.builder()
                        .rawMaterialName(ingredient.getRawMaterialName())
                        .quantity(ingredient.getQuantity() * quantity)
                        .unit(ingredient.getUnit())
                        .build())
                .collect(Collectors.toList());

        log.info("Resolved recipe for '{}' x{} → {} raw material(s)", productName, quantity, scaledRecipe.size());
        return scaledRecipe;
    }

    @Override
    public boolean hasRecipe(UUID tenantId, String productName) {
        if (productName == null) {
            return false;
        }
        return RECIPE_REGISTRY.containsKey(productName.trim().toUpperCase());
    }
}
