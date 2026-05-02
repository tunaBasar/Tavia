package com.tavia.iot_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
public class MachineTelemetryDto {
    @NotNull
    private UUID machineId;
    @NotNull
    private Instant timestamp;
    private Double batteryLevel;
    private Double cpuTemperature;
    private Double coordinatesX;
    private Double coordinatesY;
    private Double networkSignalStrength;
    private String currentErrorCode;
    private Map<String, Object> sensorPayload;
}
