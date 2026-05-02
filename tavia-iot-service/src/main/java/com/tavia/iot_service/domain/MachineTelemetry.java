package com.tavia.iot_service.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "machine_telemetry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineTelemetry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID machineId;

    @Column(nullable = false)
    private Instant timestamp;

    private Double batteryLevel;
    private Double cpuTemperature;
    private Double coordinatesX;
    private Double coordinatesY;
    private Double networkSignalStrength;
    
    private String currentErrorCode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> sensorPayload;
}
