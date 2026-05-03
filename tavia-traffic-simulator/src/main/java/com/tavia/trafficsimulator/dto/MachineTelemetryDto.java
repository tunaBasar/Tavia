package com.tavia.trafficsimulator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MachineTelemetryDto {
    private UUID machineId;
    private Instant timestamp;
    private Double batteryLevel;
    private Double cpuTemperature;
    private Double coordinatesX;
    private Double coordinatesY;
    private Double networkSignalStrength;
    private String currentErrorCode;
    private Map<String, Object> sensorPayload;
}
