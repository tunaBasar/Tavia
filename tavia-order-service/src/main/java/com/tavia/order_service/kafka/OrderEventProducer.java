package com.tavia.order_service.kafka;

import com.tavia.order_service.client.EnrichmentClient;
import com.tavia.order_service.dto.ContextDataDto;
import com.tavia.order_service.dto.CrmCustomerDto;
import com.tavia.order_service.dto.OrderDto;
import com.tavia.order_service.dto.RecipeIngredient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final EnrichmentClient enrichmentClient;

    /**
     * Sends an enriched order event to Kafka, including recipe-resolved deduction data.
     * The inventory-service consumer will use the deductions list to deduct raw materials.
     *
     * @param orderDto    the saved order DTO
     * @param ingredients the recipe-resolved raw material ingredients (may be empty)
     */
    public void sendOrderEvent(OrderDto orderDto, List<RecipeIngredient> ingredients) {
        // 1. CRM enrichment
        CrmCustomerDto crmData = enrichmentClient.getCustomer(orderDto.getCustomerId(), orderDto.getTenantId());

        // 2. Context enrichment
        ContextDataDto contextData = enrichmentClient.getContext();

        // 3. Build deductions from recipe ingredients
        List<OrderEvent.RawMaterialDeduction> deductions = (ingredients != null)
                ? ingredients.stream()
                    .map(ing -> OrderEvent.RawMaterialDeduction.builder()
                            .rawMaterialName(ing.getRawMaterialName())
                            .quantity(ing.getQuantity())
                            .unit(ing.getUnit())
                            .build())
                    .collect(Collectors.toList())
                : Collections.emptyList();

        // 4. Build enriched event
        OrderEvent event = OrderEvent.builder()
                .orderId(orderDto.getId())
                .tenantId(orderDto.getTenantId())
                .productName(orderDto.getProductName())
                .quantity(orderDto.getQuantity() != null ? orderDto.getQuantity().doubleValue() : 1.0)
                .price(orderDto.getPrice())
                // CRM enrichment
                .customerLevel(crmData.getLoyaltyLevel())
                .totalSpent(crmData.getTotalSpentInThisTenant())
                // Context enrichment
                .weather(contextData.getWeather())
                .activeEvent(contextData.getActiveEvent())
                .competitorIntensity(contextData.getCompetitorIntensity())
                // Recipe deductions for inventory consumer
                .deductions(deductions)
                .build();

        log.info("Sending ENRICHED order event to Kafka topic 'order-events' for order id: {} | " +
                 "customerLevel={}, weather={}, activeEvent={}, competitorIntensity={}, deductions={}",
                event.getOrderId(), event.getCustomerLevel(), event.getWeather(),
                event.getActiveEvent(), event.getCompetitorIntensity(), deductions.size());

        kafkaTemplate.send("order-events", event);
    }
}
