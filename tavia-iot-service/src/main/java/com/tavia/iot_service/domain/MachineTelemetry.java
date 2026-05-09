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

    @Column(name = "machine_id", nullable = false)
    private UUID machineId;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "battery_level")
    private Double batteryLevel;
    @Column(name = "cpu_temperature")
    private Double cpuTemperature;
    @Column(name = "coordinates_x")
    private Double coordinatesX;
    @Column(name = "coordinates_y")
    private Double coordinatesY;
    @Column(name = "network_signal_strength")
    private Double networkSignalStrength;
    
    @Column(name = "current_error_code")
    private String currentErrorCode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sensor_payload", columnDefinition = "jsonb")
    private Map<String, Object> sensorPayload;
}
