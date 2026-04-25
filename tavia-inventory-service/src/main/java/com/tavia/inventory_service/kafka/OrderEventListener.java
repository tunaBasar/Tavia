package com.tavia.inventory_service.kafka;

import com.tavia.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final InventoryService inventoryService;

    @KafkaListener(topics = "order-events", groupId = "inventory-group")
    public void consumeOrderEvent(@org.springframework.messaging.handler.annotation.Payload OrderEvent orderEvent) {
        log.info("Received OrderEvent: {}", orderEvent);
        try {
            inventoryService.decreaseStock(
                orderEvent.getTenantId(), 
                orderEvent.getProductName(), 
                orderEvent.getQuantity()
            );
            log.info("Successfully processed OrderEvent for product: {}", orderEvent.getProductName());
        } catch (Exception e) {
            log.error("Failed to process OrderEvent: {}", e.getMessage(), e);
        }
    }
}
