package com.tavia.order_service.client;

import com.tavia.order_service.dto.RecipeIngredient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST client for calling the Inventory Service's batch deduction endpoint.
 * POST /api/v1/inventory/deduct
 * Header: X-Tenant-ID
 * Body: { "items": [ ... ] }
 *
 * Implements manual circuit breaker: if inventory-service is down,
 * order creation must NOT fail. The deduction is best-effort.
 */
@Slf4j
@Component
public class InventoryClient {

    private final RestClient inventoryClient;

    public InventoryClient(
            RestClient.Builder restClientBuilder,
            @Value("${enrichment.inventory.base-url:http://localhost:8083}") String inventoryBaseUrl) {
        this.inventoryClient = restClientBuilder.baseUrl(inventoryBaseUrl).build();
    }

    /**
     * Send a batch deduction request to inventory-service.
     * This is a fire-and-forget approach — order creation does not rollback on inventory failures.
     *
     * @param tenantId    the tenant for which to deduct raw materials
     * @param ingredients the recipe-resolved list of raw material ingredients
     */
    public void deductRawMaterials(UUID tenantId, List<RecipeIngredient> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            log.info("No ingredients to deduct for tenant {}. Skipping inventory call.", tenantId);
            return;
        }

        try {
            // Build deduction items matching the inventory service's expected format
            List<Map<String, Object>> deductionItems = ingredients.stream()
                    .map(ing -> Map.<String, Object>of(
                            "rawMaterialName", ing.getRawMaterialName(),
                            "quantity", ing.getQuantity(),
                            "unit", ing.getUnit()
                    ))
                    .toList();

            Map<String, Object> requestBody = Map.of("items", deductionItems);

            inventoryClient.post()
                    .uri("/api/v1/inventory/deduct")
                    .header("X-Tenant-ID", tenantId.toString())
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Successfully sent batch deduction to inventory-service for tenant {} ({} items)",
                    tenantId, ingredients.size());
        } catch (Exception e) {
            log.error("Circuit breaker: Inventory deduction failed for tenant {}: {}. " +
                    "Order will proceed — deduction is best-effort.", tenantId, e.getMessage());
        }
    }
}
