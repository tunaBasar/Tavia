package com.tavia.trafficsimulator.dto;

import java.time.Instant;

public record SimulatorEvent(
        String type,
        String city,
        String tenantName,
        String detail,
        Instant timestamp
) {
    public SimulatorEvent(String type, String detail) {
        this(type, null, null, detail, Instant.now());
    }

    public SimulatorEvent(String type, String city, String tenantName, String detail) {
        this(type, city, tenantName, detail, Instant.now());
    }
}
