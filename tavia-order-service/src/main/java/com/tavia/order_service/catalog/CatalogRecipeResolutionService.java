package com.tavia.order_service.catalog;

import com.tavia.order_service.dto.RecipeIngredient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Production implementation of RecipeResolutionService.
 * Makes REST calls to tavia-catalog-service's /api/v1/catalog/resolve/{productName} endpoint
 * to obtain the real Bill of Materials (recipe ingredients) from the database.
 *
 * Per GEMINI.md §2.2: The catalog service is the authoritative source of recipe data.
 * This replaces the MockRecipeResolutionService for all production traffic.
 *
 * @Primary ensures this bean takes precedence over MockRecipeResolutionService.
 */
@Slf4j
@Service
@Primary
public class CatalogRecipeResolutionService implements RecipeResolutionService {

    private final RestClient catalogClient;

    public CatalogRecipeResolutionService(
            RestClient.Builder restClientBuilder,
            @Value("${enrichment.catalog.base-url:http://localhost:8088}") String catalogBaseUrl) {
        this.catalogClient = restClientBuilder.baseUrl(catalogBaseUrl).build();
    }

    @Override
    public List<RecipeIngredient> resolveRecipe(UUID tenantId, String productName, int quantity) {
        if (productName == null || productName.isBlank()) {
            log.warn("Attempted to resolve recipe for null/blank product name");
            return Collections.emptyList();
        }

        if (quantity < 1) {
            log.warn("Invalid quantity {} for product '{}'. Using 1.", quantity, productName);
            quantity = 1;
        }

        try {
            // Call: GET /api/v1/catalog/resolve/{productName}?quantity={quantity}
            // Header: X-Tenant-ID
            // Response: ApiResponse<List<ResolvedIngredientDto>> with fields: rawMaterialName, quantity, unit
            Map<String, Object> response = catalogClient.get()
                    .uri("/api/v1/catalog/resolve/{productName}?quantity={quantity}", productName, quantity)
                    .header("X-Tenant-ID", tenantId.toString())
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null || !response.containsKey("data")) {
                log.warn("Empty/invalid response from catalog-service for product '{}' in tenant {}",
                        productName, tenantId);
                return Collections.emptyList();
            }

            Object data = response.get("data");
            if (!(data instanceof List<?> dataList)) {
                log.warn("Unexpected 'data' type from catalog-service for product '{}': {}",
                        productName, data.getClass().getSimpleName());
                return Collections.emptyList();
            }

            List<RecipeIngredient> ingredients = dataList.stream()
                    .filter(item -> item instanceof Map)
                    .map(item -> {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> map = (Map<String, Object>) item;
                        return RecipeIngredient.builder()
                                .rawMaterialName((String) map.get("rawMaterialName"))
                                .quantity(((Number) map.get("quantity")).doubleValue())
                                .unit((String) map.get("unit"))
                                .build();
                    })
                    .toList();

            log.info("Catalog resolved recipe for '{}' x{} → {} raw material(s) in tenant {}",
                    productName, quantity, ingredients.size(), tenantId);
            return ingredients;

        } catch (Exception e) {
            log.error("Failed to resolve recipe via catalog-service for product '{}' in tenant {}: {}. " +
                    "Inventory deduction will be skipped for this order.", productName, tenantId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public boolean hasRecipe(UUID tenantId, String productName) {
        if (productName == null) {
            return false;
        }

        try {
            Map<String, Object> response = catalogClient.get()
                    .uri("/api/v1/catalog/resolve/{productName}/exists", productName)
                    .header("X-Tenant-ID", tenantId.toString())
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response != null && response.containsKey("data")) {
                return Boolean.TRUE.equals(response.get("data"));
            }
            return false;
        } catch (Exception e) {
            log.warn("Failed to check recipe existence via catalog-service for '{}': {}",
                    productName, e.getMessage());
            return false;
        }
    }
}
