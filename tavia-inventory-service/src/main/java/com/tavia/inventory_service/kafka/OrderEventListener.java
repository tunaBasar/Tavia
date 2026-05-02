package com.tavia.inventory_service.kafka;

import com.tavia.inventory_service.dto.DeductionItem;
import com.tavia.inventory_service.enums.UnitType;
import com.tavia.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Kafka consumer that listens for order events and triggers batch
 * raw material deductions based on recipe-resolved deduction data.
 * Per GEMINI.md §3.6: Consumer must be idempotent — deductions are logged for traceability.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final InventoryService inventoryService;

    @KafkaListener(topics = "order-events", groupId = "inventory-group")
    public void consumeOrderEvent(@org.springframework.messaging.handler.annotation.Payload OrderEvent orderEvent) {
        log.info("Received OrderEvent for order {} — product: {}", orderEvent.getOrderId(), orderEvent.getProductName());

        // Guard: no deductions to process
        if (orderEvent.getDeductions() == null || orderEvent.getDeductions().isEmpty()) {
            log.warn("OrderEvent for order {} has no deduction data. Skipping inventory deduction.",
                    orderEvent.getOrderId());
            return;
        }

        try {
            List<DeductionItem> items = orderEvent.getDeductions().stream()
                    .map(d -> DeductionItem.builder()
                            .rawMaterialName(d.getRawMaterialName())
                            .quantity(d.getQuantity())
                            .unit(parseUnit(d.getUnit()))
                            .build())
                    .collect(Collectors.toList());

            inventoryService.deductBatch(orderEvent.getTenantId(), items);
            log.info("Successfully processed batch deduction for order {} ({} items)",
                    orderEvent.getOrderId(), items.size());
        } catch (Exception e) {
            log.error("Failed to process OrderEvent for order {}: {}", orderEvent.getOrderId(), e.getMessage(), e);
        }
    }

    private UnitType parseUnit(String unit) {
        if (unit == null) {
            return UnitType.GRAM;
        }
        try {
            return UnitType.valueOf(unit.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown unit type '{}', defaulting to GRAM", unit);
            return UnitType.GRAM;
        }
    }
}
