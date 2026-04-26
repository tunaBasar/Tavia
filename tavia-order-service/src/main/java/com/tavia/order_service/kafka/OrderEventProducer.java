package com.tavia.order_service.kafka;

import com.tavia.order_service.client.EnrichmentClient;
import com.tavia.order_service.dto.ContextDataDto;
import com.tavia.order_service.dto.CrmCustomerDto;
import com.tavia.order_service.dto.OrderDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final EnrichmentClient enrichmentClient;

    public void sendOrderEvent(OrderDto orderDto) {
        // 1. CRM enrichment
        CrmCustomerDto crmData = enrichmentClient.getCustomer(orderDto.getCustomerId());

        // 2. Context enrichment
        ContextDataDto contextData = enrichmentClient.getContext();

        // 3. Build enriched event
        OrderEvent event = OrderEvent.builder()
                .orderId(orderDto.getId())
                .tenantId(orderDto.getTenantId())
                .productName(orderDto.getProductName())
                .quantity(orderDto.getQuantity() != null ? orderDto.getQuantity().doubleValue() : 1.0)
                .price(orderDto.getPrice())
                // CRM enrichment
                .customerLevel(crmData.getLoyaltyLevel())
                .totalSpent(crmData.getTotalSpent())
                // Context enrichment
                .weather(contextData.getWeather())
                .activeEvent(contextData.getActiveEvent())
                .competitorIntensity(contextData.getCompetitorIntensity())
                .build();

        log.info("Sending ENRICHED order event to Kafka topic 'order-events' for order id: {} | " +
                 "customerLevel={}, weather={}, activeEvent={}, competitorIntensity={}",
                event.getOrderId(), event.getCustomerLevel(), event.getWeather(),
                event.getActiveEvent(), event.getCompetitorIntensity());

        kafkaTemplate.send("order-events", event);
    }
}
