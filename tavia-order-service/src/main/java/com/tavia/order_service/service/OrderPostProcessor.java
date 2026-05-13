package com.tavia.order_service.service;

import com.tavia.order_service.catalog.RecipeResolutionService;
import com.tavia.order_service.client.EnrichmentClient;
import com.tavia.order_service.client.InventoryClient;
import com.tavia.order_service.dto.CrmCustomerDto;
import com.tavia.order_service.dto.OrderDto;
import com.tavia.order_service.dto.RecipeIngredient;
import com.tavia.order_service.entity.Order;
import com.tavia.order_service.kafka.OrderEventProducer;
import com.tavia.order_service.mapper.OrderMapper;
import com.tavia.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Handles all non-critical downstream processing AFTER an order is persisted.
 * Runs asynchronously so the API response returns immediately to the client.
 *
 * Responsibilities:
 *  - Snapshot customer enrichment (name + loyaltyLevel) onto the order row
 *  - Resolve recipe → deduct raw materials from inventory
 *  - Adjust tenant loyalty via CRM
 *  - Publish enriched Kafka event
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderPostProcessor {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final RecipeResolutionService recipeResolutionService;
    private final InventoryClient inventoryClient;
    private final EnrichmentClient enrichmentClient;
    private final OrderEventProducer orderEventProducer;

    @Async
    public void process(UUID orderId, UUID tenantId, UUID customerId,
                        String productName, int quantity, java.math.BigDecimal price) {
        log.info("Async post-processing started for order {}", orderId);

        // 1. Snapshot CRM enrichment onto the order row
        CrmCustomerDto crmData = enrichmentClient.getCustomer(customerId, tenantId);
        try {
            orderRepository.findById(orderId).ifPresent(order -> {
                order.setCustomerName(crmData.getName());
                order.setLoyaltyLevel(crmData.getLoyaltyLevel());
                orderRepository.save(order);
                log.info("Order {} enriched: customerName={}, loyaltyLevel={}",
                        orderId, crmData.getName(), crmData.getLoyaltyLevel());
            });
        } catch (Exception e) {
            log.error("Failed to enrich order {} with CRM data: {}", orderId, e.getMessage());
        }

        // 2. Resolve recipe and deduct raw materials
        List<RecipeIngredient> ingredients = recipeResolutionService.resolveRecipe(
                tenantId, productName, quantity);

        if (ingredients.isEmpty()) {
            log.warn("No recipe found for '{}'. Skipping inventory deduction.", productName);
        } else {
            log.info("Recipe resolved for '{}': {} raw material(s)", productName, ingredients.size());
            inventoryClient.deductRawMaterials(tenantId, ingredients);
        }

        // 3. Adjust tenant loyalty via CRM
        enrichmentClient.adjustTenantLoyalty(customerId, tenantId, price);

        // 4. Build DTO and publish enriched Kafka event
        Order savedOrder = orderRepository.findById(orderId).orElse(null);
        if (savedOrder != null) {
            OrderDto orderDto = orderMapper.toDto(savedOrder);
            orderEventProducer.sendOrderEvent(orderDto, ingredients);
            log.info("Order {} async processing complete — Kafka event published with {} deductions",
                    orderId, ingredients.size());
        }
    }
}
