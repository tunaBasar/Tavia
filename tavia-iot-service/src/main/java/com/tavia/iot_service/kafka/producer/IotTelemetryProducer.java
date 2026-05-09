package com.tavia.iot_service.kafka.producer;

import com.tavia.iot_service.kafka.dto.IotTelemetryEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class IotTelemetryProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "iot-telemetry-events";

    public void emitTelemetry(IotTelemetryEventDto telemetry) {
        log.debug("Emitting telemetry for machine: {}", telemetry.getMachineId());
        kafkaTemplate.send(TOPIC, telemetry.getMachineId().toString(), telemetry);
    }
}
