package com.tavia.iot_service.service.producer;

import com.tavia.iot_service.dto.RawMaterialConsumptionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsumptionEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "iot-consumption-events";

    public void publishConsumptionEvent(RawMaterialConsumptionEvent event) {
        log.info("Publishing RawMaterialConsumptionEvent for Order ID: {}, Machine ID: {}", 
                 event.getOrderId(), event.getMachineId());
        kafkaTemplate.send(TOPIC, event);
    }
}
