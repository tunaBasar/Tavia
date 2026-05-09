package com.tavia.iot_service.kafka.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IotTelemetryEventDto {
    private UUID tenantId;
    private UUID machineId;
    private int usageCount;
    private String status;
    private Instant timestamp;
}
