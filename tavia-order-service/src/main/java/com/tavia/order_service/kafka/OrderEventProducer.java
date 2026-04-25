package com.tavia.order_service.kafka;

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

    public void sendOrderEvent(OrderDto orderDto) {
        OrderEvent event = OrderEvent.builder()
                .orderId(orderDto.getId())
                .tenantId(orderDto.getTenantId())
                .productName(orderDto.getProductName())
                .quantity(orderDto.getQuantity() != null ? orderDto.getQuantity().doubleValue() : 1.0)
                .build();

        log.info("Sending order event to Kafka topic 'order-events' for order id: {}", event.getOrderId());
        kafkaTemplate.send("order-events", event);
    }
}
