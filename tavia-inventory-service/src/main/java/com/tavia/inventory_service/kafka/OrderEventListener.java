package com.tavia.inventory_service.kafka;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka consumer that listens for order events for audit/reconciliation purposes.
 *
 * IMPORTANT: Real-time inventory deduction is performed synchronously via REST
 * in order-service → inventory-service during order creation. This Kafka consumer
 * does NOT deduct again — it only logs the event for traceability, enabling
 * future reconciliation or analytics without risking double-deduction.
 *
 * Per GEMINI.md §3.6: Consumer must be idempotent.
 */
@Slf4j
@Component
public class OrderEventListener {

    @KafkaListener(topics = "order-events", groupId = "inventory-group")
    public void consumeOrderEvent(@org.springframework.messaging.handler.annotation.Payload OrderEvent orderEvent) {
        log.info("[AUDIT] OrderEvent received — order: {}, tenant: {}, product: {}",
                orderEvent.getOrderId(), orderEvent.getTenantId(), orderEvent.getProductName());

        // Guard: no deductions to audit
        if (orderEvent.getDeductions() == null || orderEvent.getDeductions().isEmpty()) {
            log.warn("[AUDIT] OrderEvent for order {} has no deduction data.",
                    orderEvent.getOrderId());
            return;
        }

        // Log each deduction for audit trail (deductions were already applied via REST)
        for (OrderEvent.RawMaterialDeduction d : orderEvent.getDeductions()) {
            log.info("[AUDIT] Order {} — deducted {} {} of '{}'",
                    orderEvent.getOrderId(), d.getQuantity(), d.getUnit(), d.getRawMaterialName());
        }

        log.info("[AUDIT] Order {} audit complete — {} deduction(s) recorded",
                orderEvent.getOrderId(), orderEvent.getDeductions().size());
    }
}
