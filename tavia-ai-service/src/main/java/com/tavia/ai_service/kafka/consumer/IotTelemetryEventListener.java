package com.tavia.ai_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tavia.ai_service.kafka.dto.IotTelemetryEventDto;
import com.tavia.ai_service.service.FeatureStoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class IotTelemetryEventListener {

    private final FeatureStoreService featureStoreService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "iot-telemetry-events", groupId = "ai-group")
    public void consumeTelemetry(IotTelemetryEventDto event) {
        log.debug("Consumed telemetry event for machine: {}", event.getMachineId());
        try {
            String json = objectMapper.writeValueAsString(event);
            featureStoreService.updateMachineState(event.getMachineId(), json);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize telemetry event", e);
        }
    }
}
